import { type NextRequest, NextResponse } from "next/server";
import { AdvancedRiskAnalyzer } from "@/lib/advanced-risk-analyzer";
import { TokenResolver } from "@/lib/token-resolver";
import { CryptoAPIClient } from "@/lib/enhanced-api-client";

// Helper function to resolve a user-provided token query to a CoinGecko ID
// This is important for ensuring we analyze the correct token.
async function resolveCoinGeckoId(input: string): Promise<string> {
  const q = (input || "").trim().toLowerCase();

  // Common mappings for popular tokens
  const common: Record<string, string> = {
    btc: "bitcoin",
    xbt: "bitcoin",
    eth: "ethereum",
    bnb: "binancecoin",
    sol: "solana",
    ada: "cardano",
    xrp: "ripple",
    doge: "dogecoin",
    matic: "matic-network",
    ton: "the-open-network",
    trx: "tron",
    dot: "polkadot",
  };
  if (common[q]) return common[q];

  // If it already looks like a CoinGecko ID, try it directly.
  if (/^[a-z0-9-]{3,}$/.test(q)) return q;

  // Use the TokenResolver for a more advanced search.
  try {
    const results = await TokenResolver.resolveToken(q);
    if (results && results.length > 0) {
      // Return the ID of the best match
      return results[0].id;
    }
  } catch (e) {
    console.error("Token resolver failed, falling back to input", e)
  }
  
  // Fallback to the original input if resolution fails
  return q;
}


export async function POST(request: NextRequest) {
  try {
    console.log("🔍 API /analyze called for comprehensive analysis");

    let body;
    try {
      body = await request.json();
      console.log("📥 Request body:", body);
    } catch (jsonError) {
      console.log("❌ JSON parsing error:", jsonError);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const { tokenId, tokenAddress, blockchain } = body;

    console.log("📋 Extracted params:", { tokenId, tokenAddress, blockchain });

    if (!tokenId) {
      console.log("❌ Token ID is missing");
      return NextResponse.json({ error: "Token ID is required" }, { status: 400 });
    }

    // Resolve the user's input to a reliable CoinGecko token ID
    const resolvedId = await resolveCoinGeckoId(tokenId);
    console.log(`🚀 Starting comprehensive analysis for: ${tokenId} (resolved -> ${resolvedId})`);

    // Perform the comprehensive analysis using the AdvancedRiskAnalyzer
    const riskAnalysis = await AdvancedRiskAnalyzer.performComprehensiveAnalysis(
      resolvedId,
      tokenAddress,
      blockchain
    );

    console.log(`✅ Risk analysis completed for ${resolvedId}`);
    console.log(`📊 Risk Score: ${riskAnalysis.overall_score}, Level: ${riskAnalysis.risk_level}`);

    // Fetch basic token info to include in the response for the frontend
    const tokenInfo = await CryptoAPIClient.getTokenData(resolvedId);
    
    // Handle fallback data case
    if (tokenInfo._fallback) {
      console.log(`⚠️ Using fallback data for ${resolvedId} due to API issues`);
    }

    const response = {
      token: {
        id: tokenInfo.id || resolvedId,
        symbol: tokenInfo.symbol || resolvedId.toUpperCase(),
        name: tokenInfo.name || resolvedId.charAt(0).toUpperCase() + resolvedId.slice(1),
        image: tokenInfo.image?.large || null,
        current_price: tokenInfo.market_data?.current_price?.usd || 0,
        market_cap: tokenInfo.market_data?.market_cap?.usd || 0,
        market_cap_rank: tokenInfo.market_cap_rank || null,
        contract_address: tokenAddress,
        _fallback_data: tokenInfo._fallback || false
      },
      risk_analysis: riskAnalysis,
      analysis_type: "comprehensive",
      data_sources: riskAnalysis.data_sources, // Use data sources from the analysis itself
      analysis_metadata: {
        timestamp: new Date().toISOString(),
        method: "advanced_risk_analysis",
        apis_used: ['CoinGecko', 'Moralis', 'Tokenview', 'Mobula'], // Reflects the APIs used by the advanced analyzer
        blockchain: blockchain || 'ethereum',
        token_mapped: resolvedId,
        success: true,
      },
      debug_token_info: tokenInfo, // Add full token info for debugging
    };

    console.log(`🎉 Analysis successful for ${tokenInfo.name} - returning response`);
    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ Comprehensive analysis API error:", error);

    let errorMessage = "Failed to analyze token";
    let suggestion = "Please try again later.";

    if (error instanceof Error) {
      console.error("❌ Error details:", error.message);
      if (error.message.includes('404') || error.message.includes('not found')) {
        errorMessage = "Token not found";
        suggestion = "Please check the token ID or contract address.";
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        errorMessage = "Rate limit exceeded";
        suggestion = "Our system is under heavy load. Please wait a moment and try again.";
      } else if (error.message.includes('timeout') || error.message.includes('TIMEOUT') || error.message.includes('UND_ERR_CONNECT_TIMEOUT')) {
        errorMessage = "Request timeout";
        suggestion = "The analysis is taking longer than expected. Please try again with a shorter analysis or check your internet connection.";
      } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('ENOTFOUND') || error.message.includes('ECONNRESET')) {
        errorMessage = "Network connectivity issue";
        suggestion = "Unable to connect to data sources. Please check your internet connection and try again.";
      }
    }

    console.error("❌ Returning error response:", { errorMessage, suggestion });

    return NextResponse.json({
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: suggestion,
    }, { status: 500 });
  }
}
