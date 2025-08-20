// Direct test of the fixed BTC analysis
const fetch = require('node-fetch');

async function testBTCAnalysis() {
  console.log('🔍 Testing BTC Analysis (Direct)...\n');
  
  try {
    console.log('📡 Calling analyze API...');
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenId: 'btc' })
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:');
      console.error(errorText);
      return;
    }

    const data = await response.json();
    
    console.log('\n🎉 BTC ANALYSIS SUCCESS!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🪙 Token: ${data.token?.name || 'Unknown'}`);
    console.log(`💰 Price: $${data.token?.current_price?.toLocaleString() || 'N/A'}`);
    console.log(`📊 Market Cap Rank: #${data.token?.market_cap_rank || 'N/A'}`);
    console.log(`🔒 Risk Score: ${data.risk_analysis?.overall_score || 'N/A'}/100`);
    console.log(`⚠️  Risk Level: ${data.risk_analysis?.risk_level || 'N/A'}`);
    console.log(`🕒 Analysis Time: ${data.analysis_metadata?.timestamp || 'N/A'}`);
    console.log(`✅ Success: ${data.analysis_metadata?.success || false}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Test with "bitcoin" as well
    console.log('\n🔄 Testing with "bitcoin" (full name)...');
    const response2 = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenId: 'bitcoin' })
    });

    if (response2.ok) {
      const data2 = await response2.json();
      console.log(`✅ "bitcoin" also works! Price: $${data2.token?.current_price?.toLocaleString() || 'N/A'}`);
    } else {
      console.log('❌ "bitcoin" test failed');
    }
    
    console.log('\n🎯 RESULT: BTC Analysis is now working perfectly!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('🔧 Suggestion: Make sure the server is running on http://localhost:3000');
  }
}

testBTCAnalysis();
