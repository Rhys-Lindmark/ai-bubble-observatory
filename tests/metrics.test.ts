import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ttm,
  buildDashboard,
  companyAt,
  scoreAggregate,
  normalize,
  type Fact,
  type Source,
  type Aggregate,
} from '../lib/metrics.ts';
const sources = JSON.parse(
  readFileSync(new URL('../data/sources.json', import.meta.url), 'utf8'),
) as Source[];
const now = '2026-09-06T19:30:00.000Z';
const fact = (
  start: string,
  end: string,
  val: number,
  filed = '2026-08-01',
): Fact => ({ start, end, val, filed, accn: 'test', tag: 'test' });
test('annual + current YTD − previous YTD; never sum cumulative quarters', () => {
  const f = [
    fact('2025-01-01', '2025-12-31', 100),
    fact('2026-01-01', '2026-03-31', 60),
    fact('2026-01-01', '2026-06-30', 140),
    fact('2025-01-01', '2025-06-30', 40),
  ];
  assert.equal(ttm(f, '2026-06-30')?.value, 200);
  assert.equal(ttm(f, '2025-12-31')?.value, 100);
  assert.equal(ttm(f, '2026-03-31'), null);
});
test('independent five-company reconciliation of all current and prior aggregates', () => {
  const d = buildDashboard(sources, now);
  assert.deepEqual(d.aggregate, {
    capex: 566366000000,
    ocf: 692291000000,
    revenue: 1848989000000,
    operatingIncome: 504109000000,
    priorCapex: 312564000000,
    priorRevenue: 1559364000000,
    priorOperatingIncome: 422478000000,
    priorOcf: 514127000000,
  });
  assert.equal(d.score, 65);
  assert.equal(d.companies.length, 5);
  assert.equal(d.companies.find((c) => c.id === 'oracle')?.end, '2026-05-31');
});
test('historical values never read future filings; all history retains full cohort', () => {
  const d = buildDashboard(sources, now);
  assert.ok(d.history.length >= 20);
  for (const p of d.history) {
    assert.equal(Object.keys(p.companies).length, 5);
    for (const s of sources) {
      const c = companyAt(s, p.date);
      assert.ok(c);
      for (const flow of [
        ...Object.values(c.current),
        ...Object.values(c.prior),
      ])
        for (const f of flow.facts) assert.ok(f.filed <= p.date);
    }
  }
});
test('future restatement cannot change earlier historical results', () => {
  const original = sources[0],
    changed = structuredClone(original);
  const annual = changed.facts.capex.find(
    (f) => f.start === '2024-07-01' && f.end === '2025-06-30',
  )!;
  changed.facts.capex.push({
    ...annual,
    val: 999999999999,
    filed: '2027-01-01',
  });
  assert.deepEqual(
    companyAt(changed, '2026-09-06'),
    companyAt(original, '2026-09-06'),
  );
});
test('partial filing cannot silently roll a company back to an older quarter', () => {
  const broken = structuredClone(sources);
  broken[1].facts.operatingIncome = broken[1].facts.operatingIncome.filter(
    (f) => f.end <= '2025-12-31',
  );
  assert.equal(companyAt(broken[1], '2026-09-06'), null);
  assert.throws(() => buildDashboard(broken, now), /all five/);
});
test('missing peer fails closed instead of changing score weights', () => {
  assert.throws(() => buildDashboard(sources.slice(0, 4), now), /all five/);
});
test('old financial periods carry an explicit age warning even after a successful fetch', () => {
  const d = buildDashboard(sources, '2027-09-06T12:00:00Z');
  assert.equal(d.failures.length, 5);
  assert.ok(d.failures.every((f) => f.includes('150 days')));
});
const baseline: Aggregate = {
  capex: 30,
  ocf: 100,
  revenue: 200,
  operatingIncome: 40,
  priorCapex: 30,
  priorRevenue: 200,
  priorOperatingIncome: 40,
  priorOcf: 100,
};
test('score anchors, caps and negative cash flow have defined semantics', () => {
  assert.equal(scoreAggregate(baseline).score, 0);
  const high = scoreAggregate({
    ...baseline,
    capex: 150,
    ocf: 100,
    operatingIncome: 20,
  });
  assert.equal(high.score, 100);
  const negative = scoreAggregate({ ...baseline, ocf: -1 });
  assert.equal(negative.components[0].value, null);
  assert.equal(negative.components[0].score, 100);
  assert.throws(() => scoreAggregate({ ...baseline, priorCapex: 0 }));
  assert.throws(() => scoreAggregate({ ...baseline, revenue: NaN }));
});
test('duplicate restatement uses latest available filing without summing duplicates', () => {
  const clone = structuredClone(sources[0]);
  const before = companyAt(clone, '2026-09-06')!;
  const f = before.current.capex.facts[0];
  clone.facts.capex.push({ ...f, filed: '2026-08-15', val: f.val + 100 });
  assert.equal(
    companyAt(clone, '2026-09-06')!.current.capex.value,
    before.current.capex.value + 100,
  );
});
test('normalization rejects malformed upstream responses and missing required tags', () => {
  assert.throws(() => normalize('microsoft', { facts: {} }, now), /GAAP/);
  assert.throws(
    () => normalize('amazon', { facts: { 'us-gaap': {} } }, now),
    /capex/,
  );
});
