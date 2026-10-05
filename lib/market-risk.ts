/** Frozen experimental Nasdaq transfer inference. No network, fitting or dependencies.
 * Daily FRED values are closes. The probability is NOT a calibrated AI crash chance.
 * parseNasdaq uses UTC calendar dates and fails closed on stale/incomplete input.
 */
export interface MonthlyClose {
  month: string;
  date: string;
  price: number;
}
export type RiskErrorCode =
  | 'INVALID_NOW'
  | 'NO_OBSERVATIONS'
  | 'INVALID_OBSERVATION'
  | 'CONFLICTING_OBSERVATIONS'
  | 'STALE_DATA'
  | 'INCOMPLETE_MONTH'
  | 'MISSING_MONTH'
  | 'INSUFFICIENT_HISTORY';
export class RiskDataError extends Error {
  readonly code: RiskErrorCode;
  constructor(code: RiskErrorCode, message: string) {
    super(message);
    this.name = 'RiskDataError';
    this.code = code;
  }
}
const MEAN = [
  0.017427557390857648, 0.1727239177027021, 0.05855608364319217,
  -0.04876066325286892,
];
const STD = [
  0.06276671808731293, 0.2175693985392575, 0.03406054442550381,
  0.05640931487164076,
];
const BETA = [
  -4.160481550643856, -0.09500144731123282, -0.20561626795193566,
  0.3875156118211057, -1.0954284707249546,
];
export const MODEL_VERSION = 'monthly-crossing-2026-09-06-lambda-0.01';
export const MODEL_PROTOCOL_SHA256 =
  'a509ea4904778de845546bdbab1aa73e7bd346980dbd186c73f71e26667945f9';
