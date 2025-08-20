"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RiskFactorDisplay } from "@/components/analysis/risk-factor-display"
import {
  Shield,
  AlertTriangle,
  ChevronLeft,
  Check,
  Download,
  Share2,
  Info,
} from "lucide-react"
import Link from "next/link"
import type { EnhancedRiskAnalysis } from "@/lib/advanced-risk-analyzer"
import { ConfidenceMetricsDisplay } from "@/components/analysis/confidence-metrics-display"
import { PeerComparisonDisplay } from "@/components/analysis/peer-comparison-display"
import { RealTimeAlertsDisplay } from "@/components/analysis/real-time-alerts-display"

interface AnalysisResponse {
  token: {
    id: string
    symbol: string
    name: string
    image: string
    current_price: number
    market_cap: number
    market_cap_rank: number
  }
  risk_analysis: EnhancedRiskAnalysis
}

function AnalysisResultsPageContent() {
  const searchParams = useSearchParams()
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const dataParam = searchParams.get("data")
    if (dataParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataParam))
        setAnalysisResult(parsedData)
      } catch (e) {
        console.error("Failed to parse analysis data from URL", e)
        setError("Invalid analysis data provided.")
      } finally {
        setLoading(false)
      }
    } else {
      setError("No analysis data found in the URL.")
      setLoading(false)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Loading Analysis Results...</h2>
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
          <p className="text-muted-foreground mb-6">{error || "Could not display analysis results."}</p>
          <Button asChild>
            <Link href="/analysis">
              <ChevronLeft className="mr-2 h-4 w-4" /> Try Again
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const { token, risk_analysis } = analysisResult

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
    if (!num) return "$0"
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" asChild className="mb-6">
            <Link href="/analysis">
              <ChevronLeft className="mr-2 h-4 w-4" /> New Analysis
            </Link>
          </Button>
          
          <div className="flex items-center gap-4 mb-2">
            {token.image && <img src={token.image} alt={token.name} className="h-10 w-10 rounded-full" />}
            <h1 className="text-3xl font-bold">{token.name} ({token.symbol.toUpperCase()})</h1>
          </div>
          <p className="text-muted-foreground">
            Displaying analysis results from {new Date(risk_analysis.last_updated).toLocaleString()}
          </p>
        </div>
        
        {/* Overview Card */}
        <Card className="backdrop-blur-md bg-card/80 border-border shadow-xl mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl">Overall Risk Assessment</CardTitle>
              <Badge 
                className={`${getRiskBgColor(risk_analysis.risk_level)} ${getRiskColor(risk_analysis.risk_level)} border-0`}
              >
                {risk_analysis.risk_level} RISK
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="text-2xl font-bold">{token.symbol.toUpperCase()}/USD</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatLargeNumber(token.current_price)}</div>
                    <div className={risk_analysis.risk_factors.find(f => f.category === 'Market Metrics')?.score ?? 50 > 50 ? "text-red-500" : "text-green-500"}>
                      {/* This needs to be properly calculated from data */}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Market Cap</div>
                    <div className="font-medium">{formatLargeNumber(token.market_cap)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Market Cap Rank</div>
                    <div className="font-medium">#{token.market_cap_rank}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex flex-col">
                  <div className="flex justify-between mb-2">
                    <span className="text-lg">Overall Risk Score</span>
                    <span className={`font-bold text-2xl ${getRiskColor(risk_analysis.risk_level)}`}>
                      {risk_analysis.overall_score}/100
                    </span>
                  </div>
                  <div className="w-full bg-secondary/20 rounded-full h-3 mb-6">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        risk_analysis.risk_level === "LOW" ? "bg-green-500" :
                        risk_analysis.risk_level === "MEDIUM" ? "bg-yellow-500" :
                        risk_analysis.risk_level === "HIGH" ? "bg-orange-500" : "bg-red-500"
                      }`}
                      style={{ width: `${risk_analysis.overall_score}%` }}
                    ></div>
                  </div>
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

        {/* Recommendations */}
        <Card className="mb-8 backdrop-blur-md bg-card/80 border-border shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> Key Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {risk_analysis.recommendations.map((rec, index) => (
                <li key={index} className="flex gap-3 items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Risk Factors */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Detailed Risk Factor Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {risk_analysis.risk_factors.map((factor) => (
              <RiskFactorDisplay key={factor.category} factor={factor} />
            ))}
          </div>
        </div>

        {/* Enhanced Metrics */}
        <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Enhanced Analysis Metrics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <ConfidenceMetricsDisplay metrics={risk_analysis.confidence_metrics} />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <PeerComparisonDisplay comparison={risk_analysis.peer_comparison} />
                    <RealTimeAlertsDisplay alerts={risk_analysis.real_time_alerts} />
                </div>
            </div>
        </div>

      </div>
    </div>
  )
}


export default function AnalysisResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalysisResultsPageContent />
    </Suspense>
  )
}
