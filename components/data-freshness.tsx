/* oxlint-disable next/no-html-link-for-pages -- Native link opens a JSON status endpoint. */
import type { MarketData } from '@/lib/market-server';
import type { Dashboard } from '@/lib/metrics';
import type { Context } from '@/lib/context';
const stamp = (s: string) =>
  s ? s.replace('T', ' ').slice(0, 16) + ' UTC' : 'Not recorded';
export default function DataFreshness({
  data,
  context,
  market,
}: {
  data: Dashboard;
  context: Context;
  market?: MarketData;
}) {
  const failures = [...data.failures, ...context.failures, ...(market?.failures ?? [])];
  return (
    <details className="ab-details">
      <summary>
        Data freshness ·{' '}
        {failures.length
          ? 'some feeds retained older data'
          : 'automatic feeds checked'}{' '}
        · editorial snapshots dated separately
      </summary>
      <p>
        Automatic sources refresh on visits when due. A successful check does
        not mean a new reporting period. The response may show cached data while
        a refresh runs.
      </p>
      <div className="ab-company-list">
        {data.companies.map((c) => (
          <div key={c.id}>
            <strong>{c.name} accounts</strong>
            <span>{c.end}</span>
            <small>Latest source verification: {stamp(c.checkedAt)}</small>
          </div>
        ))}
        <div>
          <strong>Treasury rates</strong>
          <span>{context.rates.observed}</span>
          <small>
            Latest source verification: {stamp(context.rates.checkedAt)}
          </small>
        </div>
        <div>
          <strong>Nvidia accounts</strong>
          <span>{context.nvidia.periodEnd}</span>
          <small>
            Latest source verification: {stamp(context.nvidia.checkedAt)}
          </small>
        </div>
      </div>
      <p>
        Accounts refresh last attempted {stamp(data.lastAttemptAt)}. Next
        eligible accounts check: {stamp(data.nextCheckAt)}. These are
        eligibility times, not guaranteed scheduled ingestion.
      </p>
      {failures.length > 0 && (
        <ul>
          {failures.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      )}
      <p>
        <strong>Editorial snapshots:</strong> CAPE observations through August
        2026; stock P/E prices at September 4 close; lab revenue reports through
        August; supplier accounts through their labeled quarters; GDP Q2 2026.
        These do not update from a page visit. The hourly research task is paused; these snapshots require a separate source review.
      </p>
      <p>
        Historical reconstructions and forecast models remain versioned
        research. <a href="/api/market">Nasdaq research feed status ↗</a>{' '}
        reports its own last successful check and failures; it is not used as a
        headline crash prediction.{' '}
        <a href="/appendix#prospective-record">Prospective forecast record →</a>
      </p>
    </details>
  );
}
