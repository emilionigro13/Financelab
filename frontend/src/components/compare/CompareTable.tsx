'use client';

import { Fragment } from 'react';

interface FinancialRatio {
  name: string;
  value: number | null;
  formattedValue: string;
  formula: string;
  description: string;
  category: 'valuation' | 'profitability' | 'leverage' | 'liquidity' | 'dividends';
  signal: 'positive' | 'neutral' | 'negative' | 'unknown';
}

interface CompanyData {
  symbol: string;
  quote: { c: number; dp: number };
  profile: { name: string; marketCapitalization: number; currency: string; finnhubIndustry: string };
  analysis: { ratios: FinancialRatio[] };
}

interface CompareTableProps {
  a: CompanyData;
  b: CompanyData;
}

// Ratios where a LOWER value is better (mirrors getInverseSignal from the analysis engine)
const LOWER_IS_BETTER = new Set(['P/E Ratio', 'PEG Ratio', 'EV/EBITDA', 'Debt-to-Equity']);

const CATEGORY_LABELS: Record<FinancialRatio['category'], string> = {
  valuation: 'Valuation',
  profitability: 'Profitability',
  leverage: 'Leverage',
  liquidity: 'Liquidity',
  dividends: 'Dividends',
};

function signalClasses(signal: string): string {
  if (signal === 'positive') return 'text-emerald-600';
  if (signal === 'negative') return 'text-red-600';
  return 'text-muted-foreground';
}

// Returns 'a' | 'b' | null: which company wins this row (null = tie or not comparable)
function pickWinner(ratioName: string, valueA: number | null, valueB: number | null): 'a' | 'b' | null {
  if (valueA === null || valueB === null) return null;
  if (valueA === valueB) return null;
  const aWins = LOWER_IS_BETTER.has(ratioName) ? valueA < valueB : valueA > valueB;
  return aWins ? 'a' : 'b';
}

export function CompareTable({ a, b }: CompareTableProps) {
  // Align ratios by name so both columns stay in sync even if one company
  // is missing a metric (non-US, recent IPO, insufficient TTM data)
  const namesA = a.analysis.ratios.map((r) => r.name);
  const namesB = b.analysis.ratios.map((r) => r.name);
  const allNames = [...new Set([...namesA, ...namesB])];

  const rows = allNames.map((name) => {
    const ratioA = a.analysis.ratios.find((r) => r.name === name);
    const ratioB = b.analysis.ratios.find((r) => r.name === name);
    return {
      name,
      category: (ratioA ?? ratioB)!.category,
      a: ratioA ?? null,
      b: ratioB ?? null,
      winner: pickWinner(name, ratioA?.value ?? null, ratioB?.value ?? null),
    };
  });

  const categories = [...new Set(rows.map((r) => r.category))];
  const winnerCount = { a: 0, b: 0 };
  rows.forEach((r) => { if (r.winner) winnerCount[r.winner]++; });

  const winnerCell = (winner: 'a' | 'b' | null, side: 'a' | 'b', ratio: FinancialRatio | null) => (
    <td className={`px-4 py-3 font-mono tabular-nums ${winner === side ? 'bg-emerald-500/10 font-semibold ' + signalClasses(ratio?.signal ?? 'unknown') : signalClasses(ratio?.signal ?? 'unknown')}`}>
      {ratio?.formattedValue ?? 'N/A'}
    </td>
  );

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Metric</th>
              <th className="px-4 py-3 font-semibold">{a.profile.name || a.symbol}</th>
              <th className="px-4 py-3 font-semibold">{b.profile.name || b.symbol}</th>
            </tr>
            <tr className="border-b text-left">
              <th className="px-4 py-2 text-xs font-normal text-muted-foreground">Market Cap</th>
              <th className="px-4 py-2 font-mono text-xs font-normal text-muted-foreground">
                ${(a.profile.marketCapitalization).toFixed(1)}M &middot; {a.profile.currency}
              </th>
              <th className="px-4 py-2 font-mono text-xs font-normal text-muted-foreground">
                ${(b.profile.marketCapitalization).toFixed(1)}M &middot; {b.profile.currency}
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <Fragment key={cat}>
                <tr className="border-b bg-muted/30">
                  <td colSpan={3} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {CATEGORY_LABELS[cat]}
                  </td>
                </tr>
                {rows.filter((r) => r.category === cat).map((r) => (
                  <tr key={r.name} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">{r.name}</td>
                    {winnerCell(r.winner, 'a', r.a)}
                    {winnerCell(r.winner, 'b', r.b)}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t px-4 py-3 text-sm text-muted-foreground">
        Ratio wins: <span className="font-semibold text-foreground">{a.symbol} {winnerCount.a}</span> — <span className="font-semibold text-foreground">{winnerCount.b} {b.symbol}</span>
        <span className="ml-2 text-xs">(N/A rows are excluded; context matters more than raw counts)</span>
      </div>
    </div>
  );
}