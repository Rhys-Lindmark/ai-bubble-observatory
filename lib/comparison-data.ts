export type Observation = { x: number; value: number; date: string };
export type Series = {
  id: string;
  name: string;
  color: string;
  points: Observation[];
  sparse?: boolean;
  dash?: boolean;
};
export const monthNumber = (date: string) =>
  Number(date.slice(0, 4)) * 12 + Number(date.slice(5, 7)) - 1;
export const elapsedYears = (date: string, start: string) =>
  (monthNumber(date) - monthNumber(start)) / 12;
export function rebase(points: Observation[]): Observation[] {
  const first = points.find((p) => Number.isFinite(p.value) && p.value > 0);
  return first
    ? points.map((p) => ({ ...p, value: (100 * p.value) / first.value }))
    : [];
}
export function laterRevenue(
  rows: { date: string; revenue: number; fiscalYear?: number }[],
  start: string,
  lagMonths: number,
  divisor: number,
): Observation[] {
  return rows.flatMap((r) => {
    // Annual 52/53-week fiscal years can end in different calendar months.
    // Match annual periods by fiscal year; never pair an annual row with TTM.
    const earlier = r.fiscalYear !== undefined && lagMonths > 0
      ? rows.find(p => p.fiscalYear === r.fiscalYear! - lagMonths / 12)
      : rows.find(p => monthNumber(p.date) === monthNumber(r.date) - lagMonths);
    if (!earlier) return [];
    const x = elapsedYears(earlier.date, start);
    return x < 0 ? [] : [{date:r.date, x, value:r.revenue/divisor}];
  });
}
// A nonpositive cash denominator is a funding deficit, not a negative risk ratio.
export function cashFundingPercent(capex: number, ocf: number): number | null {
  return Number.isFinite(capex) && Number.isFinite(ocf) && ocf > 0
    ? (100 * capex) / ocf
    : null;
}

// Only completed observed months belong in the price comparison. Forecast-only
// rows and invalid prices must never extend the historical line into the future.
export function marketPriceWindow(points: {date: string; offset: number; price: number | null}[]): Observation[] {
  const observed = points.filter(p => p.offset <= 0 && p.price != null && Number.isFinite(p.price) && p.price > 0)
    .sort((a,b) => a.date.localeCompare(b.date)).slice(-25);
  if (observed.length < 2) return [];
  return rebase(observed.map(p => ({date: p.date, x: elapsedYears(p.date, observed[0].date), value: p.price!})));
}
