/* oxlint-disable next/no-html-link-for-pages -- Links to research sources and appendix. */
'use client';
import { useState } from 'react';
import evidence from '@/data/reader-benchmarks.json';
import type { Aggregate } from '@/lib/metrics';
const money = (v: number) => `$${(v / 1e9).toFixed(1)}B`;
export default function HistoricalCash({ current }: { current: Aggregate }) {
  const [year, setYear] = useState(2000);
  const row = evidence.dotcom.series.find((r) => r.fiscalYear === year)!;
  const g = row.growth;
  return (
    <details className="ab-details">
      <summary>
        Dot-com cash flows: what happened when spending outran growth?
      </summary>
      <p>
        Microsoft + Intel, fiscal 1996–2003. Two surviving companies, not the
        dot-com sector or failed telecom builders. Each bar is capital spending
        per operating-cash dollar.
      </p>
      <div className="ab-historical-bars">
        {evidence.dotcom.series.map((r) => (
          <button
            key={r.fiscalYear}
            aria-pressed={year === r.fiscalYear}
            onClick={() => setYear(r.fiscalYear)}
          >
            <span>FY{r.fiscalYear}</span>
            <span className="ab-bar-track">
              <span style={{ width: `${r.capexToOCF * 100}%` }} />
            </span>
            <b>{(r.capexToOCF * 100).toFixed(0)}¢</b>
          </button>
        ))}
      </div>
      <p className="ab-note">
        Common scale: 0–100¢ per $1 of operating cash. Click a fiscal year for
        the actual accounts. The chart does not align observations to a
        retrospectively selected stock-market peak.
      </p>
      <output aria-live="polite">
        <strong>
          FY{year}: {money(row.capex)} capital spending / {money(row.ocf)}{' '}
          operating cash
        </strong>
        <br />
        {money(row.revenue)} revenue.{' '}
        {g
          ? `Year-over-year changes: spending ${(g.capex * 100).toFixed(0)}%, operating cash ${(g.ocf * 100).toFixed(0)}%, revenue ${(g.revenue * 100).toFixed(0)}%.`
          : 'No prior year in this acquired sample.'}
      </output>
      <p className="ab-note">
        Fiscal endpoints: Microsoft {row.periodEnds.MSFT}; Intel{' '}
        {row.periodEnds.INTC}. Annual windows differ and include information
        reported after the market peak.{' '}
        <a href="/appendix#historical-cash">Company accounts & provenance ↗</a>
      </p>
      <div className="ab-three">
        <p>
          <strong>The stress in 2001:</strong> spending still rose 11%, while
          operating cash fell 18% and revenue fell 9%. More of each cash dollar
          went into investment.
        </p>
        <p>
          <strong>Today’s five builders:</strong>{' '}
          {((current.capex / current.ocf) * 100).toFixed(0)}¢ per $1 cash;
          spending changed{' '}
          {((current.capex / current.priorCapex - 1) * 100).toFixed(0)}%,
          operating cash{' '}
          {((current.ocf / current.priorOcf - 1) * 100).toFixed(0)}%, revenue{' '}
          {((current.revenue / current.priorRevenue - 1) * 100).toFixed(0)}%.
        </p>
        <p>
          <strong>What transfers:</strong> falling cash generation alongside
          committed spending can squeeze funding. The different company mix and
          infrastructure intensity prevent treating 38¢ then as a crash
          threshold for 82¢ today.
        </p>
      </div>
    </details>
  );
}
export function HistoricalCashSources() {
  return (
    <section id="historical-cash" className="ab-section ab-page">
      <h2>Historical cash accounts and comparison limits</h2>
      <p>
        Annual fiscal accounts, two-company survivor sample. Fiscal labels do
        not synchronize calendar windows. Figures are retrospective
        reconstructions, not a point-in-time prediction test. Pooled ratio is
        total cash capex divided by total operating cash, never an average of
        company ratios.
      </p>
      <div className="ob-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Company / fiscal end</th>
              <th>Capex</th>
              <th>Operating cash</th>
              <th>Revenue</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {evidence.dotcom.companySeries.map((r) => (
              <tr key={r.company + r.periodEnd}>
                <td>
                  {r.company} · {r.periodEnd}
                </td>
                <td>{money(r.cashCapex)}</td>
                <td>{money(r.ocf)}</td>
                <td>{money(r.revenue)}</td>
                <td>
                  {r.sources.map((s, i) => (
                    <a key={s.url} href={s.url}>
                      {i === 0 ? 'Income' : 'Cash flows'} ↗{' '}
                    </a>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        These companies omit bankruptcies and many capital-intensive telecom
        firms. The comparison illustrates cash pressure, not historical crash
        detection accuracy. Revenue and operating cash have different accounting
        meanings; neither is a direct measure of customer economic benefit.
      </p>
    </section>
  );
}
