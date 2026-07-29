import { getBasicFinancials } from './finnhub.service.js';

interface RawMetrics {
  [key: string]: number | undefined;
}

export interface FinancialRatio {
  name: string;
  value: number | null;
  formattedValue: string;
  formula: string;
  description: string;
  category: 'valuation' | 'profitability' | 'leverage' | 'liquidity' | 'dividends';
  signal: 'positive' | 'neutral' | 'negative' | 'unknown';
}

export interface AnalysisResult {
  symbol: string;
  updatedAt: string;
  ratios: FinancialRatio[];
}

function formatPercent(num: number | null | undefined, decimals = 1): string {
  if (num === null || num === undefined || Number.isNaN(num)) return 'N/A';
  return (num * 100).toFixed(decimals) + '%';
}

function getSignal(
  value: number | null | undefined,
  thresholds: { positive: number; neutral: number }
): FinancialRatio['signal'] {
  if (value === null || value === undefined || Number.isNaN(value)) return 'unknown';
  if (value >= thresholds.positive) return 'positive';
  if (value >= thresholds.neutral) return 'neutral';
  return 'negative';
}

function getInverseSignal(
  value: number | null | undefined,
  thresholds: { positive: number; neutral: number }
): FinancialRatio['signal'] {
  if (value === null || value === undefined || Number.isNaN(value)) return 'unknown';
  if (value <= thresholds.positive) return 'positive';
  if (value <= thresholds.neutral) return 'neutral';
  return 'negative';
}

