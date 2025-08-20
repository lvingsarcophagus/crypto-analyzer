// Test script to verify all 4 APIs are working with your keys
const axios = require('axios');

async function testAllAPIs() {
  console.log('🧪 Testing All API Keys...\n');

  // Test 1: CoinGecko API
  console.log('1️⃣ Testing CoinGecko API...');
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin', {
      headers: {
        'x-cg-demo-api-key': 'CG-bni69NAc1Ykpye5mqA9qd7JM'
      }
    });
    console.log('✅ CoinGecko: SUCCESS - Bitcoin price:', response.data.market_data?.current_price?.usd || 'N/A');
  } catch (error) {
    console.log('❌ CoinGecko: FAILED -', error.message);
  }

  // Test 2: Mobula API
  console.log('\n2️⃣ Testing Mobula API...');
  try {
    const response = await axios.get('https://api.mobula.io/api/1/market/data?asset=bitcoin', {
      headers: {
        'Authorization': 'db19be9d-94ec-421b-8d64-ba93809ee8f9'
      }
    });
    console.log('✅ Mobula: SUCCESS - Data retrieved');
  } catch (error) {
    console.log('❌ Mobula: FAILED -', error.message);
  }

  // Test 3: Tokenview API
  console.log('\n3️⃣ Testing Tokenview API...');
  try {
    const response = await axios.get('https://services.tokenview.io/vw/btc/stats?apikey=5oes9chVs1MOa5G3HpyO');
    console.log('✅ Tokenview: SUCCESS - Bitcoin stats retrieved');
  } catch (error) {
    console.log('❌ Tokenview: FAILED -', error.message);
  }

  // Test 4: Your comprehensive endpoint
  console.log('\n4️⃣ Testing Your Comprehensive Analysis...');
  try {
    const response = await axios.post('http://localhost:3000/api/analyze/comprehensive', {
      tokenId: 'bitcoin',
      includeComprehensive: true
    });
    console.log('✅ Comprehensive Analysis: SUCCESS');
    console.log('📊 APIs Used:', response.data.metadata?.apis_used || []);
    console.log('🎯 Success Rate:', `${response.data.metadata?.success_count || 0}/4`);
    console.log('🔒 Risk Level:', response.data.risk_analysis?.risk_level || 'N/A');
  } catch (error) {
    console.log('❌ Comprehensive Analysis: FAILED -', error.message);
  }

  console.log('\n🎉 API Testing Complete!');
}

testAllAPIs();
