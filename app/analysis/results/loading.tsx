import { Shield } from "lucide-react"

export default function AnalysisResultsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-32 bg-muted rounded mb-6"></div>
          <div className="h-8 w-3/4 bg-muted rounded mb-2"></div>
          <div className="h-6 w-1/2 bg-muted rounded"></div>
        </div>
        
        {/* Overview Card */}
        <div className="backdrop-blur-md bg-card/80 border border-border rounded-lg shadow-xl mb-8 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="h-7 w-40 bg-muted rounded"></div>
            <div className="h-6 w-24 bg-muted rounded"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-baseline justify-between mb-4">
                <div className="h-8 w-24 bg-muted rounded"></div>
                <div className="text-right">
                  <div className="h-7 w-32 bg-muted rounded mb-1"></div>
                  <div className="h-5 w-16 bg-muted rounded"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="h-4 w-20 bg-muted rounded mb-2"></div>
                  <div className="h-5 w-24 bg-muted rounded"></div>
                </div>
                <div>
                  <div className="h-4 w-24 bg-muted rounded mb-2"></div>
                  <div className="h-5 w-20 bg-muted rounded"></div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <div className="h-5 w-20 bg-muted rounded"></div>
                <div className="h-5 w-16 bg-muted rounded"></div>
              </div>
              <div className="w-full bg-secondary/20 rounded-full h-3 mb-6"></div>
              
              <div className="h-4 w-48 bg-muted rounded mb-4"></div>
              
              <div className="flex space-x-2">
                <div className="h-8 w-32 bg-muted rounded"></div>
                <div className="h-8 w-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Risk Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="backdrop-blur-md bg-card/80 border border-border rounded-lg shadow-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-36 bg-muted rounded"></div>
            </div>
            
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <div className="h-4 w-28 bg-muted rounded"></div>
                    <div className="h-4 w-16 bg-muted rounded"></div>
                  </div>
                  <div className="w-full bg-secondary/20 rounded-full h-2"></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="backdrop-blur-md bg-card/80 border border-border rounded-lg shadow-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-6 w-40 bg-muted rounded"></div>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-2">
                    <div className="h-5 w-5 bg-muted rounded-full shrink-0"></div>
                    <div className="h-5 w-full bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="backdrop-blur-md bg-card/80 border border-destructive/20 rounded-lg shadow-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-6 w-28 bg-muted rounded"></div>
              </div>
              
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-2">
                    <div className="h-5 w-5 bg-muted rounded-full shrink-0"></div>
                    <div className="h-5 w-full bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Analysis Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
