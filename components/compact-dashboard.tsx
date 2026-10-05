/* oxlint-disable next/no-html-link-for-pages, jsx-a11y/prefer-tag-over-role -- Native links navigate evidence/download routes; inline data SVGs require image semantics. */
'use client';
import { useEffect, useState, useRef } from 'react';
import ThemeToggle from './theme-toggle';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import evidence from '@/data/observatory.json';
import original from '@/data/validation.json';
import forward from '@/data/forward-risk.json';
import type { Dashboard } from '@/lib/metrics';
import type { Context } from '@/lib/context';
import {
  chartLabel as metricLabel,
  monthlyCadence,
  type ChartMetric,
} from '@/lib/observatory-labels';
import type { MarketData, MarketPoint } from '@/lib/market-server';

type Datum = {
  date: string;
  offset: number;
  [key: string]: string | number | boolean | null | undefined;
};
export type Episode = Omit<
  typeof evidence.ai,
  'points' | 'investment' | 'valuationLabel' | 'valuationCadence'
> & {
  valuationLabel: string | null;
  valuationCadence: string | null;
  points: MarketPoint[];
  investment: {
    date: string;
    offset: number;
    capexOCF: number | null;
    capexRevenue: number | null;
  }[];
};
type Metric = ChartMetric;
const choices: Record<Metric, string> = {
  paired: 'Price + crash estimate',
  risk: 'Monthly crash entry',
  risk12: '12-month loss · research',
  pe: 'P/E',
  cape: 'CAPE',
  capexOCF: 'Capex / cash flow',
  capexRevenue: 'Capex / sales',
  yield: 'Rail bond yield',
};
const monthIndex = (d: string) =>
  Number(d.slice(0, 4)) * 12 + Number(d.slice(5, 7)) - 1;
const niceMonth = (d: string) =>
  new Date(d.slice(0, 7) + '-15T12:00:00Z').toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
const percentage = (v: number | null | undefined, digits = 1) =>
  v == null ? 'Unavailable' : `${v.toFixed(digits)}%`;
const money = (v: number) => `$${(v / 1e9).toFixed(1)}B`;

