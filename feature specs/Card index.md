# Tacticlash — Card index

---

**To the implementing agent:** This is a product specification, not an engineering blueprint. It describes *what the player experiences and why*, not how to build it. This feature won’t change the game logic, it will add a page to help users during gameplay, and thus you must not alter any of the game mechanics or the board UI. Your first deliverable is a technical implementation plan for review; no code changes until that plan is approved.

---

## Why This Exists

Like any card duel game, becoming familiar with the cards and their effects can give players an edge during gameplay. Since I want Tacticlash to be a fast-paced game that “cuts the setup”, I want to give players an index to optionally review the cards *during* gameplay.

The card index won’t affect gameplay or the board UI at all, it will simply add a standalone section for players to use at will during any active match.

---

## Desired behavior for the Card Index

- Add a new button in the top bar, right to the left of the Seers Bestiary button, for users to access the Card Index  
- Once the user clicks that button, open a modal, similar to what the user gets today when browsing a discard pile, but larger: the modal occupies most of the vertical and horizontal space to provide ample real estate, and within the modal we show the Card Index  
- The top section of the card index shows filters for the cards, this is the taxonomy for the filters:  
  - Type (multiselect)  
    - Units  
      - If Type:Units is active  
        - Class (multiselect)  
          - Brawler  
          - Lancer  
          - Shooter  
          - Caster  
        - Faction (multiselect)  
          - Howlsworn Creed  
          - Skyward Kin  
          - Whisperfang Watch  
          - Scalebound Brood  
        - Experience (multiselect)  
          - Rookie  
          - Veteran  
    - Items  
      - If Type:Items is active  
        - Gear, Armor  
        - Gear, Accessory  
        - Gear, Legendary Weapon  
        - Single use  
        - Terrain  
    - Bestiary  
      - If Type:Bestiary is active  
        - Buffs  
        - Debuffs  
  - Hide or show filters when relevant based on the logic described above, but let’s think of how to prevent the layout to jump around too much  
  - Add a “clear filters” quick option to go back to showing all cards  
  - And add a check for showing duplicates of each card, on by default (read my point below on why we need to show duplicates of cards)  
  - Let’s evaluate during planning how complex is to preserve the state of the filters if the user closes the modal (only during the current match)  
- The layout of the Card Index shows all cards of the game according to the filtering criteria, organized by default in this way:  
  - All Units in the following order, under a corresponding subtitle:  
    - Harlund, Barrox, Jorren, Daro, Keera, Larrin, Cassa, Solomon  
    - Fenn, Torra, Korrin, Rowka, Lyra, Luma, Ardan, Chronir  
    - Rinn, Vaela, Haskel, Nyss, Sarro, Thival, Thyra, Senya  
    - Kraska, Grolk, Braskin, Pex, Rokklo, Mira, Iktha, Mivara  
  - All Items in the following order, under a corresponding subtitle::  
    - Light Armor, Premium Light Armor, Heavy Armor  
    - True-strike Lens, Barbed Gauntlets, Wardstone Bracelet, Teleport Boots  
    - Champion’s Crest, Vanguard Lance, Sharpshooters Scope, Archmage’s Tome  
    - Healing Potion, Corrosive Phial, Tectonic Spike, All Revealing Lantern Jar, Tangle Vine Bola, Obscuring Bomb, Vorpal Honing Amulet, Magic Grenade  
    - Elevated Ground, Reinforced Barricade, Paralyzing Vines, Divine Light, Unstable Ground  
  - All Bestiary cards in the following order, under a corresponding subtitle::  
    - Alpha, Caravan, Hoarder, Shield, Carapace, Colossus, Aerie, Muzzled Beast, Hulk, Eye, Berserker, Maiden, Unmaker  
- Using the filters hides and shows cards in response to the selected criteria  
- The Index renders ALL the cards available in the game, so if a card has several copies (this only applies for items which are the only card type with duplicates though), all copies are rendered, unless manually overridden by the user per the check in the filters (this way users can get a sense of how likely is for them to obtain certain cards when drawing items)