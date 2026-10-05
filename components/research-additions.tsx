/* oxlint-disable next/no-html-link-for-pages -- Evidence links include downloads. */
'use client';
import forward from '@/data/forward-risk.json';
import boom from '@/data/boom.json';
import evidence from '@/data/observatory.json';
import { Spark } from './compact-dashboard';
const f = (n: number) => n.toFixed(5);
const p = (n: number) => `${(n * 100).toFixed(1)}%`;
const models = ['constant', 'distance_volatility', 'full'] as const;
const labels = {
  constant: 'Constant training rate',
  distance_volatility: 'Drawdown + volatility (development-selected)',
  full: 'Full four-feature model',
};
export default function ResearchAdditions() {
  return (
    <>
      <section id="boom">
        <h2>Financial losses and productive value</h2>
        <p>{boom.homepage.body}</p>
        <p>
          Inspired by{' '}
          <a href="https://press.stripe.com/boom">
            Byrne Hobart and Tobias Huber’s Boom
          </a>
          . The two-outcome lens is our application of the argument; no
          productive-value bonus is added to the risk score.
        </p>
        {boom.appendix
          .filter((_, i) => i !== 1)
          .map((a, i) => (
            <p key={i}>
              {a.text}{' '}
              {a.sourceIds.map((id) => {
                const s = boom.sources.find((x) => x.id === id)!;
                return (
                  <a key={id} href={s.url}>
                    {s.title} ↗
                  </a>
                );
              })}
            </p>
          ))}
        <div className="ob-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Episode</th>
                <th>Financial exposure</th>
                <th>Observed productive evidence</th>
                <th>What it does not establish</th>
              </tr>
            </thead>
            <tbody>
              {boom.cases.map((c) => (
                <tr key={c.caseId}>
                  <td>{c.name}</td>
                  <td>
                    {c.lossRisk}{' '}
                    {c.lossRiskSourceIds.map((id) => {
                      const s = boom.sources.find((x) => x.id === id)!;
                      return (
                        <a key={id} href={s.url}>
                          Source ↗{' '}
                        </a>
                      );
                    })}
                  </td>
                  <td>
                    {c.productiveEvidence}{' '}
                    {c.productiveEvidenceSourceIds.map((id) => {
                      const s = boom.sources.find((x) => x.id === id)!;
                      return (
                        <a key={id} href={s.url}>
                          Source ↗{' '}
                        </a>
                      );
                    })}
                  </td>
                  <td>{c.uncertainty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          The FCC counts lines or wireless channels above 200 Kbps in at least
          one direction, not unique people. Its rounded endpoints should not be
          used to override the source’s reported growth rate. The railway
          figures include Ireland and do not describe the US 1873 episode. No
          monthly series is interpolated from these observations.
        </p>
        <p>
          Still needed for AI: paid usage and retention, cost per successful
          task, energized versus idle capacity, equipment resale value and
          economic useful life. These would help test the productive-boom
          hypothesis; capex announcements alone do not.
        </p>
        <details>
          <summary>Book scope and exact source locators</summary>
          <p>
            We reviewed the official synopsis and Apollo excerpt, not the full
            book. Public funding and overinvestment: zine pp. 19–21;
            semiconductor spillovers and counterfactual qualification: pp.
            30–31; nonfinancial legacy: pp. 32–33. These are author
            interpretations, not causal estimates of the net benefit of bubbles.
          </p>
          {boom.sources.slice(0, 6).map((s) => (
            <p key={s.id}>
              <a href={s.url}>{s.title}</a> — {'locator' in s ? s.locator : ''}
            </p>
          ))}
        </details>
      </section>
      <section id="forward-risk">
        <h2>A longer-horizon test: no convincing improvement</h2>
        <p>
          New research asks a different question: will any of the next 12
          monthly observations be at least 20% below today’s price? A new price
          threshold is set at each forecast origin. Already-declining markets
          remain in the sample. This is neither a monthly crash-entry
          probability nor the chance a fundamental bubble exists.
        </p>
        <pre>
          {
            'Yₜ = 1 if min(Pₜ₊₁,…,Pₜ₊₁₂) ≤ 0.8 Pₜ\nAll 12 consecutive future observations must exist before scoring.\nSelected p = logistic(−1.420492589 − 0.348248061 z_drawdown + 0.303113978 z_vol12)\nz_drawdown = (drawdown + 0.099607477) / 0.135085233\nz_vol12 = (vol12 − 0.067705374) / 0.044804680'
          }
        </pre>
        <p>
          Training, development and retrospective test periods retain the
          original chronology. Each complete future outcome window must fit
          wholly inside its assigned period. Training outcomes end by 1984;
          development outcomes are within 1987–1997; test outcomes are within
          2000–2024. Standardization and coefficients use training only;
          development selects the ridge penalty and candidate. The simpler
          two-feature model wins development Brier error. We had already
          examined the later period in previous research: this is explicitly a
          retrospective comparison, not a fresh untouched holdout.
        </p>
        <div className="ob-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Industry Brier</th>
                <th>Nasdaq Brier</th>
                <th>Current Nasdaq estimate</th>
              </tr>
            </thead>
            <tbody>
              {models.map((name) => (
                <tr key={name}>
                  <td>{labels[name]}</td>
                  <td>{f(forward.validation.models[name].brier)}</td>
                  <td>{f(forward.nasdaq.models[name].brier)}</td>
                  <td>{p(forward.nasdaq.current[`p_${name}`])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Industry Brier improvement for the selected model:{' '}
          {f(forward.uncertainty.distance_volatility_vs_constant.point)}, with a
          95% interval of{' '}
          {f(forward.uncertainty.distance_volatility_vs_constant.lower_95)} to{' '}
          {f(forward.uncertainty.distance_volatility_vs_constant.upper_95)}. The
          Nasdaq interval also spans zero. Both use 2,000 resamples of circular
          24-month calendar blocks, preserving all industries together. The
          model’s apparent advantage is not established with confidence.
        </p>
        <p>
          At a 10% cutoff the selected model flags every test month—an unusable
          alarm rule here. The predeclared 20% cutoff gives the counts below.
          Positive rows are overlapping forecast windows, not distinct crashes;
          adjacent forecasts can refer to the same decline.
        </p>
        <div className="ob-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sample</th>
                <th>Forecast windows</th>
                <th>Positive windows</th>
                <th>Caught</th>
                <th>False alarms</th>
                <th>Missed</th>
                <th>True negatives</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  [
                    'US industries',
                    forward.validation.models.distance_volatility,
                  ],
                  [
                    'Nasdaq transfer',
                    forward.nasdaq.models.distance_volatility,
                  ],
                ] as const
              ).map(([name, v]) => {
                const value =
                  v as typeof forward.nasdaq.models.distance_volatility;
                const a = value.operating_points['0.2'];
                return (
                  <tr key={String(name)}>
                    <td>{String(name)}</td>
                    <td>{value.n}</td>
                    <td>{value.positive_labels}</td>
                    <td>{a.tp}</td>
                    <td>{a.fp}</td>
                    <td>{a.fn}</td>
                    <td>{a.tn}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p>
          Current research snapshot: {p(forward.nasdaq.current.probability)} for
          September 2026–August 2027, using the August 2026 Nasdaq close. The
          loss threshold is{' '}
          {forward.nasdaq.current.threshold.toLocaleString('en-US')}. The
          constant comparator is {p(forward.nasdaq.current.p_constant)}. These
          are uncalibrated transfers from US industry total returns to a broad
          technology price index, not AI-specific odds. This research snapshot
          does not update with the separate monthly live feed.
        </p>
        <p>
          Literature motivates specifying both horizon and loss size.{' '}
          <a href="https://doi.org/10.1093/qje/qjw034">Martin (2017)</a> studies
          market crash probabilities, but this next-12-month minimum-price
          target is an original adaptation, not a replication or a
          literature-standard bubble score.
        </p>
        <details>
          <summary>Calibration and monthly forecast/outcome tables</summary>
          {models.map((name) => (
            <div key={name}>
              <h3>{labels[name]} · industry calibration</h3>
              <div className="ob-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Forecast bin</th>
                      <th>Windows</th>
                      <th>Mean estimate</th>
                      <th>Observed frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forward.validation.models[name].calibration
                      .filter((b) => b.n)
                      .map((b, i) => (
                        <tr key={i}>
                          <td>
                            {p(b.low)}–{p(b.high)}
                          </td>
                          <td>{b.n}</td>
                          <td>
                            {b.mean_probability == null
                              ? '—'
                              : p(b.mean_probability)}
                          </td>
                          <td>
                            {b.observed_frequency == null
                              ? '—'
                              : p(b.observed_frequency)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {forward.cases.map((c) => (
            <div key={c.id}>
              <h3>{c.name}</h3>
              <p>
                {c.observation_convention}. {c.domain_status}. {c.timing_status}
                .
              </p>
              <div className="ob-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Forecast origin</th>
                      <th>Outcome window</th>
                      <th>Model</th>
                      <th>Constant</th>
                      <th>Full model</th>
                      <th>Observed future loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.points.map((v) => (
                      <tr key={v.date}>
                        <td>{v.date}</td>
                        <td>
                          {v.outcomeStart}–{v.outcomeEnd}
                        </td>
                        <td>{v.risk12?.toFixed(2)}%</td>
                        <td>{v.constant.toFixed(2)}%</td>
                        <td>{v.full.toFixed(2)}%</td>
                        <td>
                          {v.futureLoss == null
                            ? 'Unknown'
                            : Math.max(0, v.futureLoss).toFixed(2) + '%'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </details>
        <p>
          <a href="/api/forward-risk">
            Download full protocol, model comparisons and chart data
          </a>
          . Independent audits rebuilt raw labels, features, partition
          membership, predictions, block intervals and all 490 historical case
          rows. Those arithmetic checks do not establish economic validity.
        </p>
      </section>
      <section id="us-rail-full">
        <h2>US railroads: the complete 1868–1878 comparison</h2>
        <Spark
          points={evidence.railroadFull}
          field="price"
          max={150}
          height={220}
          anchor="1872-04"
          domain={[-51, 80]}
          ticks={[-51, -27, -3, 21, 45, 69]}
          calendar
          annotations={[
            { offset: 17, label: 'September 1873 panic' },
            { offset: 62, label: 'June 1877 trough' },
          ]}
          title="US railroad monthly stock-price index, 1868–1878; April 1872 = 100"
        />
        <p>
          April 1872 = 100; September 1873 marks the panic; June 1877 is the
          later trough, 47.81% below the reference. These dates are distinct.
          The compact dashboard’s fixed ±24-month window ends before this
          trough.
        </p>
        <details>
          <summary>Full monthly observations</summary>
          <div className="ob-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Index · April 1872 = 100</th>
                </tr>
              </thead>
              <tbody>
                {evidence.railroadFull.map((v) => (
                  <tr key={v.date}>
                    <td>{v.date}</td>
                    <td>{v.price.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>
    </>
  );
}
