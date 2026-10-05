'use client';
import { useState } from 'react';
import historical from '@/data/historical-margins.json';
import ai from '@/data/ai-margins.json';

export default function HistoricalMargins() {
  const groups = [
    {name:'SpaceX AI segment',role:'Grok, X and infrastructure · quarterly',rows:ai.periods.map(p=>({...p,source:ai.source}))},
    {name:'Cisco',role:'Equipment supplier · annual FY ends July',rows:historical.cisco.rows},
    {name:'Global Crossing',role:'Fiber operator · annual FY ends December',rows:historical.globalCrossing.rows.map(p=>({...p,label:`FY${p.year}`,source:historical.globalCrossing.source}))},
  ];
  const [selected,setSelected]=useState([0,2,0]);
  const rows=groups.map((g,i)=>({...g,p:g.rows[selected[i]]}));
  const margins=rows.map(r=>100*r.p.operatingIncome/r.p.revenue);
  const low=Math.min(-50,Math.floor(Math.min(...margins)/50)*50),high=50;
  const position=(v:number)=>100*(v-low)/(high-low);
  const zero=position(0);
  return <>
    <p><b>Operating profit per $100 of revenue.</b> Same calculation and axis for each business; choose reported periods. Below zero means sales did not cover operating costs.</p>
    {rows.map((r,i)=> <div key={r.name} style={{margin:'18px 0'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
        <span><b>{r.name}</b> · {r.role}</span>
        <label><span className="sr-only">{r.name} period</span><select aria-label={`${r.name} margin period`} value={selected[i]} onChange={e=>setSelected(previous=>previous.map((v,j)=>j===i?Number(e.target.value):v))}>{r.rows.map((p,j)=><option key={p.label} value={j}>{p.label}</option>)}</select></label>
        <b>{margins[i]>0?'+':''}{margins[i].toFixed(1)}%</b>
      </div>
      <div aria-hidden="true" style={{height:18,position:'relative',marginTop:6,background:'var(--ab-line,#ddd)'}}>
        <div style={{position:'absolute',left:`${Math.min(position(margins[i]),zero)}%`,width:`${Math.abs(position(margins[i])-zero)}%`,height:18,background:'currentColor'}} />
        <div style={{position:'absolute',left:`${zero}%`,top:-3,height:24,borderLeft:'2px solid var(--ab-muted,#888)'}} />
      </div>
      <p className="ab-note" style={{margin:'4px 0'}}><a href={r.p.source}>{r.p.label} statement ↗</a> · ${(r.p.revenue/1000).toFixed(2)}B revenue; {r.p.operatingIncome<0?'−':'+'}${(Math.abs(r.p.operatingIncome)/1000).toFixed(2)}B operating {r.p.operatingIncome<0?'loss':'profit'}.</p>
    </div>)}
    <div style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}><span>{low}%</span><span>Vertical rule = zero profit</span><span>+{high}%</span></div>
    <p className="ab-note">One linear scale, resized for the selected observations. Quarterly and annual ratios share units, but cover different durations and business mixes. Historical statements include later restatements; this is not a prediction backtest.</p>
    <div className="ab-two">
      <p><b>Cisco’s FY2001 reversal:</b> inventory and restructuring charges accompanied the bust. Later recovery also benefited from inventory reserves and the end of goodwill amortization.</p>
      <p><b>Global Crossing’s FY2001 loss:</b> includes $17.18B of asset impairment. Lower depreciation after that write-down flatters FY2002; bankruptcy-era improvement does not establish healthy demand.</p>
    </div>
    <p className="ab-note">Operating income includes reported charges and depreciation, before interest and tax. It is not free cash flow. These are selected businesses, not sector averages; neither a positive margin nor resemblance to a failed operator establishes crash odds.</p>
    <p className="ab-note">AI coverage: Infrastructure services contributed $1.6B of year-over-year sales growth in SpaceX’s Q2 2026, not solely end-user tokens. Comparable OpenAI / Anthropic operating profit and free cash flow remain unverified here.</p>
  </>;
}
