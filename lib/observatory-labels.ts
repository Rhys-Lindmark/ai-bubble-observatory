export type ChartMetric =
  | 'paired'
  | 'risk'
  | 'risk12'
  | 'pe'
  | 'cape'
  | 'capexOCF'
  | 'capexRevenue'
  | 'yield';
type Metadata = {
  id: string;
  valuationLabel: string | null;
  valuationCadence: string | null;
};
export const monthlyCadence = (cadence: string | null | undefined) =>
  typeof cadence === 'string' && cadence.startsWith('monthly');
export function chartLabel(c: Metadata, metric: ChartMetric): string {
  if (metric === 'paired')
    return c.id === 'ai-current'
      ? 'Nasdaq close · latest = 100'
      : 'Monthly price · reference = 100';
  if (metric === 'risk12')
    return `12m ≥20% loss · estimate made each month · ${c.id === 'ai-current' ? 'Nasdaq close' : ['dotcom2000', 'japan1989'].includes(c.id) ? 'month-end close proxy' : c.id.startsWith('bitcoin') ? 'month-end daily reference' : 'published monthly series'}`;
  if (metric === 'risk') return 'Next-month 20% drawdown entry · model %';
  if (metric === 'yield') return 'High-grade railroad bond yield · %';
  if (metric.startsWith('capex'))
    return c.id === 'ai-current'
      ? 'Five firms · trailing-year accounts · %'
      : 'MSFT ● / Intel ○ · actual fiscal year ends · %';
  return `${c.valuationLabel || 'No comparable valuation series'} · ${metric.toUpperCase()} × · ${c.valuationCadence || 'unavailable'}`;
}
