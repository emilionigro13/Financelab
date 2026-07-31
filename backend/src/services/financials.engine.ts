import { getFinancialStatements } from './finnhub.service.js';

const INCOME_KEYS: Record<string, string[]> = {
  revenue: [
    'us-gaap_RevenueFromContractWithCustomerExcludingAssessedTax',
    'us-gaap_Revenues',
    'us-gaap_SalesRevenueNet',
    'us-gaap_TotalRevenues',
  ],
  cogs: [
    'us-gaap_CostOfGoodsAndServicesSold',
    'us-gaap_CostOfRevenue',
    'us-gaap_CostOfGoodsSold',
  ],
  grossProfit: ['us-gaap_GrossProfit'],
  operatingExpenses: [
    'us-gaap_OperatingExpenses',
    'us-gaap_SellingGeneralAndAdministrativeExpense',
    'us-gaap_ResearchAndDevelopmentExpense',
  ],
  operatingIncome: ['us-gaap_OperatingIncomeLoss', 'us-gaap_OperatingIncome'],
  netIncome: ['us-gaap_NetIncomeLoss', 'us-gaap_NetIncome'],
};

const BALANCE_KEYS: Record<string, string[]> = {
  cash: [
    'us-gaap_CashAndCashEquivalentsAtCarryingValue',
    'us-gaap_CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents',
    'us-gaap_CashAndCashEquivalents',
  ],
  totalAssets: ['us-gaap_Assets', 'us-gaap_TotalAssets'],
  totalLiabilities: ['us-gaap_Liabilities', 'us-gaap_TotalLiabilities'],
  totalEquity: [
    'us-gaap_StockholdersEquity',
    'us-gaap_StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest',
    'us-gaap_TotalEquity',
  ],
  longTermDebt: ['us-gaap_LongTermDebtNoncurrent', 'us-gaap_LongTermDebt'],
};

interface FinnhubReportItem {
  concept: string;
  unit: string;
  label: string;
  value: number;
}

function buildLookup(section: FinnhubReportItem[]): Record<string, FinnhubReportItem> {
  const lookup: Record<string, FinnhubReportItem> = {};
  for (const item of section) {
    lookup[item.concept] = item;
  }
  return lookup;
}

function findValue(
  section: FinnhubReportItem[],
  possibleKeys: string[]
): { value: number; label: string; unit: string } | null {
  if (!section || section.length === 0) return null;
  const lookup = buildLookup(section);
  for (const key of possibleKeys) {
    if (lookup[key]) {
      return {
        value: lookup[key].value,
        label: lookup[key].label,
        unit: lookup[key].unit,
      };
    }
  }
  return null;
}

export interface NormalizedStatement {
  period: string;
  form: string;
  endDate: string;
  incomeStatement: Record<string, { value: number; label: string; unit: string } | null>;
  balanceSheet: Record<string, { value: number; label: string; unit: string } | null>;
}

export async function getNormalizedFinancials(symbol: string): Promise<NormalizedStatement[]> {
  const raw = await getFinancialStatements(symbol);

  if (!raw.data || raw.data.length === 0) {
    return [];
  }

  const annuals = raw.data
    .filter((d: any) => d.quarter === 0 || d.quarter === '0')
    .sort((a: any, b: any) => (b.year || 0) - (a.year || 0))
    .slice(0, 4);

  return annuals.map((item: any) => {
    const report = item.report || {};
    const incomeSection: FinnhubReportItem[] = report.ic || [];
    const balanceSection: FinnhubReportItem[] = report.bs || [];

    return {
      period: `${item.year}`,
      form: item.form || 'N/A',
      endDate: item.endDate || 'N/A',
      incomeStatement: {
        revenue: findValue(incomeSection, INCOME_KEYS.revenue),
        cogs: findValue(incomeSection, INCOME_KEYS.cogs),
        grossProfit: findValue(incomeSection, INCOME_KEYS.grossProfit),
        operatingExpenses: findValue(incomeSection, INCOME_KEYS.operatingExpenses),
        operatingIncome: findValue(incomeSection, INCOME_KEYS.operatingIncome),
        netIncome: findValue(incomeSection, INCOME_KEYS.netIncome),
      },
      balanceSheet: {
        cash: findValue(balanceSection, BALANCE_KEYS.cash),
        totalAssets: findValue(balanceSection, BALANCE_KEYS.totalAssets),
        totalLiabilities: findValue(balanceSection, BALANCE_KEYS.totalLiabilities),
        totalEquity: findValue(balanceSection, BALANCE_KEYS.totalEquity),
        longTermDebt: findValue(balanceSection, BALANCE_KEYS.longTermDebt),
      },
    };
  });
}