# Continuation Spec — Tacticlash, end of `start-sequence` branch
*Handoff prepared: 2026-05-06 | Resume in a new chat using `NEXT_SESSION_PROMPT.md`*

---

## Project Overview

Tacticlash is a plain-HTML/CSS/JS two-player card strategy game (no build step, no framework, no bundler). Two players place units on a 5-slot board row and take turns attacking, moving, and using items. One player can be a CPU opponent.

All code ships as plain files. `game.js` (~7 100 lines, single IIFE) holds all game logic, the animation layer, and the new start-sequence flow. `cpu.js` is the CPU policy module. `data.js` is static data. `style.css` is the only stylesheet. `index.html` is all the markup.

Run with:
```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

There is no build step, no test runner, no linter config, and no package manager.

---

## Branch state

- **Branch:** `start-sequence` — clean, all changes committed.
- **Status:** ready for review / merge.
- **What's on this branch vs `main`:** A complete refactor of the start sequence (start screen → placement → coin → board entrance), prioritised outside the planned roadmap between Phase 18 and Phase 17. **Single commit:** `1d7a83c`.

### Commit unique to this branch

| Commit | What |
|--------|------|
| `1d7a83c` | `feat(start-sequence): player-grade start sequence in three stages` — Stage 1 parchment start screen + debug-toggle, Stage 2 reorder placement + auto coin flip, Stage 3 chrome entrance choreography. Spec + Claude Design source bundle checked in under `feature specs/`. |

### Files touched on this branch

| File | What changed |
|------|-------------|
| `game.js` | Removed legacy `placeUnit`, `finishPlacementForPlayer`, `renderPlacementStep`, `handlePlacementHandClick`, `onFlipCoin`, `onAfterCoin`. Added `dealUnitDecks`, `enterPlacementForP1/P2`, `autoPlaceCpuP2`, `enterCoinFlipStep`, `transitionToPlaying`, `onLockInPlacement`, `doPlacementSwap`, `runBoardEntrance`, `showStartScreen`/`hideStartScreen`, `applyDebugVisibility`, `syncStartScreenVisuals`, `updateBeginDuelSummary`, `getSelectedGoalFromStartScreen`, `setSealToggle`, `showPlacementSubtitle`/`hidePlacementSubtitle`. Three new entries in the `Anim` namespace (§25): `boardSidebarEntrance`, `boardBarsEntrance`, `boardDecksEntrance`. New state fields: `debugControlsEnabled`, `placementReorder`. `placeAllRandomly` extended with `{ faceUp, onComplete }` opts. `highlightSlots` placement branch added. `applyPlacementUnitPick` refactored to swap on the board. `openPlacementUnitPickList` reads `state.placementReorder.selectedCol`. |
| `index.html` | Added `<div id="start-screen">` (parchment markup), Cinzel/Crimson Pro/JetBrains Mono fonts in `<head>`, `body class="start-screen-active"` for first-paint correctness. Added `<p id="placement-title">` + `<p id="placement-subtitle">` above the board and `<div id="placement-actions">` below the board (with `#btn-placement-lock-in` and the existing replace-with-pick controls). Removed `#setup` overlay (with `#setup-coin` and `#setup-place`), `#btn-place-randomly`, `#placement-hand-filter`, `#placement-hand`. Hidden form inputs preserved inside `.start-screen__hidden-form` so existing `game.js` reads still work. |
| `style.css` | New parchment start-screen rules (`.start-screen`, `.title-plate`, `.card-frame`, `.segmented`, `.seal-toggle`, `.dev-notebook`, `.begin-duel-btn`, `.lore`). `body.start-screen-active` hides `.page-content` via `visibility: hidden`. `body.no-debug` hides the in-game debug controls. `body.in-placement` hides chrome via `display: none` (so the board grid is genuinely centered). New `.placement-title`, `.placement-subtitle`, `.placement-actions`, `.slot--placement-selected` (blue ring + lift). |
| `feature specs/Start sequence UI refactor.md` | New — the product spec. |
| `feature specs/card-duel-game-start-screen/` | New — Claude Design source bundle (README, HTML, JSX, screenshot). |

`cpu.js`, `data.js` untouched.

---

## Architecture quick reference

### State shape additions

```
state.debugControlsEnabled  — bool, default true; per-session only
state.placementReorder      — { selectedCol: number|null }; mirrors state.obscuringReorder
```

Existing fields (`captureGoal`, `useBestiaryRules`, `gameMode`, `cpuCustomPlacementEnabled`, `cpuDifficulty`, `placementPlayer`, `phase`) are unchanged in shape — captures still flow through `onGoalChosen`.

### Phase progression

```
'idle' | 'setup_goal'  → start screen visible (body.start-screen-active)
'setup_place_p1'        → P1 reorder UI (body.in-placement)
'setup_place_p2'        → P2 face-up reorder OR face-down auto-place
'setup_coin'            → "Who goes first?" → coin → result hold → fade
'playing'               → runBoardEntrance → startOfTurn
```

### The new placement / coin / entrance pipeline

