// Advanced token search and resolution system
export interface TokenIdentifier {
  type: "symbol" | "name" | "contract_address" | "coingecko_id"
  value: string
  confidence: number
}

export interface ResolvedToken {
  id: string
  symbol: string
  name: string
  contract_address?: string
  image?: string
  market_cap_rank?: number
  current_price?: number
  platforms?: Record<string, string>
  confidence_score: number
  resolution_method: string
  alternative_matches?: ResolvedToken[]
}

export interface SearchFilters {
  min_market_cap?: number
  max_market_cap?: number
  categories?: string[]
  platforms?: string[]
  exclude_stablecoins?: boolean
  exclude_meme_coins?: boolean
  min_volume_24h?: number
}

export class TokenResolver {
  private static searchCache = new Map<string, { results: ResolvedToken[]; timestamp: number }>()
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static async resolveToken(query: string, filters?: SearchFilters): Promise<ResolvedToken[]> {
    // Check cache first
    const cacheKey = `${query}_${JSON.stringify(filters || {})}`
    const cached = this.searchCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.results
    }

    try {
      // Identify what type of query this is
      const identifiers = this.analyzeQuery(query)

      // Search across multiple strategies
      const searchResults = await Promise.all([
        this.searchByExactMatch(query, filters),
        this.searchByFuzzyMatch(query, filters),
        this.searchByContractAddress(query),
        this.searchByAlternativeNames(query, filters),
      ])

      // Combine and deduplicate results
      const combinedResults = this.combineSearchResults(searchResults.flat())

      // Score and rank results
      const rankedResults = this.rankSearchResults(combinedResults, query)

      // Cache results
      this.searchCache.set(cacheKey, {
        results: rankedResults,
        timestamp: Date.now(),
      })

      return rankedResults
    } catch (error) {
      console.error("Token resolution failed:", error)
      return []
    }
  }

  private static analyzeQuery(query: string): TokenIdentifier[] {
    const identifiers: TokenIdentifier[] = []
    const cleanQuery = query.trim().toLowerCase()

    // Check if it's a contract address (Ethereum-like)
    if (/^0x[a-fA-F0-9]{40}$/.test(query)) {
      identifiers.push({
        type: "contract_address",
        value: query.toLowerCase(),
        confidence: 0.95,
      })
    }

    // Check if it's a symbol (2-10 characters, mostly letters)
    if (/^[a-zA-Z]{2,10}$/.test(cleanQuery)) {
      identifiers.push({
        type: "symbol",
        value: cleanQuery,
        confidence: 0.8,
      })
    }

    // Check if it's a CoinGecko ID format
    if (/^[a-z0-9-]+$/.test(cleanQuery) && cleanQuery.length > 3) {
      identifiers.push({
        type: "coingecko_id",
        value: cleanQuery,
        confidence: 0.7,
      })
    }

    // Always consider it as a potential name
    identifiers.push({
      type: "name",
      value: query,
      confidence: 0.6,
    })

    return identifiers.sort((a, b) => b.confidence - a.confidence)
  }

  private static async searchByExactMatch(query: string, filters?: SearchFilters): Promise<ResolvedToken[]> {
    try {
      // Search CoinGecko for exact matches
      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`)
      const data = await response.json()

      const results: ResolvedToken[] = []

      // Process coin results
      if (data.coins) {
        for (const coin of data.coins.slice(0, 10)) {
          if (this.matchesFilters(coin, filters)) {
            results.push({
              id: coin.id,
              symbol: coin.symbol.toUpperCase(),
              name: coin.name,
              image: coin.large || coin.thumb,
              market_cap_rank: coin.market_cap_rank,
              confidence_score: this.calculateExactMatchConfidence(query, coin),
              resolution_method: "exact_match",
            })
          }
        }
      }

      return results
    } catch (error) {
      console.error("Exact match search failed:", error)
      return []
    }
  }

  private static async searchByFuzzyMatch(query: string, filters?: SearchFilters): Promise<ResolvedToken[]> {
    try {
      // Get a broader set of results for fuzzy matching
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1`,
      )
      const coins = await response.json()

      const results: ResolvedToken[] = []
      const queryLower = query.toLowerCase()

      for (const coin of coins) {
        if (!this.matchesFilters(coin, filters)) continue

        const fuzzyScore = this.calculateFuzzyScore(queryLower, coin)

        if (fuzzyScore > 0.3) {
          // Minimum fuzzy match threshold
          results.push({
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            image: coin.image,
            market_cap_rank: coin.market_cap_rank,
            current_price: coin.current_price,
            confidence_score: fuzzyScore,
            resolution_method: "fuzzy_match",
          })
        }
      }

      return results.sort((a, b) => b.confidence_score - a.confidence_score).slice(0, 10)
    } catch (error) {
      console.error("Fuzzy match search failed:", error)
      return []
    }
  }

  private static async searchByContractAddress(query: string): Promise<ResolvedToken[]> {
    if (!/^0x[a-fA-F0-9]{40}$/.test(query)) {
      return []
    }

    try {
      // Search by contract address using CoinGecko
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${query}`)

      if (response.ok) {
        const coin = await response.json()
        return [
          {
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            contract_address: query.toLowerCase(),
            image: coin.image?.large,
            market_cap_rank: coin.market_cap_rank,
            current_price: coin.market_data?.current_price?.usd,
            confidence_score: 0.95,
            resolution_method: "contract_address",
          },
        ]
      }

      return []
    } catch (error) {
      console.error("Contract address search failed:", error)
      return []
    }
  }

  private static async searchByAlternativeNames(query: string, filters?: SearchFilters): Promise<ResolvedToken[]> {
    // Search for tokens that might have alternative names or common misspellings
    const alternativeQueries = this.generateAlternativeQueries(query)
    const results: ResolvedToken[] = []

    for (const altQuery of alternativeQueries) {
      try {
        const altResults = await this.searchByExactMatch(altQuery, filters)
        results.push(
          ...altResults.map((result) => ({
            ...result,
            confidence_score: result.confidence_score * 0.8, // Reduce confidence for alternative matches
            resolution_method: "alternative_name",
          })),
        )
      } catch (error) {
        // Continue with other alternatives
      }
    }

    return results
  }

  private static generateAlternativeQueries(query: string): string[] {
    const alternatives: string[] = []
    const queryLower = query.toLowerCase()

    // Common abbreviations and expansions
    const commonMappings: Record<string, string[]> = {
      btc: ["bitcoin"],
      eth: ["ethereum"],
      bnb: ["binance coin", "binancecoin"],
      ada: ["cardano"],
      dot: ["polkadot"],
      sol: ["solana"],
      matic: ["polygon"],
      avax: ["avalanche"],
      bitcoin: ["btc"],
      ethereum: ["eth"],
      "binance coin": ["bnb"],
      cardano: ["ada"],
      polkadot: ["dot"],
      solana: ["sol"],
      polygon: ["matic"],
      avalanche: ["avax"],
    }

    if (commonMappings[queryLower]) {
      alternatives.push(...commonMappings[queryLower])
    }

    // Find reverse mappings
    for (const [key, values] of Object.entries(commonMappings)) {
      if (values.includes(queryLower)) {
        alternatives.push(key)
      }
    }

    // Remove duplicates and original query
    return [...new Set(alternatives)].filter((alt) => alt !== queryLower)
  }

  private static calculateExactMatchConfidence(query: string, coin: any): number {
    const queryLower = query.toLowerCase()
    let confidence = 0.5

    // Exact symbol match
    if (coin.symbol.toLowerCase() === queryLower) {
      confidence += 0.4
    }

    // Exact name match
    if (coin.name.toLowerCase() === queryLower) {
      confidence += 0.3
    }

    // Exact ID match
    if (coin.id === queryLower) {
      confidence += 0.2
    }

    // Market cap rank bonus (higher rank = more confidence)
    if (coin.market_cap_rank) {
      if (coin.market_cap_rank <= 10) confidence += 0.1
      else if (coin.market_cap_rank <= 100) confidence += 0.05
    }

    return Math.min(1.0, confidence)
  }

  private static calculateFuzzyScore(query: string, coin: any): number {
    const name = coin.name.toLowerCase()
    const symbol = coin.symbol.toLowerCase()
    const id = coin.id.toLowerCase()

    // Calculate similarity scores
    const nameScore = this.stringSimilarity(query, name)
    const symbolScore = this.stringSimilarity(query, symbol)
    const idScore = this.stringSimilarity(query, id)

    // Weight the scores (symbol matches are more important for short queries)
    let weightedScore = 0
    if (query.length <= 5) {
      weightedScore = symbolScore * 0.6 + nameScore * 0.3 + idScore * 0.1
    } else {
      weightedScore = nameScore * 0.5 + symbolScore * 0.3 + idScore * 0.2
    }

    // Market cap rank bonus
    if (coin.market_cap_rank) {
      const rankBonus = Math.max(0, (1000 - coin.market_cap_rank) / 1000) * 0.1
      weightedScore += rankBonus
    }

    return Math.min(1.0, weightedScore)
  }

  private static stringSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein distance-based similarity
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  private static combineSearchResults(results: ResolvedToken[]): ResolvedToken[] {
    const combined = new Map<string, ResolvedToken>()

    for (const result of results) {
      const existing = combined.get(result.id)

      if (!existing || result.confidence_score > existing.confidence_score) {
        // Keep the result with higher confidence, but merge alternative matches
        if (existing && existing.confidence_score > 0.5) {
          result.alternative_matches = result.alternative_matches || []
          result.alternative_matches.push(existing)
        }
        combined.set(result.id, result)
      } else if (existing && result.confidence_score > 0.5) {
        // Add as alternative match
        existing.alternative_matches = existing.alternative_matches || []
        existing.alternative_matches.push(result)
      }
    }

    return Array.from(combined.values())
  }

  private static rankSearchResults(results: ResolvedToken[], originalQuery: string): ResolvedToken[] {
    return results
      .sort((a, b) => {
        // Primary sort by confidence score
        if (Math.abs(a.confidence_score - b.confidence_score) > 0.1) {
          return b.confidence_score - a.confidence_score
        }

        // Secondary sort by market cap rank (lower rank = higher priority)
        if (a.market_cap_rank && b.market_cap_rank) {
          return a.market_cap_rank - b.market_cap_rank
        }

        // Tertiary sort by exact matches
        const queryLower = originalQuery.toLowerCase()
        const aExact = a.symbol.toLowerCase() === queryLower || a.name.toLowerCase() === queryLower
        const bExact = b.symbol.toLowerCase() === queryLower || b.name.toLowerCase() === queryLower

        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1

        return 0
      })
      .slice(0, 20) // Limit to top 20 results
  }

  private static matchesFilters(coin: any, filters?: SearchFilters): boolean {
    if (!filters) return true

    // Market cap filters
    if (filters.min_market_cap && coin.market_cap < filters.min_market_cap) return false
    if (filters.max_market_cap && coin.market_cap > filters.max_market_cap) return false

    // Volume filter
    if (filters.min_volume_24h && coin.total_volume < filters.min_volume_24h) return false

    // Category filters (would need additional API calls to get categories)
    // Platform filters (would need additional data)

    // Exclude stablecoins (basic heuristic)
    if (filters.exclude_stablecoins) {
      const stablecoinPatterns = /usdt|usdc|dai|busd|tusd|pax|gusd|usdn/i
      if (stablecoinPatterns.test(coin.name) || stablecoinPatterns.test(coin.symbol)) {
        return false
      }
    }

    // Exclude meme coins (basic heuristic)
    if (filters.exclude_meme_coins) {
      const memePatterns = /doge|shib|pepe|floki|safemoon|baby|inu|moon|rocket/i
      if (memePatterns.test(coin.name) || memePatterns.test(coin.symbol)) {
        return false
      }
    }

    return true
  }

  static clearCache(): void {
    this.searchCache.clear()
  }

  static getCacheStats(): { size: number; oldestEntry: number } {
    const now = Date.now()
    let oldestEntry = now

    for (const { timestamp } of this.searchCache.values()) {
      if (timestamp < oldestEntry) {
        oldestEntry = timestamp
      }
    }

    return {
      size: this.searchCache.size,
      oldestEntry: now - oldestEntry,
    }
  }
}
