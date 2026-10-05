/* oxlint-disable next/no-html-link-for-pages -- Direct dataset links. */
import data from '@/data/sp500-exposure.json';
export default function SP500Exposure() {
  return (
    <details className="ab-details" open>
      <summary>How much of the S&P 500 is Mag7 or AI-adjacent?</summary>
      <h3>Mag7: 31.2% of market value, 25.7% of expected earnings</h3>
      <p>
        Yardeni / LSEG, September 4, 2026. The same-chart shares imply Mag7
        trades at about{' '}
        <strong>
          21% more per dollar of forecast earnings than the index overall
        </strong>
        . Forecast earnings may disappoint; this is not a share of crash risk.
      </p>
      {[
        { name: 'Mag7 market-value share', value: 31.2 },
        { name: 'Mag7 forward-earnings share', value: 25.7 },
      ].map((g) => (
        <div key={g.name} style={{ margin: '14px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{g.name}</span>
            <strong>{g.value.toFixed(1)}%</strong>
          </div>
          <div style={{ height: 8, background: 'var(--ab-line,#ddd)' }}>
            <div
              style={{
                width: `${g.value}%`,
                height: 8,
                background: 'currentColor',
              }}
            />
          </div>
        </div>
      ))}
      <p className="ab-note">
        <a href="https://yardeni.com/charts/us-stock-market/stock-market-investment-styles/magnificent-7">
          Yardeni chart, Figure 2 ↗
        </a>
        . Premium calculation: 31.2 ÷ 25.7 − 1. Analyst forward earnings, not
        realized cash; both Alphabet share classes included.
      </p>
      <h3>Ownership exposure beyond Mag7</h3>
      <p>
        Share of SPY portfolio value, September 3, 2026. An S&P 500 ETF
        proxy—not percentages of the index’s P/E.
      </p>
      {[
        ...data.groups.map((g) => ({ name: g.name, value: g.weight_pct })),
        { name: 'Other holdings and cash', value: data.other_weight_pct },
      ].map((g) => (
        <div key={g.name} style={{ margin: '14px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{g.name}</span>
            <strong>{g.value.toFixed(1)}%</strong>
          </div>
          <div style={{ height: 8, background: 'var(--ab-line,#ddd)' }}>
            <div
              style={{
                width: `${g.value}%`,
                height: 8,
                background: 'currentColor',
              }}
            />
          </div>
        </div>
      ))}
      <p>
        <strong>AI-adjacent earnings share is still unverified.</strong> The SPY
        holdings snapshot and Yardeni series have different dates and
        construction; do not combine their weights. A complete attribution needs
        consistent signed earnings for every constituent. Individual P/Es cannot
        be added or averaged into a “percent of P/E.”
      </p>
      <h3>A high-multiple example—and an earnings trap</h3>
      <p>
        <a href="https://stockanalysis.com/stocks/pltr/statistics/">
          Palantir: 149.1× trailing earnings
        </a>{' '}
        at September 4 close. Selected example, not an all-index “worst”
        ranking. High P/E can reflect growth expectations or temporarily low
        earnings; a loss-making company has no meaningful positive P/E.
      </p>
      <p>
        <a href="https://insight.factset.com/mag-7-companies-reported-earnings-growth-above-100-boosted-by-investment-gains">
          FactSet’s August 28 analysis
        </a>{' '}
        highlights large investment gains in Alphabet and Amazon earnings. A
        lower reported P/E can therefore reflect asset revaluations rather than
        customer cash. Removing those gains correctly requires tax and
        earnings-basis reconciliation.
      </p>
      <details>
        <summary>Group membership and calculation</summary>
        {data.groups.map((g) => (
          <p key={g.name}>
            <strong>{g.name}:</strong> {g.rows.map((r) => r.ticker).join(', ')}.
          </p>
        ))}
        <p>
          Disjoint editorial groups; selected AI-adjacent firms are not an
          exhaustive or pure-AI universe. Alphabet’s two share classes belong to
          one company. ASML and TSMC are outside this index universe. Remaining
          fund weight stays in other/cash rather than being normalized away.
        </p>
        <p>
          With consistent constituent earnings yields, group earnings
          contribution is Σ(weight × earnings/price); group P/E is group weight
          divided by that contribution. Include signed losses. Same-date
          constituent earnings and index methodology remain required before
          publishing a decomposition.
        </p>
        <a href={data.source}>State Street full holdings workbook ↗</a>
      </details>
    </details>
  );
}
