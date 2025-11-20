import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract Dutchie product IDs from links.md
 * Format: https://dutchie.com/embedded-menu/cannabis-healing/product/PRODUCT_SLUG
 * 
 * This creates a mapping of product names to Dutchie slugs
 */

function extractDutchieLinks() {
  console.log('📖 Reading links.md...');
  
  const linksPath = path.join(__dirname, '..', 'links.md');
  const content = fs.readFileSync(linksPath, 'utf-8');
  
  // Regex to find product URLs
  const urlPattern = /https:\/\/dutchie\.com\/embedded-menu\/cannabis-healing\/product\/([a-zA-Z0-9\-]+)/g;
  
  // Extract all product slugs
  const matches = [...content.matchAll(urlPattern)];
  const productSlugs = new Set(matches.map(m => m[1]));
  
  console.log(`\n✅ Found ${productSlugs.size} unique Dutchie products\n`);
  
  // Parse product information from the markdown
  // Products are formatted as:
  // Product Name\
  // Brand\
  // Type\
  // THC: XX%](URL)
  
  const products = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for product URLs
    const match = line.match(/https:\/\/dutchie\.com\/embedded-menu\/cannabis-healing\/product\/([a-zA-Z0-9\-]+)/);
    
    if (match) {
      const slug = match[1];
      
      // Go back to find product name (usually 5-7 lines before URL)
      let productName = '';
      let brand = '';
      let type = '';
      let thc = '';
      let price = '';
      
      // Search backwards for product info
      for (let j = i - 1; j >= Math.max(0, i - 15); j--) {
        const prevLine = lines[j].trim();
        
        // Product name is usually the longest line with product-like text
        if (!productName && prevLine.length > 10 && !prevLine.includes('THC') && !prevLine.includes('CBD') && !prevLine.includes('TAC') && !prevLine.includes('[![')) {
          // Check if it looks like a product name (has dashes or spaces)
          if (prevLine.includes('-') || prevLine.match(/[A-Z][a-z]+\s+[A-Z]/)) {
            productName = prevLine.replace(/\\\\/g, '').trim();
          }
        }
        
        // THC percentage
        if (prevLine.match(/THC:\s*[\d.]+%/)) {
          thc = prevLine.match(/THC:\s*([\d.]+%)/)[1];
        }
        
        // Type (Indica, Sativa, Hybrid)
        if (prevLine.match(/^(Indica|Sativa|Hybrid|Indica-Hybrid|Sativa-Hybrid)/)) {
          type = prevLine;
        }
      }
      
      // Search forward for price
      for (let j = i + 1; j <= Math.min(lines.length - 1, i + 5); j++) {
        const nextLine = lines[j];
        const priceMatch = nextLine.match(/\$\$([0-9.]+)/);
        if (priceMatch) {
          price = priceMatch[1];
          break;
        }
      }
      
      if (productName) {
        const dutchieMenuUrl = process.env.DUTCHIE_MENU_URL || 'https://graceful-rugelach-7224de.netlify.app/shop';
        products.push({
          name: productName,
          slug,
          brand,
          type,
          thc,
          price,
          url: `${dutchieMenuUrl}?dtche[poscid]=${slug}`
        });
      }
    }
  }
  
  console.log(`📦 Extracted ${products.length} products with details:\n`);
  
  // Show first 5 as examples
  products.slice(0, 5).forEach(p => {
    console.log(`  ${p.name}`);
    console.log(`    Slug: ${p.slug}`);
    console.log(`    THC: ${p.thc || 'N/A'}, Type: ${p.type || 'N/A'}, Price: $${p.price || 'N/A'}`);
    console.log(`    URL: ${p.url}\n`);
  });
  
  // Save to JSON for reference
  const outputPath = path.join(__dirname, '..', 'dutchie-links.json');
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
  console.log(`✅ Saved to dutchie-links.json\n`);
  
  // Create a CSV mapping file for easy reference
  const csvLines = ['Product Name,Dutchie Slug,Type,THC,Price,Shop URL'];
  products.forEach(p => {
    csvLines.push(`"${p.name}","${p.slug}","${p.type || ''}","${p.thc || ''}","${p.price || ''}","${p.url}"`);
  });
  
  const csvPath = path.join(__dirname, '..', 'dutchie-links.csv');
  fs.writeFileSync(csvPath, csvLines.join('\n'));
  console.log(`✅ Saved to dutchie-links.csv\n`);
  
  return products;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  extractDutchieLinks();
}

export { extractDutchieLinks };

