'use client';
import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './ui/accordion';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from './ui/table';
import {
  ArrowUpRight,
  Landmark,
  Zap,
  Network,
  FlaskConical,
} from 'lucide-react';
import dotcom from '../data/dotcom.json';
import ecosystem from '../data/ecosystem.json';
import type { Context } from '../lib/context';
const years = dotcom.observations.filter(
  (p) => p.year >= 1998 && p.year <= 2003,
);
const bn = (n: number) => `$${(n / 1e9).toFixed(1)}B`;
const date = (s: string) =>
  new Date(s.slice(0, 10) + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
function Link({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="evidence-link" href={href} target="_blank" rel="noreferrer">
      {children}
      <ArrowUpRight size={13} />
    </a>
  );
}

export function DotcomCheck() {
  return (
    <section className="research-section" id="dotcom">
      <div className="research-heading">
        <div>
          <p className="eyebrow">RETIRED MODEL / HISTORICAL CHECK</p>
          <h2>Why the accounting score was retired</h2>
          <p>
            The same formula. The same 0–100 scale. A deliberately untuned
            historical check.
          </p>
        </div>
        <span className="research-pill">RETROSPECTIVE · FY1998–2003</span>
      </div>
      <div className="historical-grid panel">
        <div className="historical-plot">
          <div className="plot-heading">
            <b>Buildout pressure · Microsoft + Intel</b>
            <span>Annual financials</span>
          </div>
          <figure
            className="comparison-chart"
            aria-label="Dot-com financial stress scores: fiscal 1998 11, 1999 0, 2000 41, 2001 44, 2002 0, 2003 0. Full data table below."
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              initialDimension={{ width: 620, height: 255 }}
            >
              <AreaChart
                data={years}
                margin={{ top: 15, right: 18, bottom: 8, left: -20 }}
              >
                <defs>
                  <linearGradient id="dotcomFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--foreground)"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--foreground)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="year"
                  tickFormatter={(v) => `FY${v}`}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  labelFormatter={(v) => `Fiscal year ${v}`}
                  formatter={(v) => [`${String(v)}/100`, 'Buildout pressure']}
                  contentStyle={{
                    borderRadius: 10,
                    borderColor: 'var(--border)',
                  }}
                />
                <Area
                  dataKey="index"
                  type="linear"
                  stroke="var(--foreground)"
                  strokeWidth={2.5}
                  fill="url(#dotcomFill)"
                  dot={{
                    r: 4,
                    fill: 'var(--foreground)',
                    stroke: 'var(--background)',
                    strokeWidth: 2,
                  }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </figure>
          <p className="market-annotation">
            Market context: Nasdaq peaked{' '}
            <Link href={dotcom.marketContext.peak.sourceUrl}>
              March 10, 2000
            </Link>{' '}
            and fell about{' '}
            <Link href={dotcom.marketContext.drawdown.sourceUrl}>
              78% by late 2002
            </Link>
            . This chart plots financial stress, not market prices.
          </p>
        </div>
        <aside className="historical-verdict">
          <p className="eyebrow">RESULT / LOW AND LATE</p>
          <h3>
            A stress gauge.
            <br />
            Not an early warning.
          </h3>
          <div className="verdict-numbers">
            <div>
              <strong>0</strong>
              <span>FY1999 score</span>
            </div>
            <div>
              <strong>44</strong>
              <span>FY2001 peak</span>
            </div>
          </div>
          <p>
            The score stayed low before the market peak and rose afterward. This
            check does <b>not validate bubble detection</b>.
          </p>
          <p className="research-small">
            Two surviving incumbents are not the entire bubble. Their capital
            intensity differs from today’s hyperscalers. A higher AI score does
            not establish greater crash risk.
          </p>
        </aside>
      </div>
      <Accordion className="research-accordion">
        <AccordionItem value="historical-evidence">
          <AccordionTrigger>
            Inspect the calculation, annual-report sources, and limitations
          </AccordionTrigger>
          <AccordionContent>
            <p>
              Unchanged weights: 40% cash capex / operating cash flow, 35% capex
              growth minus revenue growth, 25% operating-margin compression.
              Microsoft has a June year end; Intel a late-December year end.
              These are annual observations, unlike the current chart’s
              quarterly TTM reconstruction.
            </p>
            <p>
              <b>This is not a point-in-time backtest.</b> Publication dates are
              unverified, and some observations use later reports’ comparative
              figures. Each year’s growth and margin comparisons use the
              prior-year values from that same report vintage, avoiding
              accounting reclassification mismatches. Zero means the formula’s
              thresholds were not exceeded; it does not mean zero market risk.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fiscal year</TableHead>
                  <TableHead>Score /100</TableHead>
                  <TableHead>Capex / OCF</TableHead>
                  <TableHead>Growth gap</TableHead>
                  <TableHead>Margin decline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {years.map((p) => (
                  <TableRow key={p.year}>
                    <TableCell>FY{p.year}</TableCell>
                    <TableCell>
                      <b>{p.index}</b>
                    </TableCell>
                    <TableCell>{(p.capexToOcf * 100).toFixed(1)}%</TableCell>
                    <TableCell>{p.growthGapPp.toFixed(1)} pp</TableCell>
                    <TableCell>{p.marginDeclinePp.toFixed(1)} pp</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="table-caption">
              Original inputs below in USD millions. Report vintage is the
              fiscal year named by the report, not its release date. Failed
              dot-com companies, Cisco, and telecom carriers are excluded.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company / FY</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Op. income</TableHead>
                  <TableHead>OCF</TableHead>
                  <TableHead>Cash capex</TableHead>
                  <TableHead>Report / source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dotcom.rows
                  .filter((r) => r.fiscalYear >= 1998)
                  .map((r) => (
                    <TableRow key={r.company + r.fiscalYear}>
                      <TableCell>
                        {r.company} / {r.fiscalYear}
                      </TableCell>
                      <TableCell>{r.revenue.toLocaleString('en-US')}</TableCell>
                      <TableCell>
                        {r.operatingIncome.toLocaleString('en-US')}
                      </TableCell>
                      <TableCell>
                        {r.operatingCashFlow.toLocaleString('en-US')}
                      </TableCell>
                      <TableCell>
                        {r.cashCapex.toLocaleString('en-US')}
                      </TableCell>
                      <TableCell>
                        {r.reportVintage} ·{' '}
                        {r.sources.map((s, i) => (
                          <Link key={s.url} href={s.url}>
                            Statement {i + 1}
                          </Link>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <Link href="/api/research">
              Download all inputs, paired comparatives, and source locators
              (JSON)
            </Link>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

type EvidenceFact = {
  label: string;
  value: string;
  date: string;
  type: string;
  note: string;
  url: string;
  periodEnd?: string;
  secondaryUrl?: string;
};
const cards: {
  id: string;
  name: string;
  role: string;
  facts: EvidenceFact[];
}[] = ecosystem.cards;
const badge = (type: string) =>
  type.startsWith('sec_reported')
    ? 'SEC filing'
    : type === 'derived_from_sec'
      ? 'Calculated · SEC'
      : type.includes('mou')
        ? 'Preliminary MOU'
        : type.includes('commitment')
          ? 'Commitment'
          : 'Company disclosure';
export function ResearchContext({ initial }: { initial: Context }) {
  const [context, setContext] = useState(initial);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const r = await fetch('/api/context', { cache: 'no-store' });
        if (!r.ok) throw new Error();
        const data = (await r.json()) as Context;
        if (!data.rates?.observed || !data.nvidia?.periodEnd) throw new Error();
        if (active) {
          setContext(data);
          setError('');
        }
      } catch {
        if (active)
          setError(
            'Could not check context feeds. Last loaded values remain visible.',
          );
      }
    };
    void refresh();
    const timer = setInterval(refresh, 300000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  const { rates, nvidia } = context;
  return (
    <>
      <section className="research-section" id="ecosystem">
        <div className="research-heading">
          <div>
            <p className="eyebrow">02 / FOLLOW THE MONEY</p>
            <h2>The labs, the supplier, and the financing web.</h2>
            <p>
              Who earns cash, who buys compute, and who ultimately carries the
              risk?
            </p>
          </div>
          <Network size={26} />
        </div>
        <div className="ecosystem-grid">
          {cards.map((card) => {
            const lead = card.id === 'spacexai' ? card.facts[1] : card.facts[0];
            return (
              <article className="ecosystem-card panel" key={card.id}>
                <div className="company-identity">
                  <span className={`ecosystem-monogram ${card.id}`}>
                    {card.id === 'nvidia'
                      ? 'N'
                      : card.id === 'spacexai'
                        ? 'X'
                        : card.id === 'anthropic'
                          ? 'A'
                          : 'O'}
                  </span>
                  <div>
                    <h3>{card.name}</h3>
                    <p>{card.role}</p>
                  </div>
                </div>
                <p className="eyebrow">{lead.label}</p>
                <strong className="ecosystem-value">
                  {card.id === 'nvidia' ? bn(nvidia.revenue) : lead.value}
                </strong>
                <div className="fact-meta">
                  <span>{badge(lead.type)}</span>
                  <span>
                    {date(
                      card.id === 'nvidia'
                        ? nvidia.periodEnd
                        : (lead.periodEnd ?? lead.date),
                    )}
                  </span>
                </div>
                <p className="lead-note">
                  {card.id === 'openai'
                    ? 'Monthly pace reported March 2026; not audited annual revenue.'
                    : card.id === 'anthropic'
                      ? 'Company-reported annualized pace, not GAAP annual sales.'
                      : card.id === 'spacexai'
                        ? 'Q2 AI segment: Grok, X and infrastructure. $1.257B operating loss.'
                        : `TTM company-wide. ${(nvidia.grossMargin * 100).toFixed(1)}% gross margin · ${bn(nvidia.ocf)} operating cash flow.`}
                </p>
                <Accordion>
                  <AccordionItem value="facts">
                    <AccordionTrigger>Evidence & exposures</AccordionTrigger>
                    <AccordionContent>
                      {card.id === 'nvidia' && (
                        <p>
                          Live SEC feed: fiscal period ended{' '}
                          {date(nvidia.periodEnd)}, filed {date(nvidia.filed)}.
                          Checked {date(nvidia.checkedAt)}.{' '}
                          <Link href={nvidia.source}>SEC company facts</Link>
                        </p>
                      )}
                      {card.facts.map((f) => (
                        <div className="evidence-fact" key={f.label}>
                          <span className="eyebrow">
                            {f.label} · {badge(f.type)}
                          </span>
                          <b>{f.value}</b>
                          <p>{f.note}</p>
                          <Link href={f.url}>
                            {date(f.date)} · primary source
                          </Link>
                          {f.secondaryUrl && (
                            <Link href={f.secondaryUrl}>
                              Additional reporting / context
                            </Link>
                          )}
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </article>
            );
          })}
        </div>
        <p className="research-small ecosystem-note">
          Different periods and definitions; these figures are not directly
          comparable or additive. Supplier sales, cloud spending, and lab
          revenue overlap along the value chain. Nvidia financials refresh from
          SEC; lab disclosures, segment details, and commitments are reviewed
          snapshots dated at source. Last editorial review:{' '}
          {date(ecosystem.asOf)}.
        </p>
        <Accordion className="research-accordion">
          <AccordionItem value="relationships">
            <AccordionTrigger>
              Open the relationship ledger · 6 disclosed links
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flow</TableHead>
                    <TableHead>Kind / amount</TableHead>
                    <TableHead>What it actually means</TableHead>
                    <TableHead>Evidence date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ecosystem.edges.map((e) => (
                    <TableRow key={e.from + e.to + e.type}>
                      <TableCell>
                        <b>
                          {e.from} → {e.to}
                        </b>
                      </TableCell>
                      <TableCell>
                        {e.type.replaceAll('_', ' ')}
                        <br />
                        <b>{e.amount ?? 'No dollar amount shown'}</b>
                      </TableCell>
                      <TableCell className="ledger-note">{e.label}</TableCell>
                      <TableCell>
                        <Link href={e.url}>{date(e.date)}</Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p>
                Amounts describe different flows, time horizons, and conditions.
                They are not a total of current spending or a measure of
                circular revenue.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="interpretation">
          <FlaskConical size={21} />
          <div>
            <b>The Stratechery question: who is underwriting demand?</b>
            <p>
              Ben Thompson argues that Nvidia’s residual-value support shifts
              financing risk while protecting supplier margins. Track actual
              obligations, customer concentration, and cash collection alongside
              revenue. The $500B-plus mobilization target is preliminary;
              support of up to 25% applies to individual opportunities, not the
              entire target.
            </p>
            <Link href={ecosystem.expertCritique.source}>
              Read Thompson’s analysis · Aug 11, 2026
            </Link>
            <Link href="https://blogs.nvidia.com/blog/nvidia-ai-factory-compute/">
              Nvidia’s disclosed mechanism
            </Link>
          </div>
        </div>
      </section>
      <section className="research-section" id="macro">
        <div className="research-heading">
          <div>
            <p className="eyebrow">03 / THE COST OF CAPITAL & COMPUTE</p>
            <h2>Rates set the hurdle. Power sets the pace.</h2>
            <p>
              Useful context, kept outside the score until their predictive
              contribution is tested.
            </p>
          </div>
        </div>
        <div className="macro-grid">
          <article className="panel macro-card">
            <div className="plot-heading">
              <h3>
                <Landmark size={18} /> Financing conditions
              </h3>
              <span>FEDERAL RESERVE H.15</span>
            </div>
            <div className="macro-numbers">
              <div>
                <strong>
                  {rates.nominal.toFixed(2)}
                  <small>%</small>
                </strong>
                <span>10-year Treasury · nominal</span>
              </div>
              <div>
                <strong>
                  {rates.real.toFixed(2)}
                  <small>%</small>
                </strong>
                <span>10-year Treasury · real</span>
              </div>
            </div>
            <p>
              Higher risk-free rates lower the present value of distant cash
              flows and raise the cost of new or refinanced debt. Credit spreads
              and debt terms determine what each borrower actually pays.
            </p>
            <p className="scenario-strip">
              <b>Sensitivity:</b> +1 percentage point on $100B of new or
              repriced debt adds $1B in annual interest. An illustration, not a
              current interest bill.
            </p>
            <p className="research-small">
              Nominal and inflation-indexed constant-maturity yields. Falling
              Treasury yields during a recession can coexist with rising credit
              stress; lower rates do not automatically mean less bubble risk.
            </p>
            <div className="feed-foot">
              <Link href={rates.source}>Observed {date(rates.observed)}</Link>
              <span>Checked {date(rates.checkedAt)}</span>
            </div>
          </article>
          <article className="panel macro-card">
            <div className="plot-heading">
              <h3>
                <Zap size={18} /> Electricity demand
              </h3>
              <span>U.S. DATA CENTERS</span>
            </div>
            <div className="energy-range">
              <div>
                <strong>
                  176 <small>TWh</small>
                </strong>
                <span>2023 historical estimate</span>
              </div>
              <span className="energy-arrow">→</span>
              <div>
                <strong>
                  325–580 <small>TWh</small>
                </strong>
                <span>2028 scenario range</span>
              </div>
            </div>
            <div
              className="energy-bars"
              aria-label="2023 estimated 176 TWh, 2028 projected 325 to 580 TWh"
            >
              <div style={{ width: '30.34%' }} />
              <div className="energy-projection">
                <i style={{ width: '56.03%' }} />
              </div>
              <span>
                Solid: lower scenario · patterned: range to upper scenario
              </span>
            </div>
            <p>
              More power can unlock useful demand or enable excess capacity.
              Track the path from announced capacity to contracted, under
              construction, energized, and utilized capacity.
            </p>
            <p className="research-small">
              DOE / Berkeley Lab, published Dec 20, 2024. A dated scenario, not
              a live 2028 reading or the latest forecast. TWh measures energy
              consumed; GW measures power capacity. No comparable live buildout
              series is included yet.
            </p>
            <div className="feed-foot">
              <Link href="https://www.energy.gov/articles/doe-releases-new-report-evaluating-increase-electricity-demand-data-centers">
                DOE / Berkeley Lab estimate
              </Link>
              <Link href="https://www.eia.gov/outlooks/aeo/narrative/">
                Newer EIA 2026 scenarios
              </Link>
            </div>
          </article>
        </div>
        <p className="research-small">
          Federal Reserve and Nvidia feeds are checked every six hours when the
          site is visited; the page checks the cache every five minutes. Failed
          checks preserve the previous value and its verification date.
        </p>
        {(error || context.failures.length > 0) && (
          <output className="context-warning">
            {[error, ...context.failures].filter(Boolean).join(' ')}
          </output>
        )}
      </section>
      <section className="expert-lenses panel" id="lenses">
        <div className="research-heading">
          <div>
            <p className="eyebrow">04 / WHAT WOULD CHANGE THE VIEW?</p>
            <h2>Three lenses. No assumed consensus.</h2>
            <p>
              Research questions for serious readers; these are not endorsements
              by named experts.
            </p>
          </div>
        </div>
        <div className="lens-grid">
          <article>
            <span>ECONOMIST</span>
            <h3>Do returns clear the cost of capital?</h3>
            <p>
              Compare incremental cash earnings with investment, depreciation,
              and financing costs. Add valuation and credit spreads before
              calling this a market-bubble index.
            </p>
            <b>Missing test</b>
            <p>
              Point-in-time, broad-cohort comparisons with failed firms and
              other investment cycles.
            </p>
          </article>
          <article>
            <span>AI RESEARCHER</span>
            <h3>Does capability become paid utility?</h3>
            <p>
              Track retained paid usage, inference cost per useful task,
              utilization, and gross profit after serving costs. Benchmark gains
              alone cannot establish returns.
            </p>
            <b>Missing test</b>
            <p>
              Comparable lab unit economics and independent measures of customer
              value.
            </p>
          </article>
          <article>
            <span>CREDIT / INFRASTRUCTURE</span>
            <h3>Who absorbs the downside?</h3>
            <p>
              Follow customer concentration, enforceable guarantees, debt
              maturities, chip resale values, and delivered power. Announcements
              are not operating capacity.
            </p>
            <b>Missing test</b>
            <p>
              Contract-level obligations, refinancing exposure, and energized
              versus idle MW.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
