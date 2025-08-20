"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Shield, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RiskFactor {
  category: string
  score: number
  weight: number
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  explanation: string
  contributing_factors: string[]
}

interface RiskAnalysis {
  token_id: string
  overall_score: number
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  risk_factors: RiskFactor[]
  recommendations: string[]
  last_updated: string
  confidence_metrics?: {
    overall_confidence: number
    data_completeness: number
    source_reliability: number
  }
}

export function RiskAnalysisDisplay() {
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedToken, setSelectedToken] = useState<any>(null)

  useEffect(() => {
    const handleTokenSelection = (event: CustomEvent) => {
      setSelectedToken(event.detail)
      performRiskAnalysis(event.detail.id)
    }

    window.addEventListener("tokenSelected", handleTokenSelection as EventListener)
    return () => window.removeEventListener("tokenSelected", handleTokenSelection as EventListener)
  }, [])

  const performRiskAnalysis = async (tokenId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/analyze/advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId, includeHistorical: true }),
      })
      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error("Risk analysis failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "text-green-600 bg-green-50 border-green-200"
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "HIGH":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "CRITICAL":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "LOW":
        return <CheckCircle className="h-4 w-4" />
      case "MEDIUM":
        return <Clock className="h-4 w-4" />
      case "HIGH":
        return <TrendingUp className="h-4 w-4" />
      case "CRITICAL":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  if (!selectedToken) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Select a token to analyze</p>
            <p className="text-sm">Search for a cryptocurrency above to see its risk assessment</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg font-medium">Analyzing {selectedToken.symbol}</p>
            <p className="text-sm text-muted-foreground">Gathering data from multiple sources...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-lg font-medium">Analysis Failed</p>
            <p className="text-sm">Unable to analyze {selectedToken.symbol}. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Risk Analysis: {selectedToken.symbol}
            </div>
            <Badge className={getRiskColor(analysis.risk_level)}>
              {getRiskIcon(analysis.risk_level)}
              {analysis.risk_level} RISK
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Risk Score</span>
            <span className="text-2xl font-bold">{analysis.overall_score}/100</span>
          </div>
          <Progress value={analysis.overall_score} className="h-3" />

          {analysis.confidence_metrics && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {Math.round(analysis.confidence_metrics.overall_confidence * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Confidence</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">
                  {Math.round(analysis.confidence_metrics.data_completeness * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Data Complete</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">
                  {Math.round(analysis.confidence_metrics.source_reliability * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Source Quality</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="factors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="factors">Risk Factors</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="factors" className="space-y-4">
          {analysis.risk_factors.map((factor, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{factor.category}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskColor(factor.risk_level)} variant="outline">
                      {factor.risk_level}
                    </Badge>
                    <span className="text-sm font-normal">{factor.score}/100</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={factor.score} className="h-2" />
                <p className="text-sm text-muted-foreground">{factor.explanation}</p>
                {factor.contributing_factors.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Contributing Factors:</p>
                    <ul className="text-xs space-y-1">
                      {factor.contributing_factors.map((contributingFactor, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-destructive mt-1">•</span>
                          <span>{contributingFactor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Investment Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                  <div className="flex-shrink-0 mt-0.5">
                    {recommendation.includes("AVOID") || recommendation.includes("HIGH RISK") ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : recommendation.includes("LOWER RISK") ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
