/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG with keyboard inspection. */
'use client';
import { useEffect, useRef, useState } from 'react';
import type { Series } from '@/lib/comparison-data';
export default function ComparisonPlot({
  series,
  label,
  unit,
  years = 4,
  reference,
  logarithmic = false,
  calendarStart,
}: {
  series: Series[];
  label: string;
  unit: string;
  years?: number;
  reference?: number;
  logarithmic?: boolean;
  calendarStart?: number;
}) {
  const [month, setMonth] = useState(
      years > 10
        ? Math.round(
            Math.max(...series.flatMap((s) => s.points.map((p) => p.x))) * 12,
          )
        : 24,
    ),
    ref = useRef<HTMLDivElement>(null),
    [width, setWidth] = useState(600);
  useEffect(() => {
    const o = new ResizeObserver((e) => setWidth(e[0].contentRect.width));
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  const available = series.filter((s) => s.points.length),
    maximum = Math.max(
      reference ?? 0,
      1,
      ...available.flatMap((s) =>
        s.points.filter((p) => p.x >= 0 && p.x <= years).map((p) => p.value),
      ),
    );
  const minValue = Math.min(
    ...available
      .flatMap((s) => s.points.map((p) => p.value))
      .filter((v) => v > 0),
  );
  const logLow = Math.floor(Math.log10(minValue || 1));
  const logHigh = Math.max(logLow + 1, Math.ceil(Math.log10(maximum)));
  const top = Math.ceil(maximum / 5) * 5,
    left = 45,
    right = 15,
    bottom = 210,
    x = (v: number) => left + ((width - left - right) * v) / years,
    y = (v: number) =>
      bottom -
      190 *
        (logarithmic ? (Math.log10(v) - logLow) / (logHigh - logLow) : v / top);
  const ticks = logarithmic
    ? Array.from({ length: logHigh - logLow + 1 }, (_, i) => 10 ** (logLow + i))
    : [0, top / 2, top];
  const chosen = Math.min(month, years * 12) / 12;
  return (
    <div ref={ref}>
      <p className="ab-note">
        {unit}
        {logarithmic
          ? ' · log scale: equal vertical steps = equal multiples'
          : ''}
      </p>
      {!available.length ? (
        <p className="comparison-empty">
          No matched observations for these selections. Missing data are not
          zero.
        </p>
      ) : (
        <>
          <svg
            width="100%"
            height="245"
            role="img"
            aria-label={label}
            onPointerMove={(e) => {
              const b = e.currentTarget.getBoundingClientRect();
              setMonth(
                Math.max(
                  0,
                  Math.min(
                    years * 12,
                    Math.round(
                      ((e.clientX - b.left - left) / (width - left - right)) *
                        years *
                        12,
                    ),
                  ),
                ),
              );
            }}
          >
            {ticks.map((v) => (
              <g key={v}>
                <line
                  x1={left}
                  x2={width - right}
                  y1={y(v)}
                  y2={y(v)}
                  className="ab-gridline"
                />
                <text
                  x={left - 6}
                  y={y(v) + 4}
                  textAnchor="end"
                  fill="currentColor"
                  fontSize="12"
                >
                  {v >= 1000
                    ? (v / 1000).toFixed(1) + 'k'
                    : v.toFixed(v % 1 ? 1 : 0)}
                </text>
              </g>
            ))}
            {reference !== undefined && (
              <line
                x1={left}
                x2={width - right}
                y1={y(reference)}
                y2={y(reference)}
                className="ab-reference"
              />
            )}
            {available.map((s) => {
              const p = s.points.filter((r) => r.x >= 0 && r.x <= years);
              return (
                <g key={s.id}>
                  {!s.sparse && (
                    <path
                      d={p
                        .map(
                          (r, i) => `${i ? 'L' : 'M'}${x(r.x)},${y(r.value)}`,
                        )
                        .join(' ')}
                      stroke={s.color}
                      strokeWidth={s.id.includes('ai') ? 3 : 2}
                      strokeDasharray={s.dash ? '6 4' : undefined}
                      fill="none"
                    />
                  )}
                  {p.map((r, i) => (
                    <circle
                      key={i}
                      cx={x(r.x)}
                      cy={y(r.value)}
                      r={s.sparse ? 3 : 1.6}
                      fill={s.dash ? 'var(--background)' : s.color}
                      stroke={s.color}
                      strokeWidth={s.dash ? 2 : 0}
                    >
                      <title>
                        {`${s.name}: ${r.date}, ${r.value.toFixed(2)} ${unit}`}
                      </title>
                    </circle>
                  ))}
                </g>
              );
            })}
            <line
              x1={x(chosen)}
              x2={x(chosen)}
              y1="20"
              y2={bottom}
              className="ab-reference"
            />
            {[0, years / 2, years].map((v) => (
              <text
                key={v}
                x={x(v)}
                y="237"
                textAnchor={v === 0 ? 'start' : v === years ? 'end' : 'middle'}
                fill="currentColor"
                fontSize="12"
              >
                {calendarStart ? String(calendarStart + v) : `Year ${v}`}
              </text>
            ))}
          </svg>
          <label className="comparison-inspect">
            {calendarStart
              ? 'Inspect calendar date'
              : 'Inspect years from selected start'}
            <input
              aria-label={`${label} month`}
              type="range"
              min="0"
              max={years * 12}
              value={Math.min(month, years * 12)}
              onChange={(e) => setMonth(+e.target.value)}
            />
          </label>
          <div className="comparison-readouts" aria-live="polite">
            {available.map((s) => {
              const p = s.points.reduce((a, b) =>
                Math.abs(a.x - chosen) < Math.abs(b.x - chosen) ? a : b,
              );
              const close = Math.abs(p.x - chosen) <= (s.sparse ? 0.51 : 0.26);
              return (
                <span key={s.id}>
                  <i style={{ background: s.color }} />
                  <b>{s.name}</b>{' '}
                  {close
                    ? `${p.value.toFixed(1)} ${unit} · ${p.date}`
                    : 'No observation near this date'}
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
