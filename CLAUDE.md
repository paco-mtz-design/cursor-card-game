# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the game

Open `index.html` directly in a browser (no build step, no server required). For best results use a local server to avoid CORS issues with assets:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

There are no tests, no linter config, and no package manager. All code ships as plain files.

## Architecture

The entire game is a single-page application with no framework and no bundler.

### File responsibilities

| File | Role |
|------|------|
| `index.html` | All markup: board, modals, setup flow, debug drawer, action buttons |
| `style.css` | All styles. No preprocessor. CSS custom properties used for card sizing (`--hand-card-height`, `--hand-card-width`, etc.) |
| `data.js` | Static data only — `CHARACTERS` array, item deck spec, terrain/gear/promotion constants. Loaded before `game.js`. |
| `cpu.js` | CPU policy module. Exposes `window.TacticlashCpu` with `getProfile()`, `scoreCandidate()`, `chooseBestCandidate()`. Loaded before `game.js`. |
| `game.js` | All game logic (~5 000+ lines). Single IIFE. Reads from `window.TacticlashCpu`. |

### `game.js` internal structure

Everything lives inside one IIFE. At the top: DOM refs captured once on load. Below that, in rough order:

1. **State** — `getInitialState()` returns the canonical blank state object; `let state = getInitialState()` is the single mutable store. `startNewGame()` / `doStartNewGame()` reset it.
2. **Logging** — `log(message)` appends to the DOM log and pushes the raw (unredacted) message to `state.rawLogEntries[]`. `redactHiddenCpuInfo()` masks CPU hidden units/items for display only.
3. **Rendering** — `renderBoard()`, `renderTurnUI()`, `renderScoreMarkers()`, etc. are pure DOM writers called after every state mutation. `renderBoard()` also calls `maybeScheduleCpuTurn()` at its end.
4. **Game flow** — `startOfTurn()`, `endTurn()`, `checkGameOver()`, `showGameOver()`.
5. **Combat** — `resolveCombat()` → `applyDamage()`. Damage flash (`flashDamageSlot()`) is triggered inside `applyDamage()`.
6. **Items / gear / terrain** — `apply*()` family of functions, one per item type.
7. **Veteran abilities** — Inline within combat resolution and turn hooks; keyed off `cell.unit.veteranBuff`.
8. **Seer's Bestiary** — `getBestiaryEffectsForUnit()`, `queueBestiaryRevealIfNeeded()`, `applyBestiaryRevealNow()`.
9. **CPU opponent** — `maybeScheduleCpuTurn()` → `runCpuTurnStep()`. Each action step (select unit, move, attack, item use) announces intent, stores a closure in `state.cpuPendingExecute`, and shows a "Continue →" button. `triggerCpuPendingStep()` is the single dispatch point called by both the button and (optionally) an auto-fire timer.
10. **Log export** — `buildLogText()` / `downloadGameLog()` produce a timestamped `.txt` file. The "New Game" button guards against mid-game resets via a save-prompt modal.
11. **Event listeners** — All wired at the bottom of the IIFE.

### State shape (key fields)

```
state.phase            — 'idle' | 'setup_goal' | 'setup_coin' | 'setup_place_p1' | 'setup_place_p2' | 'playing'
state.board            — { 1: [cell|null ×5], 2: [cell|null ×5] }   (player 1 = bottom row)
state.terrain          — { 1: [name|null ×5], 2: [name|null ×5] }
state.currentPlayer    — 1 | 2
state.actionStep       — 'use_items' | 'select_unit' | 'move' | 'attack'
state.selectedUnit     — { player, column } | null
state.p1Captures / state.p2Captures
state.captureGoal      — 10 | 15
state.gameMode         — 'cpu' | 'manual'
state.cpuDifficulty    — 'easy' | 'normal'
state.rawLogEntries    — string[]   (unredacted; used for log export)
state.cpuAnnouncing    — bool; blocks maybeScheduleCpuTurn() while Continue button is shown
state.cpuPendingExecute — function | null; the action waiting for Continue
```

