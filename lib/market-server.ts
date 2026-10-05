import { env, waitUntil } from 'cloudflare:workers';
import seed from '../data/observatory.json';
import { parseNasdaq, computeRisk } from './market-risk';
import { makeForecastRecord } from './forecast-record';
import { saveForecast } from './forecast-server';
const KEY = 'market-risk-v1';
const source = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=NASDAQCOM';
const FEED_REVISION = 4;
export type MarketPoint = {
  date: string;
  offset: number;
  price: number | null;
  forecastAsOf: string;
  risk: number | null;
  event: number | null;
  eligible: boolean;
};
export type MarketData = {
  current: Omit<typeof seed.research.current, 'probability'> & {
    probability: number | null;
  };
  points: MarketPoint[];
  anchor: string;
  checkedAt: string;
  lastAttemptAt?: string;
  nextCheckAt: string;
  failures: string[];
  source: string;
  feedRevision?: number;
  ledgerFailure?: string;
};
const seedData: MarketData = {
  current: seed.research.current,
  points: seed.ai.points,
  anchor: seed.ai.anchor,
  checkedAt: '2026-09-06T00:00:00Z',
  nextCheckAt: '2026-09-06T00:00:00Z',
  failures: [] as string[],
  source,
};

const mi = (d: string) =>
  Number(d.slice(0, 4)) * 12 + Number(d.slice(5, 7)) - 1;
async function refresh(previous: MarketData) {
  const now = new Date().toISOString();
  const lock = await env.DB.prepare(
    "INSERT INTO cache_entries(key,payload,updated_at) VALUES ('market-risk-lock','{}',?) ON CONFLICT(key) DO UPDATE SET updated_at=excluded.updated_at WHERE cache_entries.updated_at < ? RETURNING key",
  )
    .bind(now, new Date(Date.now() - 300000).toISOString())
    .first();
  if (!lock) return;
  let next: MarketData = {
    ...previous,
    lastAttemptAt: now,
    nextCheckAt: new Date(Date.now() + 6 * 3600000).toISOString(),
    failures: [],
    ledgerFailure: undefined,
    source,
    feedRevision: FEED_REVISION,
  };
  try {
    const start = new Date();
    start.setUTCFullYear(start.getUTCFullYear() - 4);
    start.setUTCDate(1);
    const sourceUrl = `${source}&cosd=${start.toISOString().slice(0, 10)}`;
    const response = await fetch(sourceUrl, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'AI Bubble Observatory public research' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.text();
    const verifiedAt = new Date().toISOString();
    const closes = parseNasdaq(body, new Date(verifiedAt), 38);
    const estimate = computeRisk(closes);
    if (estimate.asOf < previous.current.asof)
      throw new Error('Market observation regressed');
    const monthly = new Map<
      string,
      {
        risk: number | null;
        forecastAsOf: string;
        eligible: boolean;
        event: number | null;
      }
    >();
    for (let i = 12; i < closes.length; i++) {
      const r = computeRisk(closes.slice(i - 12, i + 1));
      monthly.set(r.targetMonth, {
        risk: r.probability == null ? null : r.probability * 100,
        forecastAsOf: r.asOf,
        eligible: r.eligible,
        event:
          r.eligible && closes[i + 1]
            ? Number(closes[i + 1].price <= r.crossingThreshold)
            : null,
      });
    }
    const points: MarketPoint[] = closes.slice(-25).map((c) => ({
      date: c.month,
      offset: mi(c.month) - mi(estimate.asOf),
      price: (100 * c.price) / estimate.currentClose,
      ...monthly.get(c.month)!,
    }));
    points.push({
      date: estimate.targetMonth,
      offset: 1,
      price: null,
      ...monthly.get(estimate.targetMonth)!,
    });
    next = {
      ...next,
      current: {
        ...previous.current,
        asof: estimate.asOf,
        target_month: estimate.targetMonth,
        price: estimate.currentClose,
        threshold: estimate.crossingThreshold,
        probability: estimate.probability,
        eligible: estimate.eligible,
        last_observation_date: estimate.lastObservationDate,
        ...estimate.features,
        status:
          'Frozen US-industry model transferred to Nasdaq closes; uncalibrated AI proxy. Partial target-month data excluded.',
      },
      points,
      anchor: estimate.asOf,
      checkedAt: verifiedAt,
    };
    try {
      const record = await makeForecastRecord({
        closes,
        source,
        sourceCheckedAt: verifiedAt,
        issuedAt: new Date().toISOString(),
        sourceSucceeded: true,
      });
      if (record) await saveForecast(record);
    } catch {
      next.ledgerFailure =
        'Verified market data could not be saved to the prospective ledger.';
    }
  } catch (e) {
    next.failures = [
      `Market refresh unavailable: ${e instanceof Error ? e.message : 'source error'}. Retaining dated estimate.`,
    ];
    next.nextCheckAt = new Date(Date.now() + 1800000).toISOString();
  }
  await env.DB.prepare(
    'INSERT INTO cache_entries(key,payload,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at',
  )
    .bind(KEY, JSON.stringify(next), now)
    .run();
}
export async function getMarket(): Promise<MarketData> {
  try {
    const row = await env.DB.prepare(
      'SELECT payload FROM cache_entries WHERE key=?',
    )
      .bind(KEY)
      .first<{ payload: string }>();
    const data: MarketData = row ? JSON.parse(row.payload) : seedData;
    if (
      !row ||
      data.feedRevision !== FEED_REVISION ||
      Date.now() >= Date.parse(data.nextCheckAt)
    )
      waitUntil(
        refresh(data).catch((e) => console.error('Market refresh', String(e))),
      );
    return data;
  } catch {
    return {
      ...seedData,
      failures: [
        'Market storage unavailable; showing dated research snapshot.',
      ],
    };
  }
}
