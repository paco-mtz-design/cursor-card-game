# Continuation Spec — Tacticlash, end of `card-index` branch
*Handoff prepared: 2026-05-09 | Resume in a new chat using `NEXT_SESSION_PROMPT.md`*

---

## Project Overview

Tacticlash is a plain-HTML/CSS/JS two-player card strategy game (no build step, no framework, no bundler). Two players place units on a 5-slot board row and take turns attacking, moving, and using items. One player can be a CPU opponent.

All code ships as plain files: `game.js` (~7 400 lines, single IIFE) holds all game logic, animation layer, start sequence, and now the Card Index modal + item variations system. `cpu.js` is the CPU policy module. `data.js` is static data plus the new `ITEM_VARIATIONS` table. `style.css` is the only stylesheet. `index.html` is all the markup.

Run with:
```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

No build step, no test runner, no linter, no package manager.

---

## Branch state

- **Branch:** `card-index` — clean, all changes committed.
- **Status:** ready for review / merge. Prioritised outside the planned roadmap (between `start-sequence` and the next planned roadmap phase).
- **Three commits unique to this branch.**

| Commit | What |
|--------|------|
| `b949006` | `feat(card-index): browse-only modal listing every card in the game` — new top-bar button, new modal with filter rail (Type → conditional sub-filters), Units / Items / Bestiary sections rendered as plain card art. Filters live on `state.cardIndexFilters` so they persist across modal open/close within a match and reset on a new game. Bestiary buff/debuff classifications baked in (Eye → debuff, Maiden → buff per Paco's call). |
| `b2c0b35` | `style(card-index): fixed 260px card thumbs to match discard modal` — replaced the responsive grid with a flex layout + 260px fixed-width thumbs so the in-card copy is comfortably readable. Caps row to ~5 cards across, matching the discard pile pattern. |
| `77322b5` | `feat(card-index): artwork variations for select items` — Light Armor (4 variations across 7 copies, A,A,B,B,C,C,D), Healing Potion (4 variations, one per copy), Magic Grenade and Wardstone Bracelet (2 each, one per copy). Variation is fixed at deck-build time and travels with each card through draw → hand → equipped gear / terrain → discard. Card Index renders all variations when "Show duplicates" is on; collapses to A when off. |

Branch off `main` (post-merge of `start-sequence`) at `4f057e6`.

---

## Files touched this branch

| File | What changed |
|------|-------------|
| `index.html` | Added `<button id="btn-card-index-open">` in `header__toolbar` (immediately left of `#btn-bestiary-open`). Added `<div id="card-index-modal">` block after the discard-zoom modal — backdrop / × / title / `.card-index__filters` (Type group + Show-duplicates toggle + Clear filters link) / 5 sub-filter groups (Class, Faction, Experience, Item Category, Bestiary Tag) / `.card-index__sections` (Units → Items → Bestiary, populated by JS) / empty-state paragraph. |
| `style.css` | New `.modal__content--card-index` (~96vw × 92vh, flex column). New `.card-index` BEM block: `__filters`, `__filter-row--top`, `__filter-group`, `__filter-label`, `__chips`, `__chip` (chip-style toggle, `aria-pressed`-driven), `__filter-controls`, `__toggle`, `__clear`, `__sections`, `__section-title`, `__grid` (flex-wrap with `260px` fixed-width thumbs), `__empty`. Reuses `.card-thumb` from the discard modal. Single mobile breakpoint at 720 px. |
| `data.js` | Added `ITEM_VARIATIONS` constant (per-item variation distribution arrays). Modified `buildItemDeck()` to return `{ name, variation }[]` objects (variation `null` for items without variations). |
| `game.js` | DOM refs for the new button, modal, backdrop, close button, filters region, clear link, show-duplicates checkbox. New `state.cardIndexFilters` field via `getDefaultCardIndexFilters()` in `getInitialState()`. New ~250-line section after `closeBestiaryModal`: `BESTIARY_TAG_MAP`, `ITEM_CATEGORY_BY_TYPE`, `CARD_INDEX_ITEM_ORDER`, `CARD_INDEX_FILTER_DEFS`, helpers (`getCardIndexFilters`, `getDefaultCardIndexFilters`, `isCardIndexTypeActive`, `getItemCategoryForFilter`, `getCardIndexUnits`, `getCardIndexItems`, `getCardIndexBestiary`, `buildCardIndexThumbHTML`), renderers (`renderCardIndexChips`, `renderCardIndexGrid`, `renderCardIndex`), `toggleCardIndexFilterGroup` (GSAP height+opacity transition), `applyCardIndexGroupVisibility`, `openCardIndexModal` / `closeCardIndexModal`, `applyCardIndexFilterChange`, `clearCardIndexFilters`. Event wiring at the bottom of the IIFE: button click, close, backdrop, delegated chip click, clear link, show-duplicates toggle. **Item variations refactor:** `ITEM_VARIATION_FILENAME_PATTERNS` map, `itemHasVariations`, updated `getItemCardImagePath(name, variation)` signature with fallback to 'A' if pattern exists. `drawItem` and `replaceLastDrawWith` now operate on deck objects (`findIndex` by name). `renderItemPickList` iterates objects. Hand items, gear, bonusGear, terrain all carry `.variation`. All ~13 callsites of `getItemCardImagePath` updated to pass variation. `Anim.itemSummon` accepts a 4th `variation` arg; player click handler, CPU action handler, and Wardstone activation all thread variation through. `openItemZoom` looks up variation from the hand using `handIndex`/`player`. |
| `feature specs/Card index.md` | The product spec checked into the branch (committed in the first card-index commit). |
| `assets/items/` | Renamed: `Armor - Light Armor.png` → `Armor - Light Armor – A.png`; `Single Use - Magic Grenade.png` → `Single Use - Magic Grenade – A.png`; `Single Use - Potion.png` → … `– A.png`; `Single Use - Wardstone Bracelet.png` → … `– A.png`. **New:** `– B / – C / – D` files for each varied item (12 new variation files total; Wardstone files use the en-dash separator like the others, normalised during this branch). |