| Function | Role |
|----------|------|
| `onGoalChosen(goal)` | Captures all settings, hides start screen, calls `dealUnitDecks()`, then `enterPlacementForP1()`. |
| `dealUnitDecks()` | Shuffles `[...CHARACTERS]` and deals 5 each to `state.p1Hand` / `state.p2Hand`. (Used to live inside `onAfterCoin`.) |
| `enterPlacementForP1()` | Sets phase, adds `body.in-placement`, shows title + subtitle + actions, calls `placeAllRandomly({ faceUp: true })`. |
| `enterPlacementForP2()` | Manual / custom-CPU branch — face-up reorder UI for P2. |
| `autoPlaceCpuP2()` | CPU-default branch — face-down stagger, then `enterCoinFlipStep()` via `placeAllRandomly`'s `onComplete`. |
| `onLockInPlacement()` | Gated by `BeatQueue.afterRender` if a swap is in flight. Branches to P2 setup or coin step. |
| `enterCoinFlipStep()` | Title morphs to "Who goes first?" → 1 s hold → `Anim.coinFlip` → result hold 1 s → fade 320 ms → `transitionToPlaying()`. |
| `transitionToPlaying()` | Flips all cells `faceUp = false`, resets per-game state (item decks, captures, terrain, etc.), un-hides chrome elements, calls `runBoardEntrance` whose `onComplete` fires `startOfTurn()`. |
| `runBoardEntrance(onComplete)` | FLIP-captures `.board__center` rect, pre-sets chrome off-screen, removes `body.in-placement`, applies invert delta to `.board__center`, runs Wave A (sidebar + board glide in parallel) → Wave B (bars vertical) → Wave C (decks from right). Bracketed by `BeatQueue.open()` / `close()`. |
| `doPlacementSwap(player, colA, colB)` | Captures rects, swaps board cells, re-renders, runs `Anim.animateReorderSwap`. Mirrors `doObscuringSwap`. |

### Three new `Anim` entries (§25, `game.js` ~line 894 region)

- `Anim.boardSidebarEntrance(onComplete)` — `#board-right` from `x: 280` to `x: 0`, 0.5 s, `power2.out`.
- `Anim.boardBarsEntrance(onComplete)` — `#item-hands-p2` from `y: -180`, `#item-hands-p1` from `y: 180`, parallel, 0.45 s.
- `Anim.boardDecksEntrance(onComplete)` — `.board__decks` from `x: 180` to `x: 0`, 0.45 s.

**Critical:** all offsets are pixel-valued. `xPercent` / `yPercent` resolve to 0 on a `display: none` element (computed size is 0), so the off-screen pre-position would never push the element off-screen.

### Debug-toggle (`body.no-debug`)

`applyDebugVisibility()` toggles `body.no-debug`, which is the single CSS gate for:

- `#item-draw-debug` (in-game replace-draw section)
- `#btn-placement-replace-with-pick` + `#placement-unit-pick-wrap` (placement debug pick)
- `.bestiary__debug` (the per-column SELECTs in the Bestiary modal)

`#btn-save-log` and the mid-game save-log modal are never hidden.

### First-paint correctness

`<body class="start-screen-active">` is set in HTML, and `<div id="start-screen">` ships *without* the `hidden` attribute. So the very first paint after a refresh shows the parchment screen — no flash of the empty board behind it. JS only flips both off when the user clicks "Begin Duel".

---

## Known tech debt (deferred)

Carried over from Phase 18 (none of these were touched on this branch):

1. **Multi-target damage sequencing** — Archmage's Tome AOE, Iron Maiden retaliation, Pack Shield bounceback, Magic Grenade rattle their targets in parallel. Agreed direction: sequential resolution. Implementation idea logged in the §24 entry of `DEV_LOG.md`.
2. **Reinforcement-from-deck animation** — vacated slot fills face-down with no draw animation; best handled inside a broader "card draw from deck" pass.
3. **Harlund / Archmage multi-hit visual interleaving** — multi-target combat resolution is synchronous, producing a burst of overlapping animations BeatQueue can't fully interleave. Needs an async step loop.

New (from this branch):

4. **`state.debugControlsEnabled` does not persist across reloads.** By design (per the user's call), but trivial to add a `localStorage` read/write in `onGoalChosen` + DOMContentLoaded if cross-session memory is wanted later.
5. **Stage 3 entrance offsets are tuned for current bar heights.** Y offsets of ±180 px assume `--hand-card-height: 150 px`. Revisit if that changes substantially.

---

## Communication / collaboration

Paco is a Product Designer, not a developer. Conventions captured in `CLAUDE.md`:

- Lead with product / design framing, technical detail second.
- For new ideas, **converse first, ask clarifying questions**, only draft a detailed plan once shared understanding is confirmed.
- Commit style: `type(scope): short subject` with a detailed body. This branch used scope `start-sequence`.
- QA stages incrementally — for this work the user explicitly asked to ship Stages 1, 2, 3 in separate QA passes. They confirmed each stage before the next.

---

## Where to look first as the next agent

1. `CLAUDE.md` — project conventions and how to communicate with Paco.
2. `ROADMAP.md` — phase status. Phase 18 done, **Phase 17** and **Phase 19** still planned.
3. `DEV_LOG.md` — top entry is this start-sequence refactor with the full surface.
4. `feature specs/Start sequence UI refactor.md` — the spec for what just shipped.
5. `feature specs/card-duel-game-start-screen/` — Claude Design source for the start-screen visual style.
6. `game.js` lines ~126–900 — `BeatQueue`, `CoinGate`, the entire `Anim` namespace including the new §25 entrance functions.
7. `game.js` ~lines 3140–3460 — `doStartNewGame`, `onGoalChosen`, the new placement / coin / entrance pipeline.
