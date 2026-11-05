# CPU Intelligence — Context & Improvement Brief

> **Standalone briefing.** Hand this to a fresh agent to pick up CPU-opponent work with zero prior chat context. Distilled from analysis of ~13 complete game logs (`/Users/pacomtz/Downloads/game logs/`, Apr–May 2026) plus a code map of `cpu.js` / `game.js`. Read alongside `CLAUDE.md` → "CPU opponent pattern".

## Purpose

Improve the Tacticlash CPU opponent. The combat engine itself is sound; the gaps are in **what the CPU values and chooses**, not in how the game resolves. This doc maps the decision architecture and points each observed weakness at the exact code that produces it.

## How the CPU decides (current architecture)

- **`cpu.js`** (policy module, ~80 lines, stateless): the scoring/selection engine.
  - `getProfile(difficulty)` (cpu.js:37) returns one of the `PROFILE_PRESETS` (cpu.js:6); unknown difficulty falls back to `easy`.
  - `scoreCandidate(candidate, profile)` (cpu.js:42) is a linear dot-product: `Σ weights[k] × (candidate.dimensions[k] || 0)`. It iterates over the profile's **weight keys**, so a dimension only counts if the profile names it.
  - `chooseBestCandidate(candidates, profile)` (cpu.js:55) scores, sorts descending, then returns the single best (`randomTopN:1`) or a uniform random pick among the top N (`randomTopN>1`).
  - **All intelligence gaps live OUTSIDE this file** — the engine is generic and correct.
- **`game.js`** builds every candidate and computes every dimension value. Key region ~lines 5082–5724.
  - **Dimensions:** `threatReduction` (`getUnitThreatScore`, game.js:5110), `counterRisk` (`getCounterRiskScore`, game.js:5127), `selfSurvivability`, `boardControl`, `itemValue`, `terrainValue` (`terrainValueFor`, game.js:5336), `tempo`.
  - **Candidate builders:** attack (`buildCpuAttackCandidates`, game.js:5250), select-unit (`chooseCpuUnitToAct`, game.js:5274), move (`chooseCpuMoveAction`, game.js:5296), item (`chooseCpuItemAction`, game.js:5327).
  - **Turn-step flow:** `maybeScheduleCpuTurn` → `runCpuTurnStep` → `chooseCpuCandidate` (game.js:5095) → `TacticlashCpu.chooseBestCandidate`.
- **Evaluation is single-ply** — no lookahead / search at any difficulty.

## Difficulty wiring (and why it barely separates)

`state.cpuDifficulty` is read **only** via `getCpuPolicyProfile` (game.js:5082). `easy` vs `normal` differ ONLY by:

| Knob | easy | normal | Effect |
|---|---|---|---|
| weight magnitudes | lower | higher | mostly uniform scaling → ranking ~unchanged |
| `maxItemActions` | 2 | 3 | items played per turn |
| `randomTopN` | 2 | 1 | **easy randomizes top-2; normal is deterministic-greedy** |
| normal-only branches | — | Wardstone at hpLeft≤2; ardanVeilstep 50% | minor |

There is **no smarter search on normal** — same pipeline, same single-ply heuristics.

**Working hypotheses (from logs, where "easy" produced the *closest* game and "normal" produced blowouts):**
- **H1 — Determinism backfires:** a perfectly greedy, predictable `normal` is *more* farmable by a human than randomized `easy`.
- **H2 — Top blunder is difficulty-blind:** charging into guaranteed counters comes from `getCounterRiskScore`, which neither difficulty improves — so difficulty can't separate where it matters most.
- **H3 — Sample/luck:** tiny sample; who drew the strong counter combo likely decided outcomes more than the difficulty setting.

**Implication:** real difficulty separation needs *awareness and/or lookahead*, not bigger weights. Today, "normal" ≈ "greedy easy."

## Observed weaknesses → fix locations

- **(a) Attacks into REVEALED guaranteed counters** (Rowka Twin Guard / Braskin) and loses the attacker — the single most exploitable behavior.
  - Origin: `getCounterRiskScore` (game.js:5127) is crude — only flags a face-up Lancer at distance 1 and returns a flat `1.6`, routinely outweighed by high-`threatReduction` targets (hidden units alone score ~3.0). It **never calls the helpers combat resolution already uses**: `getCounterGuaranteeInfo` (game.js:2024, returns `{guaranteed, reason:'nyss'|'rowka', revealCol}`) and `attackerIsProtectedByBraskin` (game.js:2058, consumed at ~6235).
  - Fix: consult those helpers in scoring; treat `guaranteed === true` as a near-veto / hard filter in `buildCpuAttackCandidates` (game.js:5250).
- **(b) Re-attacks coin-flip-terrain-protected targets** (Elevated Ground, game.js:~6366; Reinforced Barricade, ~6378) turn after turn instead of relocating.
  - Origin: attack/move scoring has **no terrain dimension** — a 50%-blocked attack scores identically to an unblocked one.
  - Fix: weight `threatReduction` by expected-hit probability from terrain; credit moves that reposition to a non-protecting angle.
- **(c) Wastes premium items** — Vorpal (guaranteed-kill, only 2 in the whole deck) on a 1-HP target a normal hit would kill; Magic Grenade on a unit that's already a Caster (zero benefit).
  - Origin: `chooseCpuItemAction` (game.js:5327) — Vorpal gate is just `strongestEnemy > 3.4` (~5350); Magic Grenade branch (~5413) ignores the target's current class. No economy/scarcity/marginal-benefit model anywhere; `itemValue` is a fixed per-item constant.
  - Fix: target-state + scarcity gating inside each item branch ("would a free attack already kill this?", "does this confer real benefit?", "save the bomb").
- **(d) Doesn't leave hostile terrain it stands on, nor clear it.**
  - Origin: `chooseCpuMoveAction` (game.js:5296) ignores own-cell terrain; Tectonic Spike scoring (~5426) is target-agnostic.
  - Fix: hazard-awareness in move scoring (reward leaving hostile tiles) + a targeted "clear the hazard under my valuable unit" heuristic.

## Tuning surface that already exists

- **`cpu.js`:** the two `PROFILE_PRESETS` weight tables (cpu.js:6+), `maxItemActions`, `randomTopN`, and a drop-in `hard` key (the structure is explicitly extensible).
- **`game.js`:** threat/counter/terrain/item constants embedded in the candidate builders (currently *not* externalized) — e.g. class bonuses in `getUnitThreatScore`, the `1.6` magnitude in `getCounterRiskScore`, the `terrainValueFor` table, per-item gates in `chooseCpuItemAction`.

## Cleanest leverage point

`buildCpuAttackCandidates` (game.js:5250) + `getCounterRiskScore` (game.js:5127): wiring in the existing guaranteed-counter helper and a terrain-probability factor fixes (a) and (b) with minimal surface change. The `cpu.js` scoring engine needs no change.

## Related thread (owned elsewhere)

Difficulty-calibration hypotheses (H1–H3 above) are being explored in the log-analysis chat. Fold conclusions back here before implementing a real `normal`/`hard` gap.
