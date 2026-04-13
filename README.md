# Tacticlash — Web Prototype

Web-based prototype of the Tacticlash card game.

## Current phase of development

**Phase 16 — Seer's Bestiary (wrapped)**

Phase 16 ships the advanced Seer's Bestiary ruleset: optional default-on mode, milestone reveal flow, stacked faction-wide effects, debug controls, and QA-driven fixes. One UX refinement is intentionally deferred: battlefield dual-gear layered rendering for Iron-Clad Shield (unit zoom support is already shipped). See **[ROADMAP.md](ROADMAP.md)** for phase status and **[DEV_LOG.md](DEV_LOG.md)** for shipped details and deferred notes.

---

## Previously completed phases

**Phases 1–16** are complete: **MVP (Phases 1–7)** through **Phase 16 — Seer's Bestiary**. Summaries and status for every phase: **[ROADMAP.md](ROADMAP.md)**.

---

## Next on the roadmap

**Phase 17** — Further UI improvements (including deferred Bestiary UX refinements) · **Phase 18** — CPU opponent (optional fog-of-war for opponent face-down units) · **Phase 19** — cross-regression QA sweep. Full plan: **[ROADMAP.md](ROADMAP.md)**.

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

- **Opponent fog of war:** Planned alongside **Phase 18** (CPU opponent). Opponent’s face-down cards may show card back or “?”; your own face-down stay “soft” visible to you.

---

## Getting started

Open `index.html` in a browser (or use a local server).
