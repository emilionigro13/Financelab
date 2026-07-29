'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { RatioCard } from './RatioCard';

interface FinancialRatio {
  name: string;
  value: number | null;
  formattedValue: string;
  formula: string;
  description: string;
  category: string;
  signal: 'positive' | 'neutral' | 'negative' | 'unknown';
}

interface AnalysisData {
  symbol: string;
  updatedAt: string;
  ratios: FinancialRatio[];
}

export function FinancialRatios({ symbol }: { symbol: string }) {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiGet<{ success: boolean; data: AnalysisData }>(
      `/market/analysis/${encodeURIComponent(symbol)}`
    )
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
        setLoading(false);
      });
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:bg-red-900/20 dark:border-red-800">
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const categories = ['valuation', 'profitability', 'leverage', 'liquidity', 'dividends'] as const;
  const categoryLabels: Record<string, string> = {
    valuation: 'Valuation',
    profitability: 'Profitability',
    leverage: 'Leverage',
    liquidity: 'Liquidity',
    dividends: 'Dividends',
  };

  return (
    <div className="space-y-10">
      {categories.map((cat) => {
        const catRatios = data.ratios.filter((r) => r.category === cat);
        if (catRatios.length === 0) return null;
        return (
          <section key={cat}>
            <h3 className="text-lg font-semibold mb-4 text-foreground">{categoryLabels[cat]}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catRatios.map((ratio) => (
                <RatioCard
                  key={ratio.name}
                  name={ratio.name}
                  value={ratio.formattedValue}
                  formula={ratio.formula}
                  description={ratio.description}
                  category={ratio.category}
                  signal={ratio.signal}
                />
              ))}
            </div>
          </section>
        );
      })}

      <p className="text-xs text-muted-foreground text-right">
        Last updated: {new Date(data.updatedAt).toLocaleString()}
      </p>
    </div>
  );
}