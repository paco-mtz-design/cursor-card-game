# PR: feat(cpu): v1 intelligence pass — blunder-proofing and playbook encoding

## What this PR does

Makes the CPU opponent stop making game-throwing mistakes. The CPU now avoids guaranteed counter-attacks, stays off its own hostile terrain, saves its premium items for the moments they matter, and places Divine Light on the right side of the board. It also picks up two new plays: the Bola-then-strike combo and the Obscuring Bomb reset.

On the start screen, the difficulty picker now offers **Normal** (default, the only active tier) and **Hard** (shown disabled as "Coming Soon"). Easy is retired.

## Why

Game-log analysis across ~13 matches showed the CPU felt unfair in the wrong direction: it wasn't too smart, it regularly did things a first-time player would never do — charging a Rowka Twin Guard pair, stepping onto Paralyzing Vines before attacking, burning a Vorpal amulet on a 1-HP target. The goal of this pass is a CPU that feels **believable, not unbeatable**. Every new rule reads only information the CPU legitimately has, so the fog-of-war fix from the previous PR stays intact.

## Changes

- **`game.js` — CPU scoring and candidate builders**
  - New `cpuIsGuaranteedCounter`: a visible Rowka veteran with an adjacent Lancer makes counter risk `6.0` (vs `1.6` for a coin-flip Lancer).
  - `getCounterRiskScore` accounts for Vanguard Glaive's extended range.
  - Brawlers get `+1.2` when attacking face-down targets.
  - Move scoring penalises landing on own Unstable Ground / Paralyzing Vines and rewards escaping hostile terrain (`+2.0`).
  - `terrainValueFor`: Divine Light own-side `-1.5` (was `+1.2`), enemy-side `+1.0`; Tectonic Spike credits removing enemy protective terrain.
  - Item gates: Vorpal only for targets with > 1 HP remaining or behind a guaranteed counter; Bola skips face-down and near-death targets and adds the Bola-then-strike bonus; Magic Grenade only when no face-up own Caster exists; Obscuring Bomb considered when 2+ own units are revealed; Legendary Weapons prefer protected units.
- **`cpu.js`** — Easy preset removed; Normal `counterRisk` weight tightened from `-1.8` to `-2.2`.
- **`index.html` / `style.css`** — difficulty picker updated; new `.segmented__btn--soon` disabled style for Hard.
- **Docs** — `CPU_INTELLIGENCE_V1.md` (plain-language overview of every behaviour change), `CPU_INTELLIGENCE_CONTEXT.md` (the pre-work briefing: log analysis + code map), and a full `DEV_LOG.md` entry.

## Product & design decisions

- **Believable over unbeatable.** The CPU reads visible clues only. A hidden Nyss can still punish it — the same risk a human takes.
- **Retire Easy rather than keep two near-identical tiers.** Easy and Normal differed only in weights; a blunder-prone Easy taught players bad habits.
- **Show Hard as "Coming Soon".** Reserves the slot for v2 multi-turn lookahead and is honest about where the CPU is heading, at the cost of a visible-but-unclickable option.
- **Constants stay inline for now.** Tuning numbers live in the candidate builders; extracting them into `cpu.js` profiles is deferred until Hard needs different values.

## Testing

All testing manual — no automated test suite in this repo.

- `node --check` passes on `game.js` and `cpu.js`.
- Suggested playtest scenarios before treating the tuning as final:
  1. **Guaranteed counter.** Face-up Rowka veteran with an adjacent Lancer guarding a high-value target → CPU attacks elsewhere, uses an item, or skips.
  2. **Hostile terrain.** CPU unit on its own Paralyzing Vines → CPU moves it off before attacking; CPU never moves onto them voluntarily when another option exists.
  3. **Vorpal economy.** Only 1-HP targets available → CPU holds the amulet.
  4. **Divine Light.** CPU always places it on the player's side.
  5. **Bola-then-strike.** Coin-flip Lancer shielding a valuable target, CPU holding a Bola → CPU bolas the Lancer, then attacks the target.
  6. **Difficulty picker.** Normal selected by default; Hard visible but not selectable.

## Screenshots / recordings

N/A. The only visual change is the difficulty picker on the start screen (Easy removed, Hard shown disabled). Everything else is CPU decision-making, visible through its choices and the game log.

## Follow-up work

- **v2 / Hard tier:** multi-turn lookahead, veteran-ability sequencing, positional ideals (Shooters to edges, Lancers to centre).
- **Coin-flip terrain awareness:** the CPU still re-attacks targets protected by Elevated Ground / Reinforced Barricade instead of relocating.
- **Extract tuning constants** into `cpu.js` profiles when a second active tier needs different values.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
