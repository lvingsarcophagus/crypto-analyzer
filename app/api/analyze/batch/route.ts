import { type NextRequest, NextResponse } from "next/server"
import { IntegratedRiskAnalysisService } from "@/lib/integrated-risk-service"

export async function POST(request: NextRequest) {
  try {
    const { tokens, reportType = 'summary' } = await request.json()

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return NextResponse.json({ 
        error: "Tokens array is required and must not be empty" 
      }, { status: 400 })
    }

    if (tokens.length > 50) {
      return NextResponse.json({ 
        error: "Maximum 50 tokens allowed per batch analysis" 
      }, { status: 400 })
    }

    // Convert token list to analysis requests
    const tokenRequests = tokens.map((token: any) => ({
      tokenId: token.tokenId || token.id,
      tokenAddress: token.tokenAddress || token.address,
      blockchain: token.blockchain || 'ethereum',
      includeHistorical: reportType === 'detailed'
    }))

    let result

    if (reportType === 'detailed') {
      // Generate comprehensive risk report
      const tokenIds = tokenRequests.map(req => req.tokenId)
      result = await IntegratedRiskAnalysisService.generateRiskReport(tokenIds)
      
      return NextResponse.json({
        report_type: 'detailed',
        ...result,
        metadata: {
          analysis_timestamp: new Date().toISOString(),
          tokens_requested: tokens.length,
          tokens_analyzed: result.detailed_analysis.size,
          api_sources: ['CoinGecko', 'Moralis', 'Mobula', 'Tokenview']
        }
      })
    } else {
      // Quick batch assessment
      const batchResults = await IntegratedRiskAnalysisService.batchRiskAssessment(tokenRequests)
      
      // Convert Map to object for JSON response
      const resultsObject: Record<string, any> = {}
      batchResults.forEach((analysis, tokenId) => {
        resultsObject[tokenId] = analysis
      })

      // Calculate summary statistics
      const riskScores = Array.from(batchResults.values()).map(analysis => analysis.overall_score)
      const riskLevels = Array.from(batchResults.values()).reduce((acc, analysis) => {
        acc[analysis.risk_level] = (acc[analysis.risk_level] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const summary = {
        total_tokens: tokens.length,
        successfully_analyzed: batchResults.size,
        average_risk_score: riskScores.length > 0 ? 
          Math.round(riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length) : 0,
        highest_risk_score: riskScores.length > 0 ? Math.max(...riskScores) : 0,
        lowest_risk_score: riskScores.length > 0 ? Math.min(...riskScores) : 0,
        risk_level_distribution: riskLevels
      }

      return NextResponse.json({
        report_type: 'summary',
        summary,
        results: resultsObject,
        metadata: {
          analysis_timestamp: new Date().toISOString(),
          tokens_requested: tokens.length,
          tokens_analyzed: batchResults.size,
          api_sources: ['CoinGecko', 'Moralis', 'Mobula', 'Tokenview']
        }
      })
    }

  } catch (error) {
    console.error("Batch analysis API error:", error)
    return NextResponse.json({ 
      error: "Failed to perform batch analysis",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Get analysis capabilities and limits
  return NextResponse.json({
    capabilities: {
      max_tokens_per_batch: 50,
      supported_blockchains: ['ethereum', 'polygon', 'bsc', 'avalanche', 'arbitrum', 'optimism'],
      report_types: ['summary', 'detailed'],
      integrated_apis: [
        {
          name: 'CoinGecko',
          purpose: 'Market data and basic token information',
          rate_limit: '30 requests/minute'
        },
        {
          name: 'Moralis',
          purpose: 'Contract metadata and holder information',
          rate_limit: '25 requests/second'
        },
        {
          name: 'Mobula',
          purpose: 'Trading data and market metrics',
          rate_limit: '300 requests/minute'
        },
        {
          name: 'Tokenview',
          purpose: 'Blockchain data and token holder analysis',
          rate_limit: '1 request/second'
        }
      ]
    },
    example_request: {
      tokens: [
        {
          tokenId: 'ethereum',
          tokenAddress: '0x...',
          blockchain: 'ethereum'
        },
        {
          tokenId: 'bitcoin',
          blockchain: 'bitcoin'
        }
      ],
      reportType: 'summary' // or 'detailed'
    }
  })
}
