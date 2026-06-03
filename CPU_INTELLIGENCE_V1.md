# CPU Intelligence — Version 1 Overview

**Branch:** `cpu-intelligence`  
**Status:** Shipped (blunder-proofing pass)  
**Audience:** Non-technical stakeholders, playtesters, design collaborators

---

## What changed and why

The CPU opponent in v1 plays without making obvious, game-throwing mistakes. Before this update, watching the CPU play felt unfair in the wrong direction — not because it was too smart, but because it regularly did things a first-time player would never do. The goal of this pass was to make the CPU feel *believable*, not unbeatable.

Below is a plain-language description of every behaviour that was fixed or added.

---

## Blunders fixed

### 1. Charging into guaranteed counter-attacks
**Before:** The CPU would attack enemy units even when an adjacent Lancer was guaranteed to hit back — losing its own unit in the process, for nothing.  
**After:** The CPU now recognises when a Lancer's counter-attack is *guaranteed* (not a coin-flip) and treats that attack as off the table. It will look for another target, use a special item, or skip rather than throw away a piece.

> *What makes a counter guaranteed:* a visible Lancer veteran named Rowka, backed by another Lancer standing next to it. The CPU can't know about hidden veterans (a face-down Lancer could secretly be Nyss — that remains a risk the CPU has to accept), but it reads every visible clue it legitimately can.

---

### 2. Stepping onto hostile terrain before attacking
**Before:** The CPU would move into Unstable Ground or Paralyzing Vines and *then* attack from there — taking unnecessary punishment for no positioning gain.  
**After:** Moving onto the CPU's own hostile terrain now costs points in the CPU's decision-making. It will avoid landing there unless there's no other option. Conversely, when the CPU is *already* standing on bad terrain, escaping it becomes a high priority for that unit's move.

---

### 3. Placing Divine Light on its own tiles
**Before:** The CPU would sometimes place Divine Light terrain on its own side of the board — which reveals its own face-down units. This is the opposite of what the card is for.  
**After:** Divine Light is now scored as a significant negative for the CPU's own side, and a meaningful positive for the enemy's side. The CPU will always place it to reveal the *opponent*, not itself.

---

### 4. Wasting Vorpal Honing Amulet on easy kills
**Before:** The CPU used its Vorpal amulet (a rare, powerful single-use item) on normal targets that a regular attack would have captured just fine.  
**After:** Vorpal is now held for two specific situations only: (a) a target that has too much HP to capture in one normal hit — Brawlers in heavy armour, for example — or (b) a guaranteed counter-attack is blocking the CPU from reaching an important target. That's it.

---

### 5. Using the Bola on face-down or nearly-dead targets
**Before:** The CPU sometimes threw its Tangle-Vine Bola at a face-down unit (unknown value) or at a unit it was about to capture anyway — wasting both halves of the item's value.  
**After:** The CPU will only Bola a target it can *see* (face-up), and only if that target will survive at least one more normal attack. No more spending a rare item on someone you're already capturing.

---

### 6. The Bola-then-Strike combo
**Before:** The CPU never recognised that it could use the Bola *and then immediately* make the attack it enabled.  
**After:** The CPU now looks for situations where a coin-flip Lancer is protecting a high-value target. If it has a Bola in hand, it will use the Bola on the Lancer during the item phase — disabling that Lancer's counter for this turn — and then attack the valuable target safely. This is only done when the Lancer's counter is a *coin-flip*, not when it's guaranteed (Rowka/Nyss), because the Bola doesn't override those.

---

### 7. Using Magic Grenade when it has no point
**Before:** The CPU would play Magic Grenade — which temporarily turns one of its units into a Caster-class attacker — even when it already had a Caster ready to attack naturally.  
**After:** Magic Grenade is now held until there's no face-up Caster available to do the job. It's used to access Caster-range attacks when the real Casters are hidden or unavailable.

---

### 8. Brawlers now probe unknown targets
**Before:** The CPU treated all its units equally when deciding who should attack a face-down (unknown) enemy.  
**After:** Brawlers now get a scoring bonus when attacking face-down targets. This reflects their real advantage: with 2 HP, they can survive an unexpected surprise — a hidden counter-attack or a tough hidden unit — where a Lancer, Shooter, or Caster would be captured.

---

### 9. Smarter Legendary Weapon equipping
**Before:** When the CPU had a Legendary Weapon (a promotion item) and multiple units could equip it, it chose somewhat arbitrarily.  
**After:** The CPU now prefers equipping Legendary Weapons to units that already have a protective setup: a unit standing on Elevated Ground or a Reinforced Barricade, or one with a friendly Lancer standing right next to it for protection. Veterans still get priority overall. The goal is to equip the weapon to a unit that's safe enough to then go on the offensive.

---

### 10. Obscuring Bomb — new behaviour
**Before:** The CPU never used the Obscuring Bomb.  
**After:** When 2 or more of the CPU's own units are already revealed, the CPU will consider using the Obscuring Bomb to flip all units face-down again. This resets the opponent's read on the board and forces them to rediscover unit positions.

---

## Difficulty settings

| Tier | Status | Description |
|------|--------|-------------|
| **Normal** | Active (default) | All the intelligence improvements above. The CPU plays without blunders and has item/terrain awareness. |
| **Hard** | Coming Soon | Planned to add multi-turn foresight — the CPU will set up traps, anticipate your best responses, and play more deceptive openings. |

Easy difficulty has been retired. Normal is now the baseline for meaningful CPU play.

---

## What's NOT in v1 (deferred to v2)

- **Multi-turn lookahead:** The CPU doesn't yet plan 2 turns ahead or simulate "what will the player do next?" That's the Hard mode feature, planned for v2.
- **Veteran-ability sequencing:** The CPU doesn't yet strategically chain veteran abilities across turns.
- **Positional ideals:** Shooters don't specifically seek edge columns; Lancers don't specifically seek center columns. These are heuristics that could be tuned in a future pass.
