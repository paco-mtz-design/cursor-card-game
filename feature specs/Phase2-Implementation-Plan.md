# Phase 2 Implementation Plan: Animation

**Branch:** `animations`
**Prerequisite:** Phase 1 fully implemented and stable.
**Spec:** `CPU-Interaction-Feature-Spec-Phase2.md`

---

## What changes for the player

After Phase 2, every meaningful game event has a physical counterpart on screen. Attacks feel like punches. Cards slide rather than teleport. Coin flips are visible events. CPU unit reveals are genuine surprises — the card physically turns over. The game stops reading like a debug log and starts feeling like a card game.

---

## Prerequisites (do these first)

### 1. Add GSAP FLIP plugin to `index.html`
The core GSAP bundle is already loaded at version 3.12.5. The FLIP plugin is a separate file and is required for move animations (§2) and reorder swaps (§17). Add it as a second `<script>` tag immediately after the existing GSAP tag and register it (`gsap.registerPlugin(Flip)`).

### 2. Add Theater Layer child elements to `index.html`
The `#theater-layer` div exists but is empty. Four hidden children need to be added inside it:
- `#theater-coin` — the 3D coin element with `.coin__face--heads` and `.coin__face--tails` children
- `#theater-spotlight` — an amber-bordered overlay, positioned absolutely, sized and moved by JS to wrap a target card slot
- `#theater-attack-vector` — a thin line element connecting attacker to target (shown briefly)
- `#theater-banner` — a centered text announcement div

Add corresponding CSS in `style.css` for each: all hidden by default, positioned inside the Theater Layer, no pointer-events.

### 3. Upgrade EventQueue to support GSAP pauses
The current EventQueue is a plain JS object. Phase 2 adds `gsapPause(timeline)` and `gsapResume()` methods so animations can block the queue until they finish, rather than racing against game logic. The existing `resume()` / `clear()` behavior is preserved.

---

## Implementation Groups

### Group A — Combat feedback (highest priority, most-seen)

These replace the existing `flashDamageSlot` CSS flash.

| # | Animation | Description | Duration |
|---|-----------|-------------|----------|
| §3 | Attack | Attacker lunges toward target row (`translateY`), recoils. Target shakes (`translateX` rattle). Simultaneous. Pause after. | ~400ms |
| §4 | Non-attacker damage | Target-only shake. Pause if it's the primary event. | ~300ms |
| §5 | Counter-attack | Same as §3, sequential after original attack. Pause between each beat. | ~400ms |

`flashDamageSlot` is replaced by a GSAP shake on the target card element. The lunge is a GSAP `to` on the attacker card's `translateY` then back. Wire into `resolveCombat()` and `applyDamage()`.

---

### Group B — Unit selection and movement

| # | Animation | Description | Duration |
|---|-----------|-------------|----------|
| §1 | Unit selected | Subtle scale pulse (~1.04) + brightness lift on selected card. | Under 400ms |
| §2 | Unit moves between slots | GSAP FLIP: capture position before DOM move, update DOM, animate delta. | ~350ms |
| §16 | Unit placement at setup | Cards slide in from below. "Place all randomly" staggers left-to-right ~70ms apart. | ~300–400ms |

- §1 hooks into `onSelectUnit`
- §2 hooks into `doMove`
- §16 hooks into slot-click placement and "Place all randomly" flow

---

### Group C — Coin flip (Theater Layer, many call sites)

Every coin flip in the game — setup, terrain, counter, veteran, bestiary — gets the same visual treatment. The coin appears in `#theater-coin`, rotates `rotateY` by 540°+ over ~600ms, lands on the correct face, holds ~400ms, then fades. The Turn Strip narration fires as the coin lands.

**All call sites to wire:**

| Event | Coin placement |
|-------|----------------|
| Setup "Who goes first?" | Centered in setup area |
| Terrain effect attempt | Near terrain's unit slot |
| Counter-attack attempt | Near defending unit's slot |
| Veteran effect attempt | Near acting unit's slot |
| Bestiary trigger | Centered on board |

CSS needed: 3D perspective on `#theater-coin`, `.coin__face` with `backface-visibility: hidden`, two distinct face colors/labels.

---

### Group D — Card reveals

