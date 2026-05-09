# Tacticlash — Web Prototype

Web-based prototype of the Tacticlash card game.

## Current phase of development

**Card Index + item artwork variations (wrapped, branch `card-index`)**

Out-of-roadmap polish prioritised between the `start-sequence` merge and Phase 17. Two related improvements landed on the same branch:

- **Card Index modal.** A new "Card Index" button in the top bar (left of Seer's Bestiary) opens a large browse-only modal listing every card in the game — Units, Items, Bestiary — at a fixed 260 px width matching the discard pile. A chip-style filter rail at the top supports multi-select Type / Class / Faction / Experience / Item Category / Bestiary Tag (Buff / Debuff). Sub-filter groups appear and disappear via GSAP height+opacity transitions based on which Types are active. A "Show duplicates" toggle (on by default) renders every deck copy of items so players can gauge draw probabilities; off collapses to one entry per unique name. Filters live on `state.cardIndexFilters` and persist across modal open/close within a match (reset on a new game).
- **Item artwork variations.** Light Armor (4 variants across 7 copies, A,A,B,B,C,C,D), Healing Potion (4, one per copy), Magic Grenade and Wardstone Bracelet (2 each, one per copy) now ship with multiple illustrations. Same name, same effect, different art for flavor. Variation is fixed at deck-build time (`data.js`: `ITEM_VARIATIONS`) and travels with the card through draw → hand → equipped gear / terrain → discard. Every render site — hand, board mini-cards, unit zoom, item zoom, summoning modal, discard pile, Card Index — picks up the correct variation. `getItemCardImagePath(name, variation)` resolves through a new `ITEM_VARIATION_FILENAME_PATTERNS` map; non-varied items behave exactly as before.

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
