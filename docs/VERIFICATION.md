# Frontend verification

Date: 2026-10-08, Asia/Jakarta. Existing `main` branch was clean at start. The Investigative Ledger layout, English language, active/legacy network behavior, history, deep links, sharing, and partial-result retry were preserved. No browser or screenshot was used.

## Implemented changes

- One shared `/v1/session` initialization precedes initial history/deep-linked lookup requests. Cancelling one waiting lookup does not abort the shared bootstrap or issue competing cookies.
- All API requests have a 45-second deadline covering fetch and response-body parsing. Lookups accept AbortSignal; obsolete requests are aborted and the monotonic response guard remains in place. Intentional cancellation is not reported as a network failure.
- Deep-linked requests set a visible loading state. Partial-data retries retain the useful current result, including when retrying an error. History has explicit failure/retry feedback.
- Overview requests omit session credentials; initial/manual/polling fetches share overlap protection and cancellation. Polling remains once per 60 seconds, only for a visible overview and tab. Errors retain a clearly labeled previous response.
- Missing production API configuration fails at build/start rather than falling back to localhost. Backend additive stale-field/rate-limit metadata is represented in client types.
- Header/footer/metadata/docs now consistently use Transaction Story Explorer and Investigative Ledger, describe individual per-network lookups and distinguish EVM/UTXO data. Active network count comes from the registry. Existing BSC/Polygon legacy support remains.
- Network radios support arrow keys with controlled tab order. Focus outlines, 44px minimum controls, input boundaries, reduced-motion handling, readable placeholders and muted labels were improved. The compact header now wraps within narrow containers.
- Next.js/eslint-config-next were patched to 16.3.8, sharp to 0.35.5, plus compatible transitive security fixes. No unrelated major upgrade was made.

## Commands and actual results

| Command/check | Result |
| --- | --- |
| `npm ci --ignore-scripts --offline` | Reproducible installation: 605 packages; subsequent compatible security patches updated the lockfile |
| `npm run lint` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm test` | 9 tests passed |
| `NEXT_PUBLIC_API_BASE_URL=https://api.ardiansyah.app npm run build` | Production build passed, including static page generation |
| `node scripts/http-smoke.cjs` | Production server HTTP 200 for home and deep-link URLs, correct product text; test server terminated afterward |
| `python3 scripts/check-contrast.py` | Core foreground, muted/80, focus and input boundary pairs pass computed contrast checks |
| `npm audit --omit=dev --json` | 0 runtime advisories |
| `npm audit --json` | 8 high development dependency entries; see SECURITY-REVIEW.md |
| `git diff --check` | Passed |

Tests cover shared first-load bootstrap across clients, overview credentials omission, fetch timeout, body timeout, intentional cancellation, bootstrap failure/retry, production configuration, active/legacy deep-link validation and cancellation while waiting for bootstrap. Code inspection verifies the UI's monotonic response guard, loading transitions, preserved partial results and polling lifecycle. HTTP smoke tests do not execute React effects and are not described as browser tests.

The first sandbox build could not fetch existing Google Fonts. The production build passed with authorized network access. CI uses Node 24 and lockfile installation, lint, typecheck, tests, build, HTTP smoke, contrast checks and a runtime vulnerability check. GitHub Actions itself has not been executed remotely.

## Changed file groups

- Request/state behavior: `lib/api-client.ts`, `lib/api-types.ts`, `app/page.tsx`, overview/history components, focused request tests and test compiler configuration.
- Presentation/accessibility: layout metadata, global focus/target styles, network selector, loading wording, input/search placeholders, muted UTXO/history labels.
- Build/security/CI: `next.config.ts`, package files, `.nvmrc`, `.github/workflows/ci.yml`, lint/test settings, `.env.production.example`, `scripts/http-smoke.cjs`, `scripts/check-contrast.py`.
- Deployment: `deploy/systemd/tracker-web.service`; both Nginx hosts and the shared runbook are in `crypto-omnichain-tracker-api/deploy/` and `crypto-omnichain-tracker-api/docs/DEPLOYMENT.md`.

Set `NEXT_PUBLIC_API_BASE_URL=https://api.ardiansyah.app` before building. The service binds to 127.0.0.1:3000. Review the sibling runbook for certificates, backend secrets, migration, backups, retention and rollback. Browser-only mobile, 200% zoom, keyboard interaction and clipboard permission behavior were not runtime-tested, per instruction; see ANTISLOP-REVIEW.md for the static delivery gate and its limits.
