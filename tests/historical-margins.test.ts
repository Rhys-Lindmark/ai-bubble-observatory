import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(name:string)=>JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url),'utf8'));
test('historical earnings match existing revenue perimeters and reconcile reported operating costs',()=>{
  const d=read('historical-margins');
  const c=read('cisco-comparison').rows,g=read('global-crossing').rows;
  for(const r of d.cisco.rows){
    assert.equal(r.revenue,c.find((v:any)=>v.fiscalYear===r.year).revenue/1e6);
    assert.equal(r.revenue-r.costs,r.operatingIncome);
  }
  for(const r of d.globalCrossing.rows){
    assert.equal(r.revenue,g.find((v:any)=>v.year===r.year).revenue);
    assert.equal(r.revenue-r.costs,r.operatingIncome);
  }
  assert.equal(d.globalCrossing.rows[1].impairment,17181);
  assert.ok(d.globalCrossing.rows[1].operatingIncome/d.globalCrossing.rows[1].revenue<-5);
  assert.equal(d.cisco.rows[3].operatingIncome,-2004);
});
