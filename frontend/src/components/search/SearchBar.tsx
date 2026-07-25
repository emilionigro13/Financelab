'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ description: string; displaySymbol: string; symbol: string; type: string }>>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await apiGet<{ success: boolean; data: { result: Array<{ description: string; displaySymbol: string; symbol: string; type: string }> } }>(`/market/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.result.slice(0, 8));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (symbol: string) => {
    setShowDropdown(false);
    setQuery('');
    router.push(`/dashboard/stock/${symbol}` as any);
  };

  return (
    <div className="relative w-full max-w-md" ref={ref}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        placeholder="Search stocks (e.g. AAPL, Tesla)..."
        className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      />
      {loading && (
        <div className="absolute right-3 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      )}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg">
          {results.map((item) => (
            <button
              key={item.symbol}
              onClick={() => handleSelect(item.symbol)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-muted transition-colors"
            >
              <div>
                <span className="font-semibold">{item.symbol}</span>
                <span className="ml-2 text-muted-foreground">{item.description}</span>
              </div>
              <span className="text-xs text-muted-foreground">{item.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}