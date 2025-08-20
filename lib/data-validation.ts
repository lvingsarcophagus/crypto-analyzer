// Cross-source data validation system
export interface DataSource {
  name: string
  priority: number
  reliability_score: number
  last_updated: string
  status: "active" | "degraded" | "offline"
}

export interface ValidationResult {
  field: string
  sources: Record<string, any>
  consensus_value: any
  confidence_score: number
  discrepancies: string[]
  validation_status: "valid" | "warning" | "error"
  resolution_method: string
}

export interface CrossValidationReport {
  token_id: string
  timestamp: string
  overall_confidence: number
  validation_results: ValidationResult[]
  data_quality_score: number
  anomalies_detected: string[]
  recommendations: string[]
}

export class DataValidator {
  private static readonly DATA_SOURCES: DataSource[] = [
    { name: "CoinGecko", priority: 1, reliability_score: 0.95, last_updated: "", status: "active" },
    { name: "Mobula", priority: 2, reliability_score: 0.88, last_updated: "", status: "active" },
    { name: "Tokenview", priority: 3, reliability_score: 0.82, last_updated: "", status: "active" },
    { name: "CoinMarketCap", priority: 4, reliability_score: 0.9, last_updated: "", status: "active" },
  ]

  private static readonly VALIDATION_THRESHOLDS = {
    PRICE_VARIANCE: 0.05, // 5% variance allowed
    MARKET_CAP_VARIANCE: 0.1, // 10% variance allowed
    VOLUME_VARIANCE: 0.15, // 15% variance allowed
    SUPPLY_VARIANCE: 0.02, // 2% variance allowed
    MIN_SOURCES: 2, // Minimum sources required for validation
    CONFIDENCE_THRESHOLD: 0.7, // Minimum confidence for valid data
  }

  static async validateTokenData(tokenId: string, sourceData: Record<string, any>): Promise<CrossValidationReport> {
    const validationResults: ValidationResult[] = []
    const anomalies: string[] = []

    // Validate critical fields
    const criticalFields = ["current_price", "market_cap", "total_volume", "circulating_supply", "total_supply"]

    for (const field of criticalFields) {
      const validation = await this.validateField(field, sourceData, tokenId)
      validationResults.push(validation)

      if (validation.validation_status === "error") {
        anomalies.push(`Critical discrepancy in ${field}`)
      }
    }

    // Calculate overall confidence
    const overallConfidence = this.calculateOverallConfidence(validationResults)

    // Calculate data quality score
    const dataQualityScore = this.calculateDataQualityScore(validationResults, sourceData)

    // Detect additional anomalies
    const additionalAnomalies = await this.detectAnomalies(tokenId, sourceData, validationResults)
    anomalies.push(...additionalAnomalies)

    // Generate recommendations
    const recommendations = this.generateValidationRecommendations(validationResults, overallConfidence)

    return {
      token_id: tokenId,
      timestamp: new Date().toISOString(),
      overall_confidence: overallConfidence,
      validation_results: validationResults,
      data_quality_score: dataQualityScore,
      anomalies_detected: anomalies,
      recommendations,
    }
  }

  private static async validateField(
    field: string,
    sourceData: Record<string, any>,
    tokenId: string,
  ): Promise<ValidationResult> {
    const sources: Record<string, any> = {}
    const values: number[] = []

    // Extract values from each source
    for (const [sourceName, data] of Object.entries(sourceData)) {
      if (data && data[field] !== undefined && data[field] !== null) {
        sources[sourceName] = data[field]
        if (typeof data[field] === "number") {
          values.push(data[field])
        }
      }
    }

    if (values.length < this.VALIDATION_THRESHOLDS.MIN_SOURCES) {
      return {
        field,
        sources,
        consensus_value: null,
        confidence_score: 0,
        discrepancies: [`Insufficient data sources (${values.length} < ${this.VALIDATION_THRESHOLDS.MIN_SOURCES})`],
        validation_status: "error",
        resolution_method: "insufficient_data",
      }
    }

    // Calculate consensus value and variance
    const { consensusValue, variance, discrepancies } = this.calculateConsensus(field, values, sources)

    // Determine validation status
    const validationStatus = this.determineValidationStatus(field, variance, values.length)

    // Calculate confidence score
    const confidenceScore = this.calculateFieldConfidence(field, variance, values.length, sources)

    return {
      field,
      sources,
      consensus_value: consensusValue,
      confidence_score: confidenceScore,
      discrepancies,
      validation_status: validationStatus,
      resolution_method: this.getResolutionMethod(validationStatus, discrepancies.length),
    }
  }

