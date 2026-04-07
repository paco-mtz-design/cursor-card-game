# Targeted Regression Checklist (Section 4)

Focus: verify that new on-hit veteran wiring did not break pre-hit gates and legacy interactions.

## 4A) Wardstone Priority Over On-Hit Veterans

- **Setup**
  - Defender equips `Wardstone Bracelet`.
  - Attacker is an on-hit veteran (`Rokklo`, `Lyra`, `Chronir`, `Haskel`, etc.).
- **Action**
  - Attack Wardstone unit, choose **Use Wardstone**.
- **Expected**
  - Attack is fully negated.
  - No on-hit veteran logs trigger.
  - No damage, no paralyze, no steal, no extra hits.

Repeat once with **No Wardstone**:

- **Expected**
  - Attack resolves normally and on-hit effects may trigger.

## 4B) Counter/Terrain Blocks Still Cancel On-Hit Effects

### B1 — Lancer counter blocks attack

- **Setup**
  - Make defender Lancer counter likely or guaranteed (`Rowka`/`Nyss` setup works).
  - Attacker is an on-hit veteran.
- **Action**
  - Attack and get successful counter block.
- **Expected**
  - Attack is blocked.
  - On-hit veteran effects do not run.

### B2 — Defender terrain blocks attack

- **Setup**
  - Defender on:
    - `Elevated Ground` vs Brawler/Lancer attacker, or
    - `Reinforced Barricade` vs Shooter/Caster attacker.
  - Attacker is an on-hit veteran.
- **Action**
  - Attack until terrain flip blocks.
- **Expected**
  - Blocked attack means no on-hit triggers.

### B3 — Attacker Unstable Ground cancels attack

- **Setup**
  - Attacker stands on `Unstable Ground`.
- **Action**
  - Attack until tails cancels.
- **Expected**
  - Attack canceled before hit.
  - No on-hit effects.

## 4C) Legacy Veterans/Items Still Behave

### C1 — Torra still breaks gear before damage

- **Setup**
  - `Torra` attacks a geared target.
- **Expected**
  - On heads, gear is removed before damage.
  - HP resolves correctly with removed-gear max HP.

### C2 — Haskel steal does not break hand state

- **Setup**
  - Defender has multiple item cards.
- **Expected**
  - Exactly one random card moves from defender hand to attacker hand.
  - No duplication or discard side effects.

### C3 — Solomon coexistence with Caster paralysis

- **Setup**
  - `Solomon` attacks a non-front target.
  - Enemy also exists in Solomon's front column.
- **Expected**
  - Standard target paralysis still applies.
  - Front-column Lunar Dazzle paralysis also applies when valid.

### C4 — Chronir selection and combat end flow

- **Setup**
  - Two adjacent candidates exist.
- **Expected**
  - Prompt appears.
  - Choice applies.
  - Turn cleanup and end still happen once (no double-end, no stuck state).

---

## Quick Pass/Fail Matrix

- `4A Wardstone Use suppresses on-hit`: Pass / Fail
- `4A Wardstone No allows on-hit`: Pass / Fail
- `4B1 Counter block suppresses on-hit`: Pass / Fail
- `4B2 Defender terrain block suppresses on-hit`: Pass / Fail
- `4B3 Attacker Unstable cancels on-hit`: Pass / Fail
- `4C1 Torra pre-damage gear break`: Pass / Fail
- `4C2 Haskel hand integrity`: Pass / Fail
- `4C3 Solomon + base Caster paralyze coexist`: Pass / Fail
- `4C4 Chronir prompt resolves + clean turn end`: Pass / Fail
