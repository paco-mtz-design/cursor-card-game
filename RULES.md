# Tacticlash — Rules clarifications (prototype)

This document records **player-facing explanations** of how the web prototype resolves combat and related effects, especially where **edge cases**, **stacking**, or **apparent conflicts** between cards and veteran abilities need a clear ruling. It is the companion to **[DEV_LOG.md](DEV_LOG.md)** (implementation detail) and can feed your **official rulebook** as you formalize text.

**How to use**

- Sections are additive: new subsections appear as we lock behavior in code and confirm it in QA.
- When prototype behavior changes, update the relevant section and, if useful, add a one-line **Revision** note at the bottom of that section.

---

## Lancer counters — when they do not happen

A **counter** is the defending side’s Lancer attempt to block an incoming attack (coin flip; on success the attacker takes 1 damage and the attack does not resolve against the original target). Several things can prevent a counter from being attempted or from succeeding.

### A. The attack never reaches “defender tries to counter”

These apply **before** any specific Lancer is chosen or rolls for a counter.

| Situation | What happens |
|-----------|----------------|
| **True strike** | Certain attacks are **true strikes** (e.g. Vorpal Honing Amulet; True-Strike Lens on Shooters/Casters; Sharpshooter’s Scope on Shooters). A true strike **skips the Lancer counter step entirely** for that attack. No defender Lancer—including one with a “guaranteed counter” veteran ability—gets a counter attempt. |
| **Braskin (Veteran — Uncanny Block)** | If the **attacking unit** is **adjacent** to an allied Braskin (same row, next column left or right), **enemy Lancers do not attempt a counter** against that attack. This applies **even if** a defending Lancer would otherwise have a **guaranteed** counter (e.g. Rowka with Twin Guard). Braskin is evaluated **before** any defender Lancer is selected for that attack. |
| **No Lancer in range** | If no enemy Lancer can legally counter this attack (range rules, including Vanguard Lance where relevant), there is no counter. |

### B. A Lancer could counter, but this Lancer does not participate

| Situation | What happens |
|-----------|----------------|
| **Tangle-Vine Bola** | If the Lancer is affected so they **cannot attack** on their next turn, they **cannot counter** either. They are excluded from the counter attempt. |
| **(Other “cannot attack” flags)** | Any future effect that uses the same “can’t act as attacker/counter” rule would follow the prototype’s implementation (see dev log). |

### C. A counter is attempted, but fails before the “success / fail” counter flip

| Situation | What happens |
|-----------|----------------|
| **Unstable Ground (Lancer’s tile)** | When a Lancer on **Unstable Ground** attempts a counter, a coin flip happens **first**. On **tails**, the **counter attempt is canceled** — there is no second coin flip for whether the counter succeeds. Veteran abilities that **guarantee** the counter flip (e.g. Rowka, Nyss when applicable) apply only **after** this terrain check allows the attempt to continue (see below). |

### D. After the attempt proceeds — “guaranteed” counter veterans

Only **after** the game has selected a defending Lancer and, where relevant, resolved **Unstable Ground on that Lancer’s tile** in favor of continuing:

| Ability | Effect on the counter **success** coin |
|---------|----------------------------------------|
| **Rowka (Twin Guard)** | With an adjacent **ally Lancer**, the counter success flip is treated as **heads** (guaranteed). The ally may be **revealed** if face-down. |
| **Nyss (Phantom Posture)** | If Nyss is **face-down** when countering, the counter success flip is treated as **heads**; Nyss is then flipped **face-up**. If Nyss is already face-up, this part of the ability does not apply. |

If Unstable Ground on the Lancer’s tile **cancels** the attempt (tails), Rowka’s and Nyss’s guarantees **do not** override that — the counter never reaches the success flip.

### E. Order of checks (mental model)

1. Is this attack a **true strike**? → If yes, **no** Lancer counter step.
2. Does **Braskin** block counters for this attacker’s position? → If yes, **no** Lancer counter step.
3. Is there a **valid countering Lancer** (range, not blocked by Bola, etc.)? → If no, no counter.
4. **Unstable Ground** on the **countering Lancer’s** tile: does the attempt continue? → If no, counter fails here.
5. **Counter success** coin — Rowka / Nyss can **force success** where applicable.
6. **Keera:** If the counter **succeeds**, Keera’s veteran effect can deal extra damage to another enemy in range (prototype implementation detail in dev log).

---

## Revision notes

- **2026-03-27:** Initial section on Lancer counters, true strike, Braskin vs Rowka/Nyss ordering, Unstable Ground vs Twin Guard / Phantom Posture, Tangle-Vine Bola. Aligns with Phase 15 implementation and first QA pass.

---

## Interrupt veterans — clarifications

These notes cover current prototype behavior for the first interrupt-flow veteran set.

| Situation | What happens |
|-----------|----------------|
| **Tival retry after counter** | If Tival retries because the first attack did not land and the defender has a valid Lancer counter, that counter step runs again for the retry (normal rules apply again). |
| **Harlund during Archmage multi-target** | Pack Shield can trigger at most **once per attack sequence**. In an Archmage's Tome multi-target attack, once Harlund is offered/resolved for that attack, later targets in the same sequence do not trigger Pack Shield again. If Pack Shield is used, the protected ally also ignores any remaining hits/effects from that same attack sequence. |
| **Vaela and reinforcements** | If Vaela's Instinctive Strike captures a moving/swapping enemy and ends the turn, captured-unit replacement for the active player is processed before the pass so the next player does not start against a partially empty row from that event. |
| **Vaela and Obscuring bomb reorder** | Vaela does **not** trigger from Obscuring bomb's reorder swaps. Reorder is treated as setup/rearrangement, not normal move/swap triggers for Instinctive Strike. |
| **Cassa second target** | When Twin Arc is used and multiple valid second targets exist, the acting player chooses the second target from highlighted valid slots. |

---

## Caster defender passives — Senya, Iktha, Mivara

These notes cover current prototype behavior for the remaining defender-passive Veteran Casters in Phase 15 R2.

| Situation | What happens |
|-----------|----------------|
| **Vorpal vs defender veterancy** | Only **Vorpal Honing Amulet** ignores defender veterancy (including Senya, Iktha, and Mivara). True-Strike Lens and Sharpshooter's Scope still allow these passives to trigger. |
| **Iktha (Magma Skin)** | When Iktha is about to be hit, the attacker's gear is destroyed before damage is calculated. If the attacker has no gear, damage proceeds normally. |
| **Senya (Hex Haze)** | Coin flip on incoming hit: **heads** negates that full hit packet and deals 1 damage to the attacker; **tails** does nothing. After a heads trigger, Hex Haze is unavailable on Senya's next own turn. |
| **Mivara (False Self), heads + enemy in front** | The hit packet redirects to the enemy directly facing Mivara (same column, opposite row). |
| **Mivara (False Self), heads + no enemy in front** | No redirected packet is created; Mivara takes no damage from that packet and no other unit takes damage from that packet. |
| **Tival interaction** | If Senya or Mivara prevents Tival from landing on the intended target, Quick Reload can still offer a retry on the same original target. |

---

## Future topics (placeholder)

Use this document for later clarifications, for example:

- Veteran buffs beyond the Lancer suite (on-hit, defender passives, movement triggers).
- Interactions between **Vorpal** and defender veteran abilities.
- **Archmage’s Tome**, **Wardstone**, and multi-target resolution.
- Any rule that seemed ambiguous until the prototype enforced one consistent behavior.
