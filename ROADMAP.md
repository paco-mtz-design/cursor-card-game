# Tacticlash — Roadmap (Phases 8+)

Development plan for item effects, veteran buffs, UI evolution, and debug tooling after the core MVP (Phases 1–7). Adjust as we learn from Phase 8.

---

## Confirmed gaps (to address in rollout)

- **Turn structure vs manual:** Action Phase must start with a “use items” step (equip gear, place terrain, use single-use), then Combat (select unit → move → attack). We currently go straight to `select_unit` after reinforcement.
- **Item discard:** Single-use and swapped gear go to a discard pile. We need `state.itemDiscard` and to remove played items from hand.
- **State model for items:** Items in hand are `{ name, id }`. We’ll need: item type, gear per unit, terrain per slot, and targeting for single-use.
- **“True strike” / bypass effects:** Some items make attacks ignore terrain/item/unit effects. We need a flag in combat resolution and to skip terrain/defender effects when set.
- **Veteran data:** Characters have `level: 'Rookie' | 'Veteran'`; we still need per-unit veteran buff definitions and combat hooks.
- **Fog of war:** Defer until all logic is in place and we add an autonomous CPU opponent. No need to hide opponent’s face-down during development.

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

## Phases 10–17 and later

| Phase  | Focus                           | Notes |
|--------|----------------------------------|-------|
| **10** | Gear (accessories)              | Barbed Gauntlets, Wardstone Bracelet, Teleport Boots. True-Strike Lens and Magic Grenade deferred to a later phase (after terrain / true strike). |
| **11** | Terrain                         | Terrain per slot; place in "use items"; resolve in movement and combat. |
| **12** | Remaining single-use + True-Strike Lens + true strike | Corrosive Phial, Obscuring bomb, Vorpal Honing Amulet, Magic Grenade; True-Strike Lens (gear). True-strike/bypass flag in combat (skip terrain + Lancer for Vorpal and True-Strike Lens). Tectonic Spike already in Phase 11. |
| **13** | Promotions                      | Class-specific upgrades; +1 HP and modified range/effects. |
| **14** | Veteran buffs                   | Per-character buff definitions; hooks in combat. After items/terrain stable. |
| **15** | Board-game UI (foundation)       | Decks visible, hands laid out, room for terrain + gear; inspect card. |
| **16** | Debug tooling (unit deck)       | Controlled unit-card draw; log extended for all events. |
| **Later** | Fog of war                    | When adding CPU opponent: opponent’s face-down = card back or “?”. |
| **Later** | Visuals + AI                  | Visual flair; then CPU opponent with difficulty levels. |

---

## Implementation order (items)

Gear (armor → accessories/weapons), then terrain, then remaining single-use (Corrosive Phial, Obscuring bomb, Vorpal Honing Amulet, Magic Grenade) and True-Strike Lens + true strike, then promotions, then veteran buffs.
