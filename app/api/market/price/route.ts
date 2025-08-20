import { NextResponse } from "next/server"
import { TokenResolver } from "@/lib/token-resolver"
import { API_CONFIG, REQUEST_HEADERS } from "@/lib/api-config"

async function resolveId(input: string): Promise<string> {
  const q = (input || "").trim().toLowerCase()
  const common: Record<string, string> = {
    btc: "bitcoin",
    xbt: "bitcoin",
    eth: "ethereum",
    bnb: "binancecoin",
    sol: "solana",
    ada: "cardano",
    xrp: "ripple",
    doge: "dogecoin",
    matic: "matic-network",
    ton: "the-open-network",
    trx: "tron",
    dot: "polkadot",
  }
  if (common[q]) return common[q]
  if (/^[a-z0-9-]{3,}$/.test(q)) return q
  try {
    const results = await TokenResolver.resolveToken(q)
    if (results && results.length) return results[0].id
  } catch {}
  return q
}

export async function POST(request: Request) {
  try {
    const { tokenId } = await request.json()
    if (!tokenId) return NextResponse.json({ error: "tokenId is required" }, { status: 400 })
    
    const id = await resolveId(tokenId)
    const url = `${API_CONFIG.COINGECKO.BASE_URL}/simple/price?ids=${id}&vs_currencies=usd`
    
    // Add timeout and retry logic
    const maxRetries = 2
    const timeoutMs = 8000
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
        
        const res = await fetch(url, { 
          headers: REQUEST_HEADERS.COINGECKO,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!res.ok) {
          if (attempt === maxRetries) {
            return NextResponse.json({ error: `CoinGecko error ${res.status}` }, { status: res.status })
          }
          continue
        }
        
        const json = await res.json()
        return NextResponse.json({ token_id: id, price: json?.[id]?.usd ?? null })
        
      } catch (fetchError) {
        if (attempt === maxRetries) {
          throw fetchError
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
    
  } catch (e: any) {
    const errorMessage = e?.message || "failed"
    console.error("Market price API error:", errorMessage)
    
    // Provide more specific error messages
    if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
      return NextResponse.json({ 
        error: "Request timeout - market data temporarily unavailable",
        fallback_price: null
      }, { status: 503 })
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
