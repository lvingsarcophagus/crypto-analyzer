"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, TrendingUp, TrendingDown, BarChart3, Loader2 } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface HistoricalDataPoint {
  date: string
  price: number
  volume: number
  market_cap: number
  timestamp: number
}

interface HistoricalChartProps {
  defaultToken?: string
  height?: number
}

export function HistoricalChart({ 
  defaultToken = "bitcoin", 
  height = 400 
}: HistoricalChartProps) {
  const [token, setToken] = useState(defaultToken)
  const [data, setData] = useState<HistoricalDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<string>("30")
  const [chartType, setChartType] = useState<"line" | "area">("area")

  const debouncedToken = useDebounce(token, 500)
  const debouncedTimeRange = useDebounce(timeRange, 500)

  useEffect(() => {
    const fetchHistoricalData = async (tokenId = debouncedToken, days = debouncedTimeRange) => {
      if (!tokenId) return;
      try {
        setError(null)
        setLoading(true)
        
        const response = await fetch("/api/market/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tokenId, days: parseInt(days) })
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.error) {
          throw new Error(result.error)
        }
        
        // Transform the data for the chart
        const transformedData = result.prices?.map((item: any, index: number) => ({
          date: new Date(item[0]).toLocaleDateString(),
          price: item[1],
          volume: result.total_volumes?.[index]?.[1] || 0,
          market_cap: result.market_caps?.[index]?.[1] || 0,
          timestamp: item[0]
        })) || []
        
        setData(transformedData)
      } catch (error) {
        console.error('Error fetching historical data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load data')
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchHistoricalData()
  }, [debouncedToken, debouncedTimeRange])

  const fetchHistoricalData = async (tokenId = token, days = timeRange) => {
    if (!tokenId) return;
    try {
      setError(null)
      setLoading(true)
      
      const response = await fetch("/api/market/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId, days: parseInt(days) })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      // Transform the data for the chart
      const transformedData = result.prices?.map((item: any, index: number) => ({
        date: new Date(item[0]).toLocaleDateString(),
        price: item[1],
        volume: result.total_volumes?.[index]?.[1] || 0,
        market_cap: result.market_caps?.[index]?.[1] || 0,
        timestamp: item[0]
      })) || []
      
      setData(transformedData)
    } catch (error) {
      console.error('Error fetching historical data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    // The useEffect will handle the fetch due to debouncing
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(2)}`
  }

  const formatVolume = (value: number) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`
    }
    if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`
    }
    if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  const getChangeInfo = () => {
    if (data.length < 2) return { change: 0, percentage: 0, isPositive: true }
    
    const first = data[0].price
    const last = data[data.length - 1].price
    const change = last - first
    const percentage = (change / first) * 100
    
    return {
      change,
      percentage,
      isPositive: change >= 0
    }
  }

  const changeInfo = getChangeInfo()

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-md">
          <Input
            placeholder="Enter token symbol (e.g., bitcoin, ethereum)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-card/50 border-border/50"
          />
          <Button onClick={handleSearch} disabled={loading || !token.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-card/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">3 Months</SelectItem>
              <SelectItem value="365">1 Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={chartType} onValueChange={(value: "line" | "area") => setChartType(value)}>
            <SelectTrigger className="w-24 bg-card/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">Area</SelectItem>
              <SelectItem value="line">Line</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Token Info */}
      {data.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-card/30 rounded-lg">
            <div className="text-sm text-muted-foreground">Current Price</div>
            <div className="text-xl font-bold">{formatPrice(data[data.length - 1].price)}</div>
          </div>
          <div className="text-center p-3 bg-card/30 rounded-lg">
            <div className="text-sm text-muted-foreground">Change</div>
            <div className={`text-xl font-bold flex items-center justify-center gap-1 ${
              changeInfo.isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {changeInfo.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {changeInfo.percentage.toFixed(2)}%
            </div>
          </div>
          <div className="text-center p-3 bg-card/30 rounded-lg">
            <div className="text-sm text-muted-foreground">24h Volume</div>
            <div className="text-xl font-bold">{formatVolume(data[data.length - 1].volume)}</div>
          </div>
          <div className="text-center p-3 bg-card/30 rounded-lg">
            <div className="text-sm text-muted-foreground">Market Cap</div>
            <div className="text-xl font-bold">{formatVolume(data[data.length - 1].market_cap)}</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <Card className="backdrop-blur-md bg-card/80 border-border/50">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <div className="text-muted-foreground">Loading historical data...</div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-red-500 mb-2">Error loading data</div>
                <div className="text-sm text-muted-foreground">{error}</div>
                <Button onClick={() => fetchHistoricalData()} className="mt-4" variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <div>No data available</div>
                <div className="text-sm">Try a different token or time range</div>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={height}>
              {chartType === "area" ? (
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={formatPrice}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f9fafb'
                    }}
                    formatter={(value: number) => [formatPrice(value), 'Price']}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    fill="url(#priceGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              ) : (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={formatPrice}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f9fafb'
                    }}
                    formatter={(value: number) => [formatPrice(value), 'Price']}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
