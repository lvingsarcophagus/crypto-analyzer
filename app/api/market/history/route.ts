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
    const { tokenId, days = 30 } = await request.json()
    if (!tokenId) return NextResponse.json({ error: "tokenId is required" }, { status: 400 })

    const id = await resolveId(tokenId)
    const interval = days <= 2 ? "hourly" : "daily";
    const url = `${API_CONFIG.COINGECKO.BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`
    const res = await fetch(url, { 
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CryptoAnalyzer/1.0'
      }
    })
    if (!res.ok) {
      return NextResponse.json({ 
        error: `CoinGecko API error: ${res.status} ${res.statusText}` 
      }, { status: res.status })
    }
    
    const json = await res.json()
    return NextResponse.json({
      token_id: id,
      days,
      prices: json.prices || [],
      total_volumes: json.total_volumes || [],
      market_caps: json.market_caps || []
    })
  } catch (e: any) {
    console.error('Market history API error:', e)
    return NextResponse.json({ error: e?.message || "Failed to fetch market data" }, { status: 500 })
  }
}
