import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { cashFundingPercent } from '../lib/comparison-data.ts';
const gx = JSON.parse(
  fs.readFileSync(
    new URL('../data/global-crossing.json', import.meta.url),
    'utf8',
  ),
);
const cs = JSON.parse(
  fs.readFileSync(
    new URL('../data/cisco-comparison.json', import.meta.url),
    'utf8',
  ),
);
test('Global Crossing continuing cash reconciles to total; negative cash cannot become favorable ratio', () => {
  for (const r of gx.rows)
    assert.equal(r.ocf + r.discontinuedCash + r.reorganizationCash, r.totalOcf);
  assert.equal(cashFundingPercent(2643, -906), null);
  assert.equal(cashFundingPercent(1, 0), null);
  assert.ok(
    Math.abs(cashFundingPercent(3366, 549)! - 613.1147540983607) < 1e-9,
  );
});
test('Cisco full-dollar fields preserve source ratios and large property purchase remains disclosed', () => {
  assert.equal(cs.rows.length, 6);
  for (const r of cs.rows)
    assert.ok(Math.abs(r.capex / r.ocf - r.capexToOCF) < 1e-12);
  const peak = cs.rows.find((r: any) => r.fiscalYear === 2002);
  assert.equal(peak.capex, 2641000000);
  assert.ok(JSON.stringify(cs).includes('1.9'));
});

test('telecom sector investment sums disjoint categories; FCC billings exclude wholesale', () => {
  const cap = JSON.parse(fs.readFileSync(new URL('../data/telecom-sector-investment.json', import.meta.url), 'utf8'));
  const rev = JSON.parse(fs.readFileSync(new URL('../data/telecom-sector-revenue.json', import.meta.url), 'utf8'));
  assert.deepEqual(cap.rows.map((r: any)=>r.year),rev.rows.map((r: any)=>r.year));
  for (const r of cap.rows) {
    assert.equal(r.total,r.components.reduce((n: number,c: any)=>n+c.total,0));
    assert.equal(r.total,r.new+r.used);
  }
  for (const r of rev.rows) assert.ok(Math.abs(r.local+r.wireless+r.toll-r.endUser)<=1);
  assert.equal(cap.rows.find((r: any)=>r.year===2004).total,51182); // revised 2005 comparative
  assert.equal(rev.rows.find((r: any)=>r.year===2000).endUser,229149); // not gross 292762
});
