# Tacticlash — Roadmap

Single source of truth for **phase order**, **scope**, and **status**. Implementation detail lives in **[DEV_LOG.md](DEV_LOG.md)** (newest entries first).

**Status legend**

| Status | Meaning |
|--------|---------|
| **Done** | Shipped in the prototype |
| **Current** | Active focus |
| **Planned** | Not started yet |

**MVP** = Phases **1–7** (core loop before items/gear expansions).

---

## All phases

| Phase | Focus | Status | Notes |
|-------|--------|--------|--------|
| **1** | Static board and shell | Done | MVP — 5×2 grid, clickable slots, header, New game |
| **2** | Units on the board | Done | MVP — Face-up/face-down units, names/classes, damage/status markers |
| **3** | New game and setup | Done | MVP — Capture goal, coin flip, place 5 units (manual or random) |
| **4** | Turn structure (“one unit acts”) | Done | MVP — Reinforcement, action phase: select unit → optional move → attack; end turn |
| **5** | Combat and range | Done | MVP — Brawler/Lancer/Shooter/Caster ranges, counters, Longshot, paralysis, captures |
| **6** | Win condition and endgame | Done | MVP — Capture goal, empty deck, no units, pass when no attack |
| **7** | Item hand (display) | Done | MVP — Item hands + draw 1 item per turn |
| **8** | Use-items step + first single-use + debug + UI | Done | Item discard pile; Healing Potion first; optional debug item draw; expand/read cards |
| **9** | Gear (armor) | Done | Light / Premium Light / Heavy; one gear per unit; armor HP; equip/capture rules |
| **10** | Gear (accessories) | Done | Barbed Gauntlets, Wardstone Bracelet, Teleport Boots (True-Strike Lens → Phase 12) |
| **11** | Terrain | Done | Terrain per slot; place in use-items; movement/combat hooks; Tectonic Spike |
| **12** | Remaining single-use + True-Strike Lens + true strike | Done | Corrosive Phial, Obscuring bomb, Vorpal, Magic Grenade; true strike in combat |
| **13** | Promotions | Done | Champion's Crest, Vanguard Lance, Sharpshooter's Scope, Archmage's Tome |
| **14** | Board & unit UI | Done | Unit tiles, gear/terrain stacks, hands, markers, spacing, contextual move controls, polish |
| **15** | Veteran buffs | Done | Veteran implementation complete through R3 (Lancer/on-hit/interrupt/caster + Ardan Veilstep). Remaining QA debt is documented and deferred to Phase 19 sweep. |
| **16** | Seer's Bestiary (advanced ruleset) | Done | Optional default-on mode, milestone reveal flow, stacked faction effects, QA fixes, and documented deferred UX debt |
| **17** | Further UI improvements | Planned | Layout, polish, and deferred Bestiary UX refinements (including battlefield dual-gear presentation) |
| **18** | CPU opponent + animation layer | Done | Autonomous CPU opponent (`cpu.js` policy module, Continue-button announce flow); full GSAP animation layer on top — BeatQueue reference-counted display gate, coin-flip / reveal / capture / item-arc sequencing, turn-start banner, item summoning zoom (incl. Wardstone activation), §24 damage-resolution sequence (rattle → buffer → capture arc with HP-counter gating). Implementation history split across two specs in `feature specs/`: Phase 1 (CPU policy + wiring) and Phase 2 (animation layer + UX polish). |
| **19** | Cross regression sweep at scale (R4) | Planned | Large-scope validation pass for Veteran Buffs and related combat/item interactions before broad feature expansion. Includes completion of open QA checklists. |

---

## Confirmed gaps (open or deferred)

- **Veteran implementation QA debt:** Core implementation is complete, but unfinished validation remains; consolidated into **Phase 19** (cross-regression sweep at scale).
- **Open QA lists for Phase 19:** `QA_PHASE15_R2_LOG_TEMPLATE.md`, `QA_TARGETED_REGRESSION_CHECKLIST.md`, plus R3 targeted follow-up scenarios noted in `DEV_LOG.md`.
- **Seer's Bestiary reveal-flow lock (deferred):** In certain milestone-reveal sequences, header can remain stuck on `"Seer's Bestiary reveal in progress."` after modal dismissal. Manual unblock exists (force affected column inactive). Detailed repro/theories documented in `DEV_LOG.md`.
- **Seer's Bestiary battlefield dual-gear UX debt (deferred):** Unit zoom supports the second Iron-Clad Shield gear slot, but in-battle stacked-layer rendering for dual gear remains postponed for a later refinement pass.
- **Multi-target damage sequencing (Phase 18 animation tech debt):** Archmage's Tome AOE, Iron Maiden retaliation, Pack Shield bounceback and Magic Grenade currently rattle their targets in parallel. Agreed direction is sequential resolution (one target rattles + resolves, then the next). Full implementation idea documented in the §24 entry of `DEV_LOG.md`.
- **Reinforcement-from-deck animation (Phase 18 UX debt):** No animation today for drawing a reinforcement from the units deck onto a vacated slot — the new face-down unit just appears. Best handled inside a broader "card draw from deck" pass (units deck → board, item deck → hand). Documented in `DEV_LOG.md`.
- **Harlund / Archmage multi-hit visual interleaving (Phase 18 deferred):** Multi-target resolution loop runs `applyDamage` calls synchronously, producing a burst of overlapping animations. Sequencing improved with BeatQueue but still imperfect under adversarial combinations. Proper fix needs an async step loop in combat resolution. Documented in `DEV_LOG.md`.
- **Fog of war:** No longer blocked — Phase 18 ships CPU opponent. A dedicated fog-of-war pass for opponent face-down units is still open as a Phase 17 / future polish item.

### Resolved (historical)

Phases **8–14** delivered: use-items flow, discard piles, gear/terrain/single-use/promotions, true strike, and board/UI work. See **[DEV_LOG.md](DEV_LOG.md)**.

---

## Out-of-roadmap polish shipped

Player-facing improvements that fell outside the numbered phase plan but landed on `main`. Detail in **[DEV_LOG.md](DEV_LOG.md)**.

- **Start sequence UI refactor** (branch `start-sequence`) — parchment start screen, in-board reorder placement, auto coin flip, board chrome entrance choreography.
- **Card Index + item artwork variations** (branch `card-index`) — browse-only modal listing every card in the game with chip-style filters; item deck now carries variation metadata so some items ship with multiple illustrations.
- **Interactive Manual + entry points** (branch `game-manual`) — standalone React + Tailwind manual page (`manual/index.html`) reachable from a bottom-right corner badge on the start screen and a "Learn how to play" button in the in-game header. Both open in a new tab; no game-logic changes.

---

## Implementation order (reference)

**Done:** Phases **1–16** (MVP through Seer's Bestiary) plus **Phase 18** (CPU opponent + animation layer). **Next:** **17** (further UI improvements + deferred Bestiary UX), then **Phase 19** cross-regression sweep as dedicated QA hardening.

Within the original items track, work landed in order: **8–9** (use-items + armor), **10** accessories, **11** terrain, **12** remaining single-use + True-Strike Lens + true strike, **13** promotions, then **14** UI. Phase **18** landed in two passes: CPU policy + Continue-button wiring on `cpu-opponent`, then the GSAP animation layer + UX polish on `animations`.