export async function analyzeStock(symbol: string): Promise<AnalysisResult> {
  const raw = await getBasicFinancials(symbol);
  const m: RawMetrics = raw.metric || {};

  const ratios: FinancialRatio[] = [
    {
      name: 'P/E Ratio',
      value: m.peBasicExclExtraTTM ?? null,
      formattedValue: m.peBasicExclExtraTTM ? m.peBasicExclExtraTTM.toFixed(2) : 'N/A',
      formula: 'Price / Earnings Per Share (TTM)',
      description: 'How much investors are willing to pay for $1 of earnings. Lower often means undervalued, but tech/growth companies typically trade at higher P/E than banks or utilities.',
      category: 'valuation',
      signal: getInverseSignal(m.peBasicExclExtraTTM, { positive: 15, neutral: 25 }),
    },
    {
      name: 'PEG Ratio',
      value: m.pegRatio ?? null,
      formattedValue: m.pegRatio ? m.pegRatio.toFixed(2) : 'N/A',
      formula: 'P/E Ratio / Annual EPS Growth Rate',
      description: 'Adjusts P/E for expected growth. A PEG < 1 suggests the stock may be undervalued relative to its growth trajectory. Popularized by Peter Lynch.',
      category: 'valuation',
      signal: getInverseSignal(m.pegRatio, { positive: 1, neutral: 2 }),
    },
    {
      name: 'EV/EBITDA',
      value: m.evEbitdaTTM ?? null,
      formattedValue: m.evEbitdaTTM ? m.evEbitdaTTM.toFixed(2) : 'N/A',
      formula: 'Enterprise Value / EBITDA (TTM)',
      description: 'A capital-structure-neutral valuation metric. Useful for comparing companies with different debt levels. < 10 is often considered attractive by value investors.',
      category: 'valuation',
      signal: getInverseSignal(m.evEbitdaTTM, { positive: 10, neutral: 20 }),
    },
    {
      name: 'ROE',
      value: m.roeRfy ?? null,
      formattedValue: formatPercent(m.roeRfy),
      formula: 'Net Income / Shareholders\' Equity',
      description: 'Return on Equity: measures how efficiently the company generates profit from the capital invested by shareholders. Warren Buffett famously seeks consistent ROE > 15%.',
      category: 'profitability',
      signal: getSignal(m.roeRfy, { positive: 0.15, neutral: 0.10 }),
    },
    {
      name: 'ROA',
      value: m.roaRfy ?? null,
      formattedValue: formatPercent(m.roaRfy),
      formula: 'Net Income / Total Assets',
      description: 'Return on Assets: shows how well the company uses its assets to generate profit, regardless of how those assets are financed (debt vs equity).',
      category: 'profitability',
      signal: getSignal(m.roaRfy, { positive: 0.10, neutral: 0.05 }),
    },
    {
      name: 'Gross Margin',
      value: m.grossMarginTTM ?? null,
      formattedValue: formatPercent(m.grossMarginTTM),
      formula: 'Gross Profit / Revenue',
      description: 'Production efficiency before operating expenses. Software and pharmaceutical companies often exceed 70%; retailers may operate below 30%.',
      category: 'profitability',
      signal: getSignal(m.grossMarginTTM, { positive: 0.40, neutral: 0.20 }),
    },
    {
      name: 'Operating Margin',
      value: m.operatingMarginTTM ?? null,
      formattedValue: formatPercent(m.operatingMarginTTM),
      formula: 'Operating Income / Revenue',
      description: 'Core business profitability after COGS and operating expenses, but before interest and taxes. Higher = stronger pricing power and cost control.',
      category: 'profitability',
      signal: getSignal(m.operatingMarginTTM, { positive: 0.20, neutral: 0.10 }),
    },
    {
      name: 'Profit Margin',
      value: m.netProfitMarginTTM ?? null,
      formattedValue: formatPercent(m.netProfitMarginTTM),
      formula: 'Net Income / Revenue',
      description: 'The bottom line: how much of each revenue dollar becomes net profit after all expenses, including taxes and interest, are paid.',
      category: 'profitability',
      signal: getSignal(m.netProfitMarginTTM, { positive: 0.15, neutral: 0.05 }),
    },
    {
      name: 'Debt-to-Equity',
      value: m.totalDebtToEquityQuarterly ?? null,
      formattedValue: m.totalDebtToEquityQuarterly ? m.totalDebtToEquityQuarterly.toFixed(2) : 'N/A',
      formula: 'Total Debt / Total Equity',
      description: 'Measures financial leverage. A ratio > 1.0 means the company is financed more by debt than equity, increasing risk in rising-rate environments.',
      category: 'leverage',
      signal: getInverseSignal(m.totalDebtToEquityQuarterly, { positive: 0.5, neutral: 1.0 }),
    },
    {
      name: 'Current Ratio',
      value: m.currentRatioQuarterly ?? null,
      formattedValue: m.currentRatioQuarterly ? m.currentRatioQuarterly.toFixed(2) : 'N/A',
      formula: 'Current Assets / Current Liabilities',
      description: 'Short-term liquidity buffer. > 1.5 indicates the company can comfortably cover near-term obligations. < 1.0 may signal cash flow stress.',
      category: 'liquidity',
      signal: getSignal(m.currentRatioQuarterly, { positive: 1.5, neutral: 1.0 }),
    },
    {
      name: 'Quick Ratio',
      value: m.quickRatioQuarterly ?? null,
      formattedValue: m.quickRatioQuarterly ? m.quickRatioQuarterly.toFixed(2) : 'N/A',
      formula: '(Current Assets - Inventory) / Current Liabilities',
      description: 'A stricter liquidity test that excludes inventory (which may not sell quickly). > 1.0 is considered healthy for most industries.',
      category: 'liquidity',
      signal: getSignal(m.quickRatioQuarterly, { positive: 1.0, neutral: 0.5 }),
    },
    {
      name: 'Dividend Yield',
      value: m.dividendYieldIndicatedAnnual ?? null,
      formattedValue: formatPercent(m.dividendYieldIndicatedAnnual),
      formula: 'Annual Dividend Per Share / Share Price',
      description: 'Cash income return from dividends. Income investors seek higher yields, but an unusually high yield (> 8-10%) can signal distress or an unsustainable payout.',
      category: 'dividends',
      signal: getSignal(m.dividendYieldIndicatedAnnual, { positive: 0.03, neutral: 0.01 }),
    },
  ];

  return {
    symbol: symbol.toUpperCase(),
    updatedAt: new Date().toISOString(),
    ratios,
  };
}