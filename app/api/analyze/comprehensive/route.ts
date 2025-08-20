import { type NextRequest, NextResponse } from "next/server"
import { ComprehensiveAPIClient } from "@/lib/comprehensive-api-client"
import { RiskCalculator } from "@/lib/risk-calculator"

export async function POST(request: NextRequest) {
  try {
    const { tokenId, tokenAddress, blockchain, includeComprehensive = true } = await request.json()

    if (!tokenId) {
      return NextResponse.json({ error: "Token ID is required" }, { status: 400 })
    }

    console.log(`🔍 Starting multi-API analysis for: ${tokenId}`)

    if (includeComprehensive) {
      // Use comprehensive analysis with all 4 APIs
      const comprehensiveData = await ComprehensiveAPIClient.getComprehensiveAnalysis(
        tokenId, 
        tokenAddress
      )

      // Calculate enhanced risk using all available data
      const enhancedRisk = ComprehensiveAPIClient.calculateEnhancedRisk(comprehensiveData)

      // Extract token information from CoinGecko data
      const tokenInfo = comprehensiveData.basic_info ? {
        id: comprehensiveData.basic_info.id,
        symbol: comprehensiveData.basic_info.symbol,
        name: comprehensiveData.basic_info.name,
        image: comprehensiveData.basic_info.image?.large,
        current_price: comprehensiveData.basic_info.market_data?.current_price?.usd,
        market_cap: comprehensiveData.basic_info.market_data?.market_cap?.usd,
        market_cap_rank: comprehensiveData.basic_info.market_cap_rank,
        total_volume: comprehensiveData.basic_info.market_data?.total_volume?.usd,
        price_change_24h: comprehensiveData.basic_info.market_data?.price_change_percentage_24h
      } : {
        id: tokenId,
        symbol: tokenId,
        name: `Token ${tokenId}`,
        image: null,
        current_price: null,
        market_cap: null,
        market_cap_rank: null,
        total_volume: null,
        price_change_24h: null
      }

      return NextResponse.json({
        token: tokenInfo,
        risk_analysis: enhancedRisk,
        comprehensive_data: {
          market_data: comprehensiveData.basic_info?.market_data || null,
          security_analysis: comprehensiveData.contract_analysis || null,
          trading_metrics: comprehensiveData.market_analysis || null,
          blockchain_stats: comprehensiveData.blockchain_analysis || null
        },
        analysis_type: "comprehensive_multi_api",
        data_sources: {
          primary_source: "CoinGecko",
          contract_analysis: comprehensiveData.contract_analysis?.data_source || "unavailable",
          market_analysis: comprehensiveData.market_analysis?.data_source || "unavailable", 
          blockchain_analysis: comprehensiveData.blockchain_analysis?.data_source || "unavailable"
        },
        metadata: {
          ...comprehensiveData.analysis_metadata,
          api_keys_used: ["COINGECKO", "MORALIS", "MOBULA", "TOKENVIEW"],
          reliability_score: enhancedRisk.confidence_score
        }
      })

    } else {
      // Fallback to simple CoinGecko-only analysis
      console.log(`📊 Using simple analysis for: ${tokenId}`)
      
      const tokenData = await ComprehensiveAPIClient.getCoinGeckoData(tokenId)
      
      // Create basic risk analysis
      const basicRisk = {
        overall_score: 50, // Neutral score without comprehensive data
        risk_level: "MEDIUM" as const,
        risk_breakdown: {
          market_risk: 30,
          security_risk: 50,
          liquidity_risk: 50,
          concentration_risk: 50
        },
        confidence_score: 25 // Low confidence with single API
      }

      return NextResponse.json({
        token: {
          id: tokenData.id,
          symbol: tokenData.symbol,
          name: tokenData.name,
          image: tokenData.image?.large,
          current_price: tokenData.market_data?.current_price?.usd,
          market_cap: tokenData.market_data?.market_cap?.usd,
          market_cap_rank: tokenData.market_cap_rank
        },
        risk_analysis: basicRisk,
        analysis_type: "basic_coingecko_only",
        data_sources: {
          primary_source: "CoinGecko",
          contract_analysis: "not_included",
          market_analysis: "not_included",
          blockchain_analysis: "not_included"
        },
        metadata: {
          timestamp: new Date().toISOString(),
          apis_used: ["CoinGecko"],
          success_count: 1,
          reliability_score: 25
        }
      })
    }

  } catch (error) {
    console.error("🔥 Multi-API analysis error:", error)
    
    // Provide helpful error messages
    let errorMessage = "Failed to analyze token"
    let suggestion = "Please try again"
    
    if (error instanceof Error) {
      if (error.message.includes('404') || error.message.includes('not found')) {
        errorMessage = "Token not found"
        suggestion = "Please check the token ID. For Bitcoin, try using 'bitcoin' instead of 'btc'"
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        errorMessage = "Rate limit exceeded"
        suggestion = "Please wait a moment and try again"
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "Network error"
        suggestion = "Please check your internet connection and try again"
      } else if (error.message.includes('API key')) {
        errorMessage = "API authentication error"
        suggestion = "Please check API key configuration"
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: suggestion,
      fallback_available: true
    }, { status: 500 })
  }
}
