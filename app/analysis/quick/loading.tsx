import { Zap } from "lucide-react"

export default function QuickScanLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-32 bg-muted rounded mb-6"></div>
          <div className="h-8 w-3/4 bg-muted rounded mb-2"></div>
          <div className="h-6 w-1/2 bg-muted rounded"></div>
        </div>
        
        {/* Quick Scan Result Card */}
        <div className="backdrop-blur-md bg-card/80 border border-border rounded-lg shadow-xl mb-8 p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="h-6 w-32 bg-muted rounded"></div>
            <div className="h-6 w-24 bg-muted rounded"></div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-6">
            <div>
              <div className="h-7 w-32 bg-muted rounded mb-2"></div>
              <div className="flex items-baseline gap-2">
                <div className="h-6 w-24 bg-muted rounded"></div>
                <div className="h-4 w-16 bg-muted rounded"></div>
              </div>
            </div>
            
            <div className="w-full md:w-1/3">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-4 w-20 bg-muted rounded"></div>
                <div className="h-4 w-16 bg-muted rounded"></div>
              </div>
              <div className="w-full bg-secondary/20 rounded-full h-2"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border rounded-md p-4">
                <div className="h-4 w-28 bg-muted rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="h-3 w-20 bg-muted rounded"></div>
                    <div className="h-4 w-16 bg-muted rounded"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 w-24 bg-muted rounded"></div>
                    <div className="h-4 w-20 bg-muted rounded"></div>
                  </div>
                  {i === 3 && (
                    <div className="flex justify-between">
                      <div className="h-3 w-16 bg-muted rounded"></div>
                      <div className="h-4 w-16 bg-muted rounded"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <div className="h-4 w-72 bg-muted mx-auto rounded mb-4"></div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <div className="h-10 w-44 bg-muted rounded"></div>
              <div className="h-10 w-44 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
