import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { NotificationProvider } from '@/components/ui/notifications'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CryptoRisk Pro - Professional Cryptocurrency Risk Analysis',
  description: 'Advanced cryptocurrency risk assessment platform with real-time data from multiple APIs. Professional-grade insights for traders, investors, and institutions.',
  generator: 'CryptoRisk Pro',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
        >
          <NotificationProvider>
          {/* Global Header */}
          <header className="sticky top-0 z-50 border-b border-border bg-card/30 backdrop-blur-md supports-[backdrop-filter]:bg-card/20 shadow-lg">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-primary to-secondary w-8 h-8 rounded-md flex items-center justify-center text-primary-foreground font-bold">CR</div>
                <span className="font-semibold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-lg">CryptoRisk</span>
              </Link>
              <nav className="flex items-center gap-2 text-sm">
                <Link href="/dashboard" className="hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-card/50">Dashboard</Link>
                <Link href="/analysis" className="hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-card/50">Risk Analysis</Link>
                <Link href="/portfolio" className="hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-card/50">Portfolio</Link>
                <Link href="/education" className="hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-card/50">Education</Link>
                <Link href="/admin" className="hover:text-primary transition-colors ml-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-md hover:bg-primary/20">Admin</Link>
              </nav>
            </div>
          </header>

                    <main className="min-h-[calc(100vh-120px)]">{children}</main>

          {/* Global Footer */}
          <footer className="border-t border-border bg-card/30 backdrop-blur-md py-10 mt-20">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-foreground">CryptoRisk</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Advanced cryptocurrency risk assessment platform providing real-time analysis and monitoring.
                  </p>
                  <div className="flex items-center gap-4">
                    <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                      </svg>
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                      </svg>
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                      </svg>
                    </Link>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4 text-foreground">Features</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
                    <li><Link href="/analysis" className="text-muted-foreground hover:text-primary transition-colors">Risk Analysis</Link></li>
                    <li><Link href="/portfolio" className="text-muted-foreground hover:text-primary transition-colors">Portfolio Tracker</Link></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/education" className="text-muted-foreground hover:text-primary transition-colors">Education Center</Link></li>
                    <li><Link href="/docs" className="text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
                    <li><Link href="/api-docs" className="text-muted-foreground hover:text-primary transition-colors">API Reference</Link></li>
                    <li><Link href="/support" className="text-muted-foreground hover:text-primary transition-colors">Support</Link></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4 text-foreground">Company</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                    <li><Link href="/careers" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
                    <li><Link href="/press" className="text-muted-foreground hover:text-primary transition-colors">Press</Link></li>
                    <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-muted-foreground">© 2025 CryptoRisk. All rights reserved.</p>
                <div className="flex items-center gap-6">
                  <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
                  <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link>
                </div>
              </div>
            </div>
          </footer>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
