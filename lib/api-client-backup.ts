// Basic API client for backward compatibility with existing code
export class CryptoAPIClient {
  private static readonly COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"
  private static readonly MOBULA_BASE_URL = "https://api.mobula.io/api/1"

  static async searchTokens(query: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`)
      const data = await response.json()
      return data.coins || []
    } catch (error) {
      console.error("Error searching tokens:", error)
      return []
    }
  }

  static async getTokenData(tokenId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.COINGECKO_BASE_URL}/coins/${tokenId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
      )
      return await response.json()
    } catch (error) {
      console.error("Error fetching token data:", error)
      throw error
    }
  }

  static async getMarketData(tokenIds: string[]): Promise<any[]> {
    try {
      const ids = tokenIds.join(",")
      const response = await fetch(
        `${this.COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`,
      )
      return await response.json()
    } catch (error) {
      console.error("Error fetching market data:", error)
      return []
    }
  }

  // Mock function for wallet concentration data (would integrate with actual blockchain APIs)
  static async getWalletConcentration(tokenAddress: string): Promise<any> {
    // This would integrate with services like Tokenview, Etherscan, etc.
    // For now, returning mock data
    return {
      top_10_holders_percentage: Math.random() * 80 + 10,
      top_100_holders_percentage: Math.random() * 20 + 80,
      whale_concentration_risk: "MEDIUM",
    }
  }

  // Mock function for contract security data (would integrate with security audit APIs)
  static async getContractSecurity(tokenAddress: string): Promise<any> {
    // This would integrate with services like GoPlus, Honeypot.is, etc.
    // For now, returning mock data
    return {
      is_verified: Math.random() > 0.3,
      has_proxy: Math.random() > 0.7,
      has_mint_function: Math.random() > 0.6,
      has_pause_function: Math.random() > 0.8,
      ownership_renounced: Math.random() > 0.4,
      security_score: Math.random() * 100,
    }
  }

  static async getTradingBehavior(tokenId: string): Promise<any> {
    // This would analyze trading patterns from DEX data
    // For now, returning mock data based on market data
    return {
      volume_24h: Math.random() * 1000000,
      volume_change_24h: (Math.random() - 0.5) * 200,
      liquidity_score: Math.random() * 100,
      price_volatility: Math.random() * 100,
      trading_activity_risk: "MEDIUM",
    }
  }
}
