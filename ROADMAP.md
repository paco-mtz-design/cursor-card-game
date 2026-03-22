# Tacticlash — Roadmap (Phases 8+)

Development plan for item effects, board/UI, veteran buffs, tarot, further UI, and CPU opponent after the core MVP (Phases 1–7). Adjust as we learn.

---

## Confirmed gaps (still open or deferred)

- **Veteran data:** Characters have `level: 'Rookie' | 'Veteran'`; per-unit veteran buff definitions and combat hooks — planned for **Phase 15**.
- **Fog of war:** Defer until **Phase 18** (CPU opponent). No need to hide opponent’s face-down during development.

### Resolved (historical — was in earlier gap lists)

The following were addressed across Phases 8–13: use-items step at start of Action Phase; item discard pile; item/gear/terrain state and targeting; true strike / bypass in combat. Details in [DEV_LOG.md](DEV_LOG.md).

---

## Phase 8 — “Use items” step + first single-use + debug + UI

**One card at a time.** Insert “use items” step at start of Action Phase; add item discard pile. Implement single-use items **one by one** (start with **Healing Potion**), test after each, and flag conflicts/interactions with existing effects.

- **Debug:** Optional controlled item draw (random vs choose specific card from remaining item deck) to expedite testing.
- **UI:** Item hand allows “expand” a card to read its details (effect text).
- **Log:** All new item plays and effects are added to the game log.

---

## Phase 9 — Gear (armor)

Light Armor, Premium Light Armor, Heavy Armor. One gear per unit; equip in "use items"; armor adds HP.

**Armor equip rule:** A player cannot equip (or swap) gear onto a unit if that would cause the unit to be captured—e.g. a Lancer with 1 damage wearing Light Armor (+1 HP) has effective 2 max HP; removing or swapping that armor would leave them at 1/1 and captured. Such a unit is not a valid target for equipping any new gear. An opponent may still destroy a unit's gear (e.g. Rust Spell, or veteran buffs later); if that removal reduces max HP so that current damage ≥ new max HP, the unit is captured as a result. Summary: you cannot cause your own unit to be captured by removing gear; an opponent can.

---

## Phases 10–13 (shipped)

| Phase  | Focus                           | Notes |
|--------|---------------------------------|-------|
| **10** | Gear (accessories)              | Barbed Gauntlets, Wardstone Bracelet, Teleport Boots. True-Strike Lens and Magic Grenade deferred to Phase 12. |
| **11** | Terrain                         | Terrain per slot; place in "use items"; resolve in movement and combat. |
| **12** | Remaining single-use + True-Strike Lens + true strike | Corrosive Phial, Obscuring bomb, Vorpal Honing Amulet, Magic Grenade; True-Strike Lens (gear). Tectonic Spike in Phase 11. |
| **13** | Promotions                      | Champion's Crest, Vanguard Lance, Sharpshooter's Scope, Archmage's Tome. |

---

## Phases 14–18 (current and upcoming)

| Phase  | Focus                           | Notes |
|--------|---------------------------------|-------|
| **14** | **Board UI improvements** (current) | Everything related to board presentation: unit tiles, gear/terrain stack on units, slot layout, spacing, markers, polish. See [DEV_LOG.md](DEV_LOG.md) Phase 14. |
| **15** | Veteran buffs                   | Per-character buff definitions; hooks in combat. |
| **16** | Tarot cards                     | Tarot mechanics and UI as designed for the full game. |
| **17** | Potential UI further improvements | Additional layout, polish, optional debug/inspector tooling, deck visibility—TBD. |
| **18** | Add CPU opponent                | Autonomous opponent; fog of war for opponent face-down cards can align with this phase. |

---

## Implementation order (high level)

Items (Phases 8–13) are shipped. **Next:** **Phase 14** board/unit UI, then **Phase 15** veteran buffs, **Phase 16** tarot, **Phase 17** further UI, **Phase 18** CPU opponent.

Within items, the historical order was: gear (armor → accessories), terrain, remaining single-use and True-Strike Lens + true strike, then promotions.
