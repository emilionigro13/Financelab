'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';

interface PortfolioItem {
  symbol: string;
  shares: number;
  avgCost: number;
}

interface Portfolio {
  id: string;
  name: string;
  items: PortfolioItem[];
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
}

export default function PortfolioListPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = () => {
    setLoading(true);
    setError('');
    apiGet<{ success: boolean; data: Portfolio[] }>('/portfolio')
      .then((res) => setPortfolios(res.data))
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Failed to load portfolios';
        setError(msg);
        alert('Error loading portfolios: ' + msg);
      })
      .finally(() => setLoading(false));
  };

  const createPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      await apiPost('/portfolio', { name: newName });
      setNewName('');
      loadPortfolios();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create portfolio';
      setError(msg);
      alert('Error creating portfolio: ' + msg);
    } finally {
      setCreating(false);
    }
  };

  const deletePortfolio = async (id: string) => {
    if (!confirm('Delete this portfolio?')) return;
    try {
      await apiDelete(`/portfolio/${id}`);
      loadPortfolios();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Portfolios</h1>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={createPortfolio} className="mb-8 flex gap-4 max-w-md">
          <input
            type="text"
            placeholder="New portfolio name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
          />
          <Button type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </form>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : portfolios.length === 0 ? (
          <p className="text-muted-foreground">
            No portfolios yet. Create one to start tracking investments.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {portfolios.map((p) => (
              <div key={p.id} className="rounded-xl border bg-card p-6">
                <div className="flex items-start justify-between">
                  <Link href={`/dashboard/portfolio/${p.id}` as any}>
                    <h3 className="text-lg font-semibold hover:underline">{p.name}</h3>
                  </Link>
                  <button
                    onClick={() => deletePortfolio(p.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {p.items.length} holdings
                </p>
                <p className="mt-4 text-2xl font-mono font-semibold">
                  ${p.totalValue.toFixed(2)}
                </p>
                <p
                  className={`text-sm font-medium ${
                    p.totalPnl >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {p.totalPnl >= 0 ? '+' : ''}${p.totalPnl.toFixed(2)} (
                  {p.totalPnlPercent.toFixed(2)}%)
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}