  private static calculateConsensus(
    field: string,
    values: number[],
    sources: Record<string, any>,
  ): { consensusValue: number; variance: number; discrepancies: string[] } {
    if (values.length === 0) {
      return { consensusValue: 0, variance: 1, discrepancies: ["No valid values found"] }
    }

    // Use weighted average based on source reliability
    let weightedSum = 0
    let totalWeight = 0
    const discrepancies: string[] = []

    for (const [sourceName, value] of Object.entries(sources)) {
      const source = this.DATA_SOURCES.find((s) => s.name === sourceName)
      const weight = source ? source.reliability_score : 0.5

      if (typeof value === "number") {
        weightedSum += value * weight
        totalWeight += weight
      }
    }

    const consensusValue = totalWeight > 0 ? weightedSum / totalWeight : values[0]

    // Calculate variance
    const variance = this.calculateVariance(values, consensusValue)

    // Check for outliers
    for (const [sourceName, value] of Object.entries(sources)) {
      if (typeof value === "number") {
        const deviation = Math.abs(value - consensusValue) / consensusValue
        const threshold = this.getVarianceThreshold(field)

        if (deviation > threshold) {
          discrepancies.push(`${sourceName}: ${value} deviates by ${(deviation * 100).toFixed(1)}% from consensus`)
        }
      }
    }

    return { consensusValue, variance, discrepancies }
  }

  private static calculateVariance(values: number[], consensus: number): number {
    if (values.length <= 1) return 0

    const squaredDifferences = values.map((value) => Math.pow((value - consensus) / consensus, 2))
    return Math.sqrt(squaredDifferences.reduce((a, b) => a + b, 0) / values.length)
  }

  private static getVarianceThreshold(field: string): number {
    switch (field) {
      case "current_price":
        return this.VALIDATION_THRESHOLDS.PRICE_VARIANCE
      case "market_cap":
        return this.VALIDATION_THRESHOLDS.MARKET_CAP_VARIANCE
      case "total_volume":
        return this.VALIDATION_THRESHOLDS.VOLUME_VARIANCE
      case "circulating_supply":
      case "total_supply":
        return this.VALIDATION_THRESHOLDS.SUPPLY_VARIANCE
      default:
        return 0.1 // 10% default variance
    }
  }

  private static determineValidationStatus(
    field: string,
    variance: number,
    sourceCount: number,
  ): "valid" | "warning" | "error" {
    const threshold = this.getVarianceThreshold(field)

    if (sourceCount < this.VALIDATION_THRESHOLDS.MIN_SOURCES) {
      return "error"
    }

    if (variance > threshold * 2) {
      return "error"
    } else if (variance > threshold) {
      return "warning"
    }

    return "valid"
  }

  private static calculateFieldConfidence(
    field: string,
    variance: number,
    sourceCount: number,
    sources: Record<string, any>,
  ): number {
    let confidence = 0.5 // Base confidence

    // Source count bonus
    confidence += Math.min(sourceCount / 4, 0.25) // Up to 25% bonus for 4+ sources

    // Variance penalty
    const threshold = this.getVarianceThreshold(field)
    const variancePenalty = Math.min(variance / threshold, 1) * 0.3
    confidence -= variancePenalty

    // Source reliability bonus
    let reliabilitySum = 0
    let reliabilityCount = 0

    for (const sourceName of Object.keys(sources)) {
      const source = this.DATA_SOURCES.find((s) => s.name === sourceName)
      if (source) {
        reliabilitySum += source.reliability_score
        reliabilityCount++
      }
    }

    if (reliabilityCount > 0) {
      const avgReliability = reliabilitySum / reliabilityCount
      confidence += (avgReliability - 0.5) * 0.25 // Up to 12.5% bonus for high reliability
    }

    return Math.max(0, Math.min(1, confidence))
  }

  private static getResolutionMethod(status: "valid" | "warning" | "error", discrepancyCount: number): string {
    if (status === "valid") {
      return "consensus_agreement"
    } else if (status === "warning") {
      return discrepancyCount > 1 ? "weighted_average" : "majority_consensus"
    } else {
      return "manual_review_required"
    }
  }

  private static calculateOverallConfidence(validationResults: ValidationResult[]): number {
    if (validationResults.length === 0) return 0

    const weights = {
      current_price: 0.3,
      market_cap: 0.25,
      total_volume: 0.2,
      circulating_supply: 0.15,
      total_supply: 0.1,
    }

    let weightedConfidence = 0
    let totalWeight = 0

    for (const result of validationResults) {
      const weight = weights[result.field as keyof typeof weights] || 0.1
      weightedConfidence += result.confidence_score * weight
      totalWeight += weight
    }

    return totalWeight > 0 ? weightedConfidence / totalWeight : 0
  }

