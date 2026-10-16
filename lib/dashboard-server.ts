import { env, waitUntil } from 'cloudflare:workers';
import { containsReleasePeriods } from './october-metrics';
import seedJson from '../data/seed.json';
import sourceJson from '../data/sources.json';
import {
  buildDashboard,
  companyAt,
  COMPANIES,
  normalize,
  type Dashboard,
  type Source,
} from './metrics';

const seed = seedJson as Dashboard;
const seededSources = sourceJson as Source[];
const HOUR = 3600000;

async function read(key: string) {
  return env.DB.prepare('SELECT payload FROM cache_entries WHERE key = ?')
    .bind(key)
    .first<{ payload: string }>();
}
async function write(key: string, value: unknown, now: string) {
  return env.DB.prepare(
    'INSERT INTO cache_entries (key,payload,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at',
  )
    .bind(key, JSON.stringify(value), now)
    .run();
}

async function refresh(existing: Dashboard) {
  const now = new Date().toISOString();
  const lock = await env.DB.prepare(
    "INSERT INTO cache_entries (key,payload,updated_at) VALUES ('refresh-lock','{}',?) ON CONFLICT(key) DO UPDATE SET updated_at=excluded.updated_at WHERE cache_entries.updated_at < ? RETURNING key",
  )
    .bind(now, new Date(Date.now() - 5 * 60 * 1000).toISOString())
    .first();
  if (!lock) return;
  const sources: Source[] = [];
  const failures: string[] = [];
  // Bound memory: each SEC document is parsed and reduced before fetching the next.
  for (const c of COMPANIES) {
    let previous = seededSources.find((s) => s.id === c.id)!;
    const saved = await read('source:' + c.id);
    if (saved) {
      const candidate: Source = JSON.parse(saved.payload);
      const basePeriod = companyAt(previous, now.slice(0,10));
      const savedPeriod = companyAt(candidate, now.slice(0,10));
      if (savedPeriod && basePeriod && savedPeriod.end >= basePeriod.end && savedPeriod.filed >= basePeriod.filed) previous = candidate;
    }
    try {
      const response = await fetch(
        `https://data.sec.gov/api/xbrl/companyfacts/CIK${c.cik}.json`,
        {
          headers: {
            'User-Agent':
              'AI Bubble Monitor public research dashboard ai-bubble-observatory.rhyslindmark.chatgpt.site',
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(4000),
        },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = (await response.json()) as Parameters<typeof normalize>[1];
      const source = normalize(c.id, raw, new Date().toISOString());
      const oldPeriod = companyAt(previous, now.slice(0, 10))?.end;
      const newPeriod = companyAt(source, now.slice(0, 10))?.end;
      if (!newPeriod || (oldPeriod && newPeriod < oldPeriod))
        throw new Error('Incomplete filing or reporting period regression');
      // Validate the complete series before replacing a last-known-good source.
      buildDashboard(
        seededSources.map((s) => (s.id === source.id ? source : s)),
        now,
      );
      sources.push(source);
      await write('source:' + c.id, source, now);
    } catch (error) {
      sources.push(previous);
      failures.push(
        `${c.name}: ${error instanceof Error ? error.message : 'source unavailable'}`,
      );
    }
  }
  let dashboard: Dashboard;
  try {
    dashboard = buildDashboard(sources, now);
  } catch {
    dashboard = { ...existing };
    failures.push(
      'Could not reconcile all five companies; retaining previous snapshot.',
    );
  }
  dashboard.failures = [...dashboard.failures, ...failures];
  dashboard.lastAttemptAt = now;
  dashboard.nextCheckAt = new Date(
    Date.now() + (failures.length ? 0.5 : 6) * HOUR,
  ).toISOString();
  // A failed check never makes the data look newly verified.
  if (failures.length === COMPANIES.length)
    dashboard.checkedAt = existing.checkedAt;
  await write('dashboard', dashboard, now);
  if (!failures.length)
    await env.DB.prepare(
      'INSERT INTO snapshots (day,payload,created_at) VALUES (?,?,?) ON CONFLICT(day) DO NOTHING',
    )
      .bind(now.slice(0, 10), JSON.stringify(dashboard), now)
      .run();
}

export async function getDashboard(): Promise<Dashboard> {
  try {
    const row = await read('dashboard');
    const cached: Dashboard | null = row ? JSON.parse(row.payload) : null;
    const dashboard = cached && containsReleasePeriods(cached, seed) ? cached : seed;
    if (!row || dashboard === seed || Date.now() >= Date.parse(dashboard.nextCheckAt))
      waitUntil(
        refresh(dashboard).catch((error) =>
          console.error('Dashboard refresh failed', String(error)),
        ),
      );
    return dashboard;
  } catch {
    // Deployments remain readable if storage is temporarily unavailable.
    return {
      ...seed,
      failures: [
        'Update storage is unavailable; showing the last verified release.',
      ],
    };
  }
}

export async function snapshotDates(): Promise<string[]> {
  try {
    const rows = await env.DB.prepare(
      'SELECT day FROM snapshots ORDER BY day DESC LIMIT 52',
    ).all<{ day: string }>();
    return rows.results.map((r) => r.day);
  } catch {
    return [];
  }
}

export async function getSnapshot(day: string): Promise<Dashboard | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const row = await env.DB.prepare('SELECT payload FROM snapshots WHERE day=?')
    .bind(day)
    .first<{ payload: string }>();
  return row ? JSON.parse(row.payload) : null;
}
