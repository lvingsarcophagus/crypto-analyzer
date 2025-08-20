"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function AdvancedAnalysisPage() {
  const [tokenId, setTokenId] = useState("")
  const [address, setAddress] = useState("")
  const [chain, setChain] = useState("ethereum")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function runAdvanced() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/analyze/advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: tokenId || "bitcoin",
          tokenAddress: address || undefined,
          blockchain: chain,
          includeHistorical: true,
          enableCrossValidation: true,
          enableRealtimeMonitoring: false,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed")
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Advanced Risk Analysis</h1>
        <p className="text-sm text-muted-foreground">Multi-source, deeper insights with cross-validation and historical trends.</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input placeholder="Token ID (e.g., bitcoin, ethereum)" value={tokenId} onChange={(e)=>setTokenId(e.target.value)} className="md:col-span-2" />
          <Input placeholder="Contract Address (optional)" value={address} onChange={(e)=>setAddress(e.target.value)} className="md:col-span-2" />
          <Input placeholder="Blockchain (ethereum, bsc, etc.)" value={chain} onChange={(e)=>setChain(e.target.value)} />
          <div className="md:col-span-5 flex gap-3">
            <Button onClick={runAdvanced} disabled={loading}>{loading ? "Analyzing…" : "Run Advanced Analysis"}</Button>
            {result?.metadata?.confidence_level !== undefined && (
              <Badge variant="secondary">Confidence: {Math.round((result.metadata.confidence_level||0)*100)}%</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-destructive/50">
          <CardContent className="p-4 text-destructive text-sm">{error}</CardContent>
        </Card>
      )}

      {result && (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="risk">Risk Details</TabsTrigger>
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
            <TabsTrigger value="history">Historical</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                  <div className="text-3xl font-bold">{result.comprehensive_data?.risk_analysis?.overall_score ?? "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Risk Level</div>
                  <div className="text-xl font-semibold">{result.comprehensive_data?.risk_analysis?.risk_level ?? "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Confidence</div>
                  <div className="text-xl font-semibold">{Math.round((result.metadata?.confidence_level||0)*100)}%</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk">
            <Card>
              <CardContent className="p-4 md:p-6 space-y-3">
                <div className="text-sm text-muted-foreground">Key Factors</div>
                <ul className="list-disc pl-4 text-sm">
                  {result.comprehensive_data?.risk_analysis?.risk_factors?.slice(0,8)?.map((f:any, idx:number)=> (
                    <li key={idx}><span className="font-medium">{f.category}</span>: {f.description || f.detail || ""} ({f.risk_level})</li>
                  )) || <li>No factors available.</li>}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <Card>
              <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium mb-2">APIs Integrated</div>
                  <div className="flex flex-wrap gap-2">
                    {(result.metadata?.apis_integrated||[]).map((n:string)=>(<Badge key={n}>{n}</Badge>))}
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-2">Data Sources Used</div>
                  <div className="flex flex-wrap gap-2">
                    {(result.metadata?.data_sources_used||[]).map((n:string)=>(<Badge variant="secondary" key={n}>{n}</Badge>))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardContent className="p-4 md:p-6 text-sm">
                <div className="font-medium mb-2">Historical Trends</div>
                <pre className="whitespace-pre-wrap text-xs opacity-90">
{JSON.stringify(result.comprehensive_data?.risk_analysis?.historical_trends, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
