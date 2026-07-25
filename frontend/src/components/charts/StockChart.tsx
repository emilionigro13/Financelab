'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiGet } from '@/lib/api';

interface ChartData {
  date: string;
  price: number;
}

export function StockChart({ symbol }: { symbol: string }) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    apiGet<{ success: boolean; data: { s: string; t: number[]; c: number[] } }>(`/market/candles/${encodeURIComponent(symbol)}`)
      .then((res) => {
        if (res.data.s === 'no_data' || !res.data.t) {
          setError('No historical data available');
          setLoading(false);
          return;
        }
        const formatted = res.data.t.map((time, i) => ({
          date: new Date(time * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: res.data.c[i],
        }));
        setData(formatted);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load chart');
        setLoading(false);
      });
  }, [symbol]);

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

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
            itemStyle={{ color: '#10b981' }}
            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Price']}
          />
          <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}