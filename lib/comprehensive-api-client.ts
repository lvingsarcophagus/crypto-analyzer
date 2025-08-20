// Comprehensive Multi-API Integration for Crypto Risk Analysis
// Using all 4 API keys: Moralis, Mobula, Tokenview, CoinGecko

import Moralis from 'moralis'
import axios from 'axios'

export class ComprehensiveAPIClient {
  private static isInitialized = false
  
  // API Configuration
  private static readonly APIS = {
    COINGECKO: {
      baseUrl: 'https://api.coingecko.com/api/v3',
      key: process.env.COINGECKO_API_KEY!,
      headers: { 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY! }
    },
    MORALIS: {
      baseUrl: 'https://deep-index.moralis.io/api/v2.2',
      key: process.env.MORALIS_API_KEY!,
      headers: { 'X-API-Key': process.env.MORALIS_API_KEY! }
    },
    MOBULA: {
      baseUrl: 'https://api.mobula.io/api/1',
      key: process.env.MOBULA_API_KEY!,
      headers: { 'Authorization': process.env.MOBULA_API_KEY! }
    },
    TOKENVIEW: {
      baseUrl: 'https://services.tokenview.io/vw',
      key: process.env.TOKENVIEW_API_KEY!
    }
  }

  // Rate limiting
  private static lastRequest = new Map<string, number>()
  
  static async initialize() {
    if (!this.isInitialized) {
      try {
        await Moralis.start({
          apiKey: this.APIS.MORALIS.key
        })
        this.isInitialized = true
        console.log('✅ All APIs initialized successfully')
      } catch (error) {
        console.error('❌ Error initializing Moralis:', error)
      }
    }
  }

  private static async rateLimit(apiName: string, delayMs = 1000) {
    const now = Date.now()
    const lastReq = this.lastRequest.get(apiName) || 0
    const timeDiff = now - lastReq
    
    if (timeDiff < delayMs) {
      await new Promise(resolve => setTimeout(resolve, delayMs - timeDiff))
    }
    
    this.lastRequest.set(apiName, Date.now())
  }

  // 1. CoinGecko - Primary market data and token information
  static async getCoinGeckoData(tokenId: string) {
    try {
      await this.rateLimit('COINGECKO', 1000)
      
      // Smart token mapping
      const mappedId = this.mapTokenId(tokenId)
      
      const response = await axios.get(
        `${this.APIS.COINGECKO.baseUrl}/coins/${mappedId}`,
        {
          headers: this.APIS.COINGECKO.headers,
          params: {
            localization: false,
            tickers: false,
            market_data: true,
            community_data: true,
            developer_data: true,
            sparkline: false
          }
        }
      )
      
      console.log(`✅ CoinGecko data retrieved for ${mappedId}`)
      return response.data
    } catch (error) {
      console.error('❌ CoinGecko API error:', error)
      throw error
    }
  }

