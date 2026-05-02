# Phase 2 Testing Guide: Animation

**How to run:** Open `index.html` in a browser, or `python3 -m http.server 8080` then visit `http://localhost:8080`.
**Browser:** Use Chrome or Firefox with DevTools open. The Console tab will show errors; the Performance tab can verify animations are GPU-composited (no layout thrash).

---

## Before you test anything

Open DevTools → Console. Any GSAP-related error here (e.g. "Flip is not defined", "gsap is not a function") means the plugin failed to load — stop and fix that first before testing any animation.

---

## Group A — Combat Animations

### §3 Attack
1. Start a game vs CPU. Get to the attack phase for any unit.
2. Select a unit and attack an adjacent CPU unit.
3. **Expect:** The attacking card briefly lunges toward the CPU row, then snaps back. Simultaneously, the target card rattles side-to-side.
4. **Expect:** A clear pause after the shake settles before the Continue button appears.
5. **Check:** The lunge direction is toward the opponent's row (upward for P1 attacking, downward for CPU attacking).
6. **Check:** No layout shift — no other cards on the board move.

### §4 Non-attacker damage
1. Set up terrain on a unit slot (or trigger a Bestiary damage effect).
2. When terrain damage fires without an attack, the affected unit should shake.
3. **Expect:** Shake only — no lunge animation (there is no attacker).

### §5 Counter-attack
1. Engineer a scenario where the CPU attacks a P1 unit that can counter (Brawler or unit in counter range).
2. **Expect:** Two distinct beats — first the CPU's attack lunge+shake, then a pause, then the reverse (P1 counter lunge+shake), then another pause.
3. **Check:** The pause between the two beats is noticeable — the sequence should feel like attack → moment of suspense → counter.

---

## Group B — Unit Selection and Movement

### §1 Unit selected
1. Click any of your own units during the select phase.
2. **Expect:** The selected card briefly brightens and scales up very slightly (~4%), then returns to rest.
3. **Check:** The effect is subtle — it directs attention, it doesn't distract.
4. **Check:** The pulse completes quickly (under 400ms) and does not loop.

### §2 Unit moves between slots
1. Select a unit and move it to an adjacent empty slot.
2. **Expect:** The card physically slides from the old slot to the new slot. It does not teleport.
3. **Check:** The slide feels like pushing a card across a table — smooth deceleration at arrival.
4. **Check:** No other cards on the board jump or reposition during the slide.
5. Also test CPU moving a unit — same animation should fire.

### §16 Unit placement at setup
1. Start a new game and reach the placement phase.
2. Click empty slots to place units one at a time.
3. **Expect:** Each placed card slides into its slot from slightly below.
4. Click "Place all randomly."
5. **Expect:** Five cards arrive in staggered sequence left to right — each one a beat after the previous, not all at once.

---

## Group C — Coin Flip

### Setup coin flip
1. Start a new game and reach the "Who goes first?" step.
2. Click "Flip coin."
3. **Expect:** A coin appears in the center of the setup area, spins in 3D (visible rotation through multiple faces), and lands showing either heads or tails.
4. **Expect:** The Turn Strip narration updates as the coin lands ("Heads — Player 1 goes first!").
5. **Expect:** The coin holds for ~400ms, then fades away.
6. **Check:** The coin face that is showing when it stops matches the narration text.
7. **Check:** Clicking "Flip coin" multiple times across different games produces both heads and tails results.

### Terrain coin flip
1. Place a unit on a terrain slot and advance to a turn where terrain activates.
2. **Expect:** Coin appears near that unit's slot (not centered).
3. **Expect:** Same flip animation, then fade. Narration follows.

### Counter-attack coin flip
1. Set up a situation where a counter-attack attempt fires (unit survives an attack, is in counter range).
2. **Expect:** Coin appears near the defending unit's slot.
3. **Expect:** Flip, land, narrate result, fade.

### Veteran ability coin flip
1. Use a unit with a veteran buff that triggers on a coin flip.
2. **Expect:** Coin appears near that unit's slot.

### Bestiary trigger coin flip
1. Reach a milestone to trigger a Bestiary reveal.
2. **Expect:** Coin appears centered on the board.

---

## Group D — Card Reveals

### §7 Own face-down reveal
1. Place a P1 unit face-down during setup.
2. During play, trigger a reveal (e.g. via a veteran ability or an action that forces reveal).
3. **Expect:** The dark blue overlay on the card gently fades away, as if a veil is being lifted. The card artwork underneath becomes fully visible.
4. **Check:** The dissolve is slow and warm (~700ms) — not a snap or a flash.
5. **Check:** The card itself does not move or scale.

### §8 CPU face-down reveal
1. Capture a CPU unit that is still face-down, or reach end-of-game.
2. **Expect:** The card physically flips in 3D — the topographic back rotates to edge-on (invisible at 90°), then the unit artwork rotates into view.
3. **Expect:** A clear pause after the flip — this is a discovery moment.
4. **Check:** The flip feels like turning a card over on a table. You see it turn, not just swap.
5. **Check:** This animation feels noticeably different from §7 — it should be a surprise, not a veil lift.

---

## Group E — Items, Gear, and Captures

### §9 Gear equipped
1. Use a gear item (e.g. equip armor to a unit on the board).
2. **Expect:** The gear mini-card appears in the unit's stack by sliding in from slightly above its final position, decelerating to rest.
3. **Check:** It does not teleport into position.

