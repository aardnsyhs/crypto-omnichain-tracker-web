# Crypto Omnichain Transaction Tracker — Web

Frontend web application for **Crypto Omnichain Transaction Tracker**, built with Next.js (App Router), React 19, TypeScript strict mode, and Tailwind CSS.

## Project Context

This repository (`crypto-omnichain-tracker-web`) contains the frontend web application only. The backend API lives in a separate repository (`crypto-omnichain-tracker-api`).

### Architectural Boundary

- The backend owns the canonical API contract.
- The frontend consumes the contract documented in [docs/api-contract-reference.md](docs/api-contract-reference.md).
- The frontend **never** imports backend source code directly.
- All future API communication is isolated within `lib/api-client.ts`.
- The API base URL is configured exclusively via `NEXT_PUBLIC_API_BASE_URL`.

## Current Phase: Milestone 1B (Frontend Foundation)

Milestone 1B establishes the Next.js App Router scaffold, Tailwind CSS integration, strict TypeScript configuration, code-quality tooling, and the typed API client skeleton.

Interactive transaction lookup, chain selectors, search history, and live API communication are deferred to Milestone 4.

## Prerequisites

- Node.js >= 20.0.0 (tested on Node v24)
- npm >= 10.0.0

## Setup and Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment:

   ```bash
   cp .env.example .env.local
   ```

3. Run development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` — Start the local Next.js development server
- `npm run build` — Compile production bundle
- `npm run start` — Run production server
- `npm run lint` — Run ESLint check
- `npm run format` — Format code with Prettier
- `npm run format:check` — Check code formatting
- `npm run typecheck` — Run TypeScript type checking (`tsc --noEmit`)

## Documentation

- API Contract Reference: [docs/api-contract-reference.md](docs/api-contract-reference.md)
