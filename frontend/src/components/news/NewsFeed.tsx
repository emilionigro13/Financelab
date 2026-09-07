'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { NewsCard } from './NewsCard';

interface SentimentResult {
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score: number;
}

interface NewsArticle {
  id: number;
  datetime: number;
  headline: string;
  source: string;
  summary: string;
  url: string;
  image: string;
  sentiment: SentimentResult;
}

interface NewsResponse {
  news: NewsArticle[];
  summary: {
    overall: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    averageScore: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    total: number;
  };
}

export function NewsFeed({ symbol }: { symbol: string }) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [summary, setSummary] = useState<NewsResponse['summary'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'>('ALL');

  useEffect(() => {
    setLoading(true);
    setError('');

    apiGet<{ success: boolean; data: NewsResponse }>(
      `/market/news/${encodeURIComponent(symbol)}`
    )
      .then((res) => {
        setArticles(res.data.news);
        setSummary(res.data.summary);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load news');
        setLoading(false);
      });
  }, [symbol]);

  const filteredArticles = filter === 'ALL' ? articles : articles.filter((a) => a.sentiment.sentiment === filter);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
        No recent news available for {symbol}.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{summary.positiveCount}</p>
            <p className="text-xs text-muted-foreground">Positive</p>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{summary.negativeCount}</p>
            <p className="text-xs text-muted-foreground">Negative</p>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-slate-600">{summary.neutralCount}</p>
            <p className="text-xs text-muted-foreground">Neutral</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredArticles.length} of {articles.length} articles
        </p>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          <option value="ALL">All Sentiments</option>
          <option value="POSITIVE">Positive</option>
          <option value="NEGATIVE">Negative</option>
          <option value="NEUTRAL">Neutral</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredArticles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}