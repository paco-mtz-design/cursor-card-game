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

## Interactive Manual + start-screen and header entry points

**Status:** Shipped. Branch `game-manual` (now deleted), merged via PR #11, single commit `d88228b`. Out-of-roadmap polish prioritised after the `card-index` merge and before Phase 17.

### What shipped

**Standalone manual page (`manual/index.html`).** A self-contained React + Tailwind interactive manual that walks players through classes, items, terrain, bestiary, and gameplay flow. Cream `#F7F5F0` background, Space Grotesk display type, Inter body, distinct from the game's ink-and-paper aesthetic. Loads React 18 + Babel-Standalone + Tailwind via CDN — no build step, matching the project's "edit and reload" convention. Three JSX files live alongside the HTML: `tacticlash-card.jsx` (UnitCard / ItemCard with real-art lookups), `manual-nav.jsx`, `manual-app.jsx` (sections + section data). All image paths inside the JSX are relative (`assets/units/...`), so the folder is fully portable.

The manual ships with its own asset tree under `manual/assets/{units,items,bestiary,heralds}/` — 28 PNGs total. Deliberately self-contained rather than reusing the main game's `assets/` folder: the manual uses different framing/crops and may diverge stylistically over time; coupling to game-side image-name conventions would create drift risk.

**Start-screen entry point.** A new third corner anchor (`.start-screen__corner--bottom-right.start-screen__corner--link`) sits in the previously-empty bottom-right corner of the parchment frame. Renders a small book icon + "Learn how to play" label in the same muted ink tone as the existing `Edition I` (top-left) and `v0.4 · pre-alpha` (top-right) corner marks, so it reads as a quiet help affordance rather than competing with the *Begin Duel* CTA. Visible focus state (`outline: 1px solid #1d1a14`, offset 6px) for keyboard users.

**In-game header entry point.** A new `.btn.btn-manual` anchor is prepended to `.header__toolbar`, so the toolbar now reads `Learn how to play | Card Index | Seer's Bestiary | New game`. Icon + label flex layout (small book glyph distinguishes it from the data-browsing buttons). Always visible while the header is rendered — same lifecycle as Card Index. No conditional hiding during CPU "Continue →" announcements or bestiary reveals; mid-turn access is non-destructive because clicking opens a new tab.

### Implementation pattern

Both entry points are plain `<a target="_blank" rel="noopener noreferrer">` anchors rather than `<button>` + JS. This buys native middle-click support, "open in new window" context menus, and keyboard-Enter behaviour for free, with **zero** JS wiring. The player's in-progress game state (selected unit, dev drawer, CPU "Continue →" prompt, etc.) is guaranteed untouched on the original tab.

### Files touched

- **Added:** `manual/` directory (HTML, 3 JSX files, 28 assets across `units/`, `items/`, `bestiary/`, `heralds/`).
- **Added (under `feature specs/`):** `Tacticlash Game Interactive Manual/` retained as the design archive — includes the HTML/JSX prototype, the `Tacticlash Interactive Manual - Claude Design Brief.md`, the draft `Tacticlash Gameplay Manual 2.2 DRAFT.md`, and original `uploads/`.
- **Modified:** `index.html` (start-screen corner anchor, header toolbar anchor — ~10 net inserts). `style.css` (~28 net inserts: `.start-screen__corner--bottom-right`, `.start-screen__corner--link` hover/focus, `.start-screen__manual-icon`, `a.btn` baseline, `.btn-manual` + `.btn-manual__icon`).
- **Untouched:** `game.js`, `cpu.js`, `data.js`. Zero game-logic risk.

### Tech debt / notes for next agent

- **Manual content is a v2.2 draft snapshot.** The JSX hard-codes class profiles, item descriptions, and gameplay walkthrough text that haven't been reconciled against current implementation behaviour. If rules change (new items, veteran adjustments, terrain rebalances), the manual will drift silently. No tests catch this. Refresh pass needed when rules evolve.
- **"Babel-Standalone in production" console warning.** Accepted as a known cost for the no-build workflow. Replacing with a pre-built bundle would silence it but introduces a build step.
- **Asset duplication.** The manual carries its own copy of unit/item card art under `manual/assets/`, separate from the main game's `assets/`. Intentional (see "What shipped"), but means visual updates to character cards need to be made in both places to stay in sync.
- **No game-over hook.** The manual is reachable from the start screen and from the in-game header, but not from the game-over modal — a natural "want to learn more?" moment after a first match. Easy to add later; deferred from this branch's scope.

---

## Card Index + item artwork variations

**Status:** Shipped. Branch `card-index`, three commits (`b949006`, `b2c0b35`, `77322b5`). Out-of-roadmap polish prioritised between the `start-sequence` merge and Phase 17.

### What shipped

**Card Index modal.** A new "Card Index" button in the top bar (immediately left of Seer's Bestiary) opens a large modal — ~96 vw × 92 vh — listing every card in the game, organised in three sections: Units (32) → Items (62 with duplicates on / 24 with duplicates off) → Bestiary (13). Cards render as plain card art (no captions, no game-state badges) at a fixed 260 px width matching the discard pile, so the in-card copy stays comfortably readable. The modal is purely browse-only — no game-state interaction, no logging, no turn impact.

A filter rail at the top has chip-style toggles. **Type** (Units / Items / Bestiary) is always visible; sub-filter groups appear/disappear based on which Types are active, with a smooth GSAP height+opacity transition so the rail grows and shrinks rather than jumping. **Show duplicates** toggle (on by default; off collapses items to their 24 unique entries). **Clear filters** link. Each chip group is multi-select; an empty set means "no filter on this dimension" (the standard chip-filter mental model). Filters live on `state.cardIndexFilters` so they persist across close/reopen within a match and reset on a new game via `getInitialState()`.

Sub-filters per Type:
- **Units** → Class (Brawler / Lancer / Shooter / Caster), Faction (the 4 factions), Experience (Rookie / Veteran).
- **Items** → Category (Armor / Accessory / Legendary Weapon / Single-use / Terrain).
- **Bestiary** → Buff / Debuff. Per Paco's call, Iron Maiden = Buff (defensive but proactively benefits the holder), Ever-Watching Eye = Debuff (always face-up is a restriction in this game's threat model). Mapping in `BESTIARY_TAG_MAP`.

Card rendering reuses the discard modal's `.card-thumb` pattern verbatim — `<div class="card-thumb"><img src="…"/></div>`. Image paths come from the existing `getUnitCardImagePath` / `getItemCardImagePath` helpers and the `imagePath` baked into `BESTIARY_CARD_DEFS`. Items render in the spec's order (Armor → Accessory → Legendary → Single-use → Terrain) via a hardcoded `CARD_INDEX_ITEM_ORDER` array. Section titles include the live count.

