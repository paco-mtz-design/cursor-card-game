# Tacticlash — CPU Opponent & Interface Enhancement
## Feature Specification — Phase 1: Layout & Chrome

**Companion document:** Phase 2 spec covers all animation work and should be implemented after Phase 1 is stable and playtested.
**Status:** Ready for implementation

---

> **To the implementing agent:** This is a product specification, not an engineering blueprint. It describes *what the player experiences and why*, not how to build it. Before writing a single line of code, read the existing codebase thoroughly — especially `game.js`, `style.css`, and `index.html`. Many systems described here already exist and must be preserved exactly. Your first deliverable is a technical implementation plan for review; no code changes until that plan is approved.

---

## Why This Exists

The current Tacticlash web build is a functional prototype. Game logic is solid, but the interface communicates like a debug tool rather than a game. Events fire and resolve silently. Players cannot follow what happened during a CPU turn without reading a raw log. The visual chrome belongs to an early build — a header bar doing triple duty as title, narration, and action zone.

Phase 1 transforms this into a **consumer-grade playing experience** — the kind of polish players expect from digital card games and modern strategy games. Every change in this phase has one goal: make the game legible and satisfying to watch, turn by turn. A player sitting down for the first time should be able to follow every action without reading documentation.

Phase 2 (a separate spec) adds the animation layer that brings this chrome to life. Phase 1 lays the structural foundation that Phase 2 builds on.

---

## What Must Be Preserved Exactly

The following systems are working correctly and must not be modified:

