# DESIGN.md - Crypto Omnichain Tracker

## 1. Identity & Purpose

A high-precision, multi-chain blockchain transaction explorer and market overview designed for crypto investigators, developers, and analysts. It unrolls complex multi-asset transfers, token approvals, and execution states with cryptographic rigor.

## 2. Personality & Mood

- **Character:** Authoritative, surgical, restrained, modern financial intelligence tool (Linear meets Bloomberg Terminal).
- **Tone:** Professional, objective, factual. Zero marketing buzzwords or generic AI slop.
- **Visual Vibe:** Deep, quiet dark luxury with purposeful micro-contrasts, crisp hairline borders, elevated glassmorphic cards with dose-capped accents, and clear typography hierarchy.

## 3. Palette & Materials

- **Neutral Base:**
  - Background: `zinc-950` (`#09090b`) with a subtle radial gradient wash (`from-zinc-900/30 via-zinc-950 to-zinc-950`).
  - Card Surfaces: `zinc-900/60` with backdrop blur, fine borders `zinc-800/70`, and subtle hover lift `hover:border-zinc-700/80 hover:bg-zinc-900/80`.
  - Foreground High-Contrast: `zinc-100` (`#f4f4f5`) for titles, critical amounts, primary values.
  - Foreground Medium-Contrast: `zinc-400` (`#a1a1aa`) for labels, secondary metrics, dates.
  - Foreground Muted: `zinc-500` / `zinc-600` for helper captions, inactive states, table headers.
- **Contextual Signals (1 Deliberate Accent Per Moment):**
  - **Confirmed / Live Network:** `emerald-400` / `emerald-500/10` border & background.
  - **Approval / Warning / Stale:** `amber-400` / `amber-500/10` border & background.
  - **Failed / Reverted / Outage:** `rose-400` / `rose-500/10` border & background.
  - **Active Focus / Brand Touch:** `indigo-500` / `indigo-500/20` focus rings and selection accents.

## 4. Typography

- **Interface / Structural (Sans-serif):** Headings, section titles, explanatory notes, labels, buttons, navigation cues. Clean, readable, tightly tracked headings.
- **On-chain Technical Data (Monospace):** Transaction hashes, wallet addresses, block numbers, gas fees, token contracts, and token raw/exact amounts. Styled with `tabular-nums` for alignment stability.

## 5. Iconography (Lucide Primitives)

- Purposeful visual cues:
  - `Search` / `ArrowRight` for transaction queries.
  - `Layers` / `Activity` for network status & overview.
  - `Check` / `CheckCircle2` for confirmed state & successful copy actions.
  - `AlertTriangle` / `XCircle` for rate limits & execution reverts.
  - `Copy` for clipboard operations.
  - `Clock` for block age and timestamps.
  - `Flame` / `Fuel` for suggested gas prices.
  - `ShieldCheck` for token allowances and permissions.
  - `History` for recent lookups.
  - `ExternalLink` for block explorer verification links.
  - `RefreshCw` for manual overview refresh with smooth spin state.
- **Antislop Rules:** No decorative emojis (🚀, 🔥, 📈). No decorative glowing pulsing dots that don't indicate real state. No generic AI sparkle/robot icons.

## 6. Liveliness Dials

- **ENERGY: 2** (Refined surfaces, micro-borders with subtle edge lighting, custom shadcn badges, polished interactive states).
- **RHYTHM: 2** (Varied layout sections: app header with status badge, focal search console with chain toggle pills, comprehensive market & network grid/table, collapsible search history drawer, and rich transaction investigation ledger).
- **MOTION: 1** (Tactile interactions, fast hover/focus transitions 150ms, rotating refresh trigger, zero perpetual looping animations).
