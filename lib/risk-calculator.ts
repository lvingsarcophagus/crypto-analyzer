import type {
  TokenData,
  WalletConcentration,
  ContractSecurity,
  TradingBehavior,
  RiskFactor,
  RiskAnalysis,
} from "@/types/crypto"

export class RiskCalculator {
  private static readonly WEIGHTS = {
    market_metrics: 0.2,
    wallet_concentration: 0.2,
    tokenomics: 0.1,
    contract_security: 0.15,
    trading_behavior: 0.1,
    name_symbol_heuristics: 0.1,
    community_and_dev: 0.15,
  }

  static calculateOverallRisk(
    tokenData: TokenData,
    walletConcentration: WalletConcentration,
    contractSecurity: ContractSecurity,
    tradingBehavior: TradingBehavior,
  ): RiskAnalysis {
    const riskFactors: RiskFactor[] = []

    // Market Metrics Risk
    const marketRisk = this.calculateMarketMetricsRisk(tokenData)
    riskFactors.push(marketRisk)

    // Wallet Concentration Risk
    const concentrationRisk = this.calculateWalletConcentrationRisk(walletConcentration)
    riskFactors.push(concentrationRisk)

    // Tokenomics Risk
    const tokenomicsRisk = this.calculateTokenomicsRisk(tokenData)
    riskFactors.push(tokenomicsRisk)

    // Community and Developer Risk
    const communityAndDevRisk = this.calculateCommunityAndDeveloperRisk(tokenData)
    riskFactors.push(communityAndDevRisk)

    // Contract Security Risk
    const securityRisk = this.calculateContractSecurityRisk(contractSecurity)
    riskFactors.push(securityRisk)

    // Trading Behavior Risk
    const tradingRisk = this.calculateTradingBehaviorRisk(tradingBehavior)
    riskFactors.push(tradingRisk)

    // Name/Symbol Heuristics Risk
    const heuristicsRisk = this.calculateNameSymbolHeuristicsRisk(tokenData)
    riskFactors.push(heuristicsRisk)

    // Calculate weighted overall score
    const overallScore = riskFactors.reduce((total, factor) => {
      return total + factor.score * factor.weight
    }, 0)

    const riskLevel = this.determineRiskLevel(overallScore)
    const recommendations = this.generateRecommendations(riskFactors, riskLevel)

    return {
      token_id: tokenData.id,
      overall_score: Math.round(overallScore),
      risk_level: riskLevel,
      risk_factors: riskFactors,
      recommendations,
      last_updated: new Date().toISOString(),
      data_sources: ["CoinGecko", "Mobula", "Tokenview"],
    }
  }

  private static calculateMarketMetricsRisk(tokenData: TokenData): RiskFactor {
    let score = 50 // Base score
    const factors: string[] = []

    // Market cap rank assessment
    if (tokenData.market_cap_rank > 1000) {
      score += 30
      factors.push("Very low market cap ranking")
    } else if (tokenData.market_cap_rank > 500) {
      score += 20
      factors.push("Low market cap ranking")
    } else if (tokenData.market_cap_rank > 100) {
      score += 10
      factors.push("Medium market cap ranking")
    } else {
      score -= 10
      factors.push("High market cap ranking")
    }

    // Price volatility (24h change)
    const volatility = Math.abs(tokenData.price_change_percentage_24h)
    if (volatility > 50) {
      score += 25
      factors.push("Extreme price volatility")
    } else if (volatility > 20) {
      score += 15
      factors.push("High price volatility")
    } else if (volatility > 10) {
      score += 5
      factors.push("Moderate price volatility")
    }

    // ATH distance
    if (tokenData.ath_change_percentage < -90) {
      score += 20
      factors.push("Trading far below all-time high")
    } else if (tokenData.ath_change_percentage < -70) {
      score += 10
      factors.push("Significantly below all-time high")
    }

    return {
      category: "Market Metrics",
      score: Math.min(100, Math.max(0, score)),
      weight: this.WEIGHTS.market_metrics,
      risk_level: this.determineRiskLevel(score),
      explanation: "Assessment based on market capitalization, price volatility, and trading metrics",
      contributing_factors: factors,
    }
  }

