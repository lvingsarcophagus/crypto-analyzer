// A simple script to trigger the analysis API endpoint.
// Usage: node run_analysis.js <token_id>
async function runAnalysis() {
  try {
    const tokenId = process.argv[2] || 'bitcoin'; // Default to bitcoin if no arg provided

    // Dynamically import node-fetch
    const fetch = (await import('node-fetch')).default;

    console.log(`Triggering analysis for ${tokenId}...`);

    const response = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenId: tokenId
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Analysis for ${tokenId} successful!`);
      console.log('Risk Score:', data.risk_analysis.overall_score);
      console.log('Risk Level:', data.risk_analysis.risk_level);
    } else {
      console.log(`❌ Analysis for ${tokenId} failed:`);
      console.log('Error:', data.error);
      console.log('Suggestion:', data.suggestion);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

runAnalysis();