### §10 Item used/consumed
1. Use a single-use hand item (e.g. a healing potion).
2. **Expect:** The item card lifts upward from the hand and arcs toward the right side of the screen (discard area), fading as it goes.
3. **Check:** The card moves in the direction of the discard pile — directional intent should be clear.
4. **Check:** The card does not abruptly disappear.

### §15 Unit captured
1. Reduce a unit's HP to zero.
2. **Expect:** The unit card lifts slightly from its slot, then arcs toward the right panel (discard pile area), shrinking and fading as it travels.
3. **Expect:** A clear pause after the card exits — this is a significant board event.
4. **Check:** The board slot becomes empty after the card exits (not before).

### §19 Card sent to discard
1. Any card leaving to the discard pile (beyond §15 — consumed items, discarded hand cards).
2. **Expect:** Two-beat sequence: lift off current position, then arc to the discard pile.
3. **Expect:** The discard pile count updates when the card arrives.

### §20 Item use from modal
1. Open an item's zoom modal and click "Use this item."
2. **Expect:** The modal closes first.
3. **Expect:** After the modal is gone, the relevant animation plays (§9 for gear, §10 for consume).
4. **Check:** The modal and the board animation do not overlap.

---

## Group F — Effect Announcements

### §11 Terrain activates
1. After a successful terrain coin flip, watch the terrain mini-card in the unit's slot.
2. **Expect:** The terrain mini-card briefly brightens — a warm pulse of light — then returns to normal.
3. **Check:** This follows the coin flip result; it reads as cause-and-effect.

### §12 Veteran effect fires
1. Trigger a veteran ability that activates on a successful coin flip.
2. **Expect:** The unit card scales up slightly then settles — a subtle acknowledgment that this card did something.
3. **Expect:** Amber narration in the Turn Strip. Pause after.
4. **Check:** The effect is not dramatic — veteran abilities happen frequently.

### §13 Interrupt entry
1. Set up a scenario where Wardstone Bracelet or Harlund's Pack Shield triggers (CPU attacks a unit carrying one of these).
2. **Expect — Beat 1:** An amber-bordered spotlight appears around the reactive card's slot. It pulses gently.
3. **Expect — Beat 2:** After ~700ms, the Turn Strip transitions to its interrupt state (amber background, interrupt label, decision buttons).
4. **Expect:** The spotlight remains visible while you read and decide.
5. **Expect — Beat 3:** Once you click your choice, the spotlight fades and the Turn Strip returns to normal.
6. **Check:** The spotlight and strip transition feel like two separate moments — the card announces itself, then you're asked to decide.

### §14 Bestiary column reveal
1. Reach a capture milestone that triggers a Bestiary reveal.
2. **Expect:** In the right panel mini-grid, the revealed column's icons transition from grayed-out to full color with an amber glow.
3. **Expect:** Simultaneously, a centered banner appears in the Theater Layer naming the revealed faction and effect.
4. **Expect:** The banner holds for ~1.5 seconds, then fades away.
5. **Expect:** A pause after this beat before play continues.
6. **Check:** The mini-grid change is persistent — the column stays revealed after the banner fades.

---

## Group G — Reorder Mode

### §17 Reorder entry
1. Trigger reorder mode (via a unit ability like Veilstep that allows row reordering).
2. **Expect:** Before reorder mode activates, the acting unit's card gets a dark overlay fading in over the artwork — the card appears to step back.

### §17 Slot swaps during reorder
1. While in reorder mode, swap two units' positions.
2. **Expect:** Both cards slide simultaneously to their new positions. Neither teleports.
3. **Check:** The slide feels like pushing cards on a physical table. Both move at the same time.

### §17 Reorder exit
1. Press "Done reordering."
2. **Expect:** The acting unit's overlay dissolves (same as §7 own face-down reveal).
3. **Check:** No dramatic pause — reorder exit is a transition back to normal state, not a significant event.

---

## Regression Checks

Run these after all animations are implemented to confirm nothing was broken.

- [ ] New game → full game to completion with CPU works without errors
- [ ] CPU turn auto-advances correctly (Continue button fires, auto-timer fires if enabled)
- [ ] Wardstone interrupt prompts correctly during CPU turn
- [ ] Harlund redirect prompts correctly during CPU turn
- [ ] Item hand hover still reveals cards and shows action buttons (P1 below board, P2 above)
- [ ] Unit zoom modal opens and closes correctly
- [ ] Item zoom modal opens and closes correctly, "Use this item" still works
- [ ] Bestiary modal opens and reflects correct revealed/unrevealed state
- [ ] Score markers update after every capture
- [ ] Log export still works and logs are not corrupted
- [ ] "New Game" guard modal still prompts mid-game
- [ ] No console errors during a full game

---

## Animation Quality Checks

Beyond functional correctness, check these feel qualities:

- **No jank.** Open DevTools → Performance → record a few turns. Transform and opacity should be the only animating properties (green bars in the compositor layer). No layout recalculations (purple bars) during animations.
- **No racing.** Animations and game state should never be out of sync — a card should not disappear before its exit animation, or appear in its new position before the slide arrives.
- **Asymmetric timing feels natural.** Attacks lunge fast, recoil slightly slower. Reveals come in deliberately.
- **Pauses land correctly.** After attack, counter, capture, coin flip, CPU reveal, Bestiary reveal — the game pauses and lets you read what happened before continuing.
- **Frequency vs duration.** Coin flips (frequent) feel snappy. Bestiary reveals (rare) feel generous. Neither outstays its welcome.
