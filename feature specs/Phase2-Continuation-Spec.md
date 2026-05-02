# Tacticlash — Phase 2 Animations: Continuation Spec

**Branch:** `animations`
**Prerequisite reading:** `feature specs/CPU-Interaction-Feature-Spec-Phase2.md` (the original spec), `feature specs/Phase2-Implementation-Plan.md` (what was built), `feature specs/Phase2-Testing-Guide.md` (how to test each animation).
**Context:** Phase 2 animation layer is partially implemented and partially debugged. This document captures the current state precisely so work can resume in a fresh context.

---

## Codebase orientation

Plain HTML/CSS/JS, no build step. Open `index.html` in a browser or run `python3 -m http.server 8080`.

| File | Role |
|------|------|
| `game.js` | All game logic (~6 000 lines), single IIFE. Animation code lives here too. |
| `style.css` | All styles. Theater Layer children styled here. |
| `index.html` | DOM including `#theater-layer` children (coin, spotlight, banner). |
| `feature specs/Phase2-Testing-Guide.md` | Step-by-step test checklist for every animation. Use this actively. |

**Key architecture objects in `game.js` (all inside the IIFE):**

| Symbol | Line | Purpose |
|--------|------|---------|
| `EventQueue` | 102 | CPU turn gating — `resume()` / `pause()` / `clear()` |
| `CoinGate` | 126 | Display gate for coin flip animations (see below) |
| `Anim` | 162 | All GSAP animation functions, fire-and-forget |
| `renderLogEntry()` | 662 | Direct DOM log append, bypasses CoinGate |
| `log()` | 680 | Gated wrapper — buffers DOM append when CoinGate is active |
| `renderBoard()` | 2500 | Gated — bails and marks dirty when CoinGate is active |
| `renderTurnUI()` | 3654 | Gated — bails and marks dirty when CoinGate is active |

---

## CoinGate architecture

`CoinGate` is a display buffer that holds all DOM updates (log entries, `renderBoard`, `renderTurnUI`) while one or more coin flip animations are running. Game state mutates immediately and correctly; only the visual reveal is deferred.

**Flow:**
1. Game logic calls `CoinGate.push(heads, player, col)` instead of animating directly.
2. First `push()` in a sequence sets `_running = true` and schedules `_drain()` via `requestAnimationFrame`.
3. Game logic continues synchronously — all `log()`, `renderBoard()`, `renderTurnUI()` calls are buffered.
4. After the synchronous call stack ends, `_drain()` fires: plays `Anim.coinFlip()` for the first queued coin.
5. `Anim.coinFlip()` calls `onComplete` (its 5th argument) when the coin has spun, landed, held (~400ms), and faded.
6. `onComplete` = `_drain` again → plays next queued coin, or calls `_flush()` if queue is empty.
7. `_flush()`: renders all buffered log entries, then `renderTurnUI()`, then `renderBoard()`.