The 260 px fixed width (second commit, `b2c0b35`) replaces the initial responsive grid (`auto-fill, minmax(160px, 1fr)`), which packed up to 7 cards per row and made the in-card copy too small to read.

**Item artwork variations.** Some items now ship with multiple illustrations — same name, same effect, different art for flavor:

| Item | Variations | Distribution across deck |
|------|------------|--------------------------|
| Light Armor | 4 (A, B, C, D) | A, A, B, B, C, C, D — 7 copies |
| Healing Potion | 4 (A, B, C, D) | one per copy — 4 copies |
| Magic Grenade | 2 (A, B) | one per copy — 2 copies |
| Wardstone Bracelet | 2 (A, B) | one per copy — 2 copies |

Variation is fixed at deck-build time (data.js: `ITEM_VARIATIONS` table) and travels with the card through draw → hand → equipped gear / terrain → discard. A drawn Healing Potion keeps the same illustration through use and into the discard pile; two Healing Potions in the same hand show different art. The `ITEM_VARIATIONS` array length must equal the item's `ITEM_DECK_SPEC` quantity — index-by-index zip.

The deck's shape changed from a flat `string[]` of names to `{ name, variation }[]` objects. `buildItemDeck()` zips variations to copies. `drawItem` and `replaceLastDrawWith` now find by name via `findIndex`. Hand items, gear, bonusGear, and terrain objects all carry `.variation`. `getItemCardImagePath(name, variation)` resolves through a new `ITEM_VARIATION_FILENAME_PATTERNS` map (with `{VAR}` placeholder) before falling back to the existing `ITEM_IMAGE_FILENAME_MAP`. Every render call site — hand, gear/terrain mini-cards, unit zoom, item zoom, summoning modal, discard pile, Card Index — passes variation through. `Anim.itemSummon` accepts a 4th variation arg; player click handler reads from `hand[handIndex]`, CPU action reads from `state.p2ItemHand[capturedAction.handIndex]`, Wardstone activation scans `defCell.gear` / `defCell.bonusGear` before `removeGearFromCell`. `openItemZoom` looks up variation from the hand using its existing `handIndex` / `player` args.

In the Card Index, "Show duplicates" ON renders varied items in their actual deck distribution (Light Armor → 7 thumbs in A,A,B,B,C,C,D order). OFF collapses to one entry per unique name; varied items show variation A.

### Asset changes

- **Renamed** (Wardstone variation files normalised from hyphen to en-dash like the others): `Single Use - Wardstone Bracelet - A.png` → `… – A.png`, same for `– B`.
- **Renamed via git** (single-art files become variation A): `Armor - Light Armor.png`, `Single Use - Magic Grenade.png`, `Single Use - Potion.png`, `Single Use - Wardstone Bracelet.png` → `… – A.png` siblings.
- **New variation files:** B/C/D for Light Armor and Healing Potion, B for Magic Grenade and Wardstone Bracelet — 8 net additions plus the renames-to-A. All filenames use the en-dash separator (`–`, U+2013).

### State / function surface added

- `state.cardIndexFilters: { type, unitClass, faction, experience, itemCategory, bestiaryTag, showDuplicates }` — sets (not arrays) for chip groups, plus the boolean toggle. Initialised by `getDefaultCardIndexFilters()` in `getInitialState()`.
- `data.js` constants: `ITEM_VARIATIONS` table.
- `game.js` constants: `BESTIARY_TAG_MAP`, `ITEM_CATEGORY_BY_TYPE`, `CARD_INDEX_ITEM_ORDER`, `CARD_INDEX_FILTER_DEFS`, `ITEM_VARIATION_FILENAME_PATTERNS`.
- `game.js` functions: `getCardIndexFilters`, `getDefaultCardIndexFilters`, `isCardIndexTypeActive`, `getItemCategoryForFilter`, `getCardIndexUnits`, `getCardIndexItems`, `getCardIndexBestiary`, `buildCardIndexThumbHTML`, `renderCardIndexChips`, `toggleCardIndexFilterGroup`, `applyCardIndexGroupVisibility`, `renderCardIndexGrid`, `renderCardIndex`, `openCardIndexModal`, `closeCardIndexModal`, `applyCardIndexFilterChange`, `clearCardIndexFilters`, `itemHasVariations`. Updated signatures: `getItemCardImagePath(name, variation)`, `Anim.itemSummon(name, label, onComplete, variation)`.
- New CSS: `.modal__content--card-index` + the `.card-index` BEM block (`__filters`, `__filter-group`, `__chip` with `aria-pressed`-driven state, `__sections`, `__grid`, `__empty`).

### Files touched

- **Modified:** `index.html` (top-bar button + new modal block), `style.css` (~200 net inserts), `game.js` (~370 net inserts), `data.js` (`ITEM_VARIATIONS` + updated `buildItemDeck`).
- **Added (under `feature specs/`):** `Card index.md` (the product spec).
- **Renamed/added under `assets/items/`:** the 12 variation files described above.
- **Untouched:** `cpu.js`, all combat / Bestiary / veteran logic, the start-sequence pipeline.

### Tech debt / notes for next agent

- **Variation A is a fragile default.** `getItemCardImagePath` falls back to variation `'A'` for varied items called without a variation arg. Correct for current callsites, but if any new item-creation path ever stores a varied item without setting `.variation`, it'll silently render A instead of crashing. A `console.warn` in the helper would catch it cheaply.
- **`ITEM_VARIATIONS` array length must match `ITEM_DECK_SPEC` quantity.** No runtime check. If quantities ever change in `data.js`, the variations array must be updated by hand. Cheap to add a validation in `buildItemDeck` if it ever bites.
- **CPU pick-list duplicates.** `renderItemPickList` iterates the deck (which has duplicates), so identical-name varieties show up multiple times. Same as before; flagged in case Paco wants to dedupe later.
- **No tap-to-zoom on Card Index thumbs.** Deliberate first-cut omission. Easy to add via `openItemZoom` / a unit-zoom variant if needed.
- **Filter persistence is in-match only.** No `localStorage`. Refresh / new game resets. By design.

---

## Start sequence UI refactor — three-stage rebuild

**Status:** Shipped. Branch `start-sequence`, single commit `1d7a83c`. Out-of-roadmap priority taken on between Phase 18 and Phase 17.

