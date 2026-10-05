export const METHODOLOGY = 'buildout-v1';
export const COMPANIES = [
  {
    id: 'microsoft',
    name: 'Microsoft',
    ticker: 'MSFT',
    cik: '0000789019',
    color: '#477be0',
  },
  {
    id: 'alphabet',
    name: 'Alphabet',
    ticker: 'GOOGL',
    cik: '0001652044',
    color: '#428b77',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    ticker: 'AMZN',
    cik: '0001018724',
    color: '#e8a344',
  },
  {
    id: 'meta',
    name: 'Meta',
    ticker: 'META',
    cik: '0001326801',
    color: '#9b80cb',
  },
  {
    id: 'oracle',
    name: 'Oracle',
    ticker: 'ORCL',
    cik: '0001341439',
    color: '#dd745e',
  },
];
export type Metric = 'capex' | 'ocf' | 'revenue' | 'operatingIncome';
export type Fact = {
  start: string;
  end: string;
  val: number;
  filed: string;
  accn: string;
  tag: string;
};
export type Source = {
  id: string;
  checkedAt: string;
  facts: Record<Metric, Fact[]>;
};
export type Flow = { value: number; facts: Fact[] };
export type Company = (typeof COMPANIES)[number] & {
  end: string;
  filed: string;
  sourceUrl: string;
  checkedAt: string;
  current: Record<Metric, Flow>;
  prior: Record<Metric, Flow>;
};
export type Component = {
  id: string;
  name: string;
  value: number | null;
  score: number;
  weight: number;
  definition: string;
};
export type Aggregate = {
  capex: number;
  ocf: number;
  revenue: number;
  operatingIncome: number;
  priorCapex: number;
  priorRevenue: number;
  priorOperatingIncome: number;
  priorOcf: number;
};
export type Point = {
  date: string;
  score: number;
  capex: number;
  ocf: number;
  revenue: number;
  companies: Record<
    string,
    { capex: number; ocf: number; revenue: number; end: string }
  >;
};
export type Dashboard = {
  methodology: string;
  asOf: string;
  checkedAt: string;
  nextCheckAt: string;
  lastAttemptAt: string;
  failures: string[];
  companies: Company[];
  aggregate: Aggregate;
  components: Component[];
  score: number;
  history: Point[];
  previousScore: number | null;
  periodLabel: string;
};

const tags: Record<Metric, string[]> = {
  capex: ['PaymentsToAcquirePropertyPlantAndEquipment'],
  ocf: ['NetCashProvidedByUsedInOperatingActivities'],
  revenue: [
    'RevenueFromContractWithCustomerExcludingAssessedTax',
    'Revenues',
    'SalesRevenueNet',
  ],
  operatingIncome: ['OperatingIncomeLoss'],
};
const MS = 86400000;
const day = (s: string) => new Date(s + 'T00:00:00Z').getTime();
const span = (f: Fact) => (day(f.end) - day(f.start)) / MS + 1;
const yearBack = (s: string) => `${Number(s.slice(0, 4)) - 1}${s.slice(4)}`;

// Preserve original period + publication date so historical reconstructions cannot use future filings.
export function normalize(
  id: string,
  raw: {
    facts: Record<
      string,
      Record<string, { units?: Record<string, unknown[]> }>
    >;
  },
  checkedAt: string,
): Source {
  const gaap = raw.facts?.['us-gaap'];
  if (!gaap) throw new Error('Missing US GAAP facts');
  const facts = {} as Record<Metric, Fact[]>;
  for (const metric of Object.keys(tags) as Metric[]) {
    const choices =
      metric === 'capex' && id === 'amazon'
        ? ['PaymentsToAcquireProductiveAssets']
        : tags[metric];
    facts[metric] = choices.flatMap((tag) =>
      (gaap[tag]?.units?.USD ?? []).flatMap((row) => {
        const f = row as Fact & { form: string };
        return f.start &&
          f.end >= '2017-01-01' &&
          ['10-K', '10-Q', '10-K/A', '10-Q/A'].includes(f.form) &&
          Number.isFinite(f.val)
          ? [
              {
                start: f.start,
                end: f.end,
                val: f.val,
                filed: f.filed,
                accn: f.accn,
                tag,
              },
            ]
          : [];
      }),
    );
    if (!facts[metric].length) throw new Error(`Missing ${metric} for ${id}`);
  }
  return { id, checkedAt, facts };
}

