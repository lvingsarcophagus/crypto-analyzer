# Enhanced Crypto Risk Analyzer - API Integration Guide

## Overview

The crypto risk analyzer has been enhanced with comprehensive API integrations using your provided API keys:

- **Moralis API**: Web3 data, contract metadata, and holder information
- **Mobula API**: Real-time trading data and market metrics  
- **Tokenview API**: Blockchain data and token holder analysis
- **CoinGecko API**: Market data and price information

## API Keys Integrated

```env
MORALIS_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
MOBULA_API_KEY=db19be9d-94ec-421b-8d64-ba93809ee8f9
TOKENVIEW_API_KEY=5oes9chVs1MOa5G3HpyO
COINGECKO_API_KEY=CG-bni69NAc1Ykpye5mqA9qd7JM
```

## Enhanced Features

### 1. Multi-Source Risk Analysis
- **Cross-validation** between different data providers
- **Confidence scoring** based on data quality and source reliability
- **Real-time data integration** from multiple APIs
- **Fallback mechanisms** when APIs are unavailable

### 2. Comprehensive Token Analysis

#### Basic Analysis Endpoint: `/api/analyze`
```json
POST /api/analyze
{
  "tokenId": "ethereum",
  "tokenAddress": "0x...", // Optional but recommended
  "blockchain": "ethereum", // Optional, defaults to ethereum
  "includeHistorical": true
}
```

**Enhanced Response:**
```json
{
  "token": {
    "id": "ethereum",
    "symbol": "eth",
    "name": "Ethereum",
    "current_price": 2500.00,
    "market_cap": 300000000000,
    "contract_address": "0x..."
  },
  "risk_analysis": {
    "overall_score": 25,
    "risk_level": "LOW",
    "confidence_metrics": {
      "overall_confidence": 0.92,
      "data_completeness": 0.95,
      "source_reliability": 0.90,
      "cross_validation_score": 0.88
    },
    "real_time_alerts": {
      "active_warnings": [],
      "monitoring_flags": []
    }
  },
  "data_sources": {
    "basic_info_source": "CoinGecko",
    "security_analysis_source": "multi_source_analysis",
    "holder_analysis_source": "multi_source_analysis",
    "price_validation_sources": ["CoinGecko", "Mobula"]
  }
}
```

#### Advanced Analysis Endpoint: `/api/analyze/advanced`
```json
POST /api/analyze/advanced
{
  "tokenId": "ethereum",
  "tokenAddress": "0x...",
  "blockchain": "ethereum",
  "includeHistorical": true,
  "enableCrossValidation": true,
  "enableRealtimeMonitoring": false
}
```

**Enhanced Response includes:**
- Comprehensive data from all APIs
- Enhanced validation metrics
- Multi-source agreement scores
- Detailed confidence analysis

### 3. Batch Analysis: `/api/analyze/batch`

Analyze multiple tokens efficiently:

```json
POST /api/analyze/batch
{
  "tokens": [
    {"tokenId": "ethereum", "tokenAddress": "0x..."},
    {"tokenId": "bitcoin"},
    {"tokenId": "cardano", "blockchain": "cardano"}
  ],
  "reportType": "summary" // or "detailed"
}
```

**Capabilities:**
- Up to 50 tokens per batch
- Rate limiting and retry logic
- Parallel processing with API quotas
- Summary and detailed report options

### 4. Real-Time Monitoring: `/api/monitoring/metrics`

#### Start Monitoring
```json
POST /api/monitoring/metrics
{
  "action": "start_monitoring",
  "tokenIds": ["ethereum", "bitcoin", "cardano"]
}
```

#### Get Monitoring Metrics
```http
GET /api/monitoring/metrics?tokens=ethereum,bitcoin,cardano
```

**Response includes:**
- Current risk scores
- Active alerts and warnings
- Price deviation monitoring
- Cross-source validation status

## Data Quality & Reliability

### Confidence Scoring
- **Data Completeness**: How much required data is available
- **Source Reliability**: Quality rating of data sources  
- **Temporal Consistency**: Data consistency over time
- **Cross-Validation**: Agreement between multiple sources

### Rate Limiting
- **Moralis**: 25 requests/second
- **Mobula**: 300 requests/minute  
- **Tokenview**: 1 request/second
- **CoinGecko**: 30 requests/minute

### Fallback Mechanisms
- Automatic retry with exponential backoff
- Graceful degradation when APIs are unavailable
- Cache system to reduce API calls
- Mock data for development/testing

## Enhanced Risk Scoring

The risk scoring algorithm now incorporates:

1. **Market Data** (CoinGecko + Mobula)
   - Price volatility and trends
   - Market cap and volume analysis
   - Cross-source price validation

2. **Holder Analysis** (Moralis + Tokenview)
   - Whale concentration analysis
   - Holder distribution metrics
   - Token holder behavior patterns

3. **Contract Security** (Moralis + Multi-source)
   - Contract verification status
   - Security audit results
   - Ownership and proxy analysis

4. **Trading Behavior** (Mobula + CoinGecko)
   - Volume analysis and trends
   - Liquidity assessment
   - DEX vs CEX trading patterns

## Usage Examples

### 1. Analyze a Single Token with Full Data
```javascript
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenId: 'ethereum',
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    blockchain: 'ethereum',
    includeHistorical: true
  })
})
const analysis = await response.json()
```

### 2. Batch Analysis for Portfolio
```javascript
const response = await fetch('/api/analyze/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokens: [
      { tokenId: 'ethereum', tokenAddress: '0x...' },
      { tokenId: 'bitcoin' },
      { tokenId: 'cardano' }
    ],
    reportType: 'detailed'
  })
})
const batchReport = await response.json()
```

### 3. Real-Time Monitoring Setup
```javascript
// Start monitoring
await fetch('/api/monitoring/metrics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'start_monitoring',
    tokenIds: ['ethereum', 'bitcoin']
  })
})

// Get current metrics
const metrics = await fetch('/api/monitoring/metrics?tokens=ethereum,bitcoin')
const data = await metrics.json()
```

## Error Handling

The system includes comprehensive error handling:

- **API Rate Limits**: Automatic retries with backoff
- **Network Issues**: Graceful fallback to cached data
- **Invalid Tokens**: Clear error messages with suggestions
- **Partial Failures**: Continue analysis with available data

## Monitoring & Alerts

### Alert Types
- **HIGH_RISK**: Risk score exceeds threshold
- **PRICE_DEVIATION**: Significant price differences between sources
- **VOLUME_DROP**: Trading volume decreases significantly
- **WHALE_MOVEMENT**: Large holder activity detected

### Configurable Thresholds
```json
{
  "critical_risk_score": 80,
  "high_risk_score": 60,
  "price_deviation": 0.15,
  "volume_drop": 0.5
}
```

## Best Practices

1. **Always provide token address** when available for maximum data quality
2. **Use batch analysis** for multiple tokens to respect rate limits
3. **Enable cross-validation** for critical investment decisions
4. **Monitor cache statistics** to optimize API usage
5. **Set appropriate alert thresholds** based on your risk tolerance

## Development Notes

- Environment variables are configured in `.env.local`
- API configurations are centralized in `lib/api-config.ts`
- Enhanced API client is in `lib/enhanced-api-client.ts`
- Integrated service coordinates all APIs in `lib/integrated-risk-service.ts`
- Advanced risk analyzer incorporates multi-source data in `lib/advanced-risk-analyzer.ts`

The system is now ready for production use with real API integrations and comprehensive risk analysis capabilities.
