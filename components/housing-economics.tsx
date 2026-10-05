/* oxlint-disable next/no-html-link-for-pages -- Primary economic series links. */
'use client';
import { useState } from 'react';
import investment from '@/data/housing-investment.json';
import housing from '@/data/housing-services.json';
import type { Series } from '@/lib/comparison-data';
import Plot from './comparison-plot';
export default function HousingEconomics() {
  const [owners, setOwners] = useState(true);
  const series: Series[] = [
    {id:'investment',name:'Residential investment',color:'#287fb8',sparse:true,
      points:investment.rows.map(r=>({date:String(r.year),x:r.year-2000,value:r.value}))},
    {id:'tenant-rent',name:'Tenant rent spending · nonfarm',color:'#008b83',sparse:true,dash:true,
      points:housing.rows.map(r=>({date:String(r.year),x:r.year-2000,value:r.tenantRent}))},
  ];
  if (owners) series.push({id:'owner-service',name:'Owner rental value · imputed, not cash',color:'#9e5daa',sparse:true,dash:true,
    points:housing.rows.map(r=>({date:String(r.year),x:r.year-2000,value:r.imputedOwnerRent}))});
  const before=investment.rows.find(r=>r.year===2005)!;
  const after=investment.rows.find(r=>r.year===2009)!;
  const rentBefore=housing.rows.find(r=>r.year===2005)!;
  const rentAfter=housing.rows.find(r=>r.year===2009)!;
  return <>
    <label><input type="checkbox" checked={owners} onChange={e=>setOwners(e.target.checked)} /> Show owner-occupied housing services · estimated rental value, not cash received</label>
    <Plot key={String(owners)} label="US housing investment and shelter demand" series={series} years={10} calendarStart={2000} unit="$B" />
    <p><b>People still needed shelter while the building boom collapsed.</b> Residential investment fell from ${Math.round(before.value)}B in 2005 to ${Math.round(after.value)}B in 2009, a {Math.round(100*(1-after.value/before.value))}% decline. Tenant rent spending rose from ${Math.round(rentBefore.tenantRent)}B to ${Math.round(rentAfter.tenantRent)}B over those years. Continued use of an asset does not guarantee its purchase price or its financing.</p>
    <p className="ab-note">Annual nominal US flows, 2000–2010. Investment includes construction, improvements, residential equipment and ownership-transfer costs; it excludes existing-home resale principal and land. It is a national-accounts measure, not builders’ cash capex. Housing-service figures cover nonfarm homes already in use. They are neither net profits nor revenue attributable to that year’s investment, so this is not a payback or cash-coverage calculation.</p>
    <p className="ab-note">Owner-occupied rental value estimates what owners would pay to rent similar homes; no rent payment takes place. Tenant rent spending is separate. Rising nominal rent can reflect prices, the number of homes and shifts between renting and owning—not necessarily growth in real demand. These revised historical estimates were retrieved September 7, 2026; they are not a forecast made before the crash.</p>
    <p className="ab-note"><a href={investment.source}>BEA residential investment via FRED ↗</a> · <a href={housing.tenantSource}>Tenant rent ↗</a> · <a href={housing.ownerSource}>Imputed owner rent ↗</a> · <a href={housing.methodology}>BEA housing methodology ↗</a></p>
  </>;
}
