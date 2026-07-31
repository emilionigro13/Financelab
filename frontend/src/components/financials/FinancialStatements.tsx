'use client';

export function FinancialStatements({ symbol }: { symbol: string }) {
  return (
    <div className="rounded-xl border bg-card p-8 text-center space-y-4">
      <h3 className="text-lg font-semibold">Financial Statements</h3>
      <p className="text-sm text-muted-foreground">
        Detailed Income Statement, Balance Sheet, and Cash Flow data for <strong>{symbol}</strong> coming in a future update.
      </p>
      <p className="text-xs text-muted-foreground">
        This feature requires advanced XBRL data mapping from SEC filings.
      </p>
    </div>
  );
}