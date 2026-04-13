/**
 * Tacticlash — character data (from Character list.csv)
 * Columns: Name, Race + Description, Class, Species, Faction, Level
 */
const CHARACTERS = [
  { name: 'Harlund Ironhowl', class: 'Brawler', level: 'Veteran', veteranBuff: 'harlund' },
  { name: 'Barrox Ironpaw', class: 'Brawler', level: 'Rookie' },
  { name: 'Jorren Brighthowl', class: 'Brawler', level: 'Veteran', veteranBuff: 'jorren' },
  { name: 'Daro Swiftlash', class: 'Lancer', level: 'Rookie' },
  { name: 'Keera Stonesnout', class: 'Lancer', level: 'Veteran', veteranBuff: 'keera' },
  { name: 'Larrin Driftmark', class: 'Shooter', level: 'Rookie' },
  { name: 'Cassa Thornpelt', class: 'Shooter', level: 'Veteran', veteranBuff: 'cassa' },
  { name: 'Solomon the Bound', class: 'Caster', level: 'Veteran', veteranBuff: 'solomon' },
  { name: 'Fenn Talonstrike', class: 'Brawler', level: 'Rookie' },
  { name: 'Torra Anvilcrest', class: 'Brawler', level: 'Veteran', veteranBuff: 'torra' },
  { name: 'Korrin Windfeather', class: 'Lancer', level: 'Rookie' },
  { name: 'Rowka Stonewing', class: 'Lancer', level: 'Veteran', veteranBuff: 'rowka' },
  { name: 'Lyra Keenfang', class: 'Shooter', level: 'Veteran', veteranBuff: 'lyra' },
  { name: 'Luma Flintwing', class: 'Shooter', level: 'Rookie' },
  { name: 'Ardan Quillsong', class: 'Caster', level: 'Veteran', veteranBuff: 'ardan' },
  { name: 'Chronir Stillmarch', class: 'Caster', level: 'Veteran', veteranBuff: 'chronir' },
  { name: 'Rinn Mossburn', class: 'Brawler', level: 'Rookie' },
  { name: 'Vaela Strayshield', class: 'Brawler', level: 'Veteran', veteranBuff: 'vaela' },
  { name: 'Haskel Moorwake', class: 'Brawler', level: 'Veteran', veteranBuff: 'haskel' },
  { name: 'Nyss Shadowstep', class: 'Lancer', level: 'Veteran', veteranBuff: 'nyss' },
  { name: 'Sarro Chitterfang', class: 'Lancer', level: 'Rookie' },
  { name: 'Tival Embercoat', class: 'Shooter', level: 'Veteran', veteranBuff: 'tival' },
  { name: 'Thira Mistpaw', class: 'Shooter', level: 'Rookie' },
  { name: 'Senya Longtail', class: 'Caster', level: 'Veteran', veteranBuff: 'senya' },
  { name: 'Kraska Mudtongue', class: 'Brawler', level: 'Rookie' },
  { name: 'Grolk Hollowjaw', class: 'Brawler', level: 'Veteran', veteranBuff: 'grolk' },
  { name: 'Braskin Coilmail', class: 'Lancer', level: 'Veteran', veteranBuff: 'braskin' },
  { name: 'Pex Rippleclaw', class: 'Lancer', level: 'Rookie' },
  { name: 'Rokklo Flickbranch', class: 'Shooter', level: 'Veteran', veteranBuff: 'rokklo' },
  { name: 'Mira Skytwitch', class: 'Shooter', level: 'Rookie' },
  { name: 'Iktha Embercoil', class: 'Caster', level: 'Veteran', veteranBuff: 'iktha' },
  { name: 'Mivara Duskscale', class: 'Caster', level: 'Veteran', veteranBuff: 'mivara' },
];

const CLASS_ICONS = {
  Brawler: '🥊',
  Lancer: '⚔️',
  Shooter: '🎯',
  Caster: '🔮',
};

/**
 * Item deck (from Items Deck - Technical sheet.md). Each entry is { name, quantity }.
 * Used to build the shuffled item deck at game start; draw 1 per turn into item hand.
 */
