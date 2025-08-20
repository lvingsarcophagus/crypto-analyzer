"use client"

import { useState, useEffect } from "react"
import { Search, Filter, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TokenResult {
  id: string
  symbol: string
  name: string
  image?: string
  market_cap_rank?: number
  current_price?: number
  confidence_score: number
  resolution_method: string
}

interface RiskAnalysis {
  overall_score: number
  risk_level: string
  risk_factors: any[]
}

interface AnalysisResult {
  token: {
    id: string
    symbol: string
    name: string
    current_price?: number
    market_cap?: number
    market_cap_rank?: number
  }
  risk_analysis: RiskAnalysis
  analysis_metadata: {
    timestamp: string
    success?: boolean
  }
}

export function TokenSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<TokenResult[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedToken, setSelectedToken] = useState<TokenResult | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const searchTokens = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Use real CoinGecko search API
      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(searchQuery)}`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data = await response.json()
      
      // Transform CoinGecko search results to our format
      const searchResults: TokenResult[] = data.coins?.slice(0, 5).map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        confidence_score: 0.95,
        resolution_method: 'coingecko_search',
        market_cap_rank: coin.market_cap_rank
      })) || []
      
      setResults(searchResults)
    } catch (error) {
      console.error("Search failed:", error)
      setResults([])
      setError("Search failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const analyzeToken = async (tokenId: string) => {
    setAnalyzing(true)
    setError(null)
    console.log(`🔍 Starting analysis for: ${tokenId}`)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenId })
      })

      console.log(`📡 API Response Status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ API Error:', errorData)
        throw new Error(`Analysis failed: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Analysis successful:', data)
      setAnalysisResult(data)
      setError(null)
    } catch (error) {
      console.error('❌ Analysis error:', error)
      setError(error instanceof Error ? error.message : 'Analysis failed')
      setAnalysisResult(null)
    } finally {
      setAnalyzing(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchTokens(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleTokenSelect = (token: TokenResult) => {
    setSelectedToken(token)
    analyzeToken(token.id)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Token Search & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by token name, symbol, or contract address..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Exclude Stablecoins</DropdownMenuItem>
                <DropdownMenuItem>Exclude Meme Coins</DropdownMenuItem>
                <DropdownMenuItem>Top 100 Only</DropdownMenuItem>
                <DropdownMenuItem>High Volume Only</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((token) => (
                <Card
                  key={token.id}
                  className="cursor-pointer transition-colors hover:bg-accent/10 border-l-4 border-l-primary/20"
                  onClick={() => handleTokenSelect(token)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {token.image && (
                          <img
                            src={token.image || "/placeholder.svg"}
                            alt={token.name}
                            className="h-8 w-8 rounded-full"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{token.symbol}</span>
                            <Badge variant="secondary" className="text-xs">
                              #{token.market_cap_rank || "N/A"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{token.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {token.current_price && (
                          <p className="font-semibold">${token.current_price.toLocaleString()}</p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          {Math.round(token.confidence_score * 100)}% match
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {query && !loading && results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>No tokens found matching "{query}"</p>
              <p className="text-sm">Try searching by symbol, name, or contract address</p>
            </div>
          )}

          {/* Analysis Results */}
          {analyzing && (
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span>Analyzing {selectedToken?.symbol || 'token'}...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {analysisResult && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Risk Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">{analysisResult.token.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {analysisResult.token.symbol?.toUpperCase()} • Rank #{analysisResult.token.market_cap_rank || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    {analysisResult.token.current_price && (
                      <p className="font-bold text-lg">
                        ${analysisResult.token.current_price.toLocaleString()}
                      </p>
                    )}
                    {analysisResult.token.market_cap && (
                      <p className="text-sm text-muted-foreground">
                        MCap: ${(analysisResult.token.market_cap / 1e9).toFixed(1)}B
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Risk Score</span>
                    <Badge 
                      variant={
                        analysisResult.risk_analysis.risk_level === 'LOW' ? 'secondary' :
                        analysisResult.risk_analysis.risk_level === 'MEDIUM' ? 'default' :
                        'destructive'
                      }
                    >
                      {analysisResult.risk_analysis.overall_score}/100 - {analysisResult.risk_analysis.risk_level}
                    </Badge>
                  </div>
                  
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        analysisResult.risk_analysis.risk_level === 'LOW' ? 'bg-green-500' :
                        analysisResult.risk_analysis.risk_level === 'MEDIUM' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${analysisResult.risk_analysis.overall_score}%` }}
                    />
                  </div>
                </div>

                {analysisResult.risk_analysis.risk_factors && analysisResult.risk_analysis.risk_factors.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium">Risk Factors</h5>
                    {analysisResult.risk_analysis.risk_factors.slice(0, 3).map((factor, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{factor.category}</span>
                        <span>{factor.score}/100</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(analysisResult.analysis_metadata.timestamp).toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
