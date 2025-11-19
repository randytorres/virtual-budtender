import admin from 'firebase-admin';
import dotenv from 'dotenv';

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

async function debugProducts() {
  console.log('🔍 Fetching products from Firestore...\n');
  
  const snapshot = await db.collection('products')
    .where('tenantId', '==', 'ch')
    .limit(20)
    .get();
  
  console.log(`📊 Total products with tenantId='ch': ${snapshot.size}\n`);
  
  // Group by category
  const categories = {};
  const cannabisStats = { yes: 0, no: 0 };
  const stockStats = { inStock: 0, outOfStock: 0 };
  const onlineStats = { online: 0, offline: 0 };
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    
    // Count categories
    const cat = data.category || 'unknown';
    categories[cat] = (categories[cat] || 0) + 1;
    
    // Count cannabis
    if (data.isCannabis) cannabisStats.yes++;
    else cannabisStats.no++;
    
    // Count stock
    if (data.inStock > 0) stockStats.inStock++;
    else stockStats.outOfStock++;
    
    // Count online availability
    if (data.isAvailableOnline) onlineStats.online++;
    else onlineStats.offline++;
  });
  
  console.log('📦 Categories in database:');
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });
  
  console.log('\n🌿 Cannabis products:', cannabisStats.yes, '(non-cannabis:', cannabisStats.no + ')');
  console.log('📊 In stock:', stockStats.inStock, '(out of stock:', stockStats.outOfStock + ')');
  console.log('🌐 Available online:', onlineStats.online, '(offline:', onlineStats.offline + ')');
  
  console.log('\n📝 Sample products:');
  snapshot.docs.slice(0, 5).forEach(doc => {
    const data = doc.data();
    console.log(`\n   ${data.name}`);
    console.log(`   - Category: ${data.category}`);
    console.log(`   - Cannabis: ${data.isCannabis}`);
    console.log(`   - Stock: ${data.inStock}`);
    console.log(`   - Online: ${data.isAvailableOnline}`);
    console.log(`   - Price: $${data.price}`);
  });
  
  process.exit(0);
}

debugProducts().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

