// Document-wide navigation: side dock (desktop), jump button + overlay (mobile + ⌘K),
// per-section prev/next footers, and a hero contents grid.
// All three patterns read from a single SECTIONS registry so adding/removing a
// section is a one-line change.

const SECTIONS = [
  { num: '01', id: 'overview',       eyebrow: 'Game Overview',    title: 'A tactical duel card game inspired by turn-based RPG combat.' },
  { num: '02', id: 'objective',      eyebrow: 'The Objective',    title: "Capture 15 of your opponent's units." },
  { num: '03', id: 'components',     eyebrow: 'Game Components',  title: "What's in the box." },
  { num: '04', id: 'classes',        eyebrow: 'The Units Deck',   title: 'Unit Classes and Class-Specific Buffs.' },
  { num: '05', id: 'items',          eyebrow: 'The Items Deck',   title: '62 cards. Five ways to bend the board.' },
  { num: '06', id: 'setup',          eyebrow: 'Initial Setup',    title: 'Six moves to take the battlefield.' },
  { num: '07', id: 'turn',           eyebrow: 'Turn Structure',   title: 'Three phases, every single turn.' },
  { num: '08', id: 'detailed-rules', eyebrow: 'Detailed Rules',   title: 'The fine print. Read once, refer back forever.' },
  { num: '09', id: 'advanced',       eyebrow: 'Advanced Rules',   title: "The Seer's Bestiary." },
];

// Tracks which section is currently the "active" one for nav highlighting.
function useActiveSection() {
  const [active, setActive] = React.useState(null);
  React.useEffect(() => {
    // Sample scroll position once per frame and pick the section closest to a
    // line ~30% from the top of the viewport. More reliable than IO for sections
    // of wildly different heights.
    let raf = 0;
    const pick = () => {
      raf = 0;
      const line = window.innerHeight * 0.3;
      let best = null;
      let bestDist = Infinity;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        // Prefer the section whose top is just above the line.
        const dist = top <= line ? line - top : Infinity;
        if (dist < bestDist) { bestDist = dist; best = s.id; }
      }
      setActive(best);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick); };
    pick();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return active;
}

// Show nav chrome only once the reader has left the hero — keeps the entrance clean.
function useShowDock() {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const check = () => {
      const el = document.getElementById('overview');
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      setShow(top < window.innerHeight * 0.55);
    };
    check();
    window.addEventListener('scroll', check, {passive: true});
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);
  return show;
}

