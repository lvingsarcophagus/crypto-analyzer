"use client"

import { useEffect, useState, useRef } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RefreshCw } from "lucide-react"

interface PricePoint {
  time: string
  price: number
  volume?: number
}

interface LiveChartProps {
  defaultToken?: string
  height?: number
  updateInterval?: number
  maxPoints?: number
}

export function LiveChart({ 
  defaultToken = "bitcoin", 
  height = 400, 
  updateInterval = 3000,
  maxPoints = 50 
}: LiveChartProps) {
  const [token, setToken] = useState(defaultToken)
  const [data, setData] = useState<PricePoint[]>([])
  const [isLive, setIsLive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chartType, setChartType] = useState<"line" | "area">("area")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchPrice = async (tokenId = token) => {
    try {
      setError(null)
      const res = await fetch("/api/market/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId })
      })
      const json = await res.json()
      
      if (!res.ok) throw new Error(json?.error || "Failed to fetch price")
      
      const price = Number(json.price) || 0
      const now = new Date()
      const timeString = now.toLocaleTimeString()
      
      setData(prev => {
        const newPoint = { time: timeString, price }
        const updated = [...prev, newPoint]
        return updated.slice(-maxPoints)
      })
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleTokenChange = (newToken: string) => {
    setToken(newToken)
    setData([]) // Clear existing data
  }

  const toggleLive = () => {
    setIsLive(!isLive)
  }

  const refreshData = async () => {
    setLoading(true)
    await fetchPrice(token)
    setLoading(false)
  }

  useEffect(() => {
    // Initial fetch
    fetchPrice(token)
    
    // Set up interval
    if (intervalRef.current) clearInterval(intervalRef.current)
    
    if (isLive) {
      intervalRef.current = setInterval(() => {
        fetchPrice(token)
      }, updateInterval)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [token, isLive, updateInterval])

  const currentPrice = data[data.length - 1]?.price ?? 0
  const previousPrice = data[data.length - 2]?.price ?? currentPrice
  const priceChange = currentPrice - previousPrice
  const priceChangePercent = previousPrice ? ((priceChange / previousPrice) * 100).toFixed(2) : "0.00"

  const minPrice = Math.min(...data.map(d => d.price))
  const maxPrice = Math.max(...data.map(d => d.price))
  const priceRange = maxPrice - minPrice

  return (
    <Card className="backdrop-blur-md bg-card/80 border-white/20 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Live Price Chart
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={priceChange >= 0 ? "default" : "destructive"} className="bg-background/50 backdrop-blur-sm">
              {priceChange >= 0 ? "+" : ""}{priceChangePercent}%
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartType(chartType === "line" ? "area" : "line")}
              className="bg-background/50 backdrop-blur-sm border-white/20"
            >
              {chartType === "line" ? "Area" : "Line"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-background/30 backdrop-blur-sm border border-white/10">
          <Input
            value={token}
            onChange={(e) => handleTokenChange(e.target.value)}
            placeholder="Enter token symbol (e.g., btc, eth)"
            className="flex-1 bg-background/50 backdrop-blur-sm border-white/20"
          />
          <Button
            onClick={refreshData}
            disabled={loading}
            size="sm"
            variant="outline"
            className="bg-background/50 backdrop-blur-sm border-white/20"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={toggleLive}
            size="sm"
            variant={isLive ? "default" : "outline"}
            className={isLive ? "bg-green-600 hover:bg-green-700" : "bg-background/50 backdrop-blur-sm border-white/20"}
          >
            {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>

        {/* Price Display */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm border border-white/10">
          <div>
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="text-3xl font-bold">${currentPrice.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">24h Range</p>
            <p className="text-sm">
              ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Range: ${priceRange.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 backdrop-blur-sm">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Chart */}
        <div className="rounded-lg bg-background/20 backdrop-blur-sm border border-white/10 p-4">
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart data={data}>
                  <XAxis 
                    dataKey="time" 
                    hide 
                  />
                  <YAxis 
                    hide 
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background/90 backdrop-blur-sm p-3 shadow-lg border-white/20">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-xs uppercase text-muted-foreground">Time</span>
                                <span className="font-medium">{label}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs uppercase text-muted-foreground">Price</span>
                                <span className="font-bold text-primary">
                                  ${Number(payload[0].value).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              ) : (
                <LineChart data={data}>
                  <XAxis 
                    dataKey="time" 
                    hide 
                  />
                  <YAxis 
                    hide 
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background/90 backdrop-blur-sm p-3 shadow-lg border-white/20">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-xs uppercase text-muted-foreground">Time</span>
                                <span className="font-medium">{label}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs uppercase text-muted-foreground">Price</span>
                                <span className="font-bold text-primary">
                                  ${Number(payload[0].value).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Updates every {updateInterval / 1000}s</span>
          <span>{data.length} / {maxPoints} data points</span>
          <span>{isLive ? 'Live' : 'Paused'}</span>
        </div>
      </CardContent>
    </Card>
  )
}
