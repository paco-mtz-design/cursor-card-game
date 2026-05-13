// Tacticlash card-placeholder + range-diagram primitives.
// We render cards as SVG-based "physical objects" that match the class system,
// since real card images aren't available locally. They look intentional —
// not blanks. Class color owns the card's identity.

const CLASS_COLOR = {
  Brawler: '#E31B1B',
  Lancer:  '#1B5AE3',
  Shooter: '#23C21D',
  Caster:  '#CA41F5',
  Item:    '#0F172A',
};

const CLASS_GLYPH = {
  // Simple geometric icons drawn as SVG paths so they live cleanly on the card
  Brawler: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8 L6 16 L10 16 L10 8 Z" />
      <path d="M14 8 L14 16 L18 16 L18 8 Z" />
      <path d="M10 12 L14 12" />
    </svg>
  ),
  Lancer: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 20 L20 4" />
      <path d="M16 4 L20 4 L20 8" />
      <path d="M4 20 L7 17" />
    </svg>
  ),
  Shooter: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <path d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12" />
    </svg>
  ),
  Caster: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3 L14 10 L21 12 L14 14 L12 21 L10 14 L3 12 L10 10 Z" />
    </svg>
  ),
  Item: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="5" y="9" width="14" height="11" rx="1.5" />
      <path d="M9 9 V6 a3 3 0 0 1 6 0 V9" />
    </svg>
  ),
};

// Tile-based range diagram. The actual board is 5×2 — your row on the bottom,
// the opponent's on top. Each class places its unit on the bottom row and we
// highlight the tiles it can hit on the top row.
function RangeGrid({ cls, cols = 5, rows = 2, size = 28, gap = 4 }) {
  const color = CLASS_COLOR[cls];
  const cells = [];
  // Shooter sits at the far right (tile 5); everyone else sits center.
  const unitR = rows - 1;
  const unitC = cls === 'Shooter' ? cols - 1 : Math.floor(cols / 2);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let kind = 'empty';
      const dx = c - unitC;
      const onTopRow = r === 0;
      if (r === unitR && c === unitC) kind = 'unit';
      else if (cls === 'Brawler') {
        if (onTopRow && dx === 0) kind = 'hit';
      } else if (cls === 'Lancer') {
        if (onTopRow && Math.abs(dx) === 1) kind = 'hit';
      } else if (cls === 'Shooter') {
        // Sits at tile 5 (rightmost). Hits tiles 1, 2, 3 of the top row
        // (3+ tiles away in the column direction).
        if (onTopRow && c <= 2) kind = 'hit';
      } else if (cls === 'Caster') {
        if (onTopRow) kind = 'hit';
      }
      cells.push({ r, c, kind });
    }
  }

  const w = cols * size + (cols - 1) * gap;
  const h = rows * size + (rows - 1) * gap;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      {cells.map(({ r, c, kind }, i) => {
        const x = c * (size + gap);
        const y = r * (size + gap);
        if (kind === 'unit') {
          return (
            <g key={i}>
              <rect x={x} y={y} width={size} height={size} rx="3" fill={color} />
              <circle cx={x + size/2} cy={y + size/2} r={size*0.22} fill="white" />
            </g>
          );
        }
        if (kind === 'hit') {
          return (
            <g key={i}>
              <rect x={x} y={y} width={size} height={size} rx="3" fill={color} fillOpacity="0.16" stroke={color} strokeWidth="1.5" />
              <circle cx={x + size/2} cy={y + size/2} r={size*0.14} fill={color} />
            </g>
          );
        }
        return <rect key={i} x={x} y={y} width={size} height={size} rx="3" fill="none" stroke="#D8D3C7" strokeWidth="1" strokeDasharray="2 3" />;
      })}
    </svg>
  );
}

// "Hero" range diagram - bigger, used in class panels
function RangeDiagram({ cls }) {
  const color = CLASS_COLOR[cls];
  const tagByCls = {
    Brawler: 'Strike directly forward',
    Lancer:  'Strike diagonally forward',
    Shooter: 'Strike 3+ tiles away',
    Caster:  'Strike anywhere on the board',
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <RangeGrid cls={cls} size={36} gap={5} />
      <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase font-semibold" style={{color}}>
        <span className="inline-block w-3 h-3" style={{background: color}} />
        {tagByCls[cls]}
      </div>
    </div>
  );
}

// Mini range diagram for cards — bottom-of-card preview
function MiniRange({ cls }) {
  return <RangeGrid cls={cls} cols={5} rows={2} size={11} gap={2} />;
}

// HP pip
function HPDots({ count = 1 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({length: count}).map((_, i) => (
        <span key={i} className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100" />
      ))}
    </div>
  );
}

