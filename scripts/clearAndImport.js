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

/**
 * Delete all products for a tenant
 */
async function clearProducts(tenantId) {
  console.log(`🗑️  Clearing all products for tenant: ${tenantId}...`);
  
  const productsRef = db.collection('products');
  const snapshot = await productsRef.where('tenantId', '==', tenantId).get();
  
  if (snapshot.empty) {
    console.log('   No existing products found.\n');
    return 0;
  }
  
  console.log(`   Found ${snapshot.size} products to delete...`);
  
  // Delete in batches of 500 (Firestore limit)
  const batchSize = 500;
  let deleted = 0;
  
  while (deleted < snapshot.size) {
    const batch = db.batch();
    const docs = snapshot.docs.slice(deleted, deleted + batchSize);
    
    docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    deleted += docs.length;
    console.log(`   Deleted ${deleted}/${snapshot.size}...`);
  }
  
  console.log(`✅ Cleared ${snapshot.size} products.\n`);
  return snapshot.size;
}

/**
 * Get category from CSV (no mapping, use raw value)
 */
function getCategory(category) {
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
  const sku = row['SKU'] || row['Package ID'];

  return {
    tenantId,
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
    tags: [],
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

/**
 * Clear old products and import fresh from CSV
 */
async function clearAndImport(tenantId, csvPath) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  CLEAR AND IMPORT - Fresh Product Catalog');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Step 1: Clear existing products
  const deletedCount = await clearProducts(tenantId);

  // Step 2: Read and parse CSV
  console.log(`📄 Reading CSV from: ${csvPath}`);
  console.log(`🏪 Tenant ID: ${tenantId}\n`);
  
  const fileContent = await readFile(csvPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`📊 Found ${records.length} rows in CSV\n`);

  // Step 3: Normalize products
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

  console.log(`✅ ${productsToImport.length} products ready to import`);
  console.log(`⏭️  ${skipped} products skipped (out of stock or not available online)\n`);

  // Step 4: Batch write to Firestore
  const batchSize = 500;
  let imported = 0;

  while (imported < productsToImport.length) {
    const batch = db.batch();
    const productsSlice = productsToImport.slice(imported, imported + batchSize);
    
    for (const product of productsSlice) {
      const docRef = db.collection('products').doc(product.id);
      batch.set(docRef, product);
    }

    await batch.commit();
    imported += productsSlice.length;
    console.log(`💾 Imported ${imported}/${productsToImport.length}...`);
  }

  // Step 5: Show summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  IMPORT COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  🗑️  Deleted: ${deletedCount} old products`);
  console.log(`  ✅ Imported: ${productsToImport.length} new products`);
  console.log(`  ⏭️  Skipped: ${skipped} (out of stock/offline)\n`);

  console.log('📦 Breakdown by category:');
  const categoryCounts = {};
  for (const product of productsToImport) {
    categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
  }
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });

  process.exit(0);
}

// Run script
const tenantId = process.argv[2];
const csvPath = process.argv[3];

if (!tenantId || !csvPath) {
  console.error('❌ Please provide tenant ID and CSV file path:');
  console.error('   node clearAndImport.js <tenantId> <csvPath>');
  console.error('');
  console.error('Example:');
  console.error('   node scripts/clearAndImport.js ch ./2026-01-06-Inventory.csv');
  process.exit(1);
}

clearAndImport(tenantId, csvPath).catch((error) => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