const ITEM_DECK_SPEC = [
  { name: 'Light Armor', quantity: 7 },
  { name: 'Premium Light Armor', quantity: 4 },
  { name: 'Heavy Armor', quantity: 5 },
  { name: 'Healing Potion', quantity: 4 },
  { name: 'Corrosive Phial', quantity: 3 },
  { name: 'Tectonic Spike', quantity: 3 },
  { name: 'All revealing lantern-jar', quantity: 3 },
  { name: 'Tangle-Vine Bola', quantity: 3 },
  { name: 'Obscuring bomb', quantity: 2 },
  { name: 'Vorpal Honing Amulet', quantity: 2 },
  { name: 'True-Strike Lens', quantity: 2 },
  { name: 'Magic Grenade', quantity: 2 },
  { name: 'Barbed Gauntlets', quantity: 2 },
  { name: 'Wardstone Bracelet', quantity: 2 },
  { name: 'Teleport Boots', quantity: 2 },
  { name: 'Elevated Ground', quantity: 3 },
  { name: 'Reinforced Barricade', quantity: 3 },
  { name: 'Paralyzing Vines', quantity: 2 },
  { name: 'Divine Light', quantity: 2 },
  { name: 'Unstable Ground', quantity: 2 },
  { name: "Champion's Crest", quantity: 1 },
  { name: 'Vanguard Lance', quantity: 1 },
  { name: "Sharpshooter's Scope", quantity: 1 },
  { name: "Archmage's Tome", quantity: 1 },
];

/** Build a flat array of item names (each repeated by quantity) for shuffling. */
function buildItemDeck() {
  const flat = [];
  ITEM_DECK_SPEC.forEach(function (entry) {
    for (let i = 0; i < entry.quantity; i++) flat.push(entry.name);
  });
  return flat;
}

/**
 * Item metadata (type, effect text) from Items Deck - Technical sheet.md.
 * Used for expand-to-read and to decide if an item is playable (e.g. single-use).
 */
const ITEM_SPECS = {
  'Light Armor': { type: 'gear_armor', effect: 'Usable exclusively by Lancers, Shooters and Casters. Add +1 HP to the equipping unit.', allowedClasses: ['Lancer', 'Shooter', 'Caster'], hpBonus: 1 },
  'Premium Light Armor': { type: 'gear_armor', effect: 'Usable exclusively by Lancers, Shooters and Casters. Add +2 HP to the equipping unit.', allowedClasses: ['Lancer', 'Shooter', 'Caster'], hpBonus: 2 },
  'Heavy Armor': { type: 'gear_armor', effect: 'Usable exclusively by Brawlers. Add +1 HP to the equipping unit.', allowedClasses: ['Brawler'], hpBonus: 1 },
  'Healing Potion': { type: 'single_use', effect: 'The targeted unit recovers 1 HP.' },
  'Corrosive Phial': { type: 'single_use', effect: 'Destroy one face-up Gear card (either yours or an opponent\'s).' },
  'Tectonic Spike': { type: 'single_use', effect: 'Destroy one Terrain card (either on your side of the board or your opponent\'s).' },
  'All revealing lantern-jar': { type: 'single_use', effect: 'Permanently turn face-up one face-down enemy unit.' },
  'Tangle-Vine Bola': { type: 'single_use', effect: 'The targeted enemy unit can\'t initiate an attack on their next turn (they can still be swapped with other moving units). Prevents targeted Lancers from countering, as well.' },
  'Obscuring bomb': { type: 'single_use', effect: 'Flip all your units face-down and shuffle them as you wish.' },
  'Vorpal Honing Amulet': { type: 'single_use', effect: 'Makes your next attack lethal: ignore terrain-, item-, or unit-specific effects. Range rules apply as usual. This attack can\'t be countered by Lancers.' },
  'True-Strike Lens': { type: 'gear_accessory', effect: 'Attacks by Shooters or Casters equipped with this card ignore terrain effects and Lancer counters.', allowedClasses: ['Shooter', 'Caster'] },
  'Magic Grenade': { type: 'single_use', effect: 'Allows one unit to attack once like a Caster (including range and the paralyzing magic effect). Doesn\'t stack with other effects.' },
  'Barbed Gauntlets': { type: 'gear_accessory', effect: 'If the wearer is successfully hit by a Brawler or Lancer, flip a coin. On heads, deal 1 damage to the attacker (even if this unit is defeated).', allowedClasses: ['Brawler', 'Lancer', 'Shooter', 'Caster'] },
  'Wardstone Bracelet': { type: 'gear_accessory', effect: 'You may choose to protect the wearer from all damage and effects of a single attack. Discard immediately if you do so.', allowedClasses: ['Brawler', 'Lancer', 'Shooter', 'Caster'] },
  'Teleport Boots': { type: 'gear_accessory', effect: 'The wearer may move to any tile before attacking.', allowedClasses: ['Brawler', 'Lancer', 'Shooter', 'Caster'] },
  'Elevated Ground': { type: 'terrain', effect: 'Flip a coin when a unit on this tile is attacked by a Brawler or Lancer. On heads, the attack fails.' },
  'Reinforced Barricade': { type: 'terrain', effect: 'Flip a coin when a unit on this tile is attacked by a Shooter or Caster. On heads, the attack fails.' },
  'Paralyzing Vines': { type: 'terrain', effect: 'Flip a coin whenever a unit on this tile attempts to move or switch. On tails, the move fails.' },
  'Divine Light': { type: 'terrain', effect: 'Any unit placed on, moved to, or swapped to this tile is immediately flipped face-up.' },
  'Unstable Ground': { type: 'terrain', effect: 'Flip a coin every time a unit on this tile begins an attack (or attempts a Lancer counter). On tails, the attack is canceled.' },
  "Champion's Crest": { type: 'promotion', effect: 'Promote a Brawler. The equipped unit gains +1 HP and can now attack forward and to both adjacent tiles.', allowedClasses: ['Brawler'], hpBonus: 1 },
  'Vanguard Lance': { type: 'promotion', effect: 'Promote a Lancer. The equipped unit gains +1 HP and can now target diagonally and sideways (2 left, 2 right). Applies to counters, too.', allowedClasses: ['Lancer'], hpBonus: 1 },
  "Sharpshooter's Scope": { type: 'promotion', effect: 'Promote a Shooter. The equipped unit gains +1 HP and all its attacks become true strikes, ignoring terrain-, item-, or unit-specific effects.', allowedClasses: ['Shooter'], hpBonus: 1 },
  "Archmage's Tome": { type: 'promotion', effect: 'Promote a Caster. The equipped unit gains +1 HP and its attacks now affect the target and both adjacent enemy units (must rest 1 turn after attacking).', allowedClasses: ['Caster'], hpBonus: 1 },
};

