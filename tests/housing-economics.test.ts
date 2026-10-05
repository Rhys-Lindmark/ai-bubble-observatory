import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(file: string)=>JSON.parse(fs.readFileSync(new URL('../data/'+file,import.meta.url),'utf8'));
test('housing comparison uses annual observations and preserves cash versus imputed categories',()=>{
  const investment=read('housing-investment.json');
  const housing=read('housing-services.json');
  assert.equal(investment.series,'PRFIA');
  assert.deepEqual(investment.rows.map((r:any)=>r.year),Array.from({length:11},(_,i)=>2000+i));
  assert.deepEqual(housing.rows.map((r:any)=>r.year),investment.rows.map((r:any)=>r.year));
  assert.equal(investment.rows.find((r:any)=>r.year===2005).value,856.221);
  assert.equal(investment.rows.find((r:any)=>r.year===2009).value,390.004);
  assert.equal(housing.rows.find((r:any)=>r.year===2009).tenantRent,346.308);
  assert.equal(housing.rows.find((r:any)=>r.year===2009).imputedOwnerRent,1244.066);
});
