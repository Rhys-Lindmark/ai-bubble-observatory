import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('AI segment reported operating losses reconcile for both quarters; adjusted EBITDA is not operating profit',()=>{
  const data=JSON.parse(fs.readFileSync(new URL('../data/ai-margins.json',import.meta.url),'utf8'));
  for(const p of data.periods) {
    const costs=p.costOfRevenue+p.research+p.sellingGeneralAdmin+p.restructuring;
    assert.equal(p.revenue-costs,p.operatingIncome);
    assert.ok(costs<=4000, 'shared chart scale contains every observation');
  }
  const p=data.periods[0];
  assert.equal(p.operatingIncome+p.depreciationAmortization+p.shareCompensation+p.restructuring,p.adjustedEbitda);
  assert.equal(Math.round(100*p.operatingIncome/p.revenue),-49);
  assert.equal(Math.round(100*p.revenue/3818),67);
});