A `cell` object in `state.board` looks like:
```
{ unit: { name, class, level, veteranBuff? }, faceUp: bool, damage: number,
  gear: itemObj|null, bonusGear: itemObj|null, terrain: string|null, paralyzed: bool, … }
```

### CPU opponent pattern

`cpu.js` scores action candidates against weighted dimensions (threatReduction, counterRisk, boardControl, etc.). `game.js` builds candidates, calls `window.TacticlashCpu.chooseBestCandidate()`, then executes.

The turn-step flow in `runCpuTurnStep()`:
1. Set announcement text (`setCpuActionText`) and slot highlights (`addCpuHighlight`).
2. Store execution closure in `state.cpuPendingExecute`.
3. Set `state.cpuAnnouncing = true`, call `renderTurnUI()` — this surfaces the "Continue →" button.
4. Player clicks Continue → `triggerCpuPendingStep()` clears announce state, runs the closure.
5. Closure calls the game action function (e.g. `onSelectUnit`, `doMove`, `beginAttackAgainstTarget`), which internally calls `renderBoard()` → `maybeScheduleCpuTurn()` → next step.

### Asset conventions

- `assets/units/full-cards/` — unit card images, filename matches unit name (lowercase, hyphens).
- `assets/items/` — item card images.
- `assets/bestiary/` — bestiary card images, numbered `1 – Name.png` through `12 – Name.png`.
- `assets/factions/` — faction badge images.

## Key documents

| Document | Purpose |
|----------|---------|
| `ROADMAP.md` | Phase order and status (Phases 1–19). Current active work is **Phase 18** (CPU opponent, branch `cpu-opponent`). |
| `DEV_LOG.md` | Shipped milestones and known deferred issues. Newest entries first. |
| `RULES.md` | Player-facing rulings for edge cases (counter order, veteran stacking, terrain interactions). Update here when prototype behavior is agreed. |
| `game documentation/` | Original design sheets for items, bestiary, and gameplay manual. Source of truth for intended rules before prototype encoding. |

## Development conventions

- **No build step.** Edit files and reload the browser.
- **State is the single source of truth.** Never mutate the DOM to track game logic; always mutate `state`, then call the relevant `render*()` function.
- **`renderBoard()` has a side effect:** it calls `maybeScheduleCpuTurn()` at its end. Be aware of this when calling it mid-action.
- **Log everything meaningful** via `log()`. The saved game log is the primary debugging artifact.
- **Commit style:** `type(scope): short subject` + detailed body. Scopes used: `ui`, `cpu`, `log`, `phase-N`, `assets`, `fix`, `chore`.
- **Branch:** active CPU/UX work is on `cpu-opponent`; `main` is the stable baseline.

## Who I am

I'm a Product Designer, not a developer. I have a solid understanding of 
product thinking, UX, design systems, and user flows. I understand basic 
programming principles and can read code at a high level, but I can't write 
functional code myself.

## How we should communicate

- Describe plans and changes from a **product and design perspective** first: 
  what the user will experience, how it affects the interface, what the 
  interaction feels like.
- Avoid leading with technical implementation details. If technical depth is 
  needed, put it after the product-level explanation.
- When explaining what you're about to do, frame it as: what changes for the 
  user, which part of the UI is affected, and why.
- Use plain language. Analogies are welcome. Code snippets are fine as 
  supporting context but shouldn't be the main way you explain things.
- When I'm in plan mode, structure the plan around user-facing outcomes and 
  design decisions, not just file changes and functions.
- When I introduce a new idea, **engage me in a conversation before drafting 
  any detailed plan**. Ask clarifying questions about my vision and 
  requirements first. Don't elaborate complex multi-feature plans on a 
  guess — you'll burn tokens chasing the wrong design. Only build a detailed 
  plan after I've given you a clear signal that we share an understanding of 
  the goal. When in doubt, ask.