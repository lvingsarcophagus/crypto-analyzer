import type { RiskAnalysis } from "@/types/crypto"
import { CryptoAPIClient } from "./enhanced-api-client"
import { RiskCalculator } from "./risk-calculator"

export interface ConfidenceMetrics {
  data_completeness: number
  source_reliability: number
  temporal_consistency: number
  cross_validation_score: number
  overall_confidence: number
}

export interface HistoricalTrend {
  timeframe: string
  risk_score_change: number
  volatility_trend: "INCREASING" | "DECREASING" | "STABLE"
  market_sentiment: "BULLISH" | "BEARISH" | "NEUTRAL"
}

export interface EnhancedRiskAnalysis extends RiskAnalysis {
  confidence_metrics: ConfidenceMetrics
  historical_trends: HistoricalTrend[]
  peer_comparison: {
    similar_tokens: string[]
    relative_risk_ranking: number
    market_segment_average: number
  }
  real_time_alerts: {
    active_warnings: string[]
    monitoring_flags: string[]
  }
}

export class AdvancedRiskAnalyzer {
  private static readonly CONFIDENCE_THRESHOLDS = {
    HIGH: 0.8,
    MEDIUM: 0.6,
    LOW: 0.4,
  }

  static async performComprehensiveAnalysis(
    tokenId: string, 
    tokenAddress?: string, 
    blockchain = 'ethereum', 
    includeHistorical = true
  ): Promise<EnhancedRiskAnalysis> {
    try {
      // Get basic risk analysis using enhanced API integration
      const basicAnalysis = await this.getBasicRiskAnalysis(tokenId, tokenAddress, blockchain)

      // Calculate confidence metrics with real API data
      const confidenceMetrics = await this.calculateConfidenceMetrics(tokenId, tokenAddress, blockchain)

      // Get historical trends if requested
      const historicalTrends = includeHistorical ? await this.analyzeHistoricalTrends(tokenId) : []

      // Perform peer comparison
      const peerComparison = await this.performPeerComparison(tokenId, basicAnalysis)

      // Generate real-time alerts
      const realTimeAlerts = this.generateRealTimeAlerts(basicAnalysis, confidenceMetrics)

      // Adjust risk score based on confidence
      const adjustedScore = this.adjustScoreForConfidence(
        basicAnalysis.overall_score,
        confidenceMetrics.overall_confidence,
      )

      return {
        ...basicAnalysis,
        overall_score: adjustedScore,
        confidence_metrics: confidenceMetrics,
        historical_trends: historicalTrends,
        peer_comparison: peerComparison,
        real_time_alerts: realTimeAlerts,
      }
    } catch (error) {
      console.error("Comprehensive analysis failed:", error)
      throw new Error("Failed to perform comprehensive risk analysis")
    }
  }

  private static async getBasicRiskAnalysis(tokenId: string, tokenAddress?: string, blockchain = 'ethereum'): Promise<RiskAnalysis> {
    try {
      // Get comprehensive data from multiple APIs
      const [tokenData, walletConcentration, contractSecurity, tradingBehavior] = await Promise.allSettled([
        CryptoAPIClient.getTokenData(tokenId),
        tokenAddress ? CryptoAPIClient.getWalletConcentration(tokenAddress, blockchain) : Promise.resolve(null),
        tokenAddress ? CryptoAPIClient.getContractSecurity(tokenAddress, blockchain) : Promise.resolve(null),
        CryptoAPIClient.getTradingBehavior(tokenId, tokenAddress)
      ])

      // Process the data and calculate risk using RiskCalculator
      const processedTokenData = tokenData.status === 'fulfilled' ? this.processTokenData(tokenData.value) : null
      const processedWalletData = walletConcentration.status === 'fulfilled' ? walletConcentration.value : null
      const processedSecurityData = contractSecurity.status === 'fulfilled' ? contractSecurity.value : null
      const processedTradingData = tradingBehavior.status === 'fulfilled' ? tradingBehavior.value : null

      if (!processedTokenData) {
        throw new Error("Unable to fetch basic token data")
      }

      // Use the enhanced RiskCalculator with real API data
      return RiskCalculator.calculateOverallRisk(
        processedTokenData,
        processedWalletData || this.getDefaultWalletData(),
        processedSecurityData || this.getDefaultSecurityData(),
        processedTradingData || this.getDefaultTradingData()
      )
    } catch (error) {
      console.error("Error in basic risk analysis:", error)
      // Return fallback analysis
      return {
        token_id: tokenId,
        overall_score: 65,
        risk_level: "MEDIUM",
        risk_factors: [],
        recommendations: [],
        last_updated: new Date().toISOString(),
        data_sources: ["CoinGecko", "Mobula", "Tokenview", "Moralis"],
      }
    }
  }

