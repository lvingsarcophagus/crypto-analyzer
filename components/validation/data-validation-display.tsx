"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertTriangle, XCircle, Shield, TrendingUp, Database } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ValidationResult {
  field: string
  sources: Record<string, any>
  consensus_value: any
  confidence_score: number
  discrepancies: string[]
  validation_status: "valid" | "warning" | "error"
  resolution_method: string
}

interface CrossValidationReport {
  token_id: string
  timestamp: string
  overall_confidence: number
  validation_results: ValidationResult[]
  data_quality_score: number
  anomalies_detected: string[]
  recommendations: string[]
}

export function DataValidationDisplay() {
  const [validationReport, setValidationReport] = useState<CrossValidationReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedToken, setSelectedToken] = useState<string | null>(null)

  useEffect(() => {
    const handleTokenSelection = (event: CustomEvent) => {
      setSelectedToken(event.detail.id)
      performDataValidation(event.detail.id)
    }

    window.addEventListener("tokenSelected", handleTokenSelection as EventListener)
    return () => window.removeEventListener("tokenSelected", handleTokenSelection as EventListener)
  }, [])

  const performDataValidation = async (tokenId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/validation/cross-source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId }),
      })
      const data = await response.json()
      setValidationReport(data.report)
    } catch (error) {
      console.error("Data validation failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Shield className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "text-green-600 bg-green-50 border-green-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "error":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  if (!selectedToken) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Select a token for data validation</p>
            <p className="text-sm">Cross-source validation will verify data accuracy across multiple APIs</p>
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
            <p className="text-lg font-medium">Validating Data Sources</p>
            <p className="text-sm text-muted-foreground">Cross-referencing multiple APIs...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!validationReport) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-lg font-medium">Validation Failed</p>
            <p className="text-sm">Unable to validate data sources. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Validation Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Data Validation Report
            </div>
            <Badge
              className={
                validationReport.overall_confidence > 0.8
                  ? "bg-green-50 text-green-700 border-green-200"
                  : validationReport.overall_confidence > 0.6
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : "bg-red-50 text-red-700 border-red-200"
              }
            >
              {validationReport.overall_confidence > 0.8
                ? "High Confidence"
                : validationReport.overall_confidence > 0.6
                  ? "Medium Confidence"
                  : "Low Confidence"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {Math.round(validationReport.overall_confidence * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Overall Confidence</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">
                {Math.round(validationReport.data_quality_score * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Data Quality</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">{validationReport.validation_results.length}</p>
              <p className="text-sm text-muted-foreground">Fields Validated</p>
            </div>
          </div>

          {validationReport.anomalies_detected.length > 0 && (
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="font-medium text-yellow-800">Anomalies Detected</p>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validationReport.anomalies_detected.map((anomaly, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>{anomaly}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Validation Results */}
      <Tabs defaultValue="results" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results">Validation Results</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {validationReport.validation_results.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="capitalize">{result.field.replace("_", " ")}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(result.validation_status)} variant="outline">
                      {getStatusIcon(result.validation_status)}
                      {result.validation_status.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-normal">{Math.round(result.confidence_score * 100)}% confidence</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confidence Score</span>
                  <span className="text-sm">{Math.round(result.confidence_score * 100)}%</span>
                </div>
                <Progress value={result.confidence_score * 100} className="h-2" />

                {result.consensus_value !== null && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm font-medium mb-2">Consensus Value</p>
                    <p className="text-lg font-bold">
                      {typeof result.consensus_value === "number"
                        ? result.consensus_value.toLocaleString()
                        : result.consensus_value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Resolution: {result.resolution_method.replace("_", " ")}
                    </p>
                  </div>
                )}

                {Object.keys(result.sources).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Source Values</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(result.sources).map(([source, value]) => (
                        <div key={source} className="flex justify-between items-center p-2 rounded bg-card border">
                          <span className="text-sm font-medium">{source}</span>
                          <span className="text-sm">{typeof value === "number" ? value.toLocaleString() : value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.discrepancies.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-destructive">Discrepancies</p>
                    <ul className="text-sm space-y-1">
                      {result.discrepancies.map((discrepancy, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-destructive mt-1">•</span>
                          <span>{discrepancy}</span>
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
              <CardTitle className="text-base">Data Validation Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {validationReport.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                  <div className="flex-shrink-0 mt-0.5">
                    {recommendation.includes("LOW CONFIDENCE") || recommendation.includes("⚠️") ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    ) : recommendation.includes("HIGH CONFIDENCE") || recommendation.includes("✅") ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}

              <div className="mt-6 p-4 rounded-lg bg-muted">
                <p className="text-sm font-medium mb-2">Validation Summary</p>
                <p className="text-xs text-muted-foreground">
                  Report generated: {new Date(validationReport.timestamp).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Token ID: {validationReport.token_id}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
