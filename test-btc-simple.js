// Simple test to verify BTC analysis is working
async function testBTC() {
  try {
    console.log('🔍 Testing BTC Analysis...');
    
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenId: 'btc' })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status}`);
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ BTC Analysis SUCCESS!');
    console.log('🪙 Token:', data.token?.name || 'Unknown');
    console.log('📊 Risk Score:', data.risk_analysis?.overall_score || 'N/A');
    console.log('🔒 Risk Level:', data.risk_analysis?.risk_level || 'N/A');
    console.log('💰 Current Price:', data.token?.current_price ? `$${data.token.current_price.toLocaleString()}` : 'N/A');
    console.log('📈 Market Cap Rank:', data.token?.market_cap_rank || 'N/A');
    
    console.log('\n📋 Analysis successful - BTC is working!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBTC();
