/**
 * Tacticlash — character data (from Character list.csv)
 * Columns: Name, Race + Description, Class, Species, Faction, Level
 */
const CHARACTERS = [
  { name: 'Harlund Ironhowl', class: 'Brawler', level: 'Veteran' },
  { name: 'Barrox Ironpaw', class: 'Brawler', level: 'Rookie' },
  { name: 'Jorren Brighthowl', class: 'Brawler', level: 'Veteran' },
  { name: 'Daro Swiftlash', class: 'Lancer', level: 'Rookie' },
  { name: 'Keera Stonesnout', class: 'Lancer', level: 'Veteran' },
  { name: 'Larrin Driftmark', class: 'Shooter', level: 'Rookie' },
  { name: 'Cassa Thornpelt', class: 'Shooter', level: 'Veteran' },
  { name: 'Solomon the Bound', class: 'Caster', level: 'Veteran' },
  { name: 'Fenn Talonstrike', class: 'Brawler', level: 'Rookie' },
  { name: 'Torra Anvilcrest', class: 'Brawler', level: 'Veteran' },
  { name: 'Korrin Windfeather', class: 'Lancer', level: 'Rookie' },
  { name: 'Rowka Stonewing', class: 'Lancer', level: 'Veteran' },
  { name: 'Lyra Keenfang', class: 'Shooter', level: 'Veteran' },
  { name: 'Luma Flintwing', class: 'Shooter', level: 'Rookie' },
  { name: 'Ardan Quillsong', class: 'Caster', level: 'Veteran' },
  { name: 'Chronir Stillmarch', class: 'Caster', level: 'Veteran' },
  { name: 'Rinn Mossburn', class: 'Brawler', level: 'Rookie' },
  { name: 'Vaela Strayshield', class: 'Brawler', level: 'Veteran' },
  { name: 'Haskel Moorwake', class: 'Brawler', level: 'Veteran' },
  { name: 'Nyss Shadowstep', class: 'Lancer', level: 'Veteran' },
  { name: 'Sarro Chitterfang', class: 'Lancer', level: 'Rookie' },
  { name: 'Tival Embercoat', class: 'Shooter', level: 'Veteran' },
  { name: 'Thira Mistpaw', class: 'Shooter', level: 'Rookie' },
  { name: 'Senya Longtail', class: 'Caster', level: 'Veteran' },
  { name: 'Kraska Mudtongue', class: 'Brawler', level: 'Rookie' },
  { name: 'Grolk Hollowjaw', class: 'Brawler', level: 'Veteran' },
  { name: 'Braskin Coilmail', class: 'Lancer', level: 'Veteran' },
  { name: 'Pex Rippleclaw', class: 'Lancer', level: 'Rookie' },
  { name: 'Rokklo Flickbranch', class: 'Shooter', level: 'Veteran' },
  { name: 'Mira Skytwitch', class: 'Shooter', level: 'Rookie' },
  { name: 'Iktha Embercoil', class: 'Caster', level: 'Veteran' },
  { name: 'Mivara Duskscale', class: 'Caster', level: 'Veteran' },
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
  { name: 'Rust Spell', quantity: 3 },
  { name: 'Earthquake Spell', quantity: 3 },
  { name: 'Revealing Light', quantity: 3 },
  { name: 'Disabling Net', quantity: 3 },
  { name: 'Smoke Bomb', quantity: 2 },
  { name: 'Critical Hit Spell', quantity: 2 },
  { name: 'Sniper Scope', quantity: 2 },
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
  'Rust Spell': { type: 'single_use', effect: 'Destroy one Gear card (either yours or an opponent\'s).' },
  'Earthquake Spell': { type: 'single_use', effect: 'Destroy one Terrain card (either yours or an opponent\'s).' },
  'Revealing Light': { type: 'single_use', effect: 'Reveal one face-down enemy unit (it remains face-up).' },
  'Disabling Net': { type: 'single_use', effect: 'The targeted enemy unit can\'t initiate an attack on their next turn (they can still be swapped with other moving units). Prevents affected Lancers from countering, as well.' },
  'Smoke Bomb': { type: 'single_use', effect: 'Flip all your units face-down, shuffle as you wish.' },
  'Critical Hit Spell': { type: 'single_use', effect: 'Makes your next attack fatal: ignoring terrain-, item-, or unit-specific effects. Range rules apply as usual.' },
  'Sniper Scope': { type: 'gear_accessory', effect: 'Attacks by Shooters or Casters equipped with this card become true strikes, ignoring terrain-, item-, or unit-specific effects.' },
  'Magic Grenade': { type: 'gear_weapon', effect: 'Allows the equipped unit to attack like a Caster (including the paralyze effect on surviving targets).' },
  'Barbed Gauntlets': { type: 'gear_accessory', effect: 'If the wearer is hit, flip a coin. On heads, deal 1 damage to the attacker (even if this unit is defeated).' },
  'Wardstone Bracelet': { type: 'gear_accessory', effect: 'Once per game, discard to negate all damage and effects of a single attack.' },
  'Teleport Boots': { type: 'gear_accessory', effect: 'The wearer may move to any tile before attacking.' },
  'Elevated Ground': { type: 'terrain', effect: 'Flip a coin when a unit on this tile is attacked by a Brawler or Lancer. On heads, the attack fails.' },
  'Reinforced Barricade': { type: 'terrain', effect: 'Flip a coin when a unit on this tile is attacked by a Shooter or Caster. On heads, the attack fails.' },
  'Paralyzing Vines': { type: 'terrain', effect: 'Flip a coin whenever a unit on this tile attempts to move or switch. On tails, the move fails.' },
  'Divine Light': { type: 'terrain', effect: 'Any unit placed on or moved to this tile is immediately flipped face-up and cannot turn face-down again.' },
  'Unstable Ground': { type: 'terrain', effect: 'Flip a coin every time a unit on this tile begins an attack. On tails, the attack is canceled.' },
  "Champion's Crest": { type: 'promotion', effect: 'Promote a Brawler. The equipped unit gains +1 HP and can now attack forward and to both adjacent tiles.' },
  'Vanguard Lance': { type: 'promotion', effect: 'Promote a Lancer. The equipped unit gains +1 HP and can now target diagonally and sideways (2 left, 2 right). Applies to counters, too.' },
  "Sharpshooter's Scope": { type: 'promotion', effect: 'Promote a Shooter. The equipped unit gains +1 HP and all its attacks become true strikes, ignoring terrain-, item-, or unit-specific effects.' },
  "Archmage's Tome": { type: 'promotion', effect: 'Promote a Caster. The equipped unit gains +1 HP and its attacks now affect the target and both adjacent enemy units (must rest 1 turn after attacking).' },
};
