'use client';

import { useAuth } from '@/lib/auth-context';
import { UserNav } from '@/components/user-nav';
import { apiGet } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertBadge } from '@/components/alerts/AlertBadge';
import { AlertList } from '@/components/alerts/AlertList';

interface WatchlistItem {
  id: string;
  symbol: string;
  companyName: string;
}

interface Quote {
  c: number;
  dp: number;
}

interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  useEffect(() => {
    apiGet<{ success: boolean; data: WatchlistItem[] }>('/watchlist')
      .then((res) => {
        setWatchlist(res.data);
        if (res.data.length > 0) {
          Promise.all(
            res.data.map((item) =>
              apiGet<{ success: boolean; data: Quote }>(`/market/quote/${encodeURIComponent(item.symbol)}`)
                .then((q) => ({ symbol: item.symbol, data: q.data }))
                .catch(() => ({ symbol: item.symbol, data: null }))
            )
          ).then((results) => {
            const map: Record<string, Quote> = {};
            results.forEach((r) => {
              if (r.data) map[r.symbol] = r.data;
            });
            setQuotes(map);
            setWatchlistLoading(false);
          });
        } else {
          setWatchlistLoading(false);
        }
      })
      .catch(() => setWatchlistLoading(false));

    apiGet<{ success: boolean; data: Portfolio[] }>('/portfolio')
      .then((res) => setPortfolios(res.data))
      .catch(() => {})
      .finally(() => setPortfolioLoading(false));
  }, []);

  const totalPortfolioValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0);
  const totalPortfolioCost = portfolios.reduce((sum, p) => sum + (p.totalValue - p.totalPnl), 0);
  const totalPortfolioPnl = totalPortfolioValue - totalPortfolioCost;
  const totalPortfolioPnlPercent = totalPortfolioCost > 0 ? (totalPortfolioPnl / totalPortfolioCost) * 100 : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">FinanceLab</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href={'/dashboard/portfolio' as any} className="text-sm font-medium hover:underline">
              Portfolios
            </Link>
            <Link href={'/dashboard/search' as any} className="text-sm font-medium hover:underline">
              Search
            </Link>
            <Link href={'/dashboard/profile' as any} className="text-sm font-medium hover:underline">
              Profile
            </Link>
            <AlertBadge />
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {user?.firstName} {user?.lastName}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold">Portfolio Value</h3>
            <p className="mt-2 text-2xl font-mono">
              {portfolioLoading ? '—' : `$${totalPortfolioValue.toFixed(2)}`}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold">Total Return</h3>
            <p className={`mt-2 text-2xl font-mono ${totalPortfolioPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {portfolioLoading ? '—' : `${totalPortfolioPnl >= 0 ? '+' : ''}${totalPortfolioPnlPercent.toFixed(2)}%`}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold">Watchlist</h3>
            <p className="mt-2 text-muted-foreground">{watchlist.length} stocks tracked</p>
          </div>
          <Link href={'/dashboard/search' as any}>
            <div className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold">Search Stocks</h3>
              <p className="mt-2 text-muted-foreground">Find and analyze companies</p>
            </div>
          </Link>
          <Link href={'/dashboard/portfolio' as any}>
            <div className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold">Manage Portfolios</h3>
              <p className="mt-2 text-muted-foreground">{portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''}</p>
            </div>
          </Link>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Your Watchlist</h2>
          {watchlistLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          ) : watchlist.length === 0 ? (
            <p className="text-muted-foreground">
              Your watchlist is empty.{' '}
              <Link href={'/dashboard/search' as any} className="text-primary hover:underline">
                Search stocks
              </Link>{' '}
              to add them.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {watchlist.map((item) => {
                const q = quotes[item.symbol];
                return (
                  <Link key={item.id} href={`/dashboard/stock/${item.symbol}` as any}>
                    <div className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{item.symbol}</h3>
                        {q && (
                          <span className={`text-sm font-medium ${q.dp >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {q.dp >= 0 ? '+' : ''}{q.dp?.toFixed(2)}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.companyName}</p>
                      {q && (
                        <p className="mt-2 text-xl font-mono font-semibold">${q.c?.toFixed(2)}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Your Alerts</h2>
          <AlertList />
        </section>
      </main>
    </div>
  );
}