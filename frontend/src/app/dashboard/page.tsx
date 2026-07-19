'use client';

import { useAuth } from '@/lib/auth-context';
import { UserNav } from '@/components/user-nav';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">FinanceLab</span>
          </Link>
          <UserNav />
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
            <p className="mt-2 text-2xl font-mono">$0.00</p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold">Total Return</h3>
            <p className="mt-2 text-2xl font-mono text-emerald-600">+0.00%</p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold">Watchlist</h3>
            <p className="mt-2 text-muted-foreground">0 stocks tracked</p>
          </div>
        </div>
      </main>
    </div>
  );
}