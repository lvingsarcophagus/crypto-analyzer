"use client"

import { AdvancedAnalysisForm } from "@/components/analysis/advanced-analysis-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Database, TrendingUp } from "lucide-react"

export default function AnalysisPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Comprehensive Crypto Risk Analysis
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Enter a token symbol or contract address to perform a deep, multi-factor risk assessment.
          </p>
        </div>
        
        {/* Advanced Analysis Form */}
        <AdvancedAnalysisForm />

        {/* Analysis Features Grid */}
        <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-8">Powered by a Multi-Layered Analysis Engine</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="backdrop-blur-md bg-card/60 border-border text-center">
                    <CardHeader>
                        <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle>Smart Contract Security</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Detects vulnerabilities, checks for verified source code, and analyzes ownership controls.
                        </p>
                    </CardContent>
                </Card>

                <Card className="backdrop-blur-md bg-card/60 border-border text-center">
                    <CardHeader>
                        <div className="w-16 h-16 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Database className="h-8 w-8 text-secondary" />
                        </div>
                        <CardTitle>On-Chain Data Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Analyzes holder concentration, liquidity pools, and transaction behavior to identify risks.
                        </p>
                    </CardContent>
                </Card>

                <Card className="backdrop-blur-md bg-card/60 border-border text-center">
                    <CardHeader>
                        <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="h-8 w-8 text-green-400" />
                        </div>
                        <CardTitle>Market & Social Intelligence</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Evaluates market metrics, developer activity, and social sentiment for a complete picture.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  )
}
