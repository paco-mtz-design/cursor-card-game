# Tacticlash — Animation Redesign, Wave 1: The Battle Stage

> **What this is.** A design brief for exploring new animations and effects for the 10 cards on Tacticlash's battle stage. It describes **what each effect is, why it exists, and how cards must behave and move according to the rules**. It deliberately says nothing about how the game looks or moves today: timing, motion, color, texture, sound and style are all yours to invent.
>
> **How to use it.** Read Part A once for context. Part B is the catalogue of effects to explore. Part C suggests a sandbox to explore them in.

---

## Part A — Context

### The game in one paragraph

Tacticlash is a two-player tactical duel card game. Each player fields a squad of five animal warriors, one card per slot, facing the opponent's squad across a small battlefield. Cards start **hidden** (face-down), so much of the game is about bluffing, probing and revealing. Each turn, one unit acts: it may step sideways, then it must attack. You win by capturing a set number of enemy units. Here, a human plays against a computer opponent (the "CPU").

### The battle stage

```
            col 1    col 2    col 3    col 4    col 5
Opponent  [  card ][  card ][  card ][  card ][  card ]   ← faces down the board
          ─────────────────────────────────────────────
You       [  card ][  card ][  card ][  card ][  card ]   ← faces up the board
```

- Two rows of five slots, facing each other. The player's row is closest to them. The opponent's row mirrors it, so column 1 faces column 1.
- Each slot holds **one card** or is **empty** (after a capture, until a replacement arrives).
- A card is either **face-down** (identity hidden from the opponent) or **face-up** (identity public). You can always identify your own cards, even face-down. A face-down card of yours is *hidden from them, known to you*, and the design needs to make that distinction readable.
- Cards can carry attachments: equipment on the card, or terrain under the slot. Attachments are out of scope for Wave 1, but cards must still read clearly when something is attached.

### How units reach each other

Every unit belongs to one of four classes. A class decides **which slots it can attack**, measured by columns, always against the opposite row.

| Class | Reaches | Positional picture | Class trait |
|---|---|---|---|
| **Brawler** | The card directly opposite | straight ahead, same column | Tough: survives 2 hits; everyone else survives 1 |
| **Lancer** | Diagonally forward, one column left or right | short diagonal | **Counter**: guards nearby allies (see below) |
| **Shooter** | Any card at least two columns away | long diagonal | **Longshot**: hits harder firing from one edge of the board to the other |
| **Caster** | Any enemy card, anywhere | anywhere | **Paralysis**: a target that survives the hit is frozen for a turn |

**The Lancer's counter.** When an enemy attacks, a Lancer on the defending row whose diagonal reach covers the attacker can try to intercept, even if the Lancer isn't the target. It's a gamble. If it works, the attack is blocked and the *attacker* takes the hit instead. If it fails, the attack goes through. A few elite Lancers counter without fail.

**Veterans.** Some units are *veterans* with a unique ability. These trigger at specific moments: when attacking, when hit, when an ally is hit, when capturing, when countering. The rest are *rookies*.

### The rhythm of a turn on the stage

1. **Choose** one of your units to act. If it was face-down, it is revealed.
2. **Move** (optional): step one slot left or right. The unit swaps places with whatever ally is there. Only the acting unit can move, and only one step.
3. **Attack** (mandatory): pick an enemy card in reach.
4. **Defenses resolve** before the target is exposed: a Lancer counter attempt, an ally stepping in to take the hit (a veteran ability), and so on.
5. **The target is revealed**, then **hit**: it takes damage, may be paralyzed, and is **captured** if it has no health left.
6. **Abilities** that trigger on any of these moments fire.

Exactly one unit acts per turn. The opponent's turn follows the same rhythm, mirrored.

### Fog-of-war rules effects must respect

- Units **enter face-down**.
- **Moving reveals the mover**, but **not** the ally it swapped with. That ally stays hidden, so the swap must not expose it.
- **Attacking reveals both** the attacker and the target.
- Once revealed, a card stays face-up unless an effect hides it again (see the reorders in Part B).

### Who is watching

