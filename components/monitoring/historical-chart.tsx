"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Point = { time: string; price: number }

export function HistoricalChart({ defaultToken = "bitcoin", defaultDays = 30 }: { defaultToken?: string; defaultDays?: number }) {
  const [token, setToken] = useState(defaultToken)
  const [days, setDays] = useState(defaultDays)
  const [data, setData] = useState<Point[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/market/history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tokenId: token, days }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to load history")
      setData(json.prices)
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <Card className="backdrop-blur-md bg-card/80 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle>Historical Price</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-3">
          <Input value={token} onChange={(e)=>setToken(e.target.value)} placeholder="token or symbol (e.g., eth)" className="max-w-[200px] bg-background/50 backdrop-blur-sm border-white/20" />
          <Input value={days} onChange={(e)=>setDays(Number(e.target.value)||1)} placeholder="days" className="max-w-[100px] bg-background/50 backdrop-blur-sm border-white/20" />
          <Button onClick={load} disabled={loading} className="bg-primary/80 backdrop-blur-sm hover:bg-primary/90">{loading? 'Loading…' : 'Refresh'}</Button>
        </div>
        {error && <div className="text-sm text-destructive mb-2 p-2 rounded bg-destructive/10 backdrop-blur-sm border border-destructive/20">{error}</div>}
        <div className="h-[260px] rounded-lg bg-background/20 backdrop-blur-sm border border-white/10 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip formatter={(v)=>[`$${Number(v).toLocaleString()}`, 'Price']} labelFormatter={(l)=>new Date(l).toLocaleString()} />
              <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
