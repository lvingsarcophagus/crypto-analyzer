import { NextResponse } from 'next/server';
import { searchTokenBySymbol } from '@/lib/blockchain-detector';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tokenSymbol } = body;
    
    // Validate required inputs
    if (!tokenSymbol) {
      return NextResponse.json(
        { error: 'Token symbol must be provided' },
        { status: 400 }
      );
    }
    
    // Search for token by symbol
    const tokenInfo = await searchTokenBySymbol(tokenSymbol);
    
    // If no token info found, return error
    if (!tokenInfo) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }
    
    // Mock quick scan data for demonstration
    const quickScan = {
      token: tokenInfo.name,
      symbol: tokenInfo.symbol,
      blockchain: tokenInfo.blockchain,
      blockchainName: tokenInfo.blockchainName,
      price: tokenInfo.market_data?.current_price?.usd || 0,
      change24h: tokenInfo.market_data?.price_change_percentage_24h || 0,
      riskLevel: Math.random() > 0.7 ? "HIGH" : Math.random() > 0.4 ? "MEDIUM" : "LOW",
      riskScore: Math.floor(Math.random() * 100),
      holders: {
        totalHolders: Math.floor(Math.random() * 100000),
        topWalletsPercentage: Math.floor(Math.random() * 90)
      },
      liquidity: {
        totalLiquidityUSD: Math.random() * 10000000,
        swapActivity24h: Math.random() * 1000000
      },
      contract: {
        verified: Math.random() > 0.3,
        age: `${Math.floor(Math.random() * 24)} months`,
        auditStatus: ["none", "pending", "passed", "failed", "warning"][Math.floor(Math.random() * 5)]
      }
    };
    
    return NextResponse.json({ token: tokenInfo, scan: quickScan });
    
  } catch (error) {
    console.error('Quick scan error:', error);
    return NextResponse.json(
      { error: 'Failed to perform quick scan' },
      { status: 500 }
    );
  }
}
