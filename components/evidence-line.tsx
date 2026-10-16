/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Accessible SVG charts use role=img with a named description. */
'use client';
import {useState} from 'react';
type Row = {date:string; [key:string]:string|number};
export default function EvidenceLine({rows, series, unit, label}:{rows:Row[];series:{key:string;name:string;color:string}[];unit:string;label:string}) {
 const [selected,setSelected]=useState(rows.length-1);
 if(!rows.length)return <p>Comparable observations unavailable.</p>;
 const index=Math.min(selected,rows.length-1),chosen=rows[index];
 const values=rows.flatMap(r=>series.map(s=>Number(r[s.key]))).filter(Number.isFinite);
 const low=Math.min(0,...values),high=Math.max(1,...values)*1.1;
 const date=(v:string)=>Date.parse(v.length===7?v+'-01':v),first=date(rows[0].date),last=date(rows.at(-1)!.date);
 const x=(r:Row)=>46+(date(r.date)-first)/Math.max(1,last-first)*458,y=(v:number)=>152-(v-low)/(high-low)*130;
 return <div className="az-chart">
  <div className="az-chart-legend">{series.map(s=><span key={s.key}><i style={{background:s.color}}/>{s.name}</span>)}</div>
  <svg viewBox="0 0 530 183" role="img" aria-label={label} onPointerMove={e=>{const box=e.currentTarget.getBoundingClientRect(),time=first+Math.max(0,Math.min(1,(530*(e.clientX-box.left)/box.width-46)/458))*(last-first);setSelected(rows.reduce((best,r,i)=>Math.abs(date(r.date)-time)<Math.abs(date(rows[best].date)-time)?i:best,0));}}>
   {[low,(low+high)/2,high].map(t=><g key={t}><line x1="46" x2="504" y1={y(t)} y2={y(t)} stroke="var(--az-line)"/><text x="39" y={y(t)+4} textAnchor="end" fill="var(--az-muted)" fontSize="12">{t.toFixed(0)}</text></g>)}
   {series.map(s=><path key={s.key} d={rows.map((r,i)=>`${i?'L':'M'}${x(r)},${y(Number(r[s.key]))}`).join(' ')} fill="none" stroke={s.color} strokeWidth="2.5"/>)}
   <line x1={x(chosen)} x2={x(chosen)} y1="20" y2="153" stroke="var(--az-muted)" strokeDasharray="3 4"/>
   {series.map(s=><circle key={s.key} cx={x(chosen)} cy={y(Number(chosen[s.key]))} r="4" fill={s.color}/>)}
   <text x="46" y="176" fill="var(--az-muted)" fontSize="12">{rows[0].date}</text><text x="504" y="176" textAnchor="end" fill="var(--az-muted)" fontSize="12">{rows.at(-1)!.date}</text>
  </svg>
  <label className="az-inspect"><span>Inspect date</span><input aria-label={`Inspect ${label}`} type="range" min="0" max={rows.length-1} value={index} onChange={e=>setSelected(Number(e.target.value))}/></label>
  <output className="az-readout" aria-live="polite"><b>{chosen.date}</b>{series.map(s=><span key={s.key}>{s.name}: <strong>{Number(chosen[s.key]).toFixed(1)}{unit}</strong></span>)}</output>
 </div>;
}