  private static calculateWalletConcentrationRisk(concentration: WalletConcentration): RiskFactor {
    let score = 20 // Base score
    const factors: string[] = []

    if (concentration.top_10_holders_percentage > 80) {
      score += 40
      factors.push("Extremely high concentration in top 10 wallets")
    } else if (concentration.top_10_holders_percentage > 60) {
      score += 30
      factors.push("High concentration in top 10 wallets")
    } else if (concentration.top_10_holders_percentage > 40) {
      score += 20
      factors.push("Moderate concentration in top 10 wallets")
    }

    if (concentration.top_100_holders_percentage > 95) {
      score += 20
      factors.push("Nearly all tokens held by top 100 wallets")
    }

    return {
      category: "Wallet Concentration",
      score: Math.min(100, score),
      weight: this.WEIGHTS.wallet_concentration,
      risk_level: this.determineRiskLevel(score),
      explanation: "Risk assessment based on token distribution among wallet addresses",
      contributing_factors: factors,
    }
  }

  private static calculateTokenomicsRisk(tokenData: TokenData): RiskFactor {
    let score = 30 // Base score
    const factors: string[] = []

    // Supply analysis
    if (!tokenData.max_supply) {
      score += 25
      factors.push("No maximum supply limit (infinite inflation risk)")
    } else if (tokenData.circulating_supply / tokenData.max_supply < 0.5) {
      score += 15
      factors.push("Large portion of tokens not yet in circulation")
    }

    // Fully diluted valuation vs market cap
    if (tokenData.fully_diluted_valuation && tokenData.market_cap > 0) {
      const dilutionRatio = tokenData.fully_diluted_valuation / tokenData.market_cap
      if (dilutionRatio > 5) {
        score += 20
        factors.push("High dilution risk from unreleased tokens")
      } else if (dilutionRatio > 2) {
        score += 10
        factors.push("Moderate dilution risk from unreleased tokens")
      }
    }

    return {
      category: "Tokenomics",
      score: Math.min(100, score),
      weight: this.WEIGHTS.tokenomics,
      risk_level: this.determineRiskLevel(score),
      explanation: "Analysis of token supply mechanics and distribution",
      contributing_factors: factors,
    }
  }

  private static calculateCommunityAndDeveloperRisk(tokenData: TokenData): RiskFactor {
    let score = 40 // Base score
    const factors: string[] = []
    const { community_data, developer_data } = tokenData

    // Community strength
    if (community_data) {
      const totalCommunity =
        (community_data.reddit_subscribers || 0) + (community_data.telegram_channel_user_count || 0)
      if (totalCommunity < 1000) {
        score += 20
        factors.push("Very small community size")
      } else if (totalCommunity < 5000) {
        score += 10
        factors.push("Small community size")
      }
    } else {
      score += 10
      factors.push("Missing community data")
    }

    // Developer activity
    if (developer_data) {
      if (developer_data.commit_count_4_weeks < 5) {
        score += 25
        factors.push("Very low developer activity in the last month")
      } else if (developer_data.commit_count_4_weeks < 15) {
        score += 15
        factors.push("Low developer activity in the last month")
      }

      if (developer_data.pull_request_contributors < 3) {
        score += 15
        factors.push("Very few unique contributors to the codebase")
      }

      const issueRatio = developer_data.closed_issues / developer_data.total_issues
      if (developer_data.total_issues > 50 && issueRatio < 0.7) {
        score += 10
        factors.push("Low ratio of closed to open issues, suggesting poor maintenance")
      }

    } else {
      score += 25
      factors.push("Missing developer activity data")
    }

    return {
      category: "Community & Developer Activity",
      score: Math.min(100, Math.max(0, score)),
      weight: this.WEIGHTS.community_and_dev,
      risk_level: this.determineRiskLevel(score),
      explanation: "Analysis of community engagement and codebase activity",
      contributing_factors: factors,
    }
  }

  private static calculateContractSecurityRisk(security: ContractSecurity): RiskFactor {
    let score = 10 // Base score
    const factors: string[] = []

    if (!security.is_verified) {
      score += 30
      factors.push("Contract source code not verified")
    }

    if (security.has_mint_function) {
      score += 20
      factors.push("Contract has mint function (inflation risk)")
    }

    if (security.has_pause_function) {
      score += 15
      factors.push("Contract has pause function")
    }

    if (!security.ownership_renounced) {
      score += 15
      factors.push("Contract ownership not renounced")
    }

    if (security.has_proxy) {
      score += 10
      factors.push("Contract uses proxy pattern (upgrade risk)")
    }

    return {
      category: "Contract Security",
      score: Math.min(100, score),
      weight: this.WEIGHTS.contract_security,
      risk_level: this.determineRiskLevel(score),
      explanation: "Smart contract security and centralization risks",
      contributing_factors: factors,
    }
  }

