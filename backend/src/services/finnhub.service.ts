import { Cache } from '../utils/cache.js';
import { config } from '../config.js';

const cache = new Cache();
const BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = config.finnhub.apiKey;

async function fetchFinnhub<T>(endpoint: string, cacheKey: string, ttl: number): Promise<T> {
  const cached = cache.get<T>(cacheKey);
  if (cached) return cached;

  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${BASE_URL}${endpoint}${separator}token=${API_KEY}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'FinanceLab/1.0' },
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'No body');
    console.error(`[Finnhub] ${res.status} on ${endpoint}:`, errorBody);
    throw new Error(`Finnhub API error: ${res.status}`);
  }

  const data = await res.json();
  cache.set(cacheKey, data, ttl);
  return data;
}

export async function searchSymbols(query: string) {
  return fetchFinnhub<{ count: number; result: Array<{ description: string; displaySymbol: string; symbol: string; type: string }> }>(
    `/search?q=${encodeURIComponent(query)}`,
    `search:${query.toLowerCase()}`,
    300
  );
}

export async function getQuote(symbol: string) {
  return fetchFinnhub<{ c: number; d: number; dp: number; h: number; l: number; o: number; pc: number; t: number }>(
    `/quote?symbol=${encodeURIComponent(symbol)}`,
    `quote:${symbol.toLowerCase()}`,
    60
  );
}

export async function getCompanyProfile(symbol: string) {
  return fetchFinnhub<{ country: string; currency: string; exchange: string; ipo: string; marketCapitalization: number; name: string; phone: string; shareOutstanding: number; ticker: string; weburl: string; logo: string; finnhubIndustry: string }>(
    `/stock/profile2?symbol=${encodeURIComponent(symbol)}`,
    `profile:${symbol.toLowerCase()}`,
    3600
  );
}

function generateMockCandles(symbol: string) {
  const days = 60;
  const t: number[] = [];
  const c: number[] = [];
  const basePrices: Record<string, number> = {
    AAPL: 189.52, TSLA: 242.18, MSFT: 378.91, AMZN: 178.35,
    NVDA: 875.28, META: 505.68, GOOGL: 173.95, NFLX: 628.44,
  };
  const base = basePrices[symbol.toUpperCase()] || 150 + Math.random() * 200;
  let current = base;
  const now = Math.floor(Date.now() / 1000);

  for (let i = days; i >= 0; i--) {
    t.push(now - i * 86400);
    current = current * (1 + (Math.random() - 0.48) * 0.025);
    c.push(Number(current.toFixed(2)));
  }

  return {
    s: 'ok',
    t,
    c,
    h: c.map(p => Number((p * 1.015).toFixed(2))),
    l: c.map(p => Number((p * 0.985).toFixed(2))),
    o: c.map(p => Number((p * 0.995).toFixed(2))),
    v: Array(days + 1).fill(1000000),
  };
}

export async function getCandles(symbol: string) {
  try {
    const to = Math.floor(Date.now() / 1000);
    const from = to - 60 * 24 * 60 * 60;
    const data = await fetchFinnhub<{ s: string; t: number[]; c: number[]; h: number[]; l: number[]; o: number[]; v: number[] }>(
      `/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${to}`,
      `candles:${symbol.toLowerCase()}`,
      300
    );
    if (data.s === 'no_data') throw new Error('no_data');
    return data;
  } catch {
    console.log(`[Finnhub] Using mock candles for ${symbol}`);
    return generateMockCandles(symbol);
  }
}