# Tacticlash — Web Prototype

Web-based prototype of the Tacticlash card game.

## Current phase of development

**Start sequence UI refactor (wrapped, branch `start-sequence`)**

A polished, player-grade replacement for the prototype "New game" modal + interleaved coin/place flow, prioritised outside the planned roadmap. Shipped in three stages:

- **Stage 1 — Parchment start screen.** A fullscreen Claude-Design-styled landing page with all match settings (capture goal, CPU difficulty, Bestiary, match mode, choose-CPU-units, show-debug-ui). A new "Disable debug controls" toggle hides the in-game debug knobs (item-draw replace, placement pick, Bestiary modify selects) via `body.no-debug`. Save log is never hidden.
- **Stage 2 — Reorder placement + coin-after-placement.** "Begin Duel" lands directly in P1 placement (chrome hidden via `body.in-placement`); cards pre-place randomly with the existing staggered slide-in and the player reorders by clicking pairs of slots (reuses `Anim.captureReorderSwap` / `animateReorderSwap`, the Obscuring Bomb pattern). After Lock In, P2 face-down auto-place in CPU mode or face-up reorder in Manual / "Choose CPU starting units" ON. The coin auto-fires after both rows are set, with the title morphing through "Who goes first?" → "Heads/Tails — Player N goes first" → fade.
- **Stage 3 — Board chrome entrance choreography.** Three sequential GSAP waves around the placed cards: right sidebar slides in from the right while `.board__center` FLIP-slides leftward in parallel (no jump); top + bottom item hands slide in vertically; decks slide in from the right. Turn banner fires last. All gated by `BeatQueue` so nothing fires under the chrome animation.

See **[DEV_LOG.md](DEV_LOG.md)** for the detailed shipped entry and **[CONTINUATION_SPEC.md](CONTINUATION_SPEC.md)** for next-session handoff.

---

## Previously completed phases

**Phases 1–16** plus **Phase 18** are complete: **MVP (Phases 1–7)** through **Phase 16 — Seer's Bestiary**, then **Phase 18 — CPU opponent + animation layer**. Summaries and status for every phase: **[ROADMAP.md](ROADMAP.md)**.

---

## Next on the roadmap

**Phase 17** — Further UI improvements (including deferred Bestiary UX refinements + fog-of-war for opponent face-down units) · **Phase 19** — cross-regression QA sweep. Full plan: **[ROADMAP.md](ROADMAP.md)**.

---

## Where to look

| Need | File |
|------|------|
| **Phases, status, and order** | [ROADMAP.md](ROADMAP.md) |
| **What shipped and which files changed** | [DEV_LOG.md](DEV_LOG.md) |
| **Player-facing rules clarifications** (counters, edge cases, stacking) | [RULES.md](RULES.md) |

### Key code files

`game.js`, `index.html`, `data.js`, `style.css`; assets under `assets/` (see [assets/README.md](assets/README.md)).

---

## Project structure

- `index.html` — Main game page
- `style.css` — Layout and card styling
- `game.js` — Game logic
- `data.js` — Character and item data
- `assets/` — Images and sprites (see `assets/README.md`)
  - `assets/units/` — Unit card art (e.g. `full-cards/` for board portraits)
  - `assets/items/` — Item card art
- `Character list.csv` — Unit roster
- `Items Deck - Technical sheet.md` — Item deck reference
- `Tacticlash Gameplay Manual 2.1.md` — Full rules

---

## Design notes (future)

- **Opponent fog of war:** Now unblocked by Phase 18 (CPU opponent shipped). Open as a Phase 17 / future polish item — opponent face-down cards may show card back or "?"; your own face-down stay "soft" visible to you.

---

## Getting started

Open `index.html` in a browser (or use a local server).
