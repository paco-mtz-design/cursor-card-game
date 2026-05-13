// Main app for the Tacticlash interactive manual.

const { useState, useEffect, useRef, useMemo } = React;

const CLASSES = [
  {
    cls: 'Brawler',
    archetype: 'Mighty tanks',
    advantage: 'Frontline enforcer — excels at holding positions and dealing steady pressure.',
    range: 'Attacks the Tile directly in front.',
    buff: 'Sturdy',
    buffDesc: 'Starts with 2 HP — twice the resilience of any other class.',
    rep: { name: 'Harlund', species: 'Dachshund Armored Knight', hp: 2, skill: 'Pack Shield' },
  },
  {
    cls: 'Lancer',
    archetype: 'Defensive towers',
    advantage: 'Zonal controller — punishes enemy positioning and protects allies.',
    range: 'Attacks diagonally forward (1 tile left/right).',
    buff: 'Counter',
    buffDesc: 'Counters any attack from within range, even if not the declared target. Flip a coin: on heads, block the attack and deal 1 HP damage to the attacker.',
    rep: { name: 'Rowka', species: 'The Bulwark', hp: 1, skill: '— Rookie Lancer' },
  },
  {
    cls: 'Shooter',
    archetype: 'Precision strikers',
    advantage: 'Best at picking off units from afar.',
    range: 'Attacks any target 3+ tiles away.',
    buff: 'Longshot',
    buffDesc: 'Deals 2 HP damage instead of 1 when attacking from one edge of the board to the other.',
    rep: { name: 'Thira', species: 'The Marksman', hp: 1, skill: '— Veteran Shooter' },
  },
  {
    cls: 'Caster',
    archetype: 'Strategic disruptors',
    advantage: 'Applies pressure and status effects from any position.',
    range: 'Attacks any enemy unit on the board.',
    buff: 'Magic Paralysis',
    buffDesc: 'Paralyzes surviving targets — they cannot move or attack on their next turn.',
    rep: { name: 'Iktha', species: 'Fire-Bellied Newt Illusionist', hp: 1, skill: 'Magma Skin' },
  },
];