/** Terrain cards that can be placed on empty tiles during use-items. */
const TERRAIN_ITEM_NAMES = ['Elevated Ground', 'Reinforced Barricade', 'Paralyzing Vines', 'Divine Light', 'Unstable Ground'];

const FACTION_KEYS = {
  HOWLSWORN_CREED: 'Howlsworn Creed',
  WHISPERFANG_WATCH: 'Whisperfang Watch',
  SKYWARD_KIN: 'Skyward Kin',
  SCALEBOUND_BROOD: 'Scalebound Brood',
};

const UNIT_FACTION_BY_NAME = {
  'Harlund Ironhowl': FACTION_KEYS.HOWLSWORN_CREED,
  'Barrox Ironpaw': FACTION_KEYS.HOWLSWORN_CREED,
  'Jorren Brighthowl': FACTION_KEYS.HOWLSWORN_CREED,
  'Daro Swiftlash': FACTION_KEYS.HOWLSWORN_CREED,
  'Keera Stonesnout': FACTION_KEYS.HOWLSWORN_CREED,
  'Larrin Driftmark': FACTION_KEYS.HOWLSWORN_CREED,
  'Cassa Thornpelt': FACTION_KEYS.HOWLSWORN_CREED,
  'Solomon the Bound': FACTION_KEYS.HOWLSWORN_CREED,
  'Fenn Talonstrike': FACTION_KEYS.SKYWARD_KIN,
  'Torra Anvilcrest': FACTION_KEYS.SKYWARD_KIN,
  'Korrin Windfeather': FACTION_KEYS.SKYWARD_KIN,
  'Rowka Stonewing': FACTION_KEYS.SKYWARD_KIN,
  'Lyra Keenfang': FACTION_KEYS.SKYWARD_KIN,
  'Luma Flintwing': FACTION_KEYS.SKYWARD_KIN,
  'Ardan Quillsong': FACTION_KEYS.SKYWARD_KIN,
  'Chronir Stillmarch': FACTION_KEYS.SKYWARD_KIN,
  'Rinn Mossburn': FACTION_KEYS.WHISPERFANG_WATCH,
  'Vaela Strayshield': FACTION_KEYS.WHISPERFANG_WATCH,
  'Haskel Moorwake': FACTION_KEYS.WHISPERFANG_WATCH,
  'Nyss Shadowstep': FACTION_KEYS.WHISPERFANG_WATCH,
  'Sarro Chitterfang': FACTION_KEYS.WHISPERFANG_WATCH,
  'Tival Embercoat': FACTION_KEYS.WHISPERFANG_WATCH,
  'Thira Mistpaw': FACTION_KEYS.WHISPERFANG_WATCH,
  'Senya Longtail': FACTION_KEYS.WHISPERFANG_WATCH,
  'Kraska Mudtongue': FACTION_KEYS.SCALEBOUND_BROOD,
  'Grolk Hollowjaw': FACTION_KEYS.SCALEBOUND_BROOD,
  'Braskin Coilmail': FACTION_KEYS.SCALEBOUND_BROOD,
  'Pex Rippleclaw': FACTION_KEYS.SCALEBOUND_BROOD,
  'Rokklo Flickbranch': FACTION_KEYS.SCALEBOUND_BROOD,
  'Mira Skytwitch': FACTION_KEYS.SCALEBOUND_BROOD,
  'Iktha Embercoil': FACTION_KEYS.SCALEBOUND_BROOD,
  'Mivara Duskscale': FACTION_KEYS.SCALEBOUND_BROOD,
};