// ====== Side dock (desktop) ======
function SideDock() {
  const active = useActiveSection();
  const show = useShowDock();
  return (
    <div className={`hidden md:block fixed top-1/2 -translate-y-1/2 left-4 z-40 transition-all duration-300 ${show ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3 pointer-events-none'}`}>
      <nav className="group flex flex-col gap-1.5 py-3 px-3 rounded-2xl bg-white/85 backdrop-blur border border-slate-200 shadow-sm">
        {SECTIONS.map(s => {
          const isActive = active === s.id;
          return (
            <a key={s.id} href={`#${s.id}`}
               className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-slate-100/60 transition-colors"
               aria-label={`${s.num} ${s.eyebrow}`}>
              <span className="flex items-center justify-center font-bold tabular-nums text-[10px] shrink-0 transition-all duration-200"
                    style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: isActive ? '#0F172A' : 'transparent',
                      color: isActive ? 'white' : '#94A3B8',
                      border: isActive ? '1px solid #0F172A' : '1px solid #E2E8F0',
                    }}>
                {s.num}
              </span>
              <span className={`text-xs font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 group-hover:max-w-[180px] ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                {s.eyebrow}
              </span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}

// ====== Jump-to overlay (⌘K + mobile button) ======
function JumpOverlay({ open, onClose }) {
  const [q, setQ] = React.useState('');
  const [cursor, setCursor] = React.useState(0);
  const filtered = React.useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return SECTIONS;
    return SECTIONS.filter(s =>
      s.eyebrow.toLowerCase().includes(t) ||
      s.title.toLowerCase().includes(t) ||
      s.num.includes(t)
    );
  }, [q]);
  React.useEffect(() => { setCursor(0); }, [q]);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor(c => Math.min(c + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor(c => Math.max(c - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const t = filtered[cursor];
        if (t) {
          window.location.hash = t.id;
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, cursor, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-slate-900/40 backdrop-blur-[2px]"
         onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
            <circle cx="9" cy="9" r="6" />
            <path d="M14 14 l4 4" />
          </svg>
          <input
            type="text"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to section…"
            className="flex-1 text-lg focus:outline-none placeholder-slate-400"
          />
          <kbd className="hidden sm:inline-block text-[10px] tracking-[0.2em] uppercase font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">esc</kbd>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.length === 0 && (
            <li className="px-5 py-6 text-slate-400 text-center text-sm">No matches</li>
          )}
          {filtered.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`}
                 onClick={onClose}
                 className={`flex items-center gap-4 px-5 py-3 transition-colors ${cursor === i ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
                <span className="font-bold tabular-nums text-sm w-9 shrink-0 text-slate-500">{s.num}</span>
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-900">{s.eyebrow}</span>
                  <span className="block text-xs text-slate-500 truncate">{s.title}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="px-5 py-3 text-[10px] tracking-[0.2em] uppercase font-bold text-slate-400 border-t border-slate-100 flex flex-wrap gap-4">
          <span>↑↓ navigate</span>
          <span>↵ jump</span>
          <span>K open</span>
        </div>
      </div>
    </div>
  );
}

function JumpButton({ onClick }) {
  const show = useShowDock();
  return (
    <button onClick={onClick}
            aria-label="Jump to section"
            className={`md:hidden fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 5 h12 M3 9 h12 M3 13 h12" />
      </svg>
    </button>
  );
}

function NavOverlayHost() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onKey = (e) => {
      // Open on "K" (when not typing into an input)
      if ((e.key === 'k' || e.key === 'K') && !e.metaKey && !e.ctrlKey) {
        const tag = (e.target.tagName || '').toLowerCase();
        const editable = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
        if (editable) return;
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <>
      <JumpButton onClick={() => setOpen(true)} />
      <JumpOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// ====== Prev / Next footer (inside each section) ======
function SectionFooter({ id, nextKicker }) {
  const idx = SECTIONS.findIndex(s => s.id === id);
  if (idx === -1) return null;
  const prev = SECTIONS[idx - 1];
  const next = SECTIONS[idx + 1];
  if (!prev && !next) return null;

  return (
    <nav className="mt-20 pt-10 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
      {prev ? (
        <a href={`#${prev.id}`}
           className="group block rounded-2xl bg-white border border-slate-200 hover:border-slate-900 transition-colors p-6">
          <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-slate-400 mb-2 flex items-center gap-2">
            <span className="inline-block transition-transform group-hover:-translate-x-1">←</span> Previous
          </div>
          <div className="flex items-baseline gap-3">
            <span className="display text-xl font-black tabular-nums text-slate-400">{prev.num}</span>
            <span className="display text-xl font-black text-slate-900 leading-tight">{prev.eyebrow}</span>
          </div>
        </a>
      ) : <div className="hidden md:block" />}

      {next ? (
        <a href={`#${next.id}`}
           className="group block rounded-2xl bg-slate-900 text-white border border-slate-900 hover:bg-slate-800 transition-colors p-6 text-right">
          <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-slate-400 mb-2 flex items-center justify-end gap-2">
            Next <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </div>
          <div className="flex items-baseline gap-3 justify-end">
            <span className="display text-xl font-black tabular-nums text-slate-500">{next.num}</span>
            <span className="display text-xl font-black leading-tight">{next.eyebrow}</span>
          </div>
          {nextKicker && <div className="mt-2 text-sm text-slate-300 leading-snug">{nextKicker}</div>}
        </a>
      ) : <div className="hidden md:block" />}
    </nav>
  );
}

// ====== Hero contents grid ======
function HeroTOC() {
  return (
    <div className="mt-16 pt-10 border-t border-slate-300/60 max-w-4xl">
      <div className="flex items-baseline justify-between mb-5">
        <div className="text-[11px] tracking-[0.3em] uppercase font-bold text-slate-500">Contents</div>
        <div className="text-[10px] tracking-[0.2em] uppercase font-bold text-slate-400 hidden sm:block">
          Press <kbd className="border border-slate-300 rounded px-1 text-slate-600 mx-1">K</kbd> to jump anywhere
        </div>
      </div>
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
        {SECTIONS.map(s => (
          <li key={s.id}>
            <a href={`#${s.id}`}
               className="flex items-baseline gap-4 py-2.5 border-b border-slate-300/50 hover:border-slate-900 transition-colors group">
              <span className="font-bold tabular-nums text-sm text-slate-400 group-hover:text-slate-900 transition-colors">{s.num}</span>
              <span className="font-semibold text-slate-900 group-hover:underline">{s.eyebrow}</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

Object.assign(window, {
  SECTIONS,
  SideDock, NavOverlayHost, SectionFooter, HeroTOC,
});
