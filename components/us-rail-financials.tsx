'use client';
import {useState} from 'react';
import data from '@/data/us-rail-financials.json';
import Plot from './comparison-plot';
export default function UsRailFinancials(){
 const [money,setMoney]=useState(false);
 const series=[{id:'capital',name:'Reported capital and funded debt',field:'capitalAndFundedDebt' as const,color:'#be6235'},{id:'earnings',name:'Annual gross railway earnings',field:'grossEarnings' as const,color:'#008b83'}].map(s=>({id:s.id,name:s.name,color:s.color,sparse:true,points:data.rows.filter(r=>!(s.id==='earnings' && r.year===1872)).map(r=>({date:String(r.year),x:r.year-1871,value:money?r[s.field]/1e6:100*r[s.field]/data.rows[0][s.field]}))}));
 return <>
  <p><b>US railroads: financial claims grew while revenue fell.</b> From 1873 to 1877, reported capital and funded debt rose about 21%, while annual gross earnings fell about 10%. Useful infrastructure did not guarantee growing revenue to support its financial claims.</p>
  <label>Railroad units <select aria-label="US railroad financial units" value={money?'money':'indexed'} onChange={e=>setMoney(e.target.value==='money')}><option value="indexed">Each series: 1871 = 100</option><option value="money">Reported amounts · $M</option></select></label>
  <Plot label="US railroad financial capital and annual earnings" series={series} years={6} unit={money?'$M':'1871 = 100'} />
  <p className="ab-note">Year 0 = 1871. Financial capital is a stock-and-bond account amount, not annual construction spending or market value. Gross earnings are one year’s revenue, not profit or cash available to investors. Indexed lines show each series’ growth, not a revenue-to-capital ratio; the dollar view compares a balance with an annual flow. No payback or comparable AI multiple is inferred.</p>
  <p className="ab-note">One publication vintage: <a href={data.source}>1878 Statistical Abstract, table 145, page 153 ↗</a>. <a href={data.methodSource}>Poor’s 1878 Manual ↗</a> describes railroads reporting operations; changing coverage and mileage affect totals. Annual dots are not interpolated. The 1872 revenue dot is omitted: the printed total differs from its freight and passenger components by $8M. Later editions revise figures and coverage; they are not spliced here.</p>
 </>;
}
