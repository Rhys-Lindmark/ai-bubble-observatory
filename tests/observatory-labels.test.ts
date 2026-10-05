import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  chartLabel,
  monthlyCadence,
  type ChartMetric,
} from '../lib/observatory-labels.ts';
const data = JSON.parse(
  readFileSync(new URL('../data/observatory.json', import.meta.url), 'utf8'),
);
test('all chart choices handle all eleven real cases, including unavailable valuation metadata', () => {
  const metrics: ChartMetric[] = [
    'paired',
    'risk',
    'risk12',
    'pe',
    'cape',
    'capexOCF',
    'capexRevenue',
    'yield',
  ];
  for (const c of [...data.cases, data.ai])
    for (const metric of metrics) assert.ok(chartLabel(c, metric).length > 0);
  for (const id of ['gold1980', 'housing2006', 'bitcoin2017', 'bitcoin2021']) {
    assert.match(
      chartLabel({ id, valuationLabel: null, valuationCadence: null }, 'pe'),
      /unavailable/,
    );
    assert.equal(monthlyCadence(null), false);
  }
});
test('annual observations and actual company fiscal year ends survive chart packaging', () => {
  const china = data.cases.find((c: { id: string }) => c.id === 'china2015');
  assert.equal(monthlyCadence(china.valuationCadence), false);
  assert.match(chartLabel(china, 'pe'), /year-end/);
  assert.ok(
    china.valuations.some(
      (p: { date: string; offset: number }) =>
        p.date === '2015-12' && p.offset === 6,
    ),
  );
  const dotcom = data.cases.find((c: { id: string }) => c.id === 'dotcom2000');
  assert.ok(
    dotcom.investment.some(
      (p: { date: string; company: string }) =>
        p.company === 'MSFT' && p.date === '1999-06-30',
    ),
  );
  assert.ok(
    dotcom.investment.some(
      (p: { date: string; company: string }) =>
        p.company === 'INTC' && p.date === '1999-12-25',
    ),
  );
  const trough = data.railroadFull.find(
    (p: { date: string }) => p.date === '1877-06',
  );
  assert.ok(Math.abs(trough.price - 52.19026549) < 1e-6);
});
