# Continuation Spec — Tacticlash Animation Layer (Phase 2)
*Handoff prepared: 2026-04-26 | Resume this work in a new chat using NEXT_SESSION_PROMPT.md*

---

## Project Overview

Tacticlash is a plain-HTML/CSS/JS card strategy game (no build step, no framework). Two players place units on a 5-slot board row and take turns attacking, moving, and using items. One player is always a CPU opponent. The active branch is `animations`, branched from `main`. All code lives in three files: `game.js` (~6500 lines, single IIFE), `style.css`, `data.js`.

**Run:** `python3 -m http.server 8080` from the project root, then open `http://localhost:8080`.

---

## Session Summary

This session implemented and then extensively debugged the Phase 2 animation layer. A solid working foundation was built, but a fundamental architectural flaw was identified that prevents clean completion without a more holistic redesign.

**What was built and is working:**
- `CoinGate` — buffers `renderBoard`, `renderTurnUI`, and log DOM during coin flip animations. All 15+ coin flip sites are wired.
- `Anim` namespace — 20+ GSAP animation functions (attack lunge, damage shake, coin flip, unit capture arc, CPU reveal flip, gear/terrain equip, card draw, move slide, placement stagger, reorder, spotlight, bestiary banner, item consume arc).
- `_revealPending` deferral queue — when a `cpuReveal` flip is active for a slot, `flashDamageSlot` and `unitCapture` automatically queue themselves to fire after the flip completes.
- `_crossSlotDefer` — cross-slot deferral so that the attacker's capture arc waits for the Lancer's reveal (Nyss scenario).
- `slot--revealing` CSS class — hides the underlying tile DOM during the proxy flip animation.
- **All `cpuReveal` call sites wired** (11 locations): `onSelectUnit`, `resolveCombat` main defender reveal, Lancer counter, Rowka ally, `revealAndParalyze` (Solomon/Chronir), Harlund Pack Shield, CPU action reveal, `applyRevealingLight`, `applyPlaceTerrain` + Divine Light, `continueArchmageMulti`.
- Item consume animations wired for all single-use items.
- Teleport Boots move animation, Place-All-Randomly placement stagger.
- Defender shake correctly deferred (only fires when damage is confirmed, after coins).
- `unitCapture` front art reads from state (not masked DOM img).

**Testing completed (Phase2-Testing-Guide.md):**
- ✅ Group A (§3 Attack, §5 Counter-attack) — working
- ✅ Group B (§2 Move slide, §16 Placement stagger) — working
- ✅ Group C (Coin flips — setup, terrain, counter, veteran) — working
- ⚠️ Group D (§7 Own reveal, §8 CPU reveal) — mostly working, see issues below
- ❌ Groups E, F, G — not yet tested

---

## The Architectural Problem (WHY the next session exists)

The root issue is a **fundamental impedance mismatch** between synchronous game state and asynchronous animation display. The current architecture:

- Mutates game state **immediately and synchronously** (damage, captures, HP counters, log entries, turn progression, item draws)
- Fires animations as **fire-and-forget side effects** that try to react to state that's already fully resolved
- Has `CoinGate` as a narrow buffer for coins only — all other animation types lack this protection

The consequence: HP counters appear during reveal flips. The game log shows "Harlund took damage / P2's turn / P2 drew an item" while Barrox is still mid-flip. The next CPU turn can visually begin before capture arcs finish. Every combination of effects that overlaps in time produces artifacts.

**Patches applied this session** address individual symptoms but keep reintroducing the underlying stale-DOM / wrong-order problems. The right solution is to redesign the sequencing foundation.

---

## The Proposed Solution: Animation Beat Queue

Replace the current fire-and-forget model with a **sequenced beat queue**. The concept:

1. Game logic produces a list of **beats** — discrete visual moments (lunge, reveal, coin, shake, arc, board-update)
2. Beats are queued rather than fired immediately
3. Each beat holds ALL display updates (renderBoard, renderTurnUI, log, HP counters) until its animation completes
4. Beats chain automatically via callbacks — the next beat starts only when the previous one's animation finishes
5. The current player has a "Continue" button that only appears after the full beat sequence for a turn resolves

