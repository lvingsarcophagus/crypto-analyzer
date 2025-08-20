// Core data types for crypto risk analysis
export interface TokenData {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  last_updated: string
}

export interface WalletConcentration {
  top_10_holders_percentage: number
  top_100_holders_percentage: number
  whale_concentration_risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
}

export interface ContractSecurity {
  is_verified: boolean
  has_proxy: boolean
  has_mint_function: boolean
  has_pause_function: boolean
  ownership_renounced: boolean
  security_score: number
}

export interface TradingBehavior {
  volume_24h: number
  volume_change_24h: number
  liquidity_score: number
  price_volatility: number
  trading_activity_risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
}

export interface RiskFactor {
  category: string
  score: number
  weight: number
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  explanation: string
  contributing_factors: string[]
}

export interface RiskAnalysis {
  token_id: string
  overall_score: number
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  risk_factors: RiskFactor[]
  recommendations: string[]
  last_updated: string
  data_sources: string[]
}

export interface TokenSearchResult {
  id: string
  symbol: string
  name: string
  image: string
  market_cap_rank: number
  current_price: number
}
