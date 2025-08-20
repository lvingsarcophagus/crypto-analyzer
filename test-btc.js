// Test script for BTC analysis
async function testBTCAnalysis() {
  try {
    console.log('Testing BTC analysis...')
    
    const response = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenId: 'bitcoin'
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ BTC Analysis successful!')
      console.log('Token:', data.token.name, data.token.symbol)
      console.log('Price:', data.token.current_price)
      console.log('Risk Level:', data.risk_analysis.risk_level)
      console.log('Risk Score:', data.risk_analysis.overall_score)
    } else {
      console.log('❌ BTC Analysis failed:')
      console.log('Error:', data.error)
      console.log('Details:', data.details)
      console.log('Suggestion:', data.suggestion)
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

// Also test with 'btc' as tokenId
async function testBTCWithShortForm() {
  try {
    console.log('Testing BTC analysis with "btc" tokenId...')
    
    const response = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenId: 'btc'
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ BTC (short form) Analysis successful!')
      console.log('Token:', data.token.name, data.token.symbol)
      console.log('Price:', data.token.current_price)
      console.log('Risk Level:', data.risk_analysis.risk_level)
    } else {
      console.log('❌ BTC (short form) Analysis failed:')
      console.log('Error:', data.error)
      console.log('Suggestion:', data.suggestion)
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

// Run tests
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch')
  testBTCAnalysis()
  setTimeout(testBTCWithShortForm, 2000)
} else {
  // Browser environment
  testBTCAnalysis()
  setTimeout(testBTCWithShortForm, 2000)
}
