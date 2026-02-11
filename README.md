# Tacticlash — Web Prototype

Web-based prototype of the Tacticlash card game.

## Development phases

MVP plan we’re following. Phases are built in order; each is testable before moving on.

| Phase | Status | Description |
|-------|--------|-------------|
| **1** | ✅ Done | **Static board and shell** — 5×2 grid, two rows of 5 slots, clickable/targetable. Header with title and New game button. |
| **2** | ✅ Done | **Units on the board** — Unit cards (face-down soft / face-up) with real character names and classes. Damage and status markers (e.g. Paralyzed). |
| **3** | ✅ Done | **New game and setup flow** — Choose capture goal (10 or 15). Coin flip for first player. Shuffle unit deck, each player draws 5 and places them (manual or “Place all randomly”). |
| **4** | ✅ Done | **Turn structure and “one unit acts”** — Reinforcement phase (replace captured units, draw 1 item). Action phase: choose 1 unit → optional move (1 slot L/R, swap) → must attack (target choice in Phase 5). End turn. |
| **5** | ✅ Done | **Combat and range** — Enforce range (Brawler: same column; Lancer: diagonal; Shooter: 3+; Caster: any). Resolve damage, Lancer counter, Longshot, Caster paralysis. Capture at 0 HP, place markers. |
| **6** | ✅ Done | **Win condition and endgame** — Capture counter (10 or 15). Empty deck = no replacement. No units = lose. Can’t attack = move and pass. |
| **7** | ✅ Done | **Item hand (display only)** — Show each player’s item hand; draw 1 item per turn. No usage/effects yet. |

## Current state & handoff (for new chats)

- **Branch:** `development` (Phases 1–7 done; `main` has through Phase 3 or as last merged).
- **Done through Phase 7:** Full playable loop: setup (goal 10/15, coin flip, placement) → turns (reinforcement, draw 1 item, select unit → optional move → attack with range/class buffs) → replace captured before pass → win (capture goal or no units), pass when no valid target. Item hands shown with real item names; unit cards show sprites (see `assets/`). Game log and game-over banner. **Items are not yet playable.**
- **Next:** Phase 8 — “Use items” step, item discard, first single-use (Healing Potion), debug controlled item draw, expand card to read effect, log item plays. See [ROADMAP.md](ROADMAP.md).
- **Key files:** `game.js`, `index.html`, `data.js`, [ROADMAP.md](ROADMAP.md).

## Project structure

- `index.html` — Main game page
- `style.css` — Layout and card styling
- `game.js` — Game logic
- `data.js` — Character (and later item) data
- `assets/` — Images and sprites (see `assets/README.md`)
  - `assets/units/` — Unit card sprites (PNG; filename = character name slug, e.g. `harlund-ironhowl.png`)
  - `assets/items/` — Item card art (for future use)
- `Character list.csv` — Unit roster
- `Items Deck - Technical sheet.md` — Item deck reference
- `Tacticlash Gameplay Manual 2.1.md` — Full rules
- `ROADMAP.md` — Phases 8+ (item effects, gear, terrain, veteran buffs, UI, debug, fog of war later)

## Roadmap (Phases 8+)

See **[ROADMAP.md](ROADMAP.md)** for the plan: confirmed gaps (use-items step, discard, item state, true-strike, veteran data), Phase 8 (one single-use card at a time from Healing Potion, debug item draw, expand card, log), and Phases 9–16. Fog of war deferred until CPU opponent.

## Design notes (future)

- **Opponent fog of war:** Deferred until we add an autonomous CPU opponent. Then P2 face-down cards will be hidden from P1 (card back or "?"); P1 own face-down stay as "soft face-down" (visible to P1 only).

## Getting started

Open `index.html` in a browser (or use a local server).
