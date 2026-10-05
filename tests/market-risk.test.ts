import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNasdaq, computeRisk, RiskDataError } from '../lib/market-risk.ts';
const fixture = `DATE VALUE
2025-08-29 21455.55
2025-09-30 22660.01
2025-10-31 23724.96
2025-11-28 23365.69
2025-12-31 23241.99
2026-01-30 23461.82
2026-02-27 22668.21
2026-03-31 21590.63
2026-04-30 24892.31
2026-05-29 26972.62
2026-06-30 26213.72
2026-07-31 25373.85
2026-08-31 26370.89`;
const now = new Date('2026-09-06T12:00:00Z');
function throwsCode(fn: () => unknown, code: string): void {
  assert.throws(
    fn,
    (error: unknown) => error instanceof RiskDataError && error.code === code,
  );
}
test('exact August 2026 fixture mirrors Python model and ddof=1', () => {
  const closes = parseNasdaq(fixture, now);
  const risk = computeRisk(closes);
  assert.equal(closes.length, 13);
  assert.equal(risk.targetMonth, '2026-09');
  assert.ok(Math.abs(risk.probability! - 0.0085125703) < 1e-10);
  assert.ok(Math.abs(risk.features.vol12 - 0.0568123162) < 1e-10);
  assert.ok(Math.abs(risk.crossingThreshold - 21578.096) < 1e-8);
  assert.equal(risk.lastObservationDate, '2026-08-31');
});
test('partial current month and future observations never affect forecast', () => {
  const withExtra = `${fixture}\n2026-09-04 90000\n2026-09-30 1\n2026-10-01 5`;
  assert.deepEqual(
    computeRisk(parseNasdaq(withExtra, now)),
    computeRisk(parseNasdaq(fixture, now)),
  );
});
test('FRED HTML first table and extra rows are both parsed', () => {
  const rows = fixture.split('\n').slice(1);
  const html =
    '<table>' +
    rows
      .slice(0, 5)
      .map((r) => {
        const [d, v] = r.split(' ');
        return `<tr><th scope="row">${d}</th><td>${v}</td></tr>`;
      })
      .join('') +
    '</table>\n<div id="extra-rows">\n' +
    rows
      .slice(5)
      .map((r) => '#' + r.replace(' ', '|  '))
      .join('\n') +
    '\n</div>';
  assert.deepEqual(parseNasdaq(html, now), parseNasdaq(fixture, now));
});
test('already at 20% drawdown returns null, not zero probability', () => {
  const closes = parseNasdaq(fixture, now);
  closes[12].price = 26972.62 * 0.8;
  const risk = computeRisk(closes);
  assert.equal(risk.status, 'already_below_threshold');
  assert.equal(risk.eligible, false);
  assert.equal(risk.probability, null);
});
test('missing month fails even with enough earlier data', () => {
  const gap =
    '2025-07-31 21000\n' + fixture.replace('2026-03-31 21590.63\n', '');
  throwsCode(() => parseNasdaq(gap, now), 'MISSING_MONTH');
  const closes = parseNasdaq(fixture, now);
  closes[5].month = '2025-12';
  closes[5].date = '2025-12-31';
  throwsCode(() => computeRisk(closes), 'MISSING_MONTH');
});
test('stale latest month and unconfirmed truncated month fail closed', () => {
  throwsCode(
    () => parseNasdaq(fixture.replace('2026-08-31 26370.89', ''), now),
    'STALE_DATA',
  );
  throwsCode(
    () => parseNasdaq(fixture.replace('2026-08-31', '2026-08-28'), now),
    'INCOMPLETE_MONTH',
  );
  throwsCode(
    () =>
      parseNasdaq(
        fixture.replace('2026-08-31', '2026-08-10') + '\n2026-09-04 26506.99',
        now,
      ),
    'INCOMPLETE_MONTH',
  );
});
test('duplicates, invalid prices, missing values, and insufficient history handled', () => {
  assert.deepEqual(
    parseNasdaq(fixture + '\n2026-08-31 26370.89\n2026-08-30 .', now),
    parseNasdaq(fixture, now),
  );
  throwsCode(
    () => parseNasdaq(fixture + '\n2026-08-31 999', now),
    'CONFLICTING_OBSERVATIONS',
  );
  throwsCode(
    () => parseNasdaq(fixture.replace('26370.89', '-1'), now),
    'INVALID_OBSERVATION',
  );
  throwsCode(
    () => parseNasdaq('2026-08-31 26370.89', now),
    'INSUFFICIENT_HISTORY',
  );
});
test('trailing peak excludes oldest close while retaining it for 12-month return', () => {
  const closes = parseNasdaq(fixture, now);
  closes[0].price = 100000;
  const risk = computeRisk(closes);
  assert.equal(risk.trailingPeak, 26972.62);
  assert.ok(
    Math.abs(risk.features.ret12 - Math.log(26370.89 / 100000)) < 1e-12,
  );
});

test('CSV empty holiday rows cannot consume the following date or become zero', () => {
  const csv = fixture
    .split('\n')
    .slice(1)
    .map((row) => row.replace(' ', ','))
    .join('\n');
  const withHoliday = csv
    .replace('2026-02-27,', '2026-02-16,\n2026-02-27,')
    .replace('2026-07-31,', '2026-07-03,.\n2026-07-31,');
  assert.deepEqual(parseNasdaq(withHoliday, now), parseNasdaq(fixture, now));
});
