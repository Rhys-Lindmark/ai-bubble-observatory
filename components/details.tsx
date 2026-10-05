'use client';
import { useState } from 'react';
import { Database, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { pressureLabel, type Dashboard as Data } from '@/lib/metrics';
import { billion, date, SourceLink } from './dashboard';

export function Details({
  view,
  data,
  snapshotDays,
}: {
  view: string | null;
  data: Data;
  snapshotDays: string[];
}) {
  const [archive, setArchive] = useState<Data | null>(null),
    [error, setError] = useState('');
  if (view === 'methodology')
    return (
      <div className="methodology">
        <h3>Two separate measures</h3>
        <p>
          The headline is a frozen, experimental price-exuberance percentile
          based on public-industry market data. Its formula, ten-case benchmark,
          contrast windows, and simulations appear in the research section. It
          is not a bubble/crash probability and is manually recomputed. The
          automatically updated SEC section shows cash capex divided by
          operating cash flow, without score weights or caps.
        </p>
        <h3>Retired accounting model: retained for audit</h3>
        <div className="method-score">
          <strong>
            {data.score}
            <small>/100</small>
          </strong>
          <span>
            {pressureLabel(data.score)}
            <br />
            <small>BUILDOUT V1 · RETIRED</small>
          </span>
        </div>
        <p>
          The retired buildout-pressure index tracked <b>buildout pressure</b>{' '}
          across Microsoft, Alphabet, Amazon, Meta, and Oracle. It does not
          measure crash probability, stock overvaluation, or time until a bubble
          pops.
        </p>
        {data.components.map((c) => (
          <div className="formula-row" key={c.id}>
            <div>
              <h3>{c.name}</h3>
              <p>{c.definition}</p>
            </div>
            <strong>
              {Math.round(c.score)} × {c.weight.toFixed(2)}
              <small>{(c.score * c.weight).toFixed(1)} points</small>
            </strong>
          </div>
        ))}
        <div className="method-callout">
          Index = round(0.40 × cash-flow pressure + 0.35 × growth gap + 0.25 ×
          margin compression). Each component is clipped to 0–100 before
          weighting; displayed component scores are rounded only for
          readability.
        </div>
        <h3>Original, unvalidated bands</h3>
        <p>
          0–19: low pressure · 20–39: warming up · 40–59: building pressure ·
          60–79: elevated · 80–100: very elevated. These retired bands and
          weights were editorial choices, not calibrated crash thresholds. The
          components overlap; they are not independent estimates of risk.
        </p>
        <h3>Historical check: a low / late signal</h3>
        <p>
          The unchanged formula scores Microsoft and Intel 0 in FY1999 and peaks
          at 44 in FY2001. This limited retrospective check does not validate an
          early warning. It uses two surviving incumbents, mixed fiscal ends,
          and some later comparative reports; it is not a point-in-time
          backtest. Rates, energy, labs, and Nvidia are separate context,
          excluded from the score.
        </p>
        <h3>Accounting choices</h3>
        <p>
          Ratios use the sum of the five companies’ values, not an average of
          company ratios. Cash capex excludes noncash finance-lease additions.
          Amazon uses “payments to acquire productive assets.” All companies
          include non-AI businesses. The cash-flow residual is OCF minus cash
          capex and may differ from company-reported free cash flow.
        </p>
        <p>
          TTM uses an annual value or prior fiscal year plus current
          year-to-date minus prior year-to-date. The latest fiscal ends are{' '}
          {data.periodLabel}; the cohort combines nearby fiscal periods. Every
          company detail shows the original values and dates.
        </p>
        <h3>History and uncertainty</h3>
        <p>
          The current AI chart’s historical points only use facts filed by that
          date. This fixed cohort was chosen today: the reconstruction is not an
          investable historical strategy or a backtested forecasting model.
          Corrections can change reconstructed history; saved daily snapshots
          preserve what this site published.
        </p>
        <p>
          Rising capex can reflect rational investment in real demand. Stock
          valuations, private-company burn, contract-level obligations, and
          economy-wide causal estimates are not included. If all five companies
          cannot be reconciled, the previous verified accounting snapshot stays
          visible.
        </p>
        <SourceLink href="https://www.bis.org/publications/bulletin-120-financing-ai-boom-cash-flows-debt">
          Context: BIS on financing the AI boom
        </SourceLink>
      </div>
    );
  if (view === 'sources')
    return (
      <div className="sources-detail">
        <div className="status-summary">
          <Database size={20} />
          <div>
            <b>
              {data.failures.length
                ? 'Last verified snapshot'
                : 'Connected financial sources'}
            </b>
            <p>
              Oldest source check: {date(data.checkedAt)}. Last attempt:{' '}
              {new Date(data.lastAttemptAt).toLocaleString('en-US', {
                timeZone: 'UTC',
              })}{' '}
              UTC.
            </p>
          </div>
        </div>
        <p>
          Visits trigger server-side source checks at most every six hours. The
          page polls for completed checks while open. Failed checks retry after
          30 minutes and retain previous values. No creator laptop is needed.
          Values change with filings, not every day.
        </p>
        {data.failures.length > 0 && (
          <div className="method-callout">
            <b>Current source issues</b>
            {data.failures.map((f) => (
              <p key={f}>{f}</p>
            ))}
          </div>
        )}
        {data.companies.map((c) => (
          <div className="source-record" key={c.id}>
            <div>
              <h3>{c.name}</h3>
              <p>
                TTM ended {date(c.end)} · latest input filed {date(c.filed)}
                <br />
                Verified {date(c.checkedAt)}
              </p>
            </div>
            <SourceLink href={c.sourceUrl}>SEC facts</SourceLink>
          </div>
        ))}
        <h3>Research context</h3>
        <p>
          The Stanford cards are annual, manually selected research snapshots.
          They do not auto-refresh and do not affect the price diagnostic. Read
          the reports for survey scope and benchmark methodology.
        </p>
        <SourceLink href="https://hai.stanford.edu/ai-index/2026-ai-index-report">
          Stanford AI Index 2026
        </SourceLink>
        <h3>Reuse</h3>
        <p>
          The CSV exports normalized SEC financial facts, dates, and source
          links. It excludes third-party research data and licensed market
          prices. Missing observations are never represented as zero.
        </p>
      </div>
    );
  if (view === 'history')
    return (
      <div>
        <p className="detail-note">
          As known at each observation date. Dollar values are trailing 12-month
          totals, combining nearby fiscal periods.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>As known on</TableHead>
              <TableHead>Capex / OCF</TableHead>
              <TableHead>Cash capex</TableHead>
              <TableHead>OCF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...data.history].reverse().map((p) => (
              <TableRow key={p.date}>
                <TableCell>{date(p.date)}</TableCell>
                <TableCell>
                  {p.ocf > 0
                    ? `${((p.capex / p.ocf) * 100).toFixed(1)}%`
                    : 'N/M'}
                </TableCell>
                <TableCell>{billion(p.capex)}</TableCell>
                <TableCell>{billion(p.ocf)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  if (view === 'archive')
    return (
      <div>
        <p>
          Daily snapshots are retained after successful source checks. Prelaunch
          history is reconstructed separately.
        </p>
        {snapshotDays.length === 0 ? (
          <p>The first snapshot appears after a successful refresh.</p>
        ) : (
          <div className="snapshot-list">
            {snapshotDays.map((day) => (
              <Button
                variant="outline"
                key={day}
                onClick={async () => {
                  setError('');
                  try {
                    const r = await fetch(`/api/dashboard?snapshot=${day}`);
                    if (!r.ok) throw new Error();
                    setArchive(await r.json());
                  } catch {
                    setError(
                      'Could not load the selected snapshot. Please try again.',
                    );
                  }
                }}
              >
                {date(day)}
                <ChevronRight size={14} />
              </Button>
            ))}
          </div>
        )}
        {error && <p role="alert">{error}</p>}
        {archive && (
          <div className="method-callout">
            <h3>
              {date(archive.asOf)} · Retired accounting score {archive.score}
              /100
            </h3>
            <p>
              Cash capex {billion(archive.aggregate.capex)} · OCF{' '}
              {billion(archive.aggregate.ocf)}
              <br />
              Methodology: {archive.methodology}. Source check:{' '}
              {date(archive.checkedAt)}.
            </p>
          </div>
        )}
      </div>
    );
  const c = view?.startsWith('company:')
    ? data.companies.find((c) => c.id === view.slice(8))
    : null;
  if (!c) return null;
  return (
    <div className="company-detail">
      <div className="detail-metrics">
        <div>
          <span>Cash capex</span>
          <strong>{billion(c.current.capex.value)}</strong>
        </div>
        <div>
          <span>Operating cash flow</span>
          <strong>{billion(c.current.ocf.value)}</strong>
        </div>
      </div>
      <p>
        Trailing 12 months ended <b>{date(c.end)}</b>. Consolidated company
        investment, not isolated AI spending.{' '}
        {c.id === 'amazon'
          ? 'Amazon reports purchases of productive assets.'
          : 'Cash purchases of property, plant and equipment.'}{' '}
        Noncash lease additions are excluded.
      </p>
      {Object.entries(c.current).map(([metric, flow]) => (
        <div className="fact-section" key={metric}>
          <h3>
            {metric === 'ocf'
              ? 'Operating cash flow'
              : metric === 'capex'
                ? 'Cash capex'
                : metric === 'operatingIncome'
                  ? 'Operating income'
                  : 'Revenue'}{' '}
            · {billion(flow.value)}
          </h3>
          <p>
            {flow.facts.length === 1
              ? 'Reported annual value'
              : 'TTM = prior annual + current YTD − prior YTD'}
          </p>
          {flow.facts.map((f, i) => (
            <div className="fact-row" key={f.accn + f.start + f.end}>
              <span>
                <b>
                  {flow.facts.length === 1
                    ? 'Annual'
                    : i === 0
                      ? 'Prior annual'
                      : i === 1
                        ? '+ Current YTD'
                        : '− Prior YTD'}
                </b>
                <br />
                {f.start} → {f.end}
                <br />
                <small>{f.tag}</small>
              </span>
              <span>
                {billion(f.val)}
                <br />
                <SourceLink
                  href={`https://www.sec.gov/Archives/edgar/data/${Number(c.cik)}/${f.accn.replaceAll('-', '')}/${f.accn}-index.html`}
                >
                  Filed {f.filed}
                </SourceLink>
              </span>
            </div>
          ))}
        </div>
      ))}
      <SourceLink href={c.sourceUrl}>Full SEC company facts</SourceLink>
    </div>
  );
}
