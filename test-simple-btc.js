const fetch = require('node-fetch');

async function testBTCAnalysis() {
  try {
    console.log('🚀 Testing BTC Analysis...');
    
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenId: 'btc' })
    });

    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ BTC Analysis SUCCESS!');
    console.log('📊 Results:');
    console.log('Token:', data.token?.name || 'Unknown');
    console.log('Risk Score:', data.risk_analysis?.overall_score || 'N/A');
    console.log('Risk Level:', data.risk_analysis?.risk_level || 'N/A');
    console.log('Data Sources:', data.data_sources || {});
    
    // Test with full name too
    console.log('\n🔄 Testing with "bitcoin"...');
    const response2 = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenId: 'bitcoin' })
    });

    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Bitcoin (full name) also works!');
      console.log('Token:', data2.token?.name || 'Unknown');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBTCAnalysis();
