import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import OpenAI from 'openai';
import { getTenantConfig, tenantExists } from './tenantConfig.js';
import { setupTenantEndpoints } from './tenantEndpoints.js';

dotenv.config();

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Setup tenant-specific endpoints
setupTenantEndpoints(app);

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Get all products (for testing)
 */
app.get('/products', async (req, res) => {
  try {
    const snapshot = await db.collection('products').limit(50).get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ products, count: products.length });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * Main recommendation endpoint
 */
app.post('/recommend', async (req, res) => {
  try {
    const { tenantId, answers } = req.body;
    
    // Validate tenant
    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }
    
    if (!tenantExists(tenantId)) {
      return res.status(404).json({ error: `Unknown tenant: ${tenantId}` });
    }
    
    const tenantConfig = getTenantConfig(tenantId);
    console.log(`🤔 Received recommendation request for ${tenantConfig.name}:`, answers);

    // Build Firestore query with tenant filter (simplified to avoid index requirements)
    const query = db.collection('products')
      .where('tenantId', '==', tenantId);

    const snapshot = await query.get();
    
    // Filter in memory to avoid complex Firestore index
    let allCannabisProducts = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(product => 
        product.isCannabis === true &&
        product.inStock > 0 &&
        product.isAvailableOnline === true
      );

    console.log(`📦 Total cannabis products available: ${allCannabisProducts.length}`);

    // Try exact format match first
    let candidates = allCannabisProducts;
    let isExactMatch = true;
    
    if (answers.format && answers.format !== 'any') {
      const exactMatches = candidates.filter(p => p.category === answers.format);
      
      if (exactMatches.length > 0) {
        candidates = exactMatches;
        console.log(`✅ Found ${candidates.length} products in exact category: ${answers.format}`);
      } else {
        // No exact matches - keep all products and note it
        isExactMatch = false;
        console.log(`⚠️  No exact matches for ${answers.format}, will recommend closest alternatives`);
      }
    }

    console.log(`📦 Filtering from ${candidates.length} candidates`);

    // Apply budget filter
    if (answers.budget && answers.budget !== 'none') {
      candidates = candidates.filter(product => {
        if (answers.budget === '<25') return product.price < 25;
        if (answers.budget === '25-50') return product.price >= 25 && product.price <= 50;
        if (answers.budget === '50+') return product.price > 50;
        return true;
      });
    }

    console.log(`💰 After budget filter: ${candidates.length} candidates`);

    // If still no candidates after budget filter, broaden the budget
    if (candidates.length === 0 && answers.budget !== 'none') {
      console.log(`🔄 No products in budget, removing budget filter...`);
      candidates = allCannabisProducts;
      
      // Reapply format filter if it was exact match
      if (answers.format && answers.format !== 'any' && isExactMatch) {
        candidates = candidates.filter(p => p.category === answers.format);
      }
      
      console.log(`📦 After removing budget: ${candidates.length} candidates`);
    }

    // Apply experience-based THC filtering
    if (answers.experience === 'new' && answers.goal !== 'high') {
      // Deprioritize very high THC for new users (unless they want to get high)
      const lowToMidTHC = candidates.filter(p => !p.thcPercent || p.thcPercent < 28);
      const highTHC = candidates.filter(p => p.thcPercent && p.thcPercent >= 28);
      candidates = [...lowToMidTHC, ...highTHC]; // Put high THC at the end
    }

    // Limit to top 20 candidates for LLM
    candidates = candidates.slice(0, 20);

    if (candidates.length === 0) {
      // Absolute fallback - just show any products
      candidates = allCannabisProducts.slice(0, 20);
      console.log(`🆘 Using fallback: showing ${candidates.length} general recommendations`);
    }

    console.log(`🤖 Sending ${candidates.length} candidates to LLM`);

    // Prepare product list for LLM
    const productList = candidates.map((p, idx) => {
      return `${idx + 1}. id: "${p.id}", name: "${p.name}", brand: "${p.brand}", category: "${p.category}", price: $${p.price}, thcPercent: ${p.thcPercent || 'N/A'}%, strain: "${p.strain || 'N/A'}"`;
    }).join('\n');

    // Build LLM prompt using tenant's system prompt
    const systemPrompt = tenantConfig.systemPrompt;

    // Build context for LLM based on what we found
    let contextNote = '';
    if (!isExactMatch && answers.format !== 'any') {
      contextNote = `\n\nNote: We don't have exact matches for ${answers.format} right now, so I'm showing you the closest alternatives that might work for you.`;
    }
    
    const userPrompt = `The customer told you:
- Goal: ${answers.goal}
- Experience: ${answers.experience}
- Format preference: ${answers.format}
- Budget: ${answers.budget}${contextNote}

Here are the available products:

${productList}

Using ONLY these products, choose 2-4 that best match the customer. Be conversational and friendly. If they wanted a specific format but we don't have it, acknowledge that and explain why your recommendations are still great alternatives. Respond in valid JSON.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',  // Cheaper and faster, supports JSON mode
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    });

    const llmResponse = JSON.parse(completion.choices[0].message.content);
    console.log('✅ LLM response received:', llmResponse);

    // Enrich recommendations with full product data
    const enrichedRecommendations = llmResponse.recommendations.map(rec => {
      const product = candidates.find(p => p.id === rec.id);
      return {
        ...rec,
        product: product ? {
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          thcPercent: product.thcPercent,
          imageUrl: product.imageUrl,
          category: product.category,
          strain: product.strain,
        } : null
      };
    }).filter(rec => rec.product !== null);

    res.json({
      message: llmResponse.message,
      recommendations: enrichedRecommendations
    });

  } catch (error) {
    console.error('❌ Error in /recommend:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      details: error.message 
    });
  }
});

/**
 * Conversational AI endpoint
 */
app.post('/chat', async (req, res) => {
  try {
    const { tenantId, message, conversationHistory = [] } = req.body;
    
    // Validate tenant
    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }
    
    if (!tenantExists(tenantId)) {
      return res.status(404).json({ error: `Unknown tenant: ${tenantId}` });
    }
    
    const tenantConfig = getTenantConfig(tenantId);
    console.log(`💬 Chat message for ${tenantConfig.name}:`, message);

    // Get available products for context
    const snapshot = await db.collection('products')
      .where('tenantId', '==', tenantId)
      .get();

    const allProducts = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(product => 
        product.isCannabis === true &&
        product.inStock > 0 &&
        product.isAvailableOnline === true
      );

    console.log(`📦 Available products: ${allProducts.length}`);

    // Get category breakdown from ALL products first
    const allCategoryCount = {};
    allProducts.forEach(p => {
      allCategoryCount[p.category] = (allCategoryCount[p.category] || 0) + 1;
    });
    console.log(`📊 All categories:`, allCategoryCount);

    // Select products ensuring variety across categories (10 from each major category)
    // Note: Categories are now raw from CSV (e.g., "Cartridge 1000mg", "Pre-Rolls", "Flower", "Edibles")
    const categorizedProducts = {
      flower: allProducts.filter(p => p.category?.toLowerCase().includes('flower')).slice(0, 15),
      preroll: allProducts.filter(p => p.category?.toLowerCase().includes('roll')).slice(0, 10),
      vape: allProducts.filter(p => 
        p.category?.toLowerCase().includes('cartridge') ||
        p.category?.toLowerCase().includes('vape')
      ).slice(0, 10),
      edible: allProducts.filter(p => p.category?.toLowerCase().includes('edible')).slice(0, 10),
      concentrate: allProducts.filter(p => 
        p.category?.toLowerCase().includes('concentrate') ||
        p.category?.toLowerCase().includes('rosin')
      ).slice(0, 5)
    };

    // Combine all selected products
    const selectedProducts = [
      ...categorizedProducts.flower,
      ...categorizedProducts.preroll,
      ...categorizedProducts.vape,
      ...categorizedProducts.edible,
      ...categorizedProducts.concentrate
    ].filter(Boolean);

    console.log(`📦 Selected for AI: ${selectedProducts.length} products`);
    console.log(`   Flower: ${categorizedProducts.flower.length}`);
    console.log(`   Pre-rolls: ${categorizedProducts.preroll.length}`);
    console.log(`   Vapes: ${categorizedProducts.vape.length}`);
    console.log(`   Edibles: ${categorizedProducts.edible.length}`);
    console.log(`   Concentrates: ${categorizedProducts.concentrate.length}`);

    // Log vapes specifically
    if (categorizedProducts.vape.length > 0) {
      console.log(`🔍 Vape products:`);
      categorizedProducts.vape.forEach(v => console.log(`   - ${v.name} ($${v.price}) - ID: ${v.id}`));
    }

    const productListForContext = selectedProducts.map((p, idx) => {
      return `${idx + 1}. id:"${p.id}", name:"${p.name}", brand:"${p.brand}", category:"${p.category}", price:$${p.price}, thc:${p.thcPercent || 'N/A'}%, strain:"${p.strain || 'N/A'}"`;
    }).join('\n');

    // Build system prompt for conversational AI
    const systemPrompt = `You are a friendly and knowledgeable virtual budtender for ${tenantConfig.name}. Your role is to help customers find the perfect cannabis products from the current inventory.

CORE RULES:
1. Be conversational, friendly, and helpful
2. ASK 2-3 questions before recommending (experience level, format, budget, strain preference)
3. Keep responses concise (2-3 sentences max)
4. Review conversation history - don't repeat questions you've already asked

AVAILABLE PRODUCTS:
${productListForContext}

CATEGORY MATCHING (actual categories from inventory):
- "vapes" = category contains "Cartridge" (e.g., "Cartridge 1000mg")
- "flower" = category contains "Flower"
- "pre-rolls" = category contains "Roll" (e.g., "Pre-Rolls", "Pre-Rolls-1g")
- "edibles" = category contains "Edible" (e.g., "Edibles")
- "concentrates" = category contains "Concentrate" or "Rosin" (e.g., "Live Rosin", "Concentrate")

CRITICAL - BE HONEST ABOUT INVENTORY:
1. LOOK AT THE PRODUCT LIST ABOVE - those are the ONLY products available
2. CHECK PRICES: If customer says "under $30", count how many products have price < 30
3. CHECK CATEGORY: Count how many products match the category they want
4. BE TRUTHFUL: If you don't have products matching their criteria, SAY SO
5. DON'T HALLUCINATE: Never claim "I found X products under $30" unless you actually counted them in the list above
6. If NO products match: Ask if they want to adjust budget or try a different category

EXAMPLES:

Customer: "I want vapes under $30"
You check list: Only 2 vapes exist, both are $56 (not under $30)
Response: {
  "message": "I only have 2 vapes available right now, but they're both $56. Would you like to see them, or try a different product type in your budget?",
  "recommendations": [],
  "suggestedReplies": ["Show me the $56 vapes", "Show flower under $30", "Show pre-rolls under $30"]
}

Customer: "show me the $56 vapes"
Response: {
  "message": "Here are our 2 premium live rosin vapes - high quality with 94-95% THC!",
  "recommendations": [
    {"id": "25286917", "reason": "Pineapple Express - 94.1% THC"},
    {"id": "61021955", "reason": "Maui Waui - 95% THC"}
  ],
  "suggestedReplies": ["Show cheaper options", "What about pre-rolls?", "Show me flower"]
}

Customer: "help me sleep"
Response: {
  "message": "I can help with that! What's your experience level with cannabis?",
  "recommendations": [],
  "suggestedReplies": ["New to cannabis", "Casual user", "Regular user"]
}

RESPONSE FORMAT (respond with valid JSON):
{
  "message": "Your message here",
  "recommendations": [{"id": "exact-product-id", "reason": "why this fits"}],
  "suggestedReplies": ["Option 1", "Option 2", "Option 3"]
}

- Include 4-6 products when recommending (UI shows 3 initially with "Show More")
- Copy product IDs EXACTLY from the list above
- Keep message concise and friendly
- Only include suggestedReplies if asking a question or offering alternatives
- Always respond in JSON format`;

    // Prepare conversation for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context (3 exchanges)
      { role: 'user', content: message }
    ];

    // Simple keyword-based content filter (skip AI classification for budget/simple responses)
    const simpleResponses = /^\d+$|^under\s+\d+$|^less\s+than\s+\d+$|^\$?\d+$|^yes$|^no$|^maybe$/i;
    const isSimpleResponse = simpleResponses.test(message.trim());

    // Only classify complex messages
    if (!isSimpleResponse && message.length > 5) {
      const classificationPrompt = `Is this message related to cannabis shopping, products, or budtender questions? Answer only YES or NO.

Message: "${message}"`;

      const classificationResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Answer YES for cannabis-related messages, NO for completely unrelated topics. If uncertain, answer YES.' },
          { role: 'user', content: classificationPrompt }
        ],
      });

      const isOnTopic = classificationResponse.choices[0].message.content.trim().toUpperCase().includes('YES');

      if (!isOnTopic) {
        console.log('⚠️  Off-topic message detected:', message);
        return res.json({
          message: "I'm specifically here to help you find the perfect cannabis products! For other questions, please contact our team directly. Now, what can I help you find today? 🌿",
          recommendations: []
        });
      }
    }

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      response_format: { type: 'json_object' }
    });

    const llmResponse = JSON.parse(completion.choices[0].message.content);
    console.log('✅ Chat response:', llmResponse.message);

    // If there are recommendations, enrich them with product data
    let enrichedRecommendations = [];
    if (llmResponse.recommendations && llmResponse.recommendations.length > 0) {
      console.log(`🎯 Enriching ${llmResponse.recommendations.length} recommendations`);
      console.log(`🔍 Looking for IDs:`, llmResponse.recommendations.map(r => r.id));
      
      enrichedRecommendations = llmResponse.recommendations
        .map(rec => {
          // Search in all products, not just the sorted subset
          let product = allProducts.find(p => p.id === rec.id);
          
          // If exact ID not found, try fuzzy matching by name
          if (!product) {
            console.warn(`⚠️  Product ID "${rec.id}" not found, trying name search...`);
            const searchName = rec.id.toLowerCase().replace(/[^\w\s]/g, '');
            product = allProducts.find(p => 
              p.name.toLowerCase().replace(/[^\w\s]/g, '').includes(searchName) ||
              searchName.includes(p.name.toLowerCase().replace(/[^\w\s]/g, ''))
            );
            
            if (product) {
              console.log(`   ✓ Found via fuzzy match: ${product.name} (ID: ${product.id})`);
            } else {
              console.error(`   ✗ Could not find product matching "${rec.id}"`);
              return null;
            }
          }
          
          // Log the product for debugging
          console.log(`   ✓ ${product.name} ($${product.price}, category: ${product.category})`);
          
          return {
            ...rec,
            product: {
              id: product.id,
              name: product.name,
              brand: product.brand,
              price: product.price,
              thcPercent: product.thcPercent,
              imageUrl: product.imageUrl,
              category: product.category,
              strain: product.strain,
              dutchieUrl: product.dutchieUrl
            }
          };
        })
        .filter(rec => rec !== null);
      
      console.log(`✅ Successfully enriched ${enrichedRecommendations.length} recommendations`);
    }

    res.json({
      message: llmResponse.message,
      recommendations: enrichedRecommendations
    });

  } catch (error) {
    console.error('❌ Error in /chat:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📍 Endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /products`);
  console.log(`   POST /recommend`);
  console.log(`   POST /chat`);
});

