import { type NextRequest, NextResponse } from "next/server"
import { TokenResolver } from "@/lib/token-resolver"
import { TokenDisambiguator } from "@/lib/token-disambiguation"

export async function POST(request: NextRequest) {
  try {
    const { query, disambiguation_factors } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // First, resolve the token
    const resolvedTokens = await TokenResolver.resolveToken(query)

    if (resolvedTokens.length === 0) {
      // Try to suggest alternatives
      const alternatives = await TokenDisambiguator.suggestAlternatives(query)

      return NextResponse.json({
        query,
        resolved: false,
        suggestions: alternatives,
        message: "No exact matches found. Here are some suggestions:",
      })
    }

    // If multiple matches, use disambiguation
    if (resolvedTokens.length > 1 && disambiguation_factors) {
      const disambiguationResult = await TokenDisambiguator.disambiguate({
        user_query: query,
        matched_tokens: resolvedTokens,
        disambiguation_factors,
      })

      return NextResponse.json({
        query,
        resolved: true,
        recommended_token: disambiguationResult.recommended_token,
        confidence: disambiguationResult.confidence,
        reasoning: disambiguationResult.reasoning,
        alternatives: disambiguationResult.alternatives,
        total_matches: resolvedTokens.length,
      })
    }

    // Return the best match
    return NextResponse.json({
      query,
      resolved: true,
      recommended_token: resolvedTokens[0],
      confidence: resolvedTokens[0].confidence_score,
      alternatives: resolvedTokens.slice(1),
      total_matches: resolvedTokens.length,
    })
  } catch (error) {
    console.error("Token resolution API error:", error)
    return NextResponse.json({ error: "Token resolution failed" }, { status: 500 })
  }
}
