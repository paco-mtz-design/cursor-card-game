# Tacticlash — Web Prototype

Web-based prototype of the Tacticlash card game.

## Development phases (MVP)

MVP plan (Phases 1–7). Each phase is testable before moving on.

| Phase | Status | Description |
|-------|--------|--------|
| **1** | Done | **Static board and shell** — 5×2 grid, two rows of 5 slots, clickable/targetable. Header with title and New game button. |
| **2** | Done | **Units on the board** — Unit cards (face-down soft / face-up) with real character names and classes. Damage and status markers (e.g. Paralyzed). |
| **3** | Done | **New game and setup flow** — Choose capture goal (10 or 15). Coin flip for first player. Shuffle unit deck, each player draws 5 and places them (manual or “Place all randomly”). |
| **4** | Done | **Turn structure and “one unit acts”** — Reinforcement phase (replace captured units, draw 1 item). Action phase: choose 1 unit → optional move (1 slot L/R, swap) → must attack (target choice in Phase 5). End turn. |
| **5** | Done | **Combat and range** — Enforce range (Brawler: same column; Lancer: diagonal; Shooter: 3+; Caster: any). Resolve damage, Lancer counter, Longshot, Caster paralysis. Capture at 0 HP, place markers. |
| **6** | Done | **Win condition and endgame** — Capture counter (10 or 15). Empty deck = no replacement. No units = lose. Can’t attack = move and pass. |
| **7** | Done | **Item hand (display only)** — Show each player’s item hand; draw 1 item per turn. |

Post-MVP phases (8+) are tracked in **[ROADMAP.md](ROADMAP.md)**; shipped implementation detail is in **[DEV_LOG.md](DEV_LOG.md)** (newest entries at the top).

---

## Current state & handoff (for new chats)

- **Implemented after MVP:** Phases **8–13** are complete — use-items flow, items discard, gear (armor + accessories), terrain, single-use items and true strike, promotions. See **[DEV_LOG.md](DEV_LOG.md)** for file-level notes.
- **In progress:** **Phase 14 — Board & unit UI** — slot layout, fanned gear/terrain on units, markers, spacing, polish. See [ROADMAP.md](ROADMAP.md) Phase 14 and DEV_LOG Phase 14.
- **Next on roadmap:** Phases **15–18** (veteran buffs → tarot → further UI → CPU opponent). Full table: **[ROADMAP.md](ROADMAP.md)**.
- **Branch:** Active feature branch varies (e.g. `board-ui` for UI work); use `git branch` for the current branch.

### Where to look

| Need | File |
|------|------|
| **What’s planned and in what order** | [ROADMAP.md](ROADMAP.md) |
| **What was actually built and which files changed** | [DEV_LOG.md](DEV_LOG.md) |

### Key code files

`game.js`, `index.html`, `data.js`, `style.css`; assets under `assets/` (see [assets/README.md](assets/README.md)).

### Progress docs

`README.md` (this file) — intro and handoff · `ROADMAP.md` — phases 8+ plan · `DEV_LOG.md` — implementation log.

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
- `ROADMAP.md` — Phases 8+ (through CPU opponent)
- `DEV_LOG.md` — Shipped work by phase

---

## Design notes (future)

- **Opponent fog of war:** Planned alongside **Phase 18** (CPU opponent). Opponent’s face-down cards may show card back or “?”; your own face-down stay “soft” visible to you.

---

## Getting started

Open `index.html` in a browser (or use a local server).
