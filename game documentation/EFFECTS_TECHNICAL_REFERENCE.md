# Tacticlash — Effects Technical Reference

**Purpose:** Working reference for the Content Design team. Describes every game effect at full technical precision — no character limits, no abstraction. Use this to evaluate whether card copy accurately communicates what the prototype does.

**Not a player-facing document.** See `RULES.md` for official rulings and `Tacticlash Gameplay Manual 2.1.md` for the player rulebook.

**Last updated:** 2026-04-20 (aligns with Phase 18 implementation, branch `cpu-opponent`)

---

## Base Class Mechanics (not on cards, but essential context)

Before reading effect entries, note these class-level mechanics that are always active:

| Class | Base Attack Range | Base Damage | Special Mechanic |
|-------|------------------|-------------|-----------------|
| **Brawler** | 1 tile forward only | 1 HP | — |
| **Lancer** | 1 tile forward or diagonal (left/right forward) | 1 HP | May **counter** incoming attacks (coin flip; heads = attacker takes 1 damage, attack fails) |
| **Shooter** | Any column, straight across | 1 HP | **Longshot** (columns 0↔4, opposite edges): 2 HP damage instead of 1 |
| **Caster** | Any column, straight across | 1 HP | **Magic Paralysis**: if the target survives the hit, it is paralyzed until the start of its player's next turn |

Paralysis means: the unit cannot be selected to act (no move, no attack, no counter), but it can still be passively moved by swap effects, and its "If Hit" veteran buffs still fire.

---

## Section 1 — Veteran Buffs

Veteran buffs are permanent passive abilities tied to a specific character. They are suppressed entirely by the **Fractured Hulk** bestiary debuff. Buffs that fire "when hit" (Harlund, Vaela, Senya, Iktha, Mivara) always fire regardless of the unit's restriction status.

Each entry shows: the veteran's name, class, faction, and buff name — followed by the technical breakdown.

---

### BRAWLERS

---

#### Pack Shield — Harlund Ironhowl
**Faction:** Howlsworn Creed | **Class:** Brawler

**Technical Description:**
When an adjacent ally is the declared target of an incoming attack, Harlund's player is offered the option to activate Pack Shield. If activated, Harlund physically swaps positions with the target ally before damage is resolved: Harlund occupies the target's slot (facing the attacker) and the protected ally moves to Harlund's previous slot. Harlund then takes the full hit in place of the protected ally. The protected ally is unaffected by that hit.

"Adjacent" means exactly one column left or right, same player row, at the moment the attack is declared.

**Known Interactions:**
- **vs. Sharpshooter's Scope (attacker):** Pack Shield does NOT fire. Scope bypasses Harlund entirely.
- **vs. Vorpal Honing Amulet (attacker):** Pack Shield does NOT fire. Vorpal bypasses Harlund entirely.
- **vs. True-Strike Lens (attacker):** Pack Shield DOES fire normally. Lens does not bypass veteran effects.
- **vs. Archmage's Tome multi-target:** Pack Shield can trigger at most once per full Archmage attack sequence. After Harlund intercepts one hit, the protected ally is immune to all remaining damage packets in that sequence. Later packets that would land on the protected slot are skipped.
- **vs. Wardstone Bracelet (defender):** Wardstone is checked before Pack Shield is offered. If Wardstone is used, the entire attack is negated and Pack Shield is never triggered.

**Hierarchy Position:** Offered after Wardstone has been resolved (if not used), after counter/terrain steps, just before damage is applied to the original target.

**Rules Clarifications:**
- Pack Shield fires even if Harlund is paralyzed or otherwise restricted — it is a passive defensive response, not an action.
- Harlund swaps positions; both units are now in different columns after the swap. Harlund is flipped face-up as part of the swap (if face-down).
- The option to use Pack Shield is always presented to the player when eligible; the player may decline.

---

#### Berserker — Jorren Brighthowl
**Faction:** Howlsworn Creed | **Class:** Brawler

**Technical Description:**
If Jorren attacked on his most recent own turn AND attacks again on the current own turn, his attack deals +1 bonus damage (total 2 HP instead of 1 HP).

The state is tracked per-unit via a flag: `jorrenAttackedLastOwnTurn` is set at end-of-turn cleanup, reflecting whether Jorren attacked that turn. If the flag is set when Jorren attacks again, the bonus applies. The flag resets each turn.

**Known Interactions:**
- **vs. Primal Alpha (Bestiary):** Both bonuses stack. Two consecutive attacks with Primal Alpha active = 1 + 1 (Berserker) + 1 (Primal Alpha) = 3 damage.
- **vs. Rokklo's Returning Hit:** Both apply to the same attack. Could result in 3+ total damage on a consecutive turn.
- **vs. Archmage's Tome multi-target:** Archmage cannot be on Jorren (Jorren is a Brawler; Archmage is Caster only). No interaction.

**Hierarchy Position:** Damage bonus is summed before the hit is applied to the target.

**Rules Clarifications:**
- "Attacked on his most recent own turn" means the last time it was Jorren's player's turn, Jorren was the unit that attacked. If Jorren was selected but couldn't attack (terrain canceled it, counter succeeded), the flag state depends on whether the attack was attempted — currently only set if `markJorrenAttackThisTurn` is called, which happens at the start of `resolveCombat`, meaning it only marks if combat actually initiated.
- If Jorren is captured and a new unit is placed in his slot, the flag does not transfer.

---

#### Shattering Hammer — Torra Anvilcrest
**Faction:** Skyward Kin | **Class:** Brawler

**Technical Description:**
When Torra's attack reaches the hit phase (damage is about to be applied), flip a coin. On heads, one piece of gear currently equipped to the defending unit is randomly selected and discarded before damage is calculated. On tails, nothing happens and damage proceeds normally.

"Before damage is calculated" means the gear's HP contribution (if any) is already lost when the hit lands, but the damage amount itself is not affected by whether gear was destroyed.

**Known Interactions:**
- **vs. Wardstone Bracelet (defender):** Wardstone intercepts the entire attack before it reaches the hit phase. Shattering Hammer never fires.
- **vs. Iktha Magma Skin (defender):** Torra's gear break fires first (it's on the attacker side). Iktha's Magma Skin fires next (defender side), destroying the attacker's gear. Both can fire on the same attack.
- **vs. Corrosive Phial:** Both destroy gear but are independent effects. Shattering Hammer applies randomly to defender's gear; Corrosive Phial is a targeted item use on any face-up unit's gear.

**Hierarchy Position:** Fires at the start of the hit phase, before defender veteran effects (Senya, Iktha, Mivara) are evaluated.

**Rules Clarifications:**
- If the defender has no gear, the coin flip still happens, but the heads result produces no effect (logged as "target has no gear").
- "One piece of gear" = one card from the unit's equipped slot (gear or bonus gear slot, whichever is selected by `removeGearFromCell`).
- Torra's gear break is an attacker-side effect; it is NOT bypassed by Sharpshooter's Scope or Vorpal (those bypass defender veteran effects, not attacker effects). Torra's Shattering Hammer fires on any successful hit Torra lands.

---

#### Instinctive Strike — Vaela Strayshield
**Faction:** Whisperfang Watch | **Class:** Brawler

**Technical Description:**
When any enemy unit moves or swaps into the column directly in front of Vaela (same column index, Vaela's opponent's row), Vaela gets an interrupt. Flip a coin: on heads, the moving unit takes 1 damage immediately and the opponent's turn ends. On tails, nothing happens and the move completes normally.

"Directly in front" = same column index as Vaela, but on the opponent's row (the row the moving unit belongs to).