export function Spark({
  points,
  field,
  max,
  height = 100,
  calendar = false,
  anchor,
  percent = false,
  events = false,
  dots = false,
  title,
  cadence = 'monthly observations',
  domain = [-24, 24],
  ticks,
  annotations = [],
}: {
  points: Datum[];
  field: string;
  max: number;
  height?: number;
  calendar?: boolean;
  anchor: string;
  percent?: boolean;
  events?: boolean;
  dots?: boolean;
  title: string;
  cadence?: string;
  domain?: [number, number];
  ticks?: number[];
  annotations?: { offset: number; label: string }[];
}) {
  const chartRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(320);
  useEffect(() => {
    const svg = chartRef.current;
    if (!svg) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(entry.contentRect.width);
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);
  const left = 34,
    right = width - 8,
    top = 8,
    bottom = height - 22;
  const x = (v: number) =>
    left + ((v - domain[0]) / (domain[1] - domain[0])) * (right - left);
  const y = (v: number) => bottom - (v / max) * (bottom - top);
  const valid = points.filter(
    (p) =>
      p.offset >= domain[0] &&
      p.offset <= domain[1] &&
      typeof p[field] === 'number' &&
      Number.isFinite(p[field]),
  );
  const segments: string[] = [];
  let part = '';
  for (const p of points.filter(
    (p) => p.offset >= domain[0] && p.offset <= domain[1],
  )) {
    const v = p[field];
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      if (part) segments.push(part);
      part = '';
      continue;
    }
    part += `${part ? 'L' : 'M'}${x(p.offset).toFixed(2)},${y(v).toFixed(2)} `;
  }
  if (part) segments.push(part);
  const label = (offset: number) => {
    if (!calendar) return offset > 0 ? `+${offset}` : String(offset);
    const t = monthIndex(anchor) + offset;
    return `${String((t % 12) + 1).padStart(2, '0')}/${String(Math.floor(t / 12)).slice(2)}`;
  };
  return (
    <svg
      ref={chartRef}
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', height }}
      role="img"
      aria-label={title}
      className="ob-chart"
    >
      <title>{title}</title>
      <desc>
        {cadence}; vertical line marks the reference month. Hover a point for
        its date and value. Data tables are in the appendix.
      </desc>
      {[0, max].map((v) => (
        <g key={v}>
          <line
            x1={left}
            x2={right}
            y1={y(v)}
            y2={y(v)}
            className="ob-gridline"
          />
          <text x={left - 5} y={y(v) + 4} textAnchor="end">
            {v}
            {percent ? '%' : ''}
          </text>
        </g>
      ))}
      <line x1={x(0)} x2={x(0)} y1={top} y2={bottom} className="ob-reference" />
      {(field === 'risk' || field === 'risk12') && (
        <line
          x1={left}
          x2={right}
          y1={y(field === 'risk12' ? 20 : 10)}
          y2={y(field === 'risk12' ? 20 : 10)}
          className="ob-alarm"
        />
      )}
      {!dots &&
        segments.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            className={
              field.startsWith('risk') ? 'ob-risk-line' : 'ob-price-line'
            }
          />
        ))}
      {valid.map((p) => (
        <g key={p.date}>
          <circle
            cx={x(p.offset)}
            cy={y(Number(p[field]))}
            r={dots ? 3 : 0.7}
            fill={p.company === 'INTC' ? 'var(--background)' : 'currentColor'}
            stroke="currentColor"
          />
          <rect
            x={x(p.offset) - 2.6}
            y={top}
            width={5.2}
            height={bottom - top}
            fill="transparent"
          >
            <title>{`${p.observationLabel || niceMonth(p.date)}: ${Number(p[field]).toFixed(2)}${percent ? '%' : ''}${field === 'risk' ? ` · forecast made ${p.forecastAsOf} · ${p.event === 1 ? 'crossing occurred' : p.event === 0 ? 'no crossing' : 'outcome unknown'}` : field === 'risk12' ? ` · ${p.outcomeStart}–${p.outcomeEnd} · realized future loss: ${p.futureLoss == null ? 'not yet observed' : Number(p.futureLoss).toFixed(1) + '%'} · baseline ${Number(p.constant).toFixed(1)}%` : ''}`}</title>
          </rect>
        </g>
      ))}
      {events &&
        points
          .filter((p) => p.event === 1)
          .map((p) => (
            <path
              key={p.date}
              d={`M${x(p.offset)},${bottom - 7} l-3,6 h6 z`}
              fill="currentColor"
            >
              <title>{`${niceMonth(p.date)}: actual entry into the defined drawdown`}</title>
            </path>
          ))}
      {annotations.map((a) => (
        <line
          key={a.label}
          x1={x(a.offset)}
          x2={x(a.offset)}
          y1={top}
          y2={bottom}
          className="ob-reference"
        >
          <title>{a.label}</title>
        </line>
      ))}
      {(
        ticks ||
        (width < 240 ? [domain[0], 0, domain[1]] : [-24, -12, 0, 12, 24])
      ).map((v) => (
        <text key={v} x={x(v)} y={height - 5} textAnchor="middle">
          {label(v)}
        </text>
      ))}
    </svg>
  );
}
function seriesFor(c: Episode, metric: Metric): Datum[] {
  if (metric === 'risk12') {
    const found =
      c.id === 'ai-current'
        ? forward.ai
        : forward.cases.find((v) => v.id === c.id);
    return (found?.points || []).map((p) => ({
      ...p,
      offset: monthIndex(p.date) - monthIndex(c.anchor),
    }));
  }
  return (
    metric === 'pe' || metric === 'cape'
      ? c.valuations
      : metric === 'yield'
        ? c.credit
        : metric.startsWith('capex')
          ? c.investment
          : c.points
  ) as Datum[];
}
function EpisodeChart({
  c,
  metric,
  max,
  calendar,
  large = false,
}: {
  c: Episode;
  metric: Metric;
  max: number;
  calendar: boolean;
  large?: boolean;
}) {
  const points = seriesFor(c, metric);
  const field = metric === 'paired' ? 'price' : metric;
  const found = points.some((p) => typeof p[field] === 'number');
  return (
    <>
      <div className="ob-chart-label">{metricLabel(c, metric)}</div>
      {found ? (
        <>
          <Spark
            points={points}
            field={field}
            max={max}
            anchor={c.anchor}
            calendar={calendar}
            height={large ? 125 : metric === 'paired' ? 84 : 139}
            dots={
              (metric === 'pe' && !monthlyCadence(c.valuationCadence)) ||
              metric.startsWith('capex')
            }
            percent={
              metric.startsWith('risk') ||
              metric.startsWith('capex') ||
              metric === 'yield'
            }
            events={metric === 'risk'}
            cadence={
              metric.startsWith('capex')
                ? 'Dated fiscal accounts; no interpolation'
                : metric === 'pe' || metric === 'cape'
                  ? c.valuationCadence || 'unavailable'
                  : 'monthly observations'
            }
            title={`${c.name}: ${metricLabel(c, metric)}`}
          />
          {metric === 'paired' && (
            <>
              <div className="ob-chart-label ob-risk-label">
                Crash-entry estimate · % <span>▲ observed entry</span>
              </div>
              <Spark
                points={c.points as Datum[]}
                field="risk"
                max={100}
                height={large ? 85 : 70}
                anchor={c.anchor}
                calendar={calendar}
                percent
                events
                title={`${c.name}: experimental monthly drawdown-entry estimates`}
              />
            </>
          )}
        </>
      ) : (
        <div className="ob-missing">
          <strong>Not available</strong>
          <span>
            {metric === 'pe' || metric === 'cape'
              ? ['gold1980', 'bitcoin2017', 'bitcoin2021'].includes(c.id)
                ? 'No corporate earnings denominator.'
                : `No comparable ${metric.toUpperCase()} series acquired.`
              : metric === 'yield'
                ? 'This series covers US railroads only.'
                : 'Comparable investment accounts not acquired.'}
          </span>
        </div>
      )}
    </>
  );
}

