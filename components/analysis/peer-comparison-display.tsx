"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EnhancedRiskAnalysis } from "@/lib/advanced-risk-analyzer"

interface PeerComparisonProps {
  comparison: EnhancedRiskAnalysis["peer_comparison"]
}

export function PeerComparisonDisplay({ comparison }: PeerComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Peer Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">Relative Risk Ranking: <strong>{comparison.relative_risk_ranking}</strong> of {comparison.similar_tokens.length + 1}</p>
          <p className="text-sm">Market Segment Average Score: <strong>{comparison.market_segment_average}</strong></p>
          <p className="text-sm">Similar Tokens: {comparison.similar_tokens.join(", ")}</p>
        </div>
      </CardContent>
    </Card>
  )
}
