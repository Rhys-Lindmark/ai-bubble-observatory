import { ttm, type Fact } from './metrics.ts';

export type Rates = {
  observed: string;
  nominal: number;
  real: number;
  checkedAt: string;
  source: string;
};
export type Nvidia = {
  periodEnd: string;
  filed: string;
  revenue: number;
  grossMargin: number;
  ocf: number;
  checkedAt: string;
  source: string;
};
export type Context = {
  rates: Rates;
  nvidia: Nvidia;
  failures: string[];
  nextCheckAt: string;
};
const clean = (s: string) =>
  s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Read the nominal and real Treasury series independently; use their latest common observation.
export function parseRates(html: string, checkedAt: string): Rates {
  const table = html.match(
    /<table\b[^>]*id=["']h15table["'][^>]*>([\s\S]*?)<\/table>/i,
  )?.[1];
  if (!table) throw new Error('H.15 table unavailable');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const dates = new Map<string, string>();
  for (const m of table.matchAll(
    /<th\b[^>]*id=["'](col\d+)["'][^>]*>([\s\S]*?)<\/th>/gi,
  )) {
    const parts = clean(m[2]).match(/^(\d{4}) ([A-Za-z]{3}) (\d{1,2})$/);
    if (parts && months.includes(parts[2]))
      dates.set(
        m[1],
        `${parts[1]}-${String(months.indexOf(parts[2]) + 1).padStart(2, '0')}-${parts[3].padStart(2, '0')}`,
      );
  }
  const values: Record<string, Map<string, number>> = {
    nominal: new Map(),
    real: new Map(),
  };
  let group = '';
  for (const row of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const label = clean(
      row[1].match(/<th\b[^>]*>([\s\S]*?)<\/th>/i)?.[1] ?? '',
    );
    if (/^Nominal\b/.test(label)) group = 'nominal';
    if (/^Inflation indexed\b/.test(label)) group = 'real';
    if (label !== '10-year' || !group) continue;
    for (const cell of row[1].matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi)) {
      const column = cell[1].match(/\bcol\d+\b/)?.[0];
      const date = column && dates.get(column),
        raw = clean(cell[2]);
      if (date && /^-?\d+(\.\d+)?$/.test(raw) && date <= checkedAt.slice(0, 10))
        values[group].set(date, Number(raw));
    }
  }
  const observed = [...values.nominal.keys()]
    .filter((d) => values.real.has(d))
    .sort()
    .at(-1);
  if (!observed)
    throw new Error('No matching nominal and real Treasury observations');
  return {
    observed,
    nominal: values.nominal.get(observed)!,
    real: values.real.get(observed)!,
    checkedAt,
    source: 'https://www.federalreserve.gov/releases/h15/',
  };
}

type RawFact = {
  start?: string;
  end: string;
  val: number;
  filed: string;
  accn: string;
  form?: string;
};
type CompanyFacts = {
  facts: { 'us-gaap': Record<string, { units?: { USD?: RawFact[] } }> };
};
export function parseNvidia(raw: CompanyFacts, checkedAt: string): Nvidia {
  const gaap = raw.facts?.['us-gaap'];
  if (!gaap) throw new Error('Nvidia US GAAP facts unavailable');
  const tags = [
    'Revenues',
    'GrossProfit',
    'NetCashProvidedByUsedInOperatingActivities',
  ];
  const series = tags.map((tag) => {
    const unique = new Map<string, Fact>();
    for (const f of gaap[tag]?.units?.USD ?? []) {
      if (
        !f.start ||
        !Number.isFinite(f.val) ||
        f.filed > checkedAt.slice(0, 10) ||
        f.end > checkedAt.slice(0, 10) ||
        !['10-Q', '10-K', '10-Q/A', '10-K/A'].includes(f.form ?? '')
      )
        continue;
      const days = (Date.parse(f.end) - Date.parse(f.start)) / 86400000;
      if (days < 59 || days > 379) continue;
      const key = f.start + '/' + f.end,
        old = unique.get(key);
      if (
        !old ||
        f.filed > old.filed ||
        (f.filed === old.filed && f.accn > old.accn)
      )
        unique.set(key, { ...f, start: f.start, tag });
    }
    return [...unique.values()];
  });
  const periodEnd = series
    .flat()
    .map((f) => f.end)
    .sort()
    .at(-1);
  if (!periodEnd) throw new Error('Nvidia reporting period unavailable');
  const flows = series.map((s) => ttm(s, periodEnd));
  if (flows.some((f) => !f))
    throw new Error('Incomplete Nvidia reporting period');
  const [revenue, grossProfit, ocf] = flows.map((f) => f!.value);
  if (revenue <= 0 || ![revenue, grossProfit, ocf].every(Number.isFinite))
    throw new Error('Invalid Nvidia financials');
  return {
    periodEnd,
    filed: flows
      .flatMap((f) => f!.facts.map((x) => x.filed))
      .sort()
      .at(-1)!,
    revenue,
    grossMargin: grossProfit / revenue,
    ocf,
    checkedAt,
    source: 'https://data.sec.gov/api/xbrl/companyfacts/CIK0001045810.json',
  };
}