export default function CompactDashboard({
  initial,
  context,
  marketInitial,
}: {
  initial: Dashboard;
  context: Context;
  marketInitial: MarketData;
}) {
  const [data, setData] = useState(initial),
    [ctx, setCtx] = useState(context);
  const [metric, setMetric] = useState<Metric>('paired'),
    [calendar, setCalendar] = useState(false),
    [shock, setShock] = useState('base');
  const [market, setMarket] = useState(marketInitial.current);
  const [marketSeries, setMarketSeries] = useState(marketInitial);
  const [marketStatus, setMarketStatus] = useState(
    marketInitial.failures[0] ||
      `Market checked ${marketInitial.checkedAt.slice(0, 10)}`,
  );
  useEffect(() => {
    let active = true;
    async function refresh() {
      for (const [url, apply] of [
        ['/api/dashboard', setData],
        ['/api/context', setCtx],
      ] as const) {
        try {
          const r = await fetch(url);
          if (r.ok && active) apply(await r.json());
        } catch {
          /* Retain dated evidence. */
        }
      }
      try {
        const r = await fetch('/api/market');
        if (r.ok && active) {
          const d = (await r.json()) as MarketData;
          if (d.current) {
            setMarket(d.current);
            setMarketSeries(d);
            setMarketStatus(
              d.failures?.length
                ? d.failures[0]
                : `Market checked ${d.checkedAt.slice(0, 10)}`,
            );
          }
        }
      } catch {
        /* Retain dated model estimate. */
      }
    }
    void refresh();
    const id = setInterval(refresh, 300000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);
  const ai: Episode = {
    ...evidence.ai,
    anchor: marketSeries.anchor,
    points: marketSeries.points,
    valuations: evidence.ai.valuations
      .map((p) => ({
        ...p,
        offset: monthIndex(p.date) - monthIndex(marketSeries.anchor),
      }))
      .filter((p) => p.offset >= -24),
    investment: data.history
      .map((p) => ({
        date: p.date.slice(0, 7),
        offset: monthIndex(p.date) - monthIndex(marketSeries.anchor),
        capexOCF: p.ocf > 0 ? (100 * p.capex) / p.ocf : null,
        capexRevenue: p.revenue > 0 ? (100 * p.capex) / p.revenue : null,
      }))
      .filter((p) => p.offset >= -24 && p.offset <= 24),
  } as Episode;
  const cases = evidence.cases as Episode[];
  const all = [ai, ...cases];
  const values = all
    .flatMap((c) =>
      seriesFor(c, metric).map(
        (p) => p[metric === 'paired' ? 'price' : metric],
      ),
    )
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  const max = metric.startsWith('risk')
    ? 100
    : metric === 'yield'
      ? 10
      : Math.max(
          metric === 'paired' ? 150 : 50,
          Math.ceil(Math.max(0, ...values) / 50) * 50,
        );
  const coverage =
    data.aggregate.ocf > 0
      ? (data.aggregate.capex / data.aggregate.ocf) * 100
      : null;
  const stressed =
    coverage == null
      ? null
      : (coverage * (shock === 'capex' || shock === 'both' ? 1.1 : 1)) /
        (shock === 'cash' || shock === 'both' ? 0.9 : 1);
  const val = evidence.ai.valuations.filter((p) => p.cape != null).at(-1);
  const exuberance = original.current.find((c) => c.id === 'AI_PROXY')?.latest
    .percentile;
  const v = evidence.research.validation,
    nv = evidence.research.current_proxy_validation;
  return (
    <main className="ob-shell">
      <header className="ob-header">
        <a href="/" className="ob-wordmark">
          AI BUBBLE OBSERVATORY
        </a>
        <nav>
          <a href="/appendix">Evidence & appendix ↗</a>
          <ThemeToggle />
        </nav>
      </header>
      <div className="ob-title-row">
        <h1>How bubbly is AI?</h1>
        <span>Prices. Cash flows. Historical reality checks.</span>
      </div>
      <section className="ob-stats" aria-label="Current indicators">
        <div>
          <span>Price exuberance / 100</span>
          <strong>
            {exuberance == null ? 'Unavailable' : exuberance.toFixed(1)}
            <small>/100</small>
          </strong>
          <p>
            AI-related industry basket · Jul 2026
            <br />
            Price-path diagnostic, not crash odds
          </p>
        </div>
        <div>
          <span>Monthly crash-entry estimate</span>
          <strong>
            {percentage(
              market.probability == null ? null : market.probability * 100,
            )}
          </strong>
          <p>
            Nasdaq proxy → {niceMonth(market.target_month)}
            <br />
            <b>Uncalibrated; not AI-specific</b>
            <br />
            Barrier: Nasdaq ≤{' '}
            {market.threshold.toLocaleString('en-US', {
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
        <div>
          <span>Capex / operating cash flow</span>
          <strong>{percentage(coverage)}</strong>
          <p>
            {money(data.aggregate.capex)} / {money(data.aggregate.ocf)}
            <br />
            Five hyperscalers · latest reported TTM
          </p>
        </div>
        <div>
          <span>Broad US equity CAPE</span>
          <strong>
            {val?.cape?.toFixed(1)}
            <small>×</small>
          </strong>
          <p>
            {val ? niceMonth(val.date) : 'Unavailable'} · market context
            <br />
            Not an AI valuation multiple
          </p>
        </div>
      </section>
      <section className="ob-toolbar" aria-label="Chart controls">
        <div>
          <h2>One lens, eleven comparisons</h2>
          <p>
            Historical reference months are selected in hindsight. AI’s
            reference is the latest completed month—not an assumed peak.
          </p>
        </div>
        <div className="ob-controls">
          <Select value={metric} onValueChange={(v) => setMetric(v as Metric)}>
            <SelectTrigger aria-label="Chart metric">
              <SelectValue>{choices[metric]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(choices).map(([k, label]) => (
                <SelectItem key={k} value={k}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCalendar((v) => !v)}
            aria-pressed={calendar}
          >
            {calendar ? 'Calendar dates' : 'Months from reference'}
          </Button>
        </div>
      </section>
      <p className="ob-coverage-note">
        {
          all.filter((c) =>
            seriesFor(c, metric).some(
              (p) =>
                typeof p[metric === 'paired' ? 'price' : metric] === 'number',
            ),
          ).length
        }{' '}
        / 11 comparisons have this metric.{' '}
        {metric === 'risk12'
          ? 'Retrospective experiment: no clear improvement over a constant forecast. Snapshot through Aug 2026; not calibrated AI odds.'
          : metric === 'pe'
            ? 'Valuation universes differ from price indices; missing earnings remain unavailable.'
            : metric.startsWith('capex')
              ? 'Dot-com shows two surviving firms at their own fiscal year ends; AI uses five-firm trailing accounts.'
              : 'Gaps and source cadence remain visible.'}
      </p>
      <section className="ob-now-row">
        <article className="ob-now-chart">
          <div className="ob-card-head">
            <h3>
              AI today <span>Broad tech proxy</span>
            </h3>
            <a href="/appendix#ai-current">Data ↗</a>
          </div>
          <EpisodeChart
            c={ai}
            metric={metric}
            max={max}
            calendar={calendar}
            large
          />
          <p className="ob-caption">
            Price / risk through {niceMonth(marketSeries.anchor)}. Current
            estimate is made from {niceMonth(market.asof)} data; prices during
            its target month are excluded.
          </p>
        </article>
        <article className="ob-validation">
          <div className="ob-card-head">
            <h3>
              {metric === 'risk12'
                ? '12-month experiment: inconclusive'
                : 'Does it work historically?'}
            </h3>
            <a href="/appendix#forecast-method">Audit ↗</a>
          </div>
          <div hidden={metric === 'risk12'}>
            <div className="ob-validation-row">
              <div>
                <strong>{(v.brier_skill * 100).toFixed(1)}%</strong>
                <span>
                  Lower Brier error than baseline
                  <br />
                  US industry test · 2000–2024
                </span>
              </div>
              <div>
                <strong>
                  {nv.confusion.tp} / {nv.events}
                </strong>
                <span>
                  Nasdaq entries caught
                  <br />
                  <b>
                    {nv.confusion.fp} false alarms · {nv.confusion.fn} missed
                  </b>
                </span>
              </div>
            </div>
            <div
              className="ob-error-bars"
              aria-label="Nasdaq: four entries caught, two missed, sixteen false alarms"
            >
              {Array.from({ length: 22 }, (_, i) => (
                <i
                  key={i}
                  className={i < 4 ? 'hit' : i < 6 ? 'miss' : 'false'}
                />
              ))}
            </div>
            <p>
              At a fixed 10% alarm threshold. Nasdaq: {nv.n} eligible months,
              just {nv.events} entries. Its Brier improvement interval crosses
              zero.
            </p>
            <p>
              <b>This is not a reliable peak detector.</b> It often reacts after
              declines begin and misses the gradual housing bust. The ten
              examples below illustrate behavior; they are not the validation
              sample.
            </p>
            <a className="ob-underlink" href="/appendix#calibration">
              See calibration, baseline and full counts →
            </a>
            <br />
            <a className="ob-underlink" href="/appendix#forward-risk">
              12-month alternative: no clear improvement →
            </a>
          </div>
          {metric === 'risk12' && (
            <div className="ob-forward-summary">
              <strong>
                {(forward.nasdaq.current.probability * 100).toFixed(1)}%{' '}
                <small>Nasdaq model estimate</small>
              </strong>
              <p>
                20% below the August 2026 close at any of the next 12 month-end
                closes. Historical-rate comparator:{' '}
                {(forward.nasdaq.current.p_constant * 100).toFixed(1)}%.
              </p>
              <p>
                <b>No convincing improvement.</b> The simple volatility/drawdown
                model and full model both have improvement intervals spanning
                zero. The test period was already examined in prior research.
              </p>
              <p>
                At 20% alarm: 31 positive windows caught, 38 false alarms, 21
                missed. These are overlapping forecast windows—not distinct
                crashes.
              </p>
              <a className="ob-underlink" href="/appendix#forward-risk">
                Compare models, labels & uncertainty →
              </a>
            </div>
          )}
        </article>
      </section>
      <section className="ob-history-grid" aria-label="Ten historical examples">
        {cases.map((c) => (
          <article className="ob-episode" key={c.id}>
            <div className="ob-card-head">
              <h3>{c.name.replace(', ', ' · ')}</h3>
              <a
                href={`/appendix#${c.id}`}
                aria-label={`${c.name} data and risk bearers`}
              >
                ↗
              </a>
            </div>
            <div className="ob-reference-label">
              Reference: {niceMonth(c.anchor)} ·{' '}
              {c.forecastStatus.startsWith('future')
                ? 'Backcast'
                : c.forecastStatus.startsWith('development')
                  ? 'Development era'
                  : 'Asset transfer'}
            </div>
            <EpisodeChart c={c} metric={metric} max={max} calendar={calendar} />
            <a
              href={`/appendix#${c.id}`}
              className="ob-risk-bearer"
              title={c.risk.direct}
            >
              Downside:{' '}
              {c.id === 'usrail1873'
                ? 'shareholders & bondholders'
                : c.id === 'housing2006'
                  ? 'owners, lenders & guarantors'
                  : c.id.startsWith('bitcoin')
                    ? 'holders & leveraged traders'
                    : c.id === 'gold1980'
                      ? 'holders & leveraged longs'
                      : c.id.startsWith('china')
                        ? 'equity holders & margin lenders'
                        : c.id === 'japan1989'
                          ? 'equity holders & later banks'
                          : 'equity holders & financiers'}{' '}
              ↗
            </a>
          </article>
        ))}
      </section>
      <p className="ob-chart-note" hidden={metric === 'risk12'}>
        Risk is the model estimate, made one month earlier, of entering a 20%
        drawdown from a trailing 12-month peak at the next monthly observation.
        ▲ = actual entry; dashed line = 10% alarm. Gaps mean already in drawdown
        or unavailable—not zero risk. Historical prices mostly use monthly
        means; Nasdaq uses closes.{' '}
        <a href="/appendix#railways">
          UK railway mania & full rail histories ↗
        </a>
      </p>
      <p className="ob-chart-note" hidden={metric !== 'risk12'}>
        Each point forecasts the following 12 months from that month’s price; it
        is not the chance of a crash in that one month. Dashed line = 20% alarm.
        Hover for the outcome window and realized loss. Historical examples use
        mixed source conventions and are uncalibrated transfers.
      </p>
      <section className="ob-scenario">
        <div>
          <h2>What would make funding more fragile?</h2>
          <p>
            Cash capex consumes <b>{percentage(stressed)}</b> of operating cash
            flow under this scenario.
          </p>
        </div>
        <Select value={shock} onValueChange={(v) => setShock(String(v))}>
          <SelectTrigger aria-label="Funding scenario">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="base">Current reported accounts</SelectItem>
            <SelectItem value="cash">Operating cash flow −10%</SelectItem>
            <SelectItem value="capex">Cash capex +10%</SelectItem>
            <SelectItem value="both">Both changes together</SelectItem>
          </SelectContent>
        </Select>
        <div className="ob-coverage">
          <div>
            <i style={{ width: `${Math.min(100, stressed ?? 0)}%` }} />
          </div>
          <span>
            100% exhausts operating cash flow; this is not a crash threshold.
          </span>
        </div>
      </section>
      <section className="ob-boom">
        <div>
          <h2>What survives the bust?</h2>
          <p>
            <a href="https://press.stripe.com/boom">Boom</a> argues that
            concentrated funding can accelerate innovation. Investor losses and
            useful capacity are separate outcomes.
          </p>
          <a href="/appendix#boom">Evidence, counterfactuals & limits →</a>
        </div>
        <div>
          <span>AI · unit cost</span>
          <strong>&gt;280× lower</strong>
          <p>
            GPT-3.5-level inference cost
            <br />
            Nov 2022–Oct 2024
          </p>
        </div>
        <div>
          <span>UK + Ireland · railway miles</span>
          <strong>2,343 → 6,308</strong>
          <p>
            Miles open · 1845–1850
            <br />
            Different from US 1873
          </p>
        </div>
        <div>
          <span>US · internet lines</span>
          <strong>7.1M → 9.6M</strong>
          <p>
            Dec 2000–Jun 2001
            <br />
            Rounded high-speed line counts
          </p>
        </div>
      </section>
      <div className="ob-context-strip">
        <a href="/appendix#ecosystem">
          OpenAI · Anthropic · SpaceX / xAI · Nvidia ↗
        </a>
        <span>
          10y Treasury {ctx.rates.nominal.toFixed(2)}% · real{' '}
          {ctx.rates.real.toFixed(2)}% ({ctx.rates.observed})
        </span>
        <a href="/appendix#macro">Energy & capacity commitments ↗</a>
      </div>
      <footer className="ob-footer">
        <span>
          Financial feeds checked {data.checkedAt.slice(0, 10)} · {marketStatus}
          . Visits trigger checks after six hours; research and historical
          charts are dated releases.
        </span>
        <a href="/appendix#sources">Sources, definitions & downloads ↗</a>
      </footer>
      {(data.failures.length > 0 || ctx.failures.length > 0) && (
        <p className="ob-feed-warning">
          Some feeds could not refresh. Dated last verified values are retained.{' '}
          <a href="/appendix">Feed status ↗</a>
        </p>
      )}
    </main>
  );
}