This is CoinGate generalised to every animation type. The key insight: display should be **pull-based** (animations pull state onto screen when ready) not **push-based** (state pushes into display immediately).

**Likely implementation approach:**
- Extend `CoinGate` into a general `AnimGate` that any animation type can open/close
- Or: a simple array-based `BeatQueue` with `push(animFn, onComplete)` and `flush()` that drains sequentially
- Each animation function returns a promise or calls `done()` when it finishes
- `renderBoard`, `renderTurnUI`, log, and score updates are only called by `BeatQueue.flush()`, never directly from game logic

---

## Current Known Bugs (open at handoff)

### High priority
1. **Duplicate card visible during cpuReveal Phase 2** — When `slot--revealing` is removed at Phase 1 end (edge-on moment) and the tile is patched to front art, during Phase 2 expansion both the proxy AND the patched tile are visible with slightly different visual elements (tile has HP markers, gear badges; proxy is a plain image). The tile looks like a "ghost" underneath the expanding proxy. Root: `slot--revealing` must stay on through Phase 2, but removing it at Phase 2 end with a stale tile reintroduces the face-down flash.

   **Best known fix (not yet applied):** Remove `slot--revealing` AND apply the DOM patch at Phase 2 `onComplete` (when proxy is at full scaleX:1, opacity:1). At that point, the proxy fully covers the tile, so removing the class is visually seamless. Then start the fade — proxy fades while tile (now patched) is visible → crossfade. The DOM patch at Phase 2 end (not Phase 1 end) prevents the duplicate.

2. **Harlund Pack Shield sequence** — Very complex multi-beat sequence with overlapping animations, log entries appearing mid-animation, gear equip animation happening while Barrox is still revealing. Requires the BeatQueue to be properly designed before this can work cleanly.

3. **HP counter / log visible before animations complete** — State display is not gated by animation completion for most sequences (only coins are gated). All state is already resolved and partially visible before the visual sequence plays out.

### Medium priority
4. **`applyRevealingLight` reveals a CPU unit** — calls `cpuReveal(targetPlayer, targetCol)` before `renderBoard()` which is correct, but the tile's initial face-down overlay isn't properly hidden during Phase 1 because the proxy and the stale tile overlap during the early frames.

5. **Lancer counter coin fires simultaneously with Lancer reveal** — cpuReveal fires BEFORE `CoinGate.push` for the counter coin, so `startFlip` runs immediately and then the coin starts. They overlap. The DOM patch partially helps but the timing is not fully correct.

6. **`applyRevealingLight` on P1 face-down unit** (2-player mode) — `isCpuPlayer` returns false so no reveal animation fires. `ownReveal` needs to be called after `renderBoard` but the current code structure doesn't support this without refactor.

### Low priority / deferred
7. **Ever Watching Eye bestiary** — Sets `faceUp = true` inside `applyBestiaryBoardStateMaintenance()` which runs during `renderBoard()`. Cannot animate from there without structural refactor.
8. **Divine Light reveals during doMove / doTeleportMove** — No animation wired for units landing on Divine Light terrain during movement.
9. **P1 face-down unit attacked** — `ownReveal` is not called; the P1 unit's tile just snaps face-up on `renderBoard`. Low-frequency scenario but incomplete.

---

## Architecture Reference

### Key symbols in game.js

| Symbol | Approx line | Purpose |
|--------|-------------|---------|
| `EventQueue` | 102 | CPU turn gating (Phase 1 legacy) |
| `CoinGate` | 126 | Display buffer during coin flip sequences |
| `Anim` | 168 | All GSAP animation functions |
| `_revealPending` | 173 | Per-slot deferral queue for cpuReveal |
| `_crossSlotDefer` | 175 | Cross-slot deferral (e.g. attacker waits for Lancer reveal) |
| `renderBoard()` | ~2517 | Gated by CoinGate; side effect: calls `maybeScheduleCpuTurn()` |
| `renderTurnUI()` | ~3700 | Gated by CoinGate |
| `flashDamageSlot()` | ~5093 | CoinGate-aware + reveal-pending-aware shake trigger |
| `applyDamage()` | ~5015 | Central damage handler; also calls cpuReveal and unitCapture |
| `resolveCombat()` | ~5097 | Full combat resolution including counters, veteran effects, terrain |

