import { NextResponse } from 'next/server'

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60000 // 1 minute

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'market'
  
  try {
    const cacheKey = `market-data-${type}`
    const cached = cache.get(cacheKey)
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ 
        ...cached.data, 
        cached: true,
        timestamp: cached.timestamp 
      })
    }
    
    let data: any = {}
    
    switch (type) {
      case 'global':
        const globalResponse = await fetch('https://api.coingecko.com/api/v3/global')
        if (!globalResponse.ok) throw new Error('Failed to fetch global data')
        const globalData = await globalResponse.json()
        
        data = {
          totalMarketCap: globalData.data.total_market_cap.usd,
          totalVolume: globalData.data.total_volume.usd,
          btcDominance: globalData.data.market_cap_percentage.btc,
          activeCryptocurrencies: globalData.data.active_cryptocurrencies,
          markets: globalData.data.markets
        }
        break
        
      case 'trending':
        const trendingResponse = await fetch('https://api.coingecko.com/api/v3/search/trending')
        if (!trendingResponse.ok) throw new Error('Failed to fetch trending data')
        const trendingData = await trendingResponse.json()
        
        data = {
          coins: trendingData.coins.slice(0, 5).map((item: any) => ({
            id: item.item.id,
            name: item.item.name,
            symbol: item.item.symbol,
            market_cap_rank: item.item.market_cap_rank,
            thumb: item.item.thumb
          }))
        }
        break
        
      case 'top-coins':
        const limit = searchParams.get('limit') || '10'
        const coinsResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
        )
        if (!coinsResponse.ok) throw new Error('Failed to fetch coins data')
        const coinsData = await coinsResponse.json()
        
        data = {
          coins: coinsData.map((coin: any) => ({
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            current_price: coin.current_price,
            price_change_percentage_24h: coin.price_change_percentage_24h,
            market_cap_rank: coin.market_cap_rank,
            market_cap: coin.market_cap,
            image: coin.image
          }))
        }
        break
        
      default:
        // Combined market data
        const [globalRes, coinsRes] = await Promise.all([
          fetch('https://api.coingecko.com/api/v3/global'),
          fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false')
        ])
        
        if (!globalRes.ok || !coinsRes.ok) {
          throw new Error('Failed to fetch market data')
        }
        
        const [global, coins] = await Promise.all([
          globalRes.json(),
          coinsRes.json()
        ])
        
        data = {
          global: {
            totalMarketCap: global.data.total_market_cap.usd,
            totalVolume: global.data.total_volume.usd,
            btcDominance: global.data.market_cap_percentage.btc
          },
          topCoins: coins.slice(0, 5).map((coin: any) => ({
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            current_price: coin.current_price,
            price_change_percentage_24h: coin.price_change_percentage_24h,
            market_cap_rank: coin.market_cap_rank
          }))
        }
    }
    
    // Cache the result
    cache.set(cacheKey, { data, timestamp: Date.now() })
    
    return NextResponse.json({ ...data, cached: false, timestamp: Date.now() })
    
  } catch (error) {
    console.error('Market data API error:', error)
    
    // Return cached data even if expired, as fallback
    const cacheKey = `market-data-${type}`
    const cached = cache.get(cacheKey)
    if (cached) {
      return NextResponse.json({ 
        ...cached.data, 
        cached: true, 
        stale: true,
        timestamp: cached.timestamp,
        error: 'Using cached data due to API error'
      })
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch market data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Clear cache endpoint
export async function DELETE() {
  cache.clear()
  return NextResponse.json({ message: 'Cache cleared' })
}