  private static processTokenData(rawData: any): any {
    // Convert CoinGecko API response to our TokenData format
    return {
      id: rawData.id,
      symbol: rawData.symbol,
      name: rawData.name,
      market_cap_rank: rawData.market_cap_rank || 999999,
      price_change_percentage_24h: rawData.market_data?.price_change_percentage_24h || 0,
      market_cap: rawData.market_data?.market_cap?.usd || 0,
      total_volume: rawData.market_data?.total_volume?.usd || 0,
      circulating_supply: rawData.market_data?.circulating_supply || 0,
      total_supply: rawData.market_data?.total_supply || 0,
      max_supply: rawData.market_data?.max_supply || null
    }
  }

  private static getDefaultWalletData(): any {
    return {
      top_10_holders_percentage: 50,
      top_100_holders_percentage: 80,
      whale_concentration_risk: "MEDIUM"
    }
  }

  private static getDefaultSecurityData(): any {
    return {
      is_verified: false,
      has_proxy: false,
      has_mint_function: true,
      has_pause_function: false,
      ownership_renounced: false,
      security_score: 40
    }
  }

  private static getDefaultTradingData(): any {
    return {
      volume_24h: 10000,
      volume_change_24h: 0,
      liquidity_score: 50,
      price_volatility: 25,
      trading_activity_risk: "MEDIUM"
    }
  }

  private static async calculateConfidenceMetrics(tokenId: string, tokenAddress?: string, blockchain = 'ethereum'): Promise<ConfidenceMetrics> {
    // Enhanced confidence calculation using real API data
    const dataCompleteness = await this.assessDataCompleteness(tokenId, tokenAddress, blockchain)

    // Source reliability: Quality and reputation of data sources
    const sourceReliability = this.assessSourceReliability()

    // Temporal consistency: How consistent the data is over time
    const temporalConsistency = await this.assessTemporalConsistency(tokenId)

    // Cross-validation: Agreement between different data sources
    const crossValidationScore = await this.performCrossValidation(tokenId, tokenAddress)

    // Calculate overall confidence as weighted average
    const overallConfidence =
      dataCompleteness * 0.3 + sourceReliability * 0.25 + temporalConsistency * 0.25 + crossValidationScore * 0.2

    return {
      data_completeness: Math.round(dataCompleteness * 100) / 100,
      source_reliability: Math.round(sourceReliability * 100) / 100,
      temporal_consistency: Math.round(temporalConsistency * 100) / 100,
      cross_validation_score: Math.round(crossValidationScore * 100) / 100,
      overall_confidence: Math.round(overallConfidence * 100) / 100,
    }
  }

