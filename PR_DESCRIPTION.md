# PR Title

`feat(card-index): browseable Card Index modal + item artwork variations`

---

# PR Body

## What this PR does

Adds a **Card Index** — a browse-only modal opened from the top bar (left of *Seer's Bestiary*) that lists every card in the game (32 units, 62 item copies, 13 bestiary cards) with chip-style filters and a "Show duplicates" toggle. While auditing the full deck through the new index, four items got upgraded to ship multiple artwork variations (Light Armor, Healing Potion, Magic Grenade, Wardstone Bracelet) — same name, same effect, different illustrations for flavor — so the second half of this branch is a small refactor that threads a `variation` field through the entire item lifecycle (deck → hand → equipped gear / terrain → discard → rendering).

Out-of-roadmap polish, prioritised between the previous `start-sequence` merge and Phase 17.

## Why

Like any card duel game, becoming familiar with the cards and their effects gives players an edge. Tacticlash deliberately *cuts* the setup ceremony to stay fast-paced — but that means there's no in-game encyclopedia for new players. The Card Index fills that gap: a single button that surfaces every card, filterable by type / class / faction / tag, with a toggle to render duplicates so players can gauge draw probabilities.

The variations work was a natural piggyback. Once the full deck was visible at a glance, Paco wanted to use the artwork variations he'd designed for some items — they'd been sitting unused, and the index was the moment to wire them up.

## Changes

### Card Index (commit `b949006`)

- **`index.html`**: new `<button id="btn-card-index-open">` in `header__toolbar` (immediately left of the bestiary button); new `#card-index-modal` block after the discard-zoom modal, with backdrop / × / title / `.card-index__filters` / `.card-index__sections` / empty-state paragraph.
- **`style.css`**: new `.modal__content--card-index` (~96 vw × 92 vh, flex column) + the `.card-index` BEM block — `__filters`, `__filter-row--top`, `__filter-group`, `__chip` (chip-style toggle, `aria-pressed`-driven), `__filter-controls`, `__toggle`, `__clear`, `__sections`, `__section-title`, `__grid`, `__empty`. Reuses the discard modal's `.card-thumb` pattern.
- **`game.js`** (~250-line section after `closeBestiaryModal`): `BESTIARY_TAG_MAP` (the buff/debuff classification — see Decisions below), `ITEM_CATEGORY_BY_TYPE`, `CARD_INDEX_ITEM_ORDER`, `CARD_INDEX_FILTER_DEFS`, plus filter/render functions (`getCardIndexUnits` / `getCardIndexItems` / `getCardIndexBestiary` / `renderCardIndexChips` / `renderCardIndexGrid`), GSAP-driven sub-filter visibility toggle (`toggleCardIndexFilterGroup`), open/close, filter mutation handlers, and event wiring (close button, backdrop, delegated chip click, clear link, show-duplicates toggle).
- **State:** new `state.cardIndexFilters` field (Sets for chip groups + boolean toggle), seeded by `getDefaultCardIndexFilters()` in `getInitialState()`.
- **`feature specs/Card index.md`**: the product spec checked into the branch.

### Card sizing follow-up (commit `b2c0b35`)

- Replaced the initial responsive grid (`grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))`) with a flex-wrap layout and a fixed 260 px card width — same as the discard zoom modal. Caps the row to ~5 cards across so the in-card copy stays comfortably readable.

### Item artwork variations (commit `77322b5`)

- **`data.js`**: new `ITEM_VARIATIONS` table; `buildItemDeck()` now returns `{ name, variation }[]` objects (variation is `null` for items without variations).
- **`game.js`**:
  - `ITEM_VARIATION_FILENAME_PATTERNS` map (uses `{VAR}` placeholder); updated `getItemCardImagePath(name, variation)` resolves through the pattern map first, then the existing `ITEM_IMAGE_FILENAME_MAP`. Defaults to variation `'A'` when called for a varied item without an explicit variation.
  - `drawItem` and `replaceLastDrawWith` now operate on deck objects (find by name via `findIndex`); hand items, gear, bonusGear, and terrain objects all carry `.variation`.
  - All ~13 callsites of `getItemCardImagePath` updated to pass variation through (hand cards, gear/terrain mini-cards on units, unit zoom modal, item zoom modal, summoning modal, discard pile thumbnails, discard zoom, Card Index thumbs).
  - `Anim.itemSummon` accepts a 4th `variation` arg. Player click handler reads from `hand[handIndex]`, CPU action handler reads from `state.p2ItemHand[capturedAction.handIndex]`, Wardstone activation scans `defCell.gear` / `defCell.bonusGear` *before* `removeGearFromCell`.
  - `openItemZoom` looks up variation from the hand using its existing `handIndex` / `player` arguments (no signature change).
- **`assets/items/`**: 12 variation files. The four single-art files (`Armor - Light Armor.png`, `Single Use - Magic Grenade.png`, `Single Use - Potion.png`, `Single Use - Wardstone Bracelet.png`) became their `– A` siblings (git tracked these as renames). New `– B / – C / – D` files added where applicable. Wardstone files normalised to use the en-dash separator (`–`) like the others.

### Variation distribution

| Item | Variations | Distribution across deck |
|------|------------|--------------------------|
| Light Armor | 4 (A, B, C, D) | A, A, B, B, C, C, D — 7 copies |
| Healing Potion | 4 (A, B, C, D) | one per copy — 4 copies |
| Magic Grenade | 2 (A, B) | one per copy — 2 copies |
| Wardstone Bracelet | 2 (A, B) | one per copy — 2 copies |

## Product & design decisions

- **Filters persist within a match** rather than resetting on every modal open. Mirrors how chip filters typically behave; cheap to implement (single field on state) and resets naturally on a new game via `getInitialState()`.
- **Layout grows naturally with smooth GSAP animation** for the conditional sub-filter groups (Class / Faction / Experience / etc.). Considered "reserve space, gray out" and "let it grow with no animation" — the smooth grow read as the most deliberate of the three.
- **Card art only**, no captions. Filters carry the labelling burden — the player learns class/faction by what filter is set. Keeps cards visually consistent with how they appear in the game.
- **Fixed 260 px card width**, not responsive. Adopted in the second commit after the initial grid (auto-fill at 160 px) packed up to 7 cards per row and made the in-card copy too small to read. Matches the discard pile pattern, which Paco confirmed is the right reference for "comfortably readable".
- **Bestiary filter has just two tags (Buff / Debuff)**, not three. Two cards are mechanically ambiguous; per Paco's call, **Iron Maiden = Buff** (defensive but proactively benefits the holder) and **Ever-Watching Eye = Debuff** (always face-up is a restriction in this game's threat model). Encoded in `BESTIARY_TAG_MAP` (game.js).
- **Variation fixed at deck-build time**, not randomised per render. A drawn card keeps its identity through draw → use → discard. Two Healing Potions in hand show different art and stay different through their lifecycle.
- **"Show duplicates OFF" collapses to one card per name, variation A.** Considered "one entry per variation" (so Light Armor would show 4 cards) — rejected as it muddles the unique-vs-duplicate semantic. Variation A is the canonical representative.
- **Wardstone variation files renamed to en-dash (`–`)** during this branch instead of handling the punctuation difference in code. The pattern map is uniform now.
- **Spec ↔ data naming reconciliation.** The Card Index spec used some names that differ slightly from `data.js` (Thival/Thyra vs Tival/Thira; "All Revealing Lantern Jar" vs "All revealing lantern-jar"; "Sharpshooters Scope" vs "Sharpshooter's Scope"; etc.). The index uses the canonical names from `data.js` so labels match the in-game cards exactly. Renaming source data is a separate housekeeping pass if Paco ever wants it.

