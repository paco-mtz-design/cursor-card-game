# Tacticlash — Development log

Granular trace of work for planning and debugging. Newest entries at the top.

---

## How we use this log

- Entries document **milestones that shipped** (or were agreed as the reference implementation for a phase), not every experiment or WIP tweak.
- Prefer logging **what moved the game forward** toward roadmap goals—especially changes that **nail requirements** you’re happy to keep.
- **Handoff:** read the newest section first; compare intent with [ROADMAP.md](ROADMAP.md).
- Phases **8–9** are summarized in ROADMAP and code history; this log’s detailed sections start at **Phase 10** for granularity.
- **Rules clarifications** for players (what stops counters, veteran interactions, edge cases) are maintained in **[RULES.md](RULES.md)** and updated when implementation behavior is agreed.

---

## Phase 15 — Veteran buffs (partial) + placement QA tools

**Status:** In progress (Lancer suite + on-hit subset + infrastructure shipped; other veterans pending per roadmap).

**Scope:** Per-character `veteranBuff` keys in [`data.js`](data.js); combat hooks for Braskin, Rowka, Nyss, Keera plus on-hit veterans (Torra, Haskel, Lyra, Rokklo, Solomon, Chronir, Grolk); cell `veteranState` placeholder; setup **filter hand** and **replace selected with pick** (full `CHARACTERS` roster via swaps with unit deck / other hand).

### Data and helpers

- **`veteranBuff`:** String id on each Veteran row (e.g. `braskin`, `rowka`, `nyss`, `keera`). Helpers: `getVeteranBuff(cell)`, `hasVeteranBuff(cell, key)` in [`game.js`](game.js).
- **`veteranState`:** `{}` on new board cells; copied on move/teleport swap (for future per-unit veteran cooldowns/flags).

### Lancer counter resolution (`resolveCombat`)

**Order (early → late):**

1. **True strike** (`trueStrike` in code): Vorpal Honing Amulet, True-Strike Lens (Shooter/Caster), Sharpshooter’s Scope (Shooter). Skips **entire** Lancer counter block (and attacker Unstable Ground, defender terrain per existing true-strike rules). Veteran “guaranteed counter” effects do **not** apply because no counter step runs — matches QA expectation.
2. **Braskin (Uncanny Block):** If the **attacker** is **adjacent** (same row, `|Δcol| === 1`) to an allied Braskin (Veteran), **no** enemy Lancer counter is attempted for that attack. Checked **before** any defending Lancer is selected. This **short-circuits** Rowka’s Twin Guard and Nyss’s Phantom Posture for that attack: no counter candidate, so no guaranteed counter. Intentional: Braskin is a hard “no counter” gate for qualifying attacks.
3. **Otherwise:** Build all defending Lancers in counter range (respecting Vanguard Lance distance 1–2 vs 1), excluding Lancers with `cannotAttackNextTurn` (e.g. Tangle-Vine Bola).
4. **Candidate selection:** If any candidate has a **guaranteed** counter (Rowka + adjacent ally Lancer, or Nyss face-down), that Lancer is chosen first; else **lowest column index** (left-to-right scan behavior).
5. **Unstable Ground (Lancer’s tile):** Coin **before** the counter success coin. On **tails**, the counter attempt is canceled entirely — Rowka/Nyss “force heads” does **not** apply, because the attempt never reaches the counter flip. On **heads**, proceed to counter resolution.
6. **Counter coin:** Rowka (Twin Guard) and Nyss (face-down) force **heads** on this flip (log lines distinguish). Nyss flips face-up when revealed for counter; if already face-up, Phantom Posture does not apply.
7. **Keera (Double Sword):** After a **successful** counter (`attackBlocked`), if the countering Lancer is Keera (Veteran), apply **+1 damage** to one additional enemy in Keera’s Lancer counter range from Keera’s column (excluding the original attacker). **Auto-target:** nearest column to Keera by distance, tie-break lower column index (no UI pick in this chunk).

### On-hit veteran resolution (`resolveCombat`)

These run only when the attack **actually hits** the defender (not canceled by true-strike gating, counter block, Wardstone negation, or defender terrain fail):

