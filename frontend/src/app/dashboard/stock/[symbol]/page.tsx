'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { StockChart } from '@/components/charts/StockChart';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';
import { FinancialRatios } from '@/components/analysis/FinancialRatios';
import { FinancialStatements } from '@/components/financials/FinancialStatements';

interface Quote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
}

interface Profile {
  name: string;
  finnhubIndustry: string;
  country: string;
  currency: string;
  marketCapitalization: number;
  weburl: string;
  logo: string;
}

interface WatchlistItem {
  id: string;
  symbol: string;
}

export default function StockPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistItemId, setWatchlistItemId] = useState('');
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'statements'>('overview');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiGet<{ success: boolean; data: Quote }>(`/market/quote/${encodeURIComponent(symbol)}`),
      apiGet<{ success: boolean; data: Profile }>(`/market/company/${encodeURIComponent(symbol)}`),
    ])
      .then(([quoteRes, profileRes]) => {
        setQuote(quoteRes.data);
        setProfile(profileRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [symbol]);

  useEffect(() => {
    apiGet<{ success: boolean; data: WatchlistItem[] }>('/watchlist')
      .then((res) => {
        const found = res.data.find((w) => w.symbol === symbol);
        if (found) {
          setInWatchlist(true);
          setWatchlistItemId(found.id);
        }
      })
      .catch(() => {});
  }, [symbol]);

  const toggleWatchlist = async () => {
    if (!profile) return;
    setWatchlistLoading(true);
    try {
      if (inWatchlist) {
        await apiDelete(`/watchlist/${watchlistItemId}`);
        setInWatchlist(false);
        setWatchlistItemId('');
      } else {
        const res = await apiPost<{ success: boolean; data: { id: string } }>('/watchlist', {
          symbol,
          companyName: profile.name || symbol,
        });
        setInWatchlist(true);
        setWatchlistItemId(res.data.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWatchlistLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">FinanceLab</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href={'/dashboard' as any} className="text-sm font-medium hover:underline">
              Dashboard
            </Link>
            <Link href={'/dashboard/search' as any} className="text-sm font-medium hover:underline">
              Search
            </Link>
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="mb-8">
          <Link href={'/dashboard/search' as any} className="text-sm text-muted-foreground hover:underline">
            &larr; Back to Search
          </Link>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                {profile?.logo && (
                  <img
                    src={profile.logo}
                    alt={profile.name}
                    className="h-12 w-12 rounded-lg object-contain bg-white p-1"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold">{profile?.name || symbol}</h1>
                  <p className="text-muted-foreground">
                    {symbol} &middot; {profile?.finnhubIndustry || 'N/A'} &middot; {profile?.country || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-baseline gap-4">
                <span className="text-4xl font-bold font-mono">${quote?.c.toFixed(2) || '0.00'}</span>
                <span
                  className={`text-lg font-medium ${
                    (quote?.dp || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {quote && quote.dp >= 0 ? '+' : ''}
                  {quote?.d.toFixed(2)} ({quote?.dp.toFixed(2)}%)
                </span>
              </div>

              <div className="mt-6 border-b border-border">
                <nav className="flex gap-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'overview'
                        ? 'border-emerald-500 text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'analysis'
                        ? 'border-emerald-500 text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Financial Analysis
                  </button>
                  <button
                    onClick={() => setActiveTab('statements')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'statements'
                        ? 'border-emerald-500 text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Financial Statements
                  </button>
                </nav>
              </div>

              {activeTab === 'overview' && (
                <div className="mt-8 space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-lg border bg-card p-4">
                      <p className="text-xs text-muted-foreground">Open</p>
                      <p className="text-lg font-mono font-semibold">${quote?.o.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                      <p className="text-xs text-muted-foreground">High</p>
                      <p className="text-lg font-mono font-semibold">${quote?.h.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                      <p className="text-xs text-muted-foreground">Low</p>
                      <p className="text-lg font-mono font-semibold">${quote?.l.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                      <p className="text-xs text-muted-foreground">Prev Close</p>
                      <p className="text-lg font-mono font-semibold">${quote?.pc.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={toggleWatchlist} disabled={watchlistLoading || !profile}>
                      {watchlistLoading
                        ? 'Loading...'
                        : inWatchlist
                        ? 'Remove from Watchlist'
                        : 'Add to Watchlist'}
                    </Button>
                  </div>

                  <div className="rounded-xl border bg-card p-6">
                    <h2 className="text-xl font-semibold mb-6">Price History (60 Days)</h2>
                    <StockChart symbol={symbol} />
                  </div>

                  {profile?.weburl && (
                    <div>
                      <a
                        href={profile.weburl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Visit company website &rarr;
                      </a>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analysis' && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-6">Financial Ratios</h2>
                  <FinancialRatios symbol={symbol} />
                </div>
              )}

              {activeTab === 'statements' && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-6">Financial Statements</h2>
                  <FinancialStatements symbol={symbol} />
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}