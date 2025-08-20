import { toast } from "@/components/ui/use-toast"

interface BlockchainInfo {
  id: string;
  name: string;
  shortName: string;
  icon?: string;
}

// List of major supported blockchains by CoinGecko
export const SUPPORTED_BLOCKCHAINS: BlockchainInfo[] = [
  { id: "ethereum", name: "Ethereum", shortName: "ETH" },
  { id: "binance-smart-chain", name: "Binance Smart Chain", shortName: "BSC" },
  { id: "polygon-pos", name: "Polygon", shortName: "MATIC" },
  { id: "avalanche", name: "Avalanche C-Chain", shortName: "AVAX" },
  { id: "fantom", name: "Fantom", shortName: "FTM" },
  { id: "arbitrum-one", name: "Arbitrum", shortName: "ARB" },
  { id: "optimistic-ethereum", name: "Optimism", shortName: "OP" },
  { id: "solana", name: "Solana", shortName: "SOL" },
  { id: "base", name: "Base", shortName: "BASE" },
  { id: "xdai", name: "Gnosis Chain", shortName: "GNOSIS" },
]

// Token information from CoinGecko
export interface TokenInfo {
  id: string;
  symbol: string;
  name: string;
  blockchain: string;
  blockchainName: string;
  contractAddress: string;
  image: {
    small: string;
    thumb: string;
  };
  market_data?: {
    current_price: {
      usd: number;
    };
    price_change_percentage_24h: number;
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
  };
}

/**
 * Detects which blockchain a token contract address belongs to
 * 
 * @param contractAddress The token's contract address
 * @param apiKey Optional CoinGecko API key for higher rate limits
 * @returns Information about the token and its blockchain, or null if not found
 */
export async function detectTokenBlockchain(
  contractAddress: string, 
  apiKey?: string
): Promise<TokenInfo | null> {
  // Check if the address has the right format
  if (!contractAddress || contractAddress.length < 10) {
    toast({
      title: "Invalid Contract Address",
      description: "Please provide a valid contract address.",
      variant: "destructive",
    })
    return null;
  }

  // Normalize the contract address (remove spaces, convert to lowercase)
  const normalizedAddress = contractAddress.trim().toLowerCase();
  
  // Create the API headers - add the API key if provided
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  
  if (apiKey) {
    headers['x-cg-pro-api-key'] = apiKey;
  }
  
  // Add a delay between requests to avoid rate limiting
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Try each blockchain until we find a match
  for (const blockchain of SUPPORTED_BLOCKCHAINS) {
    try {
      // For CoinGecko API v3 (free tier)
      const apiBase = apiKey 
        ? "https://pro-api.coingecko.com/api/v3" 
        : "https://api.coingecko.com/api/v3";
      
      const response = await fetch(
        `${apiBase}/coins/${blockchain.id}/contract/${normalizedAddress}`,
        { headers }
      );
      
      // If we get a successful response, we found the token's blockchain
      if (response.ok) {
        const data = await response.json();
        
        return {
          id: data.id,
          symbol: data.symbol,
          name: data.name,
          blockchain: blockchain.id,
          blockchainName: blockchain.name,
          contractAddress: normalizedAddress,
          image: data.image,
          market_data: data.market_data,
        };
      }
      
      // Wait a bit between requests to avoid rate limiting (300ms)
      await delay(300);
    } catch (error) {
      console.error(`Error checking ${blockchain.name}:`, error);
      // Continue to the next blockchain
    }
  }
  
  // If we've checked all blockchains and found nothing
  toast({
    title: "Token Not Found",
    description: "Could not find this token on any supported blockchain.",
    variant: "destructive",
  });
  
  return null;
}

/**
 * Check if a string is a valid contract address for most EVM blockchains
 * 
 * @param address The address to validate
 * @returns boolean indicating if address has valid format
 */
export function isValidContractAddress(address: string): boolean {
  // Basic validation: Most EVM addresses are 42 characters long (0x + 40 hex chars)
  const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return evmAddressRegex.test(address);
}

/**
 * Get token info by symbol or name using CoinGecko API
 * 
 * @param query The token symbol or name to search for
 * @param apiKey Optional CoinGecko API key for higher rate limits
 * @returns Information about the token, or null if not found
 */
export async function searchTokenBySymbol(
  query: string,
  apiKey?: string
): Promise<TokenInfo | null> {
  if (!query || query.trim().length < 1) {
    return null;
  }

  // Normalize the query
  const normalizedQuery = query.trim().toLowerCase();
  
  // Create the API headers
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  
  if (apiKey) {
    headers['x-cg-pro-api-key'] = apiKey;
  }
  
  try {
    // For CoinGecko API v3 (free tier)
    const apiBase = apiKey 
      ? "https://pro-api.coingecko.com/api/v3" 
      : "https://api.coingecko.com/api/v3";
    
    const response = await fetch(
      `${apiBase}/search?query=${encodeURIComponent(normalizedQuery)}`,
      { headers }
    );
    
    if (response.ok) {
      const data = await response.json();
      
      // Get the first coin from the results
      const coin = data.coins && data.coins.length > 0 ? data.coins[0] : null;
      
      if (coin) {
        // Get detailed info for the coin
        const detailResponse = await fetch(
          `${apiBase}/coins/${coin.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
          { headers }
        );
        
        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          
          // Extract blockchain info from platforms data
          let blockchain = "unknown";
          let contractAddress = "";
          
          if (detailData.platforms) {
            // Find the first non-empty platform entry
            for (const [platform, address] of Object.entries(detailData.platforms)) {
              if (address && typeof address === 'string' && address.length > 0) {
                blockchain = platform;
                contractAddress = address;
                break;
              }
            }
          }
          
          // Find the matching blockchain info
          const blockchainInfo = SUPPORTED_BLOCKCHAINS.find(b => b.id === blockchain) || 
            { id: blockchain, name: blockchain, shortName: blockchain };
          
          return {
            id: detailData.id,
            symbol: detailData.symbol,
            name: detailData.name,
            blockchain: blockchain,
            blockchainName: blockchainInfo.name,
            contractAddress: contractAddress,
            image: detailData.image,
            market_data: detailData.market_data,
          };
        }
      }
    }
  } catch (error) {
    console.error("Error searching token:", error);
    toast({
      title: "Search Error",
      description: "Failed to search for the token. Please try again.",
      variant: "destructive",
    });
  }
  
  return null;
}
