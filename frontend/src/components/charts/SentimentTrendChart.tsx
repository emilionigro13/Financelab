'use client';

import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { apiGet } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface TrendPoint {
  date: string;
  averageScore: number;
  articleCount: number;
  dominantSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sma3?: number;
}

interface MergedPoint {
  date: string;
  mainScore: number | null;
  mainSma3: number | null;
  mainDominant?: string;
  mainCount?: number;
  compScore: number | null;
  compSma3: number | null;
  compDominant?: string;
  compCount?: number;
}

function MainDot(props: any) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null) return null;
  const color =
    payload.mainDominant === 'POSITIVE' ? '#10b981' :
    payload.mainDominant === 'NEGATIVE' ? '#ef4444' : '#94a3b8';
  return <circle cx={cx} cy={cy} r={4} fill={color} />;
}

function CompDot(props: any) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null) return null;
  const color =
    payload.compDominant === 'POSITIVE' ? '#3b82f6' :
    payload.compDominant === 'NEGATIVE' ? '#ef4444' : '#94a3b8';
  return <circle cx={cx} cy={cy} r={4} fill={color} />;
}

export function SentimentTrendChart({ symbol, compareSymbol }: { symbol: string; compareSymbol?: string }) {
  const [mainData, setMainData] = useState<TrendPoint[]>([]);
  const [compareData, setCompareData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      apiGet<{ success: boolean; data: TrendPoint[] }>(`/market/sentiment-trend/${encodeURIComponent(symbol)}`),
      compareSymbol ? apiGet<{ success: boolean; data: TrendPoint[] }>(`/market/sentiment-trend/${encodeURIComponent(compareSymbol)}`) : Promise.resolve(null),
    ])
      .then(([mainRes, compRes]) => {
        setMainData(mainRes.data);
        setCompareData(compRes ? compRes.data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load sentiment trend');
        setLoading(false);
      });
  }, [symbol, compareSymbol]);

  const merged = useMemo<MergedPoint[]>(() => {
    const allDates = new Set<string>();
    mainData.forEach(d => allDates.add(d.date));
    compareData.forEach(d => allDates.add(d.date));
    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map(date => {
      const main = mainData.find(d => d.date === date);
      const comp = compareData.find(d => d.date === date);
      return {
        date,
        mainScore: main?.averageScore ?? null,
        mainSma3: main?.sma3 ?? null,
        mainDominant: main?.dominantSentiment,
        mainCount: main?.articleCount,
        compScore: comp?.averageScore ?? null,
        compSma3: comp?.sma3 ?? null,
        compDominant: comp?.dominantSentiment,
        compCount: comp?.articleCount,
      };
    });
  }, [mainData, compareData]);

  const downloadCSV = () => {
    const headers = ['Date', 'AverageScore', 'ArticleCount', 'DominantSentiment', 'SMA3'];
    const rows = mainData.map(d => [
      d.date,
      d.averageScore,
      d.articleCount,
      d.dominantSentiment,
      d.sma3 ?? '',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${symbol}_sentiment_trend.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border bg-card">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (mainData.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border bg-card">
        <p className="text-sm text-muted-foreground">No sentiment data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {compareSymbol ? `Comparing ${symbol} vs ${compareSymbol}` : `Showing ${mainData.length} days`}
        </p>
        <Button variant="outline" size="sm" onClick={downloadCSV}>
          Download CSV
        </Button>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={merged}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[-0.5, 0.5]} />
            <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(value: any, name: any, props: any) => {
                const p = props.payload;
                if (name === 'Score') return [`${Number(value).toFixed(4)} (${p.mainDominant}, ${p.mainCount} articles)`, name];
                if (name === 'SMA3') return [value !== null ? Number(value).toFixed(4) : 'N/A', name];
                if (name === 'Comp Score') return [`${Number(value).toFixed(4)} (${p.compDominant}, ${p.compCount} articles)`, name];
                if (name === 'Comp SMA3') return [value !== null ? Number(value).toFixed(4) : 'N/A', name];
                return [value, name];
              }}
              labelFormatter={(label: any) => `Date: ${label}`}
            />
            <Legend />

            <Line type="monotone" dataKey="mainScore" name="Score" stroke="#10b981" strokeWidth={2} dot={<MainDot />} activeDot={{ r: 6, fill: '#10b981' }} connectNulls />
            <Line type="monotone" dataKey="mainSma3" name="SMA3" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls />
            {compareSymbol && (
              <>
                <Line type="monotone" dataKey="compScore" name="Comp Score" stroke="#3b82f6" strokeWidth={2} dot={<CompDot />} activeDot={{ r: 6, fill: '#3b82f6' }} connectNulls />
                <Line type="monotone" dataKey="compSma3" name="Comp SMA3" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}