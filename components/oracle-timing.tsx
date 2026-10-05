import timing from '@/data/oracle-timing.json';
import funding from '@/data/oracle-funding.json';
const b=(v:number)=>`$${(v/1000).toFixed(1)}B`;
export default function OracleTiming() {
  const debt=[timing.rows[0].principal,timing.rows[1].principal+timing.rows[2].principal,timing.rows[3].principal+timing.rows[4].principal,timing.rows[5].principal];
  return <div style={{borderTop:'1px solid var(--ab-line,#ddd)',paddingTop:12}}>
    <h3>Oracle: cash buys time; the buildout still needs funding</h3>
    <p>As of May 31, 2026: <b>{b(timing.cashAndEquivalents)} cash versus {b(debt[0])} principal due in FY2027.</b>{' '}
      That covers scheduled principal alone. FY2026 cash capex exceeded operating cash by {b(-funding.reportedTotals.freeCashFlow)}; continuing such a gap consumes reserves or needs financing.</p>
    <p className="ab-note">The $638B backlog is future revenue with costs to serve, not cash available for repayment. New leases commit another $260B; their annual payment schedule is undisclosed.</p>
    <details><summary>Debt maturities, backlog timing and lease obligations</summary>
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',fontSize:14,textAlign:'left'}}>
        <caption style={{textAlign:'left',marginBottom:8}}>As of May 31, 2026 · fiscal years end May · $B</caption>
        <thead><tr><th scope="col">Period</th><th scope="col">Debt principal due</th><th scope="col">Expected backlog revenue<br />(not cash receipts)</th></tr></thead>
        <tbody>{debt.map((v,i)=><tr key={i}><th scope="row">{timing.rpo.periodLabels[i]}</th><td>{b(v)}</td><td>~{b(timing.rpo.total*timing.rpo.recognitionShares[i])}</td></tr>)}</tbody>
      </table>
    </div>
    <p><b>Contracted sales are not a repayment fund.</b> The $638B backlog has costs to serve and uncertain cash timing. New leases, largely for data centers, also commit $260B over long terms; Oracle does not disclose their annual payment schedule in this filing.</p>
    <p className="ab-note">Principal excludes interest, leases and other uses; this is not a liquidity forecast. Operating lease payments already affect operating cash, so subtracting them again would double-count. New leases generally start FY2027–29, lasting 15–19 years. <a href={timing.source}>June 22 filing ↗</a></p>
    </details>
  </div>;
}
