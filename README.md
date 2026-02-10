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
| **6** | Next | **Win condition and endgame** — Capture counter (10 or 15). Empty deck = no replacement. No units = lose. Can’t attack = move and pass. |
| **7** | Pending | **Item hand (display only)** — Show each player’s item hand; draw 1 item per turn. No usage/effects yet. |

## Project structure

- `index.html` — Main game page
- `style.css` — Layout and card styling
- `game.js` — Game logic
- `data.js` — Character (and later item) data
- `Character list.csv` — Unit roster
- `Items Deck - Technical sheet.md` — Item deck reference
- `Tacticlash Gameplay Manual 2.1.md` — Full rules

## Design notes (future)

- **Opponent fog of war:** Once the game is playable, Player 2’s face-down cards must be hidden from Player 1’s view (e.g. show only a “?” or card back) so Player 1 cannot cheat. Player 1’s own face-down cards stay as “soft face-down” (visible to P1 only). No action until we have a playable build.

## Getting started

Open `index.html` in a browser (or use a local server).