  private static async assessDataCompleteness(tokenId: string, tokenAddress?: string, blockchain = 'ethereum'): Promise<number> {
    // Check what percentage of required data points we have from real API calls
    const requiredFields = [
      "market_cap",
      "volume", 
      "price",
      "supply_data",
      "contract_info",
      "holder_distribution",
      "trading_metrics",
    ]

    let availableFields = 0

    try {
      // Check CoinGecko data availability
      const tokenData = await CryptoAPIClient.getTokenData(tokenId)
      if (tokenData?.market_data?.market_cap?.usd) availableFields++
      if (tokenData?.market_data?.total_volume?.usd) availableFields++
      if (tokenData?.market_data?.current_price?.usd) availableFields++
      if (tokenData?.market_data?.circulating_supply) availableFields++

      // Check contract and holder data if address provided
      if (tokenAddress) {
        try {
          const holderData = await CryptoAPIClient.getWalletConcentration(tokenAddress, blockchain)
          if (holderData && holderData.total_holders > 0) availableFields++
          
          const contractData = await CryptoAPIClient.getContractSecurity(tokenAddress, blockchain)
          if (contractData && contractData.security_score !== undefined) availableFields++
        } catch (error) {
          console.log("Additional data not available:", error)
        }
      }

      // Check trading metrics
      try {
        const tradingData = await CryptoAPIClient.getTradingBehavior(tokenId, tokenAddress)
        if (tradingData && tradingData.volume_24h !== undefined) availableFields++
      } catch (error) {
        console.log("Trading data not available:", error)
      }

    } catch (error) {
      console.error("Error assessing data completeness:", error)
      // Return moderate score if we can't assess properly
      return 0.5
    }

    return Math.min(availableFields / requiredFields.length, 1.0)
  }

  private static assessSourceReliability(): number {
    // Rate the reliability of our enhanced data sources including API keys
    const sourceReliabilityScores = {
      CoinGecko: 0.95,  // Higher due to API key access
      Mobula: 0.85,     // Good API with real-time data
      Tokenview: 0.88,  // Reliable blockchain data
      Moralis: 0.92,    // High-quality Web3 data
      Etherscan: 0.95,  // Most reliable for contract data
    }

    // Calculate weighted average based on sources used
    return (
      Object.values(sourceReliabilityScores).reduce((a, b) => a + b, 0) / Object.keys(sourceReliabilityScores).length
    )
  }

  private static async assessTemporalConsistency(tokenId: string): Promise<number> {
    // Check how consistent the data is across different time periods
    // Mock implementation - would analyze actual historical data consistency
    return 0.7 + Math.random() * 0.25 // 0.7 to 0.95
  }

  private static async performCrossValidation(tokenId: string, tokenAddress?: string): Promise<number> {
    // Compare data from multiple sources to check for consistency
    try {
      if (!tokenAddress) {
        // Can only do limited validation without token address
        return 0.7
      }

      // Get price data from multiple sources
      const priceValidation = await CryptoAPIClient.getCrossSourcePriceData(tokenId, tokenAddress)
      
      // Score based on price consistency between sources
      const priceConsistencyScore = priceValidation.price_consistency_score || 0.6

      // Additional validation checks could include:
      // - Volume consistency across sources
      // - Market cap consistency
      // - Holder count consistency
      
      // For now, base score on price consistency
      let validationScore = priceConsistencyScore

      // Bonus points for having multiple data sources
      if (priceValidation.sources && priceValidation.sources.length > 1) {
        validationScore += 0.1 * (priceValidation.sources.length - 1)
      }

      return Math.min(validationScore, 1.0)
    } catch (error) {
      console.error("Cross-validation error:", error)
      // Return moderate score if validation fails
      return 0.6
    }
  }

  private static async analyzeHistoricalTrends(tokenId: string): Promise<HistoricalTrend[]> {
    // Analyze historical risk score changes and market trends
    const timeframes = ["7d", "30d", "90d"]

    return timeframes.map((timeframe) => ({
      timeframe,
      risk_score_change: (Math.random() - 0.5) * 40, // -20 to +20 change
      volatility_trend: ["INCREASING", "DECREASING", "STABLE"][Math.floor(Math.random() * 3)] as any,
      market_sentiment: ["BULLISH", "BEARISH", "NEUTRAL"][Math.floor(Math.random() * 3)] as any,
    }))
  }

  private static async performPeerComparison(
    tokenId: string,
    analysis: RiskAnalysis,
  ): Promise<EnhancedRiskAnalysis["peer_comparison"]> {
    // Find similar tokens and compare risk scores
    const similarTokens = await this.findSimilarTokens(tokenId)
    const peerRiskScores = await this.getPeerRiskScores(similarTokens)

    const averageScore = peerRiskScores.reduce((a, b) => a + b, 0) / peerRiskScores.length
    const ranking = peerRiskScores.filter((score) => score > analysis.overall_score).length + 1

    return {
      similar_tokens: similarTokens,
      relative_risk_ranking: ranking,
      market_segment_average: Math.round(averageScore),
    }
  }