`cpu.js` untouched.

---

## Architecture quick reference

### State shape additions

```
state.cardIndexFilters = {
  type:        Set<'units'|'items'|'bestiary'>,    // empty = no filter on this dim
  unitClass:   Set<'Brawler'|'Lancer'|'Shooter'|'Caster'>,
  faction:     Set<'Howlsworn Creed'|'Skyward Kin'|'Whisperfang Watch'|'Scalebound Brood'>,
  experience:  Set<'Rookie'|'Veteran'>,
  itemCategory:Set<'armor'|'accessory'|'legendary'|'single_use'|'terrain'>,
  bestiaryTag: Set<'buff'|'debuff'>,
  showDuplicates: true
}
```

Convention: an empty set means "no filter on this dimension" → show everything for it. Mirrors how chip-filter UIs behave in the wild.

### Item object shape (now uniformly carries variation)

The deck, hand, gear/bonusGear, terrain, and discard pile all use this shape:

```
{ name: string, variation: 'A'|'B'|'C'|'D'|null, id?: string }
```

`variation: null` for items without variations (most of the deck). Resolved via `getItemCardImagePath(name, variation)`:

- If `name` is in `ITEM_VARIATION_FILENAME_PATTERNS` → uses the variation pattern (defaults to 'A' when variation is null/undefined).
- Else → `ITEM_IMAGE_FILENAME_MAP[name]` → 'assets/items/{filename}.png'.
- Else → slug fallback / placeholder.

### `ITEM_VARIATIONS` (data.js)

```js
'Light Armor':        ['A','A','B','B','C','C','D'],   // 7 copies
'Healing Potion':     ['A','B','C','D'],               // 4 copies
'Magic Grenade':      ['A','B'],                       // 2 copies
'Wardstone Bracelet': ['A','B'],                       // 2 copies
```

Array length must equal `ITEM_DECK_SPEC` quantity. `buildItemDeck()` zips index-by-index.

### `ITEM_VARIATION_FILENAME_PATTERNS` (game.js)

```js
'Light Armor':        'Armor - Light Armor – {VAR}.png'
'Healing Potion':     'Single Use - Potion – {VAR}.png'        // file uses 'Potion', not 'Healing Potion'
'Magic Grenade':      'Single Use - Magic Grenade – {VAR}.png'
'Wardstone Bracelet': 'Single Use - Wardstone Bracelet – {VAR}.png'
```

All filenames use the **en-dash** (`–`, U+2013), not a hyphen. The Wardstone files were renamed from hyphen → en-dash on this branch for consistency.

### Bestiary buff/debuff map (game.js, `BESTIARY_TAG_MAP`)

Used only by the Card Index Bestiary filter. Per Paco's call:

- **Buff:** Alpha, Caravan, Hoarder, Iron-Clad Shield, Eternal Carapace, Berserker, **Iron Maiden**.
- **Debuff:** Rooted Colossus, High-Aerie, Muzzled Beast, Fractured Hulk, **Ever-Watching Eye**, Unmaker.

