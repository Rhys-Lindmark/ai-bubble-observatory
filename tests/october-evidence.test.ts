import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gpuEconomics,containsReleasePeriods} from '../lib/october-metrics.ts';
const data=JSON.parse(fs.readFileSync(new URL('../data/october-evidence.json',import.meta.url),'utf8'));
const seed=JSON.parse(fs.readFileSync(new URL('../data/seed.json',import.meta.url),'utf8'));
test('rental scenario discounts cash, separates simple payback and rejects impossible utilization',()=>{
 const e=gpuEconomics(40000,3.13,.7);const annual=8760*.7*(3.13-.8);
 assert.equal(e.cash,annual);assert.ok(Math.abs(e.npv-(-40000+[1,2,3].reduce((s,y)=>s+annual/1.12**y,0)))<1e-7);
 assert.equal(e.payback,40000/annual);assert.ok(e.breakEven!>.7);
 const breakeven=gpuEconomics(40000,3.13,e.breakEven!);assert.ok(Math.abs(breakeven.npv)<1e-7);
 assert.equal(gpuEconomics(40000,.5,.7).payback,null);assert.equal(gpuEconomics(40000,.5,.7).breakEven,null);
 assert.equal(gpuEconomics(40000,3.13,.7,.8,3,0).npv,annual*3-40000);
 assert.throws(()=>gpuEconomics(40000,3.13,1.1));
});
test('a recently checked but older filing cache cannot conceal an updated release period',()=>{
 const release={companies:[{id:'oracle',end:'2026-08-31'},{id:'meta',end:'2026-06-30'}]};
 assert.equal(containsReleasePeriods({companies:[{id:'oracle',end:'2026-05-31'},{id:'meta',end:'2026-06-30'}]},release),false);
 assert.equal(containsReleasePeriods({companies:[{id:'oracle',end:'2026-08-31'},{id:'meta',end:'2026-09-30'}]},release),true);
 assert.equal(containsReleasePeriods({companies:[{id:'oracle',end:'2026-08-31'}]},release),false);
});
test('October evidence preserves source dates, indexed bases and quarterly versus annualized labels',()=>{
 assert.equal(data.reviewed,'2026-10-16');
 for(const key of ['adoption','tokens','spending','monthlyGrowth']){
  const rows=data.ramp[key];assert.ok(rows.length>10);assert.ok(rows.every((r:any,i:number)=>r.date<='2026-10-16'&&(!i||r.date>rows[i-1].date)));
 }
 assert.equal(data.ramp.tokens[0].volume,100);assert.equal(data.ramp.tokens[0].spend,100);
 assert.equal(data.ramp.tokens.at(-1).date,'2026-10-11');assert.equal(data.ramp.adoption.at(-1).date,'2026-09');
 assert.ok(Math.abs(data.ramp.adoption.at(-1).overall-55.9)<.05);
 assert.equal(data.labs.openai.annualized,50);assert.equal(data.labs.anthropic.quarters.at(-1).revenue,16.8);
 const oracle=seed.companies.find((c:any)=>c.id==='oracle');assert.equal(oracle.end,'2026-08-31');
 assert.equal(oracle.current.capex.value/1e6,55663+28499-8502);assert.equal(oracle.current.ocf.value/1e6,31977+23103-8140);
 assert.equal(seed.aggregate.capex,seed.companies.reduce((s:number,c:any)=>s+c.current.capex.value,0));
});
