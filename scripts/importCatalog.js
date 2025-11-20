import { readFile } from 'fs/promises';
import { parse } from 'csv-parse/sync';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Load Dutchie links mapping
let dutchieLinksMap = {};
try {
  const dutchieLinksPath = join(__dirname, '..', 'dutchie-links.json');
  const dutchieLinksData = await readFile(dutchieLinksPath, 'utf-8');
  const dutchieLinks = JSON.parse(dutchieLinksData);
  
  // Create a map for faster lookup - normalize product names for matching
  dutchieLinks.forEach(link => {
    const normalizedName = link.name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    dutchieLinksMap[normalizedName] = link.slug;
    
    // Also try matching by slug parts (brand + strain)
    const slugParts = link.slug.split('-');
    const slugKey = slugParts.slice(0, 3).join(' ');
    dutchieLinksMap[slugKey] = link.slug;
  });
  
  console.log(`📎 Loaded ${dutchieLinks.length} Dutchie product links for matching\n`);
} catch (error) {
  console.log('⚠️  No dutchie-links.json found. Run extractDutchieLinks.js first to enable shop links.\n');
}

/**
 * Get category from CSV (no mapping, use raw value)
 */
function getCategory(category) {
  // Just return the raw category, trimmed
  return (category || 'Other').trim();
}

/**
 * Parse THC percentage from CSV
 */
function parseTHC(thc, thca, thcD9) {
  const parsePercent = (str) => {
    if (!str) return null;
    const match = str.toString().match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
  };

  return parsePercent(thc) || parsePercent(thca) || parsePercent(thcD9) || null;
}

/**
 * Parse CBD percentage from CSV
 */
function parseCBD(cbd, cbda) {
  const parsePercent = (str) => {
    if (!str) return null;
    const match = str.toString().match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
  };

  return parsePercent(cbd) || parsePercent(cbda) || null;
}

/**
 * Parse THC mg from CSV
 */
function parseTHCMg(thcMg) {
  if (!thcMg) return null;
  const match = thcMg.toString().match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

/**
 * Find Dutchie slug for a product
 */
function findDutchieSlug(productName, brand, strain) {
  // Try exact match first (normalized)
  const normalizedName = productName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (dutchieLinksMap[normalizedName]) {
    return dutchieLinksMap[normalizedName];
  }
  
  // Try brand + strain combination
  if (brand && strain) {
    const brandStrainKey = `${brand} ${strain}`.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (dutchieLinksMap[brandStrainKey]) {
      return dutchieLinksMap[brandStrainKey];
    }
  }
  
  // Try just strain name
  if (strain) {
    const strainKey = strain.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    for (const [key, slug] of Object.entries(dutchieLinksMap)) {
      if (key.includes(strainKey)) {
        return slug;
      }
    }
  }
  
  return null;
}

/**
 * Normalize a single product row from CSV
 */
function normalizeProduct(row, tenantId) {
  const isCannabis = (row['Is cannabis'] || '').toLowerCase() === 'yes';
  const isAvailableOnline = (row['Is available online'] || '').toLowerCase() === 'yes';
  const inStock = parseInt(row['Available']) || 0;
  const price = parseFloat(row['Current price']) || 0;

  // Skip if no stock or not available online
  if (inStock <= 0 || !isAvailableOnline) {
    return null;
  }

  const category = getCategory(row['Category']);
  const name = row['Online title'] || row['Product'] || 'Unnamed Product';
  const brand = row['Brand'] || row['Vendor'] || 'Unknown Brand';
  const strain = row['Strain'] || '';
  
  // Find Dutchie slug for this product
  const dutchieSlug = findDutchieSlug(name, brand, strain);
  const sku = row['SKU'] || row['Package ID'];

  // Generate Dutchie shop URL if we found a matching slug
  const dutchieUrl = dutchieSlug 
    ? `https://cannabishealing.com/shop?dtche[poscid]=${dutchieSlug}`
    : null;

  return {
    tenantId,  // SaaS-ready: identifies which store this product belongs to
    id: sku,
    name: name.trim(),
    brand: brand.trim(),
    category,
    isCannabis,
    isAvailableOnline,
    inStock,
    price,
    strain: row['Strain'] || null,
    thcPercent: parseTHC(row['THC'], row['THCA'], row['THC-D9']),
    cbdPercent: parseCBD(row['CBD'], row['CBDA']),
    thcMg: parseTHCMg(row['Calculated THC (mg)']),
    imageUrl: row['Image URL'] || null,
    dutchieSlug: dutchieSlug || null,  // Store the slug for reference
    dutchieUrl: dutchieUrl,  // Full shop URL for easy linking
    tags: [],
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

/**
 * Import CSV to Firestore
 */
async function importCatalog(tenantId, csvPath) {
  console.log(`📄 Reading CSV from: ${csvPath}`);
  console.log(`🏪 Tenant ID: ${tenantId}`);
  
  const fileContent = await readFile(csvPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`📊 Found ${records.length} rows in CSV`);

  const productsToImport = [];
  let skipped = 0;

  for (const row of records) {
    const product = normalizeProduct(row, tenantId);
    if (product) {
      productsToImport.push(product);
    } else {
      skipped++;
    }
  }

  console.log(`✅ ${productsToImport.length} products to import`);
  console.log(`⏭️  ${skipped} products skipped (out of stock or not available online)`);

  // Batch write to Firestore
  const batch = db.batch();
  const productsRef = db.collection('products');

  for (const product of productsToImport) {
    const docRef = productsRef.doc(product.id);
    batch.set(docRef, product, { merge: true });
  }

  console.log('💾 Writing to Firestore...');
  await batch.commit();

  console.log('✅ Import complete!');
  console.log('\nBreakdown by category:');
  
  const categoryCounts = {};
  for (const product of productsToImport) {
    categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
  }
  
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });

  process.exit(0);
}

// Run import
const tenantId = process.argv[2];
const csvPath = process.argv[3];

if (!tenantId || !csvPath) {
  console.error('❌ Please provide tenant ID and CSV file path:');
  console.error('   node importCatalog.js <tenantId> <csvPath>');
  console.error('');
  console.error('Example:');
  console.error('   node importCatalog.js ch 2025-11-18-Inventory.csv');
  console.error('');
  console.error('The tenantId identifies which store this catalog belongs to.');
  console.error('Use "ch" for Cannabis Healing, or create a unique ID for other stores.');
  process.exit(1);
}

importCatalog(tenantId, csvPath).catch((error) => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});