Iron Maiden tagged Buff (defensive but proactively benefits the holder), Eye tagged Debuff (always face-up is a restriction in this game's threat model).

### Card Index render flow

1. `openCardIndexModal()` → unhides modal, calls `renderCardIndex(animatedGroups=false)`.
2. `renderCardIndex(animated)` → `renderCardIndexChips()` (writes chip buttons, sets `aria-pressed`); `applyCardIndexGroupVisibility(animated)` (GSAP height+opacity in/out for sub-filter groups based on which Types are active); `renderCardIndexGrid()` (rebuilds Units → Items → Bestiary sections).
3. Filter chip click → `applyCardIndexFilterChange(group, value)` → toggles the value in the set → `renderCardIndex(group === 'type')` (only animate the conditional groups when Type changed).
4. "Show duplicates" toggle → only re-renders the grid (no chip / group-visibility work).
5. "Clear filters" → resets `state.cardIndexFilters` to defaults, full re-render with animation.

Items grid:
- `showDuplicates: true` → for varied items, iterates the variation array directly (so e.g. Light Armor renders 7 thumbs in A,A,B,B,C,C,D order). Non-varied items render `qty` plain copies.
- `showDuplicates: false` → one thumb per unique name. Varied items show variation A.

### Card sizing

`.card-index__grid .card-thumb` is `width: 260px; aspect-ratio: 107/150` — same as the discard zoom modal. Chosen after the initial responsive grid (auto-fill, `minmax(160px, 1fr)`) packed up to 7 cards per row and made the in-card copy too small to read. Flex-wrap layout, `justify-content: flex-start`, so cards left-align under their section titles.

---

## Known tech debt (this branch)

1. **Variation A is a fragile default.** `getItemCardImagePath` defaults to variation `'A'` when called for a varied item without a variation arg. That's correct for current callsites, but if any future code path ever stores a varied item without setting `.variation` (e.g. a new item-creation site), it'll silently render A instead of crashing. Worth a `console.warn` if the assumption ever breaks.
2. **`ITEM_VARIATIONS` array length must match `ITEM_DECK_SPEC` quantity.** No runtime check. If quantities ever change in `data.js`, the variations array must be updated by hand. Cheap to add a validation in `buildItemDeck` if it ever bites.
3. **CPU pick-list (replace draw with…) shows duplicate names.** `renderItemPickList` iterates the deck (which has duplicates), so identical-name varieties show up multiple times. Not a regression — same as before — but worth flagging if you ever change that behaviour.
4. **No tap-to-zoom on Card Index thumbs.** Deliberate first-cut omission. Easy to add later by reusing `openItemZoom` / a unit-zoom variant if Paco wants it.
5. **Filter persistence is in-match only.** No `localStorage`. Refresh / new game resets. By design.

Carried over from earlier branches (untouched on this one):

- Multi-target damage sequencing (Phase 18 tech debt, see DEV_LOG §24 entry).
- Reinforcement-from-deck animation.
- Harlund / Archmage multi-hit visual interleaving.

---

## Product / design decisions made this session

- **Filter persistence within a match** rather than reset-each-open. Cheap to implement (single field on state), low surprise risk (filters reset on new game via `getInitialState()`).
- **Layout grows naturally with smooth animation** for the conditional sub-filter groups, rather than reserved-space-with-dim or hard-jump. GSAP height+opacity transition reads as deliberate UI motion.
- **Card art only**, no captions. Filters carry the labelling burden — the user learns class/faction by what filter is currently set. Keeps cards visually consistent with how they appear in the game.
- **Fixed 260 px card width** matching the discard pile, after the initial responsive grid felt too cramped for reading the in-card copy. Adopted on the second commit after a quick visual review.
- **Variation fixed at deck-build time** rather than randomised per render. A drawn card keeps its identity; two Healing Potions in hand should look different and both be reliably the same illustration through draw → use → discard.
- **Ever-Watching Eye → Debuff, Iron Maiden → Buff** for the Card Index filter. Iron Maiden is defensive but reads as a buff to its owner; Eye's always-face-up read is a restriction in the prototype's fog-of-war model.

---

## Open questions / blockers

None active. Branch is mergeable.

The user (Paco) tested all variations end-to-end (hand, board, discard, summoning modal, Card Index with duplicates on/off) and confirmed everything works.

---

## Next steps

In rough priority order:

1. **Open a PR for `card-index` and merge to `main`** (`/pr-ready` was run alongside this handoff to draft the PR title and body).
2. **Phase 17** — further UI improvements + deferred Bestiary UX + fog-of-war for opponent face-down units.
3. **Phase 19** — cross-regression QA sweep.
4. Any of the carried-over Phase 18 tech-debt items (multi-target damage sequencing is the biggest one).
5. Whatever Paco surfaces from live play — out-of-roadmap polish like the Card Index has been the dominant pattern recently.

---

## Where to look first as the next agent

1. `CLAUDE.md` — project conventions and how to communicate with Paco.
2. `ROADMAP.md` — phase status. Phases 1–16 + 18 done. Card Index is an out-of-roadmap shipped polish, like the start-sequence work before it.
3. `DEV_LOG.md` — top entry will be this Card Index session.
4. `feature specs/Card index.md` — the product spec for what just shipped.
5. `game.js` ~lines 1465–1740 (Card Index module) and ~lines 3050–3110 (`getItemCardImagePath` + variation patterns) and ~lines 4380–4420 (`drawItem`).
6. `data.js` lines 78–110 (`ITEM_VARIATIONS` + updated `buildItemDeck`).
