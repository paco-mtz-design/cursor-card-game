# Tacticlash — Development log

Granular trace of work for planning and debugging. Newest entries at the top.

---

## Phase 12 — Remaining single-use + True-Strike Lens + true strike

**Scope:** Corrosive Phial, Obscuring bomb, Vorpal Honing Amulet, Magic Grenade (single-use); True-Strike Lens (gear). True-strike/bypass in combat (skip attacker Unstable Ground, Lancer counter, defender Elevated/Reinforced terrain when true strike applies).

**Implementations:**
- **True strike in combat:** At start of `resolveCombat`, `trueStrike` is true when (1) `state.vorpalNextAttack === attackerPlayer` (Vorpal Honing Amulet) or (2) attacker has True-Strike Lens and is Shooter or Caster. When true strike: skip Unstable Ground (attacker tile), skip entire Lancer counter block, skip defender terrain (Elevated Ground, Reinforced Barricade). Log "True strike — attack ignores terrain and Lancer counters." Clear `state.vorpalNextAttack` after that attack resolves.
- **Vorpal Honing Amulet:** Single-use, no target. "Use" in use-items applies immediately: remove from hand to discard, set `state.vorpalNextAttack = state.currentPlayer`. Next attack by that player gets true strike and **lethal damage** (damage set to defender's remaining HP so attack captures in one hit). Flag cleared after that attack. Wardstone can still be offered; if defender uses Wardstone, attack is negated and Vorpal is not consumed.
- **True-Strike Lens:** Gear accessory in `GEAR_EQUIP_ITEM_NAMES`; `allowedClasses: ['Shooter', 'Caster']` in `data.js`. Equip flow unchanged. In `resolveCombat`, included in `trueStrike` check so Shooters/Casters with this gear ignore terrain and Lancer counters.
- **Corrosive Phial:** Single-use. Target any face-up unit that has gear (yours or opponent's). "Use" button shown when `countUnitsWithGear() > 0` (any unit with gear); targeting still only highlights face-up units with gear. `applyCorrosivePhial`: push target's gear to discard, set `cell.gear = null`, remove Corrosive Phial from hand to discard.
- **Obscuring bomb:** Single-use, no target. "Use" applies immediately: flip all current player's units face-down, remove card from hand to discard, then enter **reorder mode** (`state.obscuringReorder`). Player clicks one slot then another to swap units; "Done reordering" clears the mode. No random shuffle — player chooses final positions.
- **Magic Grenade:** Single-use. Target one of your units. "Use" → click your unit slot. `applyMagicGrenade`: set `cell.nextAttackAsCaster = true`, remove card from hand to discard. In combat: `getEffectiveAttackerClass(attCell)` returns `'Caster'` when `nextAttackAsCaster` is set (any range, 1 damage, paralyze on hit). Used in `canAttack`, attack-step highlighting, and `resolveCombat` for damage/paralyze and defender terrain class check. Flag cleared after that attack. **`nextAttackAsCaster` is preserved** when the unit moves (swap or Teleport Boots) in `doMove` and `doTeleportMove`.
- **Face-down HP persistence:** In `createUnitCardHTML`, face-down cards now show the damage/HP marker (e.g. "1/2 dmg") when `damage > 0`, so units turned face-down by Obscuring bomb (or future effects) keep HP visible. Data attributes `data-hp` and `data-damage` set on face-down cards. (Future: hide this on CPU's face-down cards when fog-of-war is added; keep on player's cards.)
- **Item draw debug picker:** Search/filter input added; type to filter the deck (e.g. "Ma" → Magic Grenade). List container made taller (~11rem) so ~5 items visible while scrolling.

**Bug fixes (same phase):**
- Obscuring bomb no longer random-shuffles; replaced with manual reorder (swap two slots, then Done).
- Corrosive Phial "Use" button was hidden when no face-up unit had gear; now shows whenever any unit has gear; valid targets remain face-up units with gear.
- Magic Grenade: `nextAttackAsCaster` was lost when the attacking unit moved; now copied in `doMove` and `doTeleportMove` so Caster range/effect applies after a move.
- Vorpal Honing Amulet: attack bypassed terrain/Lancer but only dealt 1 damage; now deals **lethal** damage (enough to capture defender in one hit) when `state.vorpalNextAttack === attackerPlayer`.

**Files touched:** `ROADMAP.md` (Phase 12 row and implementation order), `data.js` (True-Strike Lens `allowedClasses`), `game.js` (state `vorpalNextAttack`, `obscuringReorder`, true-strike and lethal logic, Vorpal/Obscuring/Corrosive/Magic Grenade use and apply, move/teleport preserve `nextAttackAsCaster`, face-down HP in card HTML, item pick list search), `index.html` (item pick list search input), `style.css` (picker search input and taller list), `DEV_LOG.md`.

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
