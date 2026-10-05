import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync(new URL('../data/micron-cycle.json',import.meta.url),'utf8'));
test('Micron TTM reconciles fiscal year plus current YTD minus prior YTD without netting subsidies into gross capex',()=>{
 const t=d.rows.at(-1),i=d.ttmInputs;
 for(const k of ['revenue','operatingCashFlow','grossCashPPE','operatingIncome','assetSales']) assert.equal(t[k],i.fy2025[k]+i.ytd2026[k]-i.ytd2025[k]);
 assert.equal(t.governmentIncentivesOrPartnerFunding,i.fy2025.governmentIncentives+i.ytd2026.governmentIncentives-i.ytd2025.governmentIncentives);
 assert.equal(t.capex,25260);assert.equal(t.companyNetCapex,21520);assert.equal(t.fiscalYear,undefined);
 for(const r of d.rows){assert.equal(r.companyNetCapex,r.grossCashPPE+r.equipmentPurchaseContractPayments-r.governmentIncentivesOrPartnerFunding-r.assetSales);assert.equal(r.capex,r.grossCashPPE);assert.equal(r.ocf,r.operatingCashFlow);}
 assert.ok(d.rows[1].capex/d.rows[1].ocf>4.9);
});
