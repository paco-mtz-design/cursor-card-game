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
