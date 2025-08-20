"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { ConfidenceMetrics } from "@/lib/advanced-risk-analyzer"

interface ConfidenceMetricsProps {
  metrics: ConfidenceMetrics
}

export function ConfidenceMetricsDisplay({ metrics }: ConfidenceMetricsProps) {
  const getConfidenceColor = (score: number) => {
    if (score > 0.8) return "bg-green-500"
    if (score > 0.6) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Confidence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Overall Confidence</span>
            <span className="text-sm font-medium">{(metrics.overall_confidence * 100).toFixed(0)}%</span>
          </div>
          <Progress value={metrics.overall_confidence * 100} className={getConfidenceColor(metrics.overall_confidence)} />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Data Completeness</span>
             <span className="text-sm font-medium">{(metrics.data_completeness * 100).toFixed(0)}%</span>
          </div>
          <Progress value={metrics.data_completeness * 100} />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Source Reliability</span>
             <span className="text-sm font-medium">{(metrics.source_reliability * 100).toFixed(0)}%</span>
          </div>
          <Progress value={metrics.source_reliability * 100} />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm">Cross-Validation Score</span>
             <span className="text-sm font-medium">{(metrics.cross_validation_score * 100).toFixed(0)}%</span>
          </div>
          <Progress value={metrics.cross_validation_score * 100} />
        </div>
      </CardContent>
    </Card>
  )
}
