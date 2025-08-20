"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DashboardLoading() {
  return (
    <div>
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-b from-background to-background/80 border-b border-border/50 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <div className="h-10 w-3/4 bg-muted rounded mx-auto mb-4"></div>
            <div className="h-6 w-1/2 bg-muted rounded mx-auto mb-8"></div>
            
            <div className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by token name, symbol, or contract address" 
                  className="pl-10 bg-card/50 border-border focus-visible:ring-1 focus-visible:ring-primary/50"
                  disabled
                />
              </div>
              <Button className="md:w-auto" disabled>
                <Shield className="mr-2 h-4 w-4" /> Analyze Risk
              </Button>
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm border-border">
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <div className="h-4 w-20 bg-muted rounded"></div>
                      <div className="h-5 w-12 bg-muted rounded"></div>
                    </div>
                    <div className="h-6 w-28 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column - LiveRiskChart */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-8 w-40 bg-muted rounded"></div>
                <div className="h-6 w-32 bg-muted rounded"></div>
              </div>
              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardContent className="p-6">
                  <Skeleton className="h-[400px] w-full rounded-lg" />
                </CardContent>
              </Card>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-8 w-40 bg-muted rounded"></div>
                <div className="h-5 w-16 bg-muted rounded"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="bg-card/50 backdrop-blur-sm border-border h-full">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <Skeleton className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="h-5 w-28 bg-muted rounded mb-1"></div>
                        <div className="h-4 w-full bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar - Risk Rankings & Recent Analyses */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-8 w-40 bg-muted rounded"></div>
                <div className="h-8 w-32 bg-muted rounded"></div>
              </div>
              
              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="h-4 w-4 bg-muted rounded-full"></div>
                          <div>
                            <div className="h-5 w-16 bg-muted rounded mb-1"></div>
                            <div className="h-3 w-24 bg-muted rounded"></div>
                          </div>
                        </div>
                        <div className="h-5 w-16 bg-muted rounded"></div>
                        <div className="h-5 w-10 bg-muted rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-8 w-40 bg-muted rounded"></div>
                <div className="h-5 w-12 bg-muted rounded"></div>
              </div>
              
              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 bg-muted rounded-full"></div>
                          <div>
                            <div className="h-5 w-16 bg-muted rounded mb-1"></div>
                            <div className="h-3 w-24 bg-muted rounded"></div>
                          </div>
                        </div>
                        <div className="h-4 w-16 bg-muted rounded"></div>
                        <div className="h-5 w-10 bg-muted rounded-full"></div>
                      </div>
                    ))}
                    <div className="h-8 w-full bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-8 w-40 bg-muted rounded"></div>
              </div>
              
              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="h-5 w-32 bg-muted rounded"></div>
                        <div className="h-5 w-16 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