function uniqueFacts(facts: Fact[], asOf: string): Fact[] {
  const map = new Map<string, Fact>();
  for (const f of facts) {
    if (f.filed > asOf || f.end > asOf || span(f) > 380 || span(f) < 60)
      continue;
    const k = f.start + '/' + f.end;
    const old = map.get(k);
    if (
      !old ||
      f.filed > old.filed ||
      (f.filed === old.filed && f.accn > old.accn)
    )
      map.set(k, f);
  }
  return [...map.values()];
}

export function ttm(facts: Fact[], end: string): Flow | null {
  const ending = facts
    .filter((f) => f.end === end)
    .sort((a, b) => span(b) - span(a));
  for (const current of ending) {
    if (span(current) >= 330) return { value: current.val, facts: [current] };
    // Annual + current year-to-date - corresponding prior year-to-date. Never sum cumulative quarters.
    const annual = facts
      .filter(
        (f) =>
          span(f) >= 330 &&
          Math.abs(day(f.end) - day(current.start) + MS) <= 7 * MS,
      )
      .sort((a, b) => b.filed.localeCompare(a.filed))[0];
    if (!annual) continue;
    const previous = facts.find(
      (f) =>
        Math.abs(day(f.start) - day(yearBack(current.start))) <= 7 * MS &&
        Math.abs(day(f.end) - day(yearBack(current.end))) <= 7 * MS &&
        Math.abs(span(f) - span(current)) <= 7,
    );
    if (previous)
      return {
        value: annual.val + current.val - previous.val,
        facts: [annual, current, previous],
      };
  }
  return null;
}

export function companyAt(source: Source, asOf: string): Company | null {
  const spec = COMPANIES.find((c) => c.id === source.id);
  if (!spec) return null;
  const filtered = Object.fromEntries(
    (Object.keys(tags) as Metric[]).map((k) => [
      k,
      uniqueFacts(source.facts[k], asOf),
    ]),
  ) as Record<Metric, Fact[]>;
  const ends = [...new Set(filtered.capex.map((f) => f.end))].sort().reverse();
  const latestReportedEnd = Object.values(filtered)
    .flat()
    .map((f) => f.end)
    .sort()
    .at(-1);
  // A partial/tag-changed filing must not silently regress the selected period.
  if (ends[0] !== latestReportedEnd) return null;
  for (const end of ends.slice(0, 1)) {
    const priorEnd = ends.find(
      (e) => Math.abs(day(e) - day(yearBack(end))) <= 7 * MS,
    );
    if (!priorEnd) continue;
    const current = {} as Record<Metric, Flow>,
      prior = {} as Record<Metric, Flow>;
    let valid = true;
    for (const k of Object.keys(tags) as Metric[]) {
      const c = ttm(filtered[k], end),
        p = ttm(filtered[k], priorEnd);
      if (!c || !p) {
        valid = false;
        break;
      }
      current[k] = c;
      prior[k] = p;
    }
    if (
      !valid ||
      current.revenue.value <= 0 ||
      prior.revenue.value <= 0 ||
      current.capex.value < 0 ||
      prior.capex.value <= 0
    )
      continue;
    return {
      ...spec,
      end,
      current,
      prior,
      checkedAt: source.checkedAt,
      filed: Object.values(current)
        .flatMap((f) => f.facts.map((x) => x.filed))
        .sort()
        .at(-1)!,
      sourceUrl: `https://data.sec.gov/api/xbrl/companyfacts/CIK${spec.cik}.json`,
    };
  }
  return null;
}

