# Tacticlash — Start sequence UI refactor

---

**To the implementing agent:** This is a product specification, not an engineering blueprint. It describes *what the player experiences and why*, not how to build it. Before writing a single line of code, read the existing codebase thoroughly — especially `game.js`, `style.css`, and `index.html`. Many systems described here already exist and must be preserved exactly. Your first deliverable is a technical implementation plan for review; no code changes until that plan is approved.

---

## Why This Exists

The current start sequence evolved from early prototypes into a stitched series of controls and patterns without a formal design vision or blueprint. After thorough testing and now that the game is in a much more mature state, it’s imperative that the start sequence is polished to be “player grade”, i.e. not a dev prototype that only I as the creator know how to navigate and make sense of.

The refactor is visual for the most part, although breaking existing elements into the new flow might require some logic refactor, as well. I expect to learn possible caveats and tradeoffs with my vision in the planning stage.

## What Must Be Preserved Exactly

The following systems are working correctly and must not be modified:

- **Game logic in `game.js`** — all state management, turn sequencing, combat resolution, item use, Bestiary effects, veteran effects, terrain effects, scoring. Touch none of this.  
- **`cpu.js`** — the scoring engine. Do not modify.  
- **Item hand behavior, All modals**, **Score markers**, **Discard piles**, **Bestiary modal** — basically all the board elements, no need to modify or alter any of this  
- **Animations** – respect all the animations we currently use for all other sections and interactions

---

## Issues we have today

- There is really not a formal start sequence, just an awkward empty state of the main playing board UI: at this point in time we really don’t need to show the sidebar, empty board or deck images  
- Once a new game modal is summoned, it sits very weirdly on top of the main board area, and its controls have just been added with no information architecture in mind  
- The coin flip precedes the UI to place units on the board, which makes it hard to remember who goes first by the time the game starts (normally this action happens right before the start of the match once all the cards are laid on the table)  
- White the unit placement UI originally worked, now we have much better interaction patterns like the reordering UI for Ardan’s veteran effect or the obscuring bomb that can replace the current UI (e.g. have all cards randomly set from the get go, and allow the player to reorder if desired)  
- The debug controls for the unit placement today contain a Filter hand function that is totally useless (a 5 cards hand really doesn’t need to be filtered at all) and this can simply be removed)  
- There is a great opportunity to use the steps in the sequence to build towards what the final board will be, rather than the “cuts” we have right now from one stp to the other

## Desired UX sequence

This is how we can remix the parts of the UX we have today to meaningfully improve the experience of a common user (i.e. not myself as the creator with great tolerance for low-fi interactions)

- 1\) The user always lands on a clean start screen dialogue with options laid out in a clear, understandable way (no other UI elements that must be rendered later as the game UI, like headers, sidebars and board components)  
  - A new control will be added to allow the user to turn off debug controls, which should remove completely (visually hide) the following debug controls of the game interfaces:  
    - Replacing unit picks for P1 or P2  
    - Replacing item picks  
    - Modifying Seer’s Bestiary reveals in the Bestiary modal  
    - (Saving the game log should be preserved, never hide this feature)  
- 2\) Once the user selects their settings and starts a new game, we show the Unit placement UI for P1:  
  - The UI ONLY shows the space in the board that will be occupied by the units (no sidebars, headers or decks) nicely centered, with the title above “Player 1: Place your units” (no container or modal around the title, it should blend with the board UI)  
  - P1’s cards already occupy the five tiles, randomly ordered, and we enable the user to swap just like with the reordering UI we use for the Obscuring Bomb ( so we no longer need the Place randomly button, but we need a “Continue” button, think of a more appropriate copy but it basically allows the user to confirm their unit placement and move to P2’s placement)  
  - When debugging UI is active, we show BELOW the space occupied by the units the Replace with selected pick button, which should continue working as expected and allow the user to replace any selected unit from another unit found via the collapsible search bar (keep this interaction as we have today, just fix the positioning per my new layout)  
- 3\) After the P1 placement is complete, we see the P2 cards animate into their place, face-down, just like we have today, UNLESS  
  - If we have the choose\_cpu\_starting\_units setting ON, or if the user selected Manual mode for the Match mode, then we enable the same logic as for P1, but in the P2’s tiles: units already placed randomly, option to reorder, and corresponding title above the tiles and “Continue” \+ Replace with selected pick” buttons below the tiles)  
- 4\) Once all cards are laid out in the board, we show a “Who goes first title” right where we previously showed the “Player 1: Place your units” above the area occupied by the tiles, and after a 1s timeout we flip the coin automatically  
  - After the coin flip resolves, we update the title to show which player goes first and leave for 1 second, then automatically move to the next step  
  - Notice how we can get rid of the “Flip coin” and “Continue” buttons here to make things more streamlined  
- 5\) At this point the coin flip animation and title fade away, and we end up with a clean border with the 5x2 grid full of cards, so we launch three waves of animations to transform this into the final, playable board:  
  - A) The right sidebar enters animated from the left, pushing the board area with the tiles into the correct centered position, then  
  - B) The top and bottom menu bars enter animated vertically towards the center of the screen, and, finally  
  - C) The decks enter the board animated from the left to the center of the board, and occupy their place  
  - After the board is fully rendered, the player turn message is shown just like what we have today at the beginning of the match, and the match proceeds as we have today

For all of the above, preserve the animation we currently have and UI indicators (face-down blue overlay for cards that can be arranged, border highlights for selected units, etc.)

### Clean start screen dialogue

For the main start screen dialogue, I created a design with Claude Design, here’s the prompt provided by Claude Design for you to implement this screen:

Fetch this design file, read its readme, and implement the relevant aspects of the design. https://api.anthropic.com/v1/design/h/EdjrGnZ3VP9CaAEGXWglFQ?open\_file=Tacticlash+Title+Screen.html  
Implement: Tacticlash Title Screen.html

Prioritize the visual style of Claude Design’s design, we’ll later fix the mismatch between this screen and the rest of the game.

### Implementation and testing

I want to make sure that everything works visually the way it should, so we’ll break implementation in stages and I’ll QA each before we move to the next stage:

- Stage 1: Implement the clean start screen dialogue with fully functional and wired settings to affect the rest of the screens and flows (basically a successful migration of the behavior we have today)  
  - This means that after the user chooses to begging the game, we proceed to the rest of the flow we have today: coin flip, unit placement, etc. exactly as we have today  
- Stage 2: We show the unit placement UI for P1 and P2 right after the user selected their settings and started a new game, and connect with the coin flip animation right after the units are fully placed  
  - The coin flip animation resolution can lead to the exact board we have today, with the static sidebar, top and bottom bars, etc. (no intro animations of the board elements are required at this stage)  
- Stage 3: we complete the board elements animations to truly connect everything