## Testing

Manual playtest, run from `python3 -m http.server 8080`. Paco verified each scenario end-to-end and confirmed everything works:

- **Card Index — open / close / no game impact:** button click opens modal; × and backdrop both close. Opening mid-CPU-turn does not advance the turn, write a log entry, or change `state.phase`.
- **Default render:** Units (32), Items (62 with duplicates on), Bestiary (13). Order matches the spec: 32 units in faction-block order; items in spec order; bestiary 1–13.
- **Filter combinations:** Type → Units only collapses Items + Bestiary sections out and animates Class / Faction / Experience in. Type → Bestiary only animates Buff/Debuff in. Combined filters (Units + Class:Brawler + Faction:Howlsworn) render only matching cards. "Clear filters" resets all groups.
- **Show duplicates toggle:** OFF collapses items to 24 unique entries (all varied items show variation A). ON renders 62 entries with varied items in their actual deck distribution (Light Armor → A,A,B,B,C,C,D in order).
- **Filter persistence:** filters set, modal closed and reopened — state preserved. New game → filters back to defaults.
- **Variations end-to-end:** drew multiple varied items in the same hand, confirmed each copy shows a distinct illustration. Equipped Wardstone and Light Armor — gear mini-card on the unit, unit-zoom modal, and the summoning modal all show the same variation that was in hand. Used Healing Potion / Magic Grenade — discard pile (mini stack and zoom modal) shows the variation that was used.
- **Wardstone activation:** equipped Wardstone, was attacked, accepted protection — activation modal shows the equipped variation.
- **No regressions:** start sequence (parchment → placement → coin → entrance) still works. Discard zoom and Bestiary modal still open and close correctly. CPU turn flow uninterrupted.

No automated tests — the project ships no test runner. Syntax-checked `game.js` and `data.js` via `node --check`. All variation files verified to load over HTTP.

## Screenshots / recordings

N/A in this PR description — Paco verified visually in the browser. The Card Index button, modal, filter rail, and three card-grid sections are visible at http://localhost:8080 once a duel begins.

## Follow-up work

Intentionally deferred:

- **Tap-to-zoom on Card Index thumbs.** First-cut omission; easy to add later by reusing `openItemZoom` / a unit-zoom variant if needed.
- **Filter persistence across page reloads** (`localStorage`). Not in spec; in-match-only persistence is intentional.
- **Renaming canonical card names to match the spec** (Tival → Thival, "All revealing lantern-jar" → "All Revealing Lantern Jar", etc.). Separate housekeeping pass.

Known fragilities flagged for the next agent:

- **Variation A is a fragile default.** `getItemCardImagePath` falls back to `'A'` for varied items called without a variation arg. If any new item-creation path forgets to set `.variation`, it'll silently render A. A `console.warn` in the helper would catch this cheaply.
- **`ITEM_VARIATIONS` array length must match `ITEM_DECK_SPEC` quantity.** No runtime check. If quantities change in `data.js`, the variations array must be updated by hand.
- **CPU pick-list (replace draw with…) shows duplicate names.** `renderItemPickList` iterates the deck (which has duplicates), so identical-name varieties show up multiple times. Same as before this PR; flagged in case it ever needs deduping.
