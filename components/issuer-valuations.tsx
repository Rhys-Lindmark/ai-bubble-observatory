/* oxlint-disable next/no-html-link-for-pages -- Source links for issuer observations. */
'use client';
import {useState} from 'react';
import evidence from '@/data/valuation-supply.json';
import quality from '@/data/earnings-quality.json';
import reconstructed from '@/data/reconstructed-valuations.json';
import {earningsScenario} from '@/lib/issuer-valuations';
const names: Record<string,string> = {NVDA:'Nvidia',MSFT:'Microsoft',GOOGL:'Alphabet',AMZN:'Amazon',META:'Meta',ORCL:'Oracle',MU:'Micron',TSM:'TSMC',ASML:'ASML'};
const rows=[...evidence.valuation.rows.filter(r=>r.recommended_for_display).map(r=>({...r,pe:r.trailing_pe_provider})),...reconstructed.rows].sort((a,b)=>b.pe-a.pe);
const rebuilt=new Set(reconstructed.rows.map(r=>r.ticker));
export default function IssuerValuations() {
  const [retained,setRetained]=useState(100);
  const scale=Math.ceil(Math.max(...rows.map(r=>Math.max(r.pe,earningsScenario(r.pe,retained)!)))/10)*10;
  return <div>
    <p><b>How much price for $1 of annual earnings?</b> Whole-company trailing P/E, September 4, 2026 close. These selected companies expose different parts of AI’s economics; they are not a complete sector or the Mag7.</p>
    <label htmlFor="earnings-retained">What if earnings were <b>{retained}% of the reported level</b>, with share prices unchanged?</label>
    <input id="earnings-retained" type="range" min="50" max="150" step="10" value={retained} onChange={e=>setRetained(Number(e.target.value))} style={{width:'100%'}} />
    <p className="ab-note">Scenario, not an earnings forecast. Gray: trailing P/E baseline (≈ means independently calculated). Green: multiple under your earnings assumption. Common scale: 0–{scale}×.</p>
    <div aria-label="Selected AI-exposed issuer price earnings multiples">
      {rows.map(r=><div key={r.ticker} style={{padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12}}><a href={r.source}>{names[r.ticker]} <small>{r.ticker}</small> ↗</a><span>{rebuilt.has(r.ticker)?'≈':''}{r.pe.toFixed(1)}×{retained!==100 && <> → <b>{earningsScenario(r.pe,retained)!.toFixed(1)}×</b></>}</span></div>
        <div aria-hidden="true" style={{height:12,position:'relative',marginTop:5}}>
          <div style={{position:'absolute',height:4,top:0,background:'#999',width:`${100*r.pe/scale}%`}} />
          <div style={{position:'absolute',height:4,top:7,background:'#008b83',width:`${100*earningsScenario(r.pe,retained)!/scale}%`}} />
        </div>
        {r.ticker==='ASML' && <p className="ab-note" style={{margin:'5px 0'}}>Chipmaking equipment · US GAAP. ${reconstructed.asml.priceUSD.toFixed(2)} ordinary-share price ÷ €{reconstructed.asml.ttmEPS_EUR.toFixed(2)} summed quarterly diluted earnings, converted at September 4 ECB reference FX (${reconstructed.asml.usdPerEUR}/€), not closing FX. <a href={reconstructed.asml.sources.eps}>Reported results</a> · <a href={reconstructed.asml.sources.fx}>FX ↗</a></p>}
        {r.ticker==='TSM' && <p className="ab-note" style={{margin:'5px 0'}}>Foundry · TIFRS. ${reconstructed.tsmc.price.toFixed(2)} ADR price ÷ ${reconstructed.tsmc.ttmEps.toFixed(2)} summed quarterly diluted ADR earnings. Company quarterly currency translations; one ADR represents five shares, already included. <a href={reconstructed.tsmc.quarters[3].source}>Reported results ↗</a></p>}
        {r.ticker==='MSFT' && <p className="ab-note" style={{margin:'5px 0'}}><b>{(r.price_usd/quality.microsoft.company_openai_excluded_diluted_eps).toFixed(1)}× without OpenAI investment effects.</b> Microsoft’s FY2026 adjustment lowers EPS from ${quality.microsoft.gaap_diluted_eps.toFixed(2)} to ${quality.microsoft.company_openai_excluded_diluted_eps.toFixed(2)} at the same share price. It still includes other investment gains, including Anthropic. <a href={quality.microsoft.primary_source}>Company reconciliation ↗</a></p>}
        {r.ticker==='NVDA' && <p className="ab-note" style={{margin:'5px 0'}}><b>Investment gains were {(100*quality.nvidia.ttmEquityGains/quality.nvidia.ttmPretaxIncome).toFixed(1)}% of pre-tax profit:</b> ${(quality.nvidia.ttmEquityGains/1000).toFixed(1)}B of ${(quality.nvidia.ttmPretaxIncome/1000).toFixed(1)}B, trailing year to July 26. These are not chip sales. An isolated after-tax EPS adjustment is unverified, so no gains-excluded P/E is shown. <a href={quality.nvidia.sourceAnnual}>Annual</a> + <a href={quality.nvidia.sourceInterim}>interim results ↗</a></p>}
      </div>)}
    </div>
    <p><b>The denominator matters.</b> Investment revaluations can boost reported earnings without more customer demand. The Microsoft comparison uses its disclosed after-tax adjustment; Nvidia’s pre-tax share is not the same measure. Both differ from the hypothetical green bars above. If sustainable earnings halve and price stays fixed, P/E doubles.</p>
    <p className="ab-note">Stock Analysis supplies prices and unmarked multiples; those quotes were checked against displayed price/EPS. Marked estimates use the disclosed earnings and currency calculations. Provider discrepancies are preserved rather than silently relabeled. Earnings include non-AI operations. The scenario changes earnings only; it does not predict a price or crash. This is one year of earnings, unlike ten-year CAPE. No company-average “AI P/E” is calculated.</p>
    <p className="ab-note">TSMC and ASML use different accounting and currency conventions; these approximate comparisons are not currency-neutral. Private labs have no verified comparable public-stock P/E here. Forward multiples are omitted because their forecast horizon and accounting basis have not been verified. <a href="/appendix#valuation-supply">Audit and definitions ↗</a></p>
  </div>;
}
