"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, Activity } from "lucide-react"

interface LoadingStateProps {
  type?: 'card' | 'chart' | 'table' | 'full' | 'minimal'
  message?: string
  rows?: number
}

export function LoadingState({ 
  type = 'card', 
  message = 'Loading...', 
  rows = 3 
}: LoadingStateProps) {
  if (type === 'minimal') {
    return (
      <div className="flex items-center justify-center gap-2 py-4">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    )
  }

  if (type === 'full') {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <Activity className="absolute inset-0 m-auto h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold mb-1">{message}</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we fetch the latest data
          </p>
        </div>
      </div>
    )
  }

  if (type === 'chart') {
    return (
      <Card className="backdrop-blur-md bg-card/80 border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-64 w-full" />
            <div className="flex justify-center gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === 'table') {
    return (
      <Card className="backdrop-blur-md bg-card/80 border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default card loading
  return (
    <Card className="backdrop-blur-md bg-card/80 border-border/50">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: rows }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ChartLoadingSkeleton() {
  return <LoadingState type="chart" message="Loading chart data..." />
}

export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return <LoadingState type="table" rows={rows} message="Loading table data..." />
}

export function FullPageLoading({ message = "Loading application..." }: { message?: string }) {
  return <LoadingState type="full" message={message} />
}