### `Anim.cpuReveal(player, col)` — how it works

1. Creates a theater-layer proxy div at the slot's exact DOM position
2. Sets `_revealPending[key] = []` immediately (before CoinGate branch)
3. If CoinGate active: defers `startFlip` via `bufCapture`; proxy hidden
4. `startFlip()`: adds `slot--revealing` to slot, Phase 1 squeezes (back→edge-on)
5. At edge-on: patches tile DOM (img src, card class) to show front art, removes `slot--revealing`
6. Phase 2 expands (front art on proxy, same art now on tile)
7. Phase 2 end: starts fade
8. Fade end: removes proxy, drains `_revealPending[key]` (shake, capture arc fire in order)

**Known issue:** Step 5 patches the tile but the tile has HP markers, gear badges, etc. that the proxy doesn't have. During Phase 2 expansion, the tile is partially visible alongside the proxy, creating a "duplicate" effect.

### `Anim.afterReveal(player, col, fn)`
Returns true and queues `fn` if a reveal is pending for that slot. Also checks `_crossSlotDefer` for cross-slot relationships. Used by `flashDamageSlot` and `unitCapture`.

### `Anim.deferForReveal(player, col, revealPlayer, revealCol)`
Registers a cross-slot deferral: animations for `(player, col)` will wait for the reveal on `(revealPlayer, revealCol)`.

---

## Files Changed This Session

| File | What changed |
|------|-------------|
| `game.js` | Full animation layer (Anim namespace, CoinGate, all wiring) |
| `style.css` | `.slot--revealing` rule; `.theater-proxy`; coin/spotlight/banner styles |
| `DEV_LOG.md` | Session summary entry added |
| `feature specs/Phase2-Continuation-Spec.md` | Old spec (from prior session) — superseded by this file |

---

## Design Decisions

- **No build step, no framework, no bundler.** All code is plain JS in one IIFE.
- **State is the single source of truth.** Never mutate DOM to track game logic.
- **GSAP** (loaded via CDN in index.html) is the animation library. All Anim functions use `window.gsap`.
- **Theater Layer** (`#theater-layer`) is an absolutely positioned overlay over the board where proxy elements live. Proxies are created, animated, then removed — they never affect game state.
- **CoinGate is a display buffer, not a state buffer.** State mutations always happen immediately and synchronously. Only the visual render is held back.
- **`renderBoard()` has a side effect:** calls `maybeScheduleCpuTurn()` at its end. Be careful about calling it mid-action.
- **Commit style:** `type(scope): short subject` with detailed body. All animation commits use scope `phase2`.

---

## Key Files to Read First

1. `game.js` lines 100–650 — `EventQueue`, `CoinGate`, full `Anim` namespace
2. `feature specs/Phase2-Testing-Guide.md` — testing checklist by group
3. `feature specs/CPU-Interaction-Feature-Spec-Phase2.md` — original animation spec
4. `DEV_LOG.md` — history of what shipped and what's deferred
5. `CLAUDE.md` — project conventions and architecture overview

---

## Next Steps (ordered)

1. **Design the Animation Beat Queue** — architecture doc first, then implement. Key questions:
   - Does `BeatQueue` replace `CoinGate` or wrap it?
   - How does it interact with the CPU `continue` button flow?
   - How are multi-beat sequences (reveal → shake → arc) expressed?

2. **Implement BeatQueue** — replace fire-and-forget with sequenced beats

3. **Fix duplicate card during Phase 2** using the BeatQueue's display-gating (this issue goes away naturally when all display is held until the beat completes)

4. **Revisit Harlund** — the full sequence (original target reveal → Harlund reveal at original col → slide swap → shake) should be expressible as 4 beats

5. **Resume Phase2-Testing-Guide.md from Group A** — full regression pass once the foundation is solid, then continue through Groups E, F, G

6. **Merge `animations` branch to `main`** when testing guide passes
