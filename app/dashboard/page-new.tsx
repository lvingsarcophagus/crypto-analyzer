"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LiveRiskChart } from "@/components/monitoring/live-risk-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, 
  TrendingUp, 
  BarChart3, 
  Search,
  Activity,
  DollarSign,
  Users,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Lock,
  PieChart,
  LineChart
} from "lucide-react"

interface CoinData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap_rank: number
  market_cap: number
}

interface MarketData {
  totalMarketCap: number
  totalVolume: number
  btcDominance: number
}

export default function Dashboard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [topCoins, setTopCoins] = useState<CoinData[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    fetchMarketData()
    const interval = setInterval(fetchMarketData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const fetchMarketData = async () => {
    try {
      setLoading(true)
      
      // Fetch global market data
      const globalResponse = await fetch('https://api.coingecko.com/api/v3/global')
      const globalData = await globalResponse.json()
      
      // Fetch top coins
      const coinsResponse = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false')
      const coinsData = await coinsResponse.json()
      
      setMarketData({
        totalMarketCap: globalData.data.total_market_cap.usd,
        totalVolume: globalData.data.total_volume.usd,
        btcDominance: globalData.data.market_cap_percentage.btc
      })
      
      setTopCoins(coinsData)
      setLastUpdated(new Date())
      
    } catch (error) {
      console.error('Failed to fetch market data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(8)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${num.toLocaleString()}`
  }

  const getRiskLevel = (rank: number) => {
    if (rank <= 10) return { level: "Low", color: "text-green-500", score: 15 + rank }
    if (rank <= 50) return { level: "Moderate", color: "text-yellow-500", score: 25 + rank }
    if (rank <= 100) return { level: "High", color: "text-orange-500", score: 50 + rank }
    return { level: "Critical", color: "text-red-500", score: 75 + (rank % 25) }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/analysis?token=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const featuredTools = [
    {
      title: "Advanced Risk Analysis",
      description: "Multi-factor token risk assessment with real-time data",
      icon: Shield,
      link: "/analysis",
      color: "text-amber-500",
      badge: "Enhanced"
    },
    {
      title: "Portfolio Tracker",
      description: "Track and analyze your cryptocurrency portfolio",
      icon: PieChart,
      link: "/portfolio",
      color: "text-green-500",
      badge: "Coming Soon"
    },
    {
      title: "Security Audits",
      description: "Smart contract security analysis and vulnerability detection",
      icon: Lock,
      link: "/security",
      color: "text-red-500",
      badge: "Beta"
    },
    {
      title: "Market Analytics",
      description: "Comprehensive market trends and predictive analysis",
      icon: LineChart,
      link: "/analytics",
      color: "text-blue-500",
      badge: "Pro"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Risk Analysis Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor cryptocurrency markets and analyze token risk factors in real-time
              </p>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={fetchMarketData}
                    className="ml-2 h-6 w-6 p-0"
                  >
                    <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </p>
              )}
            </div>
            
            {/* Quick Search */}
            <div className="flex gap-2 max-w-md w-full">
              <Input
                placeholder="Search cryptocurrency (e.g., bitcoin, eth, ada)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-card/50 border-border/50"
              />
              <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Market Overview */}
          {marketData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="backdrop-blur-md bg-card/80 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Market Cap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {formatNumber(marketData.totalMarketCap)}
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-md bg-card/80 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    24h Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">
                    {formatNumber(marketData.totalVolume)}
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-md bg-card/80 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    BTC Dominance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">
                    {marketData.btcDominance.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-md border border-border/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="live-chart">Live Analysis</TabsTrigger>
              <TabsTrigger value="top-coins">Top Coins</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="backdrop-blur-md bg-card/80 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Platform Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-primary/10">
                        <div className="text-2xl font-bold text-primary">3</div>
                        <div className="text-sm text-muted-foreground">API Integrations</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-secondary/10">
                        <div className="text-2xl font-bold text-secondary">{topCoins.length}</div>
                        <div className="text-sm text-muted-foreground">Coins Tracked</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-md bg-card/80 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-amber-500" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Market Risk</span>
                        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                          Moderate
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Overall Sentiment</span>
                        <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30">
                          Positive
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Volatility Index</span>
                        <Badge variant="outline" className="bg-orange-500/20 text-orange-600 border-orange-500/30">
                          High
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="live-chart" className="space-y-6">
              <Card className="backdrop-blur-md bg-card/80 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Live Risk & Price Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LiveRiskChart 
                    defaultToken="bitcoin"
                    height={400}
                    updateInterval={30000}
                    maxPoints={50}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="top-coins" className="space-y-6">
              <Card className="backdrop-blur-md bg-card/80 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Top Cryptocurrencies by Market Cap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topCoins.map((coin) => {
                      const risk = getRiskLevel(coin.market_cap_rank)
                      return (
                        <div key={coin.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-card/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                              #{coin.market_cap_rank}
                            </div>
                            <div>
                              <div className="font-medium">{coin.name}</div>
                              <div className="text-sm text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatPrice(coin.current_price)}</div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={coin.price_change_percentage_24h > 0 ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {coin.price_change_percentage_24h > 0 ? "+" : ""}
                                {coin.price_change_percentage_24h.toFixed(2)}%
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${risk.color}`}>
                                {risk.level}
                              </Badge>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => router.push(`/analysis?token=${coin.id}`)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredTools.map((tool, index) => (
                  <Card key={index} className="backdrop-blur-md bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300 group">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-card/50 flex items-center justify-center ${tool.color}`}>
                            <tool.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{tool.title}</CardTitle>
                            {tool.badge && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                {tool.badge}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{tool.description}</p>
                      <Button asChild className="w-full">
                        <Link href={tool.link}>
                          Explore Tool
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
