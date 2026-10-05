'use client';
import { useState } from 'react';
import evidence from '@/data/ai-margins.json';
import HistoricalMargins from './historical-margins';

export default function AiMargins() {
  const [period, setPeriod] = useState(0);
  const [compare, setCompare] = useState(true);
  const p = evidence.periods[period];
  const costs = p.costOfRevenue + p.research + p.sellingGeneralAdmin + p.restructuring;
  return <section className="ab-panel ab-section" aria-labelledby="margin-title">
    <div className="ab-section-title">
      <h2 id="margin-title">Revenue is growing. Is it covering costs?</h2>
      <button onClick={()=>setCompare(!compare)}>{compare?'AI costs & EBITDA detail':'Compare reported margins'}</button>
      {!compare && <select aria-label="AI segment earnings period" value={period} onChange={e => setPeriod(Number(e.target.value))}>
        {evidence.periods.map((row, i) => <option key={row.end} value={i}>{row.label}</option>)}
      </select>}
    </div>
    {compare ? <HistoricalMargins /> : <div className="ab-two">
      <article>
        <h3>SpaceX / xAI · {p.label}</h3>
        <p className="ab-note">Grok, X and infrastructure · quarterly $B · common $0–4B scale</p>
        {[{label:'Revenue',value:p.revenue},{label:'Operating costs',value:costs}].map(row => <div key={row.label} style={{margin:'12px 0'}}>
          <div style={{display:'flex',justifyContent:'space-between'}}><span>{row.label}</span><b>${(row.value/1000).toFixed(2)}B</b></div>
          <div style={{height:10,background:'var(--ab-line,#ddd)'}}><div style={{height:'100%',width:`${row.value/4000*100}%`,background:'currentColor'}} /></div>
        </div>)}
        <p><b>${(-p.operatingIncome/1000).toFixed(2)}B operating loss · {(100*p.operatingIncome/p.revenue).toFixed(0)}% margin.</b>{' '}
          Revenue covered {(100*p.revenue/costs).toFixed(0)}% of operating costs.</p>
        <p className="ab-note"><a href={evidence.source}>Unaudited filing, August 4, 2026 ↗</a>. Q2 loss narrowed year over year. Infrastructure services added $1.6B of sales growth; this is not all end-user token demand.</p>
      </article>
      <article>
        <h3>Profit and cash are different hurdles</h3>
        <p>Q2 2026 adjusted EBITDA was positive $1.15B. It adds back $1.89B depreciation/amortization, $0.52B stock compensation and restructuring to the operating loss.</p>
        <p><b>Neither figure measures cash left after buying infrastructure.</b> Depreciation spreads past asset costs; replacing capacity still needs funding.</p>
        <p className="ab-note">OpenAI / Anthropic: comparable reported operating profit and free cash flow remain unverified here. Annualized sales and projected margins cannot fill that gap.</p>
      </article>
    </div>}
  </section>;
}