export function aggregate(companies: Company[]): Aggregate {
  const sum = (metric: Metric, prior = false) =>
    companies.reduce(
      (a, c) => a + (prior ? c.prior : c.current)[metric].value,
      0,
    );
  return {
    capex: sum('capex'),
    ocf: sum('ocf'),
    revenue: sum('revenue'),
    operatingIncome: sum('operatingIncome'),
    priorCapex: sum('capex', true),
    priorRevenue: sum('revenue', true),
    priorOperatingIncome: sum('operatingIncome', true),
    priorOcf: sum('ocf', true),
  };
}
export const clamp = (v: number) => Math.max(0, Math.min(100, v));
export function scoreAggregate(a: Aggregate): {
  score: number;
  components: Component[];
} {
  if (
    a.priorCapex <= 0 ||
    a.revenue <= 0 ||
    a.priorRevenue <= 0 ||
    !Object.values(a).every(Number.isFinite)
  )
    throw new Error('Insufficient comparable data to calculate index');
  const funding = a.ocf > 0 ? a.capex / a.ocf : null;
  const gap = a.capex / a.priorCapex - a.revenue / a.priorRevenue;
  const compression =
    a.priorOperatingIncome / a.priorRevenue - a.operatingIncome / a.revenue;
  const components: Component[] = [
    {
      id: 'funding',
      name: 'Cash-flow pressure',
      value: funding,
      score: funding === null ? 100 : clamp(((funding - 0.3) / 0.7) * 100),
      weight: 0.4,
      definition:
        'Cash capex ÷ operating cash flow. 30% or less maps to 0; 100% or more maps to 100. Nonpositive operating cash flow maps to maximum pressure; its ratio is not meaningful.',
    },
    {
      id: 'growth',
      name: 'Spending outruns sales',
      value: gap,
      score: clamp((gap / 0.5) * 100),
      weight: 0.35,
      definition:
        'Year-over-year capex growth minus revenue growth. A gap of 0 percentage points or less maps to 0; 50 points or more maps to 100.',
    },
    {
      id: 'margins',
      name: 'Margin compression',
      value: compression,
      score: clamp((compression / 0.1) * 100),
      weight: 0.25,
      definition:
        'Prior-year operating margin minus current operating margin. Flat or expanding margins map to 0; contraction of 10 percentage points or more maps to 100.',
    },
  ];
  return {
    score: Math.round(components.reduce((a, c) => a + c.score * c.weight, 0)),
    components,
  };
}

export function buildDashboard(sources: Source[], now: string): Dashboard {
  const asOf = now.slice(0, 10);
  const companies = sources
    .map((s) => companyAt(s, asOf))
    .filter((c): c is Company => !!c);
  // Never change the index's denominator silently when a feed or tag disappears.
  if (companies.length !== COMPANIES.length)
    throw new Error('The index requires all five companies');
  const a = aggregate(companies);
  const scored = scoreAggregate(a);
  const history: Point[] = [];
  for (let year = 2021; year <= Number(asOf.slice(0, 4)); year++)
    for (const suffix of ['03-31', '06-30', '09-30', '12-31']) {
      const date = `${year}-${suffix}`;
      if (date >= asOf) continue;
      const rows = sources
        .map((s) => companyAt(s, date))
        .filter((c): c is Company => !!c);
      if (rows.length !== COMPANIES.length) continue;
      const h = aggregate(rows);
      history.push({
        date,
        ...scoreAggregate(h),
        capex: h.capex,
        ocf: h.ocf,
        revenue: h.revenue,
        companies: Object.fromEntries(
          rows.map((c) => [
            c.id,
            {
              capex: c.current.capex.value,
              ocf: c.current.ocf.value,
              revenue: c.current.revenue.value,
              end: c.end,
            },
          ]),
        ),
      });
    }
  history.push({
    date: asOf,
    score: scored.score,
    capex: a.capex,
    ocf: a.ocf,
    revenue: a.revenue,
    companies: Object.fromEntries(
      companies.map((c) => [
        c.id,
        {
          capex: c.current.capex.value,
          ocf: c.current.ocf.value,
          revenue: c.current.revenue.value,
          end: c.end,
        },
      ]),
    ),
  });
  const checkedAt = sources.map((s) => s.checkedAt).sort()[0];
  return {
    methodology: METHODOLOGY,
    asOf,
    checkedAt,
    nextCheckAt: new Date(Date.parse(now) + 6 * 60 * 60 * 1000).toISOString(),
    lastAttemptAt: now,
    failures: companies
      .filter((c) => (day(asOf) - day(c.end)) / MS > 150)
      .map(
        (c) => `${c.name}: latest financial period is more than 150 days old.`,
      ),
    companies,
    aggregate: a,
    ...scored,
    history,
    previousScore: history.at(-2)?.score ?? null,
    periodLabel: [...new Set(companies.map((c) => c.end))].sort().join(' to '),
  };
}

export function pressureLabel(score: number) {
  return score < 20
    ? 'Low pressure'
    : score < 40
      ? 'Warming up'
      : score < 60
        ? 'Building pressure'
        : score < 80
          ? 'Elevated'
          : 'Very elevated';
}