- **Torra (Shattering Hammer):** Before damage, flip coin; on heads destroy target gear (if any), sending it to item discard.
- **Rokklo (Returning Hit):** Before damage, flip coin; on heads gain **+1** attack damage.
- **Haskel (Pirate Claw):** After hit, steal 1 random card from defender’s item hand.
- **Lyra (Blast Echo):** After hit, flip coin; on heads deal 1 damage to enemy in the tile between attacker and target (if occupied).
- **Solomon (Lunar Dazzle):** After hit, paralyze and reveal (if needed) the enemy directly in front of Solomon’s column.
- **Chronir (Frozen Chain):** After hit, paralyze and reveal (if needed) one enemy adjacent to the target column. **Auto-target:** lower adjacent column first.
- **Grolk (Bloodthirst):** If the hit captured the target, flip coin; on heads heal attacker by 1 damage (if not already full HP).

### QA follow-up (on-hit chunk adjustments)

- **Rokklo log fix:** Longshot log now prints only when attack is actually edge-to-edge; Rokklo +1 no longer produces a false Longshot message on non-edge tiles.
- **Lyra target refinement:** "Between" tile now resolves from the target side toward the attacker (more natural line-of-fire behavior). Log text clarified for cases with no enemy in that tile.
- **Chronir selection UX:** When two adjacent enemies are valid, combat pauses and player selects which adjacent target to paralyze using standard board slot highlighting + turn helper text. If only one adjacent enemy exists, it resolves automatically.

### R1 interrupt flow implementation (ready for QA)

- **Jorren (Berserker):** Tracks consecutive turns where Jorren attacks via `veteranState`; adds +1 damage on consecutive-turn attacks (non-stacking).
- **Tival (Quick Reload):** When an attack fails to land from Unstable Ground cancel, Lancer counter block, defender terrain block, or Wardstone negation, Tival can immediately retry the same target.
- **Harlund (Pack Shield):** On incoming hit to an adjacent ally, player can confirm swap so Harlund takes the hit instead (wired for regular combat + Archmage per-target flow).
- **Vaela (Instinctive Strike):** On enemy move/swap into Vaela’s front column, coin flip; heads deals 1 damage to mover and ends that turn.
- **Cassa (Twin Arc):** If attacking a face-up target while at least two face-up enemies are in range, player can enable Twin Arc to perform a second attack this turn; Twin Arc is then blocked on the unit’s next turn.

### R1 QA fixes

- **Harlund + Archmage:** Pack Shield can trigger at most once per attack sequence (including Archmage multi-target chains).
- **Harlund protect-sequence rule:** When Pack Shield is used, the originally protected ally is immune to any remaining hit packets/effects from the same attack sequence.
- **Vaela reinforcement timing:** When Vaela captures a mover, the active player's captured-unit reinforcement now runs before turn pass, avoiding delayed replacement.
- **Vaela + Obscuring bomb:** Vaela does not trigger during Obscuring bomb reorder swaps.
- **Cassa second target:** When multiple valid Twin Arc follow-up targets exist, player now picks the second target via board-highlight selection instead of deterministic auto-pick.
- **Prompt UX:** Tival retry and Cassa Twin Arc prompts now use the header action-strip buttons (Wardstone-style), not browser-native confirm dialogs.

### R2 caster defender-passives implementation (ready for QA)

- **Scope completed:** Senya (Hex Haze), Iktha (Magma Skin), Mivara (False Self) in `resolveCombat`, Harlund single-hit resolution, and `continueArchmageMulti` packet loop.
- **Shared defender-passive resolver:** Added `resolveDefenderVeteranPacket(...)` so defender-passive behavior is consistent across normal single hits and Archmage packet hits.
- **Vorpal gating (confirmed rule):** Only `Vorpal Honing Amulet` bypasses these defender passives; True-Strike Lens and Sharpshooter's Scope do not.
- **Iktha:** Destroys attacker gear before damage; logs both "gear destroyed" and "no gear to destroy" branches.
- **Senya:** Coin flip on incoming hit; heads negates packet and reflects 1 damage to attacker. Added per-unit cooldown state (`senyaBlockNextTurn` / `senyaBlockedThisTurn`) refreshed at turn start via `refreshSenyaCooldownForTurn`.
- **Mivara:** Coin flip on incoming hit; heads redirects packet to front enemy (same column, opposite row). If no front enemy exists, packet is fully voided (no damage to Mivara, no redirected damage).
- **Tival compatibility:** Senya/Mivara deflections count as "attack didn't land on intended target," so Quick Reload retry remains available under existing survivability checks.
- **Archmage packet behavior:** Each packet now independently runs defender-passive checks with explicit logs; packet can be negated/redirected/voided without breaking the sequence.

