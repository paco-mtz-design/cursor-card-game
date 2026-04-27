# Next Session Prompt — Tacticlash Animation Layer

**[Paste this at the start of your next chat to resume instantly]**

---

You're continuing work on **Tacticlash**, a plain-HTML/CSS/JS card strategy game. Read `CONTINUATION_SPEC.md` first — it has your full briefing including architecture, all known bugs, and design decisions.

**Where we left off:** We identified a fundamental architectural problem — game state mutates synchronously and immediately, but animations are async side effects with no unified sequencing. This causes HP counters, log entries, and turn progression to appear mid-animation. Individual bug patches kept causing regressions. We agreed to stop patching and redesign the animation sequencing foundation.

**What to do next:** Design and implement an **Animation Beat Queue** — a sequencer where each "beat" bundles a state mutation + animation + display unlock. Display (renderBoard, renderTurnUI, log, HP counters) is held until the beat's animation completes. Beats chain automatically. This generalises the existing `CoinGate` pattern to every animation type, not just coin flips.

**Critical context:**
- This is a product designer's project — explain in design/UX terms first, implementation details second (see CLAUDE.md)
- No build step, no framework. Plain JS, single IIFE in `game.js` (~6500 lines)
- The existing `CoinGate` object (line 126 of `game.js`) is the working model to generalise
- Branch is `animations`; run with `python3 -m http.server 8080` then open `http://localhost:8080`
- There is a duplicate-card visual bug during `cpuReveal` Phase 2 that should also resolve naturally once display is properly gated — document it in the beat queue design

**Start by reading:**
- `CONTINUATION_SPEC.md` — complete state of the project
- `feature specs/Phase2-Testing-Guide.md` — the QA checklist we're working through
- `game.js` lines 100–650 — existing `CoinGate` and full `Anim` namespace

Then: propose the `BeatQueue` architecture in plain terms (what a "beat" is, how beats chain, how it interacts with the CPU Continue button), get sign-off from Paco, then implement.

---
