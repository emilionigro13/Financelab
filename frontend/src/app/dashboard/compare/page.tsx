'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { SearchBar } from '@/components/search/SearchBar';
import { CompareTable } from '@/components/compare/CompareTable';
import { StockChart } from '@/components/charts/StockChart';
import { UserNav } from '@/components/user-nav';
import { AlertBadge } from '@/components/alerts/AlertBadge';
import { Button } from '@/components/ui/button';

interface FinancialRatio {
  name: string;
  value: number | null;
  formattedValue: string;
  formula: string;
  description: string;
  category: 'valuation' | 'profitability' | 'leverage' | 'liquidity' | 'dividends';
  signal: 'positive' | 'neutral' | 'negative' | 'unknown';
}

interface CompanyData {
  symbol: string;
  quote: { c: number; dp: number };
  profile: { name: string; marketCapitalization: number; currency: string; finnhubIndustry: string };
  analysis: { ratios: FinancialRatio[] };
}

interface CompareResponse {
  success: boolean;
  data: { a: CompanyData; b: CompanyData };
}

export default function ComparePage() {
  const [symbolA, setSymbolA] = useState('');
  const [symbolB, setSymbolB] = useState('');
  const [data, setData] = useState<CompareResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!symbolA || !symbolB) {
      setData(null);
      return;
    }
    setLoading(true);
    setError('');
    apiGet<CompareResponse>(`/market/compare/${encodeURIComponent(symbolA)}/${encodeURIComponent(symbolB)}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Comparison failed'))
      .finally(() => setLoading(false));
  }, [symbolA, symbolB]);

  const swap = () => {
    setSymbolA(symbolB);
    setSymbolB(symbolA);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">FinanceLab</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href={'/dashboard' as any} className="text-sm font-medium hover:underline">Dashboard</Link>
            <Link href={'/dashboard/portfolio' as any} className="text-sm font-medium hover:underline">Portfolios</Link>
            <Link href={'/dashboard/search' as any} className="text-sm font-medium hover:underline">Search</Link>
            <AlertBadge />
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Compare Companies</h1>
          <p className="text-muted-foreground mt-1">
            Side-by-side fundamental comparison. Ratios are scale-independent by construction —
            a $200B company and a $2B company compete on equal footing here.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start">
          <div className="flex-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">Company A</p>
            {symbolA ? (
              <div className="flex items-center gap-3">
                <span className="rounded-md border bg-muted px-4 py-2.5 text-sm font-semibold">{symbolA}</span>
                <Button variant="ghost" size="sm" onClick={() => setSymbolA('')}>Change</Button>
              </div>
            ) : (
              <SearchBar onSelect={setSymbolA} placeholder="Pick company A (e.g. AAPL)..." />
            )}
          </div>
          <div className="flex items-end pb-1">
            <Button variant="outline" size="sm" onClick={swap} disabled={!symbolA || !symbolB}>Swap</Button>
          </div>
          <div className="flex-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-violet-600">Company B</p>
            {symbolB ? (
              <div className="flex items-center gap-3">
                <span className="rounded-md border bg-muted px-4 py-2.5 text-sm font-semibold">{symbolB}</span>
                <Button variant="ghost" size="sm" onClick={() => setSymbolB('')}>Change</Button>
              </div>
            ) : (
              <SearchBar onSelect={setSymbolB} placeholder="Pick company B (e.g. MSFT)..." />
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        )}

        {data && !loading && (
          <div className="space-y-10">
            <CompareTable a={data.a} b={data.b} />

            <div>
              <h2 className="text-xl font-semibold mb-4">Price Performance (60 Days)</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border bg-card p-4">
                  <p className="mb-4 text-sm font-semibold">{data.a.symbol}</p>
                  <StockChart symbol={data.a.symbol} />
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <p className="mb-4 text-sm font-semibold">{data.b.symbol}</p>
                  <StockChart symbol={data.b.symbol} />
                </div>
              </div>
            </div>
          </div>
        )}

        {!symbolA && !symbolB && !loading && (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            Select two companies above to start comparing
          </div>
        )}
      </main>
    </div>
  );
}