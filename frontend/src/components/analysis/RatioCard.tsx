'use client';

import { useState } from 'react';

interface RatioCardProps {
  name: string;
  value: string;
  formula: string;
  description: string;
  category: string;
  signal: 'positive' | 'neutral' | 'negative' | 'unknown';
}

const signalColors = {
  positive:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  neutral:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  negative:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  unknown:
    'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

const signalDot = {
  positive: 'bg-emerald-500',
  neutral: 'bg-amber-500',
  negative: 'bg-red-500',
  unknown: 'bg-slate-400',
};

const categoryLabels: Record<string, string> = {
  valuation: 'Valuation',
  profitability: 'Profitability',
  leverage: 'Leverage',
  liquidity: 'Liquidity',
  dividends: 'Dividends',
};

export function RatioCard({ name, value, formula, description, category, signal }: RatioCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className="relative rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md cursor-pointer"
      onClick={() => setShowDetails(!showDetails)}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground mb-2">
            {categoryLabels[category] || category}
          </span>
          <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium ${signalColors[signal]}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${signalDot[signal]}`} />
          {signal === 'unknown' ? 'N/A' : signal}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-3xl font-mono font-bold text-foreground">{value}</p>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-border animate-fade-in">
          <div className="space-y-2">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Formula
              </p>
              <p className="text-sm font-mono text-primary">{formula}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Description
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </div>
        </div>
      )}

      {!showDetails && (
        <p className="mt-3 text-xs text-muted-foreground">Click to see formula & details</p>
      )}
    </div>
  );
}