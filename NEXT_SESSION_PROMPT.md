# Next Session Prompt — Tacticlash

**[Paste this at the start of your next chat to resume.]**

---

You're picking up **Tacticlash**, a plain-HTML/CSS/JS card strategy game. Read `CLAUDE.md` first for conventions and how to communicate with Paco (Product Designer — design-first explanations, converse before drafting detailed plans). Then read `CONTINUATION_SPEC.md` for the full state.

**Where we left off:**

- The `card-index` branch is **wrapped** — three clean commits (`b949006`, `b2c0b35`, `77322b5`). It ships a browse-only Card Index modal (top-bar button left of Seer's Bestiary) and an item-artwork-variations system (Light Armor / Healing Potion / Magic Grenade / Wardstone Bracelet now have multiple illustrations). Out-of-roadmap polish, prioritised between the previous `start-sequence` work and Phase 17.
- **Phases 1–16 plus 18 are done.** **Phase 17** (UI improvements + deferred Bestiary UX + opponent fog-of-war) and **Phase 19** (cross-regression QA sweep) are the remaining roadmap phases on `ROADMAP.md`.

**Next direction is undecided.** Likely candidates (do not start any of these without Paco's go-ahead):

- Open a PR for `card-index` and merge to `main` (`PR_DRAFT.md` is in the project root if `/pr-ready` was run; otherwise the branch is clean and committed).
- Phase 17 — further UI improvements / deferred Bestiary UX / opponent fog-of-war.
- Phase 19 — cross-regression QA sweep.
- Carried-over Phase 18 tech debt (multi-target damage sequencing is the biggest).
- Something Paco surfaces from live play (often the case).

**How to start:**

1. Read `CLAUDE.md` and `CONTINUATION_SPEC.md`.
2. Briefly orient with `git log --oneline -10` and `git status`.
3. Ask Paco what he'd like to tackle. Don't propose a multi-task plan — converse, ask clarifying questions, then draft.

**Critical context to keep in mind:**

- No build step. Edit files and reload `http://localhost:8080` (run `python3 -m http.server 8080`).
- **Item objects now uniformly carry `.variation`** — deck entries, hand items, `cell.gear`, `cell.bonusGear`, terrain on the board, discard pile. Image rendering goes through `getItemCardImagePath(name, variation)`. Any new item-creation site must propagate `.variation` (see CONTINUATION_SPEC § "Item object shape").
- **Card Index filters live on `state.cardIndexFilters`** so they persist across modal open/close within a match and reset on a new game via `getInitialState()`. Sets (not arrays) — empty set means "no filter on that dimension".
- **`ITEM_VARIATIONS` array length must equal the item's `ITEM_DECK_SPEC` quantity.** No runtime check. If quantities ever change, the variations array must be updated by hand.
- State is the single source of truth. Always mutate `state` and call the relevant `render*()` function — never mutate the DOM to track game logic.

---
