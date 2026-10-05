import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import {
  makeForecastRecord,
  forecastBindings,
  INSERT_FORECAST,
} from '../lib/forecast-record.ts';
import { computeRisk, MODEL_SPECIFICATION } from '../lib/market-risk.ts';
const closes = Array.from({ length: 13 }, (_, i) => {
  const d = new Date(Date.UTC(2025, 8 + i, 0));
  while ([0, 6].includes(d.getUTCDay())) d.setUTCDate(d.getUTCDate() - 1);
  const date = d.toISOString().slice(0, 10);
  return { month: date.slice(0, 7), date, price: 100 + i };
});
const input = {
  closes,
  source: 'https://example.test/fixture',
  sourceCheckedAt: '2026-09-07T12:00:00Z',
  issuedAt: '2026-09-07T12:00:01Z',
  sourceSucceeded: true,
};

test('record preserves exact inputs, fitted specification and computed forecast', async () => {
  const record = await makeForecastRecord(input);
  assert.ok(record);
  assert.deepEqual(record.inputs, closes);
  assert.deepEqual(record.estimate, computeRisk(closes));
  assert.deepEqual(record.modelSpecification, MODEL_SPECIFICATION);
  assert.equal(record.estimate.targetMonth, '2026-09');
  assert.equal(record.timing, 'issued_during_target_month');
  assert.match(record.id, /^[a-f0-9]{64}$/);
});
test('failed, stale, incomplete, future and ineligible inputs produce no record', async () => {
  assert.equal(
    await makeForecastRecord({ ...input, sourceSucceeded: false }),
    null,
  );
  assert.equal(
    await makeForecastRecord({ ...input, issuedAt: '2026-09-07T12:05:00Z' }),
    null,
  );
  assert.equal(
    await makeForecastRecord({
      ...input,
      sourceCheckedAt: '2026-09-07T13:00:00Z',
    }),
    null,
  );
  for (const time of [
    '2026-10-01T00:00:00Z',
    '2026-09-24T00:00:00Z',
    '2026-09-30T22:00:00Z',
    '2026-08-30T00:00:00Z',
    'invalid',
  ]) {
    assert.equal(
      await makeForecastRecord({
        ...input,
        issuedAt: time,
        sourceCheckedAt: time,
      }),
      null,
    );
  }
  assert.equal(
    await makeForecastRecord({
      ...input,
      closes: [...closes.slice(0, 12), { ...closes[12], date: '2026-08-03' }],
    }),
    null,
  );
  assert.equal(
    await makeForecastRecord({
      ...input,
      closes: [...closes.slice(0, 12), { ...closes[12], price: 50 }],
    }),
    null,
  );
});
test('actual SQLite conflict semantics retain first issuance and separate input revisions', async () => {
  const db = new DatabaseSync(':memory:');
  db.exec(
    readFileSync(
      new URL('../drizzle/0001_blue_husk.sql', import.meta.url),
      'utf8',
    ),
  );
  const first = (await makeForecastRecord(input))!;
  const duplicate = (await makeForecastRecord({
    ...input,
    sourceCheckedAt: '2026-09-08T00:00:00Z',
    issuedAt: '2026-09-08T00:00:01Z',
  }))!;
  assert.equal(first.id, duplicate.id);
  const insert = db.prepare(INSERT_FORECAST);
  insert.run(...forecastBindings(first));
  insert.run(...forecastBindings(duplicate));
  const stored = db.prepare('SELECT payload FROM forecast_records').get()!;
  assert.equal(JSON.parse(stored.payload as string).issuedAt, first.issuedAt);
  const revision = (await makeForecastRecord({
    ...input,
    closes: [...closes.slice(0, 12), { ...closes[12], price: 113 }],
  }))!;
  assert.notEqual(revision.id, first.id);
  insert.run(...forecastBindings(revision));
  assert.equal(
    db.prepare('SELECT count(*) AS n FROM forecast_records').get()!.n,
    2,
  );
  db.close();
});

test('late-month issuance is excluded before a final trading close can be known', async () => {
  for (const t of ['2026-09-24T00:00:00Z', '2026-09-30T22:00:00Z']) {
    assert.equal(
      await makeForecastRecord({ ...input, issuedAt: t, sourceCheckedAt: t }),
      null,
    );
  }
  const r = await makeForecastRecord(input);
  assert.equal(r?.issuanceClosesAt, '2026-09-24T00:00:00.000Z');
});
