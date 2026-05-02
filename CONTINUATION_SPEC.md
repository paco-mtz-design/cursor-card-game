# Continuation Spec — Tacticlash, end of `animations` branch
*Handoff prepared: 2026-05-02 | Resume in a new chat using `NEXT_SESSION_PROMPT.md`*

---

## Project Overview

Tacticlash is a plain-HTML/CSS/JS two-player card strategy game (no build step, no framework, no bundler). Two players place units on a 5-slot board row and take turns attacking, moving, and using items. One player can be a CPU opponent.

All code ships as plain files. `game.js` (~6 800 lines, single IIFE) holds all game logic and the animation layer. `cpu.js` is the CPU policy module. `data.js` is static data. `style.css` is the only stylesheet. `index.html` is all the markup.

Run with:
```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

There is no build step, no test runner, no linter config, and no package manager.

---

## Branch state

- **Branch:** `animations` — clean, all changes committed.
- **Status:** ready for review / merge. PR text is ready (see chat history).
- **What's on this branch vs `main`:** Phase 18 in two passes — CPU opponent (CPU policy module + Continue-button announce flow) plus the entire GSAP animation layer and UX polish.

### Commits unique to this branch (newest first)

| Commit | What |
|--------|------|
| `49a14f1` | §24 damage resolution sequence — `Anim.damageResolve` (rattle → 150 ms buffer → capture arc); fixes the regressed rattle and the reinforcement-on-vacated-slot bug |
| `d35481a` | §23 item summoning zoom for Wardstone Bracelet activation |
| `bf3fa1c` | `CLAUDE.md` checked in (conventions + collaboration preferences) |
| `bfe072d` | §23 item summoning zoom + drop outdated effect text |
| `6131684` | §20 turn-start banner with BeatQueue gating |
| `e7643e3` | §11/§12 terrain + veteran pulses fire after coin lands, not before |
| `cc4953a` | §17 reorder overlay survives `renderBoard` via slot filter |
| `9ae53c6` | hide hand card immediately in `itemConsume` to prevent ghost clone |
| `a0b1f31` | §10/§19 item arc root cause + sequential two-phase discard |
| `e003056` | §10/§19/§20 item animation bugs + modal crash |
| `ecf95d3` | BeatQueue — generalised display gate for all animations |
| earlier | full Phase 1 CPU opponent, full Phase 2 animation layer (CoinGate, Anim namespace, ~20 GSAP functions, all wiring) |

### Files touched on this branch

| File | What changed |
|------|-------------|
| `game.js` | CPU policy hooks; full `Anim` namespace (~lines 190–820); `BeatQueue` reference-counted display gate (~lines 126–160); `CoinGate` delegation; turn banner, item summoning zoom, damage resolution; all animation wiring throughout |
| `style.css` | Theater layer (`.theater-proxy`, `.theater-coin`, `.theater-spotlight`, `.theater-banner`); `.slot--revealing`, `.item-zoom-modal--summoning`, `.item-zoom__caption`; coin z-index lifted to 210 |
| `index.html` | `#theater-layer` markup; `#item-zoom-caption` (replaces removed `#item-zoom-effect`) |
| `CLAUDE.md` | Conventions + collaboration preferences (added this branch) |
| `DEV_LOG.md` | New entries for every Phase 2 milestone |
| `README.md`, `ROADMAP.md` | Phase 18 marked done, animation tech debt documented |
| `feature specs/` | Phase 1 + Phase 2 specs; testing guide |
| `CONTINUATION_SPEC.md`, `NEXT_SESSION_PROMPT.md` | This file + the next-session starter |

---

## Architecture quick reference

### `BeatQueue` (game.js ~line 126)

Reference-counted display gate. `BeatQueue.open()` increments the count; while count > 0, any subsequent `renderBoard()` / `renderTurnUI()` / `log()` calls are buffered. `BeatQueue.close()` decrements; when count reaches 0, `_flush()` runs in this order: logs → `_bufCapture` starters (which may call `open()` again to extend the gate) → `renderTurnUI` → `renderBoard` → `_postRender` callbacks.

`CoinGate` is now a thin wrapper that delegates everything to BeatQueue. Its public API (`push`, `bufLog`, `bufCapture`, `markBoard`, `markTurnUI`, `active`) is unchanged — every existing call site keeps working.

`renderBoard()` (game.js ~line 2710): `if (CoinGate.active) { CoinGate.markBoard(); return; }` — primary gate check, used by all three display functions.

### The `Anim` namespace (game.js ~lines 190–820)

