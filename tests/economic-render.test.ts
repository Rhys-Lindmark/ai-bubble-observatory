import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
test('empty AI history renders a visible missing-data state while keeping other financial comparisons',async()=>{
 const {build}=require('esbuild');
 const result=await build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import C from './components/economic-comparisons';export function render(history:any[]){return renderToStaticMarkup(<C data={{history,aggregate:{capex:566e9,revenue:1848e9}} as any} market={{points:[],anchor:'2026-08'} as any}/>);}`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',tsconfig:'tsconfig.json'});
 const module={exports:{} as any};new Function('require','module','exports',result.outputFiles[0].text)(require,module,module.exports);
 const empty=module.exports.render([]);
 for(const label of ['AI historical financial series unavailable','Micron · memory cycle','Global Crossing','Customer commitments are not cash already earned'])assert.ok(empty.includes(label),label);
 assert.ok(!empty.includes('NaN'));
 const present=module.exports.render([{date:'2023-01',capex:100e9,ocf:200e9,revenue:500e9}]);
 assert.ok(!present.includes('AI historical financial series unavailable'));
});
