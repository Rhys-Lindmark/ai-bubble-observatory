import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elapsedYears, rebase, laterRevenue } from '../lib/comparison-data.ts';
test('aligned prices begin at 100 without altering relative growth', () => {
  const p = rebase([
    { x: 0, date: '1998-03', value: 40 },
    { x: 2, date: '2000-03', value: 100 },
  ]);
  assert.equal(p[0].value, 100);
  assert.equal(p[1].value, 250);
  assert.equal(elapsedYears('2000-03', '1998-03'), 2);
});
test('later revenue shifts to earlier investment date without forecasting or summing overlapping TTM', () => {
  const r = laterRevenue(
    [
      { date: '2023-01', revenue: 100 },
      { date: '2024-01', revenue: 150 },
      { date: '2025-01', revenue: 200 },
    ],
    '2023-01',
    12,
    1,
  );
  assert.deepEqual(r, [
    { date: '2024-01', x: 0, value: 150 },
    { date: '2025-01', x: 1, value: 200 },
  ]);
  assert.deepEqual(
    laterRevenue([{ date: '2023-01', revenue: 100 }], '2023-01', 24, 1),
    [],
  );
});

test('later sales cannot imply spending before a cohort enters the sample or across a missing period', () => {
  const rows = [
    { date: '2000-12', revenue: 3505 },
    { date: '2001-12', revenue: 3659 },
    { date: '2002-12', revenue: 3116 },
  ];
  assert.deepEqual(laterRevenue(rows, '1996-12', 24, 1), [
    { date: '2002-12', x: 4, value: 3116 },
  ]);
  assert.deepEqual(
    laterRevenue(
      [
        { date: '2000-12', revenue: 1 },
        { date: '2002-12', revenue: 2 },
      ],
      '1996-12',
      12,
      1,
    ),
    [],
  );
});

test('market price window excludes forecast rows and retains observed dates', async () => {
  const { marketPriceWindow } = await import('../lib/comparison-data.ts');
  const result = marketPriceWindow([
    {date:'2026-07',offset:-1,price:90},
    {date:'2026-08',offset:0,price:100},
    {date:'2026-09',offset:1,price:110},
    {date:'2026-06',offset:-2,price:null},
  ]);
  assert.deepEqual(result.map(p=>p.date), ['2026-07','2026-08']);
  assert.equal(result[0].value,100);
  assert.equal(result[1].value,10000/90);
  assert.equal(result[1].x,1/12);
  assert.deepEqual(marketPriceWindow([{date:'2026-08',offset:0,price:NaN}]),[]);
});

test('52/53-week annual lags match fiscal years, while unmatched latest TTM stays excluded',()=>{
 const rows=[{date:'2022-09-01',fiscalYear:2022,revenue:30},{date:'2023-08-31',fiscalYear:2023,revenue:15},{date:'2024-08-29',fiscalYear:2024,revenue:25},{date:'2026-05-28',revenue:90}];
 const shifted=laterRevenue(rows,'2022-09-01',12,1);
 assert.deepEqual(shifted.map(p=>p.date),['2023-08-31','2024-08-29']);
 assert.equal(shifted[0].x,0);
 assert.equal(shifted[1].x,11/12);
 assert.equal(laterRevenue(rows,'2022-09-01',24,1)[0].date,'2024-08-29');
});
