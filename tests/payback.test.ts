import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paybackHurdle } from '../lib/payback.ts';
test('cash recovery discounts to initial investment and recurring vintages stay distinct', () => {
  for (const rate of [0, 0.1, 0.2]) {
    const r = paybackHurdle(500, 5, rate, 0.3);
    const pv = Array.from(
      { length: 5 },
      (_, i) => r.annualCash / (1 + rate) ** (i + 1),
    ).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(pv - 500) < 1e-8);
    assert.equal(r.steadyCash, r.annualCash * 5);
    assert.ok(Math.abs(r.annualRevenue * 0.3 - r.annualCash) < 1e-8);
  }
  assert.throws(() => paybackHurdle(500, 5, 0.1, 0));
});
