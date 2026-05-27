# feat(manual): interactive manual page + start screen and header entry points

## What this PR does

Ships a standalone Interactive Manual page (cream-themed React + Tailwind walkthrough of classes, items, terrain, bestiary, and gameplay flow) and wires two entry points into the existing game: a discreet bottom-right corner badge on the start screen, and a "Learn how to play" button at the front of the in-game header toolbar. Both open the manual in a new browser tab, so the live game state is never disturbed.

## Why

Players currently have no in-app way to read the rules. New players opening the start screen see only the *Begin Duel* CTA and the setup card — there's no graceful on-ramp before the duel, and no reference once they're mid-match. The interactive manual already existed as a polished React prototype in `feature specs/Tacticlash Game Interactive Manual/`; this PR promotes it to a shippable surface and makes it reachable from the two natural moments players would want it: deciding whether to play, and forgetting a rule mid-game.

This is out-of-roadmap polish (sits alongside the recent Card Index work between merges), not a phase milestone.

## Changes

- **`manual/` (new top-level directory)**: A self-contained shippable copy of the manual app — `index.html` (renamed from the spec's `Tacticlash Manual.html`), the three JSX files (`tacticlash-card.jsx`, `manual-nav.jsx`, `manual-app.jsx`), and an `assets/` tree (units / items / bestiary / heralds). The page loads React 18, Babel-Standalone, and Tailwind via CDN — no build step, matching the project's "edit and reload" convention. All image paths inside the JSX are relative (`assets/units/...`) so the folder is fully portable.
- **`index.html` start screen**: Added a third corner anchor (`.start-screen__corner--bottom-right .start-screen__corner--link`) with a small book icon + "Learn how to play" label. Sits in the previously-empty bottom-right corner, mirroring the existing `Edition I` / `v0.4 · pre-alpha` corner marks in tone and ink color so it doesn't compete with the *Begin Duel* CTA.
- **`index.html` in-game header**: Prepended a new `.btn.btn-manual` anchor to `.header__toolbar` (icon + label), so the toolbar now reads `Learn how to play | Card Index | Seer's Bestiary | New game`. The button uses the same `.btn` base as its neighbours, with a small book glyph distinguishing it as a reference link.
- **`style.css`**: Added `.start-screen__corner--bottom-right` (positioning), `.start-screen__corner--link` (hover/focus affordance), `.start-screen__manual-icon` (icon color), `a.btn` (treat anchors as buttons visually), `.btn-manual` / `.btn-manual__icon` (flex layout for icon + label). ~28 lines total. No changes to existing rules.
- **`feature specs/Tacticlash Game Interactive Manual/`**: The original spec directory is preserved in-place (HTML, JSX, design brief, draft v2.2 manual markdown, original `uploads/`) as a permanent design record.
- **No changes** to `game.js`, `cpu.js`, or `data.js`. Zero game-logic risk.

## Product & design decisions

- **Opens in a new tab, never replaces the screen.** Both entry points use plain `<a target="_blank" rel="noopener noreferrer">` rather than buttons + JS. This gives native middle-click support, "open in new window" context menus, and keyboard-Enter behaviour for free. It also guarantees the player's in-progress game state (selected unit, dev drawer, CPU "Continue →" prompt) is never disturbed.
- **Start-screen placement: corner badge, not a CTA.** Considered four placements (text link under *Begin Duel*, pill button above the lore section, corner badge, row inside the Match Setup card). Settled on the bottom-right corner so it stays a *quiet, persistent* "help" affordance rather than competing with *Begin Duel*. The top corners were already taken by `Edition I` and `v0.4 · pre-alpha`, so bottom-right gave visual balance.
- **Header placement: leftmost in the toolbar.** Reference links go first; data-browsing buttons (Card Index, Bestiary) and the destructive *New game* trail. The icon + label treatment visually distinguishes the manual from the data buttons without breaking the toolbar's row rhythm.
- **Header visibility: always on, same lifecycle as Card Index.** Because clicking opens a new tab, mid-turn access is non-destructive — no need to hide during CPU "Continue →" announcements or bestiary reveals.
- **No shared CSS with the main game.** The manual's cream + Space Grotesk + Tailwind aesthetic is deliberately distinct from the game's ink-and-paper style. Trying to reconcile them would have ballooned scope; instead the manual owns its own stylesheet world inside `manual/index.html`.
- **CDN-driven, no build step.** Kept React + Babel-Standalone + Tailwind via `<script>` tags. Matches the no-bundler project convention and keeps the manual approachable for designer-led iteration. The "Babel-Standalone in production" console warning is accepted as a known cost for the workflow.
- **Self-contained `manual/assets/` instead of reusing main `assets/`.** Considered pointing the manual at the existing game's image folders to avoid duplication, but the manual uses different framing/crops and may diverge stylistically over time. Keeping assets self-contained means the manual can evolve without coupling to game-side image-name conventions.
- **Spec folder retained.** The original `feature specs/Tacticlash Game Interactive Manual/` directory stays as the design source of truth (includes the design brief and the draft v2.2 manual markdown the prototype was built from). The shipped `manual/` folder is the runtime; the spec is the archive.

## Testing

Manual verification with a local HTTP server (`python3 -m http.server 8088`):

- `GET /manual/index.html` → 200, content-length 2668.
- `GET /manual/assets/units/Harlund.png` → 200.
- `GET /manual/manual-app.jsx` → 200 (Babel transpiles in browser).
- Confirmed the served `index.html` includes both new anchors (`.start-screen__corner--bottom-right` and `.btn.btn-manual`).

Manual checks still recommended before merge:

- Open the start screen → click the bottom-right corner badge → new tab loads the manual; the start screen retains its setup-card selections.
- Click *Begin Duel*, complete setup, reach the playing phase → click *Learn how to play* in the header → new tab opens; the main tab still shows the active turn, selected unit, and dev drawer in their pre-click state.
- Middle-click on each entry point opens in a background tab.
- Keyboard: Tab to either link, press Enter → new tab opens.
- Bottom-right corner badge shows a visible focus ring (`outline: 1px solid #1d1a14`, offset 6px) when keyboard-focused.

No unit tests — the project has no test infrastructure, and the change is HTML/CSS only with no game-logic impact.

## Screenshots / recordings

N/A in this PR body — visual changes are small (one corner badge, one header button) and can be inspected directly on the branch.

## Follow-up work

- Update `DEV_LOG.md` with a "Interactive Manual" entry (parallel to the existing Card Index entry) once this merges — keeping the granular trace alive.
- Consider whether the manual should eventually be linked from the game-over screen too (a natural "want to learn more?" moment after a first match). Deferred — not in this PR's scope.
- The manual's draft v2.2 gameplay text (in the spec's `uploads/`) hasn't been reconciled against current implementation behaviour. If the game evolves (e.g. new items, rule changes), the manual will need a refresh pass; not a blocker for shipping the entry-point wiring.
- The "you're using Babel-Standalone in production" console warning could be replaced with a pre-built JS bundle if the project ever adopts a build step; until then, it's accepted.
