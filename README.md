# 🚀 Advanced Crypto Risk Analyzer

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.9-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)

A comprehensive, enterprise-grade cryptocurrency risk analysis platform that integrates multiple data sources to provide real-time risk assessment, market analysis, and token validation with professional-grade accuracy.

## ✨ Key Features

### 🎯 **Multi-Source Risk Analysis**
- **Cross-validation** between 4 major crypto data providers
- **Confidence scoring** based on data quality and source reliability
- **Real-time integration** from CoinGecko, Moralis, Mobula, and Tokenview APIs
- **Intelligent fallback mechanisms** with graceful degradation

### 📊 **Comprehensive Token Analysis**
- **Market Risk Assessment**: Price volatility, market cap analysis, trading patterns
- **Security Analysis**: Smart contract verification, audit results, ownership analysis
- **Liquidity Analysis**: Volume trends, DEX vs CEX trading, market depth
- **Holder Concentration**: Whale analysis, distribution metrics, holder behavior

### 🔄 **Real-Time Monitoring**
- **Live market data** with automatic updates
- **Risk threshold alerts** and warning systems
- **Historical price charts** with multiple timeframes
- **Cross-source price validation** to detect anomalies

### ⚡ **Advanced Analytics**
- **Parallel API processing** for maximum performance
- **Batch analysis** for portfolio-level risk assessment
- **Peer comparison** with similar tokens
- **Historical trend analysis** and pattern recognition

## 🏗️ Architecture

### **Multi-API Integration Layer**
```
┌─── CoinGecko ────┐    ┌─── Moralis ──────┐
│ Market Data      │    │ Contract Security │
│ Price History    │    │ Holder Analysis   │
└──────────────────┘    └───────────────────┘
          │                        │
          ▼                        ▼
    ┌─────────── Risk Analyzer ───────────┐
    │        Advanced Risk Scoring        │
    │     Confidence Metrics Engine       │
    │      Cross-Validation System        │
    └─────────────────────────────────────┘
          ▲                        ▲
          │                        │
┌─── Mobula ───────┐    ┌─── Tokenview ────┐
│ Trading Metrics  │    │ Blockchain Stats │
│ Liquidity Data   │    │ On-chain Analytics│
└──────────────────┘    └───────────────────┘
```

### **Core Components**
- **Advanced Risk Analyzer**: Multi-source data integration and risk calculation
- **Enhanced API Client**: Robust error handling, rate limiting, and retry logic
- **Real-time Monitor**: Live tracking and alert system
- **Historical Chart Engine**: Interactive price and volume visualization
- **Token Disambiguation**: Smart token resolution and validation

## 🎨 User Interface

### **Dashboard Features**
- 📈 **Interactive Charts**: Real-time price movements with Recharts
- 🎛️ **Risk Metrics Dashboard**: Live risk scores and analysis
- 🔍 **Enhanced Search**: Smart token discovery with autocomplete
- 📱 **Responsive Design**: Mobile-first approach with Tailwind CSS
- 🌙 **Dark/Light Theme**: Professional UI with theme switching

