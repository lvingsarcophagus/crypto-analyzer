import type { ResolvedToken } from "./token-types" // Assuming ResolvedToken is declared in token-types.ts
import { TokenResolver } from "./token-resolver" // Assuming TokenResolver is declared in token-resolver.ts

// Handle cases where multiple tokens match the same query
export interface DisambiguationContext {
  user_query: string
  matched_tokens: ResolvedToken[]
  disambiguation_factors: {
    market_cap_preference?: "high" | "low"
    platform_preference?: string[]
    category_preference?: string[]
    risk_tolerance?: "low" | "medium" | "high"
  }
}

export interface DisambiguationResult {
  recommended_token: ResolvedToken
  confidence: number
  reasoning: string[]
  alternatives: ResolvedToken[]
}

export class TokenDisambiguator {
  static async disambiguate(context: DisambiguationContext): Promise<DisambiguationResult> {
    const { user_query, matched_tokens, disambiguation_factors } = context

    if (matched_tokens.length === 0) {
      throw new Error("No tokens to disambiguate")
    }

    if (matched_tokens.length === 1) {
      return {
        recommended_token: matched_tokens[0],
        confidence: matched_tokens[0].confidence_score,
        reasoning: ["Only one token matched the query"],
        alternatives: [],
      }
    }

    // Score each token based on disambiguation factors
    const scoredTokens = matched_tokens.map((token) => ({
      token,
      disambiguation_score: this.calculateDisambiguationScore(token, disambiguation_factors),
    }))

    // Sort by combined score (original confidence + disambiguation score)
    scoredTokens.sort((a, b) => {
      const aTotal = a.token.confidence_score * 0.6 + a.disambiguation_score * 0.4
      const bTotal = b.token.confidence_score * 0.6 + b.disambiguation_score * 0.4
      return bTotal - aTotal
    })

    const recommended = scoredTokens[0]
    const alternatives = scoredTokens.slice(1).map((s) => s.token)

    return {
      recommended_token: recommended.token,
      confidence: recommended.token.confidence_score * 0.6 + recommended.disambiguation_score * 0.4,
      reasoning: this.generateDisambiguationReasoning(recommended.token, disambiguation_factors),
      alternatives,
    }
  }

  private static calculateDisambiguationScore(
    token: ResolvedToken,
    factors: DisambiguationContext["disambiguation_factors"],
  ): number {
    let score = 0.5 // Base score

    // Market cap preference
    if (factors.market_cap_preference && token.market_cap_rank) {
      if (factors.market_cap_preference === "high" && token.market_cap_rank <= 100) {
        score += 0.2
      } else if (factors.market_cap_preference === "low" && token.market_cap_rank > 500) {
        score += 0.1
      }
    }

    // Platform preference
    if (factors.platform_preference && token.platforms) {
      const hasPreferredPlatform = factors.platform_preference.some((platform) =>
        Object.keys(token.platforms!).includes(platform),
      )
      if (hasPreferredPlatform) {
        score += 0.15
      }
    }

    // Risk tolerance (would integrate with risk analysis)
    if (factors.risk_tolerance) {
      // This would use actual risk scores from our risk analysis engine
      // For now, using market cap rank as a proxy for risk
      if (factors.risk_tolerance === "low" && token.market_cap_rank && token.market_cap_rank <= 50) {
        score += 0.1
      } else if (factors.risk_tolerance === "high" && token.market_cap_rank && token.market_cap_rank > 200) {
        score += 0.05
      }
    }

    return Math.min(1.0, score)
  }

  private static generateDisambiguationReasoning(
    token: ResolvedToken,
    factors: DisambiguationContext["disambiguation_factors"],
  ): string[] {
    const reasoning: string[] = []

    if (token.market_cap_rank && token.market_cap_rank <= 10) {
      reasoning.push("Top 10 cryptocurrency by market capitalization")
    } else if (token.market_cap_rank && token.market_cap_rank <= 100) {
      reasoning.push("Well-established cryptocurrency in top 100")
    }

    if (token.confidence_score > 0.9) {
      reasoning.push("High confidence exact match")
    } else if (token.confidence_score > 0.7) {
      reasoning.push("Strong match for search query")
    }

    if (factors.market_cap_preference === "high" && token.market_cap_rank && token.market_cap_rank <= 50) {
      reasoning.push("Matches preference for high market cap tokens")
    }

    if (token.resolution_method === "exact_match") {
      reasoning.push("Exact symbol or name match")
    } else if (token.resolution_method === "contract_address") {
      reasoning.push("Resolved by contract address")
    }

    return reasoning.length > 0 ? reasoning : ["Best match based on search criteria"]
  }

  static async suggestAlternatives(query: string, excludeTokenIds: string[] = []): Promise<ResolvedToken[]> {
    // Generate alternative suggestions when the main search doesn't yield good results
    const alternativeQueries = [
      query.toLowerCase(),
      query.toUpperCase(),
      query.replace(/\s+/g, ""),
      query.replace(/\s+/g, "-"),
    ]

    const allSuggestions: ResolvedToken[] = []

    for (const altQuery of alternativeQueries) {
      try {
        const results = await TokenResolver.resolveToken(altQuery)
        allSuggestions.push(...results.filter((token) => !excludeTokenIds.includes(token.id)))
      } catch (error) {
        // Continue with other alternatives
      }
    }

    // Remove duplicates and return top suggestions
    const uniqueSuggestions = new Map<string, ResolvedToken>()
    for (const suggestion of allSuggestions) {
      if (
        !uniqueSuggestions.has(suggestion.id) ||
        suggestion.confidence_score > uniqueSuggestions.get(suggestion.id)!.confidence_score
      ) {
        uniqueSuggestions.set(suggestion.id, suggestion)
      }
    }

    return Array.from(uniqueSuggestions.values())
      .sort((a, b) => b.confidence_score - a.confidence_score)
      .slice(0, 5)
  }
}