// ---------- HERO ----------
function Hero() {
  return (
    <section className="relative pt-20 pb-24 px-6 md:px-12 overflow-hidden">
      {/* Subtle backdrop tile pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)',
        backgroundSize: '64px 64px',
      }} />
      <div className="relative max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-block w-2 h-2 rounded-full" style={{background: '#E31B1B'}} />
          <span className="inline-block w-2 h-2 rounded-full" style={{background: '#1B5AE3'}} />
          <span className="inline-block w-2 h-2 rounded-full" style={{background: '#23C21D'}} />
          <span className="inline-block w-2 h-2 rounded-full" style={{background: '#CA41F5'}} />
          <span className="ml-2 text-[11px] tracking-[0.3em] uppercase font-semibold text-slate-500">Interactive Manual · v2.2</span>
        </div>
        <h1 className="display font-black tracking-[-0.04em] leading-[0.85] text-slate-900"
            style={{fontSize: 'clamp(64px, 11vw, 168px)'}}>
          ⚔ Tacticlash
        </h1>
        <div className="mt-6 text-slate-600 text-lg">A game by <span className="font-semibold text-slate-900">Paco Martínez</span></div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          {[
            ['👥', '2 Players'],
            ['🎂', 'Ages 10+'],
            ['⏱', '45–90 min'],
          ].map(([ic, label]) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
              <span className="text-base">{ic}</span>
              <span className="font-semibold text-slate-800">{label}</span>
            </div>
          ))}
        </div>

        <p className="mt-12 max-w-3xl text-slate-700 text-2xl md:text-3xl leading-tight font-medium" style={{textWrap: 'balance'}}>
          Tacticlash is a lightweight dueler that <em className="not-italic text-slate-900 font-bold">cuts the setup, not the strategy</em>. A quick fix for veterans and a painless gateway for friends who usually dodge tactical games. Simple rules, deep choices, zero fluff.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-600">
          <span><span className="font-bold text-slate-900">32</span> playable fantasy characters</span>
          <span className="hidden md:inline text-slate-300">·</span>
          <span><span className="font-bold text-slate-900">62</span> items to change the course of battle</span>
          <span className="hidden md:inline text-slate-300">·</span>
          <span><span className="font-bold text-slate-900">13</span> tarot cards for advanced gameplay</span>
        </div>

        <div className="mt-14">
          <a href="#overview"
             className="group inline-flex items-center gap-3 px-6 py-4 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors">
            Learn how to play
            <span className="inline-block transition-transform group-hover:translate-y-1">↓</span>
          </a>
        </div>

        <HeroTOC />
      </div>
    </section>
  );
}

// ---------- SECTION HEADER ----------
function SectionHeader({ num, eyebrow, title, kicker }) {
  return (
    <div className="mb-10 md:mb-16 max-w-3xl">
      <div className="flex items-baseline gap-4 mb-4">
        <span className="display text-7xl md:text-8xl font-black text-slate-200 leading-none">{num}</span>
        <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-slate-500">{eyebrow}</span>
      </div>
      <h2 className="display text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95] text-slate-900" style={{textWrap: 'balance'}}>
        {title}
      </h2>
      {kicker && <p className="mt-5 text-slate-600 text-lg max-w-2xl leading-relaxed">{kicker}</p>}
    </div>
  );
}

// ---------- GAME OVERVIEW ----------
function Overview() {
  return (
    <section id="overview" className="px-6 md:px-12 py-24 border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          num="01"
          eyebrow="Game Overview"
          title="A tactical duel card game inspired by turn-based RPG combat."
        />

        <div className="grid md:grid-cols-12 gap-x-10 gap-y-12">
          <div className="md:col-span-7 space-y-5 text-slate-700 text-lg leading-relaxed">
            <p>Two players face off leading squads of <strong className="text-slate-900">5 units</strong> at a time.</p>
            <p>Units belong to distinct classes that give them advantages and disadvantages against other classes, and some units even have <strong className="text-slate-900">Veteran Skills</strong> of their own. Facing each other directly on the battlefield, these units will take turns <strong className="text-slate-900">Moving</strong> and <strong className="text-slate-900">Attacking</strong>; they’ll equip <strong className="text-slate-900">Gear</strong>, use powerful <strong className="text-slate-900">Items</strong>, and leverage different <strong className="text-slate-900">Terrain</strong> types to change the tide of battle.</p>
          </div>

          {/* Glossary side rail */}
          <aside className="md:col-span-5">
            <div className="rounded-2xl bg-white border border-slate-200 p-7">
              <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-slate-400 mb-4">Core verbs & nouns</div>
              <dl className="space-y-3 text-sm">
                {[
                  ['Move',     'Step one tile left or right.'],
                  ['Attack',   'Strike an enemy within your class’s range.'],
                  ['Gear',     'Equipment carried by a unit.'],
                  ['Items',    'Single-use cards with instant effects.'],
                  ['Terrain',  'Placed on a tile to modify the board.'],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-4 py-1.5 border-b border-slate-100 last:border-0">
                    <dt className="font-bold text-slate-900 w-20 shrink-0">{k}</dt>
                    <dd className="text-slate-600 leading-snug">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>

        {/* Setting subsection */}
        <div className="mt-20 pt-12 border-t border-slate-200">
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-slate-500">§ 1.1</span>
            <h3 className="display text-3xl md:text-4xl font-black tracking-[-0.02em] text-slate-900">Setting</h3>
          </div>

          <div className="grid md:grid-cols-12 gap-x-10 gap-y-6">
            <div className="md:col-span-7 space-y-5 text-slate-700 text-lg leading-relaxed">
              <p>Tacticlash’s characters are <strong className="text-slate-900">animal-based adventurers</strong> with specialized classes and abilities that resemble the classic roles in any fantasy adventure: strong warriors, magic users, and so on.</p>
              <p>The Tacticlash battlefield evokes the moment when enemy armies are already deployed and facing each other — there’s <em className="not-italic text-slate-900 font-semibold">no time for lengthy planning</em> or complex unit positioning. Quick thinking and fast-paced action are required each turn.</p>
              <p>The game emphasizes <strong className="text-slate-900">Fog of War</strong>, strategic movement, tactical attacks, and the smart use of Items and Terrain.</p>
            </div>

            <aside className="md:col-span-5">
              <div className="rounded-2xl bg-slate-900 text-slate-100 p-7 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05]" style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }} />
                <div className="relative">
                  <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-slate-400 mb-4">Pillars</div>
                  <ul className="space-y-3">
                    {[
                      ['Fog of War',          'Units start face-down. Reveal on Move, Attack, or Hit.'],
                      ['Strategic movement',  'One tile per turn — every step matters.'],
                      ['Tactical attacks',    'Class range defines what you can hit.'],
                      ['Items & Terrain',     'Bend the board your way.'],
                    ].map(([k, v]) => (
                      <li key={k} className="flex gap-3">
                        <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-amber-300" />
                        <span><strong className="text-white">{k}.</strong> <span className="text-slate-300">{v}</span></span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- OBJECTIVE ----------
function Objective() {
  return (
    <section id="objective" className="px-6 md:px-12 py-24 border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        <SectionHeader num="02" eyebrow="The Objective" title="Capture 15 of your opponent's units. (10 for express.)" />
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-slate-700 leading-relaxed text-lg space-y-4">
            <p>Two squads of five units face each other across a 5×2 grid. Units start <strong>face-down</strong> — the fog of war hides everything until they move, attack, or are hit.</p>
            <p>Each turn you reinforce, equip, then commit one unit to combat. The first to capture <strong>15</strong> wins.</p>
          </div>
          {/* 5x2 grid diagram */}
          <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-slate-400 mb-1">Opponent</div>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="aspect-[5/7] rounded-md bg-slate-900 relative overflow-hidden">
                  <div className="absolute inset-1 border border-white/10 rounded" />
                  <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xl">⚔</div>
                </div>
              ))}
            </div>
            <div className="h-px bg-slate-200 my-3" />
            <div className="grid grid-cols-5 gap-2">
              {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="aspect-[5/7] rounded-md relative overflow-hidden"
                     style={{background: 'linear-gradient(135deg, #1f2937, #0f172a)'}}>
                  <div className="absolute inset-1 border border-white/10 rounded" />
                  <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xl">⚔</div>
                </div>
              ))}
            </div>
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-slate-400 mt-1 text-right">You</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- GAME COMPONENTS ----------
function Components() {
  const basic = [
    { qty: '1', name: 'Unit Deck', detail: '32 unique characters', icon: 'deck-units' },
    { qty: '1', name: 'Item Deck', detail: '62 cards including Gear, Terrain, and single-use effects', icon: 'deck-items' },
    { qty: '1', name: 'Coin',      detail: 'For coin-flip mechanics', icon: 'coin' },
    { qty: '2', name: 'Battlefields', detail: '5×1 slots per player', icon: 'battlefield' },
    { qty: '—', name: 'Markers', detail: 'Damage (red) and status effect (orange)', icon: 'markers' },
  ];
  const advanced = [
    { qty: '1', name: 'Faction Deck',  detail: '12 faction cards, with 3 duplicates of each faction', icon: 'deck-faction' },
    { qty: '1', name: 'Bestiary Deck', detail: '13 unique Bestiary cards', icon: 'deck-bestiary' },
  ];

  return (
    <section id="components" className="px-6 md:px-12 py-24 border-t border-slate-200 bg-slate-50/40">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          num="03"
          eyebrow="Game Components"
          title="What's in the box."
        />

        <div className="grid md:grid-cols-2 gap-12">
          {/* Basic */}
          <div>
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-slate-500">§ 3.1</span>
              <h3 className="display text-2xl md:text-3xl font-black tracking-[-0.02em] text-slate-900">Basic Game</h3>
            </div>
            <ul className="divide-y divide-slate-200 rounded-2xl bg-white border border-slate-200 overflow-hidden">
              {basic.map(c => <ComponentRow key={c.name} {...c} />)}
            </ul>
          </div>

          {/* Advanced */}
          <div>
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-[11px] tracking-[0.3em] uppercase font-bold" style={{color: '#CA41F5'}}>§ 3.2</span>
              <h3 className="display text-2xl md:text-3xl font-black tracking-[-0.02em] text-slate-900">
                Advanced Game <span className="text-slate-400 font-medium text-lg">— with Seer’s Bestiary</span>
              </h3>
            </div>
            <ul className="divide-y divide-slate-200 rounded-2xl bg-white border border-slate-200 overflow-hidden">
              {advanced.map(c => <ComponentRow key={c.name} {...c} accent="#CA41F5" />)}
            </ul>
            <p className="mt-4 text-xs text-slate-500 italic px-2">Optional. See § 08 for full Bestiary rules.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComponentRow({ qty, name, detail, icon, accent = '#0F172A' }) {
  return (
    <li className="flex items-center gap-5 px-5 py-4">
      <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
           style={{background: `${accent}0F`, color: accent}}>
        <ComponentIcon kind={icon} />
      </div>
      <div className="shrink-0 w-10 text-right">
        <span className="display text-2xl font-black tabular-nums leading-none" style={{color: accent}}>{qty}</span>
      </div>
      <div className="min-w-0">
        <div className="font-bold text-slate-900">{name}</div>
        <div className="text-sm text-slate-600 leading-snug">{detail}</div>
      </div>
    </li>
  );
}

function ComponentIcon({ kind }) {
  const s = { width: 28, height: 28 };
  switch (kind) {
    case 'deck-units':
      return (
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" {...s}>
          <rect x="6" y="8" width="16" height="20" rx="1.5" />
          <rect x="9" y="5" width="16" height="20" rx="1.5" />
          <path d="M13 11 l4 4 l4 -4" />
        </svg>
      );
    case 'deck-items':
      return (
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" {...s}>
          <rect x="6" y="8" width="16" height="20" rx="1.5" />
          <rect x="9" y="5" width="16" height="20" rx="1.5" />
          <path d="M14 10 v4 M12 12 h4" strokeLinecap="round" />
        </svg>
      );
    case 'coin':
      return (
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" {...s}>
          <ellipse cx="16" cy="16" rx="10" ry="10" />
          <ellipse cx="16" cy="16" rx="6" ry="10" />
        </svg>
      );
    case 'battlefield':
      return (
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" {...s}>
          {[0,1,2,3,4].map(i => <rect key={`a${i}`} x={3 + i*5.2} y={6} width="4.6" height="7" rx="0.8" />)}
          {[0,1,2,3,4].map(i => <rect key={`b${i}`} x={3 + i*5.2} y={19} width="4.6" height="7" rx="0.8" />)}
        </svg>
      );
    case 'markers':
      return (
        <svg viewBox="0 0 32 32" {...s}>
          <circle cx="12" cy="16" r="6" fill="#E31B1B" />
          <circle cx="21" cy="16" r="6" fill="#F59E0B" />
        </svg>
      );
    case 'deck-faction':
      return (
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" {...s}>
          <rect x="6" y="8" width="16" height="20" rx="1.5" />
          <rect x="9" y="5" width="16" height="20" rx="1.5" />
          <path d="M17 10 l2 4 l4 .6 l-3 3 l.7 4 l-3.7 -2 l-3.7 2 l.7 -4 l-3 -3 l4 -.6 z" strokeWidth="1.4" />
        </svg>
      );
    case 'deck-bestiary':
      return (
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" {...s}>
          <rect x="6" y="8" width="16" height="20" rx="1.5" />
          <rect x="9" y="5" width="16" height="20" rx="1.5" />
          <circle cx="17" cy="15" r="2.2" />
          <path d="M14.5 18 c1.5 1 3.5 1 5 0" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

// ---------- CLASS PANEL ----------
function ClassPanel({ data }) {
  const [hovered, setHovered] = useState(false);
  const color = CLASS_COLOR[data.cls];
  const Glyph = CLASS_GLYPH[data.cls];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setHovered(h => !h)}
      className="group relative rounded-2xl bg-white border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Header strip */}
      <div className="px-7 pt-7 pb-5 border-b border-slate-100 relative">
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{background: color}} />
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[11px] tracking-[0.25em] uppercase font-bold mb-2" style={{color}}>{data.archetype}</div>
            <h3 className="display text-5xl font-black tracking-[-0.02em] leading-none" style={{color}}>{data.cls}</h3>
          </div>
          <div className="rounded-xl flex items-center justify-center w-14 h-14"
               style={{background: `${color}14`, color}}>
            <Glyph style={{width: 30, height: 30}} />
          </div>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">{data.advantage}</p>
      </div>

      {/* Range diagram + animated reveal */}
      <div className="grid md:grid-cols-[1fr_auto] gap-6 p-7 items-center">
        <div>
          <div className="text-[10px] tracking-[0.25em] uppercase font-bold text-slate-400 mb-3">Range</div>
          <div className={`transition-all duration-500 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-1'}`}>
            <RangeDiagram cls={data.cls} />
          </div>
        </div>
        <div className={`transition-all duration-500 ease-out ${hovered ? 'scale-125 -translate-y-2 rotate-0' : 'scale-95 rotate-[-3deg]'}`}
             style={{transformOrigin: 'center'}}>
          <UnitCard
            name={data.rep.name}
            cls={data.cls}
            hp={data.rep.hp}
            archetype={data.rep.species}
            skill={data.rep.skill}
            scale={0.85}
          />
        </div>
      </div>

      {/* Class buff callout */}
      <div className="m-5 p-5 rounded-xl border-l-[3px]" style={{background: `${color}0A`, borderColor: color}}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-slate-500">Class Buff</span>
          <span className="font-bold" style={{color}}>{data.buff}</span>
        </div>
        <p className="text-slate-700 text-sm leading-relaxed">{data.buffDesc}</p>
      </div>
    </div>
  );
}

function ClassesSection() {
  return (
    <section id="classes" className="px-6 md:px-12 py-24 border-t border-slate-200 bg-slate-50/40">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          num="04"
          eyebrow="The Units Deck"
          title="Unit Classes and Class-Specific Buffs"
          kicker="Each class has a distinct attack range and signature buff. Master the geometry and you master the match."
        />
        <div className="grid md:grid-cols-2 gap-6">
          {CLASSES.map(c => <ClassPanel key={c.cls} data={c} />)}
        </div>
        <p className="text-slate-500 text-sm mt-6 italic">Tap or hover any class card to bring its representative unit forward.</p>

        {/* Rookies vs. Veterans */}
        <div className="mt-24 pt-12 border-t border-slate-200">
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-slate-500">§ 4.1</span>
            <h3 className="display text-3xl md:text-4xl font-black tracking-[-0.02em] text-slate-900">Rookies vs. Veteran Units</h3>
          </div>

          <ul className="space-y-3 max-w-3xl text-slate-700 text-lg leading-relaxed mb-12">
            {[
              <>Some units are <strong className="text-slate-900">Rookies</strong>, some are <strong className="text-slate-900">Veterans</strong>.</>,
              <>Veteran units have <strong className="text-slate-900">Veteran Skills</strong> — unique abilities written on their cards.</>,
              <>Some skills trigger when <strong className="text-slate-900">Moving</strong>, <strong className="text-slate-900">Attacking</strong>, being <strong className="text-slate-900">Hit</strong>, and more.</>,
            ].map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 mt-2.5 w-1.5 h-1.5 rounded-full bg-slate-900" />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <div className="grid md:grid-cols-2 gap-8">
            <ExperienceExample
              tag="Rookie"
              tagColor="#64748B"
              cardName="Korrin"
              cls="Lancer"
              hp={1}
              archetype="Gray Heron, Spear Master"
              fields={[
                ['Unit',          'Korrin Windfeather'],
                ['Species',       'Gray Heron, Spear Master'],
                ['Class',         'Lancer'],
                ['Experience',    'Rookie'],
                ['Veteran Skill', '—'],
              ]}
              note={<><strong className="text-slate-900">Korrin</strong> is a Rookie <strong className="text-slate-900">Lancer</strong> with no <strong className="text-slate-900">Veteran Skills</strong>. He can still use his class buff to <strong className="text-slate-900">Counter</strong> attacks, though.</>}
            />
            <ExperienceExample
              tag="Veteran"
              tagColor="#CA41F5"
              cardName="Senya"
              cls="Caster"
              hp={1}
              archetype="Orange Cat, Witch"
              fields={[
                ['Unit',          'Senya Longtail'],
                ['Species',       'Orange Cat, Witch'],
                ['Class',         'Caster'],
                ['Experience',    'Veteran'],
                ['Veteran Skill', <><em className="not-italic font-semibold">"Hex Haze"</em> — If Hit, flip a coin. On heads, avoid the damage and deal 1 HP to the attacker. This unit cannot use this skill next turn.</>],
              ]}
              note={<><strong className="text-slate-900">Senya</strong> is a Veteran <strong className="text-slate-900">Caster</strong> (all Casters are Veterans!) and can use Hex Haze to her advantage. She can also leverage her class buff on top of her Veteran Skill, unless otherwise specified.</>}
            />
          </div>

          <div className="mt-8 rounded-xl bg-amber-50 border-l-[3px] border-amber-400 p-5 flex gap-4 items-start max-w-4xl">
            <div className="shrink-0 w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-sm">!</div>
            <div>
              <div className="text-[10px] tracking-[0.25em] uppercase font-bold text-amber-700 mb-1">Tip</div>
              <p className="text-amber-950 leading-relaxed">
                Keep an eye on your Veteran units' skills even when they aren't <strong>Attacking</strong> — they can grant important strategic advantages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceExample({ tag, tagColor, cardName, cls, hp, archetype, fields, note }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-7 flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <span className="px-2.5 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase font-black text-white" style={{background: tagColor}}>
          {tag}
        </span>
        <span className="text-[11px] tracking-[0.25em] uppercase font-bold text-slate-400">Example</span>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-6 items-start">
        <UnitCard name={cardName} cls={cls} hp={hp} archetype={archetype} scale={0.85} />
        <dl className="text-sm space-y-2 min-w-0">
          {fields.map(([k, v]) => (
            <div key={k}>
              <dt className="text-[10px] tracking-[0.25em] uppercase font-bold text-slate-400">{k}</dt>
              <dd className="text-slate-800 leading-snug font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="mt-7 pt-5 border-t border-slate-100 text-slate-700 leading-relaxed">
        {note}
      </p>
    </div>
  );
}

function ClassesSection_unused_marker() {
  // sentinel — leave previous ClassesSection in place, this function is unused.
  return null;
}

function _ClassesEnd() { return null; }

// ---------- INITIAL SETUP ----------
function Setup() {
  const steps = [
    { title: 'Shuffle the Unit Deck.',                                                                  visual: 'shuffle-units' },
    { title: 'Each player draws 5 unit cards from the unified deck.',                                   visual: 'draw-five' },
    { title: 'Each player places these 5 units face-down, in the order they desire, on any of their 5 available battlefield slots.', visual: 'place-down' },
    { title: 'Both rows of units face each other symmetrically in a 5×2 grid.',                       visual: 'face-off' },
    { title: 'Shuffle the Item Deck and make room for the discard pile.',                               visual: 'item-deck' },
    { title: 'Start the game.',                                                                         visual: 'go' },
  ];
  return (
    <section id="setup" className="px-6 md:px-12 py-24 border-t border-slate-200 bg-slate-50/40">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          num="06"
          eyebrow="Initial Setup"
          title="Six moves to take the battlefield."
        />

        <ol className="relative">
          {steps.map((s, i) => (
            <li key={i} className="grid md:grid-cols-[140px_1fr_280px] gap-x-8 gap-y-4 items-center py-7 border-b border-slate-200 last:border-b-0 relative">
              <div className="flex items-center gap-4 md:gap-0">
                <div className="display text-6xl md:text-7xl font-black tabular-nums leading-none text-slate-900">
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
              <p className="text-slate-800 text-xl md:text-2xl leading-snug font-medium" style={{textWrap: 'balance', fontFamily: 'Space Grotesk, sans-serif'}}>
                {s.title}
              </p>
              <div className="md:justify-self-end">
                <SetupVisual kind={s.visual} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SetupVisual({ kind }) {
  // a face-down mini card
  const FaceDown = ({ x, y, w = 22, h = 30, rx = 2 }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx={rx} fill="#0F172A" />
      <rect x={1.5} y={1.5} width={w - 3} height={h - 3} rx={rx - 0.5} fill="none" stroke="white" strokeOpacity={0.18} />
      <text x={w/2} y={h/2 + 4} textAnchor="middle" fontSize="10" fill="white" fillOpacity={0.35} fontWeight="700">⚔</text>
    </g>
  );
  const Slot = ({ x, y, w = 22, h = 30 }) => (
    <rect x={x} y={y} width={w} height={h} rx={2} fill="none" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 3" />
  );

  switch (kind) {
    case 'shuffle-units':
      return (
        <svg viewBox="0 0 160 90" width="200" height="112" className="block">
          {/* swirl arrows over a stack of cards */}
          <g>
            <rect x="55" y="30" width="40" height="54" rx="4" fill="#0F172A" transform="rotate(-8 75 57)" />
            <rect x="63" y="24" width="40" height="54" rx="4" fill="#1F2937" transform="rotate(2 83 51)" />
            <rect x="71" y="18" width="40" height="54" rx="4" fill="#0F172A" />
            <text x="91" y="50" textAnchor="middle" fontSize="14" fill="white" fillOpacity={0.3} fontWeight="700">⚔</text>
          </g>
          <path d="M 25 25 q 15 -20 50 -10" stroke="#0F172A" strokeWidth="1.5" fill="none" />
          <path d="M 75 15 l -5 0 l 5 -5" stroke="#0F172A" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 135 65 q -15 20 -50 10" stroke="#0F172A" strokeWidth="1.5" fill="none" />
          <path d="M 85 75 l 5 0 l -5 5" stroke="#0F172A" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'draw-five':
      return (
        <svg viewBox="0 0 200 110" width="240" height="132" className="block">
          {/* hand of 5 cards fanning */}
          {[-24, -12, 0, 12, 24].map((rot, i) => (
            <g key={i} transform={`rotate(${rot} 100 130) translate(82 60)`}>
              <rect width="36" height="50" rx="3" fill="#0F172A" />
              <rect x="2" y="2" width="32" height="46" rx="2" fill="none" stroke="white" strokeOpacity={0.18} />
              <text x="18" y="31" textAnchor="middle" fontSize="14" fill="white" fillOpacity={0.3} fontWeight="700">⚔</text>
            </g>
          ))}
        </svg>
      );

    case 'place-down':
      return (
        <svg viewBox="0 0 200 80" width="240" height="96" className="block">
          {/* 5 dashed slots on top, 5 face-down on bottom + downward arrows */}
          {[0,1,2,3,4].map(i => <Slot key={`s${i}`} x={20 + i * 32} y={6} />)}
          {[0,1,2,3,4].map(i => (
            <g key={`a${i}`}>
              <path d={`M ${31 + i * 32} 40 v 6`} stroke="#0F172A" strokeWidth="1.5" />
              <path d={`M ${28 + i * 32} 43 l 3 4 l 3 -4`} stroke="#0F172A" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ))}
          {[0,1,2,3,4].map(i => <FaceDown key={`b${i}`} x={20 + i * 32} y={48} />)}
        </svg>
      );

    case 'face-off':
      return (
        <svg viewBox="0 0 200 84" width="240" height="100" className="block">
          {/* 5x2 face-down grid + center divider */}
          {[0,1,2,3,4].map(i => <FaceDown key={`top${i}`} x={20 + i * 32} y={2} />)}
          <line x1="10" y1="42" x2="190" y2="42" stroke="#0F172A" strokeOpacity={0.2} strokeDasharray="3 3" />
          {[0,1,2,3,4].map(i => <FaceDown key={`bot${i}`} x={20 + i * 32} y={48} />)}
        </svg>
      );

    case 'item-deck':
      return (
        <svg viewBox="0 0 180 100" width="220" height="122" className="block">
          {/* item deck (orange/red tint) + discard slot */}
          <g>
            <rect x="22" y="30" width="50" height="66" rx="4" fill="#1F2937" transform="rotate(-4 47 63)" />
            <rect x="30" y="22" width="50" height="66" rx="4" fill="#0F172A" />
            <text x="55" y="60" textAnchor="middle" fontSize="22" fill="#F59E0B" fontWeight="700">✱</text>
          </g>
          {/* arrow */}
          <path d="M 92 55 h 14" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M 104 51 l 4 4 l -4 4" stroke="#0F172A" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* discard pile slot */}
          <rect x="114" y="22" width="50" height="66" rx="4" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="139" y="54" textAnchor="middle" fontSize="8" fill="#94A3B8" fontWeight="700" letterSpacing="1.5">DISCARD</text>
        </svg>
      );

    case 'go':
      return (
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl">⚔</div>
          <div className="display text-2xl font-black tracking-[-0.02em] text-slate-900">Battle!</div>
        </div>
      );

    default:
      return null;
  }
}

// ---------- TURN STRUCTURE ----------
function TurnStructure() {
  const phases = [
    {
      num: 1,
      title: 'Reinforcement and Resupply',
      subtitle: 'Refill the line',
      intro: 'At the start of your turn:',
      bullets: [
        <>If any of your units were captured last turn and there are still unit cards in the deck, <strong className="text-slate-900">draw 1 unit card</strong> per captured unit and <strong className="text-slate-900">Deploy</strong> it face-down (unless otherwise specified by card effects) in any open slot.</>,
        <><strong className="text-slate-900">Draw 1 item card.</strong></>,
      ],
    },
    {
      num: 2,
      title: 'Item Phase',
      subtitle: 'Equip & Deploy',
      bullets: [
        <><strong className="text-slate-900">Equip</strong> any Gear as you wish.</>,
        <><strong className="text-slate-900">Place</strong> any Terrain cards as you wish.</>,
        <><strong className="text-slate-900">Use or activate</strong> any single-use items as you wish.</>,
      ],
    },
    {
      num: 3,
      title: 'Combat',
      subtitle: 'Move & Attack',
      bullets: [
        <><strong className="text-slate-900">Choose 1 unit</strong> to act.</>,
        <>You may <strong className="text-slate-900">Move</strong> 1 slot left or right (<strong className="text-slate-900">Swap</strong> with an adjacent Ally if needed). The Moved unit is revealed if face-down.</>,
        <>You <strong className="text-slate-900">must then Attack</strong>.</>,
        <>Attacking <strong className="text-slate-900">reveals both</strong> the attacker and the Target.</>,
      ],
    },
  ];

  return (
    <section id="turn" className="px-6 md:px-12 py-24 border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        <SectionHeader num="07" eyebrow="Turn Structure" title="Three phases, in order. Every single turn." />

        {/* Quick visual diagram */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-0 relative mb-20">
          {phases.map((p, i) => (
            <div key={p.num} className="relative">
              <div className="bg-slate-50/60 border border-slate-200 rounded-2xl md:rounded-r-none md:border-r-0 last:md:rounded-r-2xl last:md:border-r p-7 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-lg">{p.num}</div>
                  <div className="text-[11px] tracking-[0.25em] uppercase font-bold text-slate-500">{p.title}</div>
                </div>
                <h3 className="display text-2xl font-bold text-slate-900">{p.subtitle}</h3>
              </div>
              {i < phases.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-slate-900 text-white items-center justify-center text-xs">→</div>
              )}
            </div>
          ))}
        </div>

        {/* Detailed phase entries */}
        <ol className="relative">
          {phases.map((p, i) => (
            <li key={p.num} className="grid md:grid-cols-[140px_1fr] gap-x-8 gap-y-5 items-start py-9 border-b border-slate-200 last:border-b-0">
              <div>
                <div className="display text-6xl md:text-7xl font-black tabular-nums leading-none text-slate-900">
                  {String(p.num).padStart(2, '0')}
                </div>
              </div>
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase font-bold text-slate-500 mb-2">{p.title}</div>
                <h4 className="display text-3xl md:text-4xl font-black tracking-[-0.02em] text-slate-900 mb-5">{p.subtitle}</h4>
                {p.intro && <p className="text-slate-700 text-lg mb-4">{p.intro}</p>}
                <ul className="space-y-3 max-w-3xl text-slate-700 text-lg leading-relaxed">
                  {p.bullets.map((b, k) => (
                    <li key={k} className="flex gap-3">
                      <span className="shrink-0 mt-2.5 w-1.5 h-1.5 rounded-full bg-slate-900" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        {/* Hand-off into the manual's detailed combat rules */}
        <SectionFooter
          id="turn"
          nextKicker="Review the Detailed Rules for a complete breakdown of Combat rules."
        />
      </div>
    </section>
  );
}
// ---------- ITEMS ----------
function ItemsSection() {
  // Each row keeps the cool sticky-label + card-wall layout, but rows are now
  // organized under the three umbrella card categories from the manual.
  const armor = [
    { name: 'Light Armor',         type: 'Armor', icon: 'armor', color: '#475569', desc: 'Lancers, Shooters, or Casters gain +1 HP.' },
    { name: 'Heavy Armor',         type: 'Armor', icon: 'armor', color: '#475569', desc: 'Brawlers gain +1 HP.' },
    { name: 'Premium Light Armor', type: 'Armor', icon: 'armor', color: '#475569', desc: 'Lancers, Shooters, or Casters gain +2 HP.' },
  ];
  const accessories = [
    { name: 'Wardstone Bracelet', type: 'Accessory', icon: 'accessory', color: '#0E7490', desc: 'Protect the wearer from all damage and effects of one Attack. Destroy after use.' },
    { name: 'Teleport Boots',     type: 'Accessory', icon: 'accessory', color: '#0E7490', desc: 'Before attacking, move to any Tile in your row, swapping with any Ally already there.' },
    { name: 'Barbed Gauntlets',   type: 'Accessory', icon: 'accessory', color: '#0E7490', desc: 'If Hit by a Brawler or Lancer, flip a coin. On heads, deal 1 HP damage to the attacker.' },
  ];
  const legendary = [
    { name: "Champion's Crest", type: 'Promotion', icon: 'weapon', color: '#A16207', desc: 'Brawler-only. +1 HP, ignore the first counter each turn.' },
    { name: 'Vanguard Lance', type: 'Promotion', icon: 'weapon', color: '#A16207', desc: 'Lancer-only. +1 HP, counter automatically lands once.' },
  ];
  const singleUse = [
    { name: 'Healing Potion',  type: 'Single-Use', icon: 'single', color: '#0F172A', desc: 'Restore 1 HP to a Target.' },
    { name: 'Obscuring Bomb', type: 'Single-Use', icon: 'single', color: '#0F172A', desc: 'Flip all your units face-down and shuffle them as you wish.' },
    { name: 'Magic Grenade',  type: 'Single-Use', icon: 'single', color: '#0F172A', desc: 'Allows one unit to Attack once like a Caster (including range and Paralyzing effect).' },
  ];
  const terrain = [
    { name: 'Elevated Ground',      type: 'Terrain', icon: 'terrain', color: '#7C5A2A', desc: 'If Occupant is attacked by a Brawler or Lancer, flip a coin. On heads, the Attack fails.' },
    { name: 'Reinforced Barricade', type: 'Terrain', icon: 'terrain', color: '#7C5A2A', desc: 'If Occupant is attacked by a Shooter or Caster, flip a coin. On heads, the Attack fails.' },
    { name: 'Divine Light',         type: 'Terrain', icon: 'terrain', color: '#7C5A2A', desc: 'Any Unit Deployed, Moved, or Swapped to this tile is flipped face-up.' },
  ];

  return (
    <section id="items" className="px-6 md:px-12 py-24 border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          num="05"
          eyebrow="The Items Deck"
          title="62 cards. Five ways to bend the board your way."
        />

        {/* ===== Gear ===== */}
        <ItemsCategory
          num="5.1"
          title="Gear"
          intro={<>Equippable cards that enhance a unit's stats or grant new abilities. <strong className="text-slate-900">Only 1 Gear card per unit at a time.</strong> If the equipped unit is face-down, so is their Gear.</>}
        >
          <ItemRow
            label="Armor"
            description={<><strong className="text-slate-900">Adds HP.</strong> <strong className="text-slate-900">Light Armor</strong> fits Lancers, Shooters, and Casters. <strong className="text-slate-900">Heavy Armor</strong> fits Brawlers only.</>}
            items={armor}
          />
          <ItemRow
            label="Accessories"
            description={<>Adds <strong className="text-slate-900">unique passive or active effects</strong>. Used to boost mobility, defense, or targeting. Equippable by any class unless otherwise specified on the card.</>}
            items={accessories}
          />
          <ItemRow
            label="Legendary Weapons"
            description={<><strong className="text-slate-900">Class-specific upgrades.</strong> Adds <strong className="text-slate-900">+1 HP</strong> and unlocks a powerful new ability. Each Legendary Weapon is unique — only 1 copy in the deck.</>}
            items={legendary}
          />
        </ItemsCategory>

        {/* ===== Single-Use ===== */}
        <ItemsCategory
          num="5.2"
          title="Single-Use Items"
          intro={<>Instant effect, then discard. Use for <strong className="text-slate-900">healing, disruption, or tactical tricks</strong>. Does <em className="not-italic font-semibold text-slate-900">not</em> count as Gear.</>}
        >
          <ItemRow label="Single-Use" items={singleUse} />
        </ItemsCategory>

        {/* ===== Terrain ===== */}
        <ItemsCategory
          num="5.3"
          title="Terrain Cards"
          intro={<>Placed <strong className="text-slate-900">face-up</strong> on any Tile to affect the board. Grants protection or disrupts movement and attacks. Remains on the board until removed.</>}
        >
          <ItemRow label="Terrain" items={terrain} />
        </ItemsCategory>

        {/* ===== Stacking Gear ===== */}
        <div className="mt-24 pt-12 border-t border-slate-200">
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-slate-500">§ 5.4</span>
            <h3 className="display text-3xl md:text-4xl font-black tracking-[-0.02em] text-slate-900">Stacking Gear</h3>
          </div>
          <ul className="space-y-4 max-w-3xl text-slate-700 text-lg leading-relaxed">
            {[
              <><strong className="text-slate-900">Stacking is not allowed</strong> unless otherwise specified by a card effect: any given unit may have up to one piece of Gear equipped at a time.</>,
              <>You may <strong className="text-slate-900">swap equipped Gear</strong> to attach new Gear — the discarded Gear goes immediately to the discard pile.</>,
              <>A unit that would be <strong className="text-slate-900">captured if their Gear is removed</strong> (i.e., its HP would reach 0) <strong className="text-slate-900">cannot swap Gear</strong> this way.</>,
            ].map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 mt-2.5 w-1.5 h-1.5 rounded-full bg-slate-900" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ItemsCategory({ num, title, intro, children }) {
  return (
    <div className="mb-16 last:mb-0">
      <div className="mb-8 pb-6 border-b border-slate-200 max-w-3xl">
        <div className="flex items-baseline gap-4 mb-3">
          <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-slate-500">§ {num}</span>
          <h3 className="display text-3xl md:text-4xl font-black tracking-[-0.02em] text-slate-900">{title}</h3>
        </div>
        <p className="text-slate-700 text-lg leading-relaxed">{intro}</p>
      </div>
      <div className="space-y-10">
        {children}
      </div>
    </div>
  );
}

function ItemRow({ label, description, items }) {
  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-8 items-start">
      <div>
        <div className="text-[11px] tracking-[0.3em] uppercase font-bold text-slate-500 mb-2">{label}</div>
        {description && <p className="text-slate-700 leading-snug">{description}</p>}
      </div>
      <div className="flex flex-wrap gap-5">
        {items.map(it => (
          <div key={it.name} className="hover-card transition-transform duration-200 hover:-translate-y-1">
            <ItemCard {...it} scale={0.92} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- DETAILED RULES ----------

// A small inline cross-link to another section of the manual. Dotted-underline
// gives readers a visible affordance without overwhelming a dense rules page.
function RefLink({ to, children }) {
  return (
    <a href={to}
       className="underline decoration-dotted decoration-2 decoration-slate-400 underline-offset-4 hover:decoration-slate-900 hover:text-slate-900 transition-colors">
      {children}
    </a>
  );
}

function DetailedRules() {
  const subs = [
    { id: 'fog-of-war', num: '8.1', label: 'Fog of War' },
    { id: 'movement',   num: '8.2', label: 'Movement' },
    { id: 'combat',     num: '8.3', label: 'Combat' },
    { id: 'endgame',    num: '8.4', label: 'Endgame' },
  ];

  return (
    <section id="detailed-rules" className="px-6 md:px-12 py-24 border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          num="08"
          eyebrow="Detailed Rules"
          title="The fine print. Read once, refer back forever."
        />

        <nav className="flex flex-wrap gap-2 mb-16 -mt-4">
          {subs.map(s => (
            <a key={s.id} href={`#${s.id}`}
               className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-colors">
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-slate-400 group-hover:text-slate-300">§ {s.num}</span>
              <span className="text-sm font-semibold">{s.label}</span>
            </a>
          ))}
        </nav>

        {/* ===== 8.1 Fog of War ===== */}
        <div id="fog-of-war" className="scroll-mt-24 mb-24">
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-slate-500">§ 8.1</span>
            <h3 className="display text-3xl md:text-4xl font-black tracking-[-0.02em] text-slate-900">Fog of War</h3>
          </div>
          <div className="grid md:grid-cols-[1fr_auto] gap-10 items-start">
            <ul className="space-y-3 text-slate-700 text-lg leading-relaxed max-w-2xl">
              <li className="flex gap-3"><Dot/><span>Units enter the board <strong className="text-slate-900">face-down</strong>, unless otherwise specified by card effects.</span></li>
              <li className="flex gap-3"><Dot/><span>Units are <strong className="text-slate-900">revealed</strong> when they <strong className="text-slate-900">Move</strong>, <strong className="text-slate-900">Attack</strong>, or are <strong className="text-slate-900">Hit</strong>.</span></li>
              <li className="flex gap-3"><Dot/><span>Units remain face-down until revealed by game events.</span></li>
            </ul>
            <FogOfWarVisual />
          </div>
        </div>

        {/* ===== 8.2 Movement ===== */}
        <div id="movement" className="scroll-mt-24 mb-24">
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-slate-500">§ 8.2</span>
            <h3 className="display text-3xl md:text-4xl font-black tracking-[-0.02em] text-slate-900">Movement</h3>
          </div>
          <div className="grid md:grid-cols-[1fr_auto] gap-10 items-start">
            <ul className="space-y-3 text-slate-700 text-lg leading-relaxed max-w-2xl">
              <li className="flex gap-3"><Dot/><span>Units may <strong className="text-slate-900">Move 1 Tile</strong> left or right per turn, but only if they are selected to <RefLink to="#turn">Attack</RefLink> that turn.</span></li>
              <li className="flex gap-3"><Dot/><span>When Moving, units must <strong className="text-slate-900">Swap Tiles</strong> with any unit occupying the destination Tile.</span></li>
              <li className="flex gap-3"><Dot/><span>Units <strong className="text-slate-900">carry Gear</strong> when they Move.</span></li>
              <li className="flex gap-3"><Dot/><span><RefLink to="#items">Terrain</RefLink> cards are <strong className="text-slate-900">not carried</strong> with movement.</span></li>
              <li className="flex gap-3"><Dot/><span>A Moved unit is revealed face-up (swapped Allies are not).</span></li>
              <li className="flex gap-3"><Dot/><span><strong className="text-slate-900">Regardless of movement, one unit must always Attack each turn.</strong></span></li>
            </ul>
            <MovementVisual />
          </div>
        </div>

        {/* ===== 8.3 Combat ===== */}
        <div id="combat" className="scroll-mt-24 mb-24">
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-slate-500">§ 8.3</span>
            <h3 className="display text-3xl md:text-4xl font-black tracking-[-0.02em] text-slate-900">Combat</h3>
          </div>

          <p className="text-slate-700 text-lg leading-relaxed max-w-3xl mb-8">
            Players must clearly communicate which unit they want to use for <strong className="text-slate-900">Attacking</strong> each turn.
          </p>

          <ol className="mb-10 space-y-3">
            <CombatStep n={1} title="Reveal the attacking unit">
              Reveal the attacking unit and any equipped <RefLink to="#items">Gear</RefLink> (if face-down).
            </CombatStep>
            <CombatStep n={2} title="Announce and execute Movement">
              Announce and execute any <RefLink to="#movement">Movement</RefLink> <span className="text-slate-500">(optional)</span>.
            </CombatStep>
            <CombatStep n={3} title="Declare the Target Enemy unit">
              Declare the <strong className="text-slate-900">Target Enemy</strong> unit.
            </CombatStep>
            <CombatStep n={4} title="Attacker states any Veteran Skill or item effect">
              If the Attack will leverage a <RefLink to="#classes">Veteran Skill</RefLink> or item card effect, this must be stated <em className="not-italic font-semibold text-slate-900">before the Target is revealed</em>.
            </CombatStep>
            <CombatStep n={5} title="Opponent declares any interception">
              Before revealing the Target, the Opponent must declare any effect that prevents the Attack — such as a <RefLink to="#classes">Veteran Skill</RefLink>, a <RefLink to="#items">Terrain</RefLink> card effect, or a properly positioned <RefLink to="#classes">Lancer</RefLink> attempting to <RefLink to="#classes">Counter</RefLink>. All such events must be resolved before the Target is revealed, if the Attack remains successful.
            </CombatStep>
          </ol>

          <div className="mb-10">
            <div className="text-[11px] tracking-[0.3em] uppercase font-bold text-slate-500 mb-3">Damage</div>
            <p className="text-slate-700 text-lg leading-relaxed max-w-3xl mb-6">
              Damage is then calculated. <strong className="text-slate-900">Base damage is 1 HP</strong>, unless modified by class buffs, <RefLink to="#classes">Veteran Skills</RefLink>, or item effects.
            </p>

            <HPBaselines />

            <ul className="mt-8 space-y-3 text-slate-700 text-lg leading-relaxed max-w-3xl">
              <li className="flex gap-3"><Dot/><span><strong className="text-slate-900">HP can be increased</strong> with <RefLink to="#items">Gear</RefLink> and certain card effects.</span></li>
              <li className="flex gap-3"><Dot/><span>A unit is <strong className="text-slate-900">captured</strong> when its HP reaches 0.</span></li>
              <li className="flex gap-3"><Dot/><span>Place damage and/or effect markers on surviving units.</span></li>
              <li className="flex gap-3"><Dot/><span>If the Attack results in capturing any of the attacking player's units (e.g., from <RefLink to="#classes">Counters</RefLink> or other effects), replace all captured units before passing the turn to the next player.</span></li>
            </ul>
          </div>
        </div>

        {/* ===== 8.4 Endgame ===== */}
        <div id="endgame" className="scroll-mt-24">
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-slate-500">§ 8.4</span>
            <h3 className="display text-3xl md:text-4xl font-black tracking-[-0.02em] text-slate-900">Endgame</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <EndgameTile eyebrow="Empty deck"   body={<>If the <strong className="text-slate-900">Unit Deck</strong> is empty, captured units are not replaced.</>} />
            <EndgameTile eyebrow="No units left" body={<>If a player has <strong className="text-slate-900">no units</strong> left on the board, they <strong className="text-slate-900">lose</strong>.</>} />
            <EndgameTile eyebrow="Cannot attack" body={<>If a player <strong className="text-slate-900">cannot Attack</strong>, they may <RefLink to="#movement">Move</RefLink> and pass.</>} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return <span className="shrink-0 mt-2.5 w-1.5 h-1.5 rounded-full bg-slate-900" />;
}

function CombatStep({ n, title, children }) {
  return (
    <li className="grid grid-cols-[56px_1fr] gap-5 p-5 rounded-xl bg-white border border-slate-200">
      <div className="display text-3xl font-black tabular-nums leading-none text-slate-900">
        {String(n).padStart(2, '0')}
      </div>
      <div>
        <div className="font-bold text-slate-900 mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>{title}</div>
        <p className="text-slate-700 leading-relaxed">{children}</p>
      </div>
    </li>
  );
}

function HPBaselines() {
  const rows = [
    { cls: 'Brawler', hp: 2 },
    { cls: 'Lancer',  hp: 1 },
    { cls: 'Shooter', hp: 1 },
    { cls: 'Caster',  hp: 1 },
  ];
  return (
    <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden max-w-3xl">
      <div className="grid grid-cols-4">
        {rows.map((r, i) => {
          const color = CLASS_COLOR[r.cls];
          return (
            <div key={r.cls} className={`p-5 ${i > 0 ? 'border-l border-slate-200' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full" style={{background: color}} />
                <span className="text-[11px] tracking-[0.2em] uppercase font-bold" style={{color}}>{r.cls}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="display text-4xl font-black tabular-nums text-slate-900">{r.hp}</span>
                <span className="text-sm font-bold text-slate-500">HP</span>
              </div>
              <div className="mt-2 flex items-center gap-1">
                {Array.from({length: r.hp}).map((_, k) => (
                  <span key={k} className="w-2.5 h-2.5 rounded-full" style={{background: color}} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EndgameTile({ eyebrow, body }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200">
      <div className="text-[10px] tracking-[0.25em] uppercase font-bold text-slate-400 mb-3">{eyebrow}</div>
      <p className="text-slate-800 leading-relaxed text-lg" style={{fontFamily: 'Space Grotesk, sans-serif'}}>{body}</p>
    </div>
  );
}

function FogOfWarVisual() {
  const card = (revealed, key) => (
    <div key={key} className="relative shrink-0 rounded-md overflow-hidden"
         style={{
           width: 60, height: 84,
           background: revealed ? '#FAFAF6' : 'linear-gradient(135deg,#1F2937,#0F172A)',
           border: revealed ? '1px solid #E2E8F0' : 'none',
         }}>
      {revealed ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full" style={{background: '#E31B1B22', border: '2px solid #E31B1B'}} />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xl">⚔</div>
      )}
    </div>
  );

  const Row = ({ trigger }) => (
    <div className="flex items-center gap-3">
      {card(false)}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-slate-500">{trigger}</span>
        <div className="flex items-center gap-0.5">
          <div className="h-px w-10 bg-slate-400" />
          <span className="text-slate-400 -ml-1">▶</span>
        </div>
      </div>
      {card(true)}
    </div>
  );

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
      <Row trigger="Move" />
      <Row trigger="Attack" />
      <Row trigger="Hit" />
    </div>
  );
}

function MovementVisual() {
  const slot = (i, opts = {}) => (
    <div key={i}
         className="shrink-0 rounded-md flex items-center justify-center"
         style={{
           width: 36, height: 50,
           background: opts.unit ? '#0F172A' : 'transparent',
           border: opts.unit ? 'none' : '1px dashed #CBD5E1',
           color: 'white',
         }}>
      {opts.unit && <span className="text-white/30 text-sm">⚔</span>}
    </div>
  );

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
      <div>
        <div className="text-[10px] tracking-[0.2em] uppercase font-bold text-slate-500 mb-3">Move 1 tile</div>
        <div className="flex items-center gap-2 relative">
          {[0,1,2,3,4].map(i => slot(i, {unit: i === 2}))}
          <svg width="42" height="22" viewBox="0 0 42 22" className="absolute" style={{left: 92, top: -14}}>
            <path d="M 4 11 Q 21 -6 38 11" stroke="#0F172A" strokeWidth="1.5" fill="none" />
            <path d="M 38 11 l -5 -2 m 5 2 l -3 4" stroke="#0F172A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div>
        <div className="text-[10px] tracking-[0.2em] uppercase font-bold text-slate-500 mb-3">Swap with Ally</div>
        <div className="flex items-center gap-2 relative">
          {[0,1,2,3,4].map(i => slot(i, {unit: i === 2 || i === 3}))}
          <svg width="60" height="30" viewBox="0 0 60 30" className="absolute" style={{left: 84, top: -12}}>
            <path d="M 8 6 Q 30 -8 52 6" stroke="#0F172A" strokeWidth="1.5" fill="none" />
            <path d="M 52 6 l -5 -2 m 5 2 l -3 4" stroke="#0F172A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 52 24 Q 30 38 8 24" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
            <path d="M 8 24 l 5 2 m -5 -2 l 3 -4" stroke="#94A3B8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ---------- ADVANCED RULES ----------
const BESTIARY = [
  { num: 'I',    name: 'Primal Alpha',      path: 'assets/bestiary/01 Primal Alpha.png' },
  { num: 'III',  name: 'Hoarder of Glimmer', path: 'assets/bestiary/03 Hoarder of Glimmer.png' },
  { num: 'IV',   name: 'Iron-Clad Shield',  path: 'assets/bestiary/04 Iron-Clad Shield.png' },
  { num: 'XI',   name: 'Berserker',         path: 'assets/bestiary/11 Berserker.png' },
  { num: 'XIII', name: 'Unmaker',           path: 'assets/bestiary/13 Unmaker.png' },
];

const FACTIONS = [
  { name: 'Howlsworn Creed',   animal: 'Dogs',     path: 'assets/heralds/Howlsworn Creed.png' },
  { name: 'Whisperfang Watch', animal: 'Cats',     path: 'assets/heralds/Whisperfang Watch.png' },
  { name: 'Skyward Kin',       animal: 'Birds',    path: 'assets/heralds/Skyward Kin.png' },
  { name: 'Scalebound Brood',  animal: 'Reptiles', path: 'assets/heralds/Scalebound Brood.png' },
];

function Advanced() {
  return (
    <section id="advanced" className="px-6 md:px-12 py-24 border-t border-slate-200 bg-gradient-to-b from-violet-50/40 to-white">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          num="09"
          eyebrow="Advanced Rules"
          title="The Seer's Bestiary"
          kicker="An optional layer of fortune-telling that adds faction-wide effects mid-match. Skip on first play; layer on once you know the basics."
        />

        {/* Bestiary showcase — six tarot-like cards, fanned slightly */}
        <div className="-mx-2 md:mx-0 mb-20">
          <div className="flex md:justify-center gap-3 md:gap-4 overflow-x-auto pb-6 px-2 md:px-0 md:flex-wrap">
            {BESTIARY.map((b, i) => {
              // gentle alternating tilt — feels like a spread, not a stack
              const tilt = [-3, 2, -1.5, 1.5, -2][i] || 0;
              return (
                <div key={b.num} className="shrink-0 hover-bestiary"
                     style={{transform: `rotate(${tilt}deg)`, transformOrigin: 'center bottom'}}>
                  <img src={b.path} alt={b.name}
                       className="block rounded-lg select-none"
                       draggable="false"
                       style={{
                         width: 168, height: 'auto',
                         boxShadow: '0 18px 38px -16px rgba(15,23,42,0.35), 0 6px 12px -4px rgba(15,23,42,0.18)',
                       }} />
                </div>
              );
            })}
          </div>
          <div className="text-center text-[11px] tracking-[0.25em] uppercase font-bold text-slate-500 mt-2">
            5 of 13 Bestiary cards shown
          </div>
        </div>

        {/* Steps — always visible */}
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { num: '01', title: 'Setup',              body: 'Reveal 4 random Bestiary cards face-up. Place 4 random Faction cards face-down beneath them, matching positions.' },
            { num: '02', title: 'Reveal trigger',     body: 'Every 5 captures, reveal the next Faction card from left to right. (Every 4 in express games.)' },
            { num: '03', title: 'Apply faction-wide', body: 'The matching Bestiary effect applies to every unit of that faction for the rest of the match. Effects stack.' },
          ].map(b => (
            <div key={b.num} className="rounded-2xl bg-white border border-slate-200 p-7">
              <div className="text-[10px] tracking-[0.25em] uppercase font-bold mb-3" style={{color: '#CA41F5'}}>{b.num}</div>
              <h4 className="display text-2xl font-bold text-slate-900 mb-3">{b.title}</h4>
              <p className="text-slate-600 leading-relaxed text-sm">{b.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 px-7 py-5 rounded-xl bg-violet-50 border border-violet-200 text-violet-900 text-sm">
          <strong>Heads up:</strong> The same faction may be revealed more than once — that's a valid (and powerful) outcome.
        </div>

        {/* Faction index */}
        <div className="mt-16">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-slate-500">§ 9.1</span>
            <h3 className="display text-3xl md:text-4xl font-black tracking-[-0.02em] text-slate-900">Faction Index</h3>
          </div>
          <p className="text-slate-700 text-lg leading-relaxed max-w-3xl mb-12">
            Every unit belongs to one of four factions. Look for the <strong className="text-slate-900">heraldic mark in the top-left corner</strong> of each unit card to identify which faction they call home.
          </p>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left column: enlarged Harlund + pointer + caption */}
            <div className="flex flex-col items-start">
              <div className="relative" style={{paddingTop: 36, paddingRight: 80}}>
                <img src={UNIT_IMAGES['Harlund']} alt="Harlund example"
                     className="block rounded-[10px] select-none"
                     draggable="false"
                     style={{
                       width: 240, height: 'auto',
                       boxShadow: '0 18px 38px -16px rgba(15,23,42,0.35), 0 6px 12px -4px rgba(15,23,42,0.18)',
                     }} />
                {/* Highlight on the top-left herald */}
                <div className="absolute"
                     style={{
                       top: 36 + 8, left: 8,
                       width: 50, height: 50,
                       border: '2.5px solid #CA41F5',
                       borderRadius: 10,
                       boxShadow: '0 0 0 5px rgba(202,65,245,0.18)',
                     }} />
                {/* Curved arrow leading up & around to the herald */}
                <svg className="absolute pointer-events-none"
                     style={{top: 0, left: 40}}
                     width="280" height="100" viewBox="0 0 280 100">
                  <path d="M 260 18 Q 200 -10 110 12 Q 50 26 24 62"
                        stroke="#CA41F5" strokeWidth="2" fill="none" strokeDasharray="4 4" strokeLinecap="round" />
                  {/* Arrowhead */}
                  <path d="M 24 62 l 8 -4 m -8 4 l 4 -8"
                        stroke="#CA41F5" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {/* "Where to look" pill anchored to start of the arrow */}
                <div className="absolute" style={{top: 0, right: 0}}>
                  <span className="inline-block px-3 py-1.5 rounded-full text-[10px] tracking-[0.25em] uppercase font-bold text-white"
                        style={{background: '#CA41F5'}}>
                    Where to look
                  </span>
                </div>
              </div>
              <p className="mt-8 text-slate-700 text-lg leading-relaxed max-w-md">
                The heraldic mark sits at the <strong className="text-slate-900">top-left of every unit card</strong>. Match it to the index on the right to know which Bestiary effects apply to that unit.
              </p>
            </div>

            {/* Right column: 2x2 herald grid */}
            <div className="grid grid-cols-2 gap-5">
              {FACTIONS.map(f => (
                <div key={f.name} className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <div className="w-28 h-28 flex items-center justify-center mb-4">
                    <img src={f.path} alt={f.name}
                         className="max-w-full max-h-full block select-none"
                         draggable="false" />
                  </div>
                  <div className="text-[10px] tracking-[0.25em] uppercase font-bold text-slate-400 mb-1">{f.animal}</div>
                  <div className="display text-xl font-black tracking-[-0.01em] text-slate-900 leading-tight" style={{textWrap: 'balance'}}>
                    {f.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- FOOTER ----------
function Footer() {
  return (
    <footer className="px-6 md:px-12 py-16 border-t border-slate-200 text-sm text-slate-500">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div>⚔ Tacticlash · Gameplay Manual v2.2 Draft</div>
        <div>A game by <span className="text-slate-900 font-semibold">Paco Martínez</span> · 2026</div>
      </div>
    </footer>
  );
}

// ---------- APP ----------
function App() {
  return (
    <div>
      <SideDock />
      <NavOverlayHost />
      <Hero />
      <Overview />
      <Objective />
      <Components />
      <ClassesSection />
      <ItemsSection />
      <Setup />
      <TurnStructure />
      <DetailedRules />
      <Advanced />
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