  private static calculateTradingBehaviorRisk(trading: TradingBehavior): RiskFactor {
    let score = 25 // Base score
    const factors: string[] = []

    if (trading.liquidity_score < 30) {
      score += 25
      factors.push("Very low liquidity")
    } else if (trading.liquidity_score < 50) {
      score += 15
      factors.push("Low liquidity")
    }

    if (trading.price_volatility > 80) {
      score += 20
      factors.push("Extreme price volatility")
    } else if (trading.price_volatility > 50) {
      score += 10
      factors.push("High price volatility")
    }

    return {
      category: "Trading Behavior",
      score: Math.min(100, score),
      weight: this.WEIGHTS.trading_behavior,
      risk_level: this.determineRiskLevel(score),
      explanation: "Trading patterns and liquidity analysis",
      contributing_factors: factors,
    }
  }

  private static calculateNameSymbolHeuristicsRisk(tokenData: TokenData): RiskFactor {
    let score = 10 // Base score
    const factors: string[] = []

    const suspiciousPatterns = [
      /safe/i,
      /moon/i,
      /rocket/i,
      /doge/i,
      /shib/i,
      /inu/i,
      /elon/i,
      /baby/i,
      /mini/i,
      /max/i,
      /ultra/i,
      /mega/i,
    ]

  const name = (tokenData.name || "").toLowerCase()
  const symbol = (tokenData.symbol || "").toLowerCase()

    suspiciousPatterns.forEach((pattern) => {
      if (pattern.test(name) || pattern.test(symbol)) {
        score += 15
        factors.push(`Suspicious naming pattern detected`)
      }
    })

    // Check for excessive use of numbers or special characters
    if (/\d{2,}/.test(symbol) || /[^a-zA-Z0-9]/.test(symbol)) {
      score += 10
      factors.push("Unusual symbol format")
    }

    return {
      category: "Name/Symbol Heuristics",
      score: Math.min(100, score),
      weight: this.WEIGHTS.name_symbol_heuristics,
      risk_level: this.determineRiskLevel(score),
      explanation: "Pattern analysis of token name and symbol for common risk indicators",
      contributing_factors: factors,
    }
  }

  private static determineRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    if (score >= 80) return "CRITICAL"
    if (score >= 60) return "HIGH"
    if (score >= 40) return "MEDIUM"
    return "LOW"
  }

  private static generateRecommendations(riskFactors: RiskFactor[], overallRisk: string): string[] {
    const recommendations: string[] = []

    if (overallRisk === "CRITICAL") {
      recommendations.push("⚠️ AVOID: This token presents critical risks that could result in total loss")
      recommendations.push("Consider safer, more established alternatives")
    } else if (overallRisk === "HIGH") {
      recommendations.push("⚠️ HIGH RISK: Only invest what you can afford to lose completely")
      recommendations.push("Conduct thorough due diligence before investing")
    } else if (overallRisk === "MEDIUM") {
      recommendations.push("⚠️ MODERATE RISK: Exercise caution and limit position size")
      recommendations.push("Monitor closely for changes in risk factors")
    } else {
      recommendations.push("✅ LOWER RISK: Appears relatively safer but still monitor regularly")
      recommendations.push("Consider as part of a diversified portfolio")
    }

    // Add specific recommendations based on risk factors
    riskFactors.forEach((factor) => {
      if (factor.risk_level === "CRITICAL" || factor.risk_level === "HIGH") {
        if (factor.category === "Wallet Concentration") {
          recommendations.push("Monitor large wallet movements that could impact price")
        }
        if (factor.category === "Contract Security") {
          recommendations.push("Verify contract security through multiple audit sources")
        }
        if (factor.category === "Trading Behavior") {
          recommendations.push("Be cautious of low liquidity - exits may be difficult")
        }
        if (factor.category === "Community & Developer Activity" && factor.risk_level === "CRITICAL") {
          recommendations.push("Project appears to be abandoned or have very low engagement. High risk.")
        }
      }
    })

    return recommendations
  }
}
