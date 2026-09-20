import { Router, Request, Response } from 'express';
import { searchSymbols, getQuote, getCompanyProfile, getCandles, getCompanyNews } from '../services/finnhub.service.js';
import { analyzeStock } from '../services/analysis.engine.js';
import { getNormalizedFinancials } from '../services/financials.engine.js';
import { analyzeSentiment, aggregateSentiment, analyzeSentimentTrend } from '../services/sentiment.engine.js';
import { Cache } from '../utils/cache.js';

const router = Router();
const directLookupCache = new Cache();

type SearchResultItem = { description: string; displaySymbol: string; symbol: string; type: string };

const isShareClass = (symbol: string): boolean => /\.[AB]$/.test(symbol);

const isUsListing = (item: SearchResultItem): boolean =>
  !item.symbol.includes('.') || isShareClass(item.symbol);

async function directSymbolLookup(query: string): Promise<SearchResultItem[]> {
  const cacheKey = `direct:${query.toLowerCase()}`;
  const cached = directLookupCache.get<SearchResultItem[]>(cacheKey);
  if (cached) return cached;

  const results: SearchResultItem[] = [];

  for (const suffix of ['', '.A', '.B']) {
    const symbol = `${query.toUpperCase()}${suffix}`;
    try {
      const quote = await getQuote(symbol);
      if (quote.c <= 0) continue;

      let description = symbol;
      try {
        const profile = await getCompanyProfile(symbol);
        if (profile.name) description = profile.name;
      } catch { }

      results.push({ description, displaySymbol: symbol, symbol, type: 'Common Stock' });
    } catch { }
  }

  directLookupCache.set(cacheKey, results, 300);
  return results;
}

async function getCompanyData(symbol: string) {
  const [quote, profile, analysis] = await Promise.all([
    getQuote(symbol),
    getCompanyProfile(symbol),
    analyzeStock(symbol),
  ]);
  return { symbol, quote, profile, analysis };
}

router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 1) {
      res.status(400).json({ success: false, error: 'Query parameter required' });
      return;
    }
    const data = await searchSymbols(q);
    let result = data.result.filter(isUsListing);

    if (result.length === 0) {
      result = await directSymbolLookup(q);
    }

    res.json({ success: true, data: { count: result.length, result } });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Search failed' });
  }
});

router.get('/quote/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol as string;
    const data = await getQuote(symbol);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Quote failed' });
  }
});

router.get('/company/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol as string;
    const data = await getCompanyProfile(symbol);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Company failed' });
  }
});

router.get('/candles/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol as string;
    const data = await getCandles(symbol);
    if (data.s === 'no_data') {
      res.status(404).json({ success: false, error: 'No data available' });
      return;
    }
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Candles failed' });
  }
});

router.get('/analysis/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol as string;
    const data = await analyzeStock(symbol);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Analysis failed' });
  }
});

router.get('/compare/:symbolA/:symbolB', async (req: Request, res: Response) => {
  try {
    const symbolA = (req.params.symbolA as string).toUpperCase();
    const symbolB = (req.params.symbolB as string).toUpperCase();

    const [a, b] = await Promise.all([
      getCompanyData(symbolA),
      getCompanyData(symbolB),
    ]);

    res.json({ success: true, data: { a, b } });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Comparison failed' });
  }
});

router.get('/financials/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol as string;
    const period = req.query.period as string;

    if (period && period !== 'annual' && period !== 'quarterly') {
      res.status(400).json({ success: false, error: 'period must be "annual" or "quarterly"' });
      return;
    }

    const data = await getNormalizedFinancials(symbol, period as 'annual' | 'quarterly');
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Financials failed' });
  }
});

router.get('/news/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol as string;
    const rawNews = await getCompanyNews(symbol);
    const enriched = rawNews.map(item => ({
      ...item,
      sentiment: analyzeSentiment(`${item.headline} ${item.summary}`),
    }));
    const summary = aggregateSentiment(enriched);
    res.json({ success: true, data: { news: enriched, summary } });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'News failed' });
  }
});

router.get('/sentiment-trend/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol as string;
    const rawNews = await getCompanyNews(symbol);
    const trend = analyzeSentimentTrend(rawNews);
    res.json({ success: true, data: trend });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Sentiment trend failed' });
  }
});

export default router;