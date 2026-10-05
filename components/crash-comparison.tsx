/* oxlint-disable next/no-html-link-for-pages, jsx-a11y/prefer-tag-over-role -- Evidence routes and inspectable SVG plots. */
'use client';
import { useEffect, useRef, useState } from 'react';
import evidence from '@/data/observatory.json';
import benchmarks from '@/data/reader-benchmarks.json';
import housing from '@/data/housing-valuation.json';
import type { Dashboard } from '@/lib/metrics';
type Row = { date: string; value: number; detail?: string };
function Plot({
  rows,
  title,
  unit,
  maximum,
  note,
  annual = false,
}: {
  rows: Row[];
  title: string;
  unit: string;
  maximum: number;
  note: string;
  annual?: boolean;
}) {
  const [index, setIndex] = useState(Math.max(0, rows.length - 1));
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(350);
  useEffect(() => {
    const observer = new ResizeObserver((entries) =>
      setWidth(entries[0].contentRect.width),
    );
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  if (!rows.length)
    return (
      <article>
        <h3>{title}</h3>
        <div
          style={{ minHeight: 210, display: 'grid', alignContent: 'center' }}
        >
          <strong>No comparable observations</strong>
          <p>{note}</p>
        </div>
      </article>
    );
  const i = Math.min(index, rows.length - 1),
    selected = rows[i];
  const time = (d: string) => Date.parse(d.length === 7 ? d + '-15' : d);
  const first = time(rows[0].date),
    last = time(rows.at(-1)!.date);
  const x = (r: Row) =>
    45 + ((width - 65) * (time(r.date) - first)) / Math.max(1, last - first);
  const top = Math.max(
    maximum,
    Math.ceil(Math.max(...rows.map((r) => r.value)) / 25) * 25,
  );
  const y = (v: number) => 160 - (140 * v) / top;
  return (
    <article>
      <h3>{title}</h3>
      <div ref={container}>
        <svg
          viewBox={`0 0 ${width} 200`}
          width="100%"
          onPointerMove={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            const pixel = ((event.clientX - box.left) * width) / box.width;
            setIndex(
              rows.reduce(
                (best, row, j) =>
                  Math.abs(x(row) - pixel) < Math.abs(x(rows[best]) - pixel)
                    ? j
                    : best,
                0,
              ),
            );
          }}
          role="img"
          aria-label={`${title}; ${unit}; use date slider for observations`}
        >
          {[0, top / 2, top].map((v) => (
            <g key={v}>
              <line
                x1="45"
                x2={width - 20}
                y1={y(v)}
                y2={y(v)}
                className="ab-gridline"
              />
              <text
                x="38"
                y={y(v) + 4}
                textAnchor="end"
                fill="currentColor"
                fontSize="13"
              >
                {v}
              </text>
            </g>
          ))}
          {!annual && (
            <path
              d={rows
                .map((r, j) => `${j ? 'L' : 'M'}${x(r)},${y(r.value)}`)
                .join(' ')}
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
            />
          )}
          {rows.map((r, j) => (
            <circle
              key={r.date}
              cx={x(r)}
              cy={y(r.value)}
              r={j === i ? 5 : annual ? 3 : 1.5}
              fill="currentColor"
            >
              <title>{`${r.date}: ${r.value.toFixed(1)}${unit}`}</title>
            </circle>
          ))}
          <text x="45" y="190" fill="currentColor" fontSize="13">
            {rows[0].date}
          </text>
          <text
            x={width - 20}
            y="190"
            textAnchor="end"
            fill="currentColor"
            fontSize="13"
          >
            {rows.at(-1)!.date}
          </text>
        </svg>
      </div>
      <label>
        {title} date
        <input
          aria-label={`${title} date`}
          type="range"
          min="0"
          max={rows.length - 1}
          value={i}
          onChange={(e) => setIndex(+e.target.value)}
        />
      </label>
      <output aria-live="polite">
        <strong>
          {selected.date} · {selected.value.toFixed(1)}
          {unit}
        </strong>
        {selected.detail && (
          <>
            <br />
            {selected.detail}
          </>
        )}
      </output>
      <p className="ab-note">{note}</p>
    </article>
  );
}
export default function CrashComparison({ data }: { data: Dashboard }) {
  const [id, setId] = useState('dotcom2000');
  const cases = [...evidence.cases, evidence.ai];
  const current = cases.find((c) => c.id === id)!;
  const price = current.points
    .filter((p) => p.price != null)
    .map((p) => ({ date: p.date, value: p.price! }));
  const valuation: Row[] =
    id === 'housing2006'
      ? housing.rows
          .filter((r) => r.date >= '2004-07' && r.date <= '2008-07-31')
          .map((r) => ({ date: r.date, value: r.priceToRentIndex }))
      : current.valuations
          .filter((r) => r.pe != null)
          .map((r) => ({ date: r.date, value: r.pe! }));
  const investment: Row[] =
    id === 'ai-current'
      ? data.history.map((r) => ({
          date: r.date,
          value: (100 * r.capex) / r.ocf,
          detail: `$${(r.capex / 1e9).toFixed(1)}B cash capex / $${(r.ocf / 1e9).toFixed(1)}B operating cash`,
        }))
      : id === 'dotcom2000'
        ? benchmarks.dotcom.series.map((r) => ({
            date: `${r.fiscalYear}-12-31`,
            value: 100 * r.capexToOCF,
            detail: `FY${r.fiscalYear}: Microsoft ends ${r.periodEnds.MSFT}; Intel ends ${r.periodEnds.INTC}. $${(r.capex / 1e9).toFixed(2)}B / $${(r.ocf / 1e9).toFixed(2)}B.`,
          }))
        : [];
  const noEarnings = ['gold1980', 'bitcoin2017', 'bitcoin2021'].includes(id);
  return (
    <section className="ab-section" id="compare-crashes">
      <div className="ab-section-title">
        <h2>One comparison view. Ten historical crashes.</h2>
        <label className="ab-select">
          Compare episode{' '}
          <select
            aria-label="Compare episode"
            value={id}
            onChange={(e) => setId(e.target.value)}
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        onClick={() => setId(id === 'ai-current' ? 'dotcom2000' : 'ai-current')}
      >
        {id === 'ai-current' ? 'Compare with dot-com' : 'Show AI today'}
      </button>
      <p>
        <strong>{current.name}</strong> · Price reference {current.anchor} =
        100. Historical reference months are selected in hindsight; AI’s latest
        month is not an assumed peak. Dates below remain actual calendar dates,
        and accounting windows differ.
      </p>
      <div className="ab-three" key={id}>
        <Plot
          title="1. Asset price"
          rows={price}
          unit=" index points"
          maximum={150}
          note={`${current.priceLabel}. Shows the price path, not whether earnings justified it. ${current.note}`}
        />
        <Plot
          title="2. Price relative to income"
          rows={valuation}
          unit={id === 'housing2006' ? ' price/rent index' : '× P/E'}
          maximum={id === 'housing2006' ? 160 : 100}
          annual={['japan1989', 'china2007', 'china2015'].includes(id)}
          note={
            id === 'housing2006'
              ? 'US house-price/rent index, 2000 Q1=100; not P/E or years of rent. Same-source Dallas Fed series.'
              : noEarnings
                ? 'The asset itself has no corporate earnings. P/E is inapplicable; producer-company earnings would describe a different asset.'
                : `${current.valuationLabel}. ${current.valuationCadence}; sparse annual observations are not interpolated. For dot-com and AI this is broad US equity context, not Nasdaq or AI-only earnings.`
          }
        />
        <Plot
          title="3. Investment / operating cash"
          rows={investment}
          unit="¢ per $1"
          maximum={125}
          annual={id === 'dotcom2000'}
          note={
            id === 'dotcom2000'
              ? 'MSFT + Intel survivor cohort, annual fiscal accounts. December positions group fiscal-year labels, not simultaneous reporting dates. Omits failed telecom firms; not the same cohort as AI.'
              : id === 'ai-current'
                ? 'Five builders, whole-company trailing cash accounts at each information snapshot. Above 100¢ needs reserves or external funding before distributions.'
                : 'A matched investment/operating-cash series has not been acquired for this episode. Missing is not zero; no synthetic curve is substituted.'
          }
        />
      </div>
      <details className="ab-details">
        <summary>Who carried losses—and what is comparable?</summary>
        <p>{current.risk.direct}</p>
        <p>{current.risk.transmission}</p>
        <p>
          Chart positions use actual dates. Price axes share 0–150 unless the
          data exceed it; P/E axes share 0–100; cash investment axes share
          0–125¢. Housing uses its own index units. These are historical
          illustrations, not evidence of forecast accuracy.
        </p>
        <a href={current.source}>Price source ↗</a> ·{' '}
        <a href="/appendix#case-data">
          All case sources and accounting limits ↗
        </a>{' '}
        · <a href={housing.source}>Housing ratio source ↗</a>
      </details>
    </section>
  );
}
