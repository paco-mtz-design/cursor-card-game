# Tacticlash — Web Prototype

Web-based prototype of the Tacticlash card game.

## Project structure

- `index.html` — Main game page
- `style.css` — Layout and card styling
- `game.js` — Game logic
- `data.js` — Character (and later item) data
- `Character list.csv` — Unit roster
- `Items Deck - Technical sheet.md` — Item deck reference
- `Tacticlash Gameplay Manual 2.1.md` — Full rules

## Design notes (future)

- **Opponent fog of war:** Once the game is playable, Player 2’s face-down cards must be hidden from Player 1’s view (e.g. show only a “?” or card back) so Player 1 cannot cheat. Player 1’s own face-down cards stay as “soft face-down” (visible to P1 only). No action until we have a playable build.

## Getting started

Open `index.html` in a browser (or use a local server).