  // 2. Moralis - Contract security and holder analysis
  static async getMoralisContractData(tokenAddress: string, chain = 'eth') {
    try {
      await this.initialize()
      await this.rateLimit('MORALIS', 500)

      // Get token metadata
      const metadata = await Moralis.EvmApi.token.getTokenMetadata({
        addresses: [tokenAddress],
        chain
      })

      // Get token holders
      const holders = await Moralis.EvmApi.token.getTokenOwners({
        tokenAddress,
        chain,
        limit: 100
      })

      console.log(`✅ Moralis contract data retrieved for ${tokenAddress}`)
      return {
        metadata: metadata.raw,
        holders: holders.raw,
        data_source: 'moralis_web3_data'
      }
    } catch (error) {
      console.error('❌ Moralis API error:', error)
      return {
        metadata: null,
        holders: null,
        data_source: 'moralis_unavailable',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // 3. Mobula - Advanced trading metrics and market analysis
  static async getMobulaMarketData(tokenSymbol: string) {
    try {
      await this.rateLimit('MOBULA', 800)
      
      const response = await axios.get(
        `${this.APIS.MOBULA.baseUrl}/market/data`,
        {
          headers: this.APIS.MOBULA.headers,
          params: {
            asset: tokenSymbol.toLowerCase()
          }
        }
      )

      console.log(`✅ Mobula market data retrieved for ${tokenSymbol}`)
      return {
        ...response.data,
        data_source: 'mobula_market_data'
      }
    } catch (error) {
      console.error('❌ Mobula API error:', error)
      return {
        data_source: 'mobula_unavailable',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // 4. Tokenview - Blockchain analytics and transaction data
  static async getTokenviewData(tokenSymbol: string) {
    try {
      await this.rateLimit('TOKENVIEW', 1200)
      
      const symbol = tokenSymbol.toLowerCase()
      
      // Get basic blockchain stats
      const response = await axios.get(
        `${this.APIS.TOKENVIEW.baseUrl}/${symbol}/stats`,
        {
          params: {
            apikey: this.APIS.TOKENVIEW.key
          }
        }
      )

      console.log(`✅ Tokenview data retrieved for ${tokenSymbol}`)
      return {
        ...response.data,
        data_source: 'tokenview_blockchain_data'
      }
    } catch (error) {
      console.error('❌ Tokenview API error:', error)
      return {
        data_source: 'tokenview_unavailable',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Comprehensive analysis combining all APIs
  static async getComprehensiveAnalysis(tokenId: string, tokenAddress?: string) {
    console.log(`🔍 Starting comprehensive analysis for ${tokenId}`)
    
    try {
      // Run all API calls in parallel for efficiency
      const [coinGeckoData, moralisData, mobulaData, tokenviewData] = await Promise.allSettled([
        this.getCoinGeckoData(tokenId),
        tokenAddress ? this.getMoralisContractData(tokenAddress) : Promise.resolve(null),
        this.getMobulaMarketData(tokenId),
        this.getTokenviewData(tokenId)
      ])

      const result = {
        basic_info: coinGeckoData.status === 'fulfilled' ? coinGeckoData.value : null,
        contract_analysis: moralisData.status === 'fulfilled' ? moralisData.value : null,
        market_analysis: mobulaData.status === 'fulfilled' ? mobulaData.value : null,
        blockchain_analysis: tokenviewData.status === 'fulfilled' ? tokenviewData.value : null,
        analysis_metadata: {
          timestamp: new Date().toISOString(),
          apis_used: ['CoinGecko', 'Moralis', 'Mobula', 'Tokenview'],
          success_count: [coinGeckoData, moralisData, mobulaData, tokenviewData]
            .filter(result => result.status === 'fulfilled').length,
          token_analyzed: tokenId,
          contract_address: tokenAddress || null
        }
      }

      console.log(`✅ Comprehensive analysis completed for ${tokenId}`)
      console.log(`📊 APIs successful: ${result.analysis_metadata.success_count}/4`)
      
      return result
    } catch (error) {
      console.error('❌ Comprehensive analysis failed:', error)
      throw error
    }
  }

  // Helper method for token ID mapping
  private static mapTokenId(tokenId: string): string {
    const mappings: Record<string, string> = {
      'btc': 'bitcoin',
      'eth': 'ethereum',
      'ada': 'cardano',
      'dot': 'polkadot',
      'link': 'chainlink',
      'uni': 'uniswap',
      'aave': 'aave',
      'comp': 'compound-governance-token',
      'mkr': 'maker',
      'snx': 'havven'
    }
    
    return mappings[tokenId.toLowerCase()] || tokenId.toLowerCase()
  }

  // Calculate enhanced risk metrics
  static calculateEnhancedRisk(comprehensiveData: any) {
    const risks = {
      market_risk: 0,
      security_risk: 0,
      liquidity_risk: 0,
      concentration_risk: 0
    }

    // Market risk from CoinGecko
    if (comprehensiveData.basic_info) {
      const marketData = comprehensiveData.basic_info.market_data
      if (marketData) {
        const volatility = Math.abs(marketData.price_change_percentage_24h || 0)
        const marketCapRank = comprehensiveData.basic_info.market_cap_rank || 999
        
        risks.market_risk = Math.min(100, (volatility / 2) + (marketCapRank > 100 ? 30 : 0))
      }
    }

    // Security risk from Moralis
    if (comprehensiveData.contract_analysis?.metadata) {
      risks.security_risk = 20 // Base security risk for smart contracts
    }

    // Liquidity risk from Mobula
    if (comprehensiveData.market_analysis) {
      const volume = comprehensiveData.market_analysis.volume_24h || 0
      risks.liquidity_risk = volume < 1000000 ? 40 : 15
    }

    // Concentration risk from holder analysis
    if (comprehensiveData.contract_analysis?.holders) {
      const holderCount = comprehensiveData.contract_analysis.holders.result?.length || 0
      risks.concentration_risk = holderCount < 100 ? 50 : 20
    }

    const overall_score = (risks.market_risk + risks.security_risk + risks.liquidity_risk + risks.concentration_risk) / 4
    
    return {
      overall_score: Math.round(overall_score),
      risk_level: overall_score < 25 ? 'LOW' : overall_score < 50 ? 'MEDIUM' : overall_score < 75 ? 'HIGH' : 'CRITICAL',
      risk_breakdown: risks,
      confidence_score: comprehensiveData.analysis_metadata.success_count * 25
    }
  }
}