// Lookup of real card art by character name. As more art arrives, drop it in
// /assets/units/ and add the filename here — the card frame swaps automatically.
const UNIT_IMAGES = {
  Harlund: 'assets/units/Harlund.png',
  Iktha:   'assets/units/Iktha.png',
  Korrin:  'assets/units/Korrin.png',
  Rowka:   'assets/units/Rowka.png',
  Senya:   'assets/units/Senya.png',
  Thira:   'assets/units/Thira.png',
};

// The unit card. ~Aspect of a real TCG card (5:7).
// When a real card image exists for `name`, render it full-bleed — the image
// already contains the frame, class glyph, HP, name, and skill text. Otherwise
// fall back to the SVG placeholder.
function UnitCard({ name, cls, hp, archetype, skill, scale = 1, faceDown = false }) {
  const color = CLASS_COLOR[cls];
  const Glyph = CLASS_GLYPH[cls];
  const w = 200 * scale;
  const h = 280 * scale;
  const realArt = UNIT_IMAGES[name];

  if (realArt && !faceDown) {
    return (
      <div
        className="relative shrink-0 rounded-[10px] overflow-hidden bg-white"
        style={{
          width: w, height: h,
          boxShadow: '0 18px 38px -16px rgba(15,23,42,0.35), 0 6px 12px -4px rgba(15,23,42,0.18)',
        }}
      >
        <img src={realArt} alt={name} className="w-full h-full object-cover select-none" draggable="false" />
      </div>
    );
  }

  if (faceDown) {
    return (
      <div
        className="relative shrink-0 rounded-[10px] overflow-hidden"
        style={{
          width: w, height: h,
          background: 'linear-gradient(135deg, #1f2937 0%, #0f172a 100%)',
          boxShadow: '0 18px 38px -16px rgba(15,23,42,0.45), 0 6px 12px -4px rgba(15,23,42,0.25)',
        }}
      >
        <div className="absolute inset-2 border border-white/15 rounded-[7px]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/40 text-[11px] tracking-[0.3em] uppercase font-bold">Tacticlash</div>
        </div>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="text-white/15 text-6xl font-black select-none">⚔</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative shrink-0 rounded-[10px] overflow-hidden bg-white"
      style={{
        width: w, height: h,
        boxShadow: '0 18px 38px -16px rgba(15,23,42,0.35), 0 6px 12px -4px rgba(15,23,42,0.18)',
      }}
    >
      {/* Class color band */}
      <div className="h-[14%] flex items-center justify-between px-3" style={{background: color}}>
        <div className="flex items-center gap-1.5 text-white">
          <Glyph style={{width: 14*scale, height: 14*scale}} />
          <span className="text-[10px] tracking-[0.18em] uppercase font-bold" style={{fontSize: 10*scale}}>{cls}</span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({length: hp}).map((_, i) => (
            <span key={i} className="rounded-full bg-white" style={{width: 7*scale, height: 7*scale}} />
          ))}
        </div>
      </div>

      {/* Art area — abstract portrait */}
      <div className="relative" style={{height: `38%`}}>
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 60%, ${color}26 0%, ${color}08 40%, transparent 70%), linear-gradient(180deg, #FAFAF6 0%, #EFEDE5 100%)`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full flex items-center justify-center"
               style={{
                 width: 70*scale, height: 70*scale,
                 background: `${color}1A`,
                 border: `2px solid ${color}`,
                 color
               }}>
            <Glyph style={{width: 36*scale, height: 36*scale}} />
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="px-3 pt-2" style={{paddingTop: 8*scale}}>
        <div className="font-bold leading-none" style={{fontSize: 16*scale, fontFamily: 'Space Grotesk, sans-serif', color: '#0F172A'}}>{name}</div>
        {archetype && <div className="text-[10px] text-slate-500 mt-1 leading-tight" style={{fontSize: 9.5*scale}}>{archetype}</div>}
      </div>

      {/* Range mini */}
      <div className="absolute left-3 right-3 flex items-end justify-between gap-2"
           style={{bottom: 10*scale}}>
        <div>
          <div className="text-[8px] tracking-[0.2em] uppercase text-slate-400 font-bold mb-1" style={{fontSize: 7.5*scale}}>Range</div>
          <div style={{transform: `scale(${scale})`, transformOrigin: 'left bottom'}}>
            <RangeGrid cls={cls} size={11} gap={2} />
          </div>
        </div>
        {skill && (
          <div className="text-[8px] text-slate-500 leading-tight max-w-[55%] text-right italic" style={{fontSize: 8*scale}}>
            {skill}
          </div>
        )}
      </div>
    </div>
  );
}

