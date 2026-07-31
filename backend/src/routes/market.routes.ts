import { Router, Request, Response } from 'express';
import { searchSymbols, getQuote, getCompanyProfile, getCandles } from '../services/finnhub.service.js';
import { analyzeStock } from '../services/analysis.engine.js';
import { getNormalizedFinancials } from '../services/financials.engine.js';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 1) {
      res.status(400).json({ success: false, error: 'Query parameter required' });
      return;
    }
    const data = await searchSymbols(q);
    res.json({ success: true, data });
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

router.get('/financials/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol as string;
    const data = await getNormalizedFinancials(symbol);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Financials failed' });
  }
});

export default router;