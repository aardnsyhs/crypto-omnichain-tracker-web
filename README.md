# Transaction Story Explorer web

Next.js frontend for individual transaction lookup, with an Investigative Ledger result presentation. Active networks: Ethereum, Bitcoin, Litecoin, Dogecoin, Bitcoin Cash, and Dash. BSC and Polygon deep links/history remain legacy-compatible; they are not active overview networks. The product does not trace cross-chain journeys.

Use Node 24 LTS and npm. Local development:

```sh
cp .env.example .env
npm ci --ignore-scripts
npm run dev
```

Local API default: `http://localhost:4000`. Production requires `NEXT_PUBLIC_API_BASE_URL=https://api.ardiansyah.app` **before** `npm run build`. Set it in the build environment and service environment. Missing production configuration fails explicitly. Use `.env.production.example` as a starting point.

Verification: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Tests use mocked fetch and do not require paid providers. Browser verification is not part of this implementation pass. The production build uses the existing Google Fonts integration and requires network access to fetch fonts.

Requests have a 45-second deadline and support cancellation. Initial history and deep-linked lookup requests await one signed-session bootstrap. Obsolete lookups are cancelled and out-of-order responses ignored. Partial-data retries keep the useful result visible. Overview polling runs every 60 seconds while the view and tab are visible, with no overlapping requests. Preserved provider values are explicitly stale and retain source timestamps.

See [API contract](docs/api-contract-reference.md) and [verification record](docs/VERIFICATION.md). The service template is `deploy/systemd/tracker-web.service`. The shared VPS runbook and both Nginx virtual hosts live in the sibling backend repository: `crypto-omnichain-tracker-api/docs/DEPLOYMENT.md` and `crypto-omnichain-tracker-api/deploy/nginx/`.