| # | Animation | Description | Duration |
|---|-----------|-------------|----------|
| §7 | Own face-down reveal | Dark overlay on card fades out with a warm light pulse. Player already knows this card — this lifts the veil. | ~700ms |
| §8 | CPU face-down reveal | Card physically flips in 3D (back rotates to 90°, front rotates from 90° to 0°). Pause after — discovery moment. | ~550ms |

Both use the same call sites (`revealAndParalyze`, capture logic, end-of-game reveals) but detect whether the cell is player-owned or CPU-owned to choose which animation fires.

CSS needed for §8: `.card--face-down` element needs a 3D container with `.card__back` and `.card__front` faces, `backface-visibility: hidden`.

---

### Group E — Items, gear, and captures

| # | Animation | Description | Duration |
|---|-----------|-------------|----------|
| §9 | Gear equipped | Gear mini-card slides in from above its final peek position and decelerates to rest. | ~300ms |
| §10 | Item used/consumed | Hand card lifts and arcs rightward toward discard area, fading. | ~280–450ms |
| §15 | Unit captured | Card lifts then arcs toward right panel, shrinking and fading. Pause after. | ~450ms |
| §19 | Card sent to discard | Arc to discard pile position. Two beats: lift off board → arc → pile updates. | ~400–500ms |
| §20 | Item use from modal | Modal close → wait for close transition → then run §9 or §10. | — |

§15 and §19 are two beats of the same sequence. `animateCardIntoHand` stub gets its full implementation as §18.

---

### Group F — Effect announcements (Theater Layer)

| # | Animation | Description | Duration |
|---|-----------|-------------|----------|
| §11 | Terrain activates | Terrain mini-card gets a warm brightness pulse after coin resolves. | ~650ms |
| §12 | Veteran effect fires | Unit card gets subtle scale pulse. Amber narration in Turn Strip. Pause after. | ~450ms |
| §13 | Interrupt entry | 3-beat sequence: spotlight on reactive card → ~700ms hold → Turn Strip transitions to interrupt state. Spotlight stays until player decides. | 3 beats |
| §14 | Bestiary column reveal | Mini-grid column transitions to full color with amber glow. Theater banner appears naming faction/effect. Holds ~1.5s then fades. Pause. | ~350ms + hold |

§13 is the most complex. The spotlight in `#theater-spotlight` must be positioned to match the reactive card's slot. Wardstone and Harlund are the two call sites to wire.

---

### Group G — Reorder mode

| # | Animation | Description | Duration |
|---|-----------|-------------|----------|
| §17 entry | Overlay fades in | Acting unit's overlay fades in before reorder activates. | Reverse of §7 |
| §17 swaps | Slot swaps | GSAP FLIP: both swapped cards slide simultaneously to new positions. | — |
| §17 exit | Overlay dissolves | Same as §7 dissolve. No pause. | ~700ms |

---

## What stays the same

- All game logic: zero changes to state management, combat resolution, CPU policy
- Event Queue structure: extended, not replaced
- All modals: behavior unchanged
- `cpu-pulse-active` and `cpu-pulse-target` CSS classes: kept as-is

---

## Files changed

| File | What changes |
|------|-------------|
| `index.html` | FLIP plugin tag; Theater Layer children |
| `style.css` | Theater Layer children CSS; 3D coin styles; spotlight; banner; FLIP-safe card container for §8 |
| `game.js` | EventQueue upgrade; ~15 call-site hooks for animations; replace `flashDamageSlot`; implement `animateCardIntoHand` |

---

## Suggested implementation order

1. GSAP FLIP plugin + Theater Layer DOM + CSS (foundation for everything)
2. EventQueue GSAP upgrade
3. Group A — Combat animations §3, §4, §5 (replaces `flashDamageSlot`)
4. Group B (partial) — §1 unit selected pulse
5. Group B (partial) — §2 unit move (FLIP)
6. Group C — §6 coin flip (all five call sites at once)
7. Group D — §7 and §8 card reveals
8. Group E — §9, §10, §15, §19 item/gear/capture arcs + §18 card draw + §20 modal close
9. Group F (partial) — §11, §12 effect pulses
10. Group F (partial) — §13 interrupt spotlight sequence
11. Group F (partial) — §14 Bestiary banner
12. Group B (partial) — §16 unit placement stagger
13. Group G — §17 reorder animations

Each group is independently testable before the next one starts.