### R2 QA progress snapshot (partial; pending completion)

- **Current status:** QA intentionally paused to continue feature implementation; keep R2 QA open.
- **Verified so far:** Senya core behavior/cooldown/Tival retry, Iktha geared+ungeared branches, Mivara heads/tails behavior + Tival retry, plus true-strike split **A1** (Vorpal ignore) and **A2** (True-Strike Lens does not ignore).
- **Still pending:** Remaining R2 matrix, especially Wardstone ordering, Archmage multi-packet defender-passive interactions, A3 (`Sharpshooter's Scope` does not ignore), and quick counter/terrain ordering regression checks.
- **Tracking doc:** [`QA_PHASE15_R2_LOG_TEMPLATE.md`](QA_PHASE15_R2_LOG_TEMPLATE.md).

### R3 Ardan (Veilstep) implementation (ready for QA)

- **Scope completed:** Added Ardan's Veilstep trigger + UX flow as the deferred final caster-veteran implementation in Phase 15.
- **Trigger gating:** Veilstep prompts only when Veteran Ardan lands at least one hit packet and has at least one face-down ally.
- **Archmage behavior:** With Archmage's Tome, Veilstep now triggers at most once per full sequence (not per packet), and only if at least one packet landed.
- **Reorder UX:** Reuses Obscuring-style swap UI, but scoped to Ardan + face-down allies via allowed-column gating; Done resumes combat/turn flow.
- **Prompt flow:** Uses existing in-header action-strip buttons (`Use Veilstep` / `No`) consistent with Wardstone/veteran prompts.
- **Flow safety:** Existing combat ordering remains intact; Ardan logic is appended after hit resolution and before turn finalization.
- **Cross-path continuity:** Archmage packet continuation paths (including Wardstone No branch) now track landed-hit state for Veilstep eligibility.
- **R2 QA status unchanged:** R2 remains partially validated and still tracked separately in [`QA_PHASE15_R2_LOG_TEMPLATE.md`](QA_PHASE15_R2_LOG_TEMPLATE.md).

### R3 QA follow-up fix

- **Ardan fog-of-war step corrected:** On Veilstep use, Ardan now flips face-down before entering the reorder/shuffle step.
- **Rules alignment:** Updated player-facing rules text to clarify "flip face-down, then swap/shuffle with face-down allies."

### QA / setup tooling

- **Filter hand:** Search narrows visible placement cards; indices remain real hand indices.
- **Replace selected with pick:** Picks any unit from full `CHARACTERS`; swaps references with unit deck or other hand; refuses if target is already on the board. Log lines prefixed `Debug: Placement —`.

**Files touched:** `data.js`, `game.js`, `index.html`, `style.css`, `RULES.md`, `DEV_LOG.md`, `README.md`.
**Chunk update files:** `game.js`, `DEV_LOG.md`.

---

## Phase 14 — Board & unit UI

**Status:** Concluded.

**Scope:** Board presentation for units with gear and terrain: fixed slot, layered mini-cards, full-size unit art, readable status markers, hand-placed feel.

**Implementations:**
- **`createUnitCardHTML` ([`game.js`](game.js)):** DOM order terrain → gear → unit (no `unit-tile__footer` wrapper). Gear/terrain from `cardState.gear` and terrain row in `renderBoard`; `state.terrain[player][col]` passed into terrain slot.
- **Absolute stack ([`style.css`](style.css)):** `.slot` is `position: relative`, 179×250, `overflow: visible`. `.unit-tile` fills the slot (height 250px). Mini-cards: `position: absolute`, `left: 50%`, `transform: translateX(-50%)` combined with subtle **rotate**; per-column **`.slot:nth-child(n)`** angle variation. Terrain `top: -60px` (z-index 1), gear `top: -30px` (z-index 2), unit `.unit-card` `top: 0; left: 0` (z-index 3), **179×250** unit. **Markers** `z-index: 10`.
- **Overflow:** `overflow: visible` on board `.unit-card`; **`overflow: hidden`** only on `.unit-card__img-wrap` (and mini-card art) for rounded corners.
- **Spacing:** `.row` `margin-top` so peeking layers don’t collide with the row above; `.board` gap/padding tuned.
- **Placement hand:** `.hand-card .unit-tile` overrides keep setup preview layout (flex) separate from board slot rules.
- **Code hygiene:** Removed temporary debug `fetch` instrumentation from `renderBoard` / `createUnitCardHTML`.

