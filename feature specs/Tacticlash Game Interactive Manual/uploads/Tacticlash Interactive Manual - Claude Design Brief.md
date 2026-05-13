# Tacticlash Interactive Manual — Claude Design Brief

**Project:** Tacticlash How-to-Play — Interactive Web Experience
**Prepared by:** Paco Martínez
**Stack:** Tailwind CSS (core), React JSX (single file)
**Figma file:** `BpygCzCqSQ9sKdtan3ef9L` (Web-brochure-graphics)

---

## 1. Goal

Build a single-page interactive HTML/JSX instruction manual for Tacticlash — a tactical duel card game. The page must be beautiful, game-branded, and teach all core rules through a combination of structured content, real card images pulled from Figma, and a step-by-step combat scenario. It should feel like a game product page, not a help article.

The content source is the **Tacticlash Gameplay Manual 2.2** — use it as the authoritative rule text. This brief specifies layout, components, assets, and interactions on top of that content.

---

## 2. Design System

### Class Colors
These four colors are the visual backbone of the game. Use them as accents, borders, badges, and highlights throughout.

| Class | Color | Hex |
|---|---|---|
| Brawler | Red | `#E31B1B` |
| Lancer | Blue | `#1B5AE3` |
| Shooter | Green | `#23C21D` |
| Caster | Violet | `#CA41F5` |

### Aesthetic Direction
- Light background preferred — clean and readable, with the card art and class colors providing all the visual richness.
- Typography should feel bold and decisive — large headers, strong contrast.
- Avoid generic "board game" clichés (no parchment textures, no fantasy scroll motifs). This is a modern tactical card game.
- Whitespace is generous — don't crowd cards or diagrams.

### Card Rendering
Fetch all card images via Figma MCP using the file ID and node IDs provided in Section 5. Render cards at their natural aspect ratio. Cards should have a subtle drop shadow and appear as real physical objects on the page.

---

## 3. Page Architecture

The page is a single vertically-scrolling experience divided into the following sections, in order:

### Section 1 — Hero
- Game title: **⚔️ Tacticlash**
- Credit line: *A game by Paco Martínez*
- Game metadata — display as a compact row of three specs:
  - 👥 2 Players
  - 🎂 Ages 10+
  - ⏱ 45–90 min
- Game description (use verbatim): *"Tacticlash is a lightweight dueler that cuts the setup, not the strategy. It is a quick fix for veterans and a painless gateway for friends who usually dodge tactical games. Simple rules, deep choices, and zero fluff."*
- Feature line (use verbatim): *"32 playable fantasy characters • 62 items to change the course of battle • 13 tarot cards for advanced gameplay"*
- CTA: smooth-scroll anchor to Section 2.

---

### Section 2 — The Objective
- One-sentence rule: Capture 15 of your opponent's units first (10 for express).
- Visual: a simple 5×2 grid diagram showing two opposing rows of face-down cards. Keep it abstract and clean (CSS/SVG, no Figma asset needed).

---

### Section 3 — The Four Classes
**This is the most visually rich section.** Display all four classes in a 2×2 grid (desktop) or stacked (mobile).

Each class card contains:
1. **Class name** — large, colored with the class color
2. **Class archetype** — the one-liner from the manual (e.g. "mighty tanks", "defensive towers")
3. **Range diagram** — embed the Figma frame for that class (node IDs below)
4. **Class buff description** — the rule text from the manual, styled as a callout
5. **Representative unit card** — one Approved card from that class (node IDs below)

**Range diagram Figma nodes (file: `BpygCzCqSQ9sKdtan3ef9L`):**
| Class | Node ID | Figma URL |
|---|---|---|
| Brawler | `3:346` | https://www.figma.com/design/BpygCzCqSQ9sKdtan3ef9L/Web-brochure-graphics?node-id=3-346 |
| Lancer | `9:164` | https://www.figma.com/design/BpygCzCqSQ9sKdtan3ef9L/Web-brochure-graphics?node-id=9-164 |
| Shooter | `9:252` | https://www.figma.com/design/BpygCzCqSQ9sKdtan3ef9L/Web-brochure-graphics?node-id=9-252 |
| Caster | `9:372` | https://www.figma.com/design/BpygCzCqSQ9sKdtan3ef9L/Web-brochure-graphics?node-id=9-372 |

