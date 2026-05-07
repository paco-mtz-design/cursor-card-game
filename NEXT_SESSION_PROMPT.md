# Next Session Prompt — Tacticlash

**[Paste this at the start of your next chat to resume.]**

---

You're picking up **Tacticlash**, a plain-HTML/CSS/JS card strategy game. Read `CLAUDE.md` first for conventions and how to communicate with the user (Paco — Product Designer, design-first explanations, converse before drafting detailed plans). Then read `CONTINUATION_SPEC.md` for the full state of the project.

**Where we are today:**

- The `start-sequence` branch is **wrapped** and committed (single commit `1d7a83c`). It ships a full refactor of the start sequence (parchment start screen → in-board reorder placement → auto coin flip after placement → animated chrome entrance) prioritised outside the planned roadmap between Phase 18 and Phase 17.
- **Phases 1–16 plus 18 are done.** **Phase 17** (further UI improvements + deferred Bestiary UX + fog-of-war for opponent face-down units) and **Phase 19** (cross-regression QA sweep) are the remaining roadmap phases on `ROADMAP.md`.
- `DEV_LOG.md`'s top entry is this refactor with the full surface and bug-fix history; older entries cover the Phase 18 animation milestones.

**Next direction is undecided.** Likely candidates (do not start any of these without Paco's go-ahead):

- Open a PR for `start-sequence` and merge to `main` (the branch is clean and committed; nothing else is in flight).
- Phase 17 — further UI improvements / deferred Bestiary UX / opponent fog-of-war.
- Phase 19 — cross-regression QA sweep.
- One of the carried-over Phase 18 tech-debt items (multi-target damage sequencing, reinforcement-from-deck animation, Harlund / Archmage multi-hit interleaving — see `CONTINUATION_SPEC.md` and `ROADMAP.md`).
- Something Paco surfaces from live play (often the case).

**How to start:**

1. Read `CLAUDE.md` and `CONTINUATION_SPEC.md`.
2. Briefly orient on the current branch state with `git log --oneline -10` and `git status`.
3. Ask Paco what he'd like to tackle. Don't propose a multi-task plan — converse, ask clarifying questions, then draft.

**Critical context to keep in mind:**

- No build step. Edit files and reload `http://localhost:8080` (run `python3 -m http.server 8080`).
- **The new start-sequence pipeline:** `onGoalChosen` → `dealUnitDecks` → `enterPlacementForP1` → user reorders + Lock In → `enterPlacementForP2` *or* `autoPlaceCpuP2` → `enterCoinFlipStep` (auto-fires `Anim.coinFlip`) → `transitionToPlaying` → `runBoardEntrance` (Wave A sidebar + FLIP slide of `.board__center`, Wave B bars, Wave C decks) → `startOfTurn`.
- All animations respect the `BeatQueue` reference-counted display gate at `game.js` ~line 126. Any new animation must call `BeatQueue.open()` / `BeatQueue.close()` for blocking visuals.
- `runBoardEntrance` uses pixel-valued GSAP offsets — `xPercent` / `yPercent` resolve to 0 on `display: none` elements, so they don't actually push the element off-screen. Don't switch back.
- `body.in-placement` uses `display: none` (not `visibility: hidden`) for chrome so the board grid is genuinely centered during placement. The Stage 3 entrance compensates for the layout shift via a FLIP slide.
- State is the single source of truth. Always mutate `state` and call the relevant `render*()` function — never mutate the DOM to track game logic.

---
