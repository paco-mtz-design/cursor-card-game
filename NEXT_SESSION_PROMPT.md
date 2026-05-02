# Next Session Prompt — Tacticlash

**[Paste this at the start of your next chat to resume.]**

---

You're picking up **Tacticlash**, a plain-HTML/CSS/JS card strategy game. Read `CLAUDE.md` first for conventions and how to communicate with the user (Paco — Product Designer, design-first explanations, converse before drafting detailed plans). Then read `CONTINUATION_SPEC.md` for the full state of the project.

**Where we are today:**

- The `animations` branch is **wrapped** and either ready for review/merge, or already merged into `main`. It shipped Phase 18 (CPU opponent + animation layer) in two passes — CPU policy on `cpu-opponent`, then the entire GSAP animation layer + UX polish (`BeatQueue` gate, turn banner, item summoning zoom, §24 damage resolution) here.
- **Phase 18 is done.** Phases 1–16 plus 18 are now complete. **Phase 17** (further UI improvements + deferred Bestiary UX + fog-of-war for opponent face-down units) and **Phase 19** (cross-regression QA sweep) are the open phases on `ROADMAP.md`.
- `DEV_LOG.md` has detailed entries for every recent milestone (newest first). Three known tech-debt items are flagged at the bottom of `ROADMAP.md` and explained in detail in `DEV_LOG.md`: multi-target damage sequencing, reinforcement-from-deck animation, and Harlund/Archmage multi-hit interleaving.

**Next direction is undecided.** Paco hasn't picked the next task yet. Likely candidates (do not start any of these without his go-ahead):

- One of the three documented tech-debt items above (multi-target damage sequencing is probably the most surgical follow-up to this session).
- Phase 17 — further UI improvements / deferred Bestiary UX / fog-of-war.
- Phase 19 — cross-regression QA sweep.
- Something he surfaces from live play (often the case).

**How to start:**

1. Read `CLAUDE.md` and `CONTINUATION_SPEC.md`.
2. Briefly orient on the current branch state with `git log --oneline -10` and `git status`.
3. Ask Paco what he'd like to tackle. Don't propose a multi-task plan — converse, ask clarifying questions, then draft.

**Critical context to keep in mind:**

- No build step. Edit files and reload `http://localhost:8080` (run `python3 -m http.server 8080`).
- All animations respect the `BeatQueue` reference-counted display gate at `game.js` ~line 126. Any new animation must call `BeatQueue.open()` / `BeatQueue.close()` for blocking visuals so logs / `renderBoard` / CPU scheduling stay sequenced.
- `renderBoard()` has a side effect: it calls `maybeScheduleCpuTurn()` at its end. Gating it also gates CPU turn progression — intentional.
- State is the single source of truth. Always mutate `state` and call the relevant `render*()` function — never mutate the DOM to track game logic.

---
