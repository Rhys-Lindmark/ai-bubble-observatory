import {
  computeRisk,
  parseNasdaq,
  MODEL_SPECIFICATION,
  MODEL_PROTOCOL_SHA256,
  MODEL_VERSION,
} from './market-risk.ts';
import type { MonthlyClose, RiskEstimate } from './market-risk.ts';

export type ForecastRecord = {
  id: string;
  issuedAt: string;
  source: string;
  sourceCheckedAt: string;
  modelVersion: string;
  protocolSha256: string;
  modelSpecification: typeof MODEL_SPECIFICATION;
  inputs: MonthlyClose[];
  estimate: RiskEstimate;
  timing: 'issued_during_target_month';
  issuanceClosesAt: string;
  issuancePolicy: 'exclude_final_seven_calendar_days_utc';
};

/** Only call after a successful source parse. No seed or cached inference is accepted. */
export async function makeForecastRecord({
  closes,
  source,
  sourceCheckedAt,
  issuedAt,
  sourceSucceeded,
}: {
  closes: readonly MonthlyClose[];
  source: string;
  sourceCheckedAt: string;
  issuedAt: string;
  sourceSucceeded: boolean;
}): Promise<ForecastRecord | null> {
  const issued = Date.parse(issuedAt),
    checked = Date.parse(sourceCheckedAt);
  if (
    !sourceSucceeded ||
    !Number.isFinite(issued) ||
    !Number.isFinite(checked) ||
    checked > issued ||
    issued - checked > 60000 ||
    !source.startsWith('https://')
  )
    return null;
  const inputs = closes
    .slice(-13)
    .map(({ month, date, price }) => ({ month, date, price }));
  // Independently fail closed on stale, incomplete or invalid monthly inputs.
  // A month-end holiday without a later confirming observation can defer issuance.
  try {
    parseNasdaq(
      inputs.map((c) => `${c.date},${c.price}`).join('\n'),
      new Date(issued),
    );
  } catch {
    return null;
  }
  const estimate = computeRisk(inputs);
  const timestamp = new Date(issued).toISOString();
  const issueDate = new Date(issued);
  // Do not create late-month records after the final trading close has occurred.
  // A conservative buffer avoids pretending to have an authoritative holiday calendar.
  const issuanceClosesAt = new Date(
    Date.UTC(issueDate.getUTCFullYear(), issueDate.getUTCMonth() + 1, -6),
  ).toISOString();
  if (timestamp >= issuanceClosesAt) return null;
  if (!estimate.eligible || estimate.targetMonth !== timestamp.slice(0, 7))
    return null;
  // Identity excludes issuance/check times: repeated retrieval cannot rewrite first issuance.
  // Revised inputs or a new model get separate records, not extra independent trials.
  const identity = JSON.stringify({
    source,
    modelVersion: MODEL_VERSION,
    protocolSha256: MODEL_PROTOCOL_SHA256,
    modelSpecification: MODEL_SPECIFICATION,
    inputs,
    estimate,
  });
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(identity),
  );
  const id = Array.from(new Uint8Array(hash), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
  return {
    id,
    issuedAt: timestamp,
    source,
    sourceCheckedAt: new Date(checked).toISOString(),
    modelVersion: MODEL_VERSION,
    protocolSha256: MODEL_PROTOCOL_SHA256,
    modelSpecification: MODEL_SPECIFICATION,
    inputs,
    estimate,
    timing: 'issued_during_target_month',
    issuanceClosesAt,
    issuancePolicy: 'exclude_final_seven_calendar_days_utc',
  };
}

export const INSERT_FORECAST = `INSERT INTO forecast_records(id,payload,issued_at,target_month,model_version)
  VALUES (?,?,?,?,?) ON CONFLICT(id) DO NOTHING`;
export function forecastBindings(record: ForecastRecord) {
  return [
    record.id,
    JSON.stringify(record),
    record.issuedAt,
    record.estimate.targetMonth,
    record.modelVersion,
  ];
}
