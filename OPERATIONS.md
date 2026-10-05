# AI Bubble Monitor — operations

Public audience: anyone with the URL. This site contains public corporate financial facts and no visitor accounts or private financial data.

## Updating data

- Requests to the page or `/api/dashboard` serve the current durable snapshot immediately.
- If no cached snapshot exists, or six hours have elapsed, a bounded background job fetches five SEC companyfacts documents sequentially. The site does not require the creator's laptop.
- A D1 lease prevents duplicate refresh jobs for five minutes. Each upstream request has a four-second deadline; failures retry after 30 minutes.
- Each successful source is validated before replacing its cached version. Missing metrics, unknown tag transitions, and period regression preserve the previous source. Financial periods older than 150 days are flagged.
- The client polls once per minute while visible. Checks are traffic-triggered, not an independent scheduled job. With no visits, no new checks occur.
- `snapshots` retains the first fully successful refresh per UTC day. Reconstructed prelaunch history is distinct from saved live snapshots.
- Research context cards are dated annual snapshots and are manually maintained; they do not affect the score.

## Methodology

Version `buildout-v1`: 40% cash capex/OCF pressure + 35% capex-minus-revenue growth gap + 25% operating-margin compression. See the on-site methodology drawer and `lib/metrics.ts` for exact transformations. Thresholds are explicit editorial choices, not calibrated crash probabilities. Market valuations, private labs, and financing networks are not included in this release.

## Source and storage

Financial source: SEC EDGAR companyfacts, public JSON, five disclosed US GAAP line-item series groups. Normalized source observations, current dashboard, and refresh lock live in D1. `data/sources.json` and `data/seed.json` provide a verified release fallback. Raw multi-megabyte filings are reduced before storage and are not shipped to browsers. Company and fact details expose source links, original periods, filing dates, and the TTM bridge.

SEC requests include a descriptive user agent. Source permission/access requirements can change: review failed status messages, avoid raising polling rates, and update an adapter if a taxonomy changes. Never patch a missing field to zero.

## Validation

`npm test` exercises TTM accounting, no-lookahead history, independent aggregate values, period regression, missing peers, stale observations, restatements, score anchors and malformed inputs. `npm run lint` covers authored application code; generated unused UI primitives have existing lint failures and remain unmodified. Type-check with `npx tsc --noEmit`. Build with `npm run build`.

Initial independent cross-check: current/prior values for all five companies matched separate calculations; initial index 65/100. Oracle's TTM ends 2026-05-31; the other four end 2026-06-30. Figures include non-AI businesses and exclude noncash lease additions.

## Local development

Use Node 24 (minimum package engine is 22.13). Run the supported development command once, reuse the same server, and stop it at handoff. D1 migrations are in `drizzle/` and are included in the packaged deployment. No API keys or paid data subscription are required.

The source regeneration script expects separately downloaded SEC documents under the parent `work/research/` directory. Live production refreshes do not use that directory.

## Later work

See the parent `outputs/backlog.md`: licensed equity valuations and forward estimates, contract-level dependencies, GPU rental prices, richer demand evidence, and a supported traffic-independent scheduler. Adding these should version the methodology rather than silently changing historical scores.
