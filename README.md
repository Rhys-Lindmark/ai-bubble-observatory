# AI Bubble Observatory

A source-grounded dashboard comparing AI demand, earnings, valuations, investment and financing with historical booms and busts.

- Dashboard: https://ai.rhyslindmark.com/bubble
- Original Sites deployment: https://ai-bubble-observatory.rhyslindmark.chatgpt.site/
- Research appendix: https://ai.rhyslindmark.com/bubble/appendix

This repository is a source snapshot of the deployed observatory, exported on October 5, 2026. Financial observations retain their individual dates; exporting the code does not refresh the data. Research scores are not validated crash probabilities. Revenue, annualized run rates, profit, cash and financing commitments have distinct definitions in the dashboard.

## Development

Requires Node.js 22.13 or later.

```sh
npm ci
npm run dev
npm test
npm run build
```

Hosting uses Sites and Cloudflare Workers, with a D1 database binding. The main AI website proxies the published Sites application at `/bubble`. Live refreshes may use stored, explicitly dated fallback observations when upstream sources are unavailable. See `OPERATIONS.md` for data sources and update behavior.
