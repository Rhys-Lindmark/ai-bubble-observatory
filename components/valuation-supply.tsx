/* oxlint-disable next/no-html-link-for-pages -- Source and appendix links. */
import evidence from '@/data/valuation-supply.json';
export function EquityMultiples() {
  return (
    <details className="ab-details">
      <summary>What about AI-exposed stocks themselves?</summary>
      <p>
        Whole-company trailing P/E · September 4, 2026 close. Price paid per
        dollar of the last year’s earnings. These are not AI-only earnings, and
        unlike CAPE they are not smoothed over ten years.
      </p>
      <div className="ab-multiples">
        {evidence.valuation.rows
          .filter((r) => r.recommended_for_display)
          .map((r) => (
            <div key={r.ticker}>
              <a href={r.source}>{r.ticker} ↗</a>
              <span
                className="ab-multiple-bar"
                style={{ width: `${(r.trailing_pe_provider / 35) * 100}%` }}
              />
              <strong>{r.trailing_pe_provider.toFixed(1)}×</strong>
            </div>
          ))}
      </div>
      <p className="ab-note">
        Provider: Stock Analysis. Price/EPS arithmetic checked; earnings not
        rebuilt or normalized from filings. Investment gains, taxes and non-AI
        businesses can affect the denominator. No average or “AI sector P/E” is
        inferred.{' '}
        <a href="/appendix#valuation-supply">
          Definitions, omissions & sources ↗
        </a>
      </p>
    </details>
  );
}
export function GdpScale({ capex }: { capex: number }) {
  return (
    <p className="ab-note">
      <strong>
        Economic scale:{' '}
        {(
          (capex / 1e9 / evidence.gdp.nominal_gdp_billions_usd_saar) *
          100
        ).toFixed(2)}
        %.
      </strong>{' '}
      These global builders’ capital spending is that large relative to
      annualized US nominal GDP (Q2 2026). This is a size comparison—not
      domestic AI investment or a contribution to GDP.{' '}
      <a href={evidence.gdp.source}>BEA / FRED ↗</a>
    </p>
  );
}
export default function SupplyEvidence({
  appendix = false,
}: {
  appendix?: boolean;
}) {
  return (
    <section
      id={appendix ? 'valuation-supply' : undefined}
      className="ab-section"
    >
      <h2>
        {appendix
          ? 'Valuation and supply evidence'
          : 'Follow the money upstream'}
      </h2>
      <p>
        Supplier sales confirm the buildout is happening. They do not prove the
        eventual AI customer earns a return. Do not add these sales to lab or
        cloud revenue.
      </p>
      <div className="ab-three">
        <article>
          <h3>TSMC · making the chips</h3>
          <p>
            <strong>$40.2B quarterly sales</strong>, up 33.7% in USD year over
            year (Q2 2026). Advanced nodes made up 77% of wafer revenue.
          </p>
          <p className="ab-note">
            Recognized foundry sales across AI and non-AI applications. Watch
            whether capacity and customer orders keep pace with downstream
            usage.
          </p>
          <a href={evidence.supply_signals[0].source}>Quarterly report ↗</a>
        </article>
        <article>
          <h3>ASML · making the tools</h3>
          <p>
            <strong>€9.3B quarterly sales</strong> (Q2 2026). Management plans
            roughly 30% more low-NA EUV and immersion DUV capacity in 2027.
          </p>
          <p className="ab-note">
            Sales are observed; capacity is a plan. More equipment capacity can
            ease bottlenecks while increasing overcapacity risk.
          </p>
          <a href={evidence.supply_signals[1].source}>
            Results & capacity plan ↗
          </a>
        </article>
        <article>
          <h3>Micron · memory</h3>
          <p>
            <strong>$13.8B cloud-memory sales</strong>, versus $3.4B a year
            earlier (fiscal Q3, ended May 2026).
          </p>
          <p className="ab-note">
            Broader than AI or high-bandwidth memory. Price increases and
            product mix can drive revenue; this is not a measure of physical
            demand alone.
          </p>
          <a href={evidence.supply_signals[2].source}>Quarterly results ↗</a>
        </article>
      </div>
      {appendix && (
        <>
          <h3>How the P/E observations were checked</h3>
          <p>
            Stock Analysis snapshots use September 4 regular-session closes and
            provider trailing EPS. Seven displayed ratios reconcile within
            rounding. This is an arithmetic check, not a GAAP earnings audit.
            Forward P/E is omitted because its precise forecast horizon and
            accounting basis have not been verified.
          </p>
          <p>
            TSMC and ASML multiples are excluded: their displayed price divided
            by EPS differs from quoted P/E. ADR, currency or provider
            conventions may matter; the cause is not established. A missing
            multiple is not zero or evidence of cheapness.
          </p>
          <h3>What makes this moment interesting?</h3>
          <p>
            Share prices and earnings can both rise rapidly, leaving a
            moderate-looking trailing multiple. One year of unusually high
            earnings can also make a cyclical stock look inexpensive. Examine
            sustainable operating earnings and reinvestment alongside the
            multiple. An AI-only P/E requires separately valued AI operations
            and attributable earnings; those inputs are not available for this
            cohort.
          </p>
          <h3>GDP scale calculation</h3>
          <p>
            Global builder trailing cash capex / Q2 2026 US nominal GDP at a
            seasonally adjusted annual rate. The dated denominator is
            $32,486.066B, released August 26. Geography, fiscal windows and
            value-added boundaries differ. It must not be called AI’s GDP share
            or growth contribution.
          </p>
        </>
      )}
    </section>
  );
}
