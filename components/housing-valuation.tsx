/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG chart with accessible controls and readout. */
'use client';
import { useState } from 'react';
import data from '@/data/housing-valuation.json';
export default function HousingValuation() {
  const [index, setIndex] = useState(
    data.rows.findIndex((r) => r.quarter === data.peak.quarter),
  );
  const r = data.rows[index],
    x = (i: number) => 40 + (i / (data.rows.length - 1)) * 540,
    y = (v: number) => 180 - ((v - 80) / 80) * 160;
  return (
    <details className="ab-details">
      <summary>US housing: prices relative to rents, 2000–2012</summary>
      <p>
        <strong>
          At the 2006 peak, home prices were 34% higher relative to rents than
          in early 2000.
        </strong>{' '}
        This measures the price of housing against its rental-service
        counterpart, rather than showing prices alone.
      </p>
      <svg
        viewBox="0 0 600 210"
        width="100%"
        style={{ maxHeight: 240 }}
        role="img"
        aria-label="US price-to-rent index, quarterly, 2000 Q1 equals 100"
      >
        {[80, 100, 120, 140, 160].map((v) => (
          <g key={v}>
            <line
              x1="40"
              x2="580"
              y1={y(v)}
              y2={y(v)}
              className="ab-gridline"
            />
            <text
              x="32"
              y={y(v) + 4}
              textAnchor="end"
              fill="currentColor"
              fontSize="12"
            >
              {v}
            </text>
          </g>
        ))}
        <path
          d={data.rows
            .map((r, i) => `${i ? 'L' : 'M'}${x(i)},${y(r.priceToRentIndex)}`)
            .join(' ')}
          className="ab-line"
        />
        <circle
          cx={x(index)}
          cy={y(r.priceToRentIndex)}
          r="4"
          fill="currentColor"
        />
        <text x="40" y="202" fontSize="12" fill="currentColor">
          2000 Q1
        </text>
        <text
          x="580"
          y="202"
          textAnchor="end"
          fontSize="12"
          fill="currentColor"
        >
          2012 Q4
        </text>
      </svg>
      <label>
        Choose quarter{' '}
        <input
          type="range"
          min="0"
          max={data.rows.length - 1}
          value={index}
          onChange={(e) => setIndex(+e.target.value)}
          aria-label="Housing comparison quarter"
          aria-valuetext={`${r.quarter}: price-to-rent index ${r.priceToRentIndex.toFixed(1)}`}
        />
      </label>
      <output aria-live="polite">
        <strong>
          {r.quarter}: {r.priceToRentIndex.toFixed(1)} price-to-rent index
        </strong>
        <br />
        Since 2000 Q1: home prices {(r.houseIndex - 100).toFixed(1)}%; rents{' '}
        {(r.rentIndex - 100).toFixed(1)}%. Their ratio changed{' '}
        {(r.priceToRentIndex - 100).toFixed(1)}%.
      </output>
      <p className="ab-note">
        100 means the price/rent relationship in 2000 Q1, not fair value or 100
        years’ rent. Quarterly source observations; no monthly interpolation.
        The workbook maximum is Q1 2006; the article’s event-window reference is
        Q3 2006. Neither defines the onset of the later financial crisis.
      </p>
      <p>
        AI parallel: compare asset prices with the cash-generating activity
        behind them. Earnings or rents may catch up, or prices may fall; a
        stretched ratio alone does not tell us which, or when.
      </p>
      <p className="ab-note">
        <a href={data.source}>Dallas Fed, February 2025 ↗</a> ·{' '}
        <a href={data.workbook}>Published chart workbook ↗</a>. Historical
        vintage, retrieved September 7, 2026. Rebased from the publisher’s house
        and rent indexes; ratio reconciled against its separately published
        ratio sheet. Not an individual-property rental yield.
      </p>
    </details>
  );
}
