"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  TrendingUp, 
  BarChart3, 
  Zap,
  CheckCircle,
  ArrowRight,
  Activity,
  Globe,
  Lock,
  Target,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

export default function IntroductionPage() {
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      icon: Shield,
      title: "Advanced Risk Analysis",
      description: "Real-time cryptocurrency risk assessment with multi-factor analysis including market conditions, liquidity, security, and holder concentration.",
      color: "text-amber-400"
    },
    {
      icon: TrendingUp,
      title: "Live Price Tracking",
      description: "Monitor cryptocurrency prices in real-time with interactive charts and historical data visualization.",
      color: "text-green-400"
    },
    {
      icon: BarChart3,
      title: "Comprehensive Analytics",
      description: "Deep insights into market trends, volatility patterns, and risk factors to make informed investment decisions.",
      color: "text-blue-400"
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications and updates on market conditions and risk level changes for your tracked cryptocurrencies.",
      color: "text-purple-400"
    }
  ]

  const stats = [
    { label: "Risk Assessments", value: "10,000+", icon: Shield },
    { label: "Cryptocurrencies", value: "500+", icon: Globe },
    { label: "Real-time Updates", value: "24/7", icon: Activity },
    { label: "Accuracy Rate", value: "99.5%", icon: Target }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              Welcome to CryptoAnalyzer
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Smart Crypto Risk Analysis
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Analyze cryptocurrency risks with advanced AI-powered tools. Make informed investment decisions with real-time market data and comprehensive risk assessments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline" className="border-border hover:bg-card px-8 py-3">
                Admin Dashboard
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="backdrop-blur-md bg-card/80 border-border shadow-xl">
                <CardContent className="p-6 text-center">
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to analyze and monitor cryptocurrency risks in one comprehensive platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`backdrop-blur-md bg-card/80 border-border shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                currentFeature === index ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setCurrentFeature(index)}
            >
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/20 backdrop-blur-sm">
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple steps to get comprehensive cryptocurrency risk analysis.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">Enter Token</h3>
            <p className="text-muted-foreground">
              Simply enter the cryptocurrency symbol or name you want to analyze.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-secondary">2</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">AI Analysis</h3>
            <p className="text-muted-foreground">
              Our advanced AI analyzes multiple risk factors and market conditions.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-green-400">3</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">Get Results</h3>
            <p className="text-muted-foreground">
              Receive detailed risk assessment with actionable insights and recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Why Choose CryptoAnalyzer?</h2>
            <p className="text-xl text-muted-foreground">
              Industry-leading features that set us apart from the competition.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Lock,
                title: "Secure & Reliable",
                description: "Bank-grade security with 99.9% uptime guarantee."
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Real-time analysis with sub-second response times."
              },
              {
                icon: Globe,
                title: "Global Coverage",
                description: "Supports 500+ cryptocurrencies across all major exchanges."
              },
              {
                icon: Target,
                title: "Accurate Predictions",
                description: "99.5% accuracy rate backed by advanced machine learning."
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-6 rounded-lg bg-card/30 backdrop-blur-sm border border-border">
                <div className="p-2 rounded-lg bg-primary/20">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of investors who trust CryptoAnalyzer for their cryptocurrency risk analysis needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3">
                Start Analyzing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/monitoring">
              <Button size="lg" variant="outline" className="border-border hover:bg-card px-8 py-3">
                View Live Demo
                <Activity className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
