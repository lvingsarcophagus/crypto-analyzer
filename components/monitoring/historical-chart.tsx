"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { Loader2 } from "lucide-react"

type Point = { time: string; price: number }

export function HistoricalChart({ defaultToken = "bitcoin", defaultDays = 30 }: { defaultToken?: string; defaultDays?: number }) {
  const [token, setToken] = useState(defaultToken)
  const [days, setDays] = useState(defaultDays)
  const [data, setData] = useState<Point[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const debouncedToken = useDebounce(token, 500)
  const debouncedDays = useDebounce(days, 500)

  useEffect(() => {
    async function load() {
      if (!debouncedToken || !debouncedDays) return

      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/market/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tokenId: debouncedToken, days: debouncedDays })
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || "Failed to load history")

        const formattedData = (json.prices || []).map((p: [number, number]) => ({
          time: new Date(p[0]).toISOString(),
          price: p[1],
        }))
        setData(formattedData)

      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [debouncedToken, debouncedDays])

  return (
    <Card className="backdrop-blur-md bg-card/80 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle>Historical Price Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="e.g., bitcoin, eth"
            className="max-w-[200px] bg-background/50 backdrop-blur-sm border-white/20"
          />
          <Input
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value) || 1)}
            placeholder="Days"
            className="max-w-[100px] bg-background/50 backdrop-blur-sm border-white/20"
          />
        </div>

        <div className="h-[260px] rounded-lg bg-background/20 backdrop-blur-sm border border-white/10 p-3 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <div className="text-center p-4">
                <p className="text-destructive font-semibold">Error</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          )}
          {!loading && !error && data.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <p className="text-muted-foreground">No data available for this selection.</p>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickFormatter={(str) => {
                  const date = new Date(str)
                  if (days <= 2) return date.toLocaleTimeString()
                  return date.toLocaleDateString()
                }}
              />
              <YAxis
                dataKey="price"
                axisLine={false}
                tickLine={false}
                tickCount={8}
                tickFormatter={(num) => `$${num.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number) => [value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), 'Price']}
                labelFormatter={(label) => new Date(label).toLocaleString()}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorPrice)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
