import data from '@/data/railway-revenue.json';
export default function RailwayRevenue() {
  return (
    <details className="ab-details">
      <summary>
        British railways: revenue relative to construction cost, 1844–1851
      </summary>
      <p>
        Annual gross revenue per £100 of accumulated construction cost. A
        matched historical industry measure—not profit, P/E or annual capex
        coverage.
      </p>
      <div className="ab-multiples">
        {data.series.observations.map((r) => (
          <div key={r.year}>
            <span>{r.year}</span>
            <span
              className="ab-multiple-bar"
              style={{
                width: `${(r.annual_revenue_div_construction_cost_percent / 12) * 100}%`,
              }}
            />
            <strong>
              £{r.annual_revenue_div_construction_cost_percent.toFixed(1)}
            </strong>
          </div>
        ))}
      </div>
      <p className="ab-note">
        Common bar scale: £0–£12 annual revenue per £100 construction cost.
        Annual observations; no interpolated months.
      </p>
      <p>
        Revenue intensity fell from £9.9 in 1845 to £5.9 in 1850, while route
        mileage expanded. Growing infrastructure and disappointing financial
        returns can coexist. AI needs its own matched asset-cost and revenue
        data before this ratio can be compared numerically.
      </p>
      <details>
        <summary>Inputs and source</summary>
        <div className="ob-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Miles</th>
                <th>Construction £/mile</th>
                <th>Annual revenue £/mile</th>
              </tr>
            </thead>
            <tbody>
              {data.series.observations.map((r) => (
                <tr key={r.year}>
                  <td>{r.year}</td>
                  <td>{r.miles_in_service}</td>
                  <td>{r.construction_cost_gbp_per_mile}</td>
                  <td>{r.annual_revenue_gbp_per_mile}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          <a href={data.series.source}>Odlyzko (2011), Table 1, page 8 ↗</a>,
          compiled from Tooke/Newmarch (1857). Historical estimates vary by
          source. This British case is separate from US railroads in 1873; old
          and new lines are pooled.
        </p>
      </details>
    </details>
  );
}
