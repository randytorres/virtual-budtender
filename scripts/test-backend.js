/**
 * Simple test script to verify backend is working
 * Run with: node scripts/test-backend.js
 */

const API_URL = 'http://localhost:3001';

async function testHealth() {
  console.log('Testing /health endpoint...');
  const response = await fetch(`${API_URL}/health`);
  const data = await response.json();
  console.log('✅ Health check:', data);
}

async function testProducts() {
  console.log('\nTesting /products endpoint...');
  const response = await fetch(`${API_URL}/products`);
  const data = await response.json();
  console.log(`✅ Found ${data.count} products in database`);
  if (data.products.length > 0) {
    console.log('Sample product:', data.products[0]);
  }
}

async function testRecommend() {
  console.log('\nTesting /recommend endpoint...');
  const testAnswers = {
    goal: 'sleep',
    experience: 'casual',
    format: 'pre-roll',
    budget: '25-50'
  };
  
  console.log('Sending answers:', testAnswers);
  
  const response = await fetch(`${API_URL}/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers: testAnswers }),
  });
  
  const data = await response.json();
  console.log('✅ Recommendation response:');
  console.log('Message:', data.message);
  console.log(`Found ${data.recommendations?.length || 0} recommendations`);
  
  if (data.recommendations && data.recommendations.length > 0) {
    console.log('\nFirst recommendation:');
    console.log(data.recommendations[0]);
  }
}

async function runTests() {
  try {
    await testHealth();
    await testProducts();
    await testRecommend();
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Make sure the backend server is running (npm run server)');
  }
}

runTests();