| § | Symbol | Purpose |
|---|--------|---------|
| §1 | `unitSelected` | Pulse on a selected card |
| §2 | `captureMoveState` / `animateMove` | Slide a unit between slots |
| §3 | `attack` | Attack lunge (defender shake fires later via §24) |
| §4 | `damageShake` | Rattle primitive — only invoked through §24 `damageResolve` |
| §6 | `coinFlip` | Coin in the theater layer |
| §7 | `ownReveal` | P1 face-down veil-lift |
| §8 | `cpuReveal` | 3-phase flip proxy with BeatQueue gate, registers `_revealPending` for chained animations |
| §9 | `gearEquip` | Gear mini-card slides in |
| §11 | `terrainPulse` | Amber slot brightness flash |
| §12 | `veteranPulse` | Slot scale pulse |
| §13 | `spotlightStart` / `spotlightEnd` | Interrupt amber glow |
| §14 | `bestiaryBanner` | Effect / faction banner |
| §15 | `unitCapture` | Capture arc proxy (now invoked through §24 `damageResolve`) |
| §16 | `unitPlacement` | Setup slide-in |
| §17 | `reorderEntry` / `animateReorderSwap` / `reorderExit` | Reorder mode dim + slide |
| §18 | `cardDraw` | Item card slide into hand |
| §19 | `boardMiniCardDiscard` | Mini-card arc to discard pile |
| §20 | `turnBanner` | Turn-start banner ("Your turn" / "Opponent's turn", per-round counter) — `BeatQueue`-gated, full pause |
| §22 | (removed — was Lancer counter flash, abandoned during this session) |
| §23 | `itemSummon` | Item summoning zoom — Equip / Build / Use / Wardstone activation |
| §24 | `damageResolve` | Rattle → buffer → capture arc, the unified damage-visual sequence |

`captureHandCard` snapshots a hand item card's rect while it's still live (used by `itemConsume`).

`_revealPending[player:col]` and `_crossSlotDefer[player:col → other]` are the deferral queues that chain shakes / arcs after CPU reveal flips. `Anim.afterReveal(player, col, fn)` returns true and queues `fn` if a reveal is in flight; `Anim.deferForReveal(player, col, otherP, otherC)` registers cross-slot defers (used by Lancer counter that lands on the attacker).

### Damage resolution (§24)

State mutation is synchronous inside `applyDamage`. The visual half is owned by `Anim.damageResolve(player, col, { captured })`:

- **Survivor:** rattle (250 ms) → BeatQueue closes → `renderBoard` paints the new HP counter.
- **Captured:** rattle (250 ms) → 150 ms buffer → `Anim.unitCapture` arc (450 ms) → BeatQueue closes → `renderBoard` paints the empty slot.

Defers via `afterReveal` for same-slot or cross-slot reveals; falls back to `BeatQueue.bufCapture` if BeatQueue is active for any other reason (coin flip, etc.). The reinforcement-on-vacated-slot bug is structurally prevented because the entire damage sequence completes within its turn before `startOfTurn()` resumes (which itself defers via `BeatQueue.afterRender`).

### Turn-start banner (§20)

Fires from `startOfTurn()`. Opens BeatQueue, plays the banner, runs `animateCardIntoHand` + `maybeScheduleCpuTurn` only in its `onComplete`. `state.turnsCompleted` is incremented in `endTurn` and surfaces as `Math.floor(turnsCompleted / 2) + 1` (per-round) under the banner.

### Item summoning zoom (§23)

Reuses `#item-zoom-modal` in summoning mode (`.item-zoom-modal--summoning` hides the title, close button, and "Use this item" button). Closes its BeatQueue gate **before** running the `onComplete` continuation so the apply function's `renderBoard` fires synchronously and slide-in animations can query the freshly rendered DOM. Wired into:

- `handleItemHandClick` — P1 Equip / Build / Use buttons
- `cpuPendingExecute` (via `runCpuTurnStep`) — CPU's item action, except gear-on-face-down-unit (skipped)
- `doWardstoneUse` — caption "Wardstone's protection activated…"

The "Use this item" button inside the inspection modal still skips the summoning (the player just looked at the zoomed card).

---

## Known tech debt (deferred)

All documented in detail in `DEV_LOG.md`. Top entries:

1. **Multi-target damage sequencing** (Phase 18 animation tech debt) — Archmage's Tome AOE, Iron Maiden retaliation, Pack Shield bounceback, Magic Grenade currently rattle their targets in parallel. Agreed direction: sequential resolution. Implementation idea logged with the §24 entry.
2. **Reinforcement-from-deck animation** (UX debt) — vacated slot fills face-down with no draw animation; best handled inside a broader "card draw from deck" pass.
3. **Harlund / Archmage multi-hit visual interleaving** — multi-target combat resolution is synchronous, producing a burst of overlapping animations BeatQueue can't fully interleave. Needs an async step loop.
4. **Lancer counter flash** (abandoned this session) — the user prototyped a red flash on the Lancer's slot when a counter lands; visual didn't match what they imagined. Reverted. Not a debt — just a path not taken.

---

## Communication / collaboration

Paco is a Product Designer, not a developer. Conventions captured in `CLAUDE.md`:

- Lead with product / design framing, technical detail second.
- For new ideas, **converse first, ask clarifying questions**, only draft a detailed plan once shared understanding is confirmed. This rule was added to `CLAUDE.md` after a 3-feature mega-plan was drafted off a one-line description and Paco called it out as a token-burning anti-pattern.
- Commit style: `type(scope): short subject` with a detailed body. Animation work uses scope `phase2`.

---

## Where to look first as the next agent

1. `CLAUDE.md` — project conventions and how to communicate with Paco.
2. `ROADMAP.md` — phase status. Phase 18 is done, **Phase 17** and **Phase 19** are next.
3. `DEV_LOG.md` — top three entries for this session's work (newest first).
4. `game.js` lines ~126–820 — `BeatQueue`, `CoinGate`, the entire `Anim` namespace.
5. `feature specs/Phase2-Testing-Guide.md` — the QA framework that drove the bulk of the animation work; useful for regression after any new animation work.
