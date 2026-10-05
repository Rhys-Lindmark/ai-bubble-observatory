import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('Oracle debt principal and RPO timing reconcile without treating revenue as cash',()=>{
 const d=JSON.parse(fs.readFileSync(new URL('../data/oracle-timing.json',import.meta.url),'utf8'));
 assert.equal(d.rows.reduce((s:number,r:any)=>s+r.principal,0),130105);
 assert.equal(d.principalTotal-d.debtDiscountIssuanceCosts,d.balanceSheetDebtCarryingValue);
 assert.equal(d.rows[0].principal,7210);
 assert.equal(d.rpo.recognitionShares.reduce((s:number,v:number)=>s+v,0),1);
 assert.equal(d.rpo.total*d.rpo.recognitionShares[0],76560);
 assert.equal(d.rows[1].principal+d.rows[2].principal,15645);
 assert.equal(d.rows[3].principal+d.rows[4].principal,17000);
 assert.equal(d.cashAndEquivalents,31289);
});
