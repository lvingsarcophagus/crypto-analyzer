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
    const res = await fetch(url, { headers: REQUEST_HEADERS.COINGECKO })
    if (!res.ok) {
      return NextResponse.json({ error: `CoinGecko error ${res.status}` }, { status: res.status })
    }
    const json = await res.json()
    const prices = (json.prices || []).map((p: [number, number]) => ({ time: new Date(p[0]).toISOString(), price: p[1] }))
    const volumes = (json.total_volumes || []).map((v: [number, number]) => ({ time: new Date(v[0]).toISOString(), volume: v[1] }))
    return NextResponse.json({ token_id: id, days, prices, volumes })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 })
  }
}