**Files touched:** `game.js`, `style.css`, `ROADMAP.md`, `DEV_LOG.md`, `README.md`.

---

## Phase 13 — Promotions

**Scope:** Four promotion items (Champion's Crest, Vanguard Lance, Sharpshooter's Scope, Archmage's Tome). Equipped like other gear (one gear per unit; equipping replaces current gear). Each is class-specific, grants +1 HP, and modifies range or combat behavior.

**Implementations:**
- **Data:** In `ITEM_SPECS`, each promotion has `type: 'promotion'`, `allowedClasses: [class]`, and `hpBonus: 1`. `getArmorHPBonus` and `getGearAllowedClasses` extended to support `type === 'promotion'`. Promotions added to `GEAR_EQUIP_ITEM_NAMES` (via `PROMOTION_ITEM_NAMES`). **Use button:** `buildItemCard` and `handleItemHandClick` include `spec.type === 'promotion'` so promotion cards show "Use" and enter targeting when `canPlayGear` is true.
- **Champion's Crest (Brawler):** +1 HP. Attack range: same column and both adjacent (distance ≤ 1). Implemented via `isInRangeWithCell`: when Brawler has Crest, `d <= 1`.
- **Vanguard Lance (Lancer):** +1 HP. Attack range: diagonal/sideways only — distance **1 or 2** (not 0). "Applies to counters, too": defender Lancer with Vanguard Lance can counter when attacker is at distance 1 or 2; normal Lancer counter range remains distance === 1. Lancer counter block loops all defender columns and uses `inCounterRange`: Vanguard ⇒ `dist >= 1 && dist <= 2`, else `dist === 1`.
- **Sharpshooter's Scope (Shooter):** +1 HP. All attacks become true strikes: skip attacker Unstable Ground, Lancer counter block, defender Elevated/Reinforced terrain. Added to `trueStrike` in `resolveCombat`. Wardstone not bypassed. Barbed Gauntlets only on Brawler/Lancer hits.
- **Archmage's Tome (Caster):** +1 HP. Attacks affect primary target and both adjacent enemy units (1 damage + paralyze each). **Per-target defenses:** Each of the three columns is resolved in sequence via `state.archmageMultiResolving` and `continueArchmageMulti()`. For each target: Reinforced Barricade (Caster) is checked per tile (coin flip; heads = that unit not hit). If the unit has Wardstone Bracelet, defender gets Use/No; Use negates that unit's hit only. `doWardstoneUse` / `doWardstoneNo` detect archmage multi and advance to the next target or call `finishArchmageMulti()`. **Rest:** Attacker gets `mustRestNextTurn = true` (separate from `cannotAttackNextTurn` so Tangle-Vine Bola is unchanged). `mustRestNextTurn` is cleared at **start** of that player's next turn (`startOfTurn`); unit is non-selectable and shows "Can't attack" until then. Magic Grenade (nextAttackAsCaster) stays single-target Caster; no Tome multi-target or rest.
- **Range:** `isInRangeWithCell(attackerCol, defenderCol, attCell)` used in `canAttack`, attack-step highlighting, and attack target click; respects promotions and Magic Grenade.

**Bug fixes (same phase):**
- Promotion cards did not show "Use" button; added `spec.type === 'promotion'` to gear Use-button condition in `buildItemCard` and to `gearPlayable` in `handleItemHandClick`.
- Vanguard Lance allowed attack/counter on the tile directly in front (distance 0); range restricted to `d >= 1 && d <= 2` for attack and counter.
- Archmage's Tome rest was cleared at end of turn so the Caster could attack again next turn; introduced `mustRestNextTurn` (cleared at start of turn) and use it for Archmage rest; "Can't attack" badge and selectability check both flags.
- Archmage's Tome multi-target did not trigger Wardstone or Reinforced Barricade for adjacent targets; implemented per-target resolution with Wardstone prompt and per-tile Reinforced Barricade check.

**Files touched:** `data.js` (promotion `allowedClasses`, `hpBonus`), `game.js` (gear helpers, `PROMOTION_ITEM_NAMES`, `isInRangeWithCell`, Vanguard range, Lancer counter range, trueStrike Scope, Archmage multi-target, `continueArchmageMulti` / `finishArchmageMulti`, `mustRestNextTurn`, Wardstone handlers, Use button for promotion), `ROADMAP.md`, `DEV_LOG.md`.

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