**Representative unit cards (file: `BpygCzCqSQ9sKdtan3ef9L`):**
| Class | Unit | Node ID |
|---|---|---|
| Brawler | Jorren | `42:2831` |
| Lancer | Rowka | `45:3462` |
| Shooter | Thira | `41:2139` |
| Caster | Senya | `45:4461` |

---

### Section 4 — Turn Structure
A visual step-by-step flow replacing the bullet-list format in the manual.

Render as a horizontal flow (desktop) / vertical stack (mobile) with three clearly numbered steps:

1. **Reinforcement Phase** — Deploy replacements + draw 1 item card
2. **Item Phase** — Equip Gear, place Terrain, use Single-Use items
3. **Combat Phase** — Move (optional) → Attack (required)

Each step should have a brief label and a 1-sentence description. No card images needed here — keep it diagrammatic and fast to scan.

---

### Section 5 — Combat Walkthrough
**The centerpiece of the page.** An interactive, step-by-step scenario that walks through two turns using real named units and real card images.

Render as a step navigator: the user clicks/taps **Next** and **Back** to advance through steps. Each step shows:
- A step number and title
- 1–2 sentences of explanatory text (write from the tutorial script — adapt, don't copy verbatim)
- 1–3 card images relevant to that step, pulled from Figma
- The active game rule being demonstrated, displayed as a highlighted rule callout

#### Turn 1 — "First Strike" (steps 1–4)

**Step 1 — Draw your item**
> You start every turn by drawing from the Item Deck. This turn: an All-Revealing Lantern-Jar.
> *Rule: At the start of your turn, draw 1 item card.*
> Cards: All-Revealing Lantern-Jar `38:885`

**Step 2 — Use it**
> Single-Use items fire immediately and go to the discard pile. You cast it on a face-down Enemy — revealing a Caster.
> *Rule: Single-Use items are played during the Item Phase, before Combat.*
> Cards: All-Revealing Lantern-Jar `38:885`, Senya `45:4461`

**Step 3 — Move and Attack**
> You reveal Jorren and step him forward. Brawlers attack the tile directly in front — and Senya is right there.
> *Rule: You may Move 1 Tile before Attacking. Moving reveals the unit.*
> Cards: Jorren `42:2831`, Senya `45:4461`

**Step 4 — Capture**
> Senya only has 1 HP. Jorren hits for 1. She's captured. You take your first token.
> *Rule: A unit is captured when its HP reaches 0.*
> Cards: Jorren `42:2831`

---

#### Turn 2 — "The Counter" (steps 5–9)

**Step 5 — Opponent plays Terrain**
> Your Opponent drops Elevated Ground on their center tile. It protects units on it from Brawler and Lancer attacks.
> *Rule: Terrain Cards are placed face-up on any Tile and remain there until removed.*
> Cards: Elevated Ground `38:425`

**Step 6 — Opponent reveals a Shooter**
> They reveal Thira and slide her to the far edge of the board. Shooters hit any target 3+ Tiles away.
> *Rule: Shooters' Longshot deals 2 HP damage when attacking from one edge of the board to the other.*
> Cards: Thira `41:2139`

**Step 7 — The Counter window opens**
> Before the attack resolves, you reveal Rowka — a Lancer in diagonal range of the Shooter. Lancers Counter any Attack from within their diagonal range.
> *Rule: Lancers Counter any Attack from within range, even if not the declared Target.*
> Cards: Rowka `45:3462`, Thira `41:2139`

**Step 8 — Flip the coin**
> Counter attempts are decided by a coin flip. Heads: the Counter lands, the Shooter takes 1 HP damage and the attack fails. Tails: the Counter misses, and the attack goes through.
> *Rule: On heads, block the Attack and deal 1 HP damage to the attacker. On tails, the Attack proceeds.*
> Cards: Rowka `45:3462`

**Step 9 — Tails. The attack lands.**
> The coin says tails. Rowka's Counter fails. Thira fires from the edge — Longshot triggers, dealing 2 HP damage. Jorren is captured.
> *Rule: The risk of the Counter is real. Positioning matters.*
> Cards: Thira `41:2139`, Jorren `42:2831`

---

### Section 6 — Items & Gear
A compact visual reference for item types. Render as four labeled groups, each with 2–3 representative card images and a one-sentence description pulled from the manual.

| Type | Description | Sample Cards (node IDs) |
|---|---|---|
| Armor | Adds HP to a class | Light Armor `38:296`, Heavy Armor `38:543` |
| Accessories | Unique passive/active effects | Wardstone Bracelet `38:1167`, Teleport Boots `38:1202` |
| Legendary Weapons | Class upgrades: +1 HP + new ability | Champion's Crest `38:333`, Vanguard Lance `38:663` |
| Single-Use | Instant effect, then discard | All-Revealing Lantern-Jar `38:885`, Tangle-Vine Bola `38:928`, Obscuring Bomb `38:966` |
| Terrain | Placed on a Tile, modifies the board | Elevated Ground `38:425`, Divine Light `40:1290` |

> **Note on card status:** Some cards are marked "Needs Fix" in the content tracker. These are fine to use visually — the art and layout are complete. Only the text copy may be pending a minor update.

---

### Section 7 — The Seer's Bestiary (Advanced Rules)
Collapsible/accordion section — collapsed by default, with a clear "Advanced Rules" label and expand affordance.

When expanded, show:
- Setup instructions (Faction Deck + Bestiary Deck, 4 face-down pairs)
- Reveal trigger (every 5 captures per player in standard; every 4 in express)
- A brief note that Bestiary cards apply faction-wide effects for the rest of the match

No card images needed here — Bestiary cards are still Pending status in the tracker.

---

## 4. Interactions

- **Section 3 (Classes):** On hover/tap of a class card, the range diagram animates in (fade or slide). The representative unit card flips to reveal.
- **Section 5 (Combat Walkthrough):** Step navigator with Next / Back buttons. Progress indicator (e.g. "Step 3 of 9"). Cards animate in on each step transition (fade up).
- **Section 6 (Items):** Hover on a card image reveals the card's ability text as a tooltip overlay.
- **Section 7 (Bestiary):** Standard accordion expand/collapse with a smooth height transition.
- All scroll transitions between sections: smooth scroll via anchor links.
- **No auto-play animations** — every interaction is user-triggered.

---

## 5. Full Asset Index

### Figma File
**File ID:** `BpygCzCqSQ9sKdtan3ef9L`
**File name:** Web-brochure-graphics
**Access:** Use Figma MCP `get_design_context` or `get_screenshot` with file ID + node ID to fetch assets.

> **Resolution tip:** Node IDs in this brief use colon format (`42:2831`) as required by the Figma API/MCP. The Figma web URLs use dash format (`42-2831`) — both refer to the same node.

### Unit Cards
| # | Name | Class | Node ID | Status |
|---|---|---|---|---|
| 1 | Ardan | Caster | `41:2263` | Needs Fix |
| 2 | Barrox | Brawler | `42:2761` | Approved |
| 3 | Braskin | Lancer | `45:4632` | Approved |
| 4 | Cassa | Shooter | `45:3246` | Approved |
| 5 | Chronir | Caster | `45:3740` | Approved |
| 6 | Daro | Brawler | `45:2969` | Approved |
| 7 | Fenn | Lancer | `45:3292` | Approved |
| 8 | Grolk | Brawler | `45:4552` | Approved |
| 9 | Harlund | Brawler | `42:2501` | Needs Fix |
| 10 | Haskel | Brawler | `45:4196` | Approved |
| 11 | Iktha | Caster | `45:4827` | Approved |
| 12 | Jorren | Brawler | `42:2831` | Approved |
| 13 | Keera | Lancer | `45:3052` | Needs Fix |
| 14 | Korrin | Lancer | `41:1932` | Approved |
| 15 | Kraska | Brawler | `41:2029` | Approved |
| 16 | Larrin | Shooter | `45:3171` | Approved |
| 17 | Luma | Shooter | `45:3658` | Approved |
| 18 | Lyra | Shooter | `45:3585` | Approved |
| 19 | Mira | Shooter | `45:4764` | Approved |
| 20 | Mivara | Caster | `45:4893` | Approved |
| 21 | Nyss | Lancer | `41:2350` | Approved |
| 22 | Pex | Lancer | `45:4660` | Approved |
| 23 | Rinn | Shooter | `45:3811` | Approved |
| 24 | Rokklo | Shooter | `42:2609` | Approved |
| 25 | Rowka | Lancer | `45:3462` | Approved |
| 26 | Sarro | Shooter | `45:4275` | Approved |
| 27 | Senya | Caster | `45:4461` | Approved |
| 28 | Solomon | Caster | `41:1507` | Approved |
| 29 | Thira | Shooter | `41:2139` | Approved |
| 30 | Tival | Shooter | `45:4367` | Approved |
| 31 | Torra | Brawler | `45:3389` | Approved |
| 32 | Vaela | Brawler | `45:4087` | Approved |

### Item Cards
| # | Name | Type | Node ID | Status |
|---|---|---|---|---|
| 1 | Light Armor | Armor | `38:296` | Approved |
| 2 | Premium Light Armor | Armor | `38:504` | Approved |
| 3 | Heavy Armor | Armor | `38:543` | Approved |
| 4 | Champion's Crest | Promotion | `38:333` | Approved |
| 5 | Vanguard Lance | Promotion | `38:663` | Needs Fix |
| 6 | Sharpshooter's Scope | Promotion | `38:744` | Approved |
| 7 | Archmage's Tome | Promotion | `38:582` | Needs Fix |
| 8 | Potion | Single Use | `38:386` | Approved |
| 9 | Corrosive Phial | Single Use | `38:807` | Approved |
| 10 | Tectonic Spike | Single Use | `38:846` | Approved |
| 11 | All-Revealing Lantern-Jar | Single Use | `38:885` | Approved |
| 12 | Tangle-Vine Bola | Single Use | `38:928` | Approved |
| 13 | Obscuring Bomb | Single Use | `38:966` | Approved |
| 14 | Vorpal Honing Amulet | Single Use | `38:1014` | Approved |
| 15 | Magic Grenade | Single Use | `38:1052` | Approved |
| 16 | True-Strike Lens | Accessory | `38:1090` | Needs Fix |
| 17 | Barbed Gauntlets | Accessory | `38:1132` | Needs Fix |
| 18 | Wardstone Bracelet | Accessory | `38:1167` | Approved |
| 19 | Teleport Boots | Accessory | `38:1202` | Needs Fix |
| 20 | Elevated Ground | Terrain | `38:425` | Needs Fix |
| 21 | Reinforced Barricade | Terrain | `38:465` | Needs Fix |
| 22 | Paralyzing Vines | Terrain | `40:1251` | Approved |
| 23 | Divine Light | Terrain | `40:1290` | Approved |
| 24 | Unstable Ground | Terrain | `40:1329` | Needs Fix |

### Range Diagrams
| Class | Node ID | URL |
|---|---|---|
| Brawler | `3:346` | https://www.figma.com/design/BpygCzCqSQ9sKdtan3ef9L/Web-brochure-graphics?node-id=3-346 |
| Lancer | `9:164` | https://www.figma.com/design/BpygCzCqSQ9sKdtan3ef9L/Web-brochure-graphics?node-id=9-164 |
| Shooter | `9:252` | https://www.figma.com/design/BpygCzCqSQ9sKdtan3ef9L/Web-brochure-graphics?node-id=9-252 |
| Caster | `9:372` | https://www.figma.com/design/BpygCzCqSQ9sKdtan3ef9L/Web-brochure-graphics?node-id=9-372 |

---

## 6. Out of Scope

- Bestiary card images (Pending status — do not render)
- Spanish localization
- Any game logic, state management, or multiplayer features
- Mobile app or PWA features
- The full 32-unit roster page (just the 4 representative cards listed above)

---

## 7. Content Reference

All rule text is sourced from:
`/Game rules/Tacticlash Gameplay Manual 2.2 DRAFT.md`

The combat scenario script is adapted from:
`/Game rules/⚔️ Tacticlash Tutorial.md`

Use the manual as the authoritative source for all rule descriptions. The tutorial is reference only — adapt the voice, don't copy it verbatim.

---

*Brief prepared by Paco Martínez × Claude — April 2026*