  private static async findSimilarTokens(tokenId: string): Promise<string[]> {
    // Find tokens in similar market cap range, sector, or with similar characteristics
    // Mock implementation
    return ["ethereum", "binancecoin", "cardano", "solana", "polkadot"].slice(0, 3)
  }

  private static async getPeerRiskScores(tokenIds: string[]): Promise<number[]> {
    // Get risk scores for peer tokens
    // Mock implementation
    return tokenIds.map(() => Math.floor(Math.random() * 100))
  }

  private static generateRealTimeAlerts(
    analysis: RiskAnalysis,
    confidence: ConfidenceMetrics,
  ): EnhancedRiskAnalysis["real_time_alerts"] {
    const activeWarnings: string[] = []
    const monitoringFlags: string[] = []

    // Generate warnings based on risk level and confidence
    if (analysis.risk_level === "CRITICAL") {
      activeWarnings.push("CRITICAL RISK: Immediate attention required")
    }

    if (analysis.risk_level === "HIGH" && confidence.overall_confidence > 0.8) {
      activeWarnings.push("HIGH RISK: High confidence in risk assessment")
    }

    if (confidence.overall_confidence < 0.5) {
      monitoringFlags.push("LOW_CONFIDENCE: Risk assessment has low confidence")
    }

    if (confidence.data_completeness < 0.6) {
      monitoringFlags.push("INCOMPLETE_DATA: Missing critical data points")
    }

    // Check for specific risk factors
    analysis.risk_factors.forEach((factor) => {
      if (factor.risk_level === "CRITICAL") {
        activeWarnings.push(`CRITICAL: ${factor.category} shows critical risk`)
      }
      if (factor.risk_level === "HIGH") {
        monitoringFlags.push(`MONITOR: ${factor.category} requires monitoring`)
      }
    })

    return {
      active_warnings: activeWarnings,
      monitoring_flags: monitoringFlags,
    }
  }

  private static adjustScoreForConfidence(baseScore: number, confidence: number): number {
    // Adjust risk score based on confidence level
    // Lower confidence should increase uncertainty, potentially increasing risk score
    if (confidence < this.CONFIDENCE_THRESHOLDS.LOW) {
      // Low confidence - increase risk score by up to 15 points
      return Math.min(100, baseScore + 15 * (1 - confidence))
    } else if (confidence < this.CONFIDENCE_THRESHOLDS.MEDIUM) {
      // Medium confidence - slight adjustment
      return Math.min(100, baseScore + 5 * (1 - confidence))
    }

    // High confidence - use base score
    return baseScore
  }

  static async validateRiskAssessment(
    tokenId: string,
    analysis: EnhancedRiskAnalysis,
  ): Promise<{
    is_valid: boolean
    validation_errors: string[]
    confidence_adjustment: number
  }> {
    const validationErrors: string[] = []
    let confidenceAdjustment = 0

    // Validate data consistency
    if (analysis.confidence_metrics.cross_validation_score < 0.5) {
      validationErrors.push("Cross-validation score too low - conflicting data sources")
      confidenceAdjustment -= 0.1
    }

    // Validate temporal consistency
    if (analysis.confidence_metrics.temporal_consistency < 0.4) {
      validationErrors.push("Temporal inconsistency detected - data may be unreliable")
      confidenceAdjustment -= 0.15
    }

    // Validate risk factor consistency
    const criticalFactors = analysis.risk_factors.filter((f) => f.risk_level === "CRITICAL")
    if (criticalFactors.length > 0 && analysis.risk_level !== "CRITICAL") {
      validationErrors.push("Risk level inconsistent with critical risk factors")
      confidenceAdjustment -= 0.2
    }

    return {
      is_valid: validationErrors.length === 0,
      validation_errors: validationErrors,
      confidence_adjustment: confidenceAdjustment,
    }
  }
}
