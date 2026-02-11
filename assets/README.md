# Tacticlash assets

Image and other static assets for the prototype.

## Directory structure

| Directory   | Purpose |
|------------|---------|
| **units/** | Unit card sprites (3D or portrait PNGs). One image per character. |
| **items/** | Item card art (for future use). One image per item. |

## Naming convention

- **Units:** `{name-slug}.png`  
  Use the character’s full name, lowercased, spaces → hyphens, no special characters.  
  Examples: `harlund-ironhowl.png`, `cassa-thornpelt.png`, `solomon-the-bound.png`

- **Items:** `{item-name-slug}.png`  
  Same idea for item names.  
  Examples: `healing-potion.png`, `light-armor.png`, `teleport-boots.png`

The game resolves slugs from the data (e.g. `CHARACTERS[].name`, item names from the deck). If a file is missing, the card still renders without the image.

## Adding new assets

Drop PNG (or other supported) files into the right folder with the slug that matches the in-game name. No code change needed.
