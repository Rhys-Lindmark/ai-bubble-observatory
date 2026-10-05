'use client';
import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  Download,
  Info,
  Activity,
  Database,
  Check,
  Clock3,
  TrendingUp,
  ShieldCheck,
  CircleHelp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { type Dashboard as Data, type Company } from '@/lib/metrics';
import { Details } from './details';
import ThemeToggle from './theme-toggle';
import ValidationPanel from './validation-panel';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './ui/accordion';
import { DotcomCheck, ResearchContext } from './research-panels';
import type { Context } from '@/lib/context';

export const billion = (n: number) =>
  `$${(n / 1e9).toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}B`;
export const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const pp = (n: number) => `${n >= 0 ? '+' : ''}${(n * 100).toFixed(1)} pp`;
export const date = (s: string) =>
  new Date(s.slice(0, 10) + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
export const shortDate = (s: string) =>
  new Date(s + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  });
const tip = {
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--foreground)',
  borderRadius: 10,
  boxShadow: 'none',
  fontSize: 13,
};
const cohorts: Record<string, string> = {
  all: 'All five companies',
  microsoft: 'Microsoft',
  alphabet: 'Alphabet',
  amazon: 'Amazon',
  meta: 'Meta',
  oracle: 'Oracle',
};
export function SourceLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="source-link">
      {children}
      <ArrowUpRight size={14} />
    </a>
  );
}
function PanelTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="panel-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function Dashboard({
  initial,
  context,
}: {
  initial: Data;
  context: Context;
}) {
  const [data, setData] = useState(initial),
    [range, setRange] = useState('3Y'),
    [cohort, setCohort] = useState('all');
  const [clock, setClock] = useState(Date.parse(initial.asOf));
  const [view, setView] = useState<string | null>(null),
    [checking, setChecking] = useState(false),
    [message, setMessage] = useState(''),
    [snapshotDays, setSnapshotDays] = useState<string[]>([]);
  const load = async () => {
    setClock(Date.now());
    setChecking(true);
    try {
      const r = await fetch('/api/dashboard');
      if (!r.ok) throw new Error();
      const next = (await r.json()) as Data & { snapshotDates?: string[] };
      if (!next.companies?.length) throw new Error();
      setData(next);
      setSnapshotDays(next.snapshotDates ?? []);
      return true;
    } catch {
      setMessage(
        'Unable to check for updates. Your last verified snapshot remains visible.',
      );
      return false;
    } finally {
      setChecking(false);
    }
  };
  useEffect(() => {
    const hydrate = setTimeout(() => {
      const p = new URLSearchParams(window.location.search),
        r = p.get('range'),
        c = p.get('company');
      if (r && ['1Y', '3Y', 'ALL'].includes(r)) setRange(r);
      if (c && cohorts[c]) setCohort(c);
    }, 0);
    const first = setTimeout(() => void load(), 15000),
      interval = setInterval(() => {
        if (!document.hidden) void load();
      }, 60000);
    return () => {
      clearTimeout(hydrate);
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);
  const setFilter = (key: string, value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
  };
  const a = data.aggregate,
    capexGrowth = a.capex / a.priorCapex - 1,
    revenueGrowth = a.revenue / a.priorRevenue - 1,
    marginChange =
      a.operatingIncome / a.revenue - a.priorOperatingIncome / a.priorRevenue;
  const history = data.history.filter(
    (p) =>
      range === 'ALL' ||
      Date.parse(p.date) >=
        Date.parse(data.asOf) - (range === '1Y' ? 366 : 1098) * 86400000,
  );
  const chart = history.map((p) => ({
    date: p.date,
    capex: (cohort === 'all' ? p.capex : p.companies[cohort]?.capex) / 1e9,
    ocf: (cohort === 'all' ? p.ocf : p.companies[cohort]?.ocf) / 1e9,
  }));
  const selected = data.companies.find((c) => c.id === cohort),
    selectedCapex = selected?.current.capex.value ?? a.capex,
    selectedOcf = selected?.current.ocf.value ?? a.ocf;
  const cashRatio = a.ocf > 0 ? a.capex / a.ocf : null;
  const cashHistory = history.map((p) => ({
    ...p,
    cashAbsorption: p.ocf > 0 ? (p.capex / p.ocf) * 100 : null,
  }));
  const priorPoint = data.history.at(-2);
  const delta =
    cashRatio !== null && priorPoint && priorPoint.ocf > 0
      ? (cashRatio - priorPoint.capex / priorPoint.ocf) * 100
      : null;
  const priorDate = priorPoint?.date;
  const stale =
    !!data.failures.length || clock - Date.parse(data.checkedAt) > 48 * 3600000;
  const worst = [...data.companies].sort(
    (c, d) =>
      d.current.capex.value / d.current.ocf.value -
      c.current.capex.value / c.current.ocf.value,
  )[0];
  return (
    <>
      <a className="skip-link" href="#overview">
        Skip to dashboard
      </a>
      <header className="masthead">
        <div className="masthead-inner">
          <a href="#overview" className="brand">
            <span className="brand-mark">
              <Activity size={20} />
            </span>
            <span>
              AI BUBBLE<span className="brand-light"> MONITOR</span>
            </span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#overview" className="nav-active">
              Overview
            </a>
            <a href="#validation">Model check</a>
            <button onClick={() => setView('methodology')}>
              Methodology <ArrowUpRight size={13} />
            </button>
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main className="dashboard-shell" id="overview">
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              <span className="tiny-line" />
              FOLLOW THE MONEY. WATCH THE GAP.
            </p>
            <h1>A reality check on the AI boom.</h1>
            <p className="intro">
              Capital is moving fast. Are the returns keeping up?
            </p>
          </div>
          <div className="update-block">
            <span className={`update-label ${stale ? 'warning' : ''}`}>
              <i />
              {stale
                ? 'Showing last verified data'
                : 'SEC feeds connected · research dated separately'}
            </span>
            <span>Checked {date(data.checkedAt)}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (await load())
                  setMessage(
                    'Latest available snapshot loaded. Source checks run every six hours.',
                  );
              }}
              disabled={checking}
            >
              <RefreshCw size={13} className={checking ? 'spin' : ''} />
              {checking ? 'Checking…' : 'Check for updates'}
            </Button>
          </div>
        </div>
        {message && (
          <output className="update-message">
            {message}
            <button
              aria-label="Dismiss update message"
              onClick={() => setMessage('')}
            >
              ×
            </button>
          </output>
        )}
        {stale && (
          <div className="stale-notice">
            <Clock3 size={15} />
            <span>
              A source check is unavailable or overdue. Last verified values
              remain visible.
            </span>
            <button onClick={() => setView('sources')}>
              View status <ArrowRight size={14} />
            </button>
          </div>
        )}
        <ValidationPanel />
        <div className="research-heading">
          <div>
            <p className="eyebrow">FUNDAMENTALS / AUTOMATIC SEC UPDATES</p>
            <h2>Can operating cash cover the buildout?</h2>
          </div>
        </div>
        <section className="overview-grid" aria-label="Cash-flow coverage">
          <article className="index-card">
            <div className="index-top">
              <span>CASH ABSORBED BY CAPEX</span>
              <button
                className="beta-tag"
                onClick={() => setView('methodology')}
              >
                BETA <Info size={12} />
              </button>
            </div>
            <div className="index-number">
              <strong>
                {cashRatio === null ? 'N/M' : (cashRatio * 100).toFixed(1)}
              </strong>
              <span>%</span>
              <span className="index-classification">
                <i />
                {cashRatio === null
                  ? 'Nonpositive cash flow'
                  : cashRatio > 1
                    ? 'Cash deficit'
                    : 'Cash coverage'}
              </span>
            </div>
            <p className="index-summary">
              {billion(a.capex)} cash capex ÷ {billion(a.ocf)} operating cash
              flow.
            </p>
            <p className="research-small">
              {cashRatio !== null && cashRatio < 1
                ? `${((1 - cashRatio) * 100).toFixed(1)}% aggregate cash-flow cushion at fixed capex.`
                : 'Capex exceeds or cannot be covered by operating cash flow.'}{' '}
              This company-wide ratio can exceed 100%; it is not a bubble score,
              solvency measure, or AI-only return.
            </p>
            <a className="historical-headline-link" href="#retired-model">
              Original score retired after methodological audit ↗
            </a>
            <div className="index-bottom">
              <span>
                {delta !== null ? (
                  <>
                    <TrendingUp size={15} />
                    <b>
                      {delta >= 0 ? '+' : ''}
                      {delta.toFixed(1)} pp
                    </b>{' '}
                    since {shortDate(priorDate!)}
                  </>
                ) : (
                  'Initial snapshot'
                )}
              </span>
              <button onClick={() => setView('methodology')}>
                How it works <ArrowUpRight size={14} />
              </button>
            </div>
            <p className="index-scope">
              Cash capex / OCF · Unweighted, uncapped accounting ratio
            </p>
          </article>
          <article className="panel index-history">
            <PanelTitle
              eyebrow="THE LONGER VIEW"
              title="Cash absorption over time"
            >
              <fieldset className="range-buttons" aria-label="Chart time range">
                {['1Y', '3Y', 'ALL'].map((r) => (
                  <Button
                    key={r}
                    size="sm"
                    variant={range === r ? 'secondary' : 'ghost'}
                    aria-pressed={range === r}
                    onClick={() => {
                      setRange(r);
                      setFilter('range', r);
                    }}
                  >
                    {r === 'ALL' ? 'All' : r}
                  </Button>
                ))}
              </fieldset>
            </PanelTitle>
            <figure
              className="score-chart"
              aria-label="Cash capex as a percentage of operating cash flow. Accessible data in Explore the data."
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                initialDimension={{ width: 600, height: 230 }}
              >
                <AreaChart
                  data={cashHistory}
                  margin={{ left: -22, right: 8, top: 15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="score-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--foreground)"
                        stopOpacity={0.18}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--foreground)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--border)"
                    strokeDasharray="3 4"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={shortDate}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={48}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    domain={[
                      0,
                      Math.max(
                        100,
                        ...cashHistory.map((p) => p.cashAbsorption ?? 0),
                      ),
                    ]}
                    ticks={[0, 25, 50, 75, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={tip}
                    labelFormatter={(v) => date(String(v))}
                    formatter={(v) => [
                      `${Number(v).toFixed(1)}%`,
                      'Cash capex / OCF',
                    ]}
                  />
                  <ReferenceLine
                    y={100}
                    stroke="var(--border)"
                    strokeDasharray="4 4"
                  />
                  <Area
                    type="stepAfter"
                    dataKey="cashAbsorption"
                    stroke="var(--foreground)"
                    strokeWidth={2.5}
                    fill="url(#score-fill)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </figure>
            <div className="chart-foot">
              <span>
                <i className="legend-dot orange" />
                Cash capex / OCF · %
              </span>
              <button onClick={() => setView('history')}>
                Explore the data <ArrowUpRight size={13} />
              </button>
            </div>
            <p className="chart-note">
              Filings available at each date · Fixed five-company cohort
            </p>
          </article>
        </section>
        <Accordion className="research-accordion" id="retired-model">
          <AccordionItem value="retired">
            <AccordionTrigger>
              Retired accounting score: {data.score}/100 · inspect why it was
              insufficient
            </AccordionTrigger>
            <AccordionContent>
              <p>
                The arithmetic was correct, but the weights and cutoffs were
                editorial choices. Valuations could change without moving this
                score. Retained here as an audit trail; it is not the new
                price-exuberance diagnostic.
              </p>
              <section
                className="signal-strip"
                id="signals"
                aria-label="Index components"
              >
                {data.components.map((c, i) => (
                  <button
                    className="signal-cell"
                    key={c.id}
                    onClick={() => setView('methodology')}
                  >
                    <div className="signal-cell-top">
                      <span className="signal-number">0{i + 1}</span>
                      <span>{c.name}</span>
                      <ArrowUpRight size={15} />
                    </div>
                    <div className="signal-value">
                      {c.id === 'funding'
                        ? a.ocf > 0
                          ? pct(c.value ?? 0)
                          : 'N/M'
                        : c.id === 'growth'
                          ? pp(c.value ?? 0)
                          : pp(-(c.value ?? 0))}
                      <span
                        className={c.score >= 60 ? 'pill warm' : 'pill cool'}
                      >
                        {c.id === 'margins'
                          ? (c.value ?? 0) <= 0
                            ? 'Margins holding'
                            : 'Narrowing'
                          : c.score >= 60
                            ? 'Adding pressure'
                            : 'Contained'}
                      </span>
                    </div>
                    <div className="signal-explain">
                      {c.id === 'funding'
                        ? 'of operating cash absorbed by capex'
                        : c.id === 'growth'
                          ? 'capex growth minus revenue growth'
                          : 'year-over-year operating margin change'}
                    </div>
                    <div className="signal-weight">
                      <span>{Math.round(c.weight * 100)}% OF INDEX</span>
                      <div>
                        <i
                          style={{
                            width: `${c.score}%`,
                            background: 'var(--foreground)',
                          }}
                        />
                      </div>
                      <b>{Math.round(c.score)}/100</b>
                    </div>
                  </button>
                ))}
              </section>
              <DotcomCheck />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="section-heading">
          <div>
            <span className="eyebrow">UNDER THE SURFACE</span>
            <h2>The economics behind the number</h2>
          </div>
          <a
            href="/api/export"
            download="ai-bubble-monitor.csv"
            className="export-link"
          >
            <Download size={15} />
            Download data
          </a>
        </div>
        <section className="economics-grid">
          <article className="panel capital-panel">
            <PanelTitle title="The spending-to-cash-flow gap">
              <Select
                value={cohort}
                onValueChange={(v) => {
                  if (v) {
                    setCohort(v);
                    setFilter('company', v);
                  }
                }}
                items={cohorts}
              >
                <SelectTrigger aria-label="Select company">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(cohorts).map(([k, n]) => (
                    <SelectItem key={k} value={k}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PanelTitle>
            <div className="capital-totals">
              <div>
                <span>
                  <i className="legend-dot orange" />
                  Cash capex
                </span>
                <strong>{billion(selectedCapex)}</strong>
              </div>
              <div>
                <span>
                  <i className="legend-dot slate" />
                  Operating cash flow
                </span>
                <strong>{billion(selectedOcf)}</strong>
              </div>
              <p>
                Trailing 12 months
                <br />
                Company-wide totals
              </p>
            </div>
            <figure
              className="capital-chart"
              aria-label={`Cash capex ${billion(selectedCapex)} vs operating cash flow ${billion(selectedOcf)}. Exact values in company table.`}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                initialDimension={{ width: 600, height: 230 }}
              >
                <AreaChart
                  data={chart}
                  margin={{ left: -12, right: 12, top: 8, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="capex-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--foreground)"
                        stopOpacity={0.18}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--foreground)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--border)"
                    strokeDasharray="3 4"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={shortDate}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={45}
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                    dy={9}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${v}B`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={tip}
                    labelFormatter={(v) => date(String(v))}
                    formatter={(v, n) => [
                      `$${Number(v).toFixed(1)}B`,
                      n === 'capex' ? 'Cash capex' : 'Operating cash flow',
                    ]}
                  />
                  <Area
                    type="stepAfter"
                    dataKey="ocf"
                    stroke="var(--chart-2)"
                    fill="transparent"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    isAnimationActive={false}
                  />
                  <Area
                    type="stepAfter"
                    dataKey="capex"
                    stroke="var(--foreground)"
                    fill="url(#capex-fill)"
                    strokeWidth={2.5}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </figure>
            <div className="capital-insight">
              <Info size={16} />
              <span>
                {selectedOcf > 0 ? (
                  <>
                    <b>{pct(selectedCapex / selectedOcf)}</b> of operating cash
                    goes back into cash capex.
                  </>
                ) : (
                  'Operating cash flow is nonpositive.'
                )}{' '}
                Includes non-AI investment; excludes noncash lease additions.
              </span>
            </div>
          </article>
          <article className="panel readout-panel">
            <PanelTitle
              eyebrow="THE CURRENT READOUT"
              title="Three things to take away"
            />
            <div className="readout">
              <span className="readout-icon orange-icon">
                <TrendingUp size={19} />
              </span>
              <div>
                <h3>
                  {capexGrowth > revenueGrowth
                    ? 'Spending is outrunning sales'
                    : 'Revenue is keeping pace'}
                </h3>
                <p>
                  Cash capex grew <b>{pct(capexGrowth)}</b> year over year.
                  Revenue grew <b>{pct(revenueGrowth)}</b>.
                </p>
                <span>TTM VS. PRIOR TTM</span>
              </div>
            </div>
            <div className="readout">
              <span className="readout-icon green-icon">
                <ShieldCheck size={19} />
              </span>
              <div>
                <h3>
                  {marginChange >= 0
                    ? 'Margins are still holding'
                    : 'Margins are under pressure'}
                </h3>
                <p>
                  Operating margin{' '}
                  {marginChange >= 0 ? 'expanded' : 'contracted'}{' '}
                  <b>
                    {Math.abs(marginChange * 100).toFixed(2)} percentage points
                  </b>
                  .{' '}
                  {marginChange >= 0
                    ? 'That supports current operating earnings.'
                    : 'That adds to the pressure.'}
                </p>
                <span>COMPANY-WIDE PROFITABILITY</span>
              </div>
            </div>
            <div className="readout">
              <span className="readout-icon blue-icon">
                <CircleHelp size={19} />
              </span>
              <div>
                <h3>The exposure is uneven</h3>
                <p>
                  {worst.name} spends{' '}
                  <b>
                    {pct(worst.current.capex.value / worst.current.ocf.value)}
                  </b>{' '}
                  of operating cash on capex. The average hides the differences.
                </p>
                <button onClick={() => setView('company:' + worst.id)}>
                  Inspect {worst.name} <ArrowRight size={13} />
                </button>
              </div>
            </div>
            <p className="readout-note">
              Calculated from the latest available filings. No new filing means
              no new fundamental signal.
            </p>
          </article>
        </section>
        <section className="panel company-panel" id="companies">
          <PanelTitle
            eyebrow="FOLLOW THE BUILDERS"
            title="Five balance sheets. One buildout."
          >
            <span className="subtle-tag">USD · TRAILING 12 MONTHS</span>
          </PanelTitle>
          <Tabs defaultValue="investment">
            <TabsList variant="line">
              <TabsTrigger value="investment">
                Investment & cash flow
              </TabsTrigger>
              <TabsTrigger value="returns">Growth & returns</TabsTrigger>
            </TabsList>
            {['investment', 'returns'].map((mode) => (
              <TabsContent value={mode} key={mode}>
                <CompanyTable
                  companies={data.companies}
                  mode={mode}
                  open={(id) => setView('company:' + id)}
                />
              </TabsContent>
            ))}
          </Tabs>
          <div className="table-foot">
            <span>
              <Database size={13} />
              SEC EDGAR · All 5 companies covered
            </span>
            <span>
              Fiscal ends: {data.periodLabel}. Mixed periods; not AI-only.
            </span>
          </div>
        </section>
        <ResearchContext initial={context} />
        <section className="context-grid" aria-label="Research context">
          <article className="context-card">
            <p className="eyebrow">THE DEMAND SIDE</p>
            <h2>
              Adoption is real.
              <br />
              Returns take longer.
            </h2>
            <div className="context-number">
              88<span>%</span>
            </div>
            <p>
              of surveyed organizations reported using AI in 2025. Adoption is
              not paid revenue or proof of profitable deployment.
            </p>
            <SourceLink href="https://hai.stanford.edu/ai-index/2026-ai-index-report/economy">
              Stanford AI Index 2026
            </SourceLink>
            <span className="context-date">
              Annual snapshot · Separate fundamental context
            </span>
          </article>
          <article className="context-card">
            <p className="eyebrow">THE CAPABILITY SIDE</p>
            <h2>
              The technology
              <br />
              keeps improving.
            </h2>
            <div className="context-number">
              66.3<span>%</span>
            </div>
            <p>
              OSWorld computer-use benchmark accuracy in 2025, up from about
              12%. A task benchmark, not economy-wide productivity.
            </p>
            <SourceLink href="https://hai.stanford.edu/ai-index/2026-ai-index-report/technical-performance">
              Stanford technical performance
            </SourceLink>
            <span className="context-date">
              Annual snapshot · Separate fundamental context
            </span>
          </article>
          <article className="context-card coverage-card">
            <p className="eyebrow">KNOW THE BLIND SPOTS</p>
            <h2>
              A useful lens.
              <br />
              An incomplete picture.
            </h2>
            <div className="coverage-row">
              <Check size={15} />
              <span>Public company cash flows</span>
            </div>
            <div className="coverage-row">
              <Check size={15} />
              <span>Spending and earnings trends</span>
            </div>
            <div className="coverage-row missing">
              <span>—</span>
              <span>Stock-market valuations</span>
            </div>
            <div className="coverage-row missing">
              <span>—</span>
              <span>Comparable lab profits & full obligations</span>
            </div>
            <p>
              A real technology boom can coexist with financial overinvestment.
              This beta measures one part of that story.
            </p>
            <button
              className="source-link"
              onClick={() => setView('methodology')}
            >
              Read the methodology
              <ArrowUpRight size={14} />
            </button>
          </article>
        </section>
        <section className="watch-next">
          <div className="watch-heading">
            <Clock3 size={19} />
            <div>
              <p className="eyebrow">WHAT TO WATCH NEXT</p>
              <h2>The next filing matters more than the next headline.</h2>
            </div>
          </div>
          <div>
            <p>
              Watch capex guidance, cash-flow coverage, and margins in the next
              reports. New financial facts flow into the dashboard
              automatically.
            </p>
            <SourceLink href="https://www.sec.gov/search-filings">
              Follow SEC releases
            </SourceLink>
          </div>
        </section>
        <footer className="site-footer">
          <div className="footer-brand">
            <Activity size={17} />
            <b>AI BUBBLE MONITOR</b>
            <span>Evidence over narrative.</span>
          </div>
          <div>
            <button onClick={() => setView('sources')}>Sources & status</button>
            <button onClick={() => setView('methodology')}>Methodology</button>
            <button
              onClick={() => {
                void load();
                setView('archive');
              }}
            >
              Snapshots
            </button>
          </div>
          <p>
            Buildout v1 · A research heuristic, not a crash forecast. Financial
            feeds revalidate every 6 hours when visited. Research cards are
            dated snapshots.
          </p>
        </footer>
      </main>
      <Dialog
        open={!!view}
        onOpenChange={(o) => {
          if (!o) setView(null);
        }}
      >
        <DialogContent className="detail-dialog">
          <DialogTitle>
            {view?.startsWith('company:')
              ? data.companies.find((c) => c.id === view.slice(8))?.name
              : view === 'methodology'
                ? 'How bubbly? Here is the math.'
                : view === 'history'
                  ? 'Cash coverage, observation by observation'
                  : view === 'archive'
                    ? 'Saved daily snapshots'
                    : 'Sources & update status'}
          </DialogTitle>
          <DialogDescription>
            Definitions, source periods, and verification dates stay attached to
            the data.
          </DialogDescription>
          <Details view={view} data={data} snapshotDays={snapshotDays} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function CompanyTable({
  companies,
  mode,
  open,
}: {
  companies: Company[];
  mode: string;
  open: (id: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>COMPANY</TableHead>
          <TableHead>PERIOD END</TableHead>
          <TableHead>
            {mode === 'investment' ? 'CASH CAPEX' : 'REVENUE'}
          </TableHead>
          <TableHead>
            {mode === 'investment' ? 'OPERATING CASH FLOW' : 'CAPEX GROWTH'}
          </TableHead>
          <TableHead>
            {mode === 'investment' ? 'CAPEX / OCF' : 'REVENUE GROWTH'}
          </TableHead>
          <TableHead>
            {mode === 'investment' ? 'CASH-FLOW RESIDUAL' : 'OPERATING MARGIN'}
          </TableHead>
          <TableHead>
            <span className="sr-only">Details</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((c) => {
          const cur = c.current,
            prev = c.prior,
            ratio = cur.ocf.value > 0 ? cur.capex.value / cur.ocf.value : null;
          return (
            <TableRow key={c.id}>
              <TableCell>
                <button className="company-name" onClick={() => open(c.id)}>
                  <span
                    className="company-avatar"
                    style={{
                      color: 'var(--foreground)',
                      background: 'var(--muted)',
                    }}
                  >
                    {c.name[0]}
                  </span>
                  <span>
                    <b>{c.name}</b>
                    <small>{c.ticker}</small>
                  </span>
                </button>
              </TableCell>
              <TableCell className="period-cell">{shortDate(c.end)}</TableCell>
              <TableCell>
                {billion(
                  mode === 'investment' ? cur.capex.value : cur.revenue.value,
                )}
              </TableCell>
              <TableCell>
                {mode === 'investment'
                  ? billion(cur.ocf.value)
                  : pct(cur.capex.value / prev.capex.value - 1)}
              </TableCell>
              <TableCell>
                {mode === 'investment' ? (
                  <div
                    className={`ratio-cell ${ratio !== null && ratio > 1 ? 'negative' : ''}`}
                  >
                    <span>{ratio === null ? 'N/M' : pct(ratio)}</span>
                    <i>
                      <b
                        style={{
                          width: `${Math.min((ratio ?? 0) * 70, 100)}%`,
                        }}
                      />
                    </i>
                  </div>
                ) : (
                  pct(cur.revenue.value / prev.revenue.value - 1)
                )}
              </TableCell>
              <TableCell
                className={
                  mode === 'investment' && cur.ocf.value < cur.capex.value
                    ? 'negative'
                    : ''
                }
              >
                {mode === 'investment'
                  ? billion(cur.ocf.value - cur.capex.value)
                  : pct(cur.operatingIncome.value / cur.revenue.value)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Inspect ${c.name} sources`}
                  onClick={() => open(c.id)}
                >
                  <ArrowUpRight size={15} />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
