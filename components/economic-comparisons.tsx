/* oxlint-disable next/no-html-link-for-pages -- Native links to primary source documents and evidence endpoints. */
'use client';
import { useState } from 'react';
import evidence from '@/data/observatory.json';
import benchmarks from '@/data/reader-benchmarks.json';
import railway from '@/data/railway-revenue.json';
import cisco from '@/data/cisco-comparison.json';
import crossing from '@/data/global-crossing.json';
import micron from '@/data/micron-cycle.json';
import micronCash from '@/data/micron-cash-quality.json';
import memoryDrivers from '@/data/memory-price-volume.json';
import type { MarketData } from '@/lib/market-server';
import type { Dashboard } from '@/lib/metrics';
import {
  elapsedYears,
  marketPriceWindow,
  cashFundingPercent,
  laterRevenue,
  rebase,
  type Series,
} from '@/lib/comparison-data';
import Plot from './comparison-plot';
import TelecomSector from './telecom-sector';
import HousingEconomics from './housing-economics';
import UsRailFinancials from './us-rail-financials';
import OracleTiming from './oracle-timing';
import IssuerValuations from './issuer-valuations';
const colors = [
  '#999999',
  '#be6235',
  '#ab841d',
  '#9e5daa',
  '#287fb8',
  '#64974f',
  '#b65972',
  '#638994',
  '#aa783f',
  '#7777bb',
  '#008b83',
];
const cases = [...evidence.cases, evidence.ai];
export default function EconomicComparisons({ data, market }: { data: Dashboard; market: MarketData }) {
  const currentPrices = marketPriceWindow(market.points);
  const [selected, setSelected] = useState(cases.map((c) => c.id)),
    [metric, setMetric] = useState('issuers'),
    [lag, setLag] = useState(0),
    [demandMode, setDemandMode] = useState('indexed'),
    [cohort, setCohort] = useState('ai'),
    [cashMode, setCashMode] = useState('ocf'),
    [dotGroups, setDotGroups] = useState([
      'dotcom2000',
      'cisco',
      'globalcrossing',
      'micron',
    ]);
  const start = (c: (typeof cases)[number]) => c.points[0].date;
  const priceSeries: Series[] = cases
    .filter((c) => selected.includes(c.id))
    .map((c) => {
      const points =
        metric === 'price'
          ? c.id === 'ai-current' ? currentPrices : rebase(
              c.points
                .filter((p) => p.price != null)
                .map((p) => ({
                  x: elapsedYears(p.date, start(c)),
                  value: p.price!,
                  date: p.date,
                })),
            )
          : c.valuations
              .filter((p) => (metric === 'cape' ? p.cape : p.pe) != null)
              .map((p) => ({
                x: elapsedYears(p.date, start(c)),
                value: (metric === 'cape' ? p.cape : p.pe)!,
                date: p.date,
              }));
      return {
        id: c.id,
        name: c.name,
        color: colors[cases.findIndex((a) => a.id === c.id)],
        points,
        sparse:
          metric !== 'price' &&
          ['japan1989', 'china2007', 'china2015'].includes(c.id),
      };
    });
  const aiStart = '2023-01',
    dotStart = '1996-12';
  const ai = data.history
    .filter((r) => r.date >= aiStart)
    .map((r) => ({
      date: r.date,
      capex: r.capex,
      ocf: r.ocf,
      revenue: r.revenue,
    }));
  const dot = benchmarks.dotcom.series.map((r) => ({
    date: `${r.fiscalYear}-12`,
    capex: r.capex,
    ocf: r.ocf,
    revenue: r.revenue,
  }));
  const groups = [
    {id:'micron',name:'Micron · memory cycle',color:'#ab841d',start:micron.rows[0].date,rows:micron.rows.map(r=>({...r,capex:r.capex*1e6,ocf:r.ocf*1e6,revenue:r.revenue*1e6}))},
    {
      id: 'ai-current',
      name: 'AI builders (5 firms)',
      color: '#008b83',
      rows: ai,
      start: aiStart,
    },
    {
      id: 'dotcom2000',
      name: 'Microsoft + Intel · incumbents',
      color: '#287fb8',
      rows: dot,
      start: dotStart,
    },
    {
      id: 'cisco',
      name: 'Cisco · equipment supplier',
      color: '#9e5daa',
      rows: cisco.rows.map((r) => ({
        date: `${r.fiscalYear}-12`,
        capex: r.capex,
        ocf: r.ocf,
        revenue: r.revenue,
      })),
      start: dotStart,
    },
    {
      id: 'globalcrossing',
      name: 'Global Crossing · fiber operator',
      color: '#be6235',
      rows: crossing.rows.map((r) => ({
        date: `${r.year}-12`,
        capex: r.capex * 1e6,
        ocf: r.ocf * 1e6,
        revenue: r.revenue * 1e6,
      })),
      start: dotStart,
    },
  ];
  const enabled = (id: string) =>
    id === 'micron' ? dotGroups.includes(id) : id === 'ai-current'
      ? selected.includes(id)
      : selected.includes('dotcom2000') && dotGroups.includes(id);
  const fiscalDate = (id: string, date: string) =>
    id === 'micron' ? micron.rows.find(r=>r.date===date)?.label ?? date : id === 'ai-current' ? date : `FY${date.slice(0, 4)}`;
  const cash: Series[] = groups
    .filter((g) => enabled(g.id))
    .map((g) => ({
      id: g.id,
      name: g.name,
      color: g.color,
      sparse: g.id !== 'ai-current',
      points: g.rows
        .filter(
          (r) =>
            cashMode !== 'ocf' ||
            (cashFundingPercent(r.capex, r.ocf) !== null &&
              !(g.id === 'globalcrossing' && r.date.startsWith('2002'))),
        )
        .map((r) => ({
          x: elapsedYears(r.date, g.start),
          date: fiscalDate(g.id, r.date),
          value: (100 * r.capex) / (cashMode === 'ocf' ? r.ocf : r.revenue),
        })),
    }));
  const demand: Series[] = groups
    .filter(
      (g) =>
        enabled(g.id) && g.rows.length > 0 &&
        (demandMode === 'indexed' ||
          g.id ===
            {
              ai: 'ai-current',
              dot: 'dotcom2000',
              cisco: 'cisco',
              globalcrossing: 'globalcrossing',
              micron: 'micron',
            }[cohort]),
    )
    .flatMap((g) => {
      const div = demandMode === 'indexed' ? g.rows[0].revenue / 100 : 1e9;
      return [
        {
          id: g.id + '-capex',
          name: g.name + ' · spending',
          color: g.color,
          points: g.rows.map((r) => ({
            x: elapsedYears(r.date, g.start),
            date: fiscalDate(g.id, r.date),
            value: r.capex / div,
          })),
          sparse: g.id !== 'ai-current',
        },
        {
          id: g.id + '-revenue',
          name: g.name + ` · revenue ${lag ? `+${lag} months` : ''}`,
          color: g.color,
          dash: true,
          points: laterRevenue(g.rows, g.start, lag, div).map((p) => ({
            ...p,
            date: fiscalDate(g.id, p.date),
          })),
          sparse: g.id !== 'ai-current',
        },
      ];
    });
  const rail = railway.series.observations;
  const railSeries: Series[] = [
    {
      id: 'rail-capital',
      name: 'Railway cumulative construction cost',
      color: '#be6235',
      sparse: true,
      points: rail.map((r) => ({
        date: String(r.year),
        x: r.year - 1844,
        value: (r.miles_in_service * r.construction_cost_gbp_per_mile) / 1e6,
      })),
    },
    {
      id: 'rail-revenue',
      name: 'Railway annual revenue',
      color: '#008b83',
      sparse: true,
      points: rail.map((r) => ({
        date: String(r.year),
        x: r.year - 1844,
        value: (r.miles_in_service * r.annual_revenue_gbp_per_mile) / 1e6,
      })),
    },
  ];
  return (
    <section id="evidence">
      <div className="comparison-toolbar">
        <h2>Compare the booms on the same axes</h2>
        <button onClick={() => { setSelected(cases.map((c) => c.id)); setMetric('price'); }}>
          All ten + AI · prices
        </button>
        <button
          onClick={() => { setSelected(['ai-current', 'dotcom2000', 'us1929']); setMetric('cape'); }}
        >
          AI / dot-com / 1929 · CAPE
        </button>
      </div>
      <div className="comparison-choices">
        {cases.map((c, i) => (
          <label key={c.id}>
            <input
              type="checkbox"
              checked={selected.includes(c.id)}
              onChange={() => {
                setSelected(selected.includes(c.id)
                  ? selected.filter((s) => s !== c.id)
                  : [...selected, c.id]);
                if (metric === 'issuers') setMetric('price');
              }}
            />
            <i style={{ background: colors[i] }} />
            {c.name}
          </label>
        ))}
      </div>
      <div className="ab-two">
        <article className="ab-panel">
          <p className="ab-kicker">01 · PRICE VS EARNINGS</p>
          <h3>{metric === 'issuers' ? 'What are investors paying for AI-exposed earnings?' : 'Did prices outrun the earnings underneath?'}</h3>
          <label>
            View{' '}
            <select
              aria-label="Valuation comparison"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
            >
              <option value="issuers">AI-exposed companies · trailing P/E</option>
              <option value="cape">
                Aligned CAPE · same broad-US definition
              </option>
              <option value="whole">Whole market · long-run CAPE</option>
              <option value="pe">
                Aligned reported P/E · different markets
              </option>
              <option value="price">All ten price paths · start = 100</option>
            </select>
          </label>
          {metric === 'issuers' ? <IssuerValuations /> : <>
          {metric === 'whole' ? (
            <Plot
              label="Whole market CAPE"
              unit="× CAPE"
              years={146}
              calendarStart={1881}
              reference={benchmarks.cape.sample.median}
              series={[
                {
                  id: 'market',
                  name: 'Broad US stocks',
                  color: '#008b83',
                  points: benchmarks.cape.series.map((r) => ({
                    date: r.date,
                    x: elapsedYears(r.date, '1881-01'),
                    value: r.value,
                  })),
                },
              ]}
            />
          ) : (
            <Plot
              key={metric}
              label="Historical valuation overlay"
              unit={
                metric === 'price'
                  ? 'index'
                  : metric === 'cape'
                    ? '× CAPE'
                    : '× P/E'
              }
              series={priceSeries}
              logarithmic={metric === 'price'}
              years={4}
            />
          )}
          <p className="ab-note">
            {metric === 'whole'
              ? 'Year 0 = January 1881. Current CAPE ' +
                benchmarks.cape.current.cape.toFixed(1) +
                '×; historical median ' +
                benchmarks.cape.sample.median.toFixed(1) +
                '×.'
              : `Year 0 = 24 months before each historical reference; AI starts ${metric === 'price' ? currentPrices[0]?.date ?? 'unavailable' : '2024-08'}. Year 2 is the historical reference or AI’s latest plotted month—not a forecast AI peak. These are common comparison windows, not scientifically identified bubble onsets.`}
          </p>
          {metric === 'price' && (
            <p className="ab-note">
              <b>AI price observations through {currentPrices.at(-1)?.date ?? 'unavailable'}.</b>{' '}
              Nasdaq Composite is a broad-tech proxy. Visits request updates when due; a successful check need not add a completed month.{' '}
              {market.failures.length ? market.failures.join(' ') : `Last source verification: ${market.checkedAt.slice(0, 10)}.`}{' '}
              <a href="/api/market">Feed status ↗</a>
            </p>
          )}
          {metric !== 'whole' && (
            <p className="ab-note">
              <b>
                {priceSeries.filter((s) => s.points.length).length}/
                {selected.length} selected histories available.
              </b>{' '}
              {priceSeries
                .filter((s) => !s.points.length)
                .map((s) => s.name)
                .join(', ')}
              {priceSeries.some((s) => !s.points.length) &&
                ': no comparable earnings series; not zero.'}{' '}
              Gold and Bitcoin have no corporate P/E; housing needs price/rent.
              Broad-US CAPE and P/E are context for dot-com and AI, not their
              sector valuations. Reported Japan/China annual points have
              different accounting populations; dots are not monthly estimates.
            </p>
          )}
          <details>
            <summary>Selected dates and valuation sources</summary>
            {cases
              .filter((c) => selected.includes(c.id))
              .map((c) => (
                <p key={c.id}>
                  {c.name}: {c.id === 'ai-current' && metric === 'price' ? currentPrices[0]?.date ?? 'unavailable' : start(c)} → reference {c.id === 'ai-current' && metric === 'price' ? market.anchor : c.anchor}.{' '}
                  <a href={c.source}>Price source ↗</a> · {c.valuationLabel}
                </p>
              ))}
            <a href={benchmarks.cape.sourceUrl}>Shiller earnings/CAPE ↗</a>
          </details>
          </>}
        </article>
        <article className="ab-panel">
          <p className="ab-kicker">02 · SPENDING VS CASH</p>
          <h3>How hard is the buildout stretching its funders?</h3>
          <label>
            Compare{' '}
            <select
              aria-label="Spending denominator"
              value={cashMode}
              onChange={(e) => setCashMode(e.target.value)}
            >
              <option value="ocf">Cash capex / operating cash</option>
              <option value="revenue">Cash capex / revenue</option>
            </select>
          </label>
          <div
            className="comparison-choices"
            aria-label="Financial comparison groups"
          >
            {groups
              .filter((g) => g.id !== 'ai-current')
              .map((g) => (
                <label key={g.id}>
                  <input
                    type="checkbox"
                    checked={dotGroups.includes(g.id)}
                    onChange={() =>
                      setDotGroups(
                        dotGroups.includes(g.id)
                          ? dotGroups.filter((id) => id !== g.id)
                          : [...dotGroups, g.id],
                      )
                    }
                  />
                  <i style={{ background: g.color }} />
                  {g.name}
                </label>
              ))}
          </div>
          <Plot
            key={cashMode}
            label="Historical spending overlay"
            series={cash}
            years={7}
            unit="%"
            reference={cashMode === 'ocf' ? 100 : undefined}
          />
          <p className="ab-note">In the operating-cash view, above 100% means equipment spending exceeds operating cash, before dividends and debt repayments. Company ratios, with Global Crossing on a continuing-operations basis; annual dots versus AI trailing-year snapshots. AI starts January 2023, dot-com FY1996, Micron FY2022.</p>
          <p><b>Cash is the dividing line.</b> Global Crossing had $3.66B of sales in 2001 but used $0.91B continuing operating cash before $2.64B capex; bankruptcy followed. Micron’s trailing year to May 2026 generated $51.4B operating cash against $25.3B equipment spending—stronger funding, not proof that demand will last.</p>
          <p className="ab-note">Coverage: one of the ten crash episodes has matched cash accounts here, plus today’s builders and Micron’s cycle. Global Crossing’s negative-cash and bankruptcy-era ratios are omitted, not zero. Customer commitments are not earned cash.</p>
          <details><summary>Periods, accounting differences and customer commitments</summary>
          <p className="ab-note">
            Same ratio, different cohorts. AI year 0 = January 2023; dot-com
            year 0 = FY1996. AI uses dated whole-company TTM snapshots; dot-com
            uses separately plotted annual supplier, operator and incumbent
            accounts. Micron starts in FY2022 and adds a trailing-year snapshot through May 28, 2026; it is a memory-cycle comparison, not an eleventh crash. Annual dots are not interpolated. Above 100% of operating
            cash needs reserves or financing, before dividends and debt
            repayments.
          </p>
          <p>
            <b>Revenue did not guarantee survival.</b> Global Crossing spent
            $3.37B in 2000 against $0.55B continuing operating cash (613%). In
            2001 it reported $3.66B sales but <b>used $0.91B operating cash</b>,
            before $2.64B capex. It filed for bankruptcy in January 2002, before
            many bonds’ original 2004–2009 maturities. Long-dated debt did not
            eliminate liquidity risk.
          </p>
          <p className="ab-note">
            Global Crossing’s 2001 negative-cash ratio is undefined; 2002
            bankruptcy-era cash coverage is omitted, not a recovery signal.
            Continuing operations exclude discontinued businesses and separately
            presented reorganization cash.{' '}
            <a href={crossing.source}>Restated filing ↗</a>. Cisco’s FY2002
            $2.64B capex includes ~$1.9B buying formerly leased property.{' '}
            <a href={cisco.rows.find((r) => r.fiscalYear === 2002)!.source}>
              Cisco report ↗
            </a>
            . Cisco is a supplier, Global Crossing an operator: their revenues
            are never added as independent final demand.
          </p>
          <p className="ab-note">
            Matched investment/cash accounts exist here for 1 of 10 historical
            episodes. Other selected episodes have no verified series; they are
            not drawn.{' '}
            <a href="/appendix">Accounts, periods and missing data ↗</a>
          </p>
          <p><b>Memory demand can reverse.</b> Micron’s FY2023 equipment spending was $7.7B against $1.6B operating cash; the trailing year to May 2026 shows $25.3B against $51.4B. More cash now supports investment, but does not establish lasting demand. Operating margin moved from −37.0% to +65.6%; these are whole-company results, not AI-only profit. Gross cash equipment purchases exclude separate equipment-contract financing payments and are shown before grants and asset-sale receipts. <a href={micron.sources.fy2023Release}>2023</a> · <a href={micron.sources.fy2025Release}>2025</a> · <a href={micron.source}>latest statements ↗</a></p>
          <p className="ab-note"><b>Customer commitments are not cash already earned.</b> Micron reported ${micronCash.contractLiabilities}M of contract liabilities, mainly customer deposits, at May 28, alongside approximately ${(micronCash.remainingPerformanceObligations/1000).toFixed(0)}B of minimum contracted revenue still to be earned. The separate ${micronCash.expectedDepositsAndCommitments/1000}B expected deposits and related financial commitments (about ${micronCash.expectedCashDeposits/1000}B in cash deposits) includes later agreements; it is not cash received or sales. The filing does not isolate deposits’ contribution to operating cash. <a href={micronCash.source}>Contract and cash-flow disclosures ↗</a></p>
          </details>
          <OracleTiming />
        </article>
      </div>
      <article className="ab-panel ab-section" id="supply-demand-comparison">
        <p className="ab-kicker">03 · SUPPLY SPENDING → LATER REVENUE</p>
        <h3>Did sales follow the investment?</h3>
        <p>
          Today’s builders:{' '}
          <b>
            ${(data.aggregate.capex / 1e9).toFixed(0)}B annual cash investment
          </b>{' '}
          alongside{' '}
          <b>
            ${(data.aggregate.revenue / 1e9).toFixed(0)}B whole-company annual
            revenue
          </b>
          . This is not AI-only demand or project payback. Compare the
          historical paths below.
        </p>
        <p><b>More sales can mean higher prices, not proportionally more usage.</b> Micron’s memory revenue grew much faster than the quantity shipped:</p>
        <div style={{overflowX:'auto'}}><table style={{width:'100%',textAlign:'left',fontSize:14}}>
          <caption style={{textAlign:'left'}}>Micron · {memoryDrivers.period}</caption>
          <thead><tr><th scope="col">Memory</th><th scope="col">Sales growth</th><th scope="col">Average price growth</th><th scope="col">Bit-shipment growth</th></tr></thead>
          <tbody>{memoryDrivers.rows.map(r=><tr key={r.product}><th scope="row">{r.product}</th><td>{r.salesGrowth}</td><td>{r.averagePriceGrowth}</td><td>{r.bitShipmentGrowth}</td></tr>)}</tbody>
        </table></div>
        <p className="ab-note">These are nine-month product-category figures, not the trailing-year totals plotted below. Price and volume effects combine multiplicatively; the reported rounded changes do not reconcile exactly. Memory bits shipped are not AI use or customer productivity. <a href={memoryDrivers.source}>Company explanation ↗</a></p>
        {ai.length === 0 && <output className="ab-note" style={{display:'block'}}>AI historical financial series unavailable. Current totals are shown separately; available historical comparisons remain usable.</output>}
        <div className="comparison-toolbar">
          <label>
            Units{' '}
            <select
              aria-label="Supply demand units"
              value={demandMode}
              onChange={(e) => setDemandMode(e.target.value)}
            >
              <option value="indexed">
                Overlay · first observed annual revenue = 100
              </option>
              <option value="money">Actual dollars · one cohort</option>
              <option value="usrail">US railroads · financial capital & revenue</option>
              <option value="housing">US housing · investment & shelter demand</option>
              <option value="telecom">US telecom industry · investment & billed demand</option>
              <option value="rail">
                UK railways · capital stock and annual sales
              </option>
            </select>
          </label>
          {demandMode === 'money' && (
            <label>
              Cohort{' '}
              <select
                aria-label="Revenue cohort"
                value={cohort}
                onChange={(e) => setCohort(e.target.value)}
              >
                <option value="ai">AI builders</option>
                <option value="dot">Microsoft + Intel</option>
                <option value="cisco">Cisco · equipment supplier</option>
                <option value="micron">Micron · memory cycle</option>
                <option value="globalcrossing">
                  Global Crossing · fiber operator
                </option>
              </select>
            </label>
          )}
          {!['rail', 'telecom', 'housing', 'usrail'].includes(demandMode) && (
            <label>
              Revenue observed{' '}
              <select
                aria-label="Revenue lag"
                value={lag}
                onChange={(e) => setLag(+e.target.value)}
              >
                <option value={0}>in the same period</option>
                <option value={12}>12 months later</option>
                <option value={24}>24 months later</option>
              </select>
            </label>
          )}
        </div>
        {demandMode === 'usrail' ? <UsRailFinancials /> : demandMode === 'housing' ? <HousingEconomics /> : demandMode === 'telecom' ? <TelecomSector /> : <>
        <Plot
          key={demandMode + '-' + lag + '-' + cohort}
          label="Supply and later revenue"
          series={demandMode === 'rail' ? railSeries : demand}
          years={7}
          unit={
            demandMode === 'rail'
              ? '£M'
              : demandMode === 'money'
                ? '$B'
                : '% of initial revenue'
          }
        />
        <p>
          <b>
            {demandMode === 'rail'
              ? 'Railway revenue grew—but building the network tied up much more capital.'
              : 'Filled = capital spending; dashed lines / hollow dots = revenue.'}{' '}
          </b>
          {demandMode === 'rail'
            ? 'Year 0 = 1844. Construction cost is accumulated capital, while revenue is one year’s sales. These are not two annual flows or a payback calculation.'
            : 'Both lines use the same denominator within each cohort, so their levels remain comparable. Cohort baselines are their first available revenue observation, not an identical calendar year. With a lag, revenue is shifted back to the spending date it is compared with. Only dates with both observed earlier spending and later revenue are shown; no unmatched earlier investment is implied.'}
        </p>
        <p className="ab-note">
          {demandMode === 'rail' ? (
            <>
              <a href={railway.series.source}>
                UK railway industry, source Table 1 ↗
              </a>
              . Derived totals = miles in service × per-mile figures; not US
              railroads 1873. No operating-cost or profit claim.
            </>
          ) : (
            <>
              Micron sales include non-AI memory and are upstream of customer revenue: do not add them as new final demand. AI: five builders across all businesses; dot-com cohorts remain
              separate. Cisco ends in July; Global Crossing in December;
              Microsoft/Intel have different fiscal ends. Sales include existing
              businesses; AI-attributable revenue is not separately identified.
              Later revenue does not prove that earlier capex caused it, and
              revenue is not cash available for payback. TTM snapshots overlap
              and must not be summed. AI lags shift dated TTM snapshots; dot-com
              lags compare fiscal-year labels, not identical calendar periods.
              Micron annual lags match fiscal years despite 52/53-week date shifts; its latest TTM has no matched 12/24-month predecessor here and is omitted at those lags. Neither traces project cash flows. Micron starts September 1, 2022. Year 0: AI January 2023;
              dot-com FY1996. <a href="/api/export">AI accounts ↗</a> ·{' '}
              <a href="/appendix">Historical statements ↗</a>.
            </>
          )}
        </p>
        <p className="ab-note">
          First-observation bases:{' '}
          {groups
            .filter((g) => enabled(g.id) && g.rows.length > 0)
            .map(
              (g) =>
                `${g.name}: ${fiscalDate(g.id, g.rows[0].date)}, $${(g.rows[0].revenue / 1e9).toFixed(2)}B`,
            )
            .join(' · ')}
          . Global Crossing starts in FY2000 because earlier comparable restated
          rows are unavailable here. Its 2002 observation is after bankruptcy,
          with prepetition interest suspended; it is not normal profitability or
          a known-at-the-time forecast.
        </p>
        </>}
        <details>
          <summary>Why not ten supply-and-revenue lines?</summary>
          <p>
            Gold and Bitcoin are assets without corporate revenue. Housing
            is shown through residential investment and housing-service flows,
            not house resale turnover; imputed owner rent is not cash revenue. Matched investment, income and cohort
            definitions are missing for US railroads 1873, 1929, Japan and the
            China episodes. UK railways provide an additional infrastructure
            comparison. Inventing or substituting unrelated accounts would
            create a misleading ten-case comparison.
          </p>
        </details>
      </article>
    </section>
  );
}
