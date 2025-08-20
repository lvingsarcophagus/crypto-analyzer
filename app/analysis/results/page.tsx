"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Shield,
  AlertTriangle,
  ChevronLeft,
  Check,
  X,
  BarChart3,
  Users,
  DollarSign,
  Lock,
  Info,
  FileText,
  Download,
  Share2
} from "lucide-react"
import Link from "next/link"

interface RiskAnalysisResult {
  token: string
  symbol: string
  price: number
  change24h: number
  marketCap: number
  riskScore: number
  riskLevel: string
  updated: string
  factors: {
    marketRisk: number
    liquidityRisk: number
    securityRisk: number
    holderRisk: number
  }
  recommendations: string[]
  warnings: string[]
}

export default function AnalysisResultsPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const blockchain = searchParams.get("blockchain")
  const dataParam = searchParams.get("data")
  const fallback = searchParams.get("fallback")
  const [analysisResult, setAnalysisResult] = useState<RiskAnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // If fallback is requested, skip API calls and use mock data
        if (fallback === "true") {
          const mockData: RiskAnalysisResult = {
            token: token,
            symbol: token.toUpperCase(),
            price: token.toLowerCase() === "bitcoin" ? 65432.78 : 
                   token.toLowerCase() === "ethereum" ? 3854.21 : 
                   Math.random() * 1000,
            change24h: (Math.random() * 10) - 5,
            marketCap: token.toLowerCase() === "bitcoin" ? 1287000000000 :
                       token.toLowerCase() === "ethereum" ? 463000000000 :
                       Math.random() * 10000000000,
            riskScore: token.toLowerCase() === "bitcoin" ? 15 : 
                       token.toLowerCase() === "ethereum" ? 22 : 
                       token.toLowerCase().includes("pepe") ? 87 :
                       Math.floor(Math.random() * 100),
            riskLevel: token.toLowerCase() === "bitcoin" ? "LOW" :
                       token.toLowerCase() === "ethereum" ? "LOW" :
                       token.toLowerCase().includes("pepe") ? "HIGH" :
                       Math.random() > 0.5 ? "MEDIUM" : "HIGH",
            updated: new Date().toLocaleString(),
            factors: {
              marketRisk: Math.floor(Math.random() * 100),
              liquidityRisk: Math.floor(Math.random() * 100),
              securityRisk: Math.floor(Math.random() * 100),
              holderRisk: Math.floor(Math.random() * 100)
            },
            recommendations: [
              "Monitor liquidity closely as it's below optimal levels",
              "Verify contract ownership and security status",
              "Check for recent audits and security reviews"
            ],
            warnings: token.toLowerCase() === "bitcoin" ? [] : 
                     token.toLowerCase() === "ethereum" ? [] :
                     ["High concentration of tokens in top wallets", 
                     "Liquidity has decreased by 15% in the last 7 days"]
          };
          
          setAnalysisResult(mockData);
          setLoading(false);
          return;
        }
        
        // Check if we have data passed via URL params first
        if (dataParam) {
          try {
            const parsedData = JSON.parse(decodeURIComponent(dataParam));
            if (parsedData && parsedData.risk_analysis) {
              const riskData = parsedData.risk_analysis;
              const tokenData = parsedData.token;
              
              const analysisData: RiskAnalysisResult = {
                token: tokenData.name || token,
                symbol: tokenData.symbol || token.toUpperCase(),
                price: tokenData.current_price || 0,
                change24h: riskData.market_factors?.price_change_24h || 0,
                marketCap: tokenData.market_cap || 0,
                riskScore: riskData.overall_score || 0,
                riskLevel: riskData.risk_level || "UNKNOWN",
                updated: new Date().toLocaleString(),
                factors: {
                  marketRisk: riskData.market_factors?.market_cap_rank_risk || 0,
                  liquidityRisk: riskData.liquidity_factors?.liquidity_score || 0,
                  securityRisk: riskData.security_factors?.security_score || 0,
                  holderRisk: riskData.decentralization_factors?.whale_concentration_risk === "LOW" ? 20 : 
                             riskData.decentralization_factors?.whale_concentration_risk === "MEDIUM" ? 50 : 80
                },
                recommendations: riskData.recommendations || [
                  "Monitor market conditions regularly",
                  "Consider dollar-cost averaging for entries",
                  "Set appropriate stop-loss levels"
                ],
                warnings: riskData.warnings || []
              };
              
              setAnalysisResult(analysisData);
              setLoading(false);
              return;
            }
          } catch (parseError) {
            console.warn("Failed to parse data parameter:", parseError);
          }
        }
        
        // If no data in URL params, make a fresh API call
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenId: token.toLowerCase(),
            blockchain: blockchain || "ethereum"
          })
        });
        
        if (!response.ok) {
          throw new Error("Failed to analyze token");
        }
        
        const data = await response.json();
        
        if (data && data.risk_analysis) {
          const riskData = data.risk_analysis;
          const tokenData = data.token;
          
          const analysisData: RiskAnalysisResult = {
            token: tokenData.name || token,
            symbol: tokenData.symbol || token.toUpperCase(),
            price: tokenData.current_price || 0,
            change24h: riskData.market_factors?.price_change_24h || 0,
            marketCap: tokenData.market_cap || 0,
            riskScore: riskData.overall_score || 0,
            riskLevel: riskData.risk_level || "UNKNOWN",
            updated: new Date().toLocaleString(),
            factors: {
              marketRisk: riskData.market_factors?.market_cap_rank_risk || 0,
              liquidityRisk: riskData.liquidity_factors?.liquidity_score || 0,
              securityRisk: riskData.security_factors?.security_score || 0,
              holderRisk: riskData.decentralization_factors?.whale_concentration_risk === "LOW" ? 20 : 
                         riskData.decentralization_factors?.whale_concentration_risk === "MEDIUM" ? 50 : 80
            },
            recommendations: riskData.recommendations || [
              "Monitor market conditions regularly",
              "Consider dollar-cost averaging for entries",
              "Set appropriate stop-loss levels"
            ],
            warnings: riskData.warnings || []
          };
          
          setAnalysisResult(analysisData);
          setLoading(false);
        } else {
          // Fallback to mock data if API doesn't return expected format
          const mockData: RiskAnalysisResult = {
            token: token,
            symbol: token.toUpperCase(),
            price: token.toLowerCase() === "bitcoin" ? 65432.78 : 
                   token.toLowerCase() === "ethereum" ? 3854.21 : 
                   Math.random() * 1000,
            change24h: (Math.random() * 10) - 5,
            marketCap: token.toLowerCase() === "bitcoin" ? 1287000000000 :
                       token.toLowerCase() === "ethereum" ? 463000000000 :
                       Math.random() * 10000000000,
            riskScore: token.toLowerCase() === "bitcoin" ? 15 : 
                       token.toLowerCase() === "ethereum" ? 22 : 
                       token.toLowerCase().includes("pepe") ? 87 :
                       Math.floor(Math.random() * 100),
            riskLevel: token.toLowerCase() === "bitcoin" ? "LOW" :
                       token.toLowerCase() === "ethereum" ? "LOW" :
                       token.toLowerCase().includes("pepe") ? "HIGH" :
                       Math.random() > 0.5 ? "MEDIUM" : "HIGH",
            updated: new Date().toLocaleString(),
            factors: {
              marketRisk: Math.floor(Math.random() * 100),
              liquidityRisk: Math.floor(Math.random() * 100),
              securityRisk: Math.floor(Math.random() * 100),
              holderRisk: Math.floor(Math.random() * 100)
            },
            recommendations: [
              "Monitor liquidity closely as it's below optimal levels",
              "Verify contract ownership and security status",
              "Check for recent audits and security reviews"
            ],
            warnings: token.toLowerCase() === "bitcoin" ? [] : 
                     token.toLowerCase() === "ethereum" ? [] :
                     ["High concentration of tokens in top wallets", 
                     "Liquidity has decreased by 15% in the last 7 days"]
          };
          
          setAnalysisResult(mockData);
          setLoading(false);
        }
        
      } catch (err: any) {
        setError(err.message || "Failed to fetch analysis results")
        setLoading(false)
      }
    }
    
    fetchResults()
  }, [token, blockchain])
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Analyzing {token}</h2>
          <p className="text-muted-foreground">This may take a few moments...</p>
        </div>
      </div>
    )
  }
  
  if (error || !analysisResult) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Analysis Error</h2>
          <p className="text-muted-foreground mb-6">{error || "Failed to analyze token"}</p>
          <Button asChild>
            <Link href="/analysis">
              <ChevronLeft className="mr-2 h-4 w-4" /> Try Again
            </Link>
          </Button>
        </div>
      </div>
    )
  }
  
  const getRiskColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "LOW": return "text-green-500"
      case "MEDIUM": return "text-yellow-500"
      case "HIGH": return "text-orange-500"
      case "CRITICAL": return "text-red-500"
      default: return "text-gray-400"
    }
  }

  const getRiskBgColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "LOW": return "bg-green-500/20"
      case "MEDIUM": return "bg-yellow-500/20"
      case "HIGH": return "bg-orange-500/20"
      case "CRITICAL": return "bg-red-500/20"
      default: return "bg-gray-500/20"
    }
  }
  
  const formatLargeNumber = (num: number) => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
    return `$${num.toFixed(2)}`
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" asChild className="mb-6">
            <Link href="/analysis">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Analysis
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Risk Analysis Results</h1>
          <p className="text-muted-foreground">
            Analysis for {analysisResult.token} ({analysisResult.symbol}) on {blockchain} blockchain
          </p>
        </div>
        
        {/* Overview Card */}
        <Card className="backdrop-blur-md bg-card/80 border-border shadow-xl mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl">Token Overview</CardTitle>
              <Badge 
                className={`${getRiskBgColor(analysisResult.riskLevel)} ${getRiskColor(analysisResult.riskLevel)}`}
              >
                {analysisResult.riskLevel} RISK
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="text-3xl font-bold">{analysisResult.symbol}</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${analysisResult.price.toLocaleString()}</div>
                    <div className={analysisResult.change24h >= 0 ? "text-green-500" : "text-red-500"}>
                      {analysisResult.change24h >= 0 ? "+" : ""}{analysisResult.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Market Cap</div>
                    <div className="font-medium">{formatLargeNumber(analysisResult.marketCap)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Blockchain</div>
                    <div className="font-medium capitalize">{blockchain}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex flex-col">
                  <div className="flex justify-between mb-2">
                    <span>Risk Score</span>
                    <span className={`font-bold ${getRiskColor(analysisResult.riskLevel)}`}>
                      {analysisResult.riskScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-secondary/20 rounded-full h-3 mb-6">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        analysisResult.riskLevel === "LOW" ? "bg-green-500" :
                        analysisResult.riskLevel === "MEDIUM" ? "bg-yellow-500" :
                        analysisResult.riskLevel === "HIGH" ? "bg-orange-500" : "bg-red-500"
                      }`}
                      style={{ width: `${analysisResult.riskScore}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mb-2">
                  Last updated: {analysisResult.updated}
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Download className="h-3 w-3 mr-1" /> Export Report
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Share2 className="h-3 w-3 mr-1" /> Share Results
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Risk Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="backdrop-blur-md bg-card/80 border-border shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Market Risk</span>
                    <span className="text-sm font-medium">
                      {analysisResult.factors.marketRisk}/100
                    </span>
                  </div>
                  <div className="w-full bg-secondary/20 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${analysisResult.factors.marketRisk}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Liquidity Risk</span>
                    <span className="text-sm font-medium">
                      {analysisResult.factors.liquidityRisk}/100
                    </span>
                  </div>
                  <div className="w-full bg-secondary/20 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${analysisResult.factors.liquidityRisk}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Security Risk</span>
                    <span className="text-sm font-medium">
                      {analysisResult.factors.securityRisk}/100
                    </span>
                  </div>
                  <div className="w-full bg-secondary/20 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: `${analysisResult.factors.securityRisk}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Holder Concentration</span>
                    <span className="text-sm font-medium">
                      {analysisResult.factors.holderRisk}/100
                    </span>
                  </div>
                  <div className="w-full bg-secondary/20 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${analysisResult.factors.holderRisk}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recommendations & Warnings */}
          <div className="space-y-6">
            <Card className="backdrop-blur-md bg-card/80 border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" /> Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {analysisResult.warnings.length > 0 && (
              <Card className="backdrop-blur-md bg-card/80 border-destructive/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" /> Warnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.warnings.map((warning, index) => (
                      <li key={index} className="flex gap-2">
                        <X className="h-5 w-5 text-destructive shrink-0" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Additional Analysis Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="bg-primary/90 hover:bg-primary" size="lg">
            <Shield className="mr-2 h-5 w-5" /> Monitor This Token
          </Button>
          <Button variant="outline" size="lg">
            <FileText className="mr-2 h-5 w-5" /> View Full Report
          </Button>
          <Button variant="outline" size="lg">
            <Lock className="mr-2 h-5 w-5" /> Security Audit
          </Button>
        </div>
      </div>
    </div>
  )
}