**Multiple coins in one combat action** (e.g. Unstable Ground on Lancer's tile + counter roll) play sequentially, board stays frozen for the full sequence.

**What is NOT buffered by CoinGate** (fires immediately even during a coin spin):
- GSAP animations on `.slot` elements (`Anim.attack`, `Anim.damageShake`) — slots survive `renderBoard`
- Theater Layer proxy animations (`Anim.unitCapture`, `Anim.cpuReveal`) — live in `#theater-layer`, independent of board DOM
- `state.*` mutations — always immediate, CoinGate only holds display

---

## Current animation status

### Confirmed working
| Animation | Notes |
|-----------|-------|
| §3 Attack lunge + shake | Animates `.slot` element (survives `renderBoard` re-render) |
| §6 Setup coin flip | `Anim.coinFlip` directly with `onLand` callback; not gated |
| §6 Combat coin flips | All major combat coins now go through CoinGate (see full list below) |

### Confirmed fixed during debugging
- §3/§5 were animating `.unit-tile` (replaced by `renderBoard` before first rAF tick) — fixed to use `.slot`
- Lyra's and Torra's coin was appearing above the target, not the acting unit — fixed
- Vaela, Rokklo, Senya, Mivara had no coin animation at all — wired

### Not yet tested / status unknown
Everything in the testing guide that isn't listed above should be verified. Priority order based on visibility and complexity:

| Priority | Animation | Spec § | Likely issue to watch for |
|----------|-----------|--------|--------------------------|
| High | Unit capture arc | §15 | Proxy fires during CoinGate (coin spinning); ensure arc + board flush look coherent |
| High | Interrupt spotlight (Wardstone) | §13 | `wardstoneSpotlightPending` flag + 700ms delay before interrupt UI |
| High | CPU face-down reveal | §8 | Accordion flip proxy in theater layer; fires before `state.board[p][c] = null` |
| Medium | Own face-down reveal | §7 | Overlay injected after `renderBoard()`; verify it fires |
| Medium | Unit move slide | §2 | Pre/post `getBoundingClientRect` FLIP; test P1 and P2 moves |
| Medium | Bestiary banner | §14 | Theater Layer banner; fires in `applyBestiaryRevealNow()` |
| Medium | Unit placement stagger | §16 | `placeUnit()` and `placeAllRandomly()` — both wired |
| Medium | Card draw | §18 | `animateCardIntoHand()` → `Anim.cardDraw()` — check last hand card |
| Low | Gear equip slide | §9 | After `renderBoard()` in `applyEquipArmor()` |
| Low | Item consume arc | §10 | Only wired for 3 items; 7+ items missing (see below) |
| Low | Unit selected pulse | §1 | After `renderBoard()` in `onSelectUnit()` |
| Low | Reorder entry/swap/exit | §17 | Entry in `beginArdanVeilstepReorder()`; swap in `doObscuringSwap()` |
| Low | Terrain equip | — | `applyPlaceTerrain()` → `Anim.terrainEquip()` |
| Low | Veteran pulse | §12 | `.slot` element, fires during CoinGate — verify it's visible |
| Low | Terrain pulse | §11 | `.slot` brightness filter, fires via gated sequence |

---

## Complete CoinGate event list (all 15 gated coin flips)

Every `CoinGate.push()` call freezes the board display until the coin settles.

### Veteran abilities — attacker
| # | Ability | Coin above | Heads | Tails |
|---|---------|-----------|-------|-------|
| 1 | Torra's Shattering Hammer | Torra | Destroys one defender gear before damage | No effect |
| 2 | Rokklo's Returning Hit | Rokklo | +1 damage on this attack | No bonus |
| 3 | Lyra's Blast Echo | Lyra | Extra 1 damage to unit between attacker and target | No extra hit |

### Veteran abilities — defender
| # | Ability | Coin above | Heads | Tails |
|---|---------|-----------|-------|-------|
| 4 | Senya's Hex Haze | Senya | Attack fully negated; Senya deals 1 damage back | Attack lands |
| 5 | Mivara's False Self | Mivara | Attack redirects to enemy in front of attacker | Attack lands on Mivara |
| 6 | Vaela's Instinctive Strike | Vaela | Moving unit takes 1 damage, turn ends | Move proceeds |

### Terrain effects
| # | Terrain | Coin above | Heads | Tails |
|---|---------|-----------|-------|-------|
| 7 | Paralyzing Vines (move) | Moving unit | Move succeeds | Move fails, must attack |
| 8 | Unstable Ground (attacker's tile) | Attacker | Attack proceeds | Attack canceled |
| 9 | Elevated Ground (defender's tile) | Defender | Attack fails (Brawler/Lancer) | Attack lands |
| 10 | Reinforced Barricade (defender's tile) | Defender | Attack fails (Shooter/Caster) | Attack lands |

### Lancer counter-attack (can chain — two sequential coins if Unstable Ground is on Lancer's tile)
| # | Event | Coin above | Heads | Tails |
|---|-------|-----------|-------|-------|
| 11 | Unstable Ground pre-counter check | Lancer | Counter attempt can proceed | Counter canceled |
| 12 | Counter roll (after Unstable Ground allowed) | Lancer | Counter succeeds; attacker takes 1 damage | Counter fails |
| 13 | Counter roll (no Unstable Ground) | Lancer | Counter succeeds; attacker takes 1 damage | Counter fails |

### Gear effects
| # | Gear | Coin above | Heads | Tails |
|---|------|-----------|-------|-------|
| 14 | Barbed Gauntlets | Defending unit | Attacker takes 1 reflected damage | No reflection |

### Bestiary effects
| # | Effect | Coin above | Heads | Tails |
|---|--------|-----------|-------|-------|
| 15 | Iron Maiden | Attacker | Attacker captured in retaliation | No retaliation |

### Not gated (1 event)
| Event | Why |
|-------|-----|
| Setup "Who goes first?" coin | No board state changes; `onLand` callback shows result text directly |

---

## Known gaps — coin flips not yet wired to CoinGate

These `Math.random() < 0.5` calls exist in game.js but have no `CoinGate.push()` or `Anim.coinFlip()`. They fire silently.

| Mechanic | Function | Line | Context |
|----------|----------|------|---------|
| Grolk's Bloodthirst | `maybeApplyGrolkCaptureHeal()` | 1833 | Attacker heals 1 HP on capture; coin should appear above attacker |
| Barbed Gauntlets (Archmage multi path) | `resolveArchmageMultiAfterHarlundPrompt()` area | ~2170 | Second Barbed Gauntlets code path; same treatment as main path |
| Reinforced Barricade (Archmage multi) | `continueArchmageMulti()` | ~5422 | Archmage's Tome hits multiple targets; each can be blocked by Barricade |
| Paralyzing Vines (Teleport Boots path) | `doTeleportMove()` | 3978 | Separate Paralyzing Vines check for teleport moves; same treatment as doMove path |

**How to wire:** Follow the same pattern as any other `CoinGate.push()` call — compute `heads`, call `CoinGate.push(heads, player, col)` immediately after, then use the result in the existing if/else. The gate handles the rest.

---

## Known gaps — item consume animation not wired

`Anim.itemConsume(handCardEl)` is only wired for 3 item functions. The remaining single-use items silently remove themselves from the hand. The pattern for each is identical:
1. Capture the hand card element *before* the splice: `const handCardEl = Anim.captureHandCard(state.currentPlayer, t.handIndex);`
2. After `renderTurnUI()` and `renderBoard()`: call `Anim.itemConsume(handCardEl);`

| Function | Line | Item |
|----------|------|------|
| `applyRevealingLight()` | ~4751 | All revealing lantern-jar |
| `applyTangleVineBola()` | ~4770 | Tangle-Vine Bola |
| `applyCorrosivePhial()` | ~4795 | Corrosive Phial |
| `applyObscuringBomb()` | ~4820 | Obscuring Bomb |
| `applyTectonicSpike()` | ~4961 | Tectonic Spike |

Gear equip (`applyEquipArmor`) and terrain placement (`applyPlaceTerrain`) are handled separately by `Anim.gearEquip()` and `Anim.terrainEquip()` — those are already wired. Do not add `itemConsume` to those.

---

## CoinGate interaction edge cases to be aware of

**Capture arc during coin spin:** `Anim.unitCapture()` creates a proxy in `#theater-layer` immediately when called (inside `applyDamage`, before `state.board[p][c] = null`). Since the theater layer is not touched by `renderBoard()`, the proxy flies to the discard pile *while the coin is still spinning*. After the gate flushes, the board renders the empty slot. The sequence the player sees: attack lunge → coin appears → capture arc plays simultaneously → coin lands → board reveals final state. This is intentional and acceptable.

**Game over during coin spin:** If `checkGameOver()` returns a winner while the gate is active, `showGameOver()` and `renderBoard()` are called but buffered. The game over screen will appear after the coin completes. Verify this looks correct.

**CPU turn sequencing:** `maybeScheduleCpuTurn()` is called at the end of `renderBoard()`. Since `renderBoard()` is buffered by CoinGate, the CPU's next step is automatically delayed until after the coin. This is correct behavior.

---

## Anim function reference (all in `game.js` starting at line 162)

| Function | Fires | Animates |
|----------|-------|---------|
| `Anim.unitSelected(p, col)` | After `renderBoard()` | `.unit-tile` — scale+brightness pulse |
| `Anim.captureMoveState(p, from, to)` | Before state mutation in `doMove()` | Returns a token |
| `Anim.animateMove(token)` | After `renderBoard()` in `doMove()` | `.unit-tile` — FLIP slide |
| `Anim.attack(attP, attC, defP, defC)` | At start of `resolveCombat()` | `.slot` — lunge + shake |
| `Anim.damageShake(p, col)` | Inside `flashDamageSlot()` | `.slot` — horizontal shake |
| `Anim.coinFlip(heads, p, col, onLand, onComplete)` | Via CoinGate or directly | Theater Layer `#theater-coin` |
| `Anim.ownReveal(p, col)` | After `renderBoard()` | `.unit-card__img-wrap` — injected overlay fade |
| `Anim.cpuReveal(p, col)` | Before `state.board = null` in `applyDamage()` | Theater Layer proxy — accordion flip |
| `Anim.gearEquip(p, col)` | After `renderBoard()` in `applyEquipArmor()` | `.unit-mini-card--gear` — slide from above |
| `Anim.terrainEquip(p, col)` | After `renderBoard()` in `applyPlaceTerrain()` | `.unit-mini-card--terrain` — slide from above |
| `Anim.captureHandCard(player, idx)` | Before `hand.splice()` | Returns DOM element (capture only) |
| `Anim.itemConsume(handCardEl)` | After `renderBoard()` | Theater Layer proxy — arc to item discard |
| `Anim.terrainPulse(p, col)` | Inside `resolveCombat()` after terrain coin | `.slot` — brightness flash |
| `Anim.veteranPulse(p, col)` | Inside veteran functions | `.slot` — scale pulse |
| `Anim.spotlightStart(p, col, onReady)` | In `beginAttackAgainstTarget()` on Wardstone | `#theater-spotlight` — amber glow |
| `Anim.spotlightEnd()` | In `doWardstoneUse()` and `doWardstoneNo()` | Fades out spotlight |
| `Anim.bestiaryBanner(faction, effect)` | In `applyBestiaryRevealNow()` | `#theater-banner` — enter/hold/fade |
| `Anim.unitCapture(p, col)` | Before `state.board[p][c] = null` in `applyDamage()` | Theater Layer proxy — arc to unit discard |
| `Anim.unitPlacement(p, col, delayMs)` | After `renderBoard()` in `placeUnit()` / `placeAllRandomly()` | `.unit-tile` — slide from below |
| `Anim.reorderEntry(p, col)` | In `beginArdanVeilstepReorder()` | Overlay fade-in over acting unit |
| `Anim.captureReorderSwap(p, colA, colB)` | Before state swap in `doObscuringSwap()` | Returns token |
| `Anim.animateReorderSwap(token)` | After `renderBoard()` in `doObscuringSwap()` | Both `.unit-tile` slide simultaneously |
| `Anim.reorderExit(p, col)` | In `doDoneObscuringReorder()` | Overlay fade-out |
| `Anim.cardDraw(player)` | In `animateCardIntoHand()` | Last `.hand-card` — slide from deck direction |

---

## Where to find key call sites

| What to find | Search term |
|-------------|-------------|
| All CoinGate.push() calls | `grep -n "CoinGate.push" game.js` |
| All Anim.* calls in game logic | `grep -n "Anim\." game.js | grep -v "^[[:space:]]*//"` |
| Unwired coin flips | `grep -n "Math.random() < 0.5" game.js` — compare against CoinGate.push list |
| Item consume gaps | `grep -n "hand\.splice.*handIndex\|hand\.splice.*t\.handIndex" game.js` |

---

## Testing workflow

1. Run `python3 -m http.server 8080` from the project root, open `http://localhost:8080`
2. Keep browser DevTools → Console open — any GSAP errors appear immediately
3. Use `feature specs/Phase2-Testing-Guide.md` as the checklist
4. For coin flips: verify board stays frozen while coin spins, log is empty, then everything appears together after coin fades
5. For combat animations: verify lunge direction (P1 attacks upward = slot moves up; CPU attacks downward = slot moves down)
6. Watch for slots stuck in a translated position after animation — means a `clearProps` wasn't called on `g.set()`
