/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Inspectable SVG with keyboard date control. */
'use client';
import { useState } from 'react';
import data from '@/data/ramp-spending.json';
export default function RampSpending() {
  const [index, setIndex] = useState(data.rows.length - 1);
  const rows = data.rows,
    selected = rows[index],
    latest = rows.at(-1)!;
  const prior = rows.find((r) => r.date === '2025-07')!;
  const x = (i: number) => 35 + (i * 330) / (rows.length - 1),
    y = (v: number) => 125 - v * 9;
  return (
    <section id="paid-spending">
      <h4>Spending depth: $11.95 per employee per month</h4>
      <p>
        Ramp’s reported median, July 2026:{' '}
        <strong>
          {(latest.median / prior.median).toFixed(1)}× July 2025’s $
          {prior.median.toFixed(2)}
        </strong>
        . Spending per employee is growing in this sample; it does not establish
        supplier profitability.
      </p>
      <svg
        viewBox="0 0 390 160"
        width="100%"
        role="img"
        aria-label="Ramp median monthly AI spending per employee. Use the date slider for exact values."
        onPointerMove={(e) => {
          const b = e.currentTarget.getBoundingClientRect();
          setIndex(
            Math.max(
              0,
              Math.min(
                rows.length - 1,
                Math.round(
                  ((((e.clientX - b.left) / b.width) * 390 - 35) / 330) *
                    (rows.length - 1),
                ),
              ),
            ),
          );
        }}
      >
        {[0, 6, 12].map((v) => (
          <g key={v}>
            <line
              x1="35"
              x2="365"
              y1={y(v)}
              y2={y(v)}
              className="ab-gridline"
            />
            <text
              x="29"
              y={y(v) + 4}
              textAnchor="end"
              fill="currentColor"
              fontSize="12"
            >
              ${v}
            </text>
          </g>
        ))}
        <path
          d={rows
            .map((r, i) => `${i ? 'L' : 'M'}${x(i)},${y(r.median)}`)
            .join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx={x(index)}
          cy={y(selected.median)}
          r="4"
          fill="currentColor"
        />
        <text x="35" y="150" fill="currentColor" fontSize="12">
          Aug 2023
        </text>
        <text
          x="365"
          y="150"
          fill="currentColor"
          fontSize="12"
          textAnchor="end"
        >
          Jul 2026
        </text>
      </svg>
      <label>
        Inspect spending month
        <input
          type="range"
          min="0"
          max={rows.length - 1}
          value={index}
          aria-label="Paid spending month"
          onChange={(e) => setIndex(+e.target.value)}
        />
      </label>
      <p aria-live="polite">
        <strong>
          {selected.date} · ${selected.median.toFixed(2)} per employee per month
        </strong>
      </p>
      <p className="ab-note">
        <a href={data.source}>Ramp chart and data ↗</a> · published August 12;
        checked September 7. Includes subscriptions, coding agents, API tokens
        and GPU cloud spending. Not all US businesses, a same-firm retention
        measure or pure end-customer demand. Do not add it to lab or cloud
        revenue. A broader sample spending more would strengthen the demand
        case; weaker spending or margins would weaken payback.
      </p>
    </section>
  );
}
