/* oxlint-disable next/no-html-link-for-pages -- Links to the source appendix. */
'use client';
import { useState } from 'react';
const epoch =
  'https://epoch.ai/gradient-updates/an-update-on-ais-most-important-number';
const ev = 'https://www.exponentialview.co/p/the-state-of-the-ai-economy';
const nv =
  'https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Partners-With-Apollo-BlackRock-Blackstone-Brookfield-Goldman-Sachs-and-KKR-to-Establish-AI-Compute-Infrastructure-Financing-Platforms-to-Mobilize-Over-500-Billion-of-Third-Party-Capital/default.aspx';
const goog =
  'https://www.sec.gov/Archives/edgar/data/1652044/000165204426000066/googexhibit991q22026.htm';
export default function DemandPanel({
  appendix = false,
}: {
  appendix?: boolean;
}) {
  const [margin, setMargin] = useState(20),
    [multiple, setMultiple] = useState(5);
  if (appendix)
    return (
      <section id="demand-evidence" className="ab-page ab-section">
        <h2>Demand, financing and the payback question</h2>
        <p>
          Evidence reviewed September 7, 2026. These are dated editorial
          observations, not a live revenue feed.
        </p>
        <h3>What customers pay</h3>
        <p>
          <a href={epoch}>Epoch AI, August 27, 2026</a> reports OpenAI above
          $40B annualized revenue and Anthropic around $65B by the end of July.
          Run rates extrapolate recent sales; they are not earned full-year
          revenue, recurring subscription ARR or profit. Partner-channel
          accounting differs: Anthropic books gross customer charges while
          OpenAI books its net share. The roughly $105B sum is therefore not a
          comparable, deduplicated market total. We show the firms separately.
        </p>
        <p>
          <a href={ev}>Exponential View, June 25, 2026</a> estimates $110B
          trailing-year end-customer sales and more than $175B annualized across
          generative AI. Its model removes transactions within the supply chain;
          it excludes internal business uplift, efficiency savings, professional
          services and China. This is an analyst estimate, not audited sector
          accounts.
        </p>
        <h3>Growth is evidence; margins decide returns</h3>
        <p>
          Epoch’s argument is that unusually persistent revenue growth is
          evidence of useful demand. The question is whether new capabilities
          sustain growth or adoption saturates. Exponential View compares
          attributable revenue with depreciation using six-year compute and
          fourteen-year other-infrastructure lives. Clearing depreciation alone
          does not cover operating costs, financing costs or required investor
          returns. Neither argument establishes fair value.
        </p>
        <h3>The counterargument: expectations and financing</h3>
        <p>
          <a href="https://www.imf.org/en/publications/gfsr/issues/2025/10/14/global-financial-stability-report-october-2025">
            IMF, October 2025
          </a>{' '}
          warned that stretched valuations and concentrated exposure could
          amplify corrections if earnings disappoint.{' '}
          <a href="https://www.bis.org/publications/bulletin-120-financing-ai-boom-cash-flows-debt">
            BIS, January 2026
          </a>{' '}
          emphasized the shift from internal cash toward debt financing.
          Together these challenge the inference that rapid sales growth alone
          makes the buildout safe: compare durable cash margins, debt service
          and funding terms with the revenue trajectory. These are analytical
          warnings, not calibrated crash forecasts.
        </p>
        <h3>Financing changes who bears the downside</h3>
        <p>
          <a href={nv}>Nvidia, August 10, 2026</a>: memorandums with Apollo,
          BlackRock, Blackstone, Brookfield, Goldman Sachs and KKR target over
          $500B of third-party infrastructure capital over time, subject to
          final agreements. This is not $500B of Nvidia sales, deployed capital
          or a single funded bank loan. Watch actual underwriting, guarantees,
          utilization and collateral values.
        </p>
        <p>
          <a href={goog}>Alphabet Q2 2026 filing</a>: $49.6B net proceeds from
          common and mandatory convertible preferred stock issued in June;
          separately, a $40B at-the-market program had sold no shares at June 30
          and was primarily intended for employee-equity tax obligations. The
          earlier $80B proposal and these subsequent proceeds must not be added
          together. Issuance brings cash and can dilute shareholders; it is not
          customer revenue.
        </p>
        <h3>What the payback illustration measures</h3>
        <p>
          Simple undiscounted recovery time = acquisition price / annual
          distributable cash, or price-to-sales multiple / cash margin. It
          assumes constant revenue and margin, with reinvestment included in the
          margin. It excludes growth, discounting and residual value and is not
          a valuation model. We do not divide global hyperscaler capex by lab
          revenue: the entities, assets, timing and revenue boundaries do not
          match.
        </p>
        <p>
          Historical lesson: railway and dot-com infrastructure could gain users
          while investors lost money. Compare demand growth with margins,
          reinvestment and financing obligations—not demand growth alone.
          Comparable historical customer-revenue and capital cohorts remain a
          research gap.
        </p>
      </section>
    );
  return (
    <section className="ab-section" id="demand">
      <div className="ab-section-title">
        <h2>Demand is real. Is it enough to earn a return?</h2>
        <a href="/appendix#demand-evidence">Evidence & assumptions ↗</a>
      </div>
      <div className="ab-three">
        <article>
          <p className="ab-kicker">LAB REVENUE · REPORTED ANNUALIZED PACE</p>
          <div className="ab-bench">
            <span>
              OpenAI <b>&gt;$40B</b>
            </span>
            <span>
              Anthropic <b>~$65B</b>
            </span>
          </div>
          <p>
            Reported by August 2026. These are sales run rates, not profit or
            completed-year revenue. Gross/net accounting differs, so we do not
            combine them into a market total.
          </p>
          <p className="ab-note">
            Broader demand: Exponential View estimates $110B trailing sales and
            &gt;$175B annualized in June, after removing supply-chain double
            counting. Do not add that estimate to the lab figures.
          </p>
        </article>
        <article>
          <p className="ab-kicker">THE RETURN HURDLE · ILLUSTRATION</p>
          <h3>Revenue is not payback</h3>
          <label>
            Price paid / annual sales: <b>{multiple}×</b>
            <input
              type="range"
              min="1"
              max="30"
              value={multiple}
              onChange={(e) => setMultiple(+e.target.value)}
              aria-label="Illustrative price to sales"
            />
          </label>
          <label>
            Cash margin after reinvestment: <b>{margin}%</b>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={margin}
              onChange={(e) => setMargin(+e.target.value)}
              aria-label="Illustrative cash margin"
            />
          </label>
          <output aria-live="polite">
            <strong>{(multiple / (margin / 100)).toFixed(1)} years</strong>{' '}
            simple recovery time
          </output>
          <p className="ab-note">
            Assumed flat sales and margin; no discounting or residual value.
            Hypothetical inputs, not lab valuations. Faster growth can help;
            ongoing reinvestment can consume the cash.
          </p>
        </article>
        <article>
          <p className="ab-kicker">FUNDING · NOT CUSTOMER DEMAND</p>
          <h3>Nvidia: &gt;$500B financing ambition</h3>
          <p>
            Third-party capital targeted over time under preliminary
            agreements—not money already deployed.
          </p>
          <h3>Alphabet: $49.6B raised</h3>
          <p>
            June stock and convertible-preferred proceeds. Its separate $40B
            issuance program was unused at June 30, mainly intended for
            employee-equity taxes.
          </p>
          <p className="ab-note">
            More financing can sustain the buildout. It also makes underwriting,
            dilution and who absorbs losses part of the bubble story.
          </p>
        </article>
      </div>
    </section>
  );
}
