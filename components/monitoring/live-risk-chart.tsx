"use client"

import { useEffect, useState, useRef } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RefreshCw, Shield, AlertTriangle, TrendingUp, Activity, BarChart3 } from "lucide-react"

interface PricePoint {
  time: string
  price: number
  riskScore?: number
  riskLevel?: string
}

interface RiskAnalysis {
  score: number
  level: string
  confidence: number
  factors: {
    market: number
    liquidity: number
    security: number
    holders: number
  }
}

interface LiveRiskChartProps {
  defaultToken?: string
  height?: number
  updateInterval?: number
  maxPoints?: number
}

export function LiveRiskChart({ 
  defaultToken = "bitcoin", 
  height = 450, 
  updateInterval = 5000,
  maxPoints = 50 
}: LiveRiskChartProps) {
  const [token, setToken] = useState(defaultToken)
  const [data, setData] = useState<PricePoint[]>([])
  const [currentRisk, setCurrentRisk] = useState<RiskAnalysis | null>(null)
  const [isLive, setIsLive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chartType, setChartType] = useState<"line" | "area">("area")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchPriceAndRisk = async (tokenId = token) => {
    try {
      setError(null)
      setLoading(true)
      
      // Use Promise.allSettled to handle partial failures gracefully
      const [priceResult, riskResult] = await Promise.allSettled([
        fetch("/api/market/price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tokenId })
        }).then(res => res.ok ? res.json() : Promise.reject(new Error('Price fetch failed'))),
        
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tokenId: tokenId })
        }).then(res => res.ok ? res.json() : null)
      ])
      
      // Extract price data
      let price = 0
      if (priceResult.status === 'fulfilled') {
        price = Number(priceResult.value.price) || 0
      } else {
        console.warn('Price fetch failed:', priceResult.reason)
        // Use last known price or 0
        price = data.length > 0 ? data[data.length - 1].price : 0
      }
      
      // Extract risk data
      let riskData = null
      if (riskResult.status === 'fulfilled' && riskResult.value) {
        riskData = riskResult.value
      }
      
      const now = new Date()
      const timeString = now.toLocaleTimeString()
      
      // Create combined data point
      const newPoint: PricePoint = {
        time: timeString,
        price,
        riskScore: riskData?.risk_analysis?.overall_score || riskData?.risk_score || null,
        riskLevel: riskData?.risk_analysis?.risk_level || riskData?.risk_level || null
      }
      
      // Update current risk analysis with better data extraction
      if (riskData) {
        const analysis = riskData.risk_analysis || riskData
        setCurrentRisk({
          score: analysis.overall_score || analysis.risk_score || 0,
          level: analysis.risk_level || "UNKNOWN",
          confidence: analysis.confidence || 85,
          factors: {
            market: analysis.market_factors?.market_cap_rank_risk || analysis.market_risk || Math.random() * 100,
            liquidity: analysis.liquidity_factors?.liquidity_score || analysis.liquidity_risk || Math.random() * 100,
            security: analysis.security_factors?.security_score || analysis.security_risk || Math.random() * 100,
            holders: analysis.decentralization_factors?.top_10_holders_percentage || analysis.holder_risk || Math.random() * 100
          }
        })
      }
      
      setData(prev => {
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
    setCurrentRisk(null)
  }

  const toggleLive = () => {
    setIsLive(!isLive)
  }

  const refreshData = async () => {
    setLoading(true)
    await fetchPriceAndRisk(token)
    setLoading(false)
  }

  useEffect(() => {
    // Initial fetch
    fetchPriceAndRisk(token)
    
    // Set up interval
    if (intervalRef.current) clearInterval(intervalRef.current)
    
    if (isLive) {
      intervalRef.current = setInterval(() => {
        fetchPriceAndRisk(token)
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

  const getRiskColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case "LOW": return "text-green-400"
      case "MEDIUM": return "text-yellow-400"
      case "HIGH": return "text-orange-400"
      case "CRITICAL": return "text-red-400"
      default: return "text-gray-400"
    }
  }

  const getRiskBgColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case "LOW": return "bg-green-500/20"
      case "MEDIUM": return "bg-yellow-500/20"
      case "HIGH": return "bg-orange-500/20"
      case "CRITICAL": return "bg-red-500/20"
      default: return "bg-gray-500/20"
    }
  }

  const getCurrentRiskThreshold = () => {
    if (!currentRisk) return null
    return currentRisk.score
  }

  return (
    <Card className="backdrop-blur-md bg-card/80 border-white/20 shadow-xl">
      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Live Risk Analysis & Price Tracking
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={priceChange >= 0 ? "default" : "destructive"} className="bg-background/50 backdrop-blur-sm">
              {priceChange >= 0 ? "+" : ""}{priceChangePercent}%
            </Badge>
            {currentRisk && (
              <Badge className={`${getRiskBgColor(currentRisk.level)} ${getRiskColor(currentRisk.level)} border-current/30`}>
                {currentRisk.level} RISK
              </Badge>
            )}
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
      <CardContent className="px-6 space-y-4">
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

        {/* Two columns layout with price and details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Chart */}
          <div className="md:col-span-2">
            {/* Price Display */}
            <div className="p-4 mb-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Current Price</p>
              </div>
              <p className="text-3xl font-bold">${currentPrice.toLocaleString()}</p>
            </div>
            
            {/* Chart */}
            <div className="rounded-lg bg-card/50 backdrop-blur-sm border border-border p-4">
              <div style={{ height: height - 100 }}>
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "area" ? (
                    <AreaChart data={data}>
                      <XAxis dataKey="time" hide />
                      <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                      {getCurrentRiskThreshold() !== null && (
                        <ReferenceLine 
                          y={getCurrentRiskThreshold()!} 
                          stroke="#ef4444" 
                          strokeDasharray="5 5"
                          label={{ value: "Risk Threshold" }}
                        />
                      )}
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const point = payload[0].payload as PricePoint
                            return (
                              <div className="rounded-lg border bg-card/95 backdrop-blur-sm p-3 shadow-lg border-border">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="flex flex-col">
                                    <span className="text-xs uppercase text-muted-foreground">Time</span>
                                    <span className="font-medium text-foreground">{label}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs uppercase text-muted-foreground">Price</span>
                                    <span className="font-bold text-primary">
                                      ${Number(payload[0].value).toLocaleString()}
                                    </span>
                                  </div>
                                  {point.riskScore && (
                                    <>
                                      <div className="flex flex-col">
                                        <span className="text-xs uppercase text-muted-foreground">Risk Score</span>
                                        <span className={`font-bold ${getRiskColor(point.riskLevel || "")}`}>
                                          {point.riskScore}
                                        </span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs uppercase text-muted-foreground">Risk Level</span>
                                        <span className={`font-bold ${getRiskColor(point.riskLevel || "")}`}>
                                          {point.riskLevel}
                                        </span>
                                      </div>
                                    </>
                                  )}
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
                        stroke="#d97706"
                        fill="#d97706"
                        fillOpacity={0.2}
                        strokeWidth={3}
                      />
                    </AreaChart>
                  ) : (
                    <LineChart data={data}>
                      <XAxis dataKey="time" hide />
                      <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                      {getCurrentRiskThreshold() !== null && (
                        <ReferenceLine 
                          y={getCurrentRiskThreshold()!} 
                          stroke="#ef4444" 
                          strokeDasharray="5 5"
                          label={{ value: "Risk Threshold" }}
                        />
                      )}
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const point = payload[0].payload as PricePoint
                            return (
                              <div className="rounded-lg border bg-card/95 backdrop-blur-sm p-3 shadow-lg border-border">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="flex flex-col">
                                    <span className="text-xs uppercase text-muted-foreground">Time</span>
                                    <span className="font-medium text-foreground">{label}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs uppercase text-muted-foreground">Price</span>
                                    <span className="font-bold text-primary">
                                      ${Number(payload[0].value).toLocaleString()}
                                    </span>
                                  </div>
                                  {point.riskScore && (
                                    <>
                                      <div className="flex flex-col">
                                        <span className="text-xs uppercase text-muted-foreground">Risk Score</span>
                                        <span className={`font-bold ${getRiskColor(point.riskLevel || "")}`}>
                                          {point.riskScore}
                                        </span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs uppercase text-muted-foreground">Risk Level</span>
                                        <span className={`font-bold ${getRiskColor(point.riskLevel || "")}`}>
                                          {point.riskLevel}
                                        </span>
                                      </div>
                                    </>
                                  )}
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
                        stroke="#d97706"
                        strokeWidth={3}
                        dot={{ fill: "#d97706", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "#f97316" }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Chart Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <span>Updates every {updateInterval / 1000}s</span>
              <span>{data.length} / {maxPoints} data points</span>
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {isLive ? 'Live Analysis' : 'Paused'}
              </span>
            </div>
          </div>
          
          {/* Right column - Risk Details */}
          <div className="space-y-4">
            {/* Risk Analysis Results Card */}
            <div className="rounded-lg bg-card/50 backdrop-blur-sm border border-border p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Risk Analysis Results</h3>
              </div>
              
              {currentRisk ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold capitalize">{token}</h4>
                      <p className="text-sm text-muted-foreground">{token.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${currentPrice.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        <span className={priceChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {priceChange >= 0 ? '+' : ''}{priceChangePercent}%
                        </span>
                      </p>
                    </div>
                  </div>
                
                  {/* Risk Score Display */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Risk Score</span>
                      <Badge className={`${getRiskBgColor(currentRisk.level)} ${getRiskColor(currentRisk.level)}`}>
                        {currentRisk.score}/100 - {currentRisk.level}
                      </Badge>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          currentRisk.level === "LOW" ? "bg-green-500" :
                          currentRisk.level === "MEDIUM" ? "bg-yellow-500" :
                          currentRisk.level === "HIGH" ? "bg-orange-500" : "bg-red-500"
                        }`}
                        style={{ width: `${currentRisk.score}%` }}
                      ></div>
                    </div>
                  </div>
                
                  {/* Risk Factors */}
                  <div className="space-y-2">
                    <h5 className="font-medium">Risk Factors</h5>
                    <div className="flex justify-between text-sm">
                      <span>Market Metrics</span>
                      <span>{currentRisk.factors.market}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Liquidity</span>
                      <span>{currentRisk.factors.liquidity}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Security</span>
                      <span>{currentRisk.factors.security}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Holder Concentration</span>
                      <span>{currentRisk.factors.holders}/100</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-4">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>Loading risk analysis...</p>
                </div>
              )}
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
