/* oxlint-disable next/no-html-link-for-pages -- JSON download and appendix anchors. */
import { getForecastLedger } from '@/lib/forecast-server';
import { getMarket } from '@/lib/market-server';
export default async function ForecastLedger() {
  const [ledger, market] = await Promise.all([
    getForecastLedger(),
    getMarket(),
  ]);
  return (
    <section id="prospective-record">
      <h2>Can we judge predictions made before the outcome?</h2>
      <p>
        <strong>
          {ledger.status === 'unavailable'
            ? 'Record unavailable.'
            : ledger.total === 0
              ? 'No prospective forecasts recorded yet.'
              : `${ledger.total} forecast input versions preserved.`}
        </strong>{' '}
        {ledger.error ??
          'This record starts with newly verified data. Historical reconstructions are excluded.'}
      </p>
      <p>
        Each saved Nasdaq estimate keeps its original issuance time, 13 monthly
        closes and frozen model. A changed input creates a separate revision.
        Repeated checks preserve the first record. This is an application
        record, not an independently timestamped registry.
      </p>
      <p>
        These estimates are issued <strong>during their target month</strong>,
        before its closing outcome—not before the month starts. Collection
        closes before the final seven calendar days of each target month,
        avoiding issuance after a month-end trading close. Future evaluation
        must use the first issuance for each month and model; revisions are not
        extra trials. No prospective accuracy result is available yet, and these
        are not AI crash odds.
      </p>
      {market.failures.length > 0 && (
        <p>
          <strong>Collection paused by source failure.</strong> The latest
          market refresh did not succeed; retained historical inputs cannot
          create a new forecast.
        </p>
      )}
      {market.ledgerFailure && <p>{market.ledgerFailure}</p>}
      <p>
        Last successful market check: {market.checkedAt.replace('T', ' ')}.
        Collection runs after successful, eligible market refreshes on visits;
        it is not guaranteed by the hourly research schedule.
      </p>
      {ledger.records.length > 0 && (
        <details className="ab-details">
          <summary>Inspect latest recorded inputs</summary>
          <ul>
            {ledger.records.slice(0, 12).map((r) => (
              <li key={r.id}>
                Target {r.estimate.targetMonth} · issued {r.issuedAt} · input
                month {r.estimate.asOf} · research estimate{' '}
                {(r.estimate.probability! * 100).toFixed(2)}% · {r.modelVersion}
              </li>
            ))}
          </ul>
          <p>
            Showing {Math.min(12, ledger.records.length)} of {ledger.total}{' '}
            versions. Separate versions can refer to the same target month.
          </p>
        </details>
      )}
      <p>
        <a href="/api/forecast-ledger">
          Download dated records and exact inputs ↗
        </a>{' '}
        · <a href="/">Return to dashboard →</a>
      </p>
    </section>
  );
}
