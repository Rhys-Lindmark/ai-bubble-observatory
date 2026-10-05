import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {earningsScenario} from '../lib/issuer-valuations.ts';
test('fixed-price earnings sensitivity doubles the multiple when earnings halve, with undefined zero/loss cases',()=>{
 assert.equal(earningsScenario(30,100),30);
 assert.equal(earningsScenario(30,50),60);
 assert.equal(earningsScenario(30,150),20);
 for(const n of [0,-10,NaN,Infinity]) assert.equal(earningsScenario(30,n),null);
});
test('display eligibility preserves excluded issuer mismatches and arithmetic rounding tolerance',()=>{
 const rows=JSON.parse(fs.readFileSync(new URL('../data/valuation-supply.json',import.meta.url),'utf8')).valuation.rows;
 const selected=rows.filter((r:any)=>r.recommended_for_display);
 assert.equal(selected.length,7);
 assert.ok(!selected.some((r:any)=>['TSM','ASML'].includes(r.ticker)));
 for(const r of selected) assert.ok(Math.abs(r.price_usd/r.displayed_eps_usd-r.trailing_pe_provider)<0.02);
});
test('reconstructed foreign issuer multiples use four quarters and apply currency/listing conversions once',()=>{
 const d=JSON.parse(fs.readFileSync(new URL('../data/reconstructed-valuations.json',import.meta.url),'utf8'));
 assert.deepEqual(d.tsmc.quarters.map((q:any)=>q.end),['2025-09-30','2025-12-31','2026-03-31','2026-06-30']);
 assert.equal(d.tsmc.quarters.reduce((s:number,q:any)=>s+q.eps,0),13.86);
 assert.ok(Math.abs(d.rows.find((r:any)=>r.ticker==='TSM').pe-428.91/13.86)<1e-10);
 assert.deepEqual(d.asml.quarters.map((q:any)=>q.period),['2025-09-28','2025-12-31','2026-03-29','2026-06-28']);
 assert.ok(Math.abs(d.asml.quarters.reduce((s:number,q:any)=>s+q.eps,0)-27.55)<1e-10);
 assert.equal(d.asml.fxDate,d.asml.priceDate);
 assert.ok(Math.abs(d.rows.find((r:any)=>r.ticker==='ASML').pe-1714.88/(27.55*1.1622))<1e-10);
 for(const r of d.rows) assert.ok(Math.abs(r.pe-r.price_usd/r.eps_usd)<1e-10);
});
