# Crypto Omnichain Transaction Tracker — Web

Frontend web application for **Crypto Omnichain Transaction Tracker**, built with Next.js (App Router), React 19, TypeScript strict mode, and Tailwind CSS.

## Features & User Experience

- **Transaction Story Overview:** Narrative explanation of transaction outcomes, execution status, and coverage indicators.
- **Asset Transfers:** Clean breakdown of native transfers and ERC-20 token movements with origin and destination addresses.
- **Token Approvals:** Visual allowances card displaying maximum allowance (unlimited) or finite amounts, alongside a historical scope disclaimer.
- **Technical Ledger:** Collapsible accordion containing proof details, native transaction value, gas fee breakdown, calldata input, and external block explorer links.
- **Deduplicated History:** Clean session search history deduplicated by chain and transaction hash with execution-aware badges (`Confirmed`, `Failed`, `Pending`, `Unknown`).
- **Deep Linking & Sharing:** Share button with clipboard copy feedback and URL parameter synchronization (`?chain=...&tx=...`).
- **Race Condition Protection:** Monotonic request sequence tracking prevents out-of-order asynchronous responses from overwriting newer searches.

## Prerequisites

- Node.js >= 20.0.0
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
- `npm run typecheck` — Run TypeScript type checking (`tsc --noEmit`)

## Documentation

- API Contract Reference: [docs/api-contract-reference.md](docs/api-contract-reference.md)
