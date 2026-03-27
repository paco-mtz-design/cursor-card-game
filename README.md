# Tacticlash — Web Prototype

Web-based prototype of the Tacticlash card game.

## Current phase of development

**Phase 15 — Veteran buffs**

Wire per-character veteran buff definitions and combat hooks. Characters already expose `level: 'Rookie' | 'Veteran'` in data; this phase implements what “Veteran” means in play. See **[ROADMAP.md](ROADMAP.md)** for the full phase list and **[DEV_LOG.md](DEV_LOG.md)** for file-level shipped work.

---

## Previously completed phases

**Phases 1–14** are complete: **MVP (Phases 1–7)** through **Phase 14 — Board & unit UI** (board/unit presentation, item hands, contextual move controls, polish). Summaries and status for every phase: **[ROADMAP.md](ROADMAP.md)**.

---

## Next on the roadmap

**Phase 16** — Tarot cards · **Phase 17** — Further UI improvements · **Phase 18** — CPU opponent (optional fog-of-war for opponent face-down units). Full plan: **[ROADMAP.md](ROADMAP.md)**.

---

## Where to look

| Need | File |
|------|------|
| **Phases, status, and order** | [ROADMAP.md](ROADMAP.md) |
| **What shipped and which files changed** | [DEV_LOG.md](DEV_LOG.md) |

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
