import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserNav } from '@/components/user-nav';
import {
  TrendingUp,
  BarChart3,
  Shield,
  Zap,
  LineChart,
  PieChart,
  ArrowRight,
  Github,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-navy-900">
              FinanceLab
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-navy-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#analytics"
              className="text-sm font-medium text-slate-600 hover:text-navy-900 transition-colors"
            >
              Analytics
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-slate-600 hover:text-navy-900 transition-colors"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-navy-900 transition-colors"
            >
              <Github className="h-5 w-5" />
            </Link>
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 mb-8">
                <Zap className="mr-1 h-3.5 w-3.5" />
                Professional Financial Analysis Platform
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-navy-950 sm:text-5xl md:text-6xl lg:text-7xl">
                Master the Markets with{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-navy-600 bg-clip-text text-transparent">
                  Data-Driven
                </span>{' '}
                Intelligence
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 md:text-xl max-w-2xl mx-auto">
                Analyze stocks, track portfolios, and simulate investments with
                professional-grade tools. Built for investors who demand precision.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                  <Link href="/dashboard">
                    Start Analyzing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                  <Link href="#features">Explore Features</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-emerald-100/50 to-transparent rounded-full blur-3xl" />
          </div>
        </section>

        <section id="features" className="py-24 bg-slate-50/50">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
                Everything You Need to Analyze Markets
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Professional tools designed for serious investors and financial analysts.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<BarChart3 className="h-6 w-6" />}
                title="Real-Time Data"
                description="Access live market data, financial statements, and key metrics for thousands of publicly traded companies."
              />
              <FeatureCard
                icon={<LineChart className="h-6 w-6" />}
                title="Interactive Charts"
                description="Visualize stock performance with professional-grade charts powered by TradingView and Chart.js."
              />
              <FeatureCard
                icon={<PieChart className="h-6 w-6" />}
                title="Portfolio Tracking"
                description="Build and monitor virtual portfolios with real-time performance analytics and risk assessment."
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6" />}
                title="Risk Analysis"
                description="Calculate Sharpe Ratio, Beta, Volatility, and correlation matrices to understand your exposure."
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="AI-Powered Insights"
                description="Leverage machine learning for automatic balance sheet analysis and sentiment detection."
              />
              <FeatureCard
                icon={<TrendingUp className="h-6 w-6" />}
                title="Valuation Models"
                description="Run DCF analysis, Monte Carlo simulations, and Black-Scholes calculations with professional accuracy."
              />
            </div>
          </div>
        </section>

        <section id="analytics" className="py-24">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl mb-6">
                  Built with Modern Technology
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                  FinanceLab is built using industry-standard technologies chosen for
                  performance, scalability, and developer experience.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <TechBadge name="Next.js" />
                  <TechBadge name="TypeScript" />
                  <TechBadge name="PostgreSQL" />
                  <TechBadge name="Prisma ORM" />
                  <TechBadge name="TailwindCSS" />
                  <TechBadge name="Express.js" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StatCard number="50+" label="Financial Ratios" />
                <StatCard number="10K+" label="Companies" />
                <StatCard number="Real-time" label="Market Data" />
                <StatCard number="AI" label="Powered Analysis" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-navy-950 text-white">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Ready to Start Your Financial Journey?
              </h2>
              <p className="text-lg text-slate-300 mb-10">
                Join thousands of investors using FinanceLab to make smarter,
                data-driven investment decisions.
              </p>
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-emerald-500 hover:bg-emerald-600 text-white"
                asChild
              >
                <Link href="/dashboard">
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-slate-50">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-navy-900">
                <TrendingUp className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-navy-900">FinanceLab</span>
            </div>
            <p className="text-sm text-slate-500">
              Built for university portfolio. Demonstrating expertise in software
              engineering, finance, and data science.
            </p>
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} FinanceLab. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <CardTitle className="text-xl text-navy-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-xl border bg-white p-6 text-center hover:shadow-md transition-shadow">
      <div className="text-3xl font-bold text-navy-900 font-mono">{number}</div>
      <div className="mt-1 text-sm font-medium text-slate-600">{label}</div>
    </div>
  );
}

function TechBadge({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3">
      <div className="h-2 w-2 rounded-full bg-emerald-500" />
      <span className="text-sm font-medium text-navy-800">{name}</span>
    </div>
  );
}