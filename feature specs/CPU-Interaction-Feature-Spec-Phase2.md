# Tacticlash — CPU Opponent & Interface Enhancement
## Feature Specification — Phase 2: Animation

**Prerequisite:** Phase 1 spec fully implemented and confirmed working.
**Status:** Do not begin until Phase 1 is complete.

---

> **To the implementing agent:** Phase 1 built the structure — the Turn Strip, the Theater Layer container, the Event Queue, the Right Panel. Phase 2 brings all of it to life. Read the Phase 1 spec before this one. Every animation in this document assumes Phase 1's DOM and architecture are in place. Before writing a single animation, read the existing `game.js`, `style.css`, and the GSAP documentation for the techniques referenced here.

---

## Why Animation

Phase 1 makes the game legible. Phase 2 makes it feel alive.

A card game without animation is a spreadsheet. Players need to *feel* the weight of an attack, the suspense of a coin flip, the surprise of a CPU card being revealed. These are not decorative concerns — they are how a player understands what happened, forms emotional attachment to the outcome, and wants to play again.

The benchmark is consumer digital card games — games like Hearthstone, Legends of Runeterra, or Slay the Spire. Not in visual fidelity, but in *responsiveness*. Every action gets feedback. Every outcome has a moment. Players never wonder "did that work?"

---

## Animation Philosophy

Before specifying individual animations, the implementing agent must internalize these principles. They apply to every single animation in this document.

**Only animate transform and opacity.** Never animate width, height, top, left, margin, padding, background-color, or any property that causes the browser to recalculate layout. Transform and opacity are GPU-composited — they are fast, smooth, and never cause jank. If an animation seems to require moving an element to a new position, use GSAP FLIP (see below).

**Asymmetric timing feels natural.** Things entering a scene should arrive slightly slower than they leave. A card surging forward for an attack lunges fast and recoils faster. A reveal dissolves in slowly, then snaps away. Symmetric ease-in-out reads as mechanical.

**Never start from zero.** An element appearing from `scale(0)` or `opacity(0)` alone feels like a software glitch. Start entering elements from approximately 85–95% of their final scale, with a slight translate in the direction of arrival. This creates the perception of motion through space rather than objects materializing from nothing.

**Springs for interactive moments.** Player-initiated actions benefit from a slight overshoot — a `back.out` ease that goes just past the target then settles. It communicates responsiveness and physicality. CPU actions can be slightly more deliberate.

**Frequency determines duration.** Coin flips happen every few turns — they must be fast and readable, not cinematic. A Bestiary reveal happens once per game — it can breathe more. Match the duration to how often the player will see this animation. Repeating animations that run long become annoying by the third turn.

**Stillness is punctuation.** A brief hold after an animation resolves — before the Continue button appears — lets the player process what happened. 200–400ms of stillness after a significant event is not wasted time. It is the period at the end of the sentence.

---

## Why GSAP

GSAP (GreenSock Animation Platform) is already loaded in the project at version 3.12.5. It is the industry standard for web animation for good reason: it handles transform sequencing, timeline orchestration, easing curves, and FLIP animations in ways that CSS transitions alone cannot.

Three GSAP capabilities are essential for this feature:

**Timelines** allow chaining animations into sequences with precise timing relationships. The event queue (Phase 1) is built on a GSAP timeline — animations are added to this same timeline so they play in sync with game logic, not racing against it.

**GSAP FLIP** captures the position of an element before a DOM change, then animates from the old position to the new one after the DOM updates. This is the correct technique for animating units moving between board slots, gear cards appearing in the stack, and reorder swaps — situations where the DOM moves the element and you want the move to feel physical rather than teleport.

**The FLIP plugin is a separate file** from the core GSAP bundle and must be loaded explicitly. Confirm it is added to `index.html` alongside the core GSAP script before implementing any FLIP animations.

Custom easing curves should be used throughout. GSAP's named eases (`power2.out`, `power3.in`, `back.out(1.4)`) cover most needs. Avoid the default `ease` — it is generic and reads as placeholder animation.

---

## The Theater Layer

Phase 1 adds the Theater Layer as an empty DOM container over the board. Phase 2 populates it.

The Theater Layer hosts animations that float *above* the board without belonging to any specific card. It never blocks interaction with cards beneath it. Individual elements inside it are activated briefly for one event, then reset and hidden.

Four types of content live in the Theater Layer:

**The coin** — a 3D CSS element that flips to resolve probabilistic outcomes. Always temporary.

**The spotlight** — an amber-bordered overlay that surrounds a specific card to draw attention to it. Used for interrupt announcements and Bestiary reveals.

**The attack vector** — a visual indicator connecting attacker to target during an attack beat. Brief.

**Effect banners** — centered text announcements for Bestiary reveals and significant veteran effects. They appear, hold, then dissolve.

Each of these is implemented as a child element of the Theater Layer container. They are hidden by default and shown only during their relevant animation beat.

---

## Animation Catalog

### 1. Unit Selected

**When:** A unit is selected to act — either by the player clicking it or the CPU choosing it.

**What the player sees:** The selected unit's card brightens slightly and grows almost imperceptibly — a subtle pulse that communicates "this one is acting." It does not distract from reading the board; it simply directs attention. The effect resolves quickly and the card returns to resting state.

**Duration:** Under 400ms total. No pause — this is setup for the real action, not an event in itself.

---

### 2. Unit Moves Between Slots

**When:** A unit moves left or right during the move phase.

**What the player sees:** The card physically slides from its current slot to the destination slot. The movement should feel like pushing a card across a table — smooth, with a slight deceleration at arrival. It does not teleport. It does not fade out and reappear.

**Technique:** GSAP FLIP. The DOM update happens instantly (the card is placed in the new slot), but GSAP captures the position before and after and animates the delta. The card appears to glide across the board surface.

**Duration:** ~350ms. No pause — movement is a setup step before attack.

---

### 3. Attack

**When:** A unit attacks another unit. This is the most frequent significant event in the game.

**What the player sees:** Two beats happen in tight sequence — the attacker and the target respond simultaneously, not one after the other.

The attacker lunges toward its target — a short, fast translate in the direction of the opposing row — then recoils back to its original position. The lunge is fast and aggressive; the recoil slightly slower. It should feel like a punch, not a drift.

Simultaneously, the target shakes — a rapid horizontal rattle that communicates impact. The shake resolves as the attacker recoils. After both settle, the damage marker on the target updates to reflect the new damage total.

**Duration:** ~400ms combined. **Pause after this beat** — the player should see the result before continuing.

---

### 4. Damage Without an Attacker

**When:** A unit takes damage from a non-attack source — terrain effect, Bestiary ability, veteran effect.

**What the player sees:** The affected unit shakes, same as the target shake in an attack. No lunge — there is no attacker to animate. The shake alone communicates that something harmful happened to this card.

**Duration:** ~300ms. Pause only if this damage is the primary dramatic beat of the event (e.g. terrain damage is the whole event, not a side effect).

---

### 5. Counter-Attack

**When:** A unit in counter range survives an attack and successfully counters.

**What the player sees:** The same attack animation as §3, with attacker and defender roles reversed. It plays as its own beat after the original attack resolves — not simultaneously. The sequence reads: attack lands → pause → counter-attack lands → pause.

The asymmetry is important. If the player attacks and the CPU counters, the player should feel the original attack land, have a moment, then feel the counter come back. The pause between them is the suspense.

**Pause after the counter-attack beat.**

---

### 6. Coin Flip

**When:** Any probabilistic outcome in the game. This is more frequent than players might expect — terrain effects, counter attempts, veteran abilities, and Bestiary triggers all use coin flips.

**What the player sees:** A coin appears in the Theater Layer, spins through the air, and lands showing either heads or tails. The result is immediately narrated in the Turn Strip. The coin holds for a moment so the player can read it, then fades away.

The coin is a 3D CSS element with two distinct faces — heads and tails visually differentiated by color and label. It flips in 3D using `rotateY`, spinning at least 540 degrees (so the player sees it spin through multiple faces before landing). The final rotation determines which face is showing when it stops.

**Coin placement:** For terrain and veteran effects tied to a specific unit, the coin appears near that unit's slot — not centered on the board. For pre-game and Bestiary flips, it appears centered.

**Duration:** The total flip-to-result moment should be approximately 600ms — fast enough to not feel like waiting, long enough to feel like a real flip. The result holds for an additional ~400ms before fading.

**Result communication:** Immediately after the coin settles, the Turn Strip narration updates: "Heads — terrain activates." or "Tails — counter fails." Use amber tone. The narration and the visible coin face say the same thing simultaneously.

**Pause after every coin flip result.** The player should read the outcome before the game continues.

**All uses of coin flip in the game:**

| Event | Where the coin appears |
|---|---|
| Pre-game "Who goes first?" | Centered in the setup area |
| Terrain effect attempt | Near the terrain's unit slot |
| Counter-attack attempt | Near the defending unit's slot |
| Veteran effect attempt | Near the acting unit's slot |
| Bestiary effect trigger | Centered on the board |

**Pre-game coin flip:** The same coin component is used in the setup "Who goes first?" step. It replaces the current static text button interaction. After it resolves, the result text and Continue button appear as normal. The coin sets the tone for the entire session — the first thing the player sees should feel like the game is worth playing.

---

### 7. Own Face-Down Reveal

**When:** A player's own unit that was placed face-down is revealed.

**This is not a flip animation.**

The player already knows what this card is — they placed it. The card's artwork has always been visible to them. What changes is the dark blue semi-transparent overlay that signals "this card is face-down from the opponent's perspective." The reveal lifts that overlay.

**What the player sees:** The dark overlay on the card dissolves gently — not snapping off, but fading with a slight warm light pulse that makes the artwork feel like it's coming into the light. The card was always there; the veil lifts.

**Duration:** ~700ms. The dissolve is slower and more deliberate than other animations — it's a quiet moment, not a dramatic one. Pause if it's a significant narrative beat.

---

### 8. CPU Face-Down Reveal

**When:** A CPU unit that was face-down (showing the topographic card back) is revealed — typically when captured or at end of game.

**This is a completely different animation from §7, and must feel completely different.**

The player does not know what this card is. The reveal is a discovery moment.

**What the player sees:** The card physically flips in 3D — the topographic card back rotates away (like a card being turned face-up on a table), and the unit's artwork rotates into view from behind. Two distinct phases: the back face rotating to 90° (edge-on, invisible), then the front face rotating from 90° to 0° (fully facing the player). The swap between back and front happens at the invisible midpoint.

The result is a genuine flip — slow enough to read as a physical object turning, fast enough to feel decisive.

**Duration:** ~550ms total. **Pause after CPU reveal** — this is a discovery moment, let the player take it in.

---

### 9. Item Equipped (Gear Enters the Stack)

**When:** A unit equips a gear item — whether from the player's item hand directly, or via the item zoom modal.

**What the player sees:** The gear mini-card appears in the unit's board slot stack — the card seems to arrive from above and settle into its peek position behind the unit card. It does not teleport into position. It slides in from slightly above its final resting place and decelerates to a stop, as if being placed on top of the stack.

**Action source does not change the animation.** Whether the player tapped Use on the hand card or pressed Use inside the item zoom modal, the animation is the same. The modal closes first, then the animation plays.

**Duration:** ~300ms. No pause — equipping gear is a player action; they initiated it.

---

### 10. Item Used / Consumed

**When:** A single-use item is activated (immediately consumed), or gear is removed from a unit's slot.

**What the player sees:** For hand items — the item card lifts upward from the hand and arcs toward the discard pile area on the right panel, fading as it goes. It does not abruptly vanish. For board gear removal — the gear mini-card in the stack lifts slightly upward and fades out before the board re-renders without it.

In both cases, the card moves in the direction of the discard pile — toward the right side of the screen. The arc does not need to be precise; directional intent is sufficient.

**Duration:** ~280–450ms depending on distance. **Pause if this use was the primary dramatic action** (e.g. Wardstone activation — see §13). No pause for routine item consumption during the player's item phase.

---

### 11. Terrain Effect Activates

**When:** A terrain card's coin flip resolves positively and the terrain effect applies.

**What the player sees:** The terrain mini-card in the affected unit's slot briefly brightens — a warm pulse of light across the card image — before returning to its normal appearance. Combined with the coin flip animation (§6) and the amber narration in the Turn Strip, this creates a clear cause-and-effect sequence: flip → terrain card glows → effect applies.

**Duration:** ~650ms for the pulse. This follows the coin flip, which already has its own pause. Narrate the result in amber tone.

---

### 12. Veteran Effect Fires

**When:** A unit's veteran ability activates after a successful coin flip.

**What the player sees:** A subtle pulse on the unit card — a slight scale increase that settles back — communicating that this unit did something. The narration in the Turn Strip carries the explanation; the animation just signals "this card acted." It should not be dramatic — veteran effects happen relatively often.

**Duration:** ~450ms. Narrate in amber tone. Pause after the result.

---

### 13. Interrupt Entry

**When:** Any reactive card or item effect detects its trigger condition during an active turn and pauses play for a player decision. Multiple cards in the game have this behavior — the implementing agent must identify all of them by auditing the codebase rather than assuming a fixed list.

**This is a sequence, not a single animation.** It unfolds in three beats:

**Beat 1 — Spotlight:** The card carrying the reactive item is spotlighted in the Theater Layer. An amber-bordered overlay surrounds that card's slot and pulses gently — a glow that says "this card wants your attention." The spotlight appears before anything else happens, before the player is asked to decide.

**Beat 2 — Strip transition:** After the spotlight establishes (~700ms), the Turn Strip transitions to its interrupt state — amber background, interrupt label, narration describing what triggered, and the two choice buttons. The strip's visual change should feel like the game shifting gears — something different is happening.

**Beat 3 — Player decides:** The spotlight remains active while the player reads and chooses. Once the player makes their choice, the spotlight fades and the Turn Strip returns to normal state. The CPU turn continues.

The purpose of the spotlight beat before the strip transition is to give the player's eye somewhere to look before presenting them with a decision. The card announces itself; then the decision appears.

---

### 14. Bestiary Column Reveal

**When:** A milestone is reached and a Bestiary column is revealed.

**What the player sees:** Two things happen simultaneously — in the right panel's Bestiary mini-grid, the revealed column's icons transition from grayed-out to full color with an amber glow. In the Theater Layer, a centered effect banner appears naming the revealed faction and bestiary card effect. The banner fades after holding for approximately 1.5 seconds.

The right panel update is the persistent change — the column stays revealed. The theater banner is the momentary announcement.

**Duration:** The reveal feel should be more generous than most other animations — Bestiary reveals are rare (once per milestone). Allow ~350ms for the mini-grid transition and the banner entrance, then the banner holds before fading. **Pause after this beat.**

---

### 15. Unit Captured

**When:** A unit's HP reaches zero and it is removed from the board.

**What the player sees:** The unit card lifts slightly, then arcs toward the right panel (toward the discard pile area), shrinking and fading as it travels. It does not snap to zero opacity or instantly disappear. The arc communicates destination — the card is going somewhere, not just ceasing to exist. After the card exits, the board slot is empty and the discard pile count updates.

**Duration:** ~450ms. **Pause after a unit capture** — this is a significant board state change.

---

### 16. Unit Placement at Game Start

**When:** Units are placed onto the board during setup — either one at a time (player clicks a slot) or all at once ("Place all randomly").

**What the player sees:** Each placed unit card slides into its board slot from slightly below — arriving from the direction of the placement hand area beneath the board. The card decelerates into position.

