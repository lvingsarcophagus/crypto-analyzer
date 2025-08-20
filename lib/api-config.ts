// Enhanced API configuration with multiple data sources for risk analysis
export const API_CONFIG = {
  MORALIS: {
    BASE_URL: 'https://deep-index.moralis.io/api/v2',
    API_KEY: process.env.MORALIS_API_KEY || '',
    ENDPOINTS: {
      TOKEN_METADATA: '/erc20/metadata',
      TOKEN_PRICE: '/erc20/:address/price',
      TOKEN_OWNERS: '/erc20/:address/owners',
      WALLET_TOKENS: '/:address/erc20',
      NFT_TRANSFERS: '/nft/:address/transfers',
      TRANSACTION_HISTORY: '/:address'
    }
  },
  MOBULA: {
    BASE_URL: 'https://api.mobula.io/api/1',
    API_KEY: process.env.MOBULA_API_KEY || '',
    ENDPOINTS: {
      MARKET_DATA: '/market/data',
      HISTORICAL_PRICE: '/market/history',
      WALLET_HOLDINGS: '/wallet/holdings',
      METADATA: '/metadata',
      MULTI_DATA: '/market/multi-data'
    }
  },
  TOKENVIEW: {
    BASE_URL: 'https://services.tokenview.io/vipapi',
    API_KEY: process.env.TOKENVIEW_API_KEY || '',
    ENDPOINTS: {
      ADDRESS_INFO: '/:blockchain/address/:address',
      TOKEN_INFO: '/:blockchain/token/:address',
      TRANSACTION_HISTORY: '/:blockchain/address/:address/tx',
      TOKEN_HOLDERS: '/:blockchain/token/:address/tokenholders',
      BALANCE_MULTI: '/:blockchain/addressmultitokens/:address'
    }
  },
  COINGECKO: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    API_KEY: process.env.COINGECKO_API_KEY || '',
    ENDPOINTS: {
      COINS_LIST: '/coins/list',
      COIN_DATA: '/coins/:id',
      MARKET_DATA: '/coins/markets',
      PRICE_HISTORY: '/coins/:id/market_chart',
      TRENDING: '/search/trending',
      GLOBAL_DATA: '/global'
    }
  }
}

export const REQUEST_HEADERS = {
  MORALIS: {
    'X-API-Key': API_CONFIG.MORALIS.API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  MOBULA: {
    'Authorization': API_CONFIG.MOBULA.API_KEY,
    'Content-Type': 'application/json'
  },
  TOKENVIEW: {
    // Tokenview expects the API key in the 'token' header
    ...(API_CONFIG.TOKENVIEW.API_KEY ? { token: API_CONFIG.TOKENVIEW.API_KEY } : {}),
    'Accept': 'application/json',
  },
  COINGECKO: {
    'x-cg-demo-api-key': API_CONFIG.COINGECKO.API_KEY,
    'Content-Type': 'application/json'
  }
}

export const RATE_LIMITS = {
  MORALIS: { requests: 25, per: 'second' },
  MOBULA: { requests: 300, per: 'minute' },
  TOKENVIEW: { requests: 1, per: 'second' },
  COINGECKO: { requests: 30, per: 'minute' }
}

export const BLOCKCHAIN_MAPPINGS = {
  ethereum: 'eth',
  polygon: 'polygon',
  bsc: 'bsc',
  avalanche: 'avax',
  arbitrum: 'arbitrum',
  optimism: 'optimism'
}