- **Game logic in `game.js`** — all state management, turn sequencing, combat resolution, item use, Bestiary effects, veteran effects, terrain effects, scoring. Touch none of this.
- **`cpu.js`** — the scoring engine. Do not modify.
- **Item hand behavior** — both player hands currently peek from the top and bottom edges of the board. P1's hand peeks below the board, cards tucked ~70px downward, revealing and showing action buttons on hover. P2's hand peeks above the board, cards tucked ~70px upward, rotated 180° to show card backs (face-down from P1's perspective), revealing on hover. This behavior, including the overlap fan, the hover slide, and the opponent face-down rotation, must be preserved exactly.
- **All modals** — unit zoom, item zoom, discard zoom, Bestiary modal. Behavior and trigger conditions unchanged.
- **Score markers** — the dot tracker system. Moving to the right panel (see §3), but the rendering logic is preserved.
- **Discard piles** — remain on the board surface, adjacent to the unit rows alongside the deck stacks. Rendering logic preserved. Sizing scales with the card scale refactor (see §1).
- **Bestiary modal** — accessible via header button and the new right panel expand button. Modal content and behavior unchanged.
- **`animateCardIntoHand()`** — this function has a bug: its GSAP guard condition is wrong, causing it to never fire. Fix the guard from `typeof window.gsap !== 'function'` to `!window.gsap`. Also improve: start scale from ~0.88 (not 0.5) and add a slight upward translate so the card arrives rather than materializes. This is the only existing animation in the codebase — fix it, don't remove it.

---

## 1. Layout Refactor

### Goal
The board must fit comfortably on a **1280px wide viewport** (the most common laptop screen width — 13" MacBook Air/Pro and equivalent Windows laptops). 1440px should feel spacious. No horizontal scrolling at 1280px.

### Card Scale
Unit cards currently render at 179×250px. They need to scale down to approximately **120×168px**. This is not a cosmetic change — at the current size, five units plus a right panel cannot coexist at 1280px without crowding. The scale factor is approximately 0.67.

Mini-cards (terrain and gear cards that peek above the unit in a stack) must scale proportionally. Their peek distances above the unit card top edge must also scale — terrain peeks further above gear, gear peeks above the unit. The physical-cards-on-a-table depth illusion this creates must be preserved at the new scale.

Deck stacks and discard piles on the board surface also scale proportionally. Both decks (unit and item) and both discard piles live adjacent to the unit rows on the battlefield — they must resize consistently with the unit cards so the spatial relationships between them remain coherent. The implementer should derive all specific pixel values from the existing CSS variables and the scale factor, not from this document.

### Iron Clad Shield Board Fix
This is a bug fix bundled into the layout refactor because it requires the same rendering pass.

Currently, `renderBoard()` passes a unit's primary gear to the board slot renderer but ignores `cell.bonusGear`. The Iron Clad Shield Bestiary effect allows a unit to equip a second gear item — this second item is tracked correctly in game state and shown in the unit zoom modal, but it never appears in the board slot stack.

**The fix:** when rendering a board slot, pass both `cell.gear` and `cell.bonusGear` to the card stack. When `bonusGear` is present, add it as a third layer in the peek stack between terrain and primary gear. The stack order from deepest to front is: terrain → bonus gear → primary gear → unit card. Row height must accommodate the additional peek card without layout shift — check whether Iron Clad Shield is active for the current game (it's a Bestiary effect, derivable from existing Bestiary state functions) and apply additional row top spacing conditionally.

### What Stays Untouched
The board grid structure (two rows of five slots each, with the center divider), the slot interaction (click to select), the unit card face-down visual distinction between P1's own face-down units (artwork visible, dark overlay) and P2's face-down units (topographic card back), and all slot highlight states.

---

## 2. Right Panel

### What It Is
The right panel is the **permanent information sidebar** on the right side of the board. It already exists in the current build as a narrower column holding score markers and deck piles. This phase expands and restructures it into a full game companion panel.

### Height Constraint
All sections in the right panel must fit within the viewport height. The panel must never grow taller than the screen and must not produce its own vertical scrollbar. The Game Log is the one elastic section — it fills whatever vertical space remains after the fixed-height sections (Bestiary mini-grid, Score, Item Replace debug) are laid out. As the viewport shrinks or other sections grow, the Game Log contracts to absorb the difference. The Game Log itself scrolls internally; the panel as a whole does not.

### Sections (top to bottom)

**Seer's Bestiary mini-grid**
A compact at-a-glance view of the four Bestiary columns. Each column shows two icons stacked vertically: the faction icon on top, the beast avatar below. Four columns = eight icons total (4×2 grid).

Columns start in a neutral, grayed-out state before they are revealed. When a column is revealed, both icons become full color and the faction icon gains an amber highlight border. When the Bestiary effect from that column is currently influencing units on the board (i.e., at least one live unit belongs to that faction), the beast avatar gains an additional amber ring to signal active effect.

An "Expand" button in this section opens the existing full Bestiary modal — the same modal reachable from the header button. Both entry points open the same modal.

This section is only visible during active gameplay with Bestiary rules enabled. It is hidden during setup.

Icon images: use the existing faction card and Bestiary card images, CSS-cropped to the icon square. No new image assets are required for this.

**Score**
Two rows of dot trackers, one per player (CPU and You). Each row shows the player label, filled dots for captures so far, and the total capture goal. Existing score rendering logic is preserved and moved here.

**Game Log**
A scrollable running log of every game event in the current session. Color-coded by event type (see §8). Existing log entries and rendering logic are preserved and moved here. The log should fill the remaining vertical space in the panel, with scroll.

**Item Replace [DEBUG]**
A collapsible debug control for replacing the last drawn item. Collapsed by default, labeled clearly as a debug tool. Existing behavior unchanged.

### What This Replaces
This phase expands the panel with the Bestiary mini-grid, Game Log, and debug control. The game log currently lives in the right sidebar in an exposed state — it moves here with color-coding applied. The debug item-replace control moves to the collapsible section at the bottom.

### What the Right Panel Does Not Contain
- Deck stacks and discard piles (these stay on the board surface adjacent to the unit rows — do not move them)
- Turn narration (this moves to the Turn Strip — see §3)
- Action buttons (these move to the Turn Strip — see §3)

---

## 3. Turn Strip

### What It Is
The Turn Strip is a **new persistent bar at the bottom of the screen**, always visible during gameplay. It is the primary surface for turn-by-turn narration and player actions.

It replaces — not supplements — the current header action bar. The header currently serves as title, turn narration, and action button zone simultaneously. The Turn Strip takes over narration and actions entirely. The header reverts to being only the game title bar with the Bestiary and New Game buttons.

The implementing agent must treat this as a migration, not a redesign. All behavior currently in the header action zone moves to the Turn Strip as-is — the same logic, the same triggers, the same conditions. The location changes; the functionality does not.

### Normal State
During play, the strip shows two things at once: a narration message on the left describing what is happening or just happened ("CPU: Ironclad attacks your Ranger"), and a Continue button on the right. The Continue button advances the event queue (see §5). It is only visible when there is something to continue past — it hides when it is the player's turn to act, and appears after CPU actions that the player needs to acknowledge.

The strip also houses the contextual action buttons that currently live in the header — Done with items, Pass, and the move controls (Move Left, Move Right, Skip Move). These appear only when relevant to the current game phase, exactly as they do today, just in the strip rather than the header.

### Interrupt State
Several cards and item effects in the game can trigger a reactive decision mid-turn — pausing the active turn to ask the player whether to respond. When any such trigger fires, the strip transitions to an interrupt state: the background shifts to amber, an "INTERRUPT" label appears, and the narration describes what triggered and what the player can do. Two action buttons appear — one to activate the reactive effect, one to skip it. The player makes a choice; the turn then continues.

The implementing agent must audit the codebase to identify every instance where a reactive interrupt currently fires and migrate all of them to this state. The spec does not enumerate individual cards — that is the agent's job when reading the code.

This is a visual state of the strip, not a separate UI element. The transition into and out of interrupt state is an animation concern handled in Phase 2.

### Reorder State
When a unit enters reorder mode, the strip transitions to a reorder state showing a "Done reordering" button. This button currently lives in the header action zone — it moves to the strip. Behavior unchanged.

### What the Turn Strip Does Not Replace
The Bestiary reveal flow has its own modal with its own Continue button — this remains unchanged. The Turn Strip Continue is only for the main turn event queue.

---

## 4. Theater Layer

### What It Is
The Theater Layer is a transparent overlay that covers the entire board area. It sits in front of all cards visually but never blocks interaction with them. Its purpose is to host dramatic per-event animations — coin flips, attack spotlights, effect banners — that float above the board without disturbing the card DOM underneath.

### Theater Layer vs. Modals — Two Distinct Patterns
This feature introduces the Theater Layer while also preserving the existing modal system (unit zoom, item zoom, discard zoom, Bestiary modal). These are two distinct patterns serving different purposes and must not be confused or merged.

**The Theater Layer is the game speaking to the player.** It activates automatically during gameplay to narrate events — a coin flip appearing, a spotlight on a reactive card, an attack vector between units, a Bestiary reveal banner. Theater content is transient: it appears briefly, then disappears. The player does not summon it and cannot dismiss it. It is always non-interactive (pointer-events: none).

**Modals are the player speaking to the game.** They open when the player intentionally requests information — double-clicking a card to inspect it, clicking a discard pile to review its contents, opening the Bestiary to check effects. Modal content is persistent: it stays until the player dismisses it. It is fully interactive.

These patterns are additive, not redundant. A player can open a unit zoom modal while the Theater Layer is idle, and the Theater Layer can activate during a turn while no modal is open. They occupy different conceptual roles and different layers of the UI.

### Phase 1 Scope
In Phase 1, the theater layer is **added to the DOM as an empty placeholder**. It has no visible behavior. No animations run inside it yet. This is intentional — Phase 2 populates it with the full animation catalog.

Adding it now means Phase 2 can implement animations without requiring structural changes to the HTML. Phase 2 must not require any HTML or layout changes that Phase 1 did not already make.

### What Lives Here (Phase 2 preview, for context)
Coin flip animations, interrupt spotlight effects, attack vector indicators, and Bestiary reveal banners will all render inside the theater layer in Phase 2. Each event activates the relevant child element briefly, then deactivates it.

---

## 5. Event Queue

### The Problem It Solves
A CPU turn currently fires 8–15 game events simultaneously with no pacing. Everything happens at once, then the log shows the aftermath. Players cannot follow what happened. There is no sense of agency or drama in watching a CPU turn unfold.

The event queue gives every game event its own moment.

### How It Works
Every game event — whether CPU or player-initiated — becomes a discrete step in a sequence. Steps play one at a time. After meaningful events (an attack landing, a unit being captured, a coin flip resolving), the sequence pauses and the Continue button appears. The player reads what happened, then presses Continue to advance.

This applies to **both CPU and player turns**, not just CPU. The queue is the universal narration system for all game events.

The sequence is managed by a GSAP timeline (Phase 2 will wire animations into the same timeline). Phase 1 builds the logical sequencing and pause-gate behavior; Phase 2 adds the visual animation layer without restructuring the sequencing.

### Pause Policy
Not every event warrants a pause. The rule: pause when something significant and potentially surprising happened. Pause after a unit is captured. Pause after a coin flip resolves. Pause after a Bestiary reveal. Pause after an attack resolves with damage. Do not pause between the sub-steps of a single logical action (attacker moves, then target shakes — that is one event, not two pauses).

### Continue Button
The Continue button in the Turn Strip is the player's control over this pacing. It is only visible while the queue is paused at a significant gate. It disappears when the player is taking their own turn actions (choosing who to attack, using items) — in those moments, the player's own choices drive the pacing, not a Continue button.

### Replaces
The current `setTimeout`-based CPU delay chains. These should be replaced by the event queue architecture. No new `setTimeout` chains should be added.

---

## 6. Bestiary Ambient Presence

### What It Is
The Bestiary mini-grid (described in §2) gives the Seer's Bestiary a **permanent ambient presence** during the game. Currently the Bestiary only exists as a modal that players open intentionally — they receive no ambient indication of which effects are active or which columns have been revealed without actively checking.

The mini-grid solves this. It is always visible in the right panel, passively communicating the Bestiary state at a glance.

### Behavior
The grid updates automatically whenever the Bestiary state changes — on reveal, on effect activation or deactivation. It does not require the player to open anything. The Expand button is always available to open the full modal for detail.

### Preserving the Bestiary Modal
The full Bestiary modal is unchanged — its content, layout, reveal flow, and prompt behavior remain exactly as implemented. The mini-grid is additive, not a replacement. Players can still open the full modal from both the header "Seer's Bestiary" button and the Expand button in the mini-grid. Both lead to the same modal.

---

## 7. Item Detail Modal Enhancement

### Current State
When a player double-clicks an item card in their hand, a zoom modal opens showing the item card image and its rules text. The only way to then use the item is to close the modal and click Use on the hand card.

### Desired Behavior
The item zoom modal gains a **"Use" button** directly inside it. If the item is currently usable (correct game phase, item is in the player's hand, it is the player's turn), the Use button is visible and active. If not usable, it is hidden. Using an item from the modal should have the same effect as using it from the hand — identical game logic, identical outcome.

### Connection to Phase 2 Animations
In Phase 2, using any item triggers an animation. Using an item from the modal must trigger the same animation as using it from the hand card. Phase 2 must treat these as equivalent action sources. Make note of this for the Phase 2 spec.

Additionally: when a player equips gear, places terrain, or uses a single-use item from the modal, the animation catalog in Phase 2 should cover the full flow — item leaves the hand, moves to the board slot or resolves its effect. The modal should close before the animation plays.

### Also Remove
The item zoom modal currently shows a redundant plain-text summary below the rules text — a legacy field. Remove it. The card image plus the rules text are sufficient.

---

## 8. Game Log Color Conventions

### What It Is
The game log is a running record of events. Currently it renders all entries in a single default color — readable, but flat. It misses an opportunity to communicate event *type* at a glance.

### Four-Tone System
Log entries are colored by event type. The system uses exactly four tones — no others, no gradients, no per-unit colors:

- **Default (dark neutral):** General narration. State descriptions. Draw events. Most routine events.
- **Red:** Damage dealt. Captures. CPU aggressive actions. Anything bad happening to the player.
- **Amber (with a subtle warm background tint):** Reactive events. Coin flip outcomes. Terrain activations. Interrupt events. Bestiary reveals. Anything probabilistic or triggered.
- **Blue:** Player-initiated actions. Things the player chose to do.
- **Gray (slightly smaller):** System phase markers. Round boundaries. "— Round 4 begins —" style separators.

This same four-tone system applies to the Turn Strip narration text. Amber events narrate in amber in the strip; captures narrate in red; player actions in blue. The colors are lighter/warmer in the strip (dark background) and standard in the log (light background) — same semantic meaning, adjusted for background contrast.

### Application
Every existing `log()` call in `game.js` should be audited and assigned the appropriate tone. The `log()` function signature should be extended to accept a tone parameter. Existing calls without a tone default to the default color.

---

## What Is Explicitly Out of Scope for Phase 1

- All animations (coin flips, card flips, attack animations, gear equip animations, etc.) — covered in Phase 2
- Theater layer content — the container is added in Phase 1; nothing runs inside it until Phase 2
- CPU opponent logic — no CPU turn decision-making is implemented in either phase (this is a separate future feature; Phase 1/2 build the narration infrastructure)
- Distinct reorder mode visual language — current green-border approach preserved as-is
- New game setup UI changes
- Any changes to `cpu.js`
- Multiplayer / online features
- Seer's Bestiary header-lock bug

---

## A Note on Phase 2

Phase 2 is a separate specification document. It covers the complete animation catalog — every game event type, the coin flip theater, card flip animations (two distinct types for own vs. CPU reveals), interrupt entry sequence, reorder mode animation, and item equip/use/consume flows.

Phase 1 is the prerequisite for Phase 2. The theater layer, the Turn Strip, the event queue architecture, and the GSAP timeline infrastructure built in Phase 1 are the foundation Phase 2 animates. Do not begin Phase 2 implementation until Phase 1 has been playtested and confirmed stable.
