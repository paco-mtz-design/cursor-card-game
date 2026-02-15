# Tacticlash — Development log

Granular trace of work for planning and debugging. Newest entries at the top.

---

## Phase 11 — Terrain cards

**Scope:** All five terrain cards (Elevated Ground, Reinforced Barricade, Paralyzing Vines, Divine Light, Unstable Ground) plus Tectonic Spike to remove terrain.

**Implementations:**
- **State:** `state.terrain` with shape `{ 1: [null,…,null], 2: […] }`; one terrain per tile; initialized in `getInitialState` and when game starts in `finishPlacementForPlayer`. Terrain does not move with units.
- **Place terrain:** In use-items, "Use" on a terrain card (via `TERRAIN_ITEM_NAMES` in `data.js`) targets any of the 10 slots; only tiles **without** terrain are selectable. `applyPlaceTerrain` sets terrain, removes card from hand, logs. No overwrite: cannot place on a tile that already has terrain.
- **UI:** In `renderBoard`, each slot shows a `.terrain-badge` when `state.terrain[player][col]` is set; slot can show both terrain and unit. CSS `.terrain-badge` added in `style.css`; slots use `flex-direction: column` so badge stacks above the unit card.
- **Combat order in `resolveCombat`:** (1) Attacker on Unstable Ground → flip; tails = attack canceled (end turn). (2) Lancer counter: if Lancer's tile has Unstable Ground, flip for counter attempt; tails = counter canceled. If Lancer blocks, `attackBlocked = true`. (3) Only if `!attackBlocked`: reveal defender, then defender tile — Elevated Ground (Brawler/Lancer) or Reinforced Barricade (Shooter/Caster) → flip; heads = attack fails. (4) Apply damage, Caster paralyze, Barbed Gauntlets (only when attack actually hit defender). Helper `getTerrain(player, col)` returns terrain name or null.
- **Paralyzing Vines:** In `doMove` and `doTeleportMove`, at start, if the unit's **current** tile (the one they are leaving) has Paralyzing Vines, flip; tails = move/teleport fails (no board change). Moving **to** a tile with Paralyzing Vines does not trigger the effect.
- **Divine Light:** After a unit is placed or lands on a tile, if that tile has Divine Light set the unit's `faceUp = true`. Applied in `placeUnit`, `placeAllRandomly`, `runReinforcement`, `doMove`, and `doTeleportMove`.
- **Tectonic Spike:** In use-items, "Use" on Tectonic Spike → target a tile that **has** terrain (either side). `applyTectonicSpike` removes that terrain from the board (push to discard), removes Tectonic Spike from hand (to discard), logs. Only slots with terrain are highlighted when targeting.
- **Use button for terrain:** In `renderItemHands`, "Use" is shown for terrain cards when `countEmptyTerrainSlots() > 0` and for Tectonic Spike when `countTilesWithTerrain() > 0`.

**Bug fixes (same phase):**
- Placed terrain cards were incorrectly added to the item discard pile; they are only removed from hand (card is on the board). Only Tectonic Spike and similar effects send terrain to discard.
- Placing Divine Light on a tile that already had a face-down unit did not reveal that unit; `applyPlaceTerrain` now sets `faceUp = true` for any unit on that tile when placing Divine Light.
- Move/swap log no longer redundantly says the acting unit "is revealed"; when the swapped unit lands on Divine Light, log now says "[Unit] is revealed (Divine Light)." (same for teleport swaps).
- Paralyzing Vines tails: move/teleport no longer leaves the turn stuck in move step; on failure we now advance to attack step so the unit must still attack (or pass).

**Files touched:** `data.js` (TERRAIN_ITEM_NAMES), `game.js` (state, place/remove terrain, combat/movement/placement hooks, UI, Use button, bug fixes), `style.css` (terrain-badge), `DEV_LOG.md`.

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
