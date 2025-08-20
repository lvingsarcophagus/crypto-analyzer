import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("🧪 Test API called");
    
    const body = await request.json();
    console.log("📥 Test API received:", body);
    
    // Simple mock response
    const mockResponse = {
      token: {
        id: body.tokenId || "bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        current_price: 65000,
        market_cap: 1200000000000
      },
      risk_analysis: {
        overall_score: 15,
        risk_level: "LOW",
        market_factors: {
          price_change_24h: 2.5,
          market_cap_rank_risk: 10
        },
        security_factors: {
          security_score: 95,
          is_verified: true
        },
        liquidity_factors: {
          liquidity_score: 90
        },
        decentralization_factors: {
          whale_concentration_risk: "LOW",
          top_10_holders_percentage: 15
        },
        trading_factors: {
          volume_24h: 25000000000
        },
        recommendations: [
          "Bitcoin is considered a low-risk cryptocurrency",
          "Suitable for long-term investment strategies",
          "Monitor market trends for entry points"
        ],
        warnings: []
      },
      analysis_metadata: {
        timestamp: new Date().toISOString(),
        method: "test_mode",
        success: true
      }
    };
    
    console.log("✅ Test API returning mock response");
    return NextResponse.json(mockResponse);
    
  } catch (error) {
    console.error("❌ Test API error:", error);
    return NextResponse.json(
      { error: 'Test API failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
