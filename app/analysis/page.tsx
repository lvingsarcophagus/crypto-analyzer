"use client"

import { useState } from "react"
import { AdvancedAnalysisForm } from "@/components/analysis/advanced-analysis-form"
import { LiveRiskChart } from "@/components/monitoring/live-risk-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Database, TrendingUp, Activity, BarChart3, AlertTriangle } from "lucide-react"

export default function AnalysisPage() {
  const [selectedToken, setSelectedToken] = useState("bitcoin")
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Advanced Risk Analysis
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time multi-source analysis with cross-validation and live market data
          </p>
        </div>
        
        <Tabs defaultValue="live-analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-card/50 backdrop-blur-md border border-border">
            <TabsTrigger value="live-analysis" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live Analysis
            </TabsTrigger>
            <TabsTrigger value="advanced-scan" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Advanced Scan
            </TabsTrigger>
            <TabsTrigger value="risk-metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Risk Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live-analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Risk Chart */}
              <Card className="backdrop-blur-md bg-card/80 border-border shadow-xl lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Real-Time Risk & Price Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LiveRiskChart 
                    defaultToken={selectedToken}
                    height={400}
                    updateInterval={10000}
                    maxPoints={100}
                  />
                </CardContent>
              </Card>
              
              {/* Risk Factors Grid */}
              <Card className="backdrop-blur-md bg-card/80 border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="text-sm font-medium text-red-400">Market Risk</div>
                      <div className="text-2xl font-bold text-red-500">Medium</div>
                      <div className="text-xs text-muted-foreground">Volatility: 15.3%</div>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="text-sm font-medium text-green-400">Liquidity</div>
                      <div className="text-2xl font-bold text-green-500">High</div>
                      <div className="text-xs text-muted-foreground">Volume: $2.1B</div>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="text-sm font-medium text-blue-400">Security</div>
                      <div className="text-2xl font-bold text-blue-500">Excellent</div>
                      <div className="text-xs text-muted-foreground">Score: 95/100</div>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="text-sm font-medium text-yellow-400">Concentration</div>
                      <div className="text-2xl font-bold text-yellow-500">Low</div>
                      <div className="text-xs text-muted-foreground">Top 10: 12.5%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Indicators */}
              <Card className="backdrop-blur-md bg-card/80 border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Market Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Market Cap Rank</span>
                      <span className="text-sm font-bold">#1</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">24h Volume</span>
                      <span className="text-sm font-bold text-green-500">$25.4B</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">24h Change</span>
                      <span className="text-sm font-bold text-green-500">+2.45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">7d Change</span>
                      <span className="text-sm font-bold text-red-500">-1.23%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Market Dominance</span>
                      <span className="text-sm font-bold">54.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced-scan" className="space-y-6">
            {/* Advanced Analysis Form */}
            <AdvancedAnalysisForm />

            {/* Analysis Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card className="backdrop-blur-md bg-card/60 border-border">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">Multi-Factor Risk Assessment</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyzes market conditions, liquidity, security, and holder distribution patterns using real-time data.
                  </p>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-md bg-card/60 border-border">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Database className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-bold mb-2">Cross-Source Validation</h3>
                  <p className="text-sm text-muted-foreground">
                    Validates data across CoinGecko, blockchain explorers, and security APIs for maximum accuracy.
                  </p>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-md bg-card/60 border-border">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-bold mb-2">Historical Trends</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyzes historical patterns, price movements, and volume trends for comprehensive risk assessment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risk-metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Risk Score Card */}
              <Card className="backdrop-blur-md bg-card/80 border-border shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Overall Risk Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500 mb-2">15/100</div>
                  <div className="text-sm text-green-400 font-medium">LOW RISK</div>
                  <div className="text-xs text-muted-foreground mt-1">Based on 12 factors</div>
                </CardContent>
              </Card>

              {/* Volatility Card */}
              <Card className="backdrop-blur-md bg-card/80 border-border shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Volatility Index</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-500 mb-2">15.3%</div>
                  <div className="text-sm text-yellow-400 font-medium">MODERATE</div>
                  <div className="text-xs text-muted-foreground mt-1">30-day average</div>
                </CardContent>
              </Card>

              {/* Liquidity Card */}
              <Card className="backdrop-blur-md bg-card/80 border-border shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Liquidity Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500 mb-2">92/100</div>
                  <div className="text-sm text-green-400 font-medium">EXCELLENT</div>
                  <div className="text-xs text-muted-foreground mt-1">High trading volume</div>
                </CardContent>
              </Card>

              {/* Security Card */}
              <Card className="backdrop-blur-md bg-card/80 border-border shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Security Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500 mb-2">95/100</div>
                  <div className="text-sm text-green-400 font-medium">SECURE</div>
                  <div className="text-xs text-muted-foreground mt-1">Audited & verified</div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="backdrop-blur-md bg-card/80 border-border shadow-xl">
                <CardHeader>
                  <CardTitle>Risk Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Market Risk</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="w-3/5 h-full bg-yellow-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium">60%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Liquidity Risk</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="w-1/5 h-full bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium">20%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Security Risk</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="w-1/10 h-full bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium">5%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Concentration Risk</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="w-1/4 h-full bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-md bg-card/80 border-border shadow-xl">
                <CardHeader>
                  <CardTitle>Key Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <div className="text-sm font-medium text-green-400">Low Risk Investment</div>
                        <div className="text-xs text-muted-foreground">Suitable for conservative portfolios</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <div>
                        <div className="text-sm font-medium text-blue-400">Strong Fundamentals</div>
                        <div className="text-xs text-muted-foreground">Established network with high security</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                      <div>
                        <div className="text-sm font-medium text-yellow-400">Monitor Volatility</div>
                        <div className="text-xs text-muted-foreground">Consider dollar-cost averaging for entries</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
