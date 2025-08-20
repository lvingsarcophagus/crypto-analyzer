"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RiskFactor } from "@/types/crypto"

interface RiskFactorDisplayProps {
  factor: RiskFactor
}

export function RiskFactorDisplay({ factor }: RiskFactorDisplayProps) {
  const getRiskColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "LOW": return "text-green-500"
      case "MEDIUM": return "text-yellow-500"
      case "HIGH": return "text-orange-500"
      case "CRITICAL": return "text-red-500"
      default: return "text-gray-400"
    }
  }

  return (
    <Card className="backdrop-blur-md bg-card/80 border-border shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex justify-between items-center">
          <span>{factor.category}</span>
          <Badge className={getRiskColor(factor.risk_level)}>{factor.risk_level}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Score</span>
          <span className={`font-bold text-2xl ${getRiskColor(factor.risk_level)}`}>
            {factor.score}/100
          </span>
        </div>
        <div className="w-full bg-secondary/20 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full ${
              factor.risk_level === "LOW" ? "bg-green-500" :
              factor.risk_level === "MEDIUM" ? "bg-yellow-500" :
              factor.risk_level === "HIGH" ? "bg-orange-500" : "bg-red-500"
            }`}
            style={{ width: `${factor.score}%` }}
          ></div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{factor.explanation}</p>
        <div className="space-y-1 text-xs">
          {factor.contributing_factors.map((reason, index) => (
            <p key={index}>- {reason}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
