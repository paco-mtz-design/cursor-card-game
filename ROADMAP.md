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
| **15** | Veteran buffs | Current | Per-unit veteran definitions; combat hooks (`level` already in data) |
| **16** | Tarot cards | Planned | Mechanics + UI as designed for the full game |
| **17** | Further UI improvements | Planned | Layout, polish, optional tooling — TBD |
| **18** | CPU opponent | Planned | Autonomous opponent; fog-of-war for opponent face-down can align here |

---

## Confirmed gaps (open or deferred)

- **Veteran data & rules:** Per-unit veteran buff definitions and combat hooks — **Phase 15** (current).
- **Fog of war:** Deferred to **Phase 18** with the CPU opponent. No need to hide opponent face-down during solo development.

### Resolved (historical)

Phases **8–14** delivered: use-items flow, discard piles, gear/terrain/single-use/promotions, true strike, and board/UI work. See **[DEV_LOG.md](DEV_LOG.md)**.

---

## Implementation order (reference)

**Done:** Phases **1–14** (MVP through board/unit UI). **Current:** **Phase 15** (veteran buffs). **Next:** **16** → **17** → **18**.

Within the original items track, work landed in order: **8–9** (use-items + armor), **10** accessories, **11** terrain, **12** remaining single-use + True-Strike Lens + true strike, **13** promotions, then **14** UI.
