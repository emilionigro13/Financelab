'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiPost } from '@/lib/api';
import { UserNav } from '@/components/user-nav';

interface PortfolioItem {
  id: string;
  symbol: string;
  companyName: string;
  shares: number;
  avgCost: number;
  currentPrice: number | null;
  marketValue: number | null;
  costBasis: number;
  pnl: number | null;
  pnlPercent: number | null;
}

interface Transaction {
  id: string;
  type: string;
  symbol: string;
  companyName: string;
  shares: number;
  price: number;
  totalAmount: number;
  realizedPnl: number | null;
  createdAt: string;
}

interface PortfolioDetail {
  id: string;
  name: string;
  items: PortfolioItem[];
  totalValue: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPercent: number;
}

export default function PortfolioDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [portfolio, setPortfolio] = useState<PortfolioDetail | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);

  const [showSellModal, setShowSellModal] = useState(false);
  const [sellSymbol, setSellSymbol] = useState('');
  const [sellMaxShares, setSellMaxShares] = useState(0);
  const [sellQty, setSellQty] = useState('');
  const [sellLoading, setSellLoading] = useState(false);

  useEffect(() => {
    loadPortfolio();
    loadTransactions();
  }, [id]);

  const loadPortfolio = () => {
    setLoading(true);
    apiGet<{ success: boolean; data: PortfolioDetail }>(`/portfolio/${id}`)
      .then((res) => setPortfolio(res.data))
      .catch((err) => alert('Load portfolio error: ' + (err instanceof Error ? err.message : String(err))))
      .finally(() => setLoading(false));
  };

  const loadTransactions = () => {
    setTxLoading(true);
    apiGet<{ success: boolean; data: Transaction[] }>(`/portfolio/${id}/transactions`)
      .then((res) => setTransactions(res.data))
      .catch(() => {})
      .finally(() => setTxLoading(false));
  };

  const openSellModal = (symbol: string, shares: number) => {
    setSellSymbol(symbol);
    setSellMaxShares(shares);
    setSellQty('');
    setShowSellModal(true);
  };

  const closeSellModal = () => {
    setShowSellModal(false);
    setSellSymbol('');
    setSellMaxShares(0);
    setSellQty('');
    setSellLoading(false);
  };

  const confirmSell = async () => {
    const sellShares = parseInt(sellQty);
    if (isNaN(sellShares) || sellShares <= 0 || sellShares > sellMaxShares) {
      alert('Invalid quantity');
      return;
    }

    setSellLoading(true);
    try {
      await apiPost<{ success: boolean; realizedPnl: number }>(`/portfolio/${id}/sell`, {
        symbol: sellSymbol,
        shares: sellShares,
      });
      closeSellModal();
      loadPortfolio();
      loadTransactions();
    } catch (err) {
      alert('Sell error: ' + (err instanceof Error ? err.message : String(err)));
      setSellLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Portfolio not found</p>
      </div>
    );
  }

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
            <Link href={'/dashboard/portfolio' as any} className="text-sm font-medium hover:underline">
              Portfolios
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
          <Link href={'/dashboard/portfolio' as any} className="text-sm text-muted-foreground hover:underline">
            &larr; Back to Portfolios
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">{portfolio.name}</h1>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="text-xl font-mono font-semibold">${portfolio.totalValue.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total Invested</p>
              <p className="text-xl font-mono font-semibold">${portfolio.totalCost.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total P&L</p>
              <p className={`text-xl font-mono font-semibold ${portfolio.totalPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {portfolio.totalPnl >= 0 ? '+' : ''}${portfolio.totalPnl.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Return %</p>
              <p className={`text-xl font-mono font-semibold ${portfolio.totalPnlPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {portfolio.totalPnlPercent >= 0 ? '+' : ''}{portfolio.totalPnlPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 flex justify-end">
          <Link href={'/dashboard/search' as any}>
            <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              + Buy Stock
            </button>
          </Link>
        </div>

        {portfolio.items.length === 0 ? (
          <p className="text-muted-foreground">
            No holdings yet. <Link href={'/dashboard/search' as any} className="text-primary hover:underline">Search stocks to buy</Link>.
          </p>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Symbol</th>
                    <th className="px-4 py-3 text-left font-medium">Company</th>
                    <th className="px-4 py-3 text-right font-medium">Shares</th>
                    <th className="px-4 py-3 text-right font-medium">Avg Cost</th>
                    <th className="px-4 py-3 text-right font-medium">Price</th>
                    <th className="px-4 py-3 text-right font-medium">Market Value</th>
                    <th className="px-4 py-3 text-right font-medium">P&L</th>
                    <th className="px-4 py-3 text-right font-medium">P&L %</th>
                    <th className="px-4 py-3 text-right font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {portfolio.items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono font-medium">{item.symbol}</td>
                      <td className="px-4 py-3">{item.companyName}</td>
                      <td className="px-4 py-3 text-right font-mono">{item.shares}</td>
                      <td className="px-4 py-3 text-right font-mono">${Number(item.avgCost).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono">
                        {item.currentPrice !== null ? `$${item.currentPrice.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {item.marketValue !== null ? `$${item.marketValue.toFixed(2)}` : '—'}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${item.pnl !== null ? (item.pnl >= 0 ? 'text-emerald-600' : 'text-red-600') : ''}`}>
                        {item.pnl !== null ? `${item.pnl >= 0 ? '+' : ''}$${item.pnl.toFixed(2)}` : '—'}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${item.pnlPercent !== null ? (item.pnlPercent >= 0 ? 'text-emerald-600' : 'text-red-600') : ''}`}>
                        {item.pnlPercent !== null ? `${item.pnlPercent >= 0 ? '+' : ''}${item.pnlPercent.toFixed(2)}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50"
                          onClick={() => openSellModal(item.symbol, item.shares)}
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
          {txLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Type</th>
                      <th className="px-4 py-3 text-left font-medium">Symbol</th>
                      <th className="px-4 py-3 text-right font-medium">Shares</th>
                      <th className="px-4 py-3 text-right font-medium">Price</th>
                      <th className="px-4 py-3 text-right font-medium">Total</th>
                      <th className="px-4 py-3 text-right font-medium">Realized P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            tx.type === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-medium">{tx.symbol}</td>
                        <td className="px-4 py-3 text-right font-mono">{tx.shares}</td>
                        <td className="px-4 py-3 text-right font-mono">${Number(tx.price).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-mono">${Number(tx.totalAmount).toFixed(2)}</td>
                        <td className={`px-4 py-3 text-right font-mono ${
                          tx.realizedPnl !== null
                            ? tx.realizedPnl >= 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                            : ''
                        }`}>
                          {tx.realizedPnl !== null
                            ? `${tx.realizedPnl >= 0 ? '+' : ''}$${Number(tx.realizedPnl).toFixed(2)}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {showSellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-xl border bg-card p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold mb-4">Sell {sellSymbol}</h2>
            <p className="text-sm text-muted-foreground mb-4">You own {sellMaxShares} shares</p>
            <input
              type="number"
              min={1}
              max={sellMaxShares}
              value={sellQty}
              onChange={(e) => setSellQty(e.target.value)}
              placeholder="Shares to sell"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
                onClick={closeSellModal}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                onClick={confirmSell}
                disabled={sellLoading}
              >
                {sellLoading ? 'Selling...' : 'Confirm Sell'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}