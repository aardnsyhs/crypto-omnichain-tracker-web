# Dependency review, 2026-10-08

Source: executed `npm audit --json` and `npm audit --omit=dev --json` against the final lockfile. Counts are affected package entries, not distinct exploitable vulnerabilities. Offline installation summaries were not used as security evidence.

Full dependency tree: `{'info': 0, 'low': 0, 'moderate': 0, 'high': 8, 'critical': 0, 'total': 8}`.
Runtime audit: `{'info': 0, 'low': 0, 'moderate': 0, 'high': 0, 'critical': 0, 'total': 0}`.

Patched Next.js and eslint-config-next to 16.3.8, sharp to 0.35.5, and compatible MCP SDK, brace-expansion and source-map-js transitive dependencies. The runtime audit is clean.

Remaining high entries are in development lint/code-generation tooling, including Next ESLint and shadcn dependencies. Do not run generator tooling against untrusted sources. Review compatible upstream patches separately; no unrelated major upgrade/downgrade was applied. Frontend CI requires the runtime audit to pass.

## Remaining direct advisories

| Package | Severity | Advisory | Affected range |
| --- | --- | --- | --- |
| braces | high | [braces vulnerable to stack-exhaustion denial of service through deeply nested patterns](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | `<=3.0.3` |

Before live deployment, review these residual risks with the actual VPS permissions and provider endpoints. Do not treat a successful build or a clean subset audit as a complete security assessment.
