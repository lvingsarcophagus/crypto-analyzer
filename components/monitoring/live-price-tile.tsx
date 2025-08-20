"use client"

import { useEffect, useRef, useState } from "react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PricePoint { time: string; price: number }

export function LivePriceTile({ defaultToken = "bitcoin", intervalMs = 5000 }: { defaultToken?: string; intervalMs?: number }) {
  const [token, setToken] = useState(defaultToken)
  const [data, setData] = useState<PricePoint[]>([])
  const [isLive, setIsLive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timer = useRef<NodeJS.Timeout | null>(null)

  const fetchPrice = async (t = token) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/market/price", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tokenId: t }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to fetch price")
      const now = new Date().toLocaleTimeString()
      const price = Number(json.price) || 0
      setData((prev) => [...prev, { time: now, price }].slice(-60))
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    // initial fetch
    fetchPrice(token)
    // polling
    timer.current && clearInterval(timer.current)
    timer.current = setInterval(() => { if (isLive) fetchPrice(token) }, intervalMs)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [token, isLive, intervalMs])

  const current = data[data.length - 1]?.price ?? 0
  const prev = data[data.length - 2]?.price ?? current
  const delta = current - prev
  const deltaPct = prev ? ((delta / prev) * 100).toFixed(2) : "0.00"

  return (
    <Card className="backdrop-blur-md bg-card/80 border-white/20 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Live Price</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={delta >= 0 ? "default" : "destructive"} className="text-xs bg-background/50 backdrop-blur-sm">
            {delta >= 0 ? "+" : ""}{deltaPct}%
          </Badge>
          <div className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-background/30 backdrop-blur-sm border border-white/10">
          <Input value={token} onChange={(e)=>setToken(e.target.value)} placeholder="token or symbol (e.g., eth)" className="max-w-[160px] bg-background/50 backdrop-blur-sm border-white/20" />
          <Button size="sm" onClick={()=>fetchPrice()} disabled={loading} className="bg-primary/80 backdrop-blur-sm hover:bg-primary/90">{loading? '...' : 'Refresh'}</Button>
          <Button size="sm" variant="secondary" onClick={()=>setIsLive(v=>!v)} className="bg-background/50 backdrop-blur-sm border-white/20">{isLive? 'Pause' : 'Resume'}</Button>
        </div>
        {error && <div className="text-xs text-destructive mb-2 p-2 rounded bg-destructive/10 backdrop-blur-sm border border-destructive/20">{error}</div>}
        <div className="text-2xl font-bold mb-4">${current.toLocaleString()}</div>
        <div className="h-[200px] rounded-lg bg-background/20 backdrop-blur-sm border border-white/10 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip formatter={(v)=>[`$${Number(v).toLocaleString()}`, 'Price']} labelFormatter={(l)=>l} />
              <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