// Lookup of real item card art by item name. Drop a PNG in /assets/items/
// and add a line here — ItemCard will swap automatically.
const ITEM_IMAGES = {
  'Heavy Armor':          'assets/items/Heavy Armor.png',
  'Light Armor':          'assets/items/Light Armor.png',
  'Premium Light Armor':  'assets/items/Premium Light Armor.png',
  'Barbed Gauntlets':     'assets/items/Barbed Gauntlets.png',
  'Teleport Boots':       'assets/items/Teleport Boots.png',
  'Wardstone Bracelet':   'assets/items/Wardstone Bracelet.png',
  'Magic Grenade':        'assets/items/Magic Grenade.png',
  'Obscuring Bomb':       'assets/items/Obscuring Bomb.png',
  'Healing Potion':       'assets/items/Healing Potion.png',
  'Divine Light':         'assets/items/Divine Light.png',
  'Elevated Ground':      'assets/items/Elevated Ground.png',
  'Reinforced Barricade': 'assets/items/Reinforced Barricade.png',
};

// Item card placeholder
function ItemCard({ name, type, description, color = '#0F172A', icon = 'item', scale = 1 }) {
  const w = 180 * scale;
  const h = 252 * scale;
  const realArt = ITEM_IMAGES[name];

  if (realArt) {
    // Item images include their own frame/title/effect text — render full-bleed.
    // Bump the displayed width up to match unit-card scale (item PNGs share the
    // same 5:7 aspect, so a wider card just looks more legible alongside units).
    const iw = 200 * scale;
    const ih = 280 * scale;
    return (
      <div
        className="relative shrink-0 rounded-[10px] overflow-hidden bg-white"
        style={{
          width: iw, height: ih,
          boxShadow: '0 14px 30px -16px rgba(15,23,42,0.30), 0 4px 8px -3px rgba(15,23,42,0.14)',
        }}
      >
        <img src={realArt} alt={name} className="w-full h-full object-cover select-none" draggable="false" />
      </div>
    );
  }

  // Each item has a simple iconographic glyph
  const ITEM_ICONS = {
    armor: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
        <path d="M24 6 L38 12 V24 C38 33 32 40 24 42 C16 40 10 33 10 24 V12 Z" />
      </svg>
    ),
    weapon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M10 38 L34 14" />
        <path d="M28 8 L40 8 L40 20" />
        <path d="M10 38 L14 34 L18 38 L14 42 Z" />
      </svg>
    ),
    accessory: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
        <circle cx="24" cy="26" r="12" />
        <path d="M16 18 L24 8 L32 18" />
      </svg>
    ),
    single: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M18 6 H30 V14 L36 22 V40 a2 2 0 0 1 -2 2 H14 a2 2 0 0 1 -2 -2 V22 L18 14 Z" />
        <path d="M18 28 L30 28" />
      </svg>
    ),
    terrain: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M6 38 L18 22 L26 30 L34 18 L42 38 Z" />
        <path d="M6 38 L42 38" />
      </svg>
    ),
  };
  const glyph = ITEM_ICONS[icon] || ITEM_ICONS.single;

  return (
    <div
      className="relative shrink-0 rounded-[10px] overflow-hidden bg-white group"
      style={{
        width: w, height: h,
        boxShadow: '0 14px 30px -16px rgba(15,23,42,0.30), 0 4px 8px -3px rgba(15,23,42,0.14)',
      }}
    >
      <div className="h-[12%] flex items-center justify-between px-3" style={{background: color}}>
        <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-white">{type}</span>
        <span className="text-white/70 text-[10px] font-bold">ITEM</span>
      </div>
      <div className="relative" style={{height: '46%'}}>
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 55%, ${color}1A 0%, transparent 70%), linear-gradient(180deg, #FAFAF6 0%, #EFEDE5 100%)`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center" style={{color}}>
          {React.cloneElement(glyph, {style: {width: 70*scale, height: 70*scale}})}
        </div>
      </div>
      <div className="px-3 pt-2.5" style={{paddingTop: 10*scale}}>
        <div className="font-bold leading-tight" style={{fontSize: 14*scale, fontFamily: 'Space Grotesk, sans-serif', color: '#0F172A'}}>{name}</div>
        <div className="text-[10px] text-slate-500 mt-1.5 leading-snug" style={{fontSize: 10*scale, lineHeight: 1.35}}>{description}</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  CLASS_COLOR, CLASS_GLYPH,
  RangeGrid, RangeDiagram, MiniRange, HPDots,
  UnitCard, ItemCard, UNIT_IMAGES, ITEM_IMAGES,
});
