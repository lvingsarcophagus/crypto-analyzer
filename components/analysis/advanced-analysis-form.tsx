"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Zap, Loader2, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { detectTokenBlockchain, searchTokenBySymbol, isValidContractAddress, SUPPORTED_BLOCKCHAINS } from "@/lib/blockchain-detector"
import { toast } from "@/components/ui/use-toast"

export function AdvancedAnalysisForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [formData, setFormData] = useState({
    tokenSymbol: "",
    contractAddress: "",
    blockchain: "ethereum"
  })
  const [detectedBlockchain, setDetectedBlockchain] = useState<string | null>(null)

  // Effect to detect blockchain when contract address changes
  useEffect(() => {
    const detectBlockchain = async () => {
      // Clear the detected blockchain if contract address is empty
      if (!formData.contractAddress) {
        setDetectedBlockchain(null);
        return;
      }
      
      // Check if the address has a valid format before attempting detection
      if (!isValidContractAddress(formData.contractAddress)) {
        return;
      }
      
      setIsDetecting(true);
      try {
        const tokenInfo = await detectTokenBlockchain(formData.contractAddress);
        if (tokenInfo) {
          // Update form data with detected information
          setFormData(prev => ({
            ...prev,
            tokenSymbol: tokenInfo.symbol.toUpperCase(),
            blockchain: tokenInfo.blockchain
          }));
          
          setDetectedBlockchain(tokenInfo.blockchain);
          
          toast({
            title: "Blockchain Detected",
            description: `Token found on ${tokenInfo.blockchainName}`,
          });
        }
      } catch (error) {
        console.error("Error detecting blockchain:", error);
      } finally {
        setIsDetecting(false);
      }
    };
    
    if (formData.contractAddress) {
      const timeoutId = setTimeout(() => {
        detectBlockchain();
      }, 500); // Debounce to avoid triggering detection on every keystroke
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData.contractAddress]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If changing contract address, reset detected blockchain
    if (name === "contractAddress" && value !== formData.contractAddress) {
      setDetectedBlockchain(null);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle searching for a token by symbol
  const handleSymbolSearch = async () => {
    if (!formData.tokenSymbol) return;
    
    setIsDetecting(true);
    try {
      const tokenInfo = await searchTokenBySymbol(formData.tokenSymbol);
      if (tokenInfo) {
        // Update form data with found token information
        setFormData(prev => ({
          ...prev,
          contractAddress: tokenInfo.contractAddress || prev.contractAddress,
          blockchain: tokenInfo.blockchain || prev.blockchain
        }));
        
        setDetectedBlockchain(tokenInfo.blockchain);
        
        toast({
          title: "Token Found",
          description: `Found ${tokenInfo.name} on ${tokenInfo.blockchainName}`,
        });
      }
    } catch (error) {
      console.error("Error searching token:", error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleAdvancedAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate input
      if (!formData.tokenSymbol.trim()) {
        throw new Error("Please enter a token symbol");
      }
      
      // Try to auto-detect blockchain if user entered a contract address but didn't select blockchain
      if (formData.contractAddress && !detectedBlockchain) {
        const tokenInfo = await detectTokenBlockchain(formData.contractAddress);
        if (tokenInfo) {
          setFormData(prev => ({
            ...prev,
            tokenSymbol: tokenInfo.symbol.toUpperCase(),
            blockchain: tokenInfo.blockchain
          }));
        }
      }
      
      // Prepare token ID for API - clean and normalize
      const tokenId = formData.tokenSymbol.trim().toLowerCase();
      
      console.log("Making API call with:", { tokenId, tokenAddress: formData.contractAddress, blockchain: formData.blockchain });
      
      // Use the main /api/analyze endpoint
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: tokenId,
          tokenAddress: formData.contractAddress || undefined,
          blockchain: formData.blockchain
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("API Error:", errorData);
        throw new Error(errorData.error || `Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("API Response:", data);
      
      if (!data || !data.risk_analysis) {
        throw new Error("Invalid response from analysis API");
      }
      
      // Navigate to results with the analyzed data
      router.push(`/analysis/results?token=${encodeURIComponent(formData.tokenSymbol)}&blockchain=${encodeURIComponent(formData.blockchain)}&data=${encodeURIComponent(JSON.stringify(data))}`);
      
    } catch (error: any) {
      console.error("Analysis error:", error);
      
      let errorMessage = "Failed to complete the analysis. Please try again.";
      
      if (error.message.includes("Token ID is required")) {
        errorMessage = "Please enter a valid token symbol or name.";
      } else if (error.message.includes("not found") || error.message.includes("404")) {
        errorMessage = `Token "${formData.tokenSymbol}" not found. Please check the spelling or try a different token.`;
      } else if (error.message.includes("rate limit") || error.message.includes("429")) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Analysis Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuickScan = async () => {
    if (!formData.tokenSymbol) return;
    
    try {
      setIsDetecting(true);
      
      // Use the main API endpoint for quick scan
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: formData.tokenSymbol.toLowerCase(),
          tokenAddress: formData.contractAddress || undefined,
          blockchain: formData.blockchain
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        router.push(`/analysis/quick?token=${formData.tokenSymbol}&data=${encodeURIComponent(JSON.stringify(data))}`);
      } else {
        // Fallback to simple quick scan without API data
        router.push(`/analysis/quick?token=${formData.tokenSymbol}`);
      }
    } catch (error) {
      console.error("Quick scan error:", error);
      // Fallback to simple quick scan
      router.push(`/analysis/quick?token=${formData.tokenSymbol}`);
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <Card className="backdrop-blur-md bg-card/80 border-border shadow-xl">
      <CardContent className="p-6">
        <form onSubmit={handleAdvancedAnalysis}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="tokenSymbol" className="text-sm font-medium">Token Symbol</label>
                <Button 
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs px-2"
                  onClick={handleSymbolSearch}
                  disabled={isDetecting || !formData.tokenSymbol}
                >
                  {isDetecting ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Search className="mr-1 h-3 w-3" />
                  )}
                  Search
                </Button>
              </div>
              <input 
                id="tokenSymbol"
                name="tokenSymbol"
                type="text" 
                value={formData.tokenSymbol}
                onChange={handleChange}
                placeholder="e.g., bitcoin, ethereum" 
                className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-foreground placeholder-muted-foreground"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="contractAddress" className="text-sm font-medium">Contract Address</label>
                {isDetecting && (
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Detecting...
                  </span>
                )}
              </div>
              <input 
                id="contractAddress"
                name="contractAddress"
                type="text"
                value={formData.contractAddress}
                onChange={handleChange}
                placeholder="0x..." 
                className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-foreground placeholder-muted-foreground"
              />
              {detectedBlockchain && (
                <p className="text-xs text-primary mt-1">
                  Blockchain detected: {SUPPORTED_BLOCKCHAINS.find(b => b.id === detectedBlockchain)?.name || detectedBlockchain}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="blockchain" className="block text-sm font-medium mb-2">Blockchain</label>
              <select 
                id="blockchain"
                name="blockchain"
                value={formData.blockchain}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg text-foreground"
              >
                {SUPPORTED_BLOCKCHAINS.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name} ({chain.shortName})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading || !formData.tokenSymbol}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Run Advanced Analysis
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="border-border hover:bg-card/50"
              onClick={handleQuickScan}
              disabled={isLoading || !formData.tokenSymbol}
            >
              <Zap className="mr-2 h-4 w-4" />
              Quick Scan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