- Effects play out on **both sides**: your cards act, and the CPU's cards act against you. Each effect must read clearly from the player's seat whether it's happening on their side or the opponent's.
- The player is sometimes **acting** (their turn) and sometimes **watching** (the CPU's turn, step by step). Effects should work for both.

### Sequencing

Many effects chain within a single attack: reveal → move → strike → counter → damage → capture → ability. **Each link must read as its own beat**, so the player can follow cause and effect. The order of the chain is fixed by the rules. How long each beat lasts, and how beats overlap, is a design decision.

### What we're after

- **Physicality.** Cards should feel like real objects with weight: flipped, slid, struck, knocked away.
- **Class identity.** A Brawler's attack shouldn't look like a Shooter's. Each class's reach is part of its personality.
- **Readability.** At any moment, the player should be able to tell who is acting, who is targeted, and what just happened.

### Out of scope for Wave 1

Leave these alone for now; later waves will cover them.

- Anything in a player's hand, the decks or the discard piles, including cards traveling to or from them. For captures, Wave 1 covers the card **leaving the stage**, not where it lands.
- Equipment or terrain cards being placed on, attached to or removed from the stage, and terrain reacting during combat.
- The pre-match setup: cards being dealt into slots, arranging your line-up, and the whole squad flipping face-down as the match starts.
- Replacement units arriving into empty slots mid-game.
- Turn banners, messages, buttons, prompts, coin flips, the score, the game log, the Bestiary, card-inspection pop-ups and the card catalogue.
- Item-driven interrupts and "armed power" indicators.

---

## Part B — Wave 1 effects catalogue

Sixteen effects in five families. Each lists what happens on the stage, why it exists, when it happens, the rule constraints any design must respect, and **open questions** to spark exploration. The open questions are prompts, not answers.

### Family 1 — Attention & intent

#### 1. Hover, selectable and selected
- **What happens:** During a turn, the stage signals which cards or slots are valid for the current step: which of your units can act, which slots the acting unit can step into, which enemy cards are in reach. Pointing at a valid option acknowledges it. A chosen option stays marked as selected.
- **Why:** Teaches the rules in the moment. The player sees their options without memorising reach patterns.
- **When:** Throughout the player's turn. What counts as valid changes with each step (choose → move → attack), and when an effect asks the player to pick a card.
- **Constraints:** "Available", "pointed at" and "chosen" are three distinct states. Valid targets follow the class reach patterns in Part A.
- **Open questions:** Could the signal show *reach*, like a Lancer's diagonal or a Shooter's long line, rather than only highlighting cards? Should enemy targets feel different from your own units?

#### 2. Choosing the acting unit
- **What happens:** The player commits to the one unit that will act this turn. It becomes the focus of the turn.
- **Why:** Marks the start of the action. Everything that follows comes from this card.
- **When:** Step 1 of the player's turn.
- **Constraints:** If the unit was face-down, choosing it also reveals it (see effect 3).
- **Open questions:** How does a card "step up" without leaving its slot? Does it feel different per class, or for veterans?

#### 3. The CPU's intent
- **What happens:** On the CPU's turn, before each step, the stage shows which CPU card is about to act and, when relevant, which of your cards it's targeting or which slot it's moving to. The player then lets the step play out.
- **Why:** The player is watching, not acting. They need to anticipate the move and feel the threat before it lands.
- **When:** Before each CPU step: choosing, moving, attacking, using an effect. The marks clear as the step plays out.
- **Constraints:** Two roles to distinguish: the **actor** (a CPU card) and the **target** (usually your card, sometimes a slot).
- **Open questions:** Can intent feel like a held breath, or a wind-up? Should the target feel endangered rather than just highlighted?

### Family 2 — Revealing

#### 4. Your hidden card going public
- **What happens:** One of your face-down cards is revealed. You already knew what it was, but now the opponent knows too.
- **Why:** Revealing is a strategic cost. The player should feel they have shown their hand.
- **When:** When your face-down unit acts, moves, or is attacked.
- **Constraints:** This is **not** a surprise for the player. Treat it differently from effect 5.
- **Open questions:** What does losing your cover feel like, as opposed to being caught off-guard?

#### 5. A hidden card is unmasked
- **What happens:** A face-down card turns face-up and its identity is exposed for the first time. Most often this is an enemy card, as when you attack it or the CPU acts with it.
- **Why:** One of the game's biggest moments: discovery. It may confirm a guess or bring an unpleasant surprise.
- **When:** When an attack targets a hidden card, or when a hidden opposing card acts or moves. In combat it happens **before** the hit lands, so the player sees who they struck.
- **Constraints:** It happens in place, without leaving the slot. Nothing else should happen to that card until the reveal finishes.
- **Open questions:** A physical flip, a tear, a dissolve? Does a veteran reveal land harder than a rookie's? How does it feel to reveal a dangerous Lancer that's about to counter you?

### Family 3 — Physical movement

#### 6. Stepping and swapping
- **What happens:** The acting unit moves one slot left or right. If an ally occupies that slot, the two **trade places**. If the slot is empty, the unit simply moves into it.
- **Why:** Repositioning changes who can reach whom. It's the setup for the attack.
- **When:** Step 2 of a turn, either side. It's optional and happens at most once.
- **Constraints:** Movement is only sideways within your own row, one step. The mover is revealed. **The swapped ally stays hidden**: if it was face-down, it must arrive face-down. Anything attached to the cards travels with them, except terrain, which stays in its slot.
- **Open questions:** Do cards pass over, under or around each other? Does a heavy Brawler move differently from a nimble Shooter?

#### 7. Stepping in to take the hit (Harlund's "Pack Shield")
- **What happens:** An ally is about to be hit. Harlund, a veteran standing right next to that ally, swaps places with it and takes the hit instead.
- **Why:** A protective, heroic beat. A bodyguard jumping in front of an arrow.
- **When:** Mid-attack, after the target is chosen and before the hit lands. Harlund's owner chooses whether to use it.
- **Constraints:** Harlund can only protect an **adjacent** ally in the same row. If Harlund is face-down, he is revealed first, then the swap happens, then the attack resolves against Harlund.
- **Open questions:** How does this swap feel more urgent or deliberate than a normal move (effect 6)?

#### 8. Vanishing back into the shadows (Ardan's "Veilstep")
- **What happens:** After his attack lands, the veteran Ardan turns face-down again. His owner can then shuffle him among any face-down allies, so the opponent loses track of where he is.
- **Why:** Misdirection. The opponent just saw him, and now they can't follow him.
- **When:** Right after Ardan's attack hits, if he has at least one face-down ally.
- **Constraints:** Only Ardan and his **face-down** allies take part. Face-up allies stay where they are. The shuffle consists of position swaps within the row.
- **Open questions:** How do you make the opponent *lose track* in a way that reads as intentional, not as a glitch?

#### 9. Regrouping under cover (Obscuring Bomb)
- **What happens:** All of a player's units turn face-down at once, then the owner rearranges them by swapping positions within their row.
- **Why:** A full reset of the opponent's knowledge. Everything they had learned about your line-up is wiped.
- **When:** On the owner's turn, when they trigger it. The item itself is out of scope; only what happens to the cards is in scope.
- **Constraints:** Every card of that player's row flips down first, then the swaps follow. Nothing on the other row changes.
- **Open questions:** How does a whole row "going dark" read, compared to one card flipping? Can the regroup feel like a single smoke-screen moment rather than a series of swaps?

### Family 4 — Combat

#### 10. The attack
- **What happens:** The acting unit strikes one enemy card within its reach.
- **Why:** The central action of every turn. It should land with impact and show *who hit whom from where*.
- **When:** Step 3 of a turn, either side.
- **Constraints:** Attacker and target are both revealed if hidden; the target is revealed just before the hit. The geometry depends on class (Part A): straight ahead, short diagonal, long diagonal, or anywhere. The attack can be **blocked** by a counter (effect 11), in which case it never reaches the target.
- **Open questions:** **This is the main canvas for class identity.** A Brawler charges straight ahead, a Lancer thrusts diagonally, a Shooter fires across the board (with extra drama for an edge-to-edge Longshot), and a Caster strikes from anywhere with paralysing magic. Do veteran attacks get extra flourish? Does attacking a hidden card feel different, like a gamble?

#### 11. The counter
- **What happens:** A defending Lancer intercepts an incoming attack. If it succeeds, the attack is stopped and the **attacker** takes the hit. If it fails, the attack continues to its target.
- **Why:** The game's signature defensive moment. It punishes careless attacks.
- **When:** After the attacker commits and before the target is struck.
- **Constraints:** The Lancer needn't be the target. It's whichever defending Lancer has the attacker in its diagonal reach. If the Lancer is face-down, it is revealed first. Both outcomes, blocked and not blocked, need a design.
- **Open questions:** How does a counter visibly "catch" an attack in flight? How is a failed counter attempt shown without it looking like nothing happened?

#### 12. Taking a hit and surviving
- **What happens:** A card is hit and loses health but stays on the stage.
- **Why:** Confirms the hit landed and shows the card is now weakened.
- **When:** After a successful attack or counter.
- **Constraints:** The card stays in its slot. It moves into the damaged state (effect 15). A Caster's hit may also paralyse it (effect 16).
- **Open questions:** Should the impact echo the attacker's class? Should a Brawler absorbing its first hit feel different from a weaker unit barely surviving?

#### 13. Capture
- **What happens:** A card with no health left is knocked off the stage, leaving its slot empty.
- **Why:** The scoring moment. Every capture brings a player closer to victory, so it should feel decisive.
- **When:** Immediately after a lethal hit. It can happen to either side, including to an attacker defeated by a counter.
- **Constraints:** The final hit lands first, then the card leaves. The slot stays visibly empty. **Where the card goes afterwards is out of scope**; Wave 1 is about the card leaving.
- **Open questions:** Knocked back, shattered, swept away? Does capturing your opponent feel different from losing your own unit?

### Family 5 — States & abilities

#### 14. A veteran ability fires
- **What happens:** A veteran's unique ability triggers: on attack, when hit, when an ally is hit, on capture, or on counter. Examples include an extra hit after a counter, a heal on capturing an enemy, or a second strike at a neighbouring card.
- **Why:** Veterans are the stars of the squad. The player should notice *that* an ability fired and *whose* it was.
- **When:** At the moment in the chain the ability names, on either side.
- **Constraints:** The ability belongs to one specific card, and the effect should come from it. Some abilities also involve another card, such as a target or an ally.
- **Open questions:** One shared "veteran moment" language, or variations by kind of ability (offensive, defensive, sneaky)?

#### 15. Damaged (wounded but alive)
- **What happens:** A card that has taken damage but survived stays on the stage, visibly weakened, until it is healed or captured.
- **Why:** Players need to see at a glance which cards are one hit from capture.
- **When:** A persistent state that starts when the card survives a hit.
- **Constraints:** It must coexist with face-up or face-down, selection marks and paralysis. Some cards can absorb more than one hit, so the state may show *how* wounded a card is.
- **Open questions:** Physical wear on the card itself (cracks, tilt, darkening) versus a separate indicator?

#### 16. Paralyzed
- **What happens:** A card hit by paralysing magic is frozen. It cannot move, attack or counter on its owner's next turn, then it recovers.
- **Why:** Paralysis is the Caster's signature. The player must see which cards are out of action and when they return.
- **When:** It starts when a Caster's hit lands on a survivor and wears off after the frozen turn. There are three moments to design: **being paralysed**, **staying frozen**, and **breaking free**.
- **Constraints:** It must coexist with the damaged state and with face-up or face-down. A paralysed Lancer cannot counter, so the state needs to read as "disarmed".
- **Open questions:** Ice, stone, binding vines, a magic seal? How does it read at a glance across the board?

---

## Part C — Suggested sandbox

A minimal stage for exploring and comparing these effects:

- Two rows of five slots with **placeholder cards**: each labeled with its class, rookie or veteran, and a visible front and back.
- A control panel to **trigger any effect** on either side: choose actor, target and outcome (blocked or not, lethal or not).
- The ability to **chain** effects in the order a real turn produces (for example: reveal → step-swap → Lancer attack → counter fails → hit → capture) to judge pacing across beats.
- A way to set **persistent states** (face-down, damaged, paralysed) on any card, to check that they coexist with the momentary effects.
