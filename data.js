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