export const MODEL_SPECIFICATION = {
  mean: MEAN,
  standardDeviation: STD,
  coefficients: BETA,
  featureOrder: ['ret1', 'ret12', 'vol12', 'drawdown'],
  featureDefinition:
    'log returns; 12-return sample volatility (ddof=1); current/maximum(t-11..t)-1',
  outcome:
    'Next monthly close <= 0.8 * maximum(t-11..t), conditional on current close above threshold',
  inference:
    'logistic(intercept + sum(coefficient * (feature - mean) / standardDeviation))',
} as const;
function monthNumber(month: string): number {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
    throw new RiskDataError('INVALID_OBSERVATION', `Invalid month: ${month}`);
  return Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1;
}
function monthString(n: number): string {
  return `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, '0')}`;
}
function validDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(`${date}T00:00:00.000Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === date;
}
function lastWeekday(month: string): string {
  const n = monthNumber(month);
  const d = new Date(Date.UTC(Math.floor((n + 1) / 12), (n + 1) % 12, 0));
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6)
    d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Accept FRED's plain date/value text, CSV, or current HTML table + #extra-rows.
 * Return exactly 13 consecutive completed months; partial/future observations never
 * enter inference. Missing values are omitted, never filled. Source freshness is
 * checked against now, so an old snapshot cannot masquerade as the current forecast.
 */
export function parseNasdaq(
  text: string,
  now: Date = new Date(),
  historyMonths = 13,
): MonthlyClose[] {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime()))
    throw new RiskDataError('INVALID_NOW', 'A valid current date is required');
  const today = now.toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);
  const expectedMonth = monthString(monthNumber(currentMonth) - 1);
  const daily = new Map<string, number>();
  const add = (date: string, value: string): void => {
    if (!validDate(date))
      throw new RiskDataError(
        'INVALID_OBSERVATION',
        `Invalid source date: ${date}`,
      );
    if (date > today || value.trim() === '.' || value.trim() === '') return;
    const price = Number(value.trim().replace(/,/g, ''));
    if (!Number.isFinite(price) || price <= 0)
      throw new RiskDataError(
        'INVALID_OBSERVATION',
        `Invalid close for ${date}`,
      );
    if (daily.has(date) && daily.get(date) !== price)
      throw new RiskDataError(
        'CONFLICTING_OBSERVATIONS',
        `Conflicting closes for ${date}`,
      );
    daily.set(date, price);
  };
  // Anchored plain text/CSV and FRED's #YYYY-MM-DD| value overflow rows.
  const row =
    /^[ \t]*#?(\d{4}-\d{2}-\d{2})(?:[ \t]*[|,][ \t]*|[ \t]+)([\d.,+\-eE]*)[ \t]*\r?$/gm;
  let m: RegExpExecArray | null;
  while ((m = row.exec(text)) !== null) add(m[1], m[2]);
  // Restrict to an adjacent date cell and value cell; ignore metadata/script dates.
  const html =
    /<(?:th|td)\b[^>]*>\s*(\d{4}-\d{2}-\d{2})\s*<\/(?:th|td)>\s*<td\b[^>]*>\s*([\d.,+\-eE]+)\s*<\/td>/gi;
  while ((m = html.exec(text)) !== null) add(m[1], m[2]);
  if (!daily.size)
    throw new RiskDataError(
      'NO_OBSERVATIONS',
      'No Nasdaq daily close observations parsed',
    );
  const monthly = new Map<string, MonthlyClose>();
  let latestSourceDate = '';
  for (const [date, price] of daily) {
    if (date > latestSourceDate) latestSourceDate = date;
    const month = date.slice(0, 7);
    if (month >= currentMonth) continue;
    if (!monthly.has(month) || date > monthly.get(month)!.date)
      monthly.set(month, { month, date, price });
  }
  const months = [...monthly.values()].sort((a, b) =>
    a.month.localeCompare(b.month),
  );
  const latest = months[months.length - 1];
  if (!latest || latest.month !== expectedMonth)
    throw new RiskDataError(
      'STALE_DATA',
      `Expected completed month ${expectedMonth}; latest is ${latest?.month ?? 'none'}`,
    );
  // A later observed close proves the feed has advanced beyond the last completed
  // month. Otherwise require its final weekday. Month-end exchange holidays may
  // temporarily fail closed until a later observation corroborates completion.
  if (
    latestSourceDate.slice(0, 7) <= expectedMonth &&
    latest.date !== lastWeekday(expectedMonth)
  ) {
    throw new RiskDataError(
      'INCOMPLETE_MONTH',
      `Cannot confirm final close of ${expectedMonth}: latest observation ${latest.date}`,
    );
  }
  // Also reject a severely truncated month's tail even if later rows exist.
  const monthEnd = new Date(
    `${lastWeekday(expectedMonth)}T00:00:00Z`,
  ).getTime();
  if (monthEnd - new Date(`${latest.date}T00:00:00Z`).getTime() > 7 * 86400000)
    throw new RiskDataError(
      'INCOMPLETE_MONTH',
      `Latest month ends too early at ${latest.date}`,
    );
  if (!Number.isInteger(historyMonths) || historyMonths < 13)
    throw new RiskDataError(
      'INSUFFICIENT_HISTORY',
      'History must include at least 13 months',
    );
  if (months.length < historyMonths)
    throw new RiskDataError(
      'INSUFFICIENT_HISTORY',
      'At least 13 completed monthly closes are required',
    );
  const closes = months.slice(-historyMonths);
  for (let i = 1; i < closes.length; i++) {
    if (monthNumber(closes[i].month) !== monthNumber(closes[i - 1].month) + 1)
      throw new RiskDataError(
        'MISSING_MONTH',
        `Gap between ${closes[i - 1].month} and ${closes[i].month}`,
      );
  }
  return closes;
}

export interface RiskEstimate {
  modelVersion: string;
  status: 'experimental_estimate' | 'already_below_threshold';
  probability: number | null;
  eligible: boolean;
  asOf: string;
  lastObservationDate: string;
  targetMonth: string;
  currentClose: number;
  trailingPeak: number;
  crossingThreshold: number;
  requiredDecline: number;
  features: { ret1: number; ret12: number; vol12: number; drawdown: number };
}
/** Consume 13+ sorted consecutive month-end closes. Freshness and completed-month
 * certification belong to parseNasdaq(text, now); this deterministic function has
 * no wall-clock dependency. Its 12-return volatility is SAMPLE std (ddof=1).
 * The fixed training feature scaling above used POPULATION std (ddof=0).
 */
export function computeRisk(closes: readonly MonthlyClose[]): RiskEstimate {
  if (closes.length < 13)
    throw new RiskDataError(
      'INSUFFICIENT_HISTORY',
      'At least 13 consecutive monthly closes are required',
    );
  for (let i = 0; i < closes.length; i++) {
    const c = closes[i];
    if (
      !validDate(c.date) ||
      c.date.slice(0, 7) !== c.month ||
      !Number.isFinite(c.price) ||
      c.price <= 0
    )
      throw new RiskDataError('INVALID_OBSERVATION', 'Invalid monthly close');
    if (i && monthNumber(c.month) !== monthNumber(closes[i - 1].month) + 1)
      throw new RiskDataError(
        'MISSING_MONTH',
        'Monthly closes must be sorted, unique, and consecutive',
      );
  }
  const window = closes.slice(-13);
  const prices = window.map((c) => c.price);
  const returns = prices
    .slice(1)
    .map((price, i) => Math.log(price / prices[i]));
  const ret1 = returns[11];
  const ret12 = Math.log(prices[12] / prices[0]);
  const mean = returns.reduce((a, b) => a + b, 0) / 12;
  const vol12 = Math.sqrt(
    returns.reduce((a, r) => a + (r - mean) ** 2, 0) / 11,
  );
  const trailingPeak = Math.max(...prices.slice(1)); // t-11 through t, not t-12
  const currentClose = prices[12];
  const crossingThreshold = 0.8 * trailingPeak;
  const drawdown = currentClose / trailingPeak - 1;
  const eligible = currentClose > crossingThreshold;
  const x = [ret1, ret12, vol12, drawdown];
  const z =
    BETA[0] +
    x.reduce((sum, v, i) => sum + (BETA[i + 1] * (v - MEAN[i])) / STD[i], 0);
  const p = z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z));
  const last = window[12];
  return {
    modelVersion: MODEL_VERSION,
    status: eligible ? 'experimental_estimate' : 'already_below_threshold',
    probability: eligible ? p : null,
    eligible,
    asOf: last.month,
    lastObservationDate: last.date,
    targetMonth: monthString(monthNumber(last.month) + 1),
    currentClose,
    trailingPeak,
    crossingThreshold,
    requiredDecline: Math.max(0, 1 - crossingThreshold / currentClose),
    features: { ret1, ret12, vol12, drawdown },
  };
}
