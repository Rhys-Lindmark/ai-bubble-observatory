/* oxlint-disable next/no-html-link-for-pages -- Sources and appendix navigation. */
'use client';
import { useState } from 'react';
import { paybackHurdle } from '@/lib/payback';
import RampSpending from '@/components/ramp-spending';
import OracleFunding from './oracle-funding';
const ramp = 'https://ramp.com/data/ai-index-august-2026';
const noah = 'https://www.noahpinion.blog/p/the-ai-bust-scenario-that-no-one';
const oracle =
  'https://investor.oracle.com/investor-news/news-details/2026/Oracle-Announces-Record-Q4-and-FY-2026-Results-Driven-by-Cloud-Infrastructure--Cloud-Applications/';
export function FundingLens() {
  return (
    <details className="ab-details" id="funding-lens">
      <summary>
        Funding stress: useful technology can still miss its debt payments
      </summary>
      <p>
        Three questions drawn from{' '}
        <a href={noah}>Noah Smith’s December 2025 analysis</a>: Does AI create
        value? Does cash arrive before debt is due? Who keeps the margin? This
        is our application of his published arguments, not his review or
        endorsement.
      </p>
      <div className="ab-three">
        <article>
          <h3>1. Demand is not producer profit</h3>
          <p>
            Ramp shows paying customers. Competition, lower token prices and
            upkeep can still leave insufficient cash to repay investors. Smith’s{' '}
            <a href="https://www.noahpinion.blog/p/what-if-a-few-ai-companies-end-up">
              April 2026 update
            </a>{' '}
            is more optimistic about coding use cases; it does not settle every
            company’s returns.
          </p>
        </article>
        <article>
          <h3>2. Look beyond the pooled cash surplus</h3>
          <p>
            <strong>
              Oracle FY2026: $32.0B operating cash − $55.7B cash capex = −$23.7B
              free cash flow.
            </strong>{' '}
            Operating cash covered 57.4% of cash investment; the 42.6% shortfall
            is not a measured debt-funded share.
          </p>
          <p>
            Borrowing proceeds $46.1B; debt repayments $6.9B plus net
            commercial-paper repayment $2.3B. These company-wide flows also fund
            other uses. <a href={oracle}>Actual cash-flow statement ↗</a>
          </p>
        </article>
        <article>
          <h3>3. Follow creditors, prepayments and guarantees</h3>
          <p>
            Oracle’s $4.6B customer financing prepayments already enter
            operating cash. Counting them again as extra capex funding would
            double-count. Meta’s{' '}
            <a href="https://investor.atmeta.com/investor-news/press-release-details/2025/Meta-Announces-Joint-Venture-with-Funds-Managed-by-Blue-Owl-Capital-to-Develop-Hyperion-Data-Center/default.aspx">
              Hyperion venture
            </a>{' '}
            also combines outside capital, leases and a conditional
            residual-value guarantee; ownership share alone does not describe
            risk.
          </p>
        </article>
      </div>
      <p>
        <strong>FCF = operating cash − cash capex.</strong> FCF is what remains
        after investment, so “capex financed by FCF” can obscure the accounting.
        A true debt/equity/internal-cash funding split needs a matched
        sources-and-uses statement, not capex minus OCF alone.{' '}
        <a href="/appendix#demand-evidence">
          Financing and research evidence ↗
        </a>
      </p>
    </details>
  );
}
export default function DemandEconomics({ capex }: { capex: number }) {
  const [investment, setInvestment] = useState(500),
    [years, setYears] = useState(5),
    [rate, setRate] = useState(10),
    [margin, setMargin] = useState(30),
    [recurring, setRecurring] = useState(true);
  const h = paybackHurdle(investment, years, rate / 100, margin / 100);
  return (
    <section className="ab-section" id="demand">
      <div className="ab-section-title">
        <h2>Supply gets built. Who pays for it?</h2>
        <a href="/appendix#demand-evidence">Sources & boundaries ↗</a>
      </div>
      <div className="ab-three">
        <article>
          <p className="ab-kicker">SUPPLY · BUILDERS BUY CAPACITY</p>
          <h3>Chips, data centers and power</h3>
          <p>
            <strong>${(capex / 1e9).toFixed(0)}B trailing cash capex</strong> by
            Microsoft, Alphabet, Amazon, Meta and Oracle. They purchase
            equipment and infrastructure; labs also contract cloud capacity.
          </p>
          <p className="ab-note">
            All company businesses, not AI-only. Supplier sales are the other
            side of these purchases—not extra final demand.
          </p>
        </article>
        <article>
          <p className="ab-kicker">MIDDLE · SELLING ACCESS</p>
          <h3>Cloud → labs and applications</h3>
          <p>
            Cloud operators sell compute to OpenAI, Anthropic, xAI, developers
            and businesses. Labs sell subscriptions and tokens; application
            firms package them into services.
          </p>
          <p>
            <strong>
              OpenAI &gt;$40B; Anthropic ~$65B annualized sales pace.
            </strong>{' '}
            August reports, not profit or earned full-year revenue. Different
            gross/net accounting prevents a comparable sum.
          </p>
        </article>
        <article>
          <p className="ab-kicker">FINAL DEMAND · CUSTOMER BUDGETS</p>
          <h3>Businesses and paid consumers</h3>
          <p>
            Software and API budgets buy work: coding, support, analysis and
            content. Consumers buy subscriptions. Google and Meta also aim to
            improve advertising revenue through internal AI.
          </p>
          <p>
            <strong>
              Productivity is a possible customer benefit, not supplier revenue.
            </strong>{' '}
            Benefits must sustain willingness to pay after competition and
            operating costs.
          </p>
        </article>
      </div>
      <p className="ab-note">
        Payments flow back from customers through the chain. Firms can occupy
        multiple layers. Equity investment, borrowing and customer purchases are
        separate flows; never add all layers’ revenue together.
      </p>
      <div className="ab-two">
        <article>
          <h3>Paid demand: breadth versus dollars</h3>
          <p>
            Ramp businesses paying each vendor · <strong>July 2026</strong>
          </p>
          {[
            ['Anthropic', 43.5],
            ['OpenAI', 39.7],
            ['xAI', 4.0],
          ].map(([name, value]) => (
            <div key={name} style={{ margin: '12px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{name}</span>
                <b>{value}%</b>
              </div>
              <div style={{ height: 7, background: 'var(--ab-line,#ddd)' }}>
                <div
                  style={{
                    height: 7,
                    width: `${value}%`,
                    background: 'currentColor',
                  }}
                />
              </div>
            </div>
          ))}
          <p className="ab-note">
            <a href={ramp}>Ramp, published August 12 ↗</a>. Selected
            business-payment sample; overlapping vendors, not revenue market
            share or measured productivity. A payment counts adoption; free
            usage is missed.{' '}
            <a href="https://ramp.com/data/how-ramp-data-works">
              Sample limits ↗
            </a>
          </p>
          <RampSpending />
          <p>
            For spending scale,{' '}
            <a href="https://www.exponentialview.co/p/the-state-of-the-ai-economy">
              Exponential View
            </a>{' '}
            estimates $110B trailing end-customer AI sales and &gt;$175B
            annualized in June after supply-chain deduplication. It is an
            analyst estimate, with a different boundary from global builder
            capex. It cannot establish a measured payback period.
          </p>
        </article>
        <article>
          <h3>What must the buildout earn to pay back?</h3>
          <p>
            Hypothetical investment cohort. Change the assumptions to see the
            required return.
          </p>
          <label>
            Investment: <b>${investment}B</b>
            <input
              aria-label="Buildout investment"
              type="range"
              min="100"
              max="1000"
              step="50"
              value={investment}
              onChange={(e) => setInvestment(+e.target.value)}
            />
          </label>
          <label>
            Recovery period: <b>{years} years</b>
            <input
              aria-label="Recovery period"
              type="range"
              min="3"
              max="15"
              value={years}
              onChange={(e) => setYears(+e.target.value)}
            />
          </label>
          <label>
            Annual return hurdle: <b>{rate}%</b>
            <input
              aria-label="Annual return hurdle"
              type="range"
              min="0"
              max="20"
              value={rate}
              onChange={(e) => setRate(+e.target.value)}
            />
          </label>
          <label>
            Cash margin after operating costs and upkeep: <b>{margin}%</b>
            <input
              aria-label="Buildout cash margin"
              type="range"
              min="10"
              max="60"
              step="5"
              value={margin}
              onChange={(e) => setMargin(+e.target.value)}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
            />{' '}
            Invest this amount every year
          </label>
          <output
            aria-live="polite"
            style={{ display: 'block', marginTop: 16, fontSize: '1.15rem' }}
          >
            <strong>
              ${(recurring ? h.steadyCash : h.annualCash).toFixed(0)}B annual
              cash
            </strong>{' '}
            requires about{' '}
            <strong>
              ${(recurring ? h.steadyRevenue : h.annualRevenue).toFixed(0)}B
              annual attributable revenue
            </strong>
            .
          </output>
          <p className="ab-note">
            {recurring
              ? `Steady state: ${years} overlapping equal vintages, each earning for ${years} years. Not the first year's revenue requirement.`
              : `One investment vintage, with equal end-of-year cash receipts over ${years} years.`}{' '}
            No ramp-up or resale value. Assumed margin includes tax, working
            capital and upkeep, excludes the initial investment; do not deduct
            that investment twice. These are required cash flows, not observed
            AI returns.
          </p>
        </article>
      </div>
      <OracleFunding />
      <p className="ab-note">
        <strong>Financing is not demand:</strong> Nvidia’s &gt;$500B third-party
        capital target is preliminary, not deployed funding. Alphabet’s $49.6B
        June stock/convertible proceeds are realized financing, not customer
        sales. <a href="/appendix#demand-evidence">Disclosures and scope ↗</a>
      </p>
      <FundingLens />
    </section>
  );
}
