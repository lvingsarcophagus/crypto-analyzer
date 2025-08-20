"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Clock, 
  TrendingUp, 
  Star, 
  Hash,
  ExternalLink,
  Loader2 
} from "lucide-react"

interface SearchResult {
  id: string
  name: string
  symbol: string
  type: 'coin' | 'contract' | 'address'
  rank?: number
  price?: number
  change24h?: number
  image?: string
  description?: string
}

interface EnhancedSearchProps {
  onSelect: (result: SearchResult) => void
  placeholder?: string
  className?: string
  showRecentSearches?: boolean
  showTrending?: boolean
}

export function EnhancedSearch({
  onSelect,
  placeholder = "Search cryptocurrencies, contracts, or addresses...",
  className = "",
  showRecentSearches = true,
  showTrending = true
}: EnhancedSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([])
  const [trendingCoins, setTrendingCoins] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    if (showRecentSearches) {
      const saved = localStorage.getItem('cryptoSearchRecent')
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved).slice(0, 5))
        } catch (error) {
          console.error('Failed to load recent searches:', error)
        }
      }
    }
  }, [showRecentSearches])

  // Load trending coins
  useEffect(() => {
    if (showTrending) {
      fetchTrendingCoins()
    }
  }, [showTrending])

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchTrendingCoins = async () => {
    try {
      const response = await fetch('/api/market/data?type=trending')
      if (response.ok) {
        const data = await response.json()
        setTrendingCoins(data.coins?.slice(0, 5) || [])
      }
    } catch (error) {
      console.error('Failed to fetch trending coins:', error)
    }
  }

  const searchCoins = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      // Check if it's a contract address (starts with 0x and 42 chars)
      const isContractAddress = /^0x[a-fA-F0-9]{40}$/.test(searchQuery)
      
      if (isContractAddress) {
        // Handle contract address search
        setResults([{
          id: searchQuery,
          name: "Contract Address",
          symbol: searchQuery.slice(0, 8) + "...",
          type: 'contract',
          description: "Ethereum contract address"
        }])
      } else {
        // Search CoinGecko API
        const response = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(searchQuery)}`
        )
        
        if (response.ok) {
          const data = await response.json()
          const searchResults: SearchResult[] = data.coins?.slice(0, 8).map((coin: any) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            type: 'coin' as const,
            rank: coin.market_cap_rank,
            image: coin.thumb
          })) || []
          
          setResults(searchResults)
        }
      }
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
    
    if (value.trim()) {
      setShowResults(true)
      searchCoins(value)
    } else {
      setResults([])
      setShowResults(false)
    }
  }

  const handleSelect = (result: SearchResult) => {
    // Add to recent searches
    const newRecent = [result, ...recentSearches.filter(r => r.id !== result.id)].slice(0, 5)
    setRecentSearches(newRecent)
    localStorage.setItem('cryptoSearchRecent', JSON.stringify(newRecent))
    
    setQuery(result.symbol)
    setShowResults(false)
    onSelect(result)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentResults = query.trim() ? results : [...recentSearches, ...trendingCoins]
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % currentResults.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev <= 0 ? currentResults.length - 1 : prev - 1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && currentResults[selectedIndex]) {
        handleSelect(currentResults[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('cryptoSearchRecent')
  }

  const currentResults = query.trim() ? results : []
  const showSuggestions = showResults && (!query.trim() && (recentSearches.length > 0 || trendingCoins.length > 0))

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(true)}
          className="pl-10 pr-4 bg-card/50 border-border/50"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
        )}
      </div>

      {(showResults && (currentResults.length > 0 || showSuggestions)) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 backdrop-blur-md bg-card/95 border-border/50 shadow-xl">
          <CardContent className="p-2">
            {currentResults.length > 0 ? (
              <div className="space-y-1">
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  Search Results
                </div>
                {currentResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className={`w-full flex items-center gap-3 p-2 rounded-md text-left hover:bg-card/50 transition-colors ${
                      index === selectedIndex ? 'bg-primary/20' : ''
                    }`}
                  >
                    {result.image ? (
                      <img src={result.image} alt={result.name} className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        {result.type === 'contract' ? (
                          <Hash className="h-3 w-3" />
                        ) : (
                          <span className="text-xs font-bold">{result.symbol[0]}</span>
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{result.name}</span>
                        <Badge variant="outline" className="text-xs">{result.symbol}</Badge>
                        {result.rank && (
                          <Badge variant="secondary" className="text-xs">#{result.rank}</Badge>
                        )}
                      </div>
                      {result.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {result.description}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 py-1">
                      <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Recent Searches
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="h-6 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((result, index) => (
                        <button
                          key={`recent-${result.id}`}
                          onClick={() => handleSelect(result)}
                          className={`w-full flex items-center gap-3 p-2 rounded-md text-left hover:bg-card/50 transition-colors ${
                            index === selectedIndex ? 'bg-primary/20' : ''
                          }`}
                        >
                          <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                            <Clock className="h-3 w-3 text-secondary" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">{result.name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">{result.symbol}</Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {trendingCoins.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Trending
                    </div>
                    <div className="space-y-1">
                      {trendingCoins.map((result, index) => (
                        <button
                          key={`trending-${result.id}`}
                          onClick={() => handleSelect(result)}
                          className={`w-full flex items-center gap-3 p-2 rounded-md text-left hover:bg-card/50 transition-colors ${
                            index === (selectedIndex - recentSearches.length) ? 'bg-primary/20' : ''
                          }`}
                        >
                          {result.image ? (
                            <img src={result.image} alt={result.name} className="w-6 h-6 rounded-full" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                              <Star className="h-3 w-3 text-primary" />
                            </div>
                          )}
                          <div className="flex-1">
                            <span className="font-medium">{result.name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">{result.symbol}</Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
