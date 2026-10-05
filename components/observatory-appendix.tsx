/* oxlint-disable next/no-html-link-for-pages, jsx-a11y/prefer-tag-over-role -- Native links navigate evidence/download routes; inline data SVGs require image semantics. */
'use client';
import evidence from '@/data/observatory.json';
import { Spark } from './compact-dashboard';
import ThemeToggle from './theme-toggle';
import ResearchAdditions from './research-additions';
const fmt = (v: unknown) =>
  v == null
    ? '—'
    : typeof v === 'number'
      ? v.toFixed(3)
      : typeof v === 'string'
        ? v
        : (JSON.stringify(v) ?? '—');
const pct = (v: number | null) =>
  v == null ? '—' : `${(100 * v).toFixed(2)}%`;
function GridTable({ rows }: { rows: Record<string, unknown>[] }) {
  if (!rows.length) return <p>No observations acquired.</p>;
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  return (
    <div className="ob-table-wrap">
      <table>
        <thead>
          <tr>
            {keys.map((k) => (
              <th key={k}>{k.replaceAll('_', ' ')}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {keys.map((k) => (
                <td key={k}>{fmt(r[k])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Calibration({
  bins,
}: {
  bins: {
    n: number;
    mean_prediction: number | null;
    observed_frequency: number | null;
  }[];
}) {
  const points = bins.filter(
    (b) => b.n && b.mean_prediction != null && b.observed_frequency != null,
  );
  return (
    <svg
      viewBox="0 0 440 220"
      role="img"
      aria-label="Calibration: predicted versus observed drawdown entry frequency"
      style={{ maxWidth: 600, width: '100%' }}
    >
      <line x1="40" y1="180" x2="400" y2="15" className="ob-reference" />
      <line x1="40" y1="180" x2="400" y2="180" className="ob-gridline" />
      <line x1="40" y1="180" x2="40" y2="15" className="ob-gridline" />
      {points.map((b, i) => (
        <circle
          key={i}
          cx={40 + 360 * b.mean_prediction!}
          cy={180 - 165 * b.observed_frequency!}
          r={4 + Math.sqrt(b.n) / 25}
          fill="currentColor"
        >
          <title>{`Predicted ${pct(b.mean_prediction)}, observed ${pct(b.observed_frequency)}, n=${b.n}`}</title>
        </circle>
      ))}
      <text x="40" y="201" fill="currentColor" fontSize="12">
        0%
      </text>
      <text x="372" y="201" fill="currentColor" fontSize="12">
        100%
      </text>
      <text x="140" y="215" fill="currentColor" fontSize="12">
        Predicted frequency →
      </text>
      <text x="3" y="13" fill="currentColor" fontSize="12">
        Observed ↑
      </text>
    </svg>
  );
}
export default function ObservatoryAppendix({
  children,
}: {
  children?: React.ReactNode;
}) {
  const r = evidence.research,
    m = r.model;
  const uk = evidence.uk.prices;
  const ukStart = Date.parse(uk[0].inferred_week_end);
  const ukEnd = Date.parse(uk[uk.length - 1].inferred_week_end);
  const ukX = (date: string) =>
    45 + ((Date.parse(date) - ukStart) / (ukEnd - ukStart)) * 700;
  const ukPath = (field: keyof (typeof uk)[number]) =>
    uk
      .map(
        (p, i) =>
          `${i ? 'L' : 'M'}${ukX(p.inferred_week_end).toFixed(2)},${(230 - (Number(p[field]) / 2200) * 210).toFixed(2)}`,
      )
      .join(' ');
  return (
    <div className="ob-appendix">
      <header>
        <a href="/">← One-page dashboard</a>
        <ThemeToggle />
      </header>
      <h1>Evidence & appendix</h1>
      <p>
        Research release: {evidence.generatedAt}. Historical charts are
        reconstructions from revised data. Financial feeds and the frozen Nasdaq
        inference refresh separately; historical model fitting is not an
        automatic feed.
      </p>
      <nav>
        <a href="#prospective-record">Prospective record</a> ·{' '}
        <a href="#forecast-method">Formula</a> ·{' '}
        <a href="#calibration">Validation</a> · <a href="#railways">Railways</a>{' '}
        · <a href="#case-data">Case data</a> ·{' '}
        <a href="#sources">Sources & exports</a> ·{' '}
        <a href="#ecosystem">AI ecosystem</a>
      </nav>
      {children}
      <ResearchAdditions />
      <section id="forecast-method">
        <h2>What the monthly percentage means</h2>
        <p>
          At month-end, estimate the chance that the{' '}
          <em>next monthly observation</em> is at least 20% below the highest of
          the most recent 12 monthly observations. Only estimate entry when the
          current observation is above that barrier. The barrier is fixed when
          the estimate is made. An ineligible month is blank, not a zero chance
          of further losses.
        </p>
        <pre>
          {
            'Hₜ = max(Pₜ₋₁₁, …, Pₜ)\nEligible if Pₜ > 0.8 Hₜ\nYₜ₊₁ = 1 if Pₜ₊₁ ≤ 0.8 Hₜ, otherwise 0\npₜ₊₁ = 1 / (1 + exp(−[β₀ + Σ βⱼ(xⱼ−μⱼ)/sⱼ]))'
          }
        </pre>
        <p>
          Inputs: one-month log return, 12-month log return, sample standard
          deviation of the last 12 monthly log returns, and drawdown from the
          trailing 12-month peak. These return-path variables measure proximity
          to a drawdown barrier. Valuations, capex, interest rates and energy
          commitments are separate diagnostics; this model has not established
          their incremental predictive value.
        </p>
        <GridTable
          rows={m.features.map((feature, i) => ({
            feature,
            training_mean: m.standardization_mean[i],
            training_sd: m.standardization_std[i],
            coefficient: m.intercept_and_slopes[i + 1],
          }))}
        />
        <p>
          Intercept: {m.intercept_and_slopes[0].toFixed(9)}. Ridge penalty:{' '}
          {m.lambda}. Training base rate: {pct(m.train_base_rate)}. Feature
          scaling uses the training population standard deviation; the
          volatility predictor uses a sample standard deviation.
        </p>
        <h3>Literature and the limits of this design</h3>
        <p>
          <a href="https://www.nber.org/papers/w23191">
            Greenwood, Shleifer & You, Bubbles for Fama
          </a>{' '}
          motivates studying run-ups, volatility and subsequent crash risk
          across the full opportunity set. This one-month barrier target is an
          original exploratory design, not a replication of that paper’s
          longer-horizon crash definition.{' '}
          <a href="https://stat.uw.edu/research/tech-reports/strictly-proper-scoring-rules-prediction-and-estimation">
            Proper scoring rules
          </a>{' '}
          motivate evaluating probability forecasts with Brier error and
          calibration, rather than showcasing a few famous crashes.
        </p>
        <p>
          The separate price-exuberance percentile on the dashboard uses a
          right-tailed autoregression and bootstrap null. It measures an unusual
          price path, not the probability a bubble exists. Its original
          protocol, sensitivity checks and ten-case benchmark remain below.
        </p>
        <h3>Time split and reproducibility</h3>
        <p>
          49 US industry total-return portfolios. Training target months through
          December 1984; development 1987–1997; test 2000–2024. Two-year gaps
          separate periods. Standardization is fitted on training only;
          development Brier error selects a penalty from four frozen candidates.
          Test data do not select features, coefficients, threshold or
          calibration. The 10% alarm cutoff was fixed before evaluation.
        </p>
        <p>
          The protocol was frozen before the first fit in this task, not
          prospectively registered decades ago. The data are revised; the
          literature itself incorporates historical knowledge. Industry
          observations overlap, so uncertainty resamples entire calendar years
          with all industries together. It does not fully capture dependence
          across years or model-selection uncertainty.
        </p>
        <p>
          Charts before training ends are future-trained backcasts; the 1989
          case belongs to the development era. Later asset examples are
          transfers to different markets and often monthly means. None are
          contemporaneous, point-in-time trading records.
        </p>
      </section>
      <section id="calibration">
        <h2>Actual forecast performance</h2>
        <p>
          Lower Brier score is better. The baseline is the constant training
          event prevalence, kept fixed in the test. The ten selected boom/bust
          charts are not used to calculate these rates.
        </p>
        <GridTable
          rows={[
            ['US industry test', r.validation, r.validation_ci],
            [
              'Nasdaq transfer test',
              r.current_proxy_validation,
              r.current_proxy_validation_ci,
            ],
          ].map(([name, value, interval]) => {
            const v = value as typeof r.validation;
            const ci = interval as typeof r.validation_ci;
            return {
              sample: name,
              eligible_observations: v.n,
              entries: v.events,
              Brier: v.brier,
              baseline_Brier: v.baseline_brier,
              skill: pct(v.brier_skill),
              improvement_95_interval: `${ci.lower_95.toFixed(6)} to ${ci.upper_95.toFixed(6)}`,
              hits: v.confusion.tp,
              false_alarms: v.confusion.fp,
              misses: v.confusion.fn,
              true_negatives: v.confusion.tn,
              precision: pct(v.confusion.precision),
              recall: pct(v.confusion.recall),
            };
          })}
        />
        <p>
          The industry test improves Brier error, but its probabilities are
          visibly miscalibrated. Nasdaq has only six events; its improvement
          interval includes zero. At 10%, the Nasdaq model catches four entries,
          misses two, and produces sixteen false alarms. An always-no-entry
          prediction has higher classification accuracy; rarity makes “accuracy”
          a poor headline here.
        </p>
        <h3>Calibration: industry holdout</h3>
        <Calibration bins={r.validation.calibration} />
        <p>
          Each dot is a forecast bin; the diagonal is perfect calibration. Dot
          size reflects sample size. Hover for exact values.
        </p>
        <GridTable
          rows={r.validation.calibration.map((b) => ({
            forecast_bin: `${pct(b.low)}–${pct(b.high)}`,
            months: b.n,
            predicted: pct(b.mean_prediction),
            observed: pct(b.observed_frequency),
            events: b.events,
          }))}
        />
        <h3>Why low monthly odds are not an all-clear</h3>
        <p>
          The model is mostly a drawdown-entry detector, not an early warning of
          fundamental overvaluation or a market top. The original ten example
          peak-month estimates are all below the 10% alert threshold; the next
          monthly observation at those peaks also does not satisfy this narrowly
          defined target.
        </p>
        <p>
          US housing declined about 27.4% from July 2006 to February 2012, yet
          generated no crossing under this rolling 12-month definition in
          2006–2012. A slowly declining peak lowers the barrier. This limitation
          is retained openly, rather than changing the target after seeing a
          miss. Repeated entries after recovery are possible; event counts are
          not counts of distinct bubbles.
        </p>
        <p>
          Independent audits recomputed labels, standardization, sample
          volatility, predictions, Brier errors and confusion counts. The chart
          pipeline independently reproduces exported probabilities within 5 ×
          10⁻¹¹. These numerical checks do not establish economic validity or
          calibrated AI probabilities.
        </p>
      </section>
      <section id="railways">
        <h2>Railroads: measured US prices, reconstructed UK history</h2>
        <p>
          US railroads use Macaulay’s monthly chain price index, independently
          matched between{' '}
          <a href="https://data.nber.org/databases/macrohistory/rectdata/11/m11005.dat">
            NBER originals
          </a>{' '}
          and{' '}
          <a href="https://fred.stlouisfed.org/series/M11005USM293NNBR">FRED</a>
          , with zero discrepancies. This is a stock-price index, not total
          return. Unreliable 1855–1856 values are excluded. The declared
          1868–1878 window peaks in April 1872; the September 1873 panic is 17
          months later. The subsequent June 1877 trough is 47.81% below that
          peak. The compact chart is a shorter fixed comparison window. The full
          series is plotted above.
        </p>
        <p>
          <a href="https://fred.stlouisfed.org/series/M13019USM156NNBR">
            High-grade railroad bond yields
          </a>{' '}
          are a separate monthly borrowing-cost series. They are not equity
          yields or P/E. A financing panic can occur without an aggregate
          railroad equity price bubble.
        </p>
        <h3>British Railway Mania, 1843–1850</h3>
        <svg
          className="ob-rail-chart"
          viewBox="0 0 770 265"
          role="img"
          aria-label="UK railway price indices, digitized approximation, 1843–1850, delisting uncertainty"
        >
          <line x1="45" x2="745" y1="230" y2="230" className="ob-gridline" />
          <path
            d={ukPath('all_rail_zero_delisting_loss_index_approx')}
            className="ob-price-line"
            fill="none"
          />
          <path
            d={ukPath('all_rail_full_delisting_loss_index_approx')}
            className="ob-risk-line"
            fill="none"
            strokeDasharray="6 4"
          />
          {[0, 1000, 2000].map((v) => (
            <text
              key={v}
              x="38"
              y={234 - (v / 2200) * 210}
              textAnchor="end"
              fill="currentColor"
              fontSize="16"
            >
              {v}
            </text>
          ))}
          {['1843-01-06', '1845-01-01', '1847-01-01', '1850-01-01'].map((v) => (
            <text
              key={v}
              x={ukX(v)}
              y="254"
              textAnchor="middle"
              fill="currentColor"
              fontSize="16"
            >
              {v.slice(0, 4)}
            </text>
          ))}
        </svg>
        <p>
          <b>Digitized approximation</b> from Campbell (2013), Figure 1: 417
          original PDF vector vertices. Weekly indices, January 1843 ≈ 1000;
          allowance of ±2 index points and inferred dates approximately ±1 week.
          Solid / dashed curves assume 0% / 100% shareholder loss on delisting.
          Dividends are excluded; returns adjust for capital calls. Four
          independently printed peak/trough values match extraction within one
          point. These are not raw transaction data and do not enter the monthly
          forecasting benchmark.
        </p>
        <p>
          <a href="https://pureadmin.qub.ac.uk/ws/files/17386220/RailwayDeriving.pdf">
            Campbell, Deriving the Railway Mania
          </a>{' '}
          and{' '}
          <a href="https://mpra.ub.uni-muenchen.de/61115/1/MPRA_paper_61115.pdf">
            Myopic Rationality in a Mania
          </a>{' '}
          document partly paid shares and future capital calls. Investors could
          lose their paid stake and face additional calls; the economics differ
          from fully paid stock. Short-run dividend expectations explain part of
          the mania in this literature, so the price curve alone is not proof of
          irrationality.
        </p>
        <details>
          <summary>Actual dated UK valuation observations</summary>
          <h3>Dividend yields</h3>
          <GridTable rows={evidence.uk.dividends} />
          <p>
            Cross-sectional means. Ten selected dates, not a complete monthly
            series; reciprocal yield is not a measured P/E.
          </p>
          <h3>Price / par</h3>
          <GridTable rows={evidence.uk.pricePar} />
          <p>
            Part-paid shares are adjusted to fully paid equivalents by adding
            future calls discounted at 3% to price and par. Author-modeled
            call-adjusted ratios, not P/B or unadjusted share prices.
          </p>
          <h3>Capital-call cohorts</h3>
          <GridTable rows={evidence.uk.capitalCalls} />
          <p>
            Royal-assent cohorts, not calendar annual returns. Partial-paid
            observed returns and hypothetical fully-paid returns differ in
            financing assumptions; the 1847 cohort contains only two firms.
          </p>
        </details>
      </section>
      <section id="case-data">
        <h2>Historical observations & who bore the downside</h2>
        <p>
          Shared price normalization is for visual comparison only and uses a
          hindsight reference. Risk estimates use only earlier observations and
          frozen coefficients. Annual P/E points are not filled into missing
          months. Japan uses NRI 350 reported earnings; China uses SSE year-end
          observations. Dot-com and current AI valuations use broad US market
          context, not Nasdaq or AI-only P/E.
        </p>
      </section>
      {[...evidence.cases, evidence.ai].map((c) => (
        <section key={c.id} id={c.id}>
          <h2>{c.name}</h2>
          <p>
            Reference {c.anchor}. {c.priceLabel}. {c.forecastStatus}. {c.note}
          </p>
          <p>
            <b>First exposed:</b> {c.risk.direct}
          </p>
          <p>
            <b>Transmission:</b> {c.risk.transmission}
          </p>
          <p>
            <b>Public burden:</b> {c.risk.public}
          </p>
          <p>
            <a href={c.source}>Price / historical source</a> ·{' '}
            {c.risk.sources.map((url, i) => (
              <span key={url}>
                <a href={url}>Risk evidence {i + 1}</a> ·{' '}
              </span>
            ))}
          </p>
          <Spark
            points={c.points}
            field="price"
            max={150}
            anchor={c.anchor}
            height={130}
            title={`${c.name} normalized prices`}
          />
          <details>
            <summary>Monthly chart data and reconstructed forecasts</summary>
            <GridTable
              rows={c.points.map((p) => ({
                month: p.date,
                from_reference: p.offset,
                price_reference_100: p.price,
                forecast_made: p.forecastAsOf,
                forecast_pct: p.risk,
                observed_crossing: p.event,
                eligible: p.eligible,
              }))}
            />
          </details>
          <details>
            <summary>Valuations and investment observations</summary>
            <p>
              {c.valuationLabel}. {c.valuationCadence}. Shiller earnings are
              interpolated in the source. Fiscal investment series are selected
              survivor firms and not the full dot-com or telecom sector.
            </p>
            <GridTable rows={c.valuations} />
            <GridTable rows={c.investment} />
            {c.credit.length > 0 && <GridTable rows={c.credit} />}
          </details>
        </section>
      ))}
      <section id="sources">
        <h2>Source ledger & downloads</h2>
        <p>
          <a href="/api/observatory">
            Download chart data, formula, validation and provenance (JSON)
          </a>{' '}
          · <a href="/api/market">Latest dated Nasdaq model estimate (JSON)</a>{' '}
          · <a href="/api/validation">Previous exuberance benchmark (JSON)</a> ·{' '}
          <a href="/api/export">SEC accounts export</a>
        </p>
        <p>
          Railroad sources: Macaulay (1938), NBER Macrohistory series 11005 and
          13019. Nasdaq: FRED NASDAQCOM. Industry portfolios:{' '}
          <a href="https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/Data_Library/det_49_ind_port.html">
            Kenneth French Data Library
          </a>
          . US P/E and CAPE:{' '}
          <a href="https://shillerdata.com/">Robert Shiller data</a>. Japanese
          P/E:{' '}
          <a href="https://economics.mit.edu/sites/default/files/publications/1-s2.0-0304405X91900066-main.pdf">
            French & Poterba, Table 4
          </a>
          ; 1989 reported P/E 53.7 versus accounting-adjusted 32.6. SSE
          observations are annual endpoints, including December 2015 after the
          crash.
        </p>
        <details>
          <summary>Annual P/E sources and accounting definitions</summary>
          <GridTable
            rows={evidence.fundamentals.annualValuations.map((v) => ({
              case: v.caseId,
              date: v.date,
              pe: v.pe,
              proxy: v.proxy,
              note: v.note,
              source: v.source,
            }))}
          />
        </details>
        <details>
          <summary>Capex, cash-flow and revenue source accounts</summary>
          {evidence.fundamentals.capexFinancials.map((v, i) => (
            <div key={i}>
              <h3>
                {v.company} · {v.periodEnd}
              </h3>
              <p>
                Capex / OCF {pct(v.capexToOCF)} · Capex / revenue{' '}
                {pct(v.capexToRevenue)}. {v.warning}
              </p>
              {v.sources.map((s, j) => (
                <p key={j}>
                  <a href={s.url}>
                    {'locator' in s ? s.locator : 'Company filing'}
                  </a>
                </p>
              ))}
            </div>
          ))}
        </details>
        <h3>Private labs: financing snapshots</h3>
        {evidence.fundamentals.labValuations.map((v) => (
          <p key={v.company}>
            <a href={v.source}>
              {v.company} · {v.date}
            </a>
            : {v.qualification}
          </p>
        ))}
        <p>
          These are private equity valuation / annualized revenue pace, not
          public P/E, enterprise value / revenue, or audited annual sales. No
          numeric loss allocation or probability effect is inferred from them.
        </p>
      </section>
      <h2>Full company, macro and original-model evidence</h2>
      <p>
        The earlier detailed dashboard is preserved below, including individual
        company accounts, OpenAI, Anthropic, SpaceX/xAI, Nvidia, interest rates,
        energy assumptions and the retired hand-weighted score. The compact
        dashboard above uses distinct measures, not that retired aggregate
        score.
      </p>
    </div>
  );
}