For "Place all randomly," all five placements stagger — each card arrives a beat after the previous one, left to right. The stagger makes five simultaneous placements feel like five distinct events rather than one mass appearance.

**Duration:** ~300–400ms per card, ~70ms stagger between cards for the random placement. No pause — setup flow, not a dramatic beat.

---

### 17. Reorder Mode

**When:** A unit enters reorder mode, allowing the player to rearrange the row.

**Three animation moments exist in this flow:**

**Entry:** Before reorder mode activates, the acting unit (the one initiating the reorder) flips face-down. This uses the own face-down animation in reverse — the dark overlay fades in over the artwork rather than fading out. This communicates that the unit is stepping back, making the row arrangement a team decision rather than a solo action. After the overlay appears, reorder mode opens immediately without additional pause.

**Slot swaps during reorder:** When the player swaps two units' positions, both cards slide to their new positions simultaneously using GSAP FLIP — the DOM updates, and GSAP animates both cards gliding to their new locations. Neither card teleports. The swap should feel like sliding cards on a physical table.

**Exit:** When the player presses "Done reordering," the acting unit's overlay dissolves (same as own face-down reveal, §7) and normal play resumes. No dramatic pause — reorder exit is a transition back to normal state.

---

### 18. Card Drawn From Deck

**When:** A player or the CPU draws a card from a deck — item deck or unit deck — at the start of a turn or during a draw phase.

**What the player sees:** A card lifts from the top of the deck stack on the board surface and slides into the appropriate hand — downward into P1's item hand below the board, or upward into P2's item hand above the board. The card starts as a card back (face-down) and arrives in hand as a card back; no reveal happens at draw time. For P1, the card fans into the existing hand formation; for P2, a new card back appears in the fan.

The deck stack on the board updates its count as the card leaves. If the deck is empty after the draw, it shows empty state.

**Spatial continuity matters here.** The card must appear to travel from the deck's position on the board to the hand's position. This creates the physical coherence that makes the battlefield layout meaningful — players understand where cards come from.

**Duration:** ~350ms. No pause — drawing is a setup action, not a dramatic beat in itself.

---

### 19. Card Sent to Discard

**When:** A card leaves the game to the discard pile — a consumed item, a captured unit, or a discarded hand card.

**What the player sees:** The card lifts from its current position (board slot for captured units, hand for used items) and arcs toward the relevant discard pile on the board surface — the unit discard pile or the item discard pile, whichever matches the card type. The card shrinks and fades as it travels, landing at the discard pile's position. The discard pile's count and card stack visual update when the card arrives.

As with card draw, the spatial path is the point — the arc tells the player where the card went. The discard pile must be in its correct position on the board surface (adjacent to the unit rows) for this animation to make sense.

For captured units specifically, this animation follows the Unit Captured animation (§15) — the unit lifts off the board, then arcs to the discard pile. They are two beats of the same sequence, not two independent animations.

**Duration:** ~400–500ms depending on travel distance. **Pause after a unit is discarded** (significant event). No pause for routine item consumption.

---

### 20. Item Use From Modal

**When:** A player uses an item directly from the item zoom modal (the "Use this item" button added in Phase 1).

**What the player sees:** The modal closes first. Then, after the modal is gone, the item animation plays as normal — the card lifts from the hand and arcs to its destination, or gear slides into the board stack, depending on the item type. The player sees the result on the board, not obscured by the modal.

**This is not a separate animation.** It uses the appropriate existing animation from this catalog (§9 for gear equip, §10 for item use/consume). The modal closure is the only additional step. Ensure the modal close transition completes before the board animation begins — they should not overlap.

---

## Phase 2 Exclusions

These are things Phase 2 does not do:

- CPU opponent decision-making logic — not part of either phase
- Sound effects — out of scope entirely
- Particle effects or complex shaders — the animation philosophy here is restraint; no visual excess
- Any layout or structural changes to the DOM — Phase 1 owns structure; Phase 2 only animates what Phase 1 built
