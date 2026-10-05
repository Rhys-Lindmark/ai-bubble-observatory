/* oxlint-disable next/no-html-link-for-pages -- Evidence links. */
'use client';
import { useEffect, useState } from 'react';
import ThemeToggle from './theme-toggle';
import EconomicComparisons from './economic-comparisons';
import AiMargins from './ai-margins';
import DemandEconomics from './demand-economics';
import SP500Exposure from './sp500-exposure';
import DataFreshness from './data-freshness';
import UsageEvidence from './usage-evidence';
import SupplyEvidence, { GdpScale } from './valuation-supply';
import benchmarks from '@/data/reader-benchmarks.json';
import { fundingAssessment } from '@/lib/funding-assessment';
import type { Dashboard } from '@/lib/metrics';
import type { MarketData } from '@/lib/market-server';
import type { Context } from '@/lib/context';
export default function Assessment({
  initial,
  context,
  market,
}: {
  initial: Dashboard;
  context: Context;
  market: MarketData;
}) {
  const [data, setData] = useState(initial),
    [ctx, setCtx] = useState(context),
    [mkt, setMkt] = useState(market);
  useEffect(() => {
    let active = true;
    async function refresh() {
      // Independent resources: a network failure must not suppress other updates.
      async function read<T>(url: string, setter: (value: T) => void) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const value: T = await response.json();
        if (active) setter(value);
      }
      const results = await Promise.allSettled([
        read('/api/dashboard', setData),
        read('/api/context', setCtx),
        read('/api/market', setMkt),
      ]);
      if (active && results[2].status === 'rejected') {
        setMkt(previous => ({...previous, failures: ['Market status could not be refreshed; retaining the dated observations.']}));
      }
    }
    void refresh();
    const t = setInterval(refresh, 300000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);
  const a = data.aggregate,
    pressure = fundingAssessment(a.capex, a.ocf, a.priorCapex, a.priorOcf);
  return (
    <main className="ab-page comparison-page">
      <header className="ab-header">
        <a href="/" className="ab-brand">
          AI BUBBLE OBSERVATORY
        </a>
        <nav>
          <a href="/appendix">Research & sources ↗</a>
          <ThemeToggle />
        </nav>
      </header>
      <section className="comparison-verdict">
        <p className="ab-kicker">ASSESSMENT · {data.asOf.slice(0, 10)}</p>
        <h1>Bubble warning signs. No defensible crash clock.</h1>
        <p>
          Valuations are high and investment is outrunning sales. Demand is
          growing too. The question is whether future cash profits justify the
          prices and financial obligations being taken on today.
        </p>
        <div className="ab-three">
          <article>
            <h3>What looks bubbly</h3>
            <p>
              Broad-US CAPE is <b>{benchmarks.cape.current.cape.toFixed(1)}×</b>
              , versus <b>44.2×</b> at the dot-com extreme. Builder capex grew{' '}
              <b>{(100 * (a.capex / a.priorCapex - 1)).toFixed(0)}%</b> while
              sales grew{' '}
              <b>{(100 * (a.revenue / a.priorRevenue - 1)).toFixed(0)}%</b>.
            </p>
          </article>
          <article>
            <h3>What pushes against a bust</h3>
            <p>
              These are established cash-generating firms. Five builders
              generate <b>${(a.ocf / 1e9).toFixed(0)}B</b> operating cash
              against <b>${(a.capex / 1e9).toFixed(0)}B</b> investment. Paid AI
              spending is rising; technology adoption is real.
            </p>
          </article>
          <article>
            <h3>What could turn pressure into a crash</h3>
            <p>
              Disappointing sales or margins, idle capacity and refinancing
              stress.{' '}
              {pressure.remainder >= 0
                ? 'Aggregate cash coverage buys time; it does not protect each borrower or justify every stock price.'
                : 'The aggregate investment gap requires reserves or outside funding.'}{' '}
              <b>Usefulness does not guarantee investor returns.</b>
            </p>
          </article>
        </div>
        <p className="ab-note">
          The historical cases below are selected crashes, not a probability
          model. They show similarities and differences; estimating crash odds
          also requires non-crash booms and out-of-sample validation. CAPE is
          broad-market context; company accounts cover all businesses.
        </p>
      </section>
      <EconomicComparisons data={data} market={mkt} />
      <AiMargins />
      <section className="comparison-takeaway">
        <h2>The economic reading</h2>
        <p>
          <b>
            Closest useful analogy: infrastructure built ahead of uncertain
            returns.
          </b>{' '}
          Railways and dot-com show that lasting customer value can coexist with
          investor losses. Today’s large incumbents have operating cash, but
          spending is absorbing more of it. The decisive missing link is
          AI-attributable cash profit—not token counts, resale turnover or total
          cloud-company revenue.
        </p>
        <p>
          More paid use, durable margins and higher utilization would support
          the spending. Debt that matures before those cash flows arrive, or
          weak pricing despite heavy use, would strengthen the bust case. A
          price chart alone cannot settle either question.
        </p>
      </section>
      <details className="ab-details">
        <summary>
          AI valuation concentration · Mag7, adjacent stocks and earnings
          quality
        </summary>
        <SP500Exposure />
      </details>
      <details className="ab-details">
        <summary>
          Demand and financing detail · labs, paid spending, payback assumptions
          and Oracle
        </summary>
        <DemandEconomics capex={a.capex} />
      </details>
      <details className="ab-details">
        <summary>
          Who is exposed? Company cash coverage, chip supply and economic scale
        </summary>
        <div className="ab-company-list">
          {data.companies.map((c) => (
            <div key={c.id}>
              <a href={c.sourceUrl}>{c.name} ↗</a>
              <span>
                {((100 * c.current.capex.value) / c.current.ocf.value).toFixed(
                  0,
                )}
                ¢ capex / $1 operating cash
              </span>
              <small>12 months to {c.end}</small>
            </div>
          ))}
        </div>
        <p className="ab-note">
          Whole-company cash accounts. Above $1 requires reserves or external
          funding before distributions. Nvidia supplies equipment; its revenue
          does not establish customer returns.
        </p>
        <GdpScale capex={a.capex} />
        <SupplyEvidence />
        <UsageEvidence />
      </details>
      <DataFreshness data={data} context={ctx} market={mkt} />
      <footer className="ab-footer">
        <p>
          Research is dated; supported feeds refresh on visits.{' '}
          <a href="/appendix">
            Full research, source coverage and model failures ↗
          </a>
          . Hourly research automation is paused.
        </p>
      </footer>
    </main>
  );
}
