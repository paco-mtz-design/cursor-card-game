# Tacticlash — Development log

Granular trace of work for planning and debugging. Newest entries at the top.

---

## Phase 10 — Gear accessories (Barbed Gauntlets, Wardstone Bracelet, Teleport Boots)

**Scope:** Phase 10 focused on three gear accessories; True-Strike Lens and Magic Grenade were deferred to a later phase.

**Implementations:**
- **Gear equip (armor + accessories):** Single equip flow in use-items. `GEAR_EQUIP_ITEM_NAMES` (armors + the three accessories), `getGearAllowedClasses` / `canEquipGear` / `countValidGearTargets` support both `gear_armor` and `gear_accessory`. In `data.js`, the three accessories have `allowedClasses` so any unit can equip them.
- **Barbed Gauntlets:** After defender takes damage, if defender had Barbed Gauntlets and attacker is Brawler or Lancer, coin flip; on heads deal 1 damage to attacker (can capture). Single log line; `applyDamage` given optional `skipLog` to avoid duplicate log.
- **Wardstone Bracelet:** When attack target has Wardstone, show “Use Wardstone to negate this attack?” with Use / No. Use = discard Wardstone, negate attack, end turn. No = resolve combat normally. `state.pendingWardstone`, two buttons in turn UI, `doWardstoneUse` / `doWardstoneNo`.
- **Teleport Boots:** In move step, if active unit has Teleport Boots, all five slots on their row are valid (current slot only selected). Click empty slot = move there; click friendly = swap. `doTeleportMove(toCol)`; move left/right unchanged for non-teleport (and still work for teleport units for adjacent moves).

**Bug fixes (same phase):**
- Equipped gear was incorrectly pushed to discard on equip; only the **previous** gear (when swapping) is discarded now.
- When a unit is captured, their equipped gear is moved to the item discard pile in `applyDamage` before clearing the cell.

**Files touched:** `data.js`, `game.js`, `index.html`, `ROADMAP.md`.
