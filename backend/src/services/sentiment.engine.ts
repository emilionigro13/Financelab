const POSITIVE_WORDS = new Set([
  'gain', 'gains', 'rise', 'rises', 'rising', 'up', 'surge', 'surges', 'surged',
  'jump', 'jumps', 'jumped', 'rally', 'rallies', 'soared', 'soar', 'boost', 'boosts',
  'boosted', 'beat', 'beats', 'strong', 'strength', 'profit', 'profits', 'profitable',
  'growth', 'grows', 'growing', 'expanded', 'expands', 'expansion', 'record', 'high',
  'highs', 'outperform', 'outperforms', 'bullish', 'bull', 'recovery', 'recover',
  'recovers', 'rebound', 'rebounds', 'upgrade', 'upgrades', 'upgraded', 'positive',
  'success', 'successful', 'breakthrough', 'approval', 'approved', 'dividend',
  'dividends', 'buyback', 'buybacks', 'merger', 'acquisition', 'deal', 'partnership',
  'launch', 'launched', 'innovation', 'outperforming', 'outperformance'
]);

const NEGATIVE_WORDS = new Set([
  'loss', 'losses', 'lose', 'losing', 'lost', 'fall', 'falls', 'falling', 'down',
  'drop', 'drops', 'dropped', 'decline', 'declines', 'declined', 'plunge', 'plunges',
  'plunged', 'crash', 'crashes', 'crashed', 'slump', 'slumps', 'slumped', 'weak',
  'weakness', 'miss', 'misses', 'missed', 'bearish', 'bear', 'recession', 'crisis',
  'bankrupt', 'bankruptcy', 'default', 'defaults', 'defaulted', 'downgrade',
  'downgrades', 'downgraded', 'negative', 'cut', 'cuts', 'layoff', 'layoffs',
  'firing', 'fired', 'investigation', 'investigated', 'scandal', 'fraud', 'lawsuit',
  'penalty', 'penalties', 'fine', 'fined', 'warning', 'warnings', 'debt', 'debts',
  'deficit', 'contraction', 'shrinking', 'shrink', 'underperform', 'underperforms',
  'sell-off', 'selloff', 'correction', 'volatility', 'volatile', 'risk', 'risky',
  'concern', 'concerns', 'worried', 'worry', 'fears', 'fear', 'threat', 'threats',
  'delay', 'delays', 'delayed', 'cancellation', 'cancelled', 'suspended'
]);

export interface SentimentResult {
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score: number;
}

export function analyzeSentiment(text: string): SentimentResult {
  const clean = text.toLowerCase();
  const words = clean.split(/\W+/).filter(w => w.length > 2);
  let pos = 0;
  let neg = 0;

  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) pos++;
    if (NEGATIVE_WORDS.has(w)) neg++;
  }

  const total = words.length || 1;
  const score = (pos - neg) / total;

  if (score > 0.05) return { sentiment: 'POSITIVE', score };
  if (score < -0.05) return { sentiment: 'NEGATIVE', score };
  return { sentiment: 'NEUTRAL', score };
}

export interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
  sentiment: SentimentResult;
}

export interface SentimentSummary {
  overall: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  averageScore: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  total: number;
}

export function aggregateSentiment(items: NewsItem[]): SentimentSummary {
  const total = items.length;
  if (total === 0) {
    return {
      overall: 'NEUTRAL',
      averageScore: 0,
      positiveCount: 0,
      negativeCount: 0,
      neutralCount: 0,
      total: 0,
    };
  }

  let pos = 0;
  let neg = 0;
  let neu = 0;
  let sum = 0;

  for (const item of items) {
    sum += item.sentiment.score;
    if (item.sentiment.sentiment === 'POSITIVE') pos++;
    else if (item.sentiment.sentiment === 'NEGATIVE') neg++;
    else neu++;
  }

  const avg = sum / total;
  let overall: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';
  if (pos > neg && pos > neu) overall = 'POSITIVE';
  else if (neg > pos && neg > neu) overall = 'NEGATIVE';

  return {
    overall,
    averageScore: avg,
    positiveCount: pos,
    negativeCount: neg,
    neutralCount: neu,
    total,
  };
}