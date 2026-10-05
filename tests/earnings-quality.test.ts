import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(name:string)=>JSON.parse(fs.readFileSync(new URL(`../data/${name}.json`,import.meta.url),'utf8'));
test('Nvidia TTM investment gains and pretax income use matching full plus interim minus prior interim',()=>{
 const {nvidia:n}=read('earnings-quality');
 assert.equal(n.fy2026.equityGains+n.h1fy2027.equityGains-n.h1fy2026.equityGains,n.ttmEquityGains);
 assert.equal(n.fy2026.pretaxIncome+n.h1fy2027.pretaxIncome-n.h1fy2026.pretaxIncome,n.ttmPretaxIncome);
 assert.equal((100*n.ttmEquityGains/n.ttmPretaxIncome).toFixed(1),'13.3');
});
test('Microsoft disclosed aftertax OpenAI-only adjustment matches provider annual EPS and fixed-price comparison',()=>{
 const {microsoft:m}=read('earnings-quality');
 const r=read('valuation-supply').valuation.rows.find((r:any)=>r.ticker==='MSFT');
 assert.equal(m.gaap_diluted_eps,r.displayed_eps_usd);
 assert.equal(m.gaap_net_income-m.openai_net_income_benefit,m.company_openai_excluded_net_income);
 assert.equal((m.gaap_diluted_eps-m.openai_diluted_eps_benefit).toFixed(2),m.company_openai_excluded_diluted_eps.toFixed(2));
 assert.equal((r.price_usd/m.company_openai_excluded_diluted_eps).toFixed(2),'28.92');
});