### What shipped

The legacy start flow ("New game" modal popping on top of an empty board → coin flip → click-card-then-click-slot placement → game) is replaced with a deliberate, player-grade sequence: clean parchment start screen → in-board unit reorder → auto coin flip → animated chrome entrance. Three QA-gated stages.

**Stage 1 — Parchment start screen (`#start-screen`).** Fullscreen layout sourced from a Claude Design HTML/JSX bundle (`feature specs/card-duel-game-start-screen/`). Cinzel + Crimson Pro + JetBrains Mono fonts, ivory/ink/gold palette, hairline frame, "Edition I" / "v0.4 · pre-alpha" corner labels, title plate, "Match Setup" card with segmented Capture Goal + CPU Difficulty + Bestiary seal-toggle, a "Developer's Notebook" panel for `match_mode` / `choose_cpu_starting_units` / `show_debug_ui`, dark "Begin Duel" button with live summary, and a lore + stats + byline footer. Visual controls (segmented buttons, seal toggles) drive the existing hidden form inputs (`#setup-bestiary-enabled`, `#setup-mode`, `#setup-cpu-custom-placement`, `#setup-cpu-difficulty`) so `game.js` reads stay unchanged. New `#setup-debug-enabled` checkbox + `state.debugControlsEnabled` (default `true`, no localStorage persistence — resets per session). New `applyDebugVisibility()` toggles `body.no-debug` which hides `#item-draw-debug`, `#btn-placement-replace-with-pick` + `#placement-unit-pick-wrap`, and the `.bestiary__debug` selects via CSS. `#btn-save-log` and the mid-game save-log modal are never hidden. `body.start-screen-active` is set in markup so the very first paint shows parchment, not the empty board behind it.

**Stage 2 — Reorder placement + coin-after-placement.** Begin Duel skips the legacy coin step entirely. New `dealUnitDecks()` extracted from the old `onAfterCoin` runs immediately so `state.p1Hand` / `state.p2Hand` are populated before placement renders. `body.in-placement` (CSS `display: none`, not `visibility: hidden` — see Stage 3) hides the header, sidebar, decks, item hands, and turn strip so only the 5×2 grid is visible. `#placement-title` and `#placement-subtitle` float above the board; `#placement-actions` (with `#btn-placement-lock-in` and the existing "Replace selected with pick…") sits below. P1's units pre-place randomly via the existing staggered `Anim.unitPlacement` (now invoked through `placeAllRandomly({ faceUp: true })` — extended with `faceUp` and `onComplete` opts). Reorder is a swap interaction: click any slot in your row to highlight it (`slot--placement-selected`, a strong blue ring + lift, distinct from the green `slot--selectable` baseline), click a second to swap. Reuses `Anim.captureReorderSwap` / `Anim.animateReorderSwap` for the slide. State lives in `state.placementReorder = { selectedCol }`. Lock In branches: CPU + `!cpuCustomPlacementEnabled` → `autoPlaceCpuP2()` (face-down stagger via `placeAllRandomly({ faceUp: false })`); else → `enterPlacementForP2()` (face-up reorder). After P2 locks in, `enterCoinFlipStep()` morphs the title to "Who goes first?" → 1 s hold → `Anim.coinFlip` auto-fires (no Flip / Continue buttons) → result holds 1 s → fades 320 ms → `transitionToPlaying()`. `transitionToPlaying` flips all cells `faceUp = false` so the original fog-of-war (own blue overlay, CPU card-back) returns at game start. `applyPlacementUnitPick` refactored to swap onto `state.placementReorder.selectedCol` rather than into a hand index. Legacy code deleted: `#setup` overlay (with `#setup-coin` and `#setup-place`), `#btn-place-randomly`, `#placement-hand`, `#placement-hand-filter`, and the functions `onFlipCoin`, `onAfterCoin`, `placeUnit`, `finishPlacementForPlayer`, `renderPlacementStep`, `handlePlacementHandClick`.

