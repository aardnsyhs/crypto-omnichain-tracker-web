# Transaction Story Explorer API contract

API origin: `NEXT_PUBLIC_API_BASE_URL`; routes include their own `/v1` prefix. Use HTTPS in production and `credentials: include` for session/history/lookup requests. Overview omits credentials.

Active registry: Ethereum, Bitcoin, Litecoin, Dogecoin, Bitcoin Cash, Dash. BSC and Polygon remain legacy-compatible for lookup and existing links/history. A lookup stays on the selected network; it does not trace a cross-chain journey.

| Endpoint | Contract |
| --- | --- |
| `GET /v1/session` | HTTP 204; initialize or renew signed anonymous cookie before concurrent history/lookup |
| `POST /v1/transactions/lookup` | `{ chain, transactionHash, refresh? }` returns `{ data, meta: { requestId, cache: { hit } } }` |
| `GET /v1/history?limit=20` | `{ data }` scoped to the signed cookie |
| `GET /v1/overview` | `{ data, meta }`, six active networks, no session |
| `GET /health/live` | Process liveness; no providers |
| `GET /health/ready` | HTTP 200 ready/degraded, HTTP 503 when PostgreSQL is unavailable |

EVM hashes: `0x` plus 64 hexadecimal characters. UTXO hashes: 64 hexadecimal characters without the prefix. Result families are `evm` and `utxo`; EVM includes story, transfers, approvals, coverage and technical details. UTXO includes exact value strings, inputs/outputs, confirmation snapshot and fee information. Pending, unknown, failed and confirmed statuses remain distinct.

Overview sections expose `updatedAt`, `isStale`, `status`, and nullable values. Additive `fieldUpdatedAt` and `staleFields` preserve field-specific ages. `updatedAt` is the oldest valid value in the section. A null price/fee/change is unavailable, not zero. Additive metadata includes `isRateLimited` and `providerStatus` for quota errors (402/429). Freshness is 60 seconds, maximum age is 300 seconds from original collection. Frontend polling is every 60 seconds in a visible view/tab.

Errors: `{ error: { code, message, requestId } }`. HTTP 429 includes `Retry-After`; refresh has a 15-second cooldown. Provider quota errors map to `UPSTREAM_RATE_LIMITED`/503. Intentional client cancellation is distinct from timeout/network errors. The client has a 45-second total deadline.
