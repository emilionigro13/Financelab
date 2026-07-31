'use client';

function formatFinancialValue(value: number | undefined | null, unit: string = 'USD'): string {
  if (value === null || value === undefined) return 'N/A';
  
  const absVal = Math.abs(value);
  let formatted: string;
  
  if (absVal >= 1e12) {
    formatted = `${(value / 1e12).toFixed(2)}T`;
  } else if (absVal >= 1e9) {
    formatted = `${(value / 1e9).toFixed(2)}B`;
  } else if (absVal >= 1e6) {
    formatted = `${(value / 1e6).toFixed(2)}M`;
  } else if (absVal >= 1e3) {
    formatted = `${(value / 1e3).toFixed(2)}K`;
  } else {
    formatted = value.toLocaleString();
  }
  
  return value < 0 ? `(${formatted})` : formatted;
}

interface StatementTableProps {
  periods: string[];
  rows: { key: string; label: string }[];
  data: Record<string, { value: number; label: string; unit: string } | null>[];
}

export function StatementTable({ periods, rows, data }: StatementTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground w-48 sticky left-0 bg-muted/50 backdrop-blur">
              Metric
            </th>
            {periods.map((p) => (
              <th key={p} className="text-right px-4 py-3 font-medium text-muted-foreground min-w-[120px]">
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.key} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
              <td className="px-4 py-3 font-medium sticky left-0 bg-inherit">{row.label}</td>
              {data.map((periodData, i) => {
                const item = periodData[row.key];
                return (
                  <td key={periods[i]} className="px-4 py-3 text-right font-mono tabular-nums">
                    {item ? (
                      <span className={item.value < 0 ? 'text-red-500' : 'text-emerald-600'}>
                        {formatFinancialValue(item.value, item.unit)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}