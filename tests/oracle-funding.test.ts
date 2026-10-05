import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const d = JSON.parse(
  readFileSync(new URL('../data/oracle-funding.json', import.meta.url), 'utf8'),
);
const sum = (rows: { usdMillions: number }[]) =>
  rows.reduce((a, r) => a + r.usdMillions, 0);
test('Oracle full statement and disjoint cash groups reconcile to reported closing cash', () => {
  assert.equal(sum(d.operatingRows), 31977);
  assert.equal(sum(d.investingRows), -51854);
  assert.equal(sum(d.financingRows), 40284);
  assert.equal(sum(d.waterfall), 20503);
  assert.equal(10786 + sum(d.waterfall), 31289);
  const raw = [...d.operatingRows, ...d.investingRows, ...d.financingRows];
  const used = d.waterfall.flatMap(
    (r: { inputIds?: string[] }) => r.inputIds ?? [],
  );
  assert.equal(new Set(used).size, raw.length);
  assert.equal(used.length, raw.length);
  for (const row of d.waterfall.filter(
    (r: { inputIds?: string[] }) => r.inputIds,
  ))
    assert.equal(
      sum(raw.filter((r) => row.inputIds.includes(r.id))),
      row.usdMillions,
    );
  assert.equal(31977 - 55663, -23686);
});