**Stage 3 — Board chrome entrance choreography.** New `runBoardEntrance()` orchestrator runs three sequential waves around the placed cards. **Wave A (~0.5 s)**: `#board-right` slides in from `x: 280` to `x: 0`, while `.board__center` FLIP-slides in parallel — `runBoardEntrance` captures `board__center.getBoundingClientRect()` before removing `body.in-placement`, captures it again after the layout reflow, sets a counter-translation equal to `before.left - after.left`, then animates that delta to 0. The placed cards glide smoothly into their final left-shifted position rather than jumping when the sidebar takes its layout space. **Wave B (~0.45 s)**: `#item-hands-p2` slides down from `y: -180`, `#item-hands-p1` slides up from `y: 180`, in parallel. **Wave C (~0.45 s)**: `.board__decks` slides in from `x: 180` (where the sidebar's left margin sits) to `x: 0` — comes from the right, settling into rest. After Wave C, `BeatQueue.close()` releases the gate and the existing turn banner (`Anim.turnBanner`, §20) fires as today. Three new functions in the `Anim` namespace: `boardSidebarEntrance`, `boardBarsEntrance`, `boardDecksEntrance`. **Critical detail:** all offsets are pixel-valued (not `xPercent` / `yPercent`) — those evaluate to 0 against an element's computed size, which is 0 when the element is `display: none`, so `gsap.set(el, { yPercent: -100 })` while the chrome is hidden does nothing. Pixel offsets work regardless. Chrome hides via `display: none` (not `visibility: hidden`) during placement so the board grid is genuinely centered in the viewport rather than pushed left by reserved sidebar/deck space.

### Bug fixes within Stage 2 (caught during QA)

- **Reorder selection visual was invisible** — `slot--selectable` and `slot--selected` happened to share identical CSS (green ring + box-shadow), so the "you've picked this one" state looked the same as the baseline "all are pickable" state. Fixed with a new `slot--placement-selected` class (blue ring + 3 px lift).
- **"Replace selected with pick" silently failed** — `openPlacementUnitPickList` still checked the dead `state.selectedPlacementIndex` (the old hand-pick state). Updated to read `state.placementReorder.selectedCol`.
- **Face-down overlay regression** — P1's cards were force-faced-up during placement (so the user could see them while reordering) but never flipped back. `transitionToPlaying` now sets `faceUp = false` on every board cell before `startOfTurn`, restoring the original fog-of-war.
- **Bars "blinking" instead of sliding** — initial Stage 3 prototype used `yPercent: -100` / `xPercent: 100` for off-screen pre-positioning, but `gsap.set` was running while the chrome was still `display: none`, so the percentages resolved against a 0-height element and produced 0 displacement. Switched to absolute pixel offsets.
- **Grid jump when sidebar entered** — `body.in-placement` removal triggered an immediate layout reflow as the sidebar took its 248 px column. Without the FLIP slide on `.board__center`, the placed cards visibly "jumped" to their new position. Fixed with the rect-before / rect-after / invert / animate-to-0 pattern.
- **Decks animation direction** — initial prototype slid decks from off-screen-left; user wanted them to come from the right (toward the sidebar's left margin). Flipped the offset sign.

### State / function surface added

- `state.debugControlsEnabled: bool` (default true, in-memory)
- `state.placementReorder: { selectedCol: number | null }`
- New functions in `game.js`:
  - `dealUnitDecks()` (extracted from legacy `onAfterCoin`)
  - `enterPlacementForP1()`, `enterPlacementForP2()`, `autoPlaceCpuP2()`, `enterCoinFlipStep()`, `transitionToPlaying()` (the new placement → coin → playing pipeline)
  - `onLockInPlacement()` (handles the Lock-in button click; gated via `BeatQueue.afterRender` if a swap animation is mid-flight)
  - `doPlacementSwap(player, colA, colB)` (mirrors `doObscuringSwap`)
  - `runBoardEntrance(onComplete)` (Stage 3 orchestrator)
  - `showStartScreen()` / `hideStartScreen()` / `applyDebugVisibility()` / `updateBeginDuelSummary()` / `getSelectedGoalFromStartScreen()` / `syncStartScreenVisuals()` / `setSealToggle()` / `showPlacementSubtitle()` / `hidePlacementSubtitle()`
- New functions in the `Anim` namespace (`game.js` ~lines 894 area):
  - `Anim.boardSidebarEntrance(onComplete)`
  - `Anim.boardBarsEntrance(onComplete)`
  - `Anim.boardDecksEntrance(onComplete)`

### Files touched

- **Modified:** `game.js` (~580 net insertions), `index.html` (start-screen markup, placement title/subtitle/actions inside `.board__center`, removal of `#setup` overlay), `style.css` (parchment start-screen + placement layout + entrance choreography rules + debug-disabled CSS).
- **Added (under `feature specs/`):** `Start sequence UI refactor.md` (the spec), `card-duel-game-start-screen/` (the Claude Design source bundle: README + HTML + JSX + screenshots).
- **Untouched:** `cpu.js`, `data.js`, all combat / item / Bestiary / veteran logic, all existing animation primitives.

### Tech debt / notes for next agent

- **`state.debugControlsEnabled` is per-session only.** No localStorage persistence by design; refresh resets to ON. If a future change needs cross-session persistence, it's a small wiring change in `onGoalChosen` + the DOMContentLoaded init block.
- **Stage 3 sidebar entrance direction.** Spec said "from the left", user confirmed the conventional read (from off-screen-right, board re-centers leftward) is correct. If the literal interpretation is ever wanted, flip `x: 280` → `x: -280` in `Anim.boardSidebarEntrance` and the FLIP delta sign in `runBoardEntrance`.
- **`#item-hands-p2` / `#item-hands-p1` Y offsets** are tuned at `±180 px`. The bar's natural height comes from `.item-hand__inner { min-height: var(--hand-card-height) /* 150 px */ }`. If hand-card-height is ever changed substantially, revisit these offsets so the bars start fully off-screen.
- **Face-down flip in `transitionToPlaying`.** Brute-forces `faceUp = false` on every board cell. This is correct for the original fog-of-war but will need a re-think if future design wants any cards to start face-up at game start (e.g. a special starting condition).
- **`syncSetupModeControls` extension.** When the user picks Manual mode on the start screen, the `choose_cpu_starting_units` toggle and `CPU Difficulty` segmented are dimmed (`opacity: 0.45`) and become non-interactive (`pointer-events: none`). These visual hints live inline; if the start screen ever moves to a different control framework, port that dim/disable logic.

---

## Phase 2 — UX polish: turn banner, item summoning zoom, Wardstone activation summon

**Status:** Shipped. Three player-facing animation moments added; project conventions checked into the repo.

### What shipped

**§20 Turn-start banner with full BeatQueue gating.** A pill banner now announces every turn handover ("Your turn" in blue / "Opponent's turn" in red, with a per-round "Current turn: X" subtitle). Same shape and timing as the bestiary banner (0.32 s in / 1.5 s hold / 0.28 s out, ~2.1 s total). The banner enforces a full pause: any in-flight previous-turn animations (coin flips, captures, etc.) resolve first via `BeatQueue.afterRender` — `startOfTurn()` defers itself if the queue is still draining and clears any pending CPU think-timer so the CPU can't slip under the banner. While the banner shows, logs / `renderTurnUI` / `renderBoard` are buffered; `animateCardIntoHand` and `maybeScheduleCpuTurn` are moved into the banner's `onComplete` so they fire only after fade-out. `state.turnsCompleted` added to track per-round count, incremented in `endTurn`.

**§23 Item summoning zoom.** Repurposes the existing `#item-zoom-modal` as a brief "card being played" beat that plays before every Equip / Build / Use action — pop in 0.32 s → hold 1.0 s → fade 0.28 s, with the card image plus a small italic caption ("Equipping…" / "Building…" / "Using…") under it. Skipped intentionally when (a) the player commits via the modal's existing "Use this item" button — they were just looking at the zoomed card, and (b) the CPU equips gear to a face-down unit — revealing the gear card without the unit's identity reads as noise. The same modal is also wired to the **Wardstone Bracelet activation interrupt** with the caption "Wardstone's protection activated…", clearing `state.pendingWardstone` immediately so a button double-click or the CPU's think-timer can't re-enter and queue a second summoning. Apply functions' slide-in animations (`gearEquip`, `terrainEquip`) work correctly because `Anim.itemSummon` closes its BeatQueue gate **before** running its `onComplete` continuation — that lets the apply function's `renderBoard` fire synchronously so the slide queries a freshly-rendered DOM. The outdated `#item-zoom-effect` paragraph under the inspection modal's card image is removed entirely (HTML, CSS, JS).

**`CLAUDE.md` checked into the repo.** Codifies architecture conventions (file responsibilities, `game.js` internal structure, key state fields, CPU pattern, asset conventions) and collaboration preferences (design-first explanations, conversation-before-detailed-plan rule).

**Files touched:** `game.js`, `index.html`, `style.css`, `CLAUDE.md` (new), `DEV_LOG.md`.

---

## Phase 2 — Damage resolution sequence (§24 damageResolve)

**Status:** Shipped. Rattle/capture/HP-update timing redesigned around `Anim.damageResolve`.

### What shipped

The damage rattle was regressed (not firing at all) and the previous implementation was structurally fragile — `flashDamageSlot` ran AFTER `state.board[player][col] = null` for captures, so its first guard (`!state.board[player][col]`) always cancelled the rattle. The face-down-soft DOM guard added during the BeatQueue refactor was also bailing on survivor rattles when `renderBoard` was buffered.

Replaced both branches' rattle calls with a single new `Anim.damageResolve(player, col, { captured })` (game.js, in the Anim namespace). It owns the entire visual sequence and is BeatQueue-gated:

- **Survivor**: rattle (250ms), then BeatQueue closes → `renderBoard` paints the new HP counter.
- **Captured**: rattle (250ms) → 150ms buffer → `Anim.unitCapture` arc (450ms) → BeatQueue closes → `renderBoard` paints the now-empty slot.

Defers the entire sequence via `Anim.afterReveal` if a reveal animation is in flight for the slot or a cross-slot deferral points here (Lancer counter that lands on attacker). If BeatQueue is active for any other reason (coin flip), the sequence is buffered via `bufCapture` so the rattle only starts once the coin lands. State mutation still happens synchronously inside `applyDamage`; `damageResolve` only owns the visual sequence.

The old `flashDamageSlot` and the early `Anim.unitCapture` call inside `applyDamage`'s capture branch are removed — both now live inside `damageResolve`.

### Tech debt — multi-target damage sequencing

When a single attack damages two or more units (Archmage's Tome AOE, Iron Maiden retaliation that captures the attacker, Pack Shield bounceback, Magic Grenade), each target currently kicks off its own `Anim.damageResolve` in parallel. They rattle at the same time and resolve independently. Agreed direction: make these **sequential** — one target rattles + resolves, then the next — so the player can read each hit individually.

**Implementation idea**: collect all damage events from a single attack into a queue inside `resolveCombat` (or its callers), then drain them one at a time with each target's `damageResolve` `onComplete` chaining to the next. Will require:
- An optional `onComplete` parameter on `Anim.damageResolve` (currently fire-and-forget).
- A small helper at the combat-resolution layer to walk the queue.
- Care for the Iron Maiden retaliation case where the second damage event fires *recursively* inside the first `applyDamage` — easiest fix is to defer the recursive call into the queue rather than calling it inline.

Out of scope for the §24 change. Flagged here for a follow-up.

---

## Phase 2 — Animation layer: BeatQueue foundation + display sequencing fixes

**Status:** Shipped. BeatQueue generalises CoinGate; reveal/arc/board display now sequenced correctly.

### What shipped

**BeatQueue — generalised display gate**

`CoinGate` only buffered `renderBoard`, `renderTurnUI`, and log during coin-flip animations. All other animations (reveal flips, capture arcs) were fire-and-forget, so HP counters, log entries, and the CPU continue button could appear mid-animation.

Replaced the internal `_running` boolean with a new `BeatQueue` object (reference-counted gate). `BeatQueue.open()` / `BeatQueue.close()` allow any blocking animation to hold display. CoinGate's public API is unchanged — it delegates internally to BeatQueue. `_flush()` order changed: logs → capture starters (which may call `open()` to extend the gate) → board/turnUI only if gate is closed. This ensures `maybeScheduleCpuTurn()` and the Continue button don't fire while a capture arc is in flight.

**cpuReveal — ghost-card (duplicate) eliminated**

Previously the DOM tile was patched to face-up art at Phase 1 end (edge-on). During Phase 2 expansion both the proxy and the tile were visible simultaneously; the tile showed HP markers and gear the proxy didn't, creating a ghost/duplicate effect.

Fixed by keeping `slot--revealing` active through Phase 2. At Phase 2 end (proxy fully expanded, covering the tile), `slot--revealing` is removed and the tile is patched. The proxy then fades, crossfading into the fully-detailed tile underneath. No ghost.

**cpuReveal — display gated for the full flip sequence**

`startFlip()` now calls `BeatQueue.open()` at the start. HP counters, log entries, and board state are held until the proxy fade completes (and any pending items like the capture arc have also finished).

**unitCapture arc — gates Continue button**

`startArc()` now calls `BeatQueue.open()` at start and `BeatQueue.close()` in its `onComplete`. The board renders (and `maybeScheduleCpuTurn()` fires) only after the card has physically left the board.

**Face-down shake guard**

`flashDamageSlot.doShake()` now checks whether the DOM tile still has `unit-card--face-down-soft` before firing the shake. When `renderBoard` is buffered and no reveal animation is active (e.g. a P1 face-down unit hit by a Lancer counter), the shake is suppressed on the stale face-down tile instead of playing on a card that hasn't been revealed yet.

**Coin z-index lifted above proxies**

`#theater-coin` raised from z-index 160 → 210 (above `.theater-proxy` at 200) so the coin always appears on top of reveal and capture proxies when they occupy the same area.

### Known tech debt (deferred)

**Harlund Pack Shield + Archmage's Tome (multi-target)** — The Archmage multi-hit sequence involves several overlapping animations in rapid succession: original target reveal, Harlund redirect, Harlund reveal (if face-down), swap slide, capture arc, Reinforced Barricade coin per adjacent target. With BeatQueue these are sequenced more correctly than before but the interaction is still visually imperfect under adversarial combinations. Root cause: the multi-target resolution loop runs all `applyDamage` calls synchronously, producing a burst of queued animations that BeatQueue can't fully interleave. A proper fix requires restructuring the Archmage multi-hit resolution into an async step loop (outside current scope). Deferred.

**§15 Captured unit — new reinforcement immediately visible** (UX debt) — When a unit is captured and its capture arc plays, the next face-down unit from the opposing row is already visible in the slot underneath as the arc exits. There is currently no animation for drawing a reinforcement from the units deck and placing it onto the board. This should be addressed as part of a broader "card draw from deck" animation scope (units deck → board, item deck → hand) rather than as a standalone fix. Deferred.

**Files touched:** `game.js`, `style.css`, `DEV_LOG.md`.

---

## Phase 2 — Animation layer: CoinGate fixes and wiring completion

**Status:** Shipped. All known animation gaps closed; CoinGate sequencing corrected for capture arcs and defender shakes.

### What shipped

**CoinGate — deferred proxy animations**

`CoinGate` previously buffered log entries and render calls during coin-flip animations, but theater-layer proxies (`unitCapture`, `cpuReveal`) fired immediately and unconditionally. This caused visual cause-and-effect inversions: for example, Mivara's False Self would show the defender's card arc to the discard pile before the coin had even appeared, then the coin would land showing "tails" after the fact.

Fixed by adding a `_bufCapture` queue to `CoinGate` (parallel to `_bufLog`). `Anim.unitCapture()` and `Anim.cpuReveal()` now detect `CoinGate.active`: if the gate is open, the proxy is created immediately (capturing DOM position and image while the slot still exists) but hidden, and the animation start function is queued via `CoinGate.bufCapture()`. After all queued coins settle, `_flush()` empties the log buffer, re-renders the board and UI, then starts the deferred proxy animations — so the slot empties and the capture arc begins in the same paint frame.

**Defender shake — only fires on confirmed hits**

`Anim.attack()` previously fired both the attacker lunge and a defender shake simultaneously at the start of `resolveCombat()`, before any veteran effects, terrain coins, Lancer counters, or Wardstone interrupts were evaluated. The defender shook even when the attack was later canceled, blocked, or redirected.

Fixed by removing the defender shake from `Anim.attack()` (lunge only). The shake already existed in `flashDamageSlot()` → `Anim.damageShake()`, called at the end of every `applyDamage()` path — so it naturally fires only when damage actually resolves. `flashDamageSlot()` is also now CoinGate-aware: when a coin is mid-flight the shake is buffered and plays after the coin settles.

**Attack-blocking cases now correctly silent (no defender shake):**

| Effect | Block condition |
|---|---|
| Unstable Ground on attacker | Tails → `return` before `applyDamage(defender)` |
| Lancer counter (heads) | `attackBlocked = true` gates `applyDamage(defender)` |
| Senya's Hex Haze (heads) | Attack negated; `applyDamage(Senya)` never called |
| Mivara's False Self (heads) | Redirected; `applyDamage` fires on a different target |
| Elevated Ground (heads) | `defenderTerrainBlocked` skips `applyDamage(defender)` |
| Reinforced Barricade (heads) | Same |
| Wardstone Bracelet used | Interrupt flow skips `applyDamage(original defender)` |
| Harlund's Pack Shield used | `applyDamage` fires on Harlund, not original target |
| Unmaker on reveal | Unmaker lethal capture bypasses the normal damage path |

**Wired coin flips (previously silent)**

Four `Math.random() < 0.5` calls had no `CoinGate.push()` and fired silently:
- Grolk's Bloodthirst (attacker heals 1 HP on capture)
- Barbed Gauntlets in the Archmage multi-hit path
- Paralyzing Vines in the Teleport Boots move path
- Reinforced Barricade in the Archmage multi-hit path (per-target)

**Wired item consume animations (previously silent)**

Five single-use items disappeared from the hand without animation:
- All-revealing lantern-jar (`applyRevealingLight`)
- Tangle-Vine Bola (`applyDisablingNet`)
- Corrosive Phial (`applyCorrosivePhial`)
- Obscuring Bomb (`applyObscuringBomb`)
- Tectonic Spike (`applyTectonicSpike`)

**Files touched:** `game.js`, `DEV_LOG.md`.

---

## Phase 18 — Restriction flag holistic fix

**Status:** Shipped. Covers all unit restriction/paralysis mechanics identified during CPU opponent QA.

### What shipped

**Root-cause bugs fixed:**

- **`cannotAttackNextTurn` lifecycle (Berserker, Tangle-Vine Bola):** The flag was previously cleared at the wrong point in the turn cycle, causing it to never enforce the restriction on the affected player's own turn. Fixed with a two-stage pending → active mechanism: setting the flag now writes `cannotAttackNextTurnPending`; `startOfTurn()` promotes pending → active so the restriction applies for exactly one full turn of the affected player.
- **`mustRestNextTurn` lifecycle (Archmage's Tome):** Same root-cause bug — the Archmage's rest restriction was cleared before it could take effect. Fixed with the same two-stage `mustRestNextTurnPending` mechanism.
- **Corrosive Phial instant-kill edge case:** Destroying an armor that was the unit's only remaining HP buffer now correctly captures the unit immediately rather than leaving it at 0 effective HP.

**Counter-attack consistency:**

- Paralyzed units (Magic Paralysis, Solomon's Lunar Dazzle, Chronir's Frozen Chain) can no longer counter-attack as Lancers. Previously the Lancer counter check did not include `paralyzed`.
- Units with `cannotAttackNextTurn`, `mustRestNextTurn`, and their pending variants are now uniformly excluded from Lancer counter eligibility.
- **Rowka's Twin Guard overrides restrictions:** A restricted Lancer (any flag) that would receive a Rowka guarantee can still counter. The counter loop now evaluates `getCounterGuaranteeInfo()` before applying the restriction filter, so Rowka's guarantee has priority.

**Selection and highlighting:**

- Pending flags (`cannotAttackNextTurnPending`, `mustRestNextTurnPending`) now block unit selection, slot highlighting, CPU evaluation, and the "Can't attack" badge — consistent with their active counterparts.

**"If Hit" veteran buffs confirmed unaffected:**

- Harlund (Pack Shield), Vaela (Instinctive Strike), Senya (Hex Haze), Iktha (Magma Skin), and Mivara (False Self) all fire passively on the defender side and were already independent of restriction flags. No changes needed; behavior confirmed correct.

### Agreements on restriction rules (see RULES.md for player-facing text)

- A restricted unit cannot be selected to act → cannot move or attack (movement requires initiating an attack).
- Passive positional swaps (Brawler swap, teleport exchange initiated by another unit) can still move a restricted unit.
- Paralyzed units are fully frozen and cannot counter-attack.
- Rowka's Twin Guard guarantee overrides restriction flags for Lancer counters.
- "If Hit" veteran buffs always fire on restricted units — restriction applies to the unit's own agency, not to defensive passives triggered by being attacked.

**Files touched:** `game.js`, `DEV_LOG.md`, `RULES.md`.

---

## Phase 16 — Seer's Bestiary wrap-up

**Status:** Wrapped for current scope. Core ruleset + QA-driven fixes shipped; selected UX debt intentionally deferred.

### What shipped

- New advanced-rules setup toggle (default ON) for Seer's Bestiary mode.
- Bestiary modal with faction/bestiary columns, forced reveal flow, milestone-driven progression, and debug controls.
- Full Bestiary effect hooks integrated into combat, movement, items, and veterancy interactions.
- QA-driven fixes for Unmaker, High-Aerie, Muzzled Beast, Fractured Hulk logging, and Berserker follow-up behavior.
- Updated card assets tracked as production fixes:
  - `assets/bestiary/7 – High-Aerie.png`
  - `assets/bestiary/11 – Berserker.png`
  - `assets/items/Single Use - Magic Grenade.png`
- Iron-Clad Shield low-risk enhancement shipped: unit zoom modal now supports inspecting a second gear slot when the unit is affected by Iron-Clad Shield.

### Deferred UX debt (intentional)

- Battlefield layered card presentation for dual-gear units (Iron-Clad Shield) remains deferred to later UI refinement due to higher visual complexity/risk.
- Bestiary reveal-flow lock remains documented as a known deferred issue with workaround and future-fix strategy (see section below).

**Files touched (Phase 16):** `game.js`, `data.js`, `index.html`, `style.css`, `assets/bestiary/*`, `assets/factions/*`, `assets/items/Single Use - Magic Grenade.png`, `README.md`, `ROADMAP.md`, `DEV_LOG.md`.

---

## Seer's Bestiary — deferred known issue (reveal-flow lock)

**Status:** Known issue, intentionally deferred to a future phase (low priority due to manual workaround).

### Repro confirmed (manual QA)

- Start a new game and force-activate a Bestiary column early (before natural milestone reveal).
- Continue until natural reveal trigger (e.g. 10-capture mode at 4 captures).
- Bestiary modal appears; reveal/continue flow completes and the next column is revealed.
- **Issue:** header remains stuck on `"Seer's Bestiary reveal in progress."`, turn cannot proceed.
- Also reproducible in baseline path (no force-activation) in some runs.

### Current workaround

- In Bestiary modal debug controls, set the newly revealed/pending column to **Force inactive**, which clears the lock and resumes turn flow.

### Likely root-cause theories

1. **Reveal state desync:** `pendingBestiaryReveal` / `pendingBestiaryContinue` can remain truthy after modal dismissal, even when no actionable reveal UI remains.
2. **UI state race:** modal-close path and turn-render path may run out of order, leaving `renderTurnUI` believing reveal flow is still active.
3. **Column status mismatch:** natural reveal pointer and effective column state (`revealed` vs debug force-active) can diverge, causing stale "in-progress" gating.

### Suggested future fix approach

- Create a single authoritative reveal state machine (`idle -> awaitingRevealClick -> awaitingContinue -> idle`) with invariant checks.
- Centralize all transitions in one reducer-like function and block direct state mutation outside it.
- Add a hard guard in turn render:
  - if header says reveal in progress but no modal action is possible, auto-heal state to `idle`.
- Add debug telemetry logs around each transition (`enter`, `exit`, `cleanup`) to verify order.

### Why deferred

- Feature remains playable with a reliable manual workaround.
- Team priority is to shift focus to higher-impact work (including Iron-Clad Shield follow-up scope).

---

## Iron-Clad Shield — UX debt note (deferred)

**Status:** Partial UX shipped; battlefield dual-gear layering intentionally deferred.

- Added low-risk visibility improvement: unit zoom modal now includes an **extra gear column** so players can verify the second equipped gear from Iron-Clad Shield.
- Deferred for a later refinement phase: showing both gear cards in the battlefield layered tile UI (higher visual/layout risk with current stacked card composition).

---

## Phase 15 — wrap-up snapshot for merge to main

**Status:** Implementation complete (R1 + R2 + R3 shipped on `veteran-buffs`), with remaining QA intentionally deferred to a dedicated future sweep.

### What is complete

- **Lancer veteran suite:** Braskin, Rowka, Nyss, Keera.
- **On-hit veteran suite:** Torra, Haskel, Lyra, Rokklo, Solomon, Chronir, Grolk.
- **Interrupt veteran suite:** Jorren, Tival, Harlund, Vaela, Cassa.
- **Defender-passive caster suite:** Senya, Iktha, Mivara.
- **Ardan (R3):** Veilstep prompt + reorder flow (once per Archmage sequence), plus follow-up fix where Ardan flips face-down before shuffle/reorder.

### Deferred QA decision (R4)

- Team decision: treat **cross-regression at scale** as a separate upcoming scope (**Phase 19** in `ROADMAP.md`) so merge can proceed with clear QA debt tracking.
- This keeps implementation velocity while making remaining validation explicit and auditable.

### Open QA lists carried forward

- `QA_PHASE15_R2_LOG_TEMPLATE.md`
  - Already verified: A1 (Vorpal ignores defender veterancy), A2 (True-Strike Lens does not ignore defender veterancy).
  - Still open: A3, Wardstone ordering, Archmage packet matrix, and quick ordering regressions.
- `QA_TARGETED_REGRESSION_CHECKLIST.md`
  - Open targeted regression checks for Wardstone priority, counter/terrain pre-hit gates, and legacy veteran/item interactions.
- **R3 targeted follow-up (pending):**
  - Ardan single-target prompt cadence + resume flow.
  - Ardan + Archmage once-per-sequence behavior.
  - Veilstep decline path continuity.
  - Coexistence with Wardstone/Harlund/Chronir/Cassa continuation branches.

---

## Phase 15 — Veteran buffs (partial) + placement QA tools

**Status:** In progress (Lancer suite + on-hit subset + infrastructure shipped; other veterans pending per roadmap).

**Scope:** Per-character `veteranBuff` keys in [`data.js`](data.js); combat hooks for Braskin, Rowka, Nyss, Keera plus on-hit veterans (Torra, Haskel, Lyra, Rokklo, Solomon, Chronir, Grolk); cell `veteranState` placeholder; setup **filter hand** and **replace selected with pick** (full `CHARACTERS` roster via swaps with unit deck / other hand).

### Data and helpers

- **`veteranBuff`:** String id on each Veteran row (e.g. `braskin`, `rowka`, `nyss`, `keera`). Helpers: `getVeteranBuff(cell)`, `hasVeteranBuff(cell, key)` in [`game.js`](game.js).
- **`veteranState`:** `{}` on new board cells; copied on move/teleport swap (for future per-unit veteran cooldowns/flags).

### Lancer counter resolution (`resolveCombat`)

**Order (early → late):**

1. **True strike** (`trueStrike` in code): Vorpal Honing Amulet, True-Strike Lens (Shooter/Caster), Recurve Master Bow (Shooter). Skips **entire** Lancer counter block (and attacker Unstable Ground, defender terrain per existing true-strike rules). Veteran “guaranteed counter” effects do **not** apply because no counter step runs — matches QA expectation.
2. **Braskin (Uncanny Block):** If the **attacker** is **adjacent** (same row, `|Δcol| === 1`) to an allied Braskin (Veteran), **no** enemy Lancer counter is attempted for that attack. Checked **before** any defending Lancer is selected. This **short-circuits** Rowka’s Twin Guard and Nyss’s Phantom Posture for that attack: no counter candidate, so no guaranteed counter. Intentional: Braskin is a hard “no counter” gate for qualifying attacks.
3. **Otherwise:** Build all defending Lancers in counter range (respecting Vanguard Glaive distance 1–2 vs 1), excluding Lancers with `cannotAttackNextTurn` (e.g. Tangle-Vine Bola).
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
- **Vorpal gating (confirmed rule):** Only `Vorpal Honing Amulet` bypasses these defender passives; True-Strike Lens and Recurve Master Bow do not.
- **Iktha:** Destroys attacker gear before damage; logs both "gear destroyed" and "no gear to destroy" branches.
- **Senya:** Coin flip on incoming hit; heads negates packet and reflects 1 damage to attacker. Added per-unit cooldown state (`senyaBlockNextTurn` / `senyaBlockedThisTurn`) refreshed at turn start via `refreshSenyaCooldownForTurn`.
- **Mivara:** Coin flip on incoming hit; heads redirects packet to front enemy (same column, opposite row). If no front enemy exists, packet is fully voided (no damage to Mivara, no redirected damage).
- **Tival compatibility:** Senya/Mivara deflections count as "attack didn't land on intended target," so Quick Reload retry remains available under existing survivability checks.
- **Archmage packet behavior:** Each packet now independently runs defender-passive checks with explicit logs; packet can be negated/redirected/voided without breaking the sequence.

### R2 QA progress snapshot (partial; pending completion)

- **Current status:** QA intentionally paused to continue feature implementation; keep R2 QA open.
- **Verified so far:** Senya core behavior/cooldown/Tival retry, Iktha geared+ungeared branches, Mivara heads/tails behavior + Tival retry, plus true-strike split **A1** (Vorpal ignore) and **A2** (True-Strike Lens does not ignore).
- **Still pending:** Remaining R2 matrix, especially Wardstone ordering, Archmage multi-packet defender-passive interactions, A3 (`Recurve Master Bow` does not ignore), and quick counter/terrain ordering regression checks.
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

**Scope:** Four promotion items (Champion's Gauntlets, Vanguard Glaive, Recurve Master Bow, Archmage's Tome). Equipped like other gear (one gear per unit; equipping replaces current gear). Each is class-specific, grants +1 HP, and modifies range or combat behavior.

**Implementations:**
- **Data:** In `ITEM_SPECS`, each promotion has `type: 'promotion'`, `allowedClasses: [class]`, and `hpBonus: 1`. `getArmorHPBonus` and `getGearAllowedClasses` extended to support `type === 'promotion'`. Promotions added to `GEAR_EQUIP_ITEM_NAMES` (via `PROMOTION_ITEM_NAMES`). **Use button:** `buildItemCard` and `handleItemHandClick` include `spec.type === 'promotion'` so promotion cards show "Use" and enter targeting when `canPlayGear` is true.
- **Champion's Gauntlets (Brawler):** +1 HP. Attack range: same column and both adjacent (distance ≤ 1). Implemented via `isInRangeWithCell`: when Brawler has Gauntlets, `d <= 1`.
- **Vanguard Glaive (Lancer):** +1 HP. Attack range: diagonal/sideways only — distance **1 or 2** (not 0). "Applies to counters, too": defender Lancer with Vanguard Glaive can counter when attacker is at distance 1 or 2; normal Lancer counter range remains distance === 1. Lancer counter block loops all defender columns and uses `inCounterRange`: Vanguard ⇒ `dist >= 1 && dist <= 2`, else `dist === 1`.
- **Recurve Master Bow (Shooter):** +1 HP. All attacks become true strikes: skip attacker Unstable Ground, Lancer counter block, defender Elevated/Reinforced terrain. Added to `trueStrike` in `resolveCombat`. Wardstone not bypassed. Barbed Gauntlets only on Brawler/Lancer hits.
- **Archmage's Tome (Caster):** +1 HP. Attacks affect primary target and both adjacent enemy units (1 damage + paralyze each). **Per-target defenses:** Each of the three columns is resolved in sequence via `state.archmageMultiResolving` and `continueArchmageMulti()`. For each target: Reinforced Barricade (Caster) is checked per tile (coin flip; heads = that unit not hit). If the unit has Wardstone Bracelet, defender gets Use/No; Use negates that unit's hit only. `doWardstoneUse` / `doWardstoneNo` detect archmage multi and advance to the next target or call `finishArchmageMulti()`. **Rest:** Attacker gets `mustRestNextTurn = true` (separate from `cannotAttackNextTurn` so Tangle-Vine Bola is unchanged). `mustRestNextTurn` is cleared at **start** of that player's next turn (`startOfTurn`); unit is non-selectable and shows "Can't attack" until then. Magic Grenade (nextAttackAsCaster) stays single-target Caster; no Tome multi-target or rest.
- **Range:** `isInRangeWithCell(attackerCol, defenderCol, attCell)` used in `canAttack`, attack-step highlighting, and attack target click; respects promotions and Magic Grenade.

**Bug fixes (same phase):**
- Promotion cards did not show "Use" button; added `spec.type === 'promotion'` to gear Use-button condition in `buildItemCard` and to `gearPlayable` in `handleItemHandClick`.
- Vanguard Glaive allowed attack/counter on the tile directly in front (distance 0); range restricted to `d >= 1 && d <= 2` for attack and counter.
- Archmage's Tome rest was cleared at end of turn so the Caster could attack again next turn; introduced `mustRestNextTurn` (cleared at start of turn) and use it for Archmage rest; "Can't attack" badge and selectability check both flags.
- Archmage's Tome multi-target did not trigger Wardstone or Reinforced Barricade for adjacent targets; implemented per-target resolution with Wardstone prompt and per-tile Reinforced Barricade check.

**Files touched:** `data.js` (promotion `allowedClasses`, `hpBonus`), `game.js` (gear helpers, `PROMOTION_ITEM_NAMES`, `isInRangeWithCell`, Vanguard Glaive range, Lancer counter range, Recurve Master Bow true-strike, Archmage multi-target, `continueArchmageMulti` / `finishArchmageMulti`, `mustRestNextTurn`, Wardstone handlers, Use button for promotion), `ROADMAP.md`, `DEV_LOG.md`.

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
