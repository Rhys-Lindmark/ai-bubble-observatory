import { env } from 'cloudflare:workers';
import { forecastBindings, INSERT_FORECAST } from './forecast-record';
import type { ForecastRecord } from './forecast-record';

export async function saveForecast(record: ForecastRecord) {
  await env.DB.prepare(INSERT_FORECAST)
    .bind(...forecastBindings(record))
    .run();
}
export async function getForecastLedger() {
  try {
    const [count, rows] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) AS total FROM forecast_records').first<{
        total: number;
      }>(),
      env.DB.prepare(
        'SELECT payload FROM forecast_records ORDER BY issued_at DESC, id DESC LIMIT 200',
      ).all<{ payload: string }>(),
    ]);
    return {
      status: 'available' as const,
      total: count?.total ?? 0,
      records: rows.results.map(
        (row) => JSON.parse(row.payload) as ForecastRecord,
      ),
      error: null,
    };
  } catch {
    return {
      status: 'unavailable' as const,
      total: null,
      records: [] as ForecastRecord[],
      error:
        'Forecast storage could not be read. No accuracy claim is available.',
    };
  }
}
