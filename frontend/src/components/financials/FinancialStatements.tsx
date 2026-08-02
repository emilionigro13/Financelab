'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import { StatementTable } from './StatementTable';

type Period = 'annual' | 'quarterly';
type StatementType = 'income' | 'balance' | 'cashflow';

interface StatementItem {
  value: number;
  label: string;
  unit: string;
}

interface StatementData {
  period: string;
  form: string;
  endDate: string;
  incomeStatement: Record<string, StatementItem | null>;
  balanceSheet: Record<string, StatementItem | null>;
  cashFlow: Record<string, StatementItem | null>;
}

const INCOME_ROWS = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'cogs', label: 'Cost of Goods Sold' },
  { key: 'grossProfit', label: 'Gross Profit' },
  { key: 'operatingExpenses', label: 'Operating Expenses' },
  { key: 'operatingIncome', label: 'Operating Income' },
  { key: 'netIncome', label: 'Net Income' },
];

const BALANCE_ROWS = [
  { key: 'cash', label: 'Cash & Equivalents' },
  { key: 'totalAssets', label: 'Total Assets' },
  { key: 'totalLiabilities', label: 'Total Liabilities' },
  { key: 'totalEquity', label: 'Total Equity' },
  { key: 'longTermDebt', label: 'Long Term Debt' },
];

const CASHFLOW_ROWS = [
  { key: 'operatingCashFlow', label: 'Operating Cash Flow' },
  { key: 'investingCashFlow', label: 'Investing Cash Flow' },
  { key: 'financingCashFlow', label: 'Financing Cash Flow' },
  { key: 'capitalExpenditures', label: 'Capital Expenditures' },
  { key: 'freeCashFlow', label: 'Free Cash Flow' },
];

export function FinancialStatements({ symbol }: { symbol: string }) {
  const [period, setPeriod] = useState<Period>('annual');
  const [statementType, setStatementType] = useState<StatementType>('income');
  const [data, setData] = useState<StatementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    apiGet<{ success: boolean; data: StatementData[] }>(
      `/market/financials/${encodeURIComponent(symbol)}?period=${period}`
    )
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load financials');
        setLoading(false);
      });
  }, [symbol, period]);

  const periods = data.map((d) => d.period);

  const getRows = () => {
    switch (statementType) {
      case 'income':
        return INCOME_ROWS;
      case 'balance':
        return BALANCE_ROWS;
      case 'cashflow':
        return CASHFLOW_ROWS;
    }
  };

  const getData = () => {
    switch (statementType) {
      case 'income':
        return data.map((d) => d.incomeStatement);
      case 'balance':
        return data.map((d) => d.balanceSheet);
      case 'cashflow':
        return data.map((d) => d.cashFlow);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-2">
          {(['income', 'balance', 'cashflow'] as StatementType[]).map((type) => (
            <button
              key={type}
              onClick={() => setStatementType(type)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                statementType === type
                  ? 'bg-emerald-600 text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {type === 'income' && 'Income Statement'}
              {type === 'balance' && 'Balance Sheet'}
              {type === 'cashflow' && 'Cash Flow'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('annual')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              period === 'annual'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Annual
          </button>
          <button
            onClick={() => setPeriod('quarterly')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              period === 'quarterly'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Quarterly
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="text-muted-foreground">No financial data available for this symbol.</p>
          <p className="text-xs text-muted-foreground mt-2">
            Try a US-listed ticker (e.g., AAPL, MSFT, TSLA).
          </p>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <StatementTable periods={periods} rows={getRows()} data={getData()} />
      )}
    </div>
  );
}