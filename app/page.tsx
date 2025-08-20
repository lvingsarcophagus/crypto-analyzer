"use client"

import { useState, useEffect } from "react"
import { ChevronRightIcon, Shield, BarChart3, AlertTriangle, Zap, TrendingUp, Users, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { EnhancedSearch } from "@/components/ui/enhanced-search"
import { PerformanceMetrics } from "@/components/ui/performance-metrics"
import Link from "next/link"

interface MarketStats {
  totalMarketCap: number
  totalVolume: number
  btcDominance: number
  totalCoins: number
  activeCurrencies: number
}

export default function HomePage() {
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/global')
        const data = await response.json()
        
        setMarketStats({
          totalMarketCap: data.data.total_market_cap.usd,
          totalVolume: data.data.total_volume.usd,
          btcDominance: data.data.market_cap_percentage.btc,
          totalCoins: data.data.active_cryptocurrencies,
          activeCurrencies: data.data.markets
        })
      } catch (error) {
        console.error('Failed to fetch market stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMarketStats()
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${num.toLocaleString()}`
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-br from-background via-background/95 to-background/80">
      {/* Hero Section */}
      <div className="container flex flex-col items-center justify-center text-center px-4 py-16 md:py-24">
        <div className="mx-auto mb-10">
          <div className="flex items-center justify-center size-20 rounded-full bg-primary/10 mb-5 backdrop-blur-sm border border-primary/20">
            <Shield className="text-primary h-10 w-10" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary">
            CryptoRisk Pro
          </h1>
          <p className="max-w-[42rem] mx-auto mb-8 text-muted-foreground text-lg sm:text-xl leading-relaxed">
            Professional-grade cryptocurrency risk assessment platform. Make informed investment decisions with 
            real-time analysis, security audits, and multi-source data validation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="text-base bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <Link href="/analysis">
                Start Risk Analysis <Shield className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base border-primary/20 hover:bg-primary/5">
              <Link href="/dashboard">
                View Dashboard <BarChart3 className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Market Stats */}
        {!loading && marketStats && (
          <div className="w-full max-w-4xl mb-16">
            <h2 className="text-xl font-semibold mb-6 text-center">Live Market Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="backdrop-blur-md bg-card/60 border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {formatNumber(marketStats.totalMarketCap)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Market Cap</div>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-md bg-card/60 border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-secondary mb-1">
                    {formatNumber(marketStats.totalVolume)}
                  </div>
                  <div className="text-sm text-muted-foreground">24h Volume</div>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-md bg-card/60 border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500 mb-1">
                    {marketStats.btcDominance.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">BTC Dominance</div>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-md bg-card/60 border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500 mb-1">
                    {marketStats.totalCoins.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Coins</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="backdrop-blur-md bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-2">
                <AlertTriangle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Advanced Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Multi-factor analysis including market volatility, liquidity depth, security audits, and holder concentration.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Market Risk</span>
                  <span className="text-yellow-500">Medium</span>
                </div>
                <Progress value={60} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Security Score</span>
                  <span className="text-green-500">High</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-xl">Real-time Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Live price tracking, risk score updates, and instant alerts for significant market movements.
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Live Data
                </Badge>
                <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                  <Zap className="w-3 h-3 mr-1" />
                  Instant Updates
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
                <Globe className="h-6 w-6 text-green-400" />
              </div>
              <CardTitle className="text-xl">Multi-Source Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Cross-reference data from CoinGecko, blockchain explorers, and security APIs for maximum accuracy.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>CoinGecko API</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Blockchain Data</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Security Audits</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start */}
        <div className="w-full max-w-4xl">
          <Card className="backdrop-blur-md bg-card/80 border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Ready to Analyze?</CardTitle>
              <p className="text-muted-foreground">
                Enter any cryptocurrency symbol or contract address to get started with professional risk assessment.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="flex-1 max-w-xs">
                <Link href="/analysis">
                  <Shield className="mr-2 h-5 w-5" />
                  Analyze Token Risk
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1 max-w-xs">
                <Link href="/dashboard">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Market Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search Section */}
        <div className="w-full max-w-4xl mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">Quick Crypto Search</h2>
          <EnhancedSearch
            onSelect={(result) => {
              // Navigate to analysis page with selected crypto
              window.location.href = `/dashboard?search=${result.symbol}`
            }}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Performance Metrics */}
        <div className="w-full max-w-4xl mb-12">
          <PerformanceMetrics showDetailed={false} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="backdrop-blur-md bg-card/50 border border-border rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-center size-14 rounded-full bg-green-500/10 mb-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500"
              >
                <path d="M20 7h-7" />
                <path d="M14 17H6" />
                <circle cx="4" cy="7" r="1" />
                <circle cx="17" cy="17" r="1" />
                <path d="M4 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v0Z" />
                <path d="M18 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v0Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Risk Assessment</h3>
            <p className="text-muted-foreground mb-4">
              Advanced algorithms analyze market trends, liquidity, contract security, and holder concentration to determine risk levels.
            </p>
          </div>
          
          <div className="backdrop-blur-md bg-card/50 border border-border rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-center size-14 rounded-full bg-purple-500/10 mb-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-500"
              >
                <path d="M3 3v18h18" />
                <path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                <path d="M9 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                <path d="M18 6v9" />
                <path d="M18 15h-9" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Real-Time Monitoring</h3>
            <p className="text-muted-foreground mb-4">
              Track your portfolio's risk exposure in real-time with live alerts on significant market events and security threats.
            </p>
          </div>
          
          <div className="backdrop-blur-md bg-card/50 border border-border rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-center size-14 rounded-full bg-blue-500/10 mb-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-500"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Investment Safety</h3>
            <p className="text-muted-foreground mb-4">
              Make informed decisions with comprehensive security analysis, fraud detection, and vulnerability assessments.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
