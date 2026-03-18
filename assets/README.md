# Tacticlash assets

Image and other static assets for the prototype.

## Directory structure

| Directory   | Purpose |
|------------|---------|
| **units/** | Unit card back and placeholder; **units/full-cards/** holds full unit card art (one image per character). |
| **items/** | Item card art. One image per item; filenames use the slug convention below. |

## Naming convention

- **Unit full cards (board, hand, zoom):** `units/full-cards/{Firstname}.png`  
  Use the character’s **first name only**, PascalCase.  
  Examples: `Harlund.png`, `Cassa.png`, `Solomon.png`, `Rokklo.png`

- **Items:** `items/{item-name-slug}.png`  
  Full item name, lowercased, spaces → hyphens, apostrophes/special chars removed.  
  Examples: `healing-potion.png`, `light-armor.png`, `all-revealing-lantern-jar.png`, `champions-crest.png`

The game resolves unit cards by first name from `CHARACTERS[].name`, and item cards by slug from the deck data. If a file is missing, the card falls back to a placeholder image.

## Card backs and placeholders

- **Unit card back:** `units/unit-card-back.png` — used for the unit deck stack and units discard stack.
- **Item card back:** `items/item-card-back.png` — used for the items deck stack.
- **Unit placeholder:** `units/unit-placeholder-for-dev.png` — used when a unit card image is missing.
- **Item placeholder:** `items/item-placeholder-for-dev.png` — used when an item card image is missing.

Once all card art is in place, the game will use the real images automatically; placeholders are only fallbacks.

## Adding new assets

Drop PNG (or other supported) files into the right folder with the slug that matches the in-game name. No code change needed.
