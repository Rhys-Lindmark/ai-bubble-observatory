/* oxlint-disable next/no-html-link-for-pages -- Primary financial statement link. */
import data from '@/data/oracle-funding.json';
const billions = (v: number) => `$${(v / 1000).toFixed(1)}B`;
export default function OracleFunding() {
  const sources = data.waterfall.filter(
    (r) => r.usdMillions > 0 && r.id !== 'fx',
  );
  const uses = data.waterfall.filter((r) => r.usdMillions < 0);
  const totalIn = sources.reduce((sum, r) => sum + r.usdMillions, 0);
  const totalOut = -uses.reduce((sum, r) => sum + r.usdMillions, 0);
  return (
    <section id="oracle-cash" className="ab-section">
      <h3>Oracle borrowed while investing—and still built its cash reserve</h3>
      <p>
        <strong>
          {billions(data.derived.netBorrowingExcludingCapexArrangements)} net
          borrowing versus {billions(data.reportedTotals.operating)} operating
          cash.
        </strong>{' '}
        FY2026, ended May 31. Cash investment exceeded operating cash by{' '}
        {billions(-data.reportedTotals.freeCashFlow)}, but financing and other
        flows also increased cash on hand.
      </p>
      <div className="ab-two">
        {[
          { name: 'Cash sources', rows: sources, total: totalIn },
          { name: 'Cash uses', rows: uses, total: totalOut },
        ].map((group) => (
          <article key={group.name}>
            <h4>
              {group.name} · {billions(group.total)}
            </h4>
            {group.rows.map((r) => (
              <div key={r.id} style={{ margin: '10px 0' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <span>{r.label}</span>
                  <b style={{ whiteSpace: 'nowrap' }}>
                    {billions(Math.abs(r.usdMillions))}
                  </b>
                </div>
                <div style={{ height: 7, background: 'color-mix(in srgb, currentColor 15%, transparent)' }}>
                  <div
                    style={{
                      height: 7,
                      width: `${Math.abs(r.usdMillions) / 600}%`,
                      background: 'currentColor',
                    }}
                  />
                </div>
              </div>
            ))}
          </article>
        ))}
      </div>
      <p>
        <strong>
          Cash on hand: {billions(data.reportedTotals.openingCash)} →{' '}
          {billions(data.reportedTotals.closingCash)}.
        </strong>{' '}
        Opening cash + {billions(totalIn)} sources − {billions(totalOut)} uses +
        $0.096B currency effect. Bars share a $0–60B scale. Amounts are rounded;
        the underlying statement reconciles exactly.
      </p>
      <p className="ab-note">
        Whole-company cash flows, not an AI funding allocation. Borrowing is net
        of debt repayments and commercial-paper flows; short-term capex
        financing is shown separately. Equity includes common and
        mandatory-convertible preferred proceeds. Operating cash already
        contains $4.6B of customer financing prepayments. Do not add those again
        or call the cash shortfall a debt-funded percentage of AI capex.{' '}
        <a href={data.source}>June 10 cash-flow statement ↗</a> · dated research,
        checked September 7.
      </p>
    </section>
  );
}
