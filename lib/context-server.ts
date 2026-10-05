import { env, waitUntil } from 'cloudflare:workers';
import seed from '../data/context.json';
import { parseRates, parseNvidia, type Context } from './context';
const KEY = 'context-v1';
async function refresh(previous: Context) {
  const now = new Date().toISOString();
  const lock = await env.DB.prepare(
    "INSERT INTO cache_entries(key,payload,updated_at) VALUES ('context-lock','{}',?) ON CONFLICT(key) DO UPDATE SET updated_at=excluded.updated_at WHERE cache_entries.updated_at < ? RETURNING key",
  )
    .bind(now, new Date(Date.now() - 300000).toISOString())
    .first();
  if (!lock) return;
  const data: Context = {
    ...previous,
    failures: [],
    nextCheckAt: new Date(Date.now() + 6 * 3600000).toISOString(),
  };
  for (const feed of ['rates', 'nvidia'] as const) {
    try {
      const response = await fetch(previous[feed].source, {
        headers: {
          'User-Agent':
            'AI Bubble Monitor public research ai-bubble-observatory.rhyslindmark.chatgpt.site',
        },
        signal: AbortSignal.timeout(4000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (feed === 'rates') {
        const value = parseRates(await response.text(), now);
        if (value.observed < previous.rates.observed)
          throw new Error('Observation date regressed');
        data.rates = value;
      } else {
        const value = parseNvidia(
          (await response.json()) as Parameters<typeof parseNvidia>[0],
          now,
        );
        if (value.periodEnd < previous.nvidia.periodEnd)
          throw new Error('Reporting period regressed');
        data.nvidia = value;
      }
    } catch (e) {
      data.failures.push(
        `${feed === 'rates' ? 'Federal Reserve' : 'Nvidia'}: ${e instanceof Error ? e.message : 'source unavailable'}. Retaining last verified data.`,
      );
    }
  }
  if (data.failures.length)
    data.nextCheckAt = new Date(Date.now() + 1800000).toISOString();
  await env.DB.prepare(
    'INSERT INTO cache_entries(key,payload,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at',
  )
    .bind(KEY, JSON.stringify(data), now)
    .run();
}
export async function getContext(): Promise<Context> {
  try {
    const row = await env.DB.prepare(
      'SELECT payload FROM cache_entries WHERE key=?',
    )
      .bind(KEY)
      .first<{ payload: string }>();
    const data: Context = row ? JSON.parse(row.payload) : seed;
    if (!row || Date.now() >= Date.parse(data.nextCheckAt))
      waitUntil(
        refresh(data).catch((e) =>
          console.error('Context refresh failed', String(e)),
        ),
      );
    return data;
  } catch {
    return {
      ...seed,
      failures: ['Update storage unavailable; showing last verified release.'],
    };
  }
}