  private static calculateDataQualityScore(
    validationResults: ValidationResult[],
    sourceData: Record<string, any>,
  ): number {
    let qualityScore = 0.5 // Base score

    // Completeness score
    const totalFields = 10 // Expected number of fields
    const availableFields = Object.keys(sourceData).reduce((count, source) => {
      return count + (sourceData[source] ? Object.keys(sourceData[source]).length : 0)
    }, 0)
    const completeness = Math.min(availableFields / (totalFields * Object.keys(sourceData).length), 1)
    qualityScore += completeness * 0.3

    // Validation score
    const validResults = validationResults.filter((r) => r.validation_status === "valid").length
    const validationScore = validResults / validationResults.length
    qualityScore += validationScore * 0.4

    // Freshness score (mock - would check actual timestamps)
    const freshnessScore = 0.9 // Assume data is relatively fresh
    qualityScore += freshnessScore * 0.2

    return Math.max(0, Math.min(1, qualityScore))
  }

  private static async detectAnomalies(
    tokenId: string,
    sourceData: Record<string, any>,
    validationResults: ValidationResult[],
  ): Promise<string[]> {
    const anomalies: string[] = []

    // Check for impossible values
    for (const [sourceName, data] of Object.entries(sourceData)) {
      if (data) {
        if (data.current_price && data.current_price < 0) {
          anomalies.push(`${sourceName}: Negative price detected`)
        }

        if (data.market_cap && data.current_price && data.circulating_supply) {
          const calculatedMarketCap = data.current_price * data.circulating_supply
          const deviation = Math.abs(calculatedMarketCap - data.market_cap) / data.market_cap

          if (deviation > 0.1) {
            // 10% deviation threshold
            anomalies.push(`${sourceName}: Market cap calculation mismatch`)
          }
        }

        if (data.total_supply && data.circulating_supply && data.circulating_supply > data.total_supply) {
          anomalies.push(`${sourceName}: Circulating supply exceeds total supply`)
        }
      }
    }

    // Check for temporal anomalies (mock implementation)
    const priceResults = validationResults.find((r) => r.field === "current_price")
    if (priceResults && priceResults.confidence_score < 0.3) {
      anomalies.push("Significant price discrepancies across sources")
    }

    return anomalies
  }

  private static generateValidationRecommendations(
    validationResults: ValidationResult[],
    overallConfidence: number,
  ): string[] {
    const recommendations: string[] = []

    if (overallConfidence < 0.5) {
      recommendations.push("⚠️ LOW CONFIDENCE: Data validation shows significant discrepancies")
      recommendations.push("Consider using additional data sources for verification")
    } else if (overallConfidence < 0.7) {
      recommendations.push("⚠️ MODERATE CONFIDENCE: Some data inconsistencies detected")
      recommendations.push("Monitor for data quality improvements")
    } else {
      recommendations.push("✅ HIGH CONFIDENCE: Data validation successful")
    }

    // Field-specific recommendations
    const errorFields = validationResults.filter((r) => r.validation_status === "error")
    if (errorFields.length > 0) {
      recommendations.push(`Manual review required for: ${errorFields.map((f) => f.field).join(", ")}`)
    }

    const warningFields = validationResults.filter((r) => r.validation_status === "warning")
    if (warningFields.length > 0) {
      recommendations.push(`Monitor data quality for: ${warningFields.map((f) => f.field).join(", ")}`)
    }

    // Source-specific recommendations
    const lowConfidenceResults = validationResults.filter((r) => r.confidence_score < 0.5)
    if (lowConfidenceResults.length > 0) {
      recommendations.push("Consider excluding unreliable data sources from analysis")
    }

    return recommendations
  }

  static async validateMultipleTokens(tokenIds: string[]): Promise<CrossValidationReport[]> {
    const reports: CrossValidationReport[] = []

    for (const tokenId of tokenIds) {
      try {
        // Mock fetching data from multiple sources
        const sourceData = await this.fetchMultiSourceData(tokenId)
        const report = await this.validateTokenData(tokenId, sourceData)
        reports.push(report)
      } catch (error) {
        console.error(`Validation failed for token ${tokenId}:`, error)
      }
    }

    return reports
  }

  private static async fetchMultiSourceData(tokenId: string): Promise<Record<string, any>> {
    // Mock implementation - in real app, this would fetch from actual APIs
    const mockData = {
      CoinGecko: {
        current_price: 50000 + Math.random() * 1000,
        market_cap: 1000000000 + Math.random() * 100000000,
        total_volume: 50000000 + Math.random() * 10000000,
        circulating_supply: 19000000 + Math.random() * 100000,
        total_supply: 21000000,
      },
      Mobula: {
        current_price: 50000 + Math.random() * 1200,
        market_cap: 1000000000 + Math.random() * 120000000,
        total_volume: 50000000 + Math.random() * 12000000,
        circulating_supply: 19000000 + Math.random() * 120000,
        total_supply: 21000000,
      },
      Tokenview: {
        current_price: 50000 + Math.random() * 800,
        market_cap: 1000000000 + Math.random() * 80000000,
        total_volume: 50000000 + Math.random() * 8000000,
        circulating_supply: 19000000 + Math.random() * 80000,
        total_supply: 21000000,
      },
    }

    return mockData
  }
}