**Known Interactions:**
- **vs. Obscuring Bomb reorder:** Vaela does NOT trigger. The Obscuring Bomb reorder is treated as a setup rearrangement, not a normal move or swap action.
- **vs. Teleport Boots:** If the unit using Teleport Boots teleports into Vaela's column, Vaela's trigger fires normally.
- **vs. Paralyzing Vines (on moving unit's destination tile):** If Paralyzing Vines cancels the move (tails), the unit never enters the column, so Vaela doesn't trigger. If Vines allows the move (heads) and the destination is Vaela's column, Vaela triggers after placement.
- **vs. Divine Light:** If a unit lands on Divine Light in Vaela's column, Divine Light reveals the unit after placement. Vaela's trigger fires on the move, before or independently of Divine Light's reveal.

**Hierarchy Position:** Fires as an interrupt during the opponent's move phase, before the move is finalized (checked after each step of the move for Vaela in the destination column).

**Rules Clarifications:**
- Vaela's trigger fires even if Vaela is paralyzed or restricted — it is a passive defensive response.
- If Vaela's Instinctive Strike captures the moving unit (heads + lethal damage), the active player immediately gets their replacement draw before the turn is passed to the next player.
- Vaela does NOT trigger when units on her own side of the board move — only when opponent units enter her column.

---

#### Pirate Claw — Haskel Moorwake
**Faction:** Whisperfang Watch | **Class:** Brawler

**Technical Description:**
When Haskel's attack successfully hits a target (damage is applied, regardless of capture), Haskel randomly steals one item card from the opponent's hand. The stolen card is moved to Haskel's player's hand.

"Randomly" = the code picks a uniformly random index from the opponent's current item hand array.

**Known Interactions:**
- **vs. Wardstone Bracelet (defender):** If Wardstone blocks the attack, the hit never lands. Pirate Claw does not fire.
- **vs. Senya Hex Haze (defender, heads):** If Senya negates the hit, Pirate Claw does not fire (the hit did not land).
- **vs. Mivara False Self (redirect):** Pirate Claw fires based on the attack landing, not the specific target. If the hit redirects via Mivara to a different unit, Pirate Claw still fires (the attack did land somewhere).
- **vs. hand limit:** The game has no explicit hand limit in the prototype — stealing always adds the card to the attacker's hand.

**Hierarchy Position:** Fires after damage is applied (during post-hit attacker effect resolution).

**Rules Clarifications:**
- If the opponent has no items in hand at the time of the hit, Haskel's Pirate Claw logs "no items to steal" and nothing is taken.
- Haskel only fires on HIS OWN attacks, not on counters or any passive damage (e.g., Barbed Gauntlets doesn't trigger Pirate Claw).

---

#### Bloodthirst — Grolk Hollowjaw
**Faction:** Scalebound Brood | **Class:** Brawler

**Technical Description:**
When Grolk's attack captures (defeats) an enemy unit — meaning the attack reduces the enemy's HP to zero or below — flip a coin. On heads, Grolk recovers 1 HP (his damage counter decreases by 1, minimum 0). On tails, nothing happens.

Only fires when the attack directly causes a capture. If Grolk deals non-lethal damage and someone else captures the enemy later, Grolk's Bloodthirst does not trigger.

**Known Interactions:**
- **vs. Vorpal (lethal strike):** Vorpal always captures; Bloodthirst fires normally after the capture.
- **vs. Iron Maiden (Bestiary, defender):** Iron Maiden resolves first (attacker may also be captured). If Grolk captures but is then also captured by Iron Maiden, Bloodthirst fires for the capture Grolk caused, but Grolk's heal only matters if Grolk survived.

**Hierarchy Position:** Fires after the capture is confirmed and logged, during post-hit attacker effect resolution.

**Rules Clarifications:**
- Grolk must survive the attack for the healing to matter (if he's at full HP, healing has no effect beyond being logged).
- Healing 1 HP means reducing Grolk's damage counter by 1 (damage counter tracks HP lost, so -1 damage = +1 effective HP).

---

### LANCERS

---

#### Double Sword — Keera Stonesnout
**Faction:** Howlsworn Creed | **Class:** Lancer

**Technical Description:**
When Keera successfully counters an incoming attack (the counter success coin flip lands heads), she may deal 1 additional damage to one extra enemy unit within her counter range (any in-range enemy unit other than the original attacker). The prototype auto-selects the nearest eligible enemy to maximize efficiency.

Counter range = 1 column by default; expanded to 2 columns if Keera has a Vanguard Lance equipped.

**Known Interactions:**
- **vs. Vanguard Lance:** If Keera has Vanguard Lance, her extra hit can reach enemies up to 2 columns away.
- **vs. Rowka's guarantee:** Keera's extra hit only fires after a successful counter. With Rowka's guarantee, Keera will always counter (assuming no Scope/Vorpal), so Double Sword fires reliably.
- **vs. Scope/Vorpal (attacker):** If the attack is Scope or Vorpal, no counter is possible, so Keera never gets the counter success needed to trigger Double Sword.

**Hierarchy Position:** Fires after the counter success flip resolves to heads, as an additional post-counter effect.

**Rules Clarifications:**
- "Extra 1 damage" is a direct damage application on the secondary target — it is not a full attack (no counter, no terrain checks apply to this secondary hit).
- If no other eligible enemy exists within range, the extra damage does not fire.
- The secondary target must be an enemy unit (not the original attacker).

---

#### Twin Guard — Rowka Stonewing
**Faction:** Skyward Kin | **Class:** Lancer

**Technical Description:**
When Rowka OR any adjacent ally Lancer (1 column away, same row) attempts to counter an incoming attack, the counter success coin flip is replaced with a guaranteed success (treated as heads). The ally that benefits from the guarantee is revealed face-up if previously face-down.

"Adjacent" = exactly one column left or right of Rowka.

**Known Interactions:**
- **vs. Braskin Uncanny Block:** If Braskin blocks counters for the attacker's column, no Lancer gets to attempt a counter — Rowka's guarantee is irrelevant because the counter attempt never happens.
- **vs. Sharpshooter's Scope / Vorpal:** Both bypass all counters including Rowka's guaranteed ones. Rowka's guarantee does not fire.
- **vs. True-Strike Lens:** Lens bypasses only unguaranteed counters. Rowka's guarantee DOES still fire against a Lens attack.
- **vs. Unstable Ground (on countering Lancer's tile):** Unstable Ground is resolved first. If the Unstable Ground coin comes up tails (attempt canceled), Rowka's guarantee is never applied — the guarantee only applies to the SUCCESS flip, not the attempt flip.
- **vs. Restricted Lancers:** Twin Guard overrides restriction flags. A paralyzed, Tangle-Vine'd, or Berserker-exhausted Lancer can still counter if Rowka's guarantee covers them. This is the ONLY exception to the rule that restricted units cannot counter.

**Hierarchy Position:** Applied to the counter success flip, after Unstable Ground check (if any) has been passed.

**Rules Clarifications:**
- Rowka's guarantee covers himself AND adjacent Lancers. If Rowka is the countering Lancer, his own counter is guaranteed. If a different adjacent Lancer is countering, they also get the guarantee.
- The guarantee is "guaranteed heads" — it replaces the random flip entirely.
- Only Lancers benefit from the guarantee. Adjacent non-Lancer allies do not receive any benefit from Rowka's presence.

---

#### Phantom Posture — Nyss Shadowstep
**Faction:** Whisperfang Watch | **Class:** Lancer

**Technical Description:**
When Nyss attempts to counter an incoming attack while she is currently face-down, the counter success coin flip is replaced with a guaranteed success (treated as heads). Immediately after the guaranteed counter resolves, Nyss flips face-up.

If Nyss is already face-up when a counter opportunity arises, Phantom Posture provides no benefit — the counter flip is normal.

**Known Interactions:**
- **vs. Rowka Twin Guard:** Both can apply simultaneously. If Nyss is face-down AND adjacent to Rowka, both guarantees are redundant (already guaranteed). Nyss flips face-up after the counter regardless.
- **vs. Sharpshooter's Scope / Vorpal:** Both bypass all counters, including Nyss's guarantee.
- **vs. Unstable Ground (on Nyss's tile):** Unstable Ground is resolved first. If tails (attempt canceled), Nyss's guarantee never applies. Nyss stays face-down.
- **vs. Braskin:** If Braskin blocks counters, Nyss doesn't get to attempt a counter at all.

**Hierarchy Position:** Applied to the counter success flip, after Unstable Ground check (if any) has passed.

**Rules Clarifications:**
- Phantom Posture only applies when Nyss is face-down at the moment of the counter attempt. Being revealed mid-turn (e.g., by Lantern-Jar earlier in the same turn) means Nyss is face-up and Phantom Posture does not apply.
- After Nyss uses Phantom Posture and is revealed, she remains face-up for the rest of the game (until captured or repositioned by a swap effect).

---

#### Uncanny Block — Braskin Coilmail
**Faction:** Scalebound Brood | **Class:** Lancer

**Technical Description:**
If the attacking unit is positioned in a column that is directly adjacent to an allied Braskin (same player row, one column left or right of the attacker), enemy Lancers cannot attempt a counter against that attack. The counter step is skipped entirely.

"Adjacent to the ATTACKER" — Braskin's column is adjacent to the ATTACKER's column (same row as the attacker, not the defender).

**Known Interactions:**
- **vs. Rowka's guarantee / Nyss's guarantee:** Braskin completely suppresses the counter step. Even guaranteed counters (Rowka, Nyss) cannot fire when Braskin blocks. Braskin takes priority over all counter-guarantee mechanics.
- **vs. Sharpshooter's Scope / Vorpal:** Both also suppress counters independently. With all three present, counters are suppressed multiple times over — functionally identical to Braskin alone suppressing them.

**Hierarchy Position:** Checked before any defending Lancer is identified. If Braskin blocks, no counter step occurs.

**Rules Clarifications:**
- Braskin's adjacency is on the ATTACKER's row. If the attacker is at column 3 and Braskin is at column 4 on the same player's row, Braskin protects attacks from column 3.
- Braskin must be alive (present in the slot) and the buff must not be suppressed by Fractured Hulk.
- Braskin's effect does NOT require Braskin to take any action — it is a passive aura that applies automatically.

---

### SHOOTERS

---

#### Twin Arc — Cassa Thornpelt
**Faction:** Howlsworn Creed | **Class:** Shooter

**Technical Description:**
After Cassa lands a hit on a face-up target (first attack of the turn resolves), if there are 2 or more face-up enemy units in Cassa's range (the target plus at least one other), Cassa's player is offered a second attack on a different face-up enemy in range. The player chooses the second target from eligible highlighted slots.

If Twin Arc is used, a cooldown flag is set: Twin Arc cannot be offered again on Cassa's next own turn.

**Known Interactions:**
- **vs. Cassapublic cooldown:** After using Twin Arc, the prompt is suppressed for Cassa's next turn. The cooldown is only 1 turn — it is available again the turn after.
- **vs. Senya Hex Haze (first target, heads):** If Senya negates the first attack, it did not "land." Twin Arc is not offered (no successful first hit).
- **vs. Mivara False Self (redirect to enemy side):** If Mivara redirects the first attack to an enemy-side unit, it technically landed on SOME unit. Twin Arc opportunity is evaluated based on whether the first attack hit, not which unit it hit. Current prototype behavior: Twin Arc is set up based on the first declared target, so if the hit was redirected, the opportunity may still be offered.
- **vs. face-down second target:** The second target must be face-up. Face-down enemies in range are not valid second-attack targets for Twin Arc.

**Hierarchy Position:** Offered after the first attack fully resolves (including all post-hit effects).

**Rules Clarifications:**
- The second attack is a full attack — counters, terrain, Wardstone, veteran effects all apply normally.
- During the second attack, Twin Arc is NOT offered again (no recursive chaining).
- If there is only one face-up enemy in range after the first attack (e.g., the first target was the only face-up enemy), Twin Arc is not available even if there are face-down enemies.
- The cooldown is set when Twin Arc is accepted (chosen by the player), not when it is offered.

---

#### Blast Echo — Lyra Keenfang
**Faction:** Skyward Kin | **Class:** Shooter

**Technical Description:**
After Lyra's attack hits a target, flip a coin. On heads, the enemy unit in the column geometrically between Lyra and the target also takes 1 direct damage. On tails, nothing additional happens.

"Between" requires at least one column gap between Lyra and the target. The "between" column is the one column directly between them (only applicable when the target is exactly 2 columns away). If the target is 3+ columns away, there are multiple columns between them — the implementation picks the column one step from the target toward Lyra.

**Known Interactions:**
- **vs. adjacent target (1 column away):** There is no column between them. Blast Echo is checked but produces "no between tile" result. Coin flip still happens but has no effect.
- **vs. empty between-column:** If the column exists but no unit occupies it, the coin flip still happens but produces "no enemy unit" result.
- **vs. Torra Shattering Hammer (if secondary target has gear):** The Blast Echo hit is a direct damage application — no gear-break effect applies to the secondary hit (Torra only fires on Torra's primary attack, not on bonus hits).

**Hierarchy Position:** Fires after primary damage is applied and post-hit attacker effects begin (same phase as Haskel steal, Solomon paralysis, etc.).

**Rules Clarifications:**
- The bonus damage from Blast Echo on the secondary unit is NOT a full attack — it bypasses counters, terrain, and veteran defenses. It's a direct HP reduction.
- The secondary unit can be captured by Blast Echo's bonus damage.
- Iron Maiden (Bestiary) on the secondary target: if the secondary unit is captured by Blast Echo's bonus 1 damage, Iron Maiden fires for Lyra as the attacker.

---

#### Quick Reload — Tival Embercoat
**Faction:** Whisperfang Watch | **Class:** Shooter

**Technical Description:**
If Tival's attack fails to land on the originally declared target for any reason (counter succeeded, terrain blocked, Senya negated, Mivara redirected away from original target), Tival's player is offered a retry of the same attack on the same target. The retry runs through the full normal combat flow.

"Failed to land on original target" includes: counter success, terrain flip failure, Senya heads negation, Mivara heads redirection (even if damage landed elsewhere).

**Known Interactions:**
- **vs. Senya Hex Haze:** If Senya negates the hit, Tival's retry prompt is offered. The retry runs against the same original target — Senya can potentially trigger again on the retry.
- **vs. Mivara False Self:** If Mivara redirects the hit, Tival's retry is offered. The retry targets the original declared defender again.
- **vs. Counter success (normal):** Counter prevents the attack from landing — Tival retry is offered.
- **vs. Terrain block:** If terrain (Elevated Ground, Reinforced Barricade) flips and blocks the attack, Tival retry is offered.

**Hierarchy Position:** Offered after all other combat resolution steps confirm the attack did not land on the original target.

**Rules Clarifications:**
- Tival gets exactly one retry per original attack. If the retry also fails, no further retry is offered.
- The retry is treated as a fresh attack — all counters, terrain checks, and veteran effects apply again.
- Tival's Quick Reload does NOT fire if the attack was blocked by Wardstone (Wardstone is an intercept that prevents the attack before it "happens," so Quick Reload has nothing to retry).

---

#### Returning Hit — Rokklo Flickbranch
**Faction:** Scalebound Brood | **Class:** Shooter

**Technical Description:**
After Rokklo's attack hits a target (damage is applied), flip a coin. On heads, the target takes 1 additional damage immediately. On tails, nothing additional happens.

**Known Interactions:**
- **vs. Primal Alpha (Bestiary):** Both bonuses apply to the same attack. Primal Alpha adds +1 to the base damage; Rokklo's Returning Hit adds +1 conditional bonus. With both active on a heads flip, total damage = 1 (base) + 1 (Primal) + 1 (Rokklo) = 3.
- **vs. Jorren Berserker (consecutive turns):** Different units — no overlap.

**Hierarchy Position:** Post-hit, after primary damage is applied.

**Rules Clarifications:**
- The extra 1 damage from Returning Hit can push the target to capture (zero HP).
- Iron Maiden fires if the extra damage causes a capture.

---

### CASTERS

---

#### Lunar Dazzle — Solomon the Bound
**Faction:** Howlsworn Creed | **Class:** Caster

**Technical Description:**
After Solomon's attack hits any target (regardless of which column), the enemy unit occupying the column directly in front of Solomon (same column index as Solomon, opponent's row) is revealed face-up (if not already) and paralyzed.

"Directly in front" = the enemy slot in the same column as Solomon on the opponent's board row.

Note: All Casters already paralyze the unit they attack (Magic Paralysis, base mechanic). Solomon's Lunar Dazzle is a SECOND paralysis effect targeting a DIFFERENT unit — the one in Solomon's column regardless of who he attacked.

**Known Interactions:**
- **vs. Sharpshooter's Scope / Vorpal (attacker):** If Solomon is the attacker, Scope/Vorpal do not bypass his own veteran effects. Solomon's Lunar Dazzle fires because it's HIS OWN attacker-side effect, not a defender veteran effect.
- **vs. empty front slot:** If no enemy occupies Solomon's column, Lunar Dazzle is logged as "no enemy directly in front" and nothing happens.
- **vs. already-paralyzed front unit:** Lunar Dazzle still fires and re-applies paralysis (logging it). No stacking effect — paralysis is a boolean state.

**Hierarchy Position:** Post-hit attacker effect phase, after primary damage/Magic Paralysis are applied.

**Rules Clarifications:**
- Solomon's paralysis (Lunar Dazzle) targets his column, NOT the attack target's column. These are often different unless Solomon attacked the unit directly in front of him.
- The front unit is revealed even if it was face-down — revealing is part of the effect.
- The paralyzed unit cannot act on its next turn (cannot select to move, attack, or counter), but it can still be passively swapped.

---

#### Veilstep — Ardan Quillsong
**Faction:** Skyward Kin | **Class:** Caster

**Technical Description:**
After Ardan's attack lands at least one damage packet on any unit (hit confirmed), Ardan's player is offered the option to use Veilstep. If activated:
1. Ardan flips face-down.
2. A reorder mode activates scoped to Ardan's column plus any of Ardan's player's face-down ally columns.
3. The player can rearrange those units in any order.
4. After the player confirms the reorder (clicks Done), normal turn flow resumes.

"Eligible columns" = Ardan's column (now face-down) + all other columns on the same row that are occupied by face-down ally units.

**Known Interactions:**
- **vs. Archmage's Tome multi-target:** If Ardan somehow had Archmage's Tome (not possible — Archmage is Caster-only and Ardan is already Caster, so this is valid), Veilstep is offered at most once per full Archmage sequence, after all hit packets resolve. Not once per packet.
- **vs. Divine Light on Ardan's column:** If Ardan's column has Divine Light terrain, re-placing Ardan into that tile (as part of reorder) would re-trigger Divine Light and flip Ardan face-up again.
- **vs. Fractured Hulk (Bestiary):** If Ardan's faction has Fractured Hulk, his veteran buff is blocked — Veilstep is not offered.

**Hierarchy Position:** Offered after all damage packets from Ardan's attack resolve and post-hit effects complete.

**Rules Clarifications:**
- Veilstep is not offered if Ardan has no face-down allies (only one eligible column — himself). Reordering just Ardan is meaningless; the prompt is suppressed.
- "Use" enters the reorder mode and resumes after Done. "No" skips reorder entirely.
- The reorder is only between Ardan and face-down allies — face-up allies and enemy units are unaffected and their columns are locked during the reorder.
- Veilstep does NOT trigger if the attack was fully negated (Senya, Wardstone, Mivara with no front enemy) since no hit landed.

---

#### Frozen Chain — Chronir Stillmarch
**Faction:** Skyward Kin | **Class:** Caster

**Technical Description:**
After Chronir's attack hits a target (damage applied), one enemy unit adjacent to the target (one column left or right) is revealed face-up (if not already) and paralyzed. If both adjacent columns have enemies, the defending player chooses which to paralyze. If only one adjacent column has an enemy, it is paralyzed automatically with no choice.

Note: All Casters paralyze the directly-hit unit (Magic Paralysis). Chronir's Frozen Chain adds a SECOND paralysis on an ADJACENT unit.

**Known Interactions:**
- **vs. target at column 0 or 4 (edge):** Only one adjacent column exists; that unit is paralyzed automatically.
- **vs. empty adjacent columns:** If neither adjacent column has an enemy, Frozen Chain is logged as "no adjacent enemy" and nothing happens.
- **vs. Sharpshooter's Scope / Vorpal (when Chronir is the attacker):** Chronir's Frozen Chain is an attacker-side effect. Scope/Vorpal do not bypass it.

**Hierarchy Position:** Post-hit attacker effect phase, same tier as Solomon's Lunar Dazzle.

**Rules Clarifications:**
- "Adjacent to the target" = one column left or right of the TARGET'S column. Not adjacent to Chronir.
- If the defending player must choose, the game presents a prompt highlighting valid target columns. The game is paused until a choice is made.
- The adjacent unit being revealed is part of the paralysis effect — it is forced face-up as a side effect of Frozen Chain.

---

#### Hex Haze — Senya Longtail
**Faction:** Whisperfang Watch | **Class:** Caster

**Technical Description:**
When Senya is the target of an incoming attack (hit phase reached), flip a coin. On heads, the entire incoming damage packet is negated: Senya takes no damage and is subject to no effects from that hit. The attacker immediately takes 1 direct damage. On tails, the hit proceeds normally.

After a successful heads negation, Hex Haze enters a cooldown state. On Senya's player's NEXT turn (when refreshSenyaCooldownForTurn runs), the cooldown flag transitions from "blocked next turn" to "blocked this turn." This means Hex Haze cannot re-trigger during the opponent's following attack until Senya's player has their next turn.

**Known Interactions:**
- **vs. Sharpshooter's Scope (attacker):** Hex Haze does NOT fire. Scope bypasses it.
- **vs. Vorpal Honing Amulet (attacker):** Hex Haze does NOT fire. Vorpal bypasses it.
- **vs. True-Strike Lens (attacker):** Hex Haze DOES fire normally. Lens does not bypass veteran effects.
- **vs. Wardstone Bracelet:** If Wardstone blocks the attack, Senya is never hit. Hex Haze is never triggered.
- **vs. Tival Quick Reload:** If Senya's heads negation causes Tival's attack to "not land on original target," Tival's retry prompt is offered. The retry can trigger Hex Haze again (if cooldown hasn't kicked in yet, which it won't within the same opponent turn).

**Hierarchy Position:** In the defender veteran packet resolution, after Iktha Magma Skin, before Mivara False Self.

**Rules Clarifications:**
- Hex Haze fires even if Senya is paralyzed or otherwise restricted — it is a passive defensive trigger.
- "Cooldown" means one Senya-player turn must pass before Hex Haze can trigger again. In a 2-player alternating game, this means Hex Haze can potentially trigger every other time it's the opponent's turn to attack Senya (one opponent attack, cooldown, Senya's turn, cooldown clears, opponent attacks again).
- The 1 damage reflected to the attacker is a direct HP reduction — no counter, terrain, or veteran effects apply to this reflected damage.

---

#### Magma Skin — Iktha Embercoil
**Faction:** Scalebound Brood | **Class:** Caster

**Technical Description:**
When Iktha is the target of an incoming attack (hit phase reached), the attacker's gear (one piece) is removed and discarded before damage is calculated. The attack then proceeds normally — Iktha still takes the full hit.

"Attacker's gear" = one gear card from the attacker's equipped slot (primary gear or bonus gear). If the attacker has no gear, the effect is logged but skipped.

**Known Interactions:**
- **vs. Sharpshooter's Scope (attacker):** Magma Skin does NOT fire. Scope bypasses it.
- **vs. Vorpal Honing Amulet (attacker):** Magma Skin does NOT fire. Vorpal bypasses it.
- **vs. True-Strike Lens (attacker):** Magma Skin DOES fire normally. Lens does not bypass veteran effects.
- **vs. Wardstone Bracelet:** If Wardstone blocks the attack, Iktha is never hit. Magma Skin is never triggered.
- **vs. Torra Shattering Hammer (if Torra attacks Iktha):** Torra's gear break fires first (on defender's gear — Iktha's gear), then Magma Skin fires second (on attacker Torra's gear). Both can fire in the same hit, destroying gear from both sides.
- **vs. attacker with Promotion gear (e.g., Champion's Crest):** Magma Skin destroys whatever gear the attacker has, including Promotions. Promotions provide HP bonuses — gear destruction may reduce the unit's maximum HP and could cause immediate capture if current damage exceeds the new lower max HP.

**Hierarchy Position:** In the defender veteran packet resolution. Fires first among the three defender Caster passives (before Senya, before Mivara).

**Rules Clarifications:**
- Iktha's Magma Skin fires even if Iktha is paralyzed or restricted.
- Gear destruction happens BEFORE damage — so the attacker loses any HP bonus from the gear before the damage from Iktha's opponent's turn applies.
- "One piece" is whatever `removeGearFromCell` returns: prefers the main gear slot, then the bonus slot.

---

#### False Self — Mivara Duskscale
**Faction:** Scalebound Brood | **Class:** Caster

**Technical Description:**
When Mivara is the target of an incoming attack (hit phase reached), flip a coin. On heads, the entire damage-and-effects packet is redirected to the enemy unit occupying the column directly in front of Mivara (same column index as Mivara, on the ATTACKER's row). On tails, the hit lands on Mivara normally.

"Directly in front of Mivara" = the attacker's row slot in the same column as Mivara. This is the enemy on the same column.

If heads but that enemy slot is empty, the packet is canceled — Mivara takes no damage and no other unit is hit.

**Known Interactions:**
- **vs. Sharpshooter's Scope (attacker):** False Self does NOT fire. Scope bypasses it.
- **vs. Vorpal Honing Amulet (attacker):** False Self does NOT fire. Vorpal bypasses it.
- **vs. True-Strike Lens (attacker):** False Self DOES fire normally. Lens does not bypass veteran effects.
- **vs. Wardstone Bracelet:** If Wardstone blocks the attack, Mivara is never hit. False Self is never triggered.
- **vs. Tival Quick Reload:** If False Self redirects the hit away from the original target, Tival's retry is offered (the attack didn't land on the original target).
- **vs. Iron Maiden (Bestiary) on redirected unit:** If the redirected enemy is captured, Iron Maiden fires for Mivara's attacker.

**Hierarchy Position:** In the defender veteran packet resolution. Fires last among the three defender Caster passives (after Iktha, after Senya).

**Rules Clarifications:**
- Mivara's False Self fires even if Mivara is restricted or paralyzed.
- When heads and redirect occurs: all effects of the attack (damage, Magic Paralysis from Caster class, etc.) land on the redirected enemy unit, not Mivara.
- "Directly in front of Mivara" is evaluated at the moment of redirection — if the slot is empty at that moment, the packet is voided.

---

## Section 2 — Items

Items are drawn from a shared 59-card shuffled deck (one draw per turn at the start of use-items phase). Players may use any number of items during their use-items phase before selecting a unit to act.

**Item types:**
- **Gear (Armor, Accessory, Promotion):** Equipped permanently to a unit. Stays until destroyed. Units can hold 1 gear slot by default (2 with Iron-Clad Shield Bestiary buff); Promotions also use the gear slot.
- **Single-Use:** Played for immediate effect, then discarded.
- **Terrain:** Placed on any empty tile (either row). Stays until destroyed by Tectonic Spike or overwritten by a new terrain placement.

---

### GEAR — ARMOR

---

#### Light Armor
**Type:** Gear (Armor) | **Quantity:** 7 | **Equippable by:** Lancers, Shooters, Casters

**Technical Description:**
Adds +1 to the unit's maximum HP. The unit can take 1 more damage before being captured. This is a permanent bonus as long as the gear remains equipped.

**Known Interactions:**
- **vs. Iktha Magma Skin:** If the attacker has Light Armor and attacks Iktha, the armor is destroyed before the hit. The attacker's HP maximum reverts. If the attacker's current damage already exceeds the new lower max HP, the attacker is captured immediately.
- **vs. Torra Shattering Hammer:** If the defender has Light Armor and Torra's flip destroys it, the target's max HP decreases. Current damage is rechecked.
- **vs. High-Aerie (Bestiary):** If the unit's faction has High-Aerie active, the armor is stripped when the bestiary effect applies.
- **vs. Brawlers:** Cannot be equipped by Brawlers (will not show as valid target for equipping).

**Rules Clarifications:**
- HP bonus is additive with other sources (Premium Light Armor, Heavy Armor, Eternal Carapace, Promotion items). A unit could theoretically have +1 (Light Armor) + 1 (Eternal Carapace) = base+2 max HP.
- Maximum gear slots per unit: 1 normally, 2 with Iron-Clad Shield Bestiary.

---

#### Premium Light Armor
**Type:** Gear (Armor) | **Quantity:** 4 | **Equippable by:** Lancers, Shooters, Casters

**Technical Description:**
Adds +2 to the unit's maximum HP. Otherwise identical to Light Armor in all interactions.

---

#### Heavy Armor
**Type:** Gear (Armor) | **Quantity:** 5 | **Equippable by:** Brawlers only

**Technical Description:**
Adds +1 to the unit's maximum HP. Equippable only by Brawlers. Otherwise identical to Light Armor in behavior and interactions.

---

### GEAR — ACCESSORY

---

#### True-Strike Lens
**Type:** Gear (Accessory) | **Quantity:** 2 | **Equippable by:** Shooters, Casters

**Technical Description:**
While equipped, all attacks made by this unit bypass terrain coin flip checks (Elevated Ground, Reinforced Barricade, Unstable Ground on defender's tile) and skip unguaranteed Lancer counter attempts.

"Unguaranteed counters" = standard Lancer counter coin flip attempts. Rowka/Nyss-guaranteed counters are NOT bypassed by the Lens.

**Known Interactions (True Strike hierarchy):**
| Defense | Bypassed by Lens? |
|---------|------------------|
| Terrain coin flips | Yes |
| Unguaranteed Lancer counters | Yes |
| Rowka/Nyss-guaranteed counters | **No** — still fire |
| Harlund Pack Shield | **No** — still fires |
| Senya / Iktha / Mivara | **No** — still fire |
| Wardstone Bracelet | **No** — always intercepts first |

See the **True Strikes** reference table in `RULES.md` for the full comparison across Lens, Scope, and Vorpal.

**Rules Clarifications:**
- The Lens only benefits Shooter and Caster class attacks. If a Brawler or Lancer were to have this item (which requires bypassing the equip restriction — not possible in the prototype), the true-strike effect would not apply.
- The Lens effect applies to ALL attacks made by the equipped unit, not just some. It is not consumed on use.

---

#### Barbed Gauntlets
**Type:** Gear (Accessory) | **Quantity:** 2 | **Equippable by:** Any class

**Technical Description:**
When the unit equipped with Barbed Gauntlets is successfully hit by a Brawler or Lancer attack, flip a coin. On heads, the attacker takes 1 direct damage. This damage fires even if the defender is captured by that hit.

"Successfully hit" = damage was applied to the gauntlets-wearer. Does NOT fire if the hit was blocked by Wardstone or negated by Senya (since those prevent the hit from landing).

**Known Interactions:**
- **vs. Casters / Shooters:** Barbed Gauntlets does NOT trigger for Shooter or Caster attacks — only Brawler and Lancer attacks.
- **vs. Magic Grenade (attacker's unit granted Caster class for the attack):** The attack's effective class is Caster. Barbed Gauntlets does NOT trigger (not a Brawler or Lancer attack).
- **vs. Iron Maiden (Bestiary, on the gauntlets-wearer):** Both are capture-trigger effects. If the gauntlets-wearer is captured, Iron Maiden fires for the attacker; Barbed Gauntlets also fires for the attacker. Both can resolve on the same capture.

**Hierarchy Position:** Fires after all damage from the current attack is applied, as a separate post-resolution effect.

**Rules Clarifications:**
- "Even if this unit is defeated" — the reflected 1 damage to the attacker fires regardless of whether the gauntlets-wearer survived the hit.
- The 1 reflected damage can capture the attacker (if the attacker was already near-dead).

---

#### Wardstone Bracelet
**Type:** Gear (Accessory) | **Quantity:** 2 | **Equippable by:** Any class

**Technical Description:**
When the unit equipped with a Wardstone Bracelet is declared as the target of any attack, the defending player is offered the option to activate Wardstone before combat resolves. If activated, the entire attack is negated (no damage, no effects, no counter, no terrain resolution). The Wardstone Bracelet is immediately discarded.

Wardstone is checked and offered before ANY other resolution step (before Lancer counters, before terrain, before veteran effects).

**Known Interactions:**
- **vs. True strikes (Lens/Scope/Vorpal):** Wardstone blocks ALL of them. It is the universal intercept regardless of true-strike level.
- **vs. Rowka/Nyss guarantee:** Wardstone fires first. If Wardstone is used, no counter attempt happens at all.
- **vs. Harlund Pack Shield:** Wardstone fires first. If Wardstone is used, Harlund is not offered.
- **vs. Senya/Iktha/Mivara (defender veteran effects):** Wardstone fires first. If used, none of these trigger.

**Hierarchy Position:** FIRST in the resolution order. Checked and resolved before all other effects.

**Rules Clarifications:**
- The player may choose not to use the Wardstone — the option is always presented, but it is a choice.
- After using Wardstone, it is discarded. The unit can no longer use it.
- Wardstone protects the wearer specifically. It cannot be used to protect an adjacent ally (that would be Harlund's role).

---

#### Teleport Boots
**Type:** Gear (Accessory) | **Quantity:** 2 | **Equippable by:** Any class

**Technical Description:**
On the unit's action turn, before attacking, the unit may move to any tile in the player's row (any of the 5 column positions, including their current position). This replaces the normal one-step movement. The unit then attacks normally.

**Known Interactions:**
- **vs. Paralyzing Vines (on origin tile):** Paralyzing Vines checks when a unit attempts to MOVE from its tile. If the Boots unit is on Paralyzing Vines and the move fails (tails), the unit cannot teleport that turn.
- **vs. Rooted Colossus (Bestiary, on the unit):** Rooted Colossus prevents the unit from moving before attacking — Teleport Boots teleport counts as a move. A Rooted unit with Teleport Boots cannot use the boots.
- **vs. Divine Light (destination tile):** Moving via Teleport Boots onto a Divine Light tile flips the unit face-up.
- **vs. Vaela Instinctive Strike:** If teleporting into Vaela's column, Vaela's trigger fires normally.

**Rules Clarifications:**
- Teleport Boots replace the standard move (not a separate extra move). The unit still performs exactly one movement step, just to any tile.
- Moving to the same tile (staying in place) is a valid use of Teleport Boots.

---

### SINGLE-USE ITEMS

---

#### Healing Potion
**Type:** Single-Use | **Quantity:** 4

**Technical Description:**
Target any unit on your side of the board. That unit's damage counter is reduced by 1 (minimum 0). Played during the use-items phase.

**Known Interactions:**
- **vs. Muzzled Beast (Bestiary):** If any of your face-up units are under Muzzled Beast, you cannot use single-use items this turn — including Healing Potion.
- **vs. full HP unit:** If the target is undamaged, the heal has no effect (logged as "already at full HP").

**Rules Clarifications:**
- Can be used on any friendly unit, including paralyzed or restricted ones.
- Cannot be used on enemy units.

---

#### Corrosive Phial
**Type:** Single-Use | **Quantity:** 3

**Technical Description:**
Target any face-up unit on the board (either player's) that has at least one piece of gear equipped. One piece of gear is removed from the target and discarded. Cannot target a face-down unit or a unit with no gear.

**Known Interactions:**
- **vs. Promotion gear (e.g., Champion's Crest):** Promotions are gear cards — they can be destroyed by Corrosive Phial. Destroying a Promotion removes both the HP bonus and the expanded attack range.
- **vs. High-Aerie (Bestiary):** High-Aerie strips gear immediately when revealed. If a unit is already gear-stripped by High-Aerie, it has no gear for Corrosive Phial to target.

**Rules Clarifications:**
- "Face-up" required — cannot target a face-down unit.
- The item is played during use-items phase, before any unit acts.

---

#### Tectonic Spike
**Type:** Single-Use | **Quantity:** 3

**Technical Description:**
Target any terrain card currently on the board (either row). That terrain card is removed from the tile it occupied. The tile returns to a neutral state.

**Known Interactions:**
- **vs. Divine Light on a face-up unit's tile:** Removing Divine Light does not flip the unit face-down — the unit was already face-up. Divine Light's reveal effect already happened; removing the terrain doesn't undo it.

**Rules Clarifications:**
- Can target terrain on either player's row, including your own terrain.
- If the board has no terrain cards at all, this item cannot be played (the UI will not make it available if no valid targets exist — confirmed in `canCurrentPlayerUseSingleUseItems` conditions).

---

#### All-Revealing Lantern-Jar
**Type:** Single-Use | **Quantity:** 3

**Technical Description:**
Target one face-down enemy unit. That unit is permanently flipped face-up. Its identity is now visible to both players for the rest of the game (until captured or involved in a swap that re-positions it).

**Known Interactions:**
- **vs. Unmaker (Bestiary, on revealed unit):** If the revealed unit is affected by Unmaker, revealing it triggers immediate capture.
- **vs. Ever-Watching Eye (Bestiary, on revealed unit):** If the unit's faction has Ever-Watching Eye active, the unit would already be face-up. The lantern-jar would have no valid face-down targets in that faction.

**Rules Clarifications:**
- Only targets enemy (opponent's) units. Cannot be used on your own face-down units.
- Once revealed by the lantern-jar, the unit stays face-up — this is permanent (it doesn't flip back at any point).

---

#### Tangle-Vine Bola
**Type:** Single-Use | **Quantity:** 3

**Technical Description:**
Target one enemy unit (face-up or face-down). A "cannot attack" flag is set on that unit. On that unit's player's next turn: the unit cannot be selected to act (cannot move or attack). Additionally, if an enemy Lancer targeted by the Bola would counter during the opponent's turn before that, the Lancer cannot counter.

The restriction lasts for one of the target's player's turns and then clears.

**Known Interactions:**
- **vs. Rowka's Twin Guard override:** Rowka's guarantee overrides the Bola restriction for Lancer counters. A Bola'd Lancer who is covered by Rowka's Twin Guard CAN still counter.
- **vs. Berserker (Bestiary) — stacking restrictions:** If a unit already has a pending restriction from Berserker exhaustion, adding a Bola restriction layers on top. Both restrictions must clear independently.

**Rules Clarifications:**
- The "cannot attack" flag applies during the target's NEXT own turn. It also suppresses that Lancer from countering during the opponent's turn that comes before that next own turn.
- The unit can still be passively moved (swapped by another unit or teleported by a friendly Teleport Boots user).

---

#### Obscuring Bomb
**Type:** Single-Use | **Quantity:** 2

**Technical Description:**
All units on the playing player's row are flipped face-down simultaneously. The player may then freely reorder those units in any arrangement across their 5 column positions (drag-and-drop / swap interface). The reorder is not treated as a move or swap action — no move-triggered effects fire.

**Known Interactions:**
- **vs. Vaela Instinctive Strike:** Vaela does NOT trigger from Obscuring Bomb reorder.
- **vs. Divine Light terrain on any destination tile:** If a unit is placed onto a Divine Light tile during the reorder, it flips face-up immediately (Divine Light fires during placement).
- **vs. Unmaker (Bestiary) on any unit being reordered:** If a face-up Unmaker-affected unit is moved into a new slot during the reorder, the game checks for Unmaker capture after placement. However, since all units start the reorder face-down, Unmaker-affected units would not be face-up during the reorder itself (unless Divine Light re-reveals them mid-reorder).
- **vs. Ever-Watching Eye (Bestiary):** Ever-Watching Eye will re-flip any affected units face-up again after the reorder completes (during bestiary board state maintenance).

**Rules Clarifications:**
- Units retain all their equipment, damage, and state flags through the Obscuring Bomb reorder.
- Paralyzed units can be reordered (their paralysis applies to their actions, not to being repositioned).
- After the reorder, the opponent's row is unaffected.

---

#### Vorpal Honing Amulet
**Type:** Single-Use | **Quantity:** 2

**Technical Description:**
When played, sets a "vorpal active" flag for the current player's next attack. On that attack:
- All terrain coin flip checks are bypassed.
- ALL Lancer counter attempts are bypassed (including Rowka/Nyss-guaranteed counters).
- All defender veteran effects are bypassed (Senya, Iktha, Mivara, Harlund Pack Shield).
- Damage is set to the target's remaining HP, ensuring capture (one-hit kill regardless of HP total).
- Range rules apply as normal.

Wardstone Bracelet can still intercept a Vorpal attack.

**Known Interactions:**
- **vs. Wardstone Bracelet:** Wardstone intercepts before Vorpal effects apply. Vorpal does not bypass Wardstone.
- **vs. Primal Alpha (Bestiary):** Primal Alpha adds +1 damage. With Vorpal's lethal formula, this is irrelevant (damage is already set to remaining HP). Primal Alpha effectively has no additional effect on a Vorpal attack.
- **vs. Rokklo/Jorren damage bonuses:** Same as above — lethal damage formula overrides any bonuses.

**Hierarchy Position:** Highest among attack modifiers. Bypasses all counters, terrain, and defender veterans. Only Wardstone (even higher) can stop it.

**Rules Clarifications:**
- The Vorpal flag is consumed when the attack fires, whether or not it lands. If Wardstone blocks the attack, the Vorpal flag may or may not be consumed — check current prototype behavior for edge case.
- Range rules still apply — you cannot attack a unit your class cannot normally reach (unless combined with Teleport Boots for movement).

---

#### Magic Grenade
**Type:** Single-Use | **Quantity:** 2

**Technical Description:**
Target one of your own units. That unit's next attack this turn is treated as a Caster attack:
- The unit can attack any enemy column (Caster range override).
- The attack deals 1 damage.
- If the target survives the hit, it is paralyzed (Magic Paralysis — same as base Caster mechanic).
- The "attack as Caster" flag is consumed after the attack resolves (or at end of that unit's action).

"Doesn't stack with other effects" — Magic Grenade does not grant additional Caster veteran abilities (e.g., Solomon's Lunar Dazzle or Chronir's Frozen Chain are NOT added).

**Known Interactions:**
- **vs. Reinforced Barricade (terrain on target tile):** Since the attack is treated as a Caster class attack, Reinforced Barricade is triggered (it fires on Shooter/Caster attacks). Coin flip may block the attack.
- **vs. Elevated Ground (terrain on target tile):** Elevated Ground only fires on Brawler/Lancer attacks. NOT triggered by a Magic Grenade attack.
- **vs. Barbed Gauntlets (defender):** Barbed Gauntlets only triggers on Brawler/Lancer attacks. NOT triggered by a Magic Grenade attack (effective class is Caster).
- **vs. True-Strike Lens (attacker has Lens):** The Lens requires the attacker to be a Shooter or Caster class. If the attacker's actual class is Brawler or Lancer, the Lens does not activate (the effective class override from Magic Grenade affects range/damage but the Lens check is against the unit's actual class).
- **vs. Archmage's Tome:** The archmage multi-target check requires effective class Caster AND the unit's actual class to be Caster AND possession of Archmage's Tome AND NOT `nextAttackAsCaster` flag. So a Magic Grenade non-Caster with Archmage's Tome would NOT get the multi-target effect (the `!attCell.nextAttackAsCaster` guard prevents it).

**Rules Clarifications:**
- The unit targeted by Magic Grenade performs its grenade attack AS its normal action (move + attack turn). It is not an extra attack.
- Paralysis from the hit applies to the DEFENDER (the enemy unit hit), not the attacker.

---

### TERRAIN ITEMS

Terrain cards are placed on an empty tile on either row during the use-items phase. They remain until destroyed by Tectonic Spike or covered by a newly placed terrain card. A tile can only have one terrain card.

---

#### Elevated Ground
**Type:** Terrain | **Quantity:** 3

**Technical Description:**
When a Brawler or Lancer attacks a unit standing on this tile, flip a coin before the attack resolves. On heads, the attack fails — no damage, no effects, no counter step. On tails, the attack proceeds normally through the full resolution sequence.

**Known Interactions:**
- **vs. True-Strike Lens (attacker is Shooter/Caster):** Not applicable — Elevated Ground only fires on Brawler/Lancer attacks.
- **vs. Vorpal Honing Amulet:** Vorpal bypasses terrain coin flips entirely. Elevated Ground does not fire.
- **vs. Sharpshooter's Scope:** Not applicable — Scope is for Shooters only.

**Rules Clarifications:**
- The terrain coin flip happens BEFORE the Lancer counter step in the sequence. If the terrain flip fails the attack, no counter is attempted.
- The unit on Elevated Ground is the DEFENDER. The terrain protects them from Brawler/Lancer attacks.

---

#### Reinforced Barricade
**Type:** Terrain | **Quantity:** 3

**Technical Description:**
When a Shooter or Caster attacks a unit standing on this tile, flip a coin before the attack resolves. On heads, the attack fails. On tails, the attack proceeds normally.

**Known Interactions:**
- **vs. True-Strike Lens (attacker is Shooter/Caster with Lens):** Lens bypasses terrain coin flips. Reinforced Barricade does not fire.
- **vs. Vorpal Honing Amulet:** Vorpal bypasses all terrain. Barricade does not fire.
- **vs. Sharpshooter's Scope:** Scope bypasses all terrain. Barricade does not fire.
- **vs. Magic Grenade (unit attacking as Caster):** Magic Grenade's effective class is Caster. Reinforced Barricade DOES fire against a Magic Grenade attack.

**Rules Clarifications:**
- Identical in structure to Elevated Ground but for Shooter/Caster attacks.

---

#### Paralyzing Vines
**Type:** Terrain | **Quantity:** 2

**Technical Description:**
When a unit on this tile attempts to move or swap (initiate movement), flip a coin. On tails, the move fails — the unit stays in place and its movement action is consumed (the turn proceeds to attack without movement). On heads, the move proceeds normally.

**Known Interactions:**
- **vs. Teleport Boots:** Teleport Boots trigger a move. Paralyzing Vines fires against the Teleport Boots user if they're on a Vines tile.
- **vs. Royal Caravan (Bestiary) extra moves:** Each extra move attempt by a Royal Caravan unit while on Paralyzing Vines would trigger a coin flip.
- **vs. Harlund swap:** When Harlund swaps in to protect an ally, it may involve moving through a Paralyzing Vines tile — current prototype behavior may or may not apply the Vines check to the swap (treat as unclear until tested).

**Rules Clarifications:**
- Applies only when the unit ON the tile initiates movement. Passive placement (another unit swapping them) does not trigger Paralyzing Vines.
- "Move fails on tails" means the unit must attack from its current position, but it can still attack.

---

#### Divine Light
**Type:** Terrain | **Quantity:** 2

**Technical Description:**
Any unit placed on, moved to, or swapped to this tile is immediately flipped face-up. This is automatic and requires no coin flip.

**Known Interactions:**
- **vs. Unmaker (Bestiary):** If an Unmaker-affected face-down unit is placed on/moves to Divine Light, they are flipped face-up by Divine Light, which then triggers Unmaker's capture mechanic immediately.
- **vs. Obscuring Bomb reorder:** If a unit is repositioned to a Divine Light tile during an Obscuring Bomb reorder, it is immediately flipped face-up.

**Rules Clarifications:**
- Divine Light only reveals units when they arrive. Units already on the tile when Divine Light is placed are also immediately affected.
- Once a unit is face-up from Divine Light, it stays face-up (Divine Light is not an ongoing source — it just reveals on arrival).

---

#### Unstable Ground
**Type:** Terrain | **Quantity:** 2

**Technical Description:**
When a unit on this tile begins an attack OR attempts a Lancer counter, flip a coin first. On tails, the action is canceled — the attack (or counter attempt) fails to fire. On heads, the action proceeds normally.

**Known Interactions:**
- **vs. Rowka/Nyss guarantee:** Unstable Ground is resolved BEFORE the counter guarantee applies. If Unstable Ground cancels the counter attempt (tails), Rowka/Nyss's guarantee does not override — the counter never reaches the success flip.
- **vs. Vorpal/Scope (attacker on Unstable Ground):** If the attacker is on Unstable Ground, their attack is subject to the Unstable Ground flip. Vorpal/Scope's terrain bypass applies to DEFENDER terrain (on target's tile). Attacker terrain (Unstable Ground on the attacker's tile) still fires.

**Rules Clarifications:**
- Unstable Ground on the ATTACKER's tile fires when they attack. Unstable Ground on the DEFENDER's tile does NOT fire on attacks (only on the defender initiating actions).
- For Lancer counters: the Lancer on Unstable Ground rolls the terrain flip before the counter attempt. Tails cancels the counter.

---

### PROMOTION ITEMS

Promotions occupy the gear slot (they are gear cards). Only one Promotion per unit. They grant +1 HP plus an expanded attack/counter range. Units must belong to the matching class to equip.

---

#### Champion's Crest
**Type:** Promotion | **Quantity:** 1 | **Equippable by:** Brawlers only

**Technical Description:**
Grants +1 max HP. Changes the unit's attack pattern: instead of attacking only directly forward (1 tile), the unit can now attack forward AND diagonally forward-left and forward-right (3 total targets: forward, diagonal-left, diagonal-right). This mirrors the column positions of: same column + 1 left + 1 right on the opponent's row.

**Known Interactions:**
- **vs. Corrosive Phial / Iktha Magma Skin:** Champion's Crest can be destroyed, reverting the unit to standard Brawler range and losing the +1 HP.
- **vs. Elevated Ground (on target's tile):** Elevated Ground fires normally on Brawler attacks via Crest's expanded range.

**Rules Clarifications:**
- The +1 HP is lost if the Crest is destroyed. If current damage exceeds the new lower max HP after gear destruction, the unit is captured.

---

#### Vanguard Lance
**Type:** Promotion | **Quantity:** 1 | **Equippable by:** Lancers only

**Technical Description:**
Grants +1 max HP. Expands the Lancer's attack range from 1 column (adjacent) to up to 2 columns left or right on the opponent's row. Also expands counter range to cover attackers up to 2 columns away (instead of 1). Diagonals are also covered up to 2 columns.

**Known Interactions:**
- **vs. Keera Double Sword:** Keera with Vanguard Lance can hit secondary targets up to 2 columns away with her extra hit.
- **vs. Rowka Twin Guard:** Rowka with Vanguard Lance can counter attacks from further away.
- **vs. Braskin Uncanny Block:** Braskin with Vanguard Lance provides the counter-blocking adjacency aura — but Braskin's aura is still only for units adjacent (1 column) to Braskin. Vanguard Lance on Braskin doesn't expand the aura.

---

#### Sharpshooter's Scope
**Type:** Promotion | **Quantity:** 1 | **Equippable by:** Shooters only

**Technical Description:**
Grants +1 max HP. All attacks by the equipped Shooter are true strikes at full power — bypassing terrain coin flips, ALL Lancer counters (including Rowka/Nyss guaranteed), and all defender veteran on-hit effects (Senya, Iktha, Mivara, Harlund Pack Shield).

See True Strikes table in `RULES.md` for comparison. Scope is the strongest per-attack veteran bypass short of Vorpal's lethality.

**Known Interactions:**
- **vs. Wardstone Bracelet:** Wardstone still intercepts — Scope does not bypass Wardstone.
- **vs. Reinforced Barricade (target's tile):** Scope bypasses terrain. Barricade does not fire.
- **vs. Archmage's Tome (if on a Caster — not applicable):** Scope is Shooter-only.

---

#### Archmage's Tome
**Type:** Promotion | **Quantity:** 1 | **Equippable by:** Casters only

**Technical Description:**
Grants +1 max HP. The Caster's attacks now affect 3 targets simultaneously: the declared target, and the enemies in the columns immediately left and right of the target (if occupied). Each target takes the full attack damage and Magic Paralysis (if they survive). After attacking with the Tome, the Caster cannot act on its next own turn (must rest). The rest flag is set as pending at end of attack, then confirmed at start of the Caster's next turn.

**Known Interactions:**
- **vs. Harlund Pack Shield:** Harlund can trigger at most once per full Archmage sequence. The protected unit is immune to all subsequent packets in the same sequence.
- **vs. Wardstone Bracelet (on one of the 3 targets):** Wardstone can protect the specific unit that has it. Other units in the 3-target spread are unaffected by one unit's Wardstone.
- **vs. Ardan Veilstep:** Veilstep is offered at most once per full Archmage sequence, after all packets resolve.
- **vs. Senya Hex Haze / Mivara False Self (on one of the targets):** These trigger per-packet. Each hit packet is evaluated independently for defender veterans on the specific target of that packet.
- **vs. Rooted Colossus (Bestiary) on Archmage unit:** Rooted Colossus prevents movement before attacking. This doesn't affect the multi-target — it affects movement phase only.
- **vs. Chronir Frozen Chain:** Chronir with Archmage's Tome fires Frozen Chain for each hit packet. The player must choose which adjacent enemy to paralyze after each packet (or it auto-resolves if only one option).
- **vs. Magic Grenade:** A unit using Magic Grenade (which sets `nextAttackAsCaster`) will NOT get Archmage's multi-target attack even if they somehow had Archmage's Tome — the code explicitly checks `!attCell.nextAttackAsCaster` to prevent this.

**Rules Clarifications:**
- "Must rest 1 turn" = cannot be selected to act on that player's next turn, and cannot counter during the opponent's turn before that.
- The Archmage multi-target fires as a sequence of individual hit packets, each going through the full resolution pipeline.
- If the central target is empty but adjacent targets are occupied, the attack still fires on the occupied adjacent columns.

---

## Section 3 — Bestiary Cards

Bestiary cards are revealed through the Seer's Bestiary mechanic: as players reach capture milestones (6, 10, 13, 15, 17, 19 depending on game length), a new pair of cards is revealed (one faction card + one effect card). The effect applies to ALL units of the matched faction, from both players.

Effects are continuous — they apply as long as the bestiary column is active. They cannot be "countered" or bypassed except where noted.

**Note on scope:** Effects apply per-unit based on faction membership, determined by `getBestiaryEffectsForUnit()`. A unit affected by a bestiary card inherits all active effects for its faction.

---

### FACTION BUFFS

---

#### Primal Alpha
**ID:** `primal_alpha`

**Technical Description:**
Each unit in the affected faction deals +1 additional damage on every attack. Stacks additively with other damage bonuses (Jorren Berserker streak, Rokklo Returning Hit, Shooter Longshot).

**Known Interactions:**
- **vs. Vorpal Honing Amulet:** Vorpal sets damage to remaining HP (lethal). Primal Alpha's +1 is irrelevant once the damage is lethal.
- **vs. Jorren Berserker buff:** Primal Alpha stacks. Consecutive turn + Primal Alpha = 3 damage total.

---

#### Royal Caravan
**ID:** `royal_caravan`

**Technical Description:**
Each unit in the affected faction may move one additional tile before attacking (total movement = 2 tiles instead of 1 per action). The extra move is tracked as `bestiaryExtraMovesRemaining` on the cell.

**Known Interactions:**
- **vs. Rooted Colossus (same faction with both effects):** If a unit is affected by both Rooted Colossus and Royal Caravan, Rooted Colossus takes precedence — the unit cannot move at all before attacking. Royal Caravan's extra move bonus is suppressed.
- **vs. Berserker (same faction with both effects):** On Berserker follow-up attacks, the unit re-enters the move phase with Royal Caravan extra moves applied (if not also Rooted).
- **vs. Paralyzing Vines (on movement tiles):** Each move step through Paralyzing Vines triggers a coin flip.

---

#### Hoarder of Glimmer
**ID:** `hoarder_of_glimmer`

**Technical Description:**
After any unit in the affected faction completes an attack (attack resolution ends), that unit's player draws 1 extra item card from the item deck.

**Known Interactions:**
- **vs. empty item deck:** If the deck is empty, the draw finds no card. No crash/error — just nothing drawn.
- **vs. Muzzled Beast (on the same unit):** Muzzled Beast prevents using single-use items, but does not prevent drawing items. Drawing and using are separate.

---

#### The Iron-Clad Shield
**ID:** `iron_clad_shield`

**Technical Description:**
Each unit in the affected faction can equip up to 2 gear cards simultaneously (instead of the default 1). The second gear slot is enabled via `ironCladShield` flag in the bestiary effects.

**Known Interactions:**
- **vs. High-Aerie (on the same unit):** High-Aerie strips ALL gear. The second slot provides no protection — both slots are stripped.

**Rules Clarifications:**
- The extra slot allows any combination of two gear types (e.g., armor + accessory, or two armors if equip class conditions are met).

---

#### Eternal Carapace
**ID:** `eternal_carapace`

**Technical Description:**
Each unit in the affected faction gains +1 maximum HP. This is a direct bonus to `getMaxHP()` — it stacks with gear HP bonuses.

**Known Interactions:**
- **vs. Iktha Magma Skin / Torra Shattering Hammer:** These destroy gear, not bestiary bonuses. The +1 HP from Eternal Carapace persists even after gear is destroyed.

---

### FACTION DEBUFFS

---

#### Rooted Colossus
**ID:** `rooted_colossus`

**Technical Description:**
Units in the affected faction cannot move before attacking. When such a unit is selected to act, the action phase skips directly to the attack phase. No movement input is presented.

**Known Interactions:**
- **vs. Royal Caravan (on same unit):** Rooted Colossus overrides Royal Caravan — the unit cannot move regardless of extra-move bonus.
- **vs. Berserker (on same unit) follow-up attacks:** On Berserker follow-up attacks, the unit re-enters with Rooted Colossus active — it goes directly to attack phase, no movement.
- **vs. Teleport Boots:** Teleport Boots enable movement. Rooted Colossus prevents the movement regardless of equipment.

---

#### High-Aerie
**ID:** `high_aerie`

**Technical Description:**
Units in the affected faction cannot equip gear. Any gear that is already equipped to such units is immediately stripped (discarded) when High-Aerie becomes active (during `applyHighAerieGearStrip()` maintenance call). New gear cannot be equipped to these units while the effect is active.

**Known Interactions:**
- **vs. Iron-Clad Shield (on same unit):** If both effects are active for the same unit, High-Aerie takes precedence — gear cannot be equipped and existing gear is stripped.
- **vs. Promotions:** Promotions are gear cards. High-Aerie will strip Promotions from affected units.

**Rules Clarifications:**
- Gear stripping is applied as a maintenance action whenever the bestiary board state is updated — any gear equipped after High-Aerie is active is immediately stripped.

---

#### Muzzled Beast
**ID:** `muzzled_beast`

**Technical Description:**
If the current active player has any face-up units belonging to the affected faction (i.e., any face-up units under the Muzzled Beast effect), that player cannot use single-use items during the use-items phase of that turn.

The restriction is player-wide: even one face-up Muzzled unit in your row blocks ALL single-use items for the turn.

**Known Interactions:**
- **vs. Gear items (Armor, Accessory, Promotion):** Muzzled Beast ONLY blocks single-use items. Gear equipping is NOT restricted.
- **vs. Terrain items:** Terrain placement is NOT restricted.
- **vs. Healing Potion, Corrosive Phial, all other single-use cards:** All blocked.

**Rules Clarifications:**
- The check is: "does the current player have any face-up units affected by Muzzled Beast?" If all Muzzled faction units are face-down, the restriction does not apply.
- Face-down Muzzled units do not trigger the restriction.

---

#### Fractured Hulk
**ID:** `fractured_hulk`

**Technical Description:**
Units in the affected faction have their veteran buff suppressed entirely. `hasVeteranBuff()` returns false for any buff key on a Fractured Hulk-affected unit. The suppression is logged once per buff call (per turn/context) to avoid log spam.

**Known Interactions:**
- **vs. ALL veteran buffs:** Completely neutralizes any veteran ability. A Harlund under Fractured Hulk loses Pack Shield. A Senya under Fractured Hulk loses Hex Haze. Etc.
- **vs. Rowka restriction override:** Rowka's override of the "restricted units cannot counter" rule comes from Rowka's veteran buff. If Rowka is under Fractured Hulk, his buff is suppressed — he cannot provide the counter guarantee and his override of restrictions is gone.

---

### PASSIVE EFFECT CARDS

---

#### Ever-Watching Eye
**ID:** `ever_watching_eye`

**Technical Description:**
Any unit in the affected faction that is face-down is immediately flipped face-up. This is applied during board state maintenance, which runs whenever the bestiary state changes. Units of this faction always remain face-up — they cannot be played face-down.

**Known Interactions:**
- **vs. Obscuring Bomb:** After Obscuring Bomb flips your units face-down, board maintenance runs — Ever-Watching Eye re-flips the affected faction units face-up immediately.
- **vs. Ardan Veilstep:** If Ardan is affected by Ever-Watching Eye, he cannot effectively remain face-down after Veilstep — he would be immediately re-revealed.

**Rules Clarifications:**
- This is a hard constraint — units of the affected faction are ALWAYS face-up. There is no way to hide them.

---

#### Berserker (Bestiary)
**ID:** `berserker`

**Technical Description:**
After any unit in the affected faction completes its first attack of the turn, it is immediately eligible to attack again (up to the number of `berserker` stack count times). The unit re-enters the move phase (unless also affected by Rooted Colossus, in which case it re-enters the attack phase). After the Berserker follow-up attack(s) resolve, the unit is flagged as restricted for its next own turn (`cannotAttackNextTurnPending = true`), meaning it cannot act and cannot counter.

**Known Interactions:**
- **vs. Rooted Colossus (same unit):** On follow-up attacks, the unit skips move phase and goes directly to attack (Rooted prevents movement).
- **vs. Royal Caravan (same unit):** On follow-up attacks that include a move phase, Royal Caravan's extra move bonus is applied.
- **vs. Hoarder of Glimmer (same unit):** After EACH Berserker attack, the unit draws an extra item (since each attack resolution calls `finishResolvedCombatTurn` which applies Hoarder of Glimmer).
- **vs. Rowka's restriction override:** The Berserker rest restriction (cannot counter on next opponent turn) is overrideable by Rowka's Twin Guard — a Berserker-exhausted Lancer can still counter if Rowka guarantees it.
- **vs. Tangle-Vine Bola (applied before Berserker exhaustion clears):** Both restrictions layer. The unit is blocked on its next turn from both causes.

**Rules Clarifications:**
- The "paralyzed on next turn" restriction is set as PENDING at the end of the Berserker's last attack and applied at the start of that player's next turn. This means the restriction is in effect during the opponent's turn (blocking counters) that immediately follows.
- The `berserkerUsedThisTurn` flag prevents the Berserker bonus from re-triggering mid-sequence.

---

#### Iron Maiden
**ID:** `iron_maiden`

**Technical Description:**
When a unit in the affected faction is captured (defeated), flip a coin. On heads, the attacker who delivered the killing blow is also immediately captured (killed, regardless of their current HP). On tails, nothing additional happens.

Iron Maiden fires as part of the capture resolution inside `applyDamage()`, triggered by the `causeInfo` object that tracks the attacker's identity.

**Known Interactions:**
- **vs. Barbed Gauntlets (on the Iron Maiden unit):** Both can fire on the same capture. Iron Maiden fires for the attacker (potentially killing them); Barbed Gauntlets also fires. Order: capture resolves → Iron Maiden coin flip → if Barbed Gauntlets + Brawler/Lancer attacker → Barbed Gauntlets coin flip.
- **vs. Lyra Blast Echo secondary hit killing an Iron Maiden unit:** Iron Maiden fires for Lyra as the attacker, since `causeInfo` traces back to Lyra's attack.
- **vs. Grolk Bloodthirst:** If Grolk captures an Iron Maiden unit and Iron Maiden's heads result captures Grolk in return, Bloodthirst's heal is meaningless (Grolk is captured).
- **vs. Vorpal Honing Amulet:** Vorpal guarantees capture of the target. Iron Maiden fires after the capture — Vorpal does not bypass Iron Maiden (Vorpal bypasses defender veteran BUFFS during the hit, not post-capture triggered effects).

**Rules Clarifications:**
- The attacker is captured at full-damage (immediate death) regardless of current HP — this is a punitive instakill.
- Iron Maiden only fires when an attack causes a capture. Damage from Barbed Gauntlets, Blast Echo, or other indirect damage that kills an Iron Maiden unit also triggers it (as long as `causeInfo` is populated with attacker info).

---

#### Unmaker
**ID:** `unmaker`

**Technical Description:**
Any unit in the affected faction that becomes face-up (for any reason) is immediately captured (removed from the board). The capture happens automatically as part of board state maintenance.

If a player attempts to select a face-down Unmaker unit to act (which would reveal it), a confirmation prompt is shown: "This unit will be captured upon reveal. Proceed?" If confirmed, the unit is revealed and immediately captured.

**Known Interactions:**
- **vs. All-Revealing Lantern-Jar (targeting an Unmaker unit):** Using the Lantern-Jar on a face-down Unmaker unit reveals it, triggering immediate capture.
- **vs. Ever-Watching Eye (on same unit):** If both Ever-Watching Eye and Unmaker affect the same unit (possible if two bestiary columns have different effects for the same faction — not standard in current implementation), Ever-Watching Eye would immediately reveal and Unmaker would immediately capture. The unit effectively cannot be on the board.
- **vs. Divine Light (Unmaker unit moves to the tile):** Moving an Unmaker unit onto a Divine Light tile reveals it, triggering Unmaker capture.
- **vs. Obscuring Bomb:** If an Unmaker unit is in the row and Obscuring Bomb flips everyone face-down, and then one is placed on Divine Light — that would trigger the reveal + capture.

**Rules Clarifications:**
- Unmaker units can remain on the board indefinitely as long as they stay face-down.
- The player is warned before revealing (selecting to act) an Unmaker unit. This is the only case where the game shows a "this action will capture your own unit" prompt.
- Opponent can still target and capture a face-down Unmaker unit through combat (attacking it directly while it's face-down). The unit takes damage normally; capture happens from damage, not from reveal.

---

## Section 4 — Resolution Hierarchy

When multiple effects could apply to the same attack, they resolve in this order. Higher tiers always win.

### Full Priority Order (combat sequence)

```
1. WARDSTONE BRACELET (intercept — offered to defender before anything else)
   └─ If used: attack canceled entirely. Skip all remaining steps.

2. TERRAIN ON ATTACKER'S TILE
   └─ Unstable Ground: attacker coin flip. Tails = attack canceled. Skip all remaining steps.

3. TRUE-STRIKE FLAG DETERMINATION
   └─ Is this a Vorpal attack? → bypassAllCounters, bypassAllVeterans, lethal
   └─ Is this a Scope attack? → bypassAllCounters, bypassAllVeterans, normal damage
   └─ Is this a Lens attack? → bypass only unguaranteed counters, bypass terrain only

4. BRASKIN CHECK (attacker-adjacent ally)
   └─ If Braskin is adjacent to the attacker: no Lancer counter attempted. Skip to step 7.

5. LANCER COUNTER ELIGIBILITY
   └─ Find defender Lancers in counter range (includes Vanguard Lance extended range)
   └─ Filter out restricted Lancers (unless covered by Rowka's guarantee)
   └─ If no valid counter Lancer: skip to step 7.

6. UNSTABLE GROUND ON COUNTER LANCER'S TILE
   └─ Coin flip. Tails = counter attempt canceled. Skip to step 7.
   └─ (Rowka/Nyss guarantees do NOT override this step)

7. COUNTER SUCCESS COIN FLIP (if attempt proceeds)
   └─ Rowka Twin Guard or Nyss Phantom Posture: replace with guaranteed success
   └─ Otherwise: random coin flip
   └─ Heads = counter succeeds: attacker takes 1 damage, original attack fails.
      └─ Keera Double Sword: extra hit on another in-range enemy.
      └─ Skip to end.
   └─ Tails = counter fails: proceed to step 8.

8. TERRAIN ON DEFENDER'S TILE (if attack proceeds after counter step)
   └─ Elevated Ground: Brawler/Lancer coin flip. Heads = attack fails.
   └─ Reinforced Barricade: Shooter/Caster coin flip. Heads = attack fails.
   └─ (Bypassed entirely if Vorpal, Scope, or Lens)

9. HARLUND PACK SHIELD CHECK
   └─ If adjacent Harlund and adjacent ally is the target: offer Pack Shield prompt.
   └─ If used: Harlund swaps in, takes the hit. (Once per full sequence.)
   └─ (Not offered if Vorpal or Scope is active)

10. ATTACKER-SIDE EFFECTS BEFORE DAMAGE
    └─ Torra Shattering Hammer: coin flip, heads = defender's gear destroyed before damage.

11. DEFENDER VETERAN PACKET RESOLUTION
    └─ Skip entirely if Vorpal or Scope is active (they bypass veteran effects).
    └─ Iktha Magma Skin: attacker's gear destroyed before damage.
    └─ Senya Hex Haze: coin flip, heads = hit canceled + 1 damage to attacker.
    └─ Mivara False Self: coin flip, heads = hit redirected to enemy in front of Mivara.

12. DAMAGE APPLICATION
    └─ Calculate: base (1) + Primal Alpha + Rokklo + Jorren + longshot bonuses
    └─ Apply to final target (after any redirection).
    └─ Capture check: if damage ≥ max HP, unit is captured.
       └─ Iron Maiden (Bestiary): if captured unit has Iron Maiden, coin flip for attacker capture.

13. POST-HIT EFFECTS (all fire in sequence)
    └─ Magic Paralysis: if Caster attack and target survived, target is paralyzed.
    └─ Haskel Pirate Claw: steal item from opponent's hand.
    └─ Lyra Blast Echo: coin flip, heads = bonus 1 damage to between-column enemy.
    └─ Rokklo Returning Hit: coin flip, heads = +1 extra damage to target.
    └─ Solomon Lunar Dazzle: reveal + paralyze enemy in Solomon's column.
    └─ Chronir Frozen Chain: reveal + paralyze one adjacent-to-target enemy.
    └─ Grolk Bloodthirst: if captured, coin flip, heads = Grolk heals 1 HP.
    └─ Ardan Veilstep prompt: offered if any hit landed.
    └─ Cassa Twin Arc prompt: offered if multiple face-up enemies in range.
    └─ Tival Quick Reload prompt: offered if hit didn't land on original target.

14. BARBED GAUNTLETS CHECK
    └─ If defender had Barbed Gauntlets AND attacker was Brawler/Lancer AND attack landed:
       coin flip, heads = attacker takes 1 damage.

15. BERSERKER (Bestiary) follow-up
    └─ If attacking unit's faction has Berserker: unit may attack again.
    └─ After all Berserker attacks exhaust: set cannotAttackNextTurnPending.

16. HOARDER OF GLIMMER (Bestiary) draw
    └─ If attacking unit's faction has Hoarder of Glimmer: draw extra item(s).
```

---

### Exception Summary Table

| Rule | Exception | Result |
|------|-----------|--------|
| Restricted units cannot counter | Rowka's Twin Guard covers them | They CAN counter |
| Restricted units cannot act | "If Hit" buffs (Harlund, Vaela, Senya, Iktha, Mivara) | They STILL fire |
| True-Strike Lens bypasses counters | Rowka/Nyss guaranteed counters | They still fire vs Lens |
| True-Strike Lens bypasses veterans | All veteran effects | None bypassed by Lens |
| Scope bypasses veterans | Harlund, Senya, Iktha, Mivara | All bypassed by Scope |
| Vorpal bypasses veterans | Harlund, Senya, Iktha, Mivara | All bypassed by Vorpal |
| Wardstone blocks all attacks | Everything | Nothing bypasses Wardstone |
| Unstable Ground cancels counters | Rowka/Nyss guarantees | They do NOT override |
| Berserker restriction (cannot counter) | Rowka's guarantee | They CAN still counter |
| Muzzled Beast blocks single-use | Gear items, terrain | Those are NOT blocked |
| High-Aerie prevents gear | Iron-Clad Shield bonus slot | Both slots stripped |

---

### State Flags Reference (inter-turn tracking)

| Flag | Unit | Clears when |
|------|------|------------|
| `jorrenAttackedLastOwnTurn` | Jorren | End of Jorren's next own turn |
| `senyaBlockedThisTurn / BlockNextTurn` | Senya | Start of Senya's player's next turn |
| `cassaBlockedThisTurn / BlockNextTurn` | Cassa | Start of Cassa's player's next turn |
| `cannotAttackNextTurn` | Any unit | At end of start-of-turn processing |
| `mustRestNextTurn` | Archmage/Berserker | At end of start-of-turn processing |
| `paralyzed` | Any unit | At start of that player's turn |
| `berserkerUsedThisTurn` | Berserker unit | At end of turn |
| `berserkerAttacksLeft` | Berserker unit | At end of turn |
| `bestiaryExtraMovesRemaining` | Royal Caravan unit | Consumed on each extra move |
| `nextAttackAsCaster` | Magic Grenade target | Consumed after attack fires |
| `vorpalNextAttack` | State-level (not per-unit) | Consumed after attack fires |