### **Analysis Tools**
- **Historical Analysis**: Multi-timeframe price charts (7D, 30D, 3M, 1Y)
- **Risk Breakdown**: Detailed risk factor analysis and recommendations
- **Market Indicators**: Volume, market cap, dominance tracking
- **Data Export**: CSV/JSON export capabilities for analysis results

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or compatible version
- pnpm (recommended) or npm
- API keys from supported providers (optional - fallback data available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lvingsarcophagus/crypto-analyzer.git
   cd crypto-analyzer
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup** (optional)
   ```bash
   cp .env.example .env.local
   # Add your API keys for enhanced functionality
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔧 API Configuration

The system supports multiple data providers with automatic fallbacks:

### **Supported APIs**
- **🟡 CoinGecko**: Market data, price history, trading volume
- **🔵 Moralis**: Smart contract analysis, holder data, security metrics
- **🟢 Mobula**: Advanced trading patterns, liquidity analysis
- **🟠 Tokenview**: Blockchain analytics, on-chain statistics

### **Environment Variables**
```env
# Optional - System works with fallback data if not provided
COINGECKO_API_KEY=your_coingecko_api_key
MORALIS_API_KEY=your_moralis_api_key
MOBULA_API_KEY=your_mobula_api_key
TOKENVIEW_API_KEY=your_tokenview_api_key
```

## 📡 API Endpoints

### **Token Analysis**
```bash
# Basic analysis
POST /api/analyze
{
  "tokenId": "ethereum",
  "includeHistorical": true
}

# Comprehensive analysis
POST /api/analyze/advanced
{
  "tokenId": "ethereum",
  "tokenAddress": "0x...",
  "enableCrossValidation": true
}
```

### **Real-time Monitoring**
```bash
# Start monitoring
POST /api/monitoring/metrics
{
  "action": "start_monitoring",
  "tokenIds": ["bitcoin", "ethereum"]
}

# Get metrics
GET /api/monitoring/metrics?tokens=bitcoin,ethereum
```

### **Historical Data**
```bash
# Market history
POST /api/market/history
{
  "tokenId": "bitcoin",
  "days": 30
}
```

## 🔍 Usage Examples

### **Single Token Analysis**
```typescript
const analysis = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenId: 'ethereum',
    includeHistorical: true,
    enableCrossValidation: true
  })
});
```

### **Batch Portfolio Analysis**
```typescript
const portfolioAnalysis = await fetch('/api/analyze/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokens: ['bitcoin', 'ethereum', 'cardano'],
    enableCrossValidation: true
  })
});
```

## 📊 Risk Scoring Algorithm

### **Risk Factors**
- **Market Risk** (0-100): Volatility, market cap ranking, trading volume
- **Security Risk** (0-100): Contract verification, audit status, ownership analysis
- **Liquidity Risk** (0-100): Trading volume, market depth, exchange distribution
- **Concentration Risk** (0-100): Holder distribution, whale concentration

### **Confidence Metrics**
- **Data Completeness**: Percentage of required data available
- **Source Reliability**: Quality rating of data sources (1-4 APIs active)
- **Cross-Validation**: Agreement between multiple data sources
- **Temporal Consistency**: Data consistency over time periods

## 🛠️ Technical Stack

### **Frontend**
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Recharts**: Data visualization library
- **Lucide React**: Icon library

### **Backend**
- **Next.js API Routes**: Serverless API endpoints
- **Multi-API Integration**: Parallel processing with error handling
- **Rate Limiting**: Intelligent request throttling
- **Caching System**: Optimized data storage and retrieval

### **Development**
- **ESLint**: Code quality and consistency
- **TypeScript**: Static type checking
- **Tailwind**: Responsive design system
- **Component Library**: Reusable UI components

## 🚦 Performance & Reliability

### **Performance Features**
- ⚡ **Parallel API calls** for sub-second response times
- 🔄 **Intelligent caching** to minimize API usage
- 📱 **Optimized mobile performance** with responsive design
- 🎯 **Lazy loading** for improved initial page load

### **Reliability Features**
- 🛡️ **Comprehensive error handling** with graceful degradation
- 🔁 **Automatic retry logic** with exponential backoff
- 📊 **Multi-source validation** for data accuracy
- 🚨 **Real-time monitoring** and alert systems

## 📈 Production Ready

### **Enterprise Features**
- ✅ **Rate limiting** and API quota management
- ✅ **Error recovery** and fallback mechanisms
- ✅ **Data validation** and cross-source verification
- ✅ **Confidence scoring** for reliability assessment
- ✅ **Real-time monitoring** and alerting
- ✅ **Comprehensive logging** and error tracking

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [API Docs](./API_INTEGRATION_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/lvingsarcophagus/crypto-analyzer/issues)

## ⭐ Support

If you find this project helpful, please consider giving it a star on GitHub!

---

**Built with ❤️ for the crypto community**
