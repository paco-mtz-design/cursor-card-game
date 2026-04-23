# QA Checklist — True-Strike Hierarchy

Use this file to track manual play-test verification of the true-strike overhaul (2026-04-20).

---

## True-Strike Lens (Shooter or Caster equipped)

- [ ] **Terrain bypass** — Lens Shooter attacks a unit on Reinforced Barricade → coin flip is skipped, attack proceeds.
- [ ] **Unguaranteed counter bypassed** — Lens Shooter attacks; a normal Lancer is in counter range but has no Rowka/Nyss guarantee → no counter attempt.
- [ ] **Rowka-guaranteed counter still fires** — Lens Shooter attacks; a Lancer has Rowka adjacent → counter attempt proceeds (and is guaranteed heads).
- [ ] **Nyss-guaranteed counter still fires** — Lens Shooter attacks; Nyss is face-down and in range → counter proceeds (guaranteed heads, Nyss flips up).
- [ ] **Senya still fires** — Lens Shooter attacks Senya → Hex Haze coin flip happens normally.
- [ ] **Iktha still fires** — Lens Shooter attacks Iktha → Magma Skin destroys attacker's gear before damage.
- [ ] **Mivara still fires** — Lens Shooter attacks Mivara → False Self coin flip happens normally.
- [ ] **Harlund still fires** — Lens Shooter attacks a unit adjacent to Harlund → Pack Shield prompt appears.
- [ ] **Wardstone blocks** — Lens Shooter attacks a Wardstone-equipped unit → Wardstone prompt appears before attack resolves.

---

## Sharpshooter's Scope (Shooter promotion)

- [ ] **Terrain bypass** — Scope Shooter attacks a unit on Reinforced Barricade → coin flip is skipped.
- [ ] **All counters bypassed** — Scope Shooter attacks; a Rowka-guaranteed Lancer is in range → no counter attempt at all.
- [ ] **Senya bypassed** — Scope Shooter attacks Senya → log reads "Sharpshooter's Scope — ignores [name]'s veteran effect." No coin flip.
- [ ] **Iktha bypassed** — Scope Shooter attacks Iktha → no gear destruction, damage proceeds normally. Log confirms Scope bypass.
- [ ] **Mivara bypassed** — Scope Shooter attacks Mivara → no redirect coin flip. Log confirms Scope bypass.
- [ ] **Harlund bypassed** — Scope Shooter attacks a unit adjacent to Harlund → no Pack Shield prompt.
- [ ] **Wardstone blocks** — Scope Shooter attacks a Wardstone-equipped unit → Wardstone prompt appears before attack resolves.

---

## Vorpal Honing Amulet (any unit)

- [ ] **Terrain bypass** — Vorpal unit attacks a unit on Elevated Ground or Reinforced Barricade → coin flip skipped.
- [ ] **All counters bypassed** — Vorpal unit attacks; Rowka-guaranteed Lancer in range → no counter attempt.
- [ ] **Senya bypassed** — Vorpal attacks Senya → log reads "Vorpal Honing Amulet — ignores [name]'s veteran effect."
- [ ] **Iktha bypassed** — Vorpal attacks Iktha → no gear destruction.
- [ ] **Mivara bypassed** — Vorpal attacks Mivara → no redirect.
- [ ] **Harlund bypassed** — Vorpal unit attacks a unit adjacent to Harlund → no Pack Shield prompt.
- [ ] **Wardstone blocks** — Vorpal unit attacks a Wardstone-equipped unit → Wardstone prompt appears.

---

## Log messages

- [ ] Lens attack log reads: `"True strike (Lens) — attack ignores terrain and unguaranteed Lancer counters."`
- [ ] Scope attack log reads: `"True strike (Scope) — attack ignores terrain, Lancer counters, and veteran effects."`
- [ ] Vorpal attack log reads: `"True strike (Vorpal) — attack ignores terrain, Lancer counters, and all veteran effects."`
