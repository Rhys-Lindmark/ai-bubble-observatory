import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseRates, parseNvidia } from '../lib/context.ts';
import { scoreAggregate } from '../lib/metrics.ts';
const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');
const h15 = read('./fixtures/h15.html');
const nvidia = JSON.parse(read('./fixtures/nvidia.json'));
const asOf = '2026-09-06T20:00:00.000Z';
test('H.15 selects same-day nominal and real 10-year yields, not release date or other maturities', () => {
  const r = parseRates(h15, asOf);
  assert.equal(r.observed, '2026-09-03');
  assert.equal(r.nominal, 4.77);
  assert.equal(r.real, 2.42);
});
test('H.15 missing latest values fall back to latest common day; never parse missing as zero', () => {
  const modified = h15.replace(
    /(<td\b[^>]*headers="[^"]*\bcol5\b[^"]*"[^>]*>)[\s\S]*?(<\/td>)/g,
    '$1n.a.$2',
  );
  const r = parseRates(modified, asOf);
  assert.equal(r.observed, '2026-09-02');
  assert.equal(r.nominal, 4.79);
  assert.equal(r.real, 2.45);
  assert.throws(
    () => parseRates(h15.replace(/10-year/g, 'ten-year'), asOf),
    /No matching/,
  );
  assert.equal(parseRates(h15, '2026-09-01T00:00:00Z').observed, '2026-09-01');
});
test('Nvidia TTM matches independently reconciled annual + YTD figures', () => {
  const n = parseNvidia(nvidia, asOf);
  assert.equal(n.periodEnd, '2026-07-26');
  assert.equal(n.filed, '2026-08-26');
  assert.equal(n.revenue, 302970000000);
  assert.equal(n.ocf, 134360000000);
  assert.equal(n.grossMargin, 226241000000 / 302970000000);
});
test('Nvidia rejects partial new periods and ignores future filings', () => {
  const raw = structuredClone(nvidia);
  raw.facts['us-gaap'].Revenues.units.USD.push({
    start: '2026-07-27',
    end: '2026-10-25',
    val: 1,
    filed: '2026-11-20',
    accn: 'later',
    form: '10-Q',
  });
  assert.equal(parseNvidia(raw, asOf).periodEnd, '2026-07-26');
  assert.throws(() => parseNvidia(raw, '2026-12-01'), /Incomplete/);
});
test('Dot-com original formula reproduces all six scores from paired report-vintage inputs', () => {
  const d = JSON.parse(read('../data/dotcom.json'));
  const observations = d.observations.filter(
    (o: { year: number }) => o.year >= 1998 && o.year <= 2003,
  );
  assert.deepEqual(
    observations.map((o: { index: number }) => o.index),
    [11, 0, 41, 44, 0, 0],
  );
  for (const o of observations) {
    const c = o.aggregate,
      p = o.priorAggregateSameVintage;
    const result = scoreAggregate({
      revenue: c.revenue,
      operatingIncome: c.operatingIncome,
      capex: c.cashCapex,
      ocf: c.operatingCashFlow,
      priorRevenue: p.revenue,
      priorOperatingIncome: p.operatingIncome,
      priorCapex: p.cashCapex,
      priorOcf: p.operatingCashFlow,
    });
    assert.equal(result.score, o.index, `FY${o.year}`);
    const rows = d.rows.filter(
      (r: { fiscalYear: number }) => r.fiscalYear === o.year,
    );
    assert.equal(rows.length, 2);
    for (const [field, metric] of [
      ['revenue', 'revenue'],
      ['operatingIncome', 'operatingIncome'],
      ['cashCapex', 'cashCapex'],
      ['operatingCashFlow', 'operatingCashFlow'],
    ]) {
      assert.equal(
        rows.reduce((s: number, r: Record<string, number>) => s + r[field], 0),
        c[metric],
      );
      assert.equal(
        rows.reduce(
          (s: number, r: { priorYearComparative: Record<string, number> }) =>
            s + r.priorYearComparative[field],
          0,
        ),
        p[metric],
      );
    }
  }
});
