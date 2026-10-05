import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
test('US rail comparison preserves printed discrepancy and distinguishes a capital balance from revenue',async()=>{
 const d=JSON.parse(fs.readFileSync(new URL('../data/us-rail-financials.json',import.meta.url),'utf8'));
 const r=d.rows.find((r:any)=>r.year===1872);assert.equal(r.freightEarnings+r.passengerEarnings-r.grossEarnings,8000000);
 const a=d.rows.find((r:any)=>r.year===1873),b=d.rows.find((r:any)=>r.year===1877);
 assert.equal(Math.round(100*(b.capitalAndFundedDebt/a.capitalAndFundedDebt-1)),21);assert.equal(Math.round(100*(b.grossEarnings/a.grossEarnings-1)),-10);
 const {build}=require('esbuild');const result=await build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import C from './components/us-rail-financials';export default renderToStaticMarkup(<C/>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',tsconfig:'tsconfig.json'});
 const module={exports:{} as any};new Function('require','module','exports',result.outputFiles[0].text)(require,module,module.exports);
 const html=module.exports.default;for(const t of ['not annual construction spending','1872 revenue dot is omitted','1871 = 100','No payback'])assert.ok(html.includes(t),t);
});
