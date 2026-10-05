import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { COMPANIES, normalize, buildDashboard } from '../lib/metrics.ts';
const now = new Date().toISOString();
const sources = COMPANIES.map((c) =>
  normalize(
    c.id,
    JSON.parse(readFileSync(`../work/research/${c.id}.json`, 'utf8')),
    statSync(`../work/research/${c.id}.json`).mtime.toISOString(),
  ),
);
const dashboard = buildDashboard(sources, now);
writeFileSync('data/sources.json', JSON.stringify(sources));
writeFileSync('data/seed.json', JSON.stringify(dashboard));
console.log(
  JSON.stringify(
    {
      score: dashboard.score,
      components: dashboard.components,
      companies: dashboard.companies.map((c) => ({
        name: c.name,
        end: c.end,
        capex: c.current.capex.value,
        ocf: c.current.ocf.value,
        revenue: c.current.revenue.value,
      })),
      history: dashboard.history.map((h) => ({ date: h.date, score: h.score })),
    },
    null,
    2,
  ),
);
