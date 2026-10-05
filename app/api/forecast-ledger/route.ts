import { getForecastLedger } from '@/lib/forecast-server';
export async function GET() {
  const ledger = await getForecastLedger();
  return Response.json(
    {
      ...ledger,
      scope:
        'Experimental Nasdaq transfer model; not calibrated AI crash odds.',
      policy:
        'Append-only application records. Duplicates retain first issuance; changed inputs or models are separate revisions. Evaluation must select the earliest issuance per target and model, never the best revision. Records are issued during their target month, not before the month began. Issuance is excluded during the final seven calendar days (UTC) of the target month. Outcomes have not yet been evaluated.',
      limit: 200,
    },
    {
      status: ledger.status === 'available' ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
