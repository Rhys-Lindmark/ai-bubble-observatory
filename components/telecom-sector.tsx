/* oxlint-disable next/no-html-link-for-pages -- Primary statistical sources. */
'use client';
import { useState } from 'react';
import revenue from '@/data/telecom-sector-revenue.json';
import investment from '@/data/telecom-sector-investment.json';
import type { Series } from '@/lib/comparison-data';
import Plot from './comparison-plot';
export default function TelecomSector() {
  const [split, setSplit] = useState(false);
  const series: Series[] = [{
    id: 'investment', name: 'Telecom investment · new + used assets', color: '#287fb8', sparse: true,
    points: investment.rows.map(r => ({date: String(r.year), x: r.year - 1999, value: r.total / 1000})),
  }];
  const keys = split ? ['local', 'wireless', 'toll'] as const : ['endUser'] as const;
  const labels = {local:'Local-service billings', wireless:'Wireless billings', toll:'Long-distance billings', endUser:'Total end-user billings'};
  const colors = {local:'#9e5daa', wireless:'#008b83', toll:'#be6235', endUser:'#008b83'};
  for (const key of keys) series.push({
    id:key, name:labels[key], color:colors[key], sparse:true, dash:true,
    points:revenue.rows.map(r => ({date:String(r.year),x:r.year-1999,value:r[key]/1000})),
  });
  const base = revenue.rows.find(r=>r.year===2000)!;
  const after = revenue.rows.find(r=>r.year===2002)!;
  return <>
    <label><input type="checkbox" checked={split} onChange={e=>setSplit(e.target.checked)} /> Split customer billings: local, wireless and long distance</label>
    <Plot key={String(split)} label="US telecom industry investment and billed demand" series={series} years={5} calendarStart={1999} unit="$B" />
    <p><b>Demand survived the bust. Its composition changed.</b> Investment fell from ${Math.round(investment.rows.find(r=>r.year===2000)!.total/1000)}B to ${Math.round(investment.rows.find(r=>r.year===2002)!.total/1000)}B between 2000 and 2002. End-user billings were ${Math.round(base.endUser/1000)}B in 2000 and ${Math.round(after.endUser/1000)}B in 2002. Long-distance billings fell {Math.round(100*(1-after.toll/base.toll))}%, while wireless billings rose {Math.round(100*(after.wireless/base.wireless-1))}%. Growing demand somewhere in the industry did not ensure returns for every network.</p>
    <p className="ab-note">Annual observations, 1999–2004. Filled dots: Census domestic telecom investment, including used assets and capital leases—not a cash-only capex series. Hollow dots: FCC billed telecom revenue excluding reported carrier-to-carrier resale. It still includes some reseller and foreign-to-foreign traffic. Different survey boundaries: compare the paths, not a funding ratio or project payback. Revenue is neither profit nor cash collected.</p>
    <p className="ab-note">This industry view broadens the company examples; it is not an AI forecast. It includes wired, wireless, satellite and other telecom providers, rather than only fiber builders. Census uses revised comparative values; the 2003 comparison reflects the 2004 classification change. <a href={investment.rows[0].source}>Census investment tables ↗</a> · <a href={revenue.source}>FCC Table 1 ↗</a></p>
    <details><summary>Annual investment sources and revisions</summary><ul>{investment.rows.map(r=><li key={r.year}><a href={r.source}>{r.year}: {r.tableTitle} ↗</a></li>)}</ul></details>
  </>;
}
