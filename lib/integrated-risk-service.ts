import { AdvancedRiskAnalyzer, type EnhancedRiskAnalysis } from './advanced-risk-analyzer'
import { CryptoAPIClient } from './enhanced-api-client'
import type { RiskAnalysis } from '@/types/crypto'

export interface ApiIntegrationConfig {
  enableCrossValidation: boolean
  enableRealTimeMonitoring: boolean
  cacheDuration: number // in minutes
  maxRetries: number
}

export interface TokenAnalysisRequest {
  tokenId: string
  tokenAddress?: string
  blockchain?: string
  includeHistorical?: boolean
  config?: Partial<ApiIntegrationConfig>
}

export interface ComprehensiveTokenData {
  basic_info: any
  market_data: any
  security_analysis: any
  holder_analysis: any
  trading_analysis: any
  price_validation: any
  risk_analysis: EnhancedRiskAnalysis
}

export class IntegratedRiskAnalysisService {
  private static readonly DEFAULT_CONFIG: ApiIntegrationConfig = {
    enableCrossValidation: true,
    enableRealTimeMonitoring: true,
    cacheDuration: 15, // 15 minutes
    maxRetries: 3
  }

  private static cache = new Map<string, { data: any; timestamp: number }>()

  /**
   * Performs comprehensive risk analysis using all integrated APIs
   */
  static async analyzeToken(request: TokenAnalysisRequest): Promise<ComprehensiveTokenData> {
    const {
      tokenId,
      tokenAddress,
      blockchain = 'ethereum',
      includeHistorical = true,
      config = {}
    } = request

    const fullConfig = { ...this.DEFAULT_CONFIG, ...config }
    const cacheKey = `${tokenId}-${tokenAddress}-${blockchain}`

    // Check cache first
    if (this.isCacheValid(cacheKey, fullConfig.cacheDuration)) {
      console.log(`Returning cached data for ${tokenId}`)
      return this.cache.get(cacheKey)!.data
    }

    try {
      console.log(`Performing comprehensive analysis for ${tokenId}`)

      // Gather all data in parallel for efficiency
      const [
        basicInfo,
        marketData,
        securityAnalysis,
        holderAnalysis,
        tradingAnalysis,
        priceValidation
      ] = await Promise.allSettled([
        this.retryApiCall(() => CryptoAPIClient.getTokenData(tokenId), fullConfig.maxRetries),
        this.retryApiCall(() => CryptoAPIClient.getMarketData([tokenId]), fullConfig.maxRetries),
        tokenAddress ? this.retryApiCall(() => CryptoAPIClient.getContractSecurity(tokenAddress, blockchain), fullConfig.maxRetries) : Promise.resolve(null),
        tokenAddress ? this.retryApiCall(() => CryptoAPIClient.getWalletConcentration(tokenAddress, blockchain), fullConfig.maxRetries) : Promise.resolve(null),
        this.retryApiCall(() => CryptoAPIClient.getTradingBehavior(tokenId, tokenAddress), fullConfig.maxRetries),
        fullConfig.enableCrossValidation && tokenAddress ? 
          this.retryApiCall(() => CryptoAPIClient.getCrossSourcePriceData(tokenId, tokenAddress), fullConfig.maxRetries) : 
          Promise.resolve(null)
      ])

      // Perform enhanced risk analysis
      const riskAnalysis = await AdvancedRiskAnalyzer.performComprehensiveAnalysis(
        tokenId,
        tokenAddress,
        blockchain,
        includeHistorical
      )

      const result: ComprehensiveTokenData = {
        basic_info: basicInfo.status === 'fulfilled' ? basicInfo.value : null,
        market_data: marketData.status === 'fulfilled' ? marketData.value : null,
        security_analysis: securityAnalysis.status === 'fulfilled' ? securityAnalysis.value : null,
        holder_analysis: holderAnalysis.status === 'fulfilled' ? holderAnalysis.value : null,
        trading_analysis: tradingAnalysis.status === 'fulfilled' ? tradingAnalysis.value : null,
        price_validation: priceValidation.status === 'fulfilled' ? priceValidation.value : null,
        risk_analysis: riskAnalysis
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })

      return result
    } catch (error) {
      console.error(`Comprehensive analysis failed for ${tokenId}:`, error)
      throw new Error(`Failed to analyze token ${tokenId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Quick risk assessment for multiple tokens
   */
  static async batchRiskAssessment(tokenRequests: TokenAnalysisRequest[]): Promise<Map<string, RiskAnalysis>> {
    const results = new Map<string, RiskAnalysis>()
    
    // Process in batches to respect rate limits
    const batchSize = 5
    for (let i = 0; i < tokenRequests.length; i += batchSize) {
      const batch = tokenRequests.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (request) => {
        try {
          const analysis = await this.analyzeToken({
            ...request,
            includeHistorical: false, // Skip historical for batch processing
            config: { enableCrossValidation: false } // Skip cross-validation for speed
          })
          return { tokenId: request.tokenId, analysis: analysis.risk_analysis }
        } catch (error) {
          console.error(`Batch analysis failed for ${request.tokenId}:`, error)
          return null
        }
      })

      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          results.set(result.value.tokenId, result.value.analysis)
        }
      })

      // Add delay between batches to respect rate limits
      if (i + batchSize < tokenRequests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return results
  }

  /**
   * Real-time monitoring for high-risk tokens
   */
  static async startRealTimeMonitoring(tokenIds: string[]): Promise<void> {
    console.log(`Starting real-time monitoring for ${tokenIds.length} tokens`)
    
    // This would implement WebSocket connections or polling for real-time updates
    // For now, we'll implement basic polling
    const monitoringInterval = setInterval(async () => {
      for (const tokenId of tokenIds) {
        try {
          const quickAnalysis = await this.analyzeToken({
            tokenId,
            includeHistorical: false,
            config: { 
              enableCrossValidation: false,
              cacheDuration: 1 // Very short cache for real-time
            }
          })

          // Check for critical risk changes
          if (quickAnalysis.risk_analysis.risk_level === 'CRITICAL') {
            console.warn(`CRITICAL RISK DETECTED for ${tokenId}`)
            // Would trigger alerts/notifications here
          }

          // Check for significant price movements
          if (quickAnalysis.price_validation?.price_deviation > 0.1) {
            console.warn(`High price deviation detected for ${tokenId}: ${quickAnalysis.price_validation.price_deviation}`)
          }

        } catch (error) {
          console.error(`Real-time monitoring error for ${tokenId}:`, error)
        }
      }
    }, 60000) // Check every minute

    // Store interval ID for cleanup (in real implementation)
    // this.monitoringIntervals.set('main', monitoringInterval)
  }

  /**
   * Generate comprehensive risk report
   */
  static async generateRiskReport(tokenIds: string[]): Promise<{
    summary: any
    detailed_analysis: Map<string, ComprehensiveTokenData>
    risk_distribution: any
    recommendations: string[]
  }> {
    const detailedAnalysis = new Map<string, ComprehensiveTokenData>()
    const riskLevels = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
    
    for (const tokenId of tokenIds) {
      try {
        const analysis = await this.analyzeToken({ tokenId, includeHistorical: true })
        detailedAnalysis.set(tokenId, analysis)
        
        const riskLevel = analysis.risk_analysis.risk_level as keyof typeof riskLevels
        if (riskLevel in riskLevels) {
          riskLevels[riskLevel]++
        }
      } catch (error) {
        console.error(`Failed to analyze ${tokenId} for report:`, error)
      }
    }

    const totalTokens = tokenIds.length
    const averageRiskScore = Array.from(detailedAnalysis.values())
      .reduce((sum, data) => sum + data.risk_analysis.overall_score, 0) / detailedAnalysis.size

    const recommendations = this.generatePortfolioRecommendations(riskLevels, averageRiskScore)

    return {
      summary: {
        total_tokens_analyzed: totalTokens,
        successful_analyses: detailedAnalysis.size,
        average_risk_score: Math.round(averageRiskScore),
        timestamp: new Date().toISOString()
      },
      detailed_analysis: detailedAnalysis,
      risk_distribution: riskLevels,
      recommendations
    }
  }

  private static generatePortfolioRecommendations(riskLevels: any, averageScore: number): string[] {
    const recommendations: string[] = []

    if (riskLevels.CRITICAL > 0) {
      recommendations.push(`URGENT: ${riskLevels.CRITICAL} tokens have critical risk levels - consider immediate review`)
    }

    if (riskLevels.HIGH > riskLevels.LOW) {
      recommendations.push("Portfolio is skewed towards higher risk tokens - consider rebalancing")
    }

    if (averageScore > 70) {
      recommendations.push("Overall portfolio risk is high - diversification recommended")
    } else if (averageScore < 30) {
      recommendations.push("Portfolio appears conservative - consider some calculated risks for growth")
    }

    if (recommendations.length === 0) {
      recommendations.push("Portfolio risk profile appears balanced")
    }

    return recommendations
  }

  private static async retryApiCall<T>(
    apiCall: () => Promise<T>,
    maxRetries: number,
    delay = 1000
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt === maxRetries) {
          throw lastError
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }

    throw lastError || new Error('All retry attempts failed')
  }

  private static isCacheValid(cacheKey: string, cacheDurationMinutes: number): boolean {
    const cached = this.cache.get(cacheKey)
    if (!cached) return false

    const now = Date.now()
    const cacheAge = (now - cached.timestamp) / (1000 * 60) // in minutes
    return cacheAge < cacheDurationMinutes
  }

  /**
   * Clear cache (useful for testing or forcing fresh data)
   */
  static clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    }
  }
}