const FACTION_CARD_DEFS = [
  { id: 'howlsworn_creed', name: FACTION_KEYS.HOWLSWORN_CREED, imagePath: 'assets/factions/Howlsworn\u2028Creed.png' },
  { id: 'whisperfang_watch', name: FACTION_KEYS.WHISPERFANG_WATCH, imagePath: 'assets/factions/Whisperfang\u2028Watch.png' },
  { id: 'skyward_kin', name: FACTION_KEYS.SKYWARD_KIN, imagePath: 'assets/factions/Skyward Kin.png' },
  { id: 'scalebound_brood', name: FACTION_KEYS.SCALEBOUND_BROOD, imagePath: 'assets/factions/Scalebound Brood.png' },
];

const FACTION_CARD_BACK_IMAGE = 'assets/factions/Faction Back Side.png';

const BESTIARY_CARD_DEFS = [
  { id: 'primal_alpha', name: 'Primal Alpha', imagePath: 'assets/bestiary/1 - Primal Alpha.png' },
  { id: 'royal_caravan', name: 'Royal Caravan', imagePath: 'assets/bestiary/2 - Royal Caravan.png' },
  { id: 'hoarder_of_glimmer', name: 'Hoarder of Glimmer', imagePath: 'assets/bestiary/3 - Hoarder of Glimmer.png' },
  { id: 'iron_clad_shield', name: 'The Iron-Clad Shield', imagePath: 'assets/bestiary/4 - Iron-Clad Shield.png' },
  { id: 'eternal_carapace', name: 'Eternal Carapace', imagePath: 'assets/bestiary/5 - Eternal Carapace.png' },
  { id: 'rooted_colossus', name: 'Rooted Colossus', imagePath: 'assets/bestiary/6 \u2013 Rooted Colossus.png' },
  { id: 'high_aerie', name: 'High-Aerie', imagePath: 'assets/bestiary/7 \u2013 High-Aerie.png' },
  { id: 'muzzled_beast', name: 'Muzzled Beast', imagePath: 'assets/bestiary/8 \u2013 Muzzled Beast.png' },
  { id: 'fractured_hulk', name: 'Fractured Hulk', imagePath: 'assets/bestiary/9 \u2013 Fractured Hulk.png' },
  { id: 'ever_watching_eye', name: 'Ever-Watching Eye', imagePath: 'assets/bestiary/10 \u2013 Ever-Watching Eye.png' },
  { id: 'berserker', name: 'Berserker', imagePath: 'assets/bestiary/11 \u2013 Berserker.png' },
  { id: 'iron_maiden', name: 'Iron Maiden', imagePath: 'assets/bestiary/12 \u2013 Iron Maiden.png' },
  { id: 'unmaker', name: 'Unmaker', imagePath: 'assets/bestiary/13 \u2013 Unmaker.png' },
];

const BESTIARY_CARD_BACK_IMAGE = 'assets/bestiary/Seers Bestiary Back Side.png';
