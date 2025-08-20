import { type NextRequest, NextResponse } from "next/server"
import { CryptoAPIClient } from "@/lib/api-client"
import { RiskCalculator } from "@/lib/risk-calculator"

export async function POST(request: NextRequest) {
  try {
    const { tokenId, tokenAddress, blockchain, includeHistorical, useSimpleAnalysis } = await request.json()

    if (!tokenId) {
      return NextResponse.json({ error: "Token ID is required" }, { status: 400 })
    }

    console.log(`Analyzing token: ${tokenId}`)

    // Use enhanced API client for direct analysis
    const [tokenData, walletConcentration, contractSecurity, tradingBehavior] = await Promise.all([
      CryptoAPIClient.getTokenData(tokenId),
      CryptoAPIClient.getWalletConcentration(tokenAddress || tokenId),
      CryptoAPIClient.getContractSecurity(tokenAddress || tokenId),
      CryptoAPIClient.getTradingBehavior(tokenId),
    ])

    // Process token data for risk calculation
    const processedTokenData = {
      id: tokenData.id,
      symbol: tokenData.symbol,
      name: tokenData.name,
      current_price: tokenData.market_data?.current_price?.usd || 0,
      market_cap: tokenData.market_data?.market_cap?.usd || 0,
      market_cap_rank: tokenData.market_cap_rank || 999999,
      fully_diluted_valuation: tokenData.market_data?.fully_diluted_valuation?.usd || 0,
      total_volume: tokenData.market_data?.total_volume?.usd || 0,
      high_24h: tokenData.market_data?.high_24h?.usd || 0,
      low_24h: tokenData.market_data?.low_24h?.usd || 0,
      price_change_24h: tokenData.market_data?.price_change_24h || 0,
      price_change_percentage_24h: tokenData.market_data?.price_change_percentage_24h || 0,
      market_cap_change_24h: tokenData.market_data?.market_cap_change_24h || 0,
      market_cap_change_percentage_24h: tokenData.market_data?.market_cap_change_percentage_24h || 0,
      circulating_supply: tokenData.market_data?.circulating_supply || 0,
      total_supply: tokenData.market_data?.total_supply || 0,
      max_supply: tokenData.market_data?.max_supply || null,
      ath: tokenData.market_data?.ath?.usd || 0,
      ath_change_percentage: tokenData.market_data?.ath_change_percentage?.usd || 0,
      ath_date: tokenData.market_data?.ath_date?.usd || new Date().toISOString(),
      atl: tokenData.market_data?.atl?.usd || 0,
      atl_change_percentage: tokenData.market_data?.atl_change_percentage?.usd || 0,
      atl_date: tokenData.market_data?.atl_date?.usd || new Date().toISOString(),
      last_updated: tokenData.last_updated || new Date().toISOString()
    }

    // Calculate risk analysis
    const riskAnalysis = RiskCalculator.calculateOverallRisk(
      processedTokenData,
      walletConcentration,
      contractSecurity,
      tradingBehavior,
    )

    return NextResponse.json({
      token: {
        id: tokenData.id,
        symbol: tokenData.symbol,
        name: tokenData.name,
        image: tokenData.image?.large,
        current_price: tokenData.market_data?.current_price?.usd,
        market_cap: tokenData.market_data?.market_cap?.usd,
        market_cap_rank: tokenData.market_cap_rank,
        contract_address: tokenAddress
      },
      risk_analysis: riskAnalysis,
      analysis_type: "enhanced_direct",
      data_sources: {
        basic_info_source: 'CoinGecko',
        security_analysis_source: contractSecurity.data_source || 'enhanced_api_client',
        holder_analysis_source: walletConcentration.data_source || 'enhanced_api_client',
        trading_analysis_source: tradingBehavior.data_source || 'enhanced_api_client'
      },
      analysis_metadata: {
        timestamp: new Date().toISOString(),
        method: "direct_api_integration",
        apis_used: ['CoinGecko'],
        blockchain: blockchain || 'bitcoin',
        token_mapped: tokenId.toLowerCase() === 'btc' ? 'bitcoin' : tokenId
      }
    })

  } catch (error) {
    console.error("Enhanced analysis API error:", error)
    
    // Provide helpful error message for common issues
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
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: suggestion
    }, { status: 500 })
  }
}
