// Tacticlash — Title Screen
// Compact, centered, no-scroll. Controls first; lore second.

const { useState, useEffect, useRef } = React;

// ---- Tiny decorative bits ----
const Diamond = ({ size = 8, color = "#1d1a14" }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d="M5 0 L10 5 L5 10 L0 5 Z" fill={color} />
  </svg>
);

const CornerTick = ({ rotate = 0, color = "#1d1a14" }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" style={{ transform: `rotate(${rotate}deg)`, display: "block" }}>
    <path d="M1 1 L1 6 M1 1 L6 1" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);

const Swords = ({ size = 22, color = "#1d1a14", strokeWidth = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 17.5 4 7l3-3 10.5 10.5" />
    <path d="m13 19 6-6" />
    <path d="m16 16 4 4" />
    <path d="m19 21 2-2" />
    <path d="M9.5 17.5 20 7l-3-3L6.5 14.5" />
    <path d="m11 19-6-6" />
    <path d="m8 16-4 4" />
    <path d="m5 21-2-2" />
  </svg>
);

// ---- Segmented control (card-back chips) ----
const Segmented = ({ options, value, onChange, accent = "#b3322a", compact = false }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: `repeat(${options.length}, 1fr)`,
    border: "1.5px solid #1d1a14",
    borderRadius: 4,
    overflow: "hidden",
    background: "#ffffff",
  }}>
    {options.map((opt, i) => {
      const selected = value === opt.value;
      return (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          style={{
            background: selected ? accent : "transparent",
            color: selected ? "#fdfbf4" : "#1d1a14",
            border: "none",
            borderLeft: i === 0 ? "none" : "1.5px solid #1d1a14",
            padding: compact ? "7px 10px 6px" : "9px 12px 8px",
            fontFamily: "'Cinzel', serif",
            fontSize: compact ? 11 : 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 120ms ease",
          }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {opt.label}
          </div>
          {opt.sub && (
            <div style={{
              fontSize: 9, marginTop: 2, letterSpacing: "0.1em",
              fontFamily: "'JetBrains Mono', monospace", textTransform: "lowercase", fontWeight: 400,
              opacity: 0.85,
            }}>{opt.sub}</div>
          )}
        </button>
      );
    })}
  </div>
);

// ---- Wax-seal toggle ----
const SealToggle = ({ value, onChange, accent = "#3d6e3a", size = "md" }) => {
  const w = size === "sm" ? 52 : 60;
  const h = size === "sm" ? 26 : 28;
  const k = size === "sm" ? 20 : 22;
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: w, height: h, border: "1.5px solid #1d1a14", borderRadius: h,
        background: value ? accent : "#f0ead8",
        position: "relative", cursor: "pointer", padding: 0, transition: "background 160ms ease",
        flexShrink: 0,
      }}>
      <span style={{
        position: "absolute", top: 2, left: value ? w - k - 4 : 2, width: k, height: k, borderRadius: "50%",
        background: "#ffffff", border: "1.5px solid #1d1a14",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "left 160ms ease",
        fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 700, color: "#1d1a14",
      }}>{value ? "I" : "O"}</span>
    </button>
  );
};

// ---- Setting row (compact) ----
const Row = ({ label, hint, children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 14, padding: "8px 0" }}>
    <div>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, color: "#1d1a14" }}>{label}</div>
      {hint && <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13, color: "#6b6354", marginTop: 1, lineHeight: 1.3 }}>{hint}</div>}
    </div>
    <div>{children}</div>
  </div>
);

const Hairline = ({ inset = 0 }) => (
  <div style={{ height: 1, background: "rgba(29,26,20,0.15)", margin: `2px ${inset}px` }} />
);

// ---- Card frame with optional ribbon ----
const CardFrame = ({ ribbonColor, ribbonLabel, paper, children, style, dashed = false }) => (
  <div style={{
    background: paper,
    border: `1.5px ${dashed ? "dashed" : "solid"} #1d1a14`,
    borderRadius: 6,
    boxShadow: dashed ? "none" : "0 1px 0 #1d1a14, 2px 4px 0 rgba(29,26,20,0.06)",
    padding: "16px 18px 14px",
    position: "relative",
    ...style,
  }}>
    {ribbonLabel && (
      <div style={{
        position: "absolute", top: -11, left: 14,
        background: ribbonColor, color: "#fdfbf4",
        fontFamily: "'Cinzel', serif", fontSize: 10.5, letterSpacing: "0.2em",
        padding: "3px 11px 3px", border: "1.5px solid #1d1a14",
        borderRadius: 3, textTransform: "uppercase", fontWeight: 600,
      }}>{ribbonLabel}</div>
    )}
    <div style={{ position: "absolute", top: 4, left: 4 }}><CornerTick rotate={0} /></div>
    <div style={{ position: "absolute", top: 4, right: 4 }}><CornerTick rotate={90} /></div>
    <div style={{ position: "absolute", bottom: 4, left: 4 }}><CornerTick rotate={270} /></div>
    <div style={{ position: "absolute", bottom: 4, right: 4 }}><CornerTick rotate={180} /></div>
    {children}
  </div>
);

// ---- Title plate (compact) ----
const TitlePlate = () => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: "#6b6354", marginBottom: 8 }}>
      A Tactical Card Duel
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <div style={{ width: 60, height: 1, background: "#1d1a14" }} />
      <Diamond size={7} />
      <h1 style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 44,
        lineHeight: 1,
        letterSpacing: "0.06em",
        fontWeight: 700,
        color: "#1d1a14",
        margin: 0,
        textTransform: "uppercase",
      }}>
        Tacticlash
      </h1>
      <Diamond size={7} />
      <div style={{ width: 60, height: 1, background: "#1d1a14" }} />
    </div>
  </div>
);

// ---- Begin Duel button ----
const BeginButton = ({ onClick, summary }) => (
  <button onClick={onClick} style={{
    width: "100%",
    background: "#1d1a14",
    color: "#fdfbf4",
    border: "1.5px solid #1d1a14",
    borderRadius: 6,
    padding: "14px 18px 12px",
    cursor: "pointer",
    fontFamily: "'Cinzel', serif",
    boxShadow: "0 1px 0 #1d1a14, 3px 4px 0 rgba(29,26,20,0.16)",
    transition: "transform 120ms ease, box-shadow 120ms ease",
  }}
  onMouseDown={(e) => { e.currentTarget.style.transform = "translate(2px, 3px)"; e.currentTarget.style.boxShadow = "0 1px 0 #1d1a14"; }}
  onMouseUp={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 0 #1d1a14, 3px 4px 0 rgba(29,26,20,0.16)"; }}
  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 0 #1d1a14, 3px 4px 0 rgba(29,26,20,0.16)"; }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <Swords size={20} color="#c9a44a" />
      <div style={{ fontSize: 19, letterSpacing: "0.34em", fontWeight: 700, textTransform: "uppercase" }}>Begin Duel</div>
      <Swords size={20} color="#c9a44a" />
    </div>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#c9a44a", marginTop: 6, letterSpacing: "0.14em", textTransform: "lowercase" }}>
      {summary}
    </div>
  </button>
);

// ---- Debug "developer's notebook" panel ----
const DebugPanel = ({ matchMode, setMatchMode, cpuStartingUnits, setCpuStartingUnits, showDebugUI, setShowDebugUI, open, setOpen }) => (
  <div style={{
    border: "1.5px dashed #1d1a14",
    borderRadius: 6,
    background: "rgba(29,26,20,0.025)",
    fontFamily: "'JetBrains Mono', monospace",
    overflow: "hidden",
  }}>
    <button onClick={() => setOpen(!open)} style={{
      width: "100%", background: "transparent", border: "none",
      padding: "9px 14px", display: "flex", alignItems: "center", justifyContent: "space-between",
      cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
      letterSpacing: "0.2em", textTransform: "uppercase", color: "#3d3527",
    }}>
      <span>// dev · debug options</span>
      <span style={{ fontSize: 13 }}>{open ? "▾" : "▸"}</span>
    </button>
    {open && (
      <div style={{ padding: "0 14px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontSize: 9.5, color: "#6b6354", letterSpacing: "0.14em", textTransform: "uppercase", paddingBottom: 6, borderBottom: "1px dashed rgba(29,26,20,0.22)" }}>
          hide before release
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 14, padding: "6px 0" }}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1d1a14" }}>match_mode</div>
            <div style={{ fontSize: 10.5, color: "#6b6354", marginTop: 1 }}>vs CPU, or control both sides manually</div>
          </div>
          <Segmented
            accent="#3d3527" compact
            value={matchMode} onChange={setMatchMode}
            options={[
              { value: "cpu", label: "vs CPU" },
              { value: "manual", label: "Manual" },
            ]}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 14, padding: "6px 0", borderTop: "1px dashed rgba(29,26,20,0.18)" }}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1d1a14" }}>choose_cpu_starting_units</div>
            <div style={{ fontSize: 10.5, color: "#6b6354", marginTop: 1 }}>manually set the CPU's opening hand</div>
          </div>
          <SealToggle accent="#3d3527" size="sm" value={cpuStartingUnits} onChange={setCpuStartingUnits} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 14, padding: "6px 0", borderTop: "1px dashed rgba(29,26,20,0.18)" }}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1d1a14" }}>show_debug_ui</div>
            <div style={{ fontSize: 10.5, color: "#6b6354", marginTop: 1 }}>enable UI controls for debugging</div>
          </div>
          <SealToggle accent="#3d3527" size="sm" value={showDebugUI} onChange={setShowDebugUI} />
        </div>
      </div>
    )}
  </div>
);

// ============== ROOT ==============

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "paperTone": "ivory",
  "accentScheme": "house",
  "showDebug": true,
  "showLore": true
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Game settings — defaults match spec
  const [captureGoal, setCaptureGoal] = useState(15);
  const [seer, setSeer] = useState(false);
  const [difficulty, setDifficulty] = useState("normal");

  // Debug — expanded by default per dev request
  const [debugOpen, setDebugOpen] = useState(true);
  const [matchMode, setMatchMode] = useState("cpu");
  const [cpuStartingUnits, setCpuStartingUnits] = useState(false);
  const [showDebugUI, setShowDebugUI] = useState(true);

  const [launching, setLaunching] = useState(false);

  const onBegin = () => {
    setLaunching(true);
    setTimeout(() => setLaunching(false), 1400);
  };

  const palettes = {
    house:  { red: "#b3322a", green: "#3d6e3a", blue: "#3a6a98", gold: "#c9a44a" },
    dusk:   { red: "#a4453d", green: "#5a6a3a", blue: "#3f5a78", gold: "#b58a3a" },
    forest: { red: "#7a3a32", green: "#3d6e3a", blue: "#2f5a4a", gold: "#a8923f" },
  };
  const P = palettes[tweaks.accentScheme] || palettes.house;

  // Bright tones first; antique parchment kept as an option but not default
  const tones = {
    ivory:    { bg: "#fafaf4", paper: "#ffffff",  glow: "rgba(201,164,74,0.05)" },
    paper:    { bg: "#f6f4ec", paper: "#ffffff",  glow: "rgba(201,164,74,0.08)" },
    cream:    { bg: "#f4ecd8", paper: "#fbf5e3",  glow: "rgba(201,164,74,0.18)" },
  };
  const T = tones[tweaks.paperTone] || tones.ivory;

  const summaryParts = [
    `${captureGoal} captures`,
    seer ? "seer's bestiary on" : null,
    `cpu: ${difficulty}`,
    matchMode === "manual" ? "manual mode" : null,
  ].filter(Boolean);

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      backgroundImage: `radial-gradient(ellipse at 50% 0%, ${T.glow}, transparent 55%)`,
      color: "#1d1a14",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 24px",
    }}>
      {/* Hairline frame */}
      <div style={{ position: "fixed", inset: 14, border: "1px solid rgba(29,26,20,0.22)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "fixed", inset: 20, border: "1px solid rgba(29,26,20,0.10)", pointerEvents: "none", zIndex: 1 }} />

      {/* Top corner labels */}
      <div style={{ position: "fixed", top: 28, left: 32, fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8, color: "#1d1a14", zIndex: 2 }}>
        <Swords size={14} /> Edition I
      </div>
      <div style={{ position: "fixed", top: 28, right: 32, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.18em", color: "#6b6354", textTransform: "uppercase", zIndex: 2 }}>
        v0.4 · pre-alpha
      </div>

      {/* Main centered column */}
      <div style={{
        width: "100%",
        maxWidth: 540,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        position: "relative",
        zIndex: 2,
      }}>
        <TitlePlate />

        {/* Match Setup card — primary focus */}
        <CardFrame ribbonColor={P.red} ribbonLabel="Match Setup" paper={T.paper}>
          <Row label="Capture Goal" hint="First to reach the target wins.">
            <Segmented
              accent={P.red}
              value={captureGoal}
              onChange={setCaptureGoal}
              options={[
                { value: 10, label: "10", sub: "fast match" },
                { value: 15, label: "15", sub: "full match" },
              ]}
            />
          </Row>
          <Hairline />
          <Row label="CPU Difficulty" hint="How sharply your opponent reads the board.">
            <Segmented
              accent={P.blue}
              value={difficulty}
              onChange={setDifficulty}
              options={[
                { value: "easy", label: "Easy" },
                { value: "normal", label: "Normal" },
              ]}
            />
          </Row>
          <Hairline />
          <Row label="Seer's Bestiary" hint="Card insights mid-duel. For advanced players.">
            <SealToggle accent={P.green} value={seer} onChange={setSeer} />
          </Row>
        </CardFrame>

        {/* Debug — expanded by default */}
        {tweaks.showDebug && (
          <DebugPanel
            matchMode={matchMode} setMatchMode={setMatchMode}
            cpuStartingUnits={cpuStartingUnits} setCpuStartingUnits={setCpuStartingUnits}
            showDebugUI={showDebugUI} setShowDebugUI={setShowDebugUI}
            open={debugOpen} setOpen={setDebugOpen}
          />
        )}

        {/* Begin button */}
        <BeginButton onClick={onBegin} summary={summaryParts.join(" · ")} />

        {/* Lore + meta — secondary hierarchy, BELOW controls */}
        {tweaks.showLore && (
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(29,26,20,0.2)" }} />
              <Diamond size={6} color="#c9a44a" />
              <div style={{ flex: 1, height: 1, background: "rgba(29,26,20,0.2)" }} />
            </div>

            <p style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: 14.5,
              lineHeight: 1.5,
              color: "#3d3527",
              margin: 0,
              textAlign: "center",
              fontStyle: "italic",
              textWrap: "pretty",
            }}>
              A lightweight dueler that cuts the setup, not the strategy.
              A quick fix for veterans and a painless gateway for friends
              who usually dodge tactical games. Simple rules, deep choices, zero fluff.
            </p>

            <div style={{
              display: "flex", justifyContent: "center", flexWrap: "wrap",
              fontFamily: "'Crimson Pro', serif", fontSize: 12.5, color: "#3d3527",
              gap: 0,
            }}>
              {[
                ["32", "playable fantasy characters"],
                ["62", "items"],
                ["13", "tarot cards"],
              ].map(([n, label], i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ color: "#c9a44a", padding: "0 10px", alignSelf: "center" }}>◆</span>}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "#1d1a14" }}>{n}</span>
                    <span style={{ fontStyle: "italic" }}>{label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div style={{ textAlign: "center", fontFamily: "'Crimson Pro', serif", fontStyle: "italic", color: "#6b6354", fontSize: 12.5 }}>
              <span style={{ borderBottom: "1px solid #c9a44a", paddingBottom: 1 }}>A game by Paco Martínez</span>
            </div>
          </div>
        )}
      </div>

      {/* Launch overlay */}
      {launching && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,13,8,0.92)",
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
          gap: 20, zIndex: 100,
          animation: "fadein 200ms ease",
        }}>
          <Swords size={52} color="#c9a44a" />
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, letterSpacing: "0.4em", color: "#fdfbf4", textTransform: "uppercase" }}>
            Shuffling Decks
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#c9a44a", letterSpacing: "0.18em" }}>
            {summaryParts.join(" · ")}
          </div>
        </div>
      )}

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Aesthetic">
          <TweakSelect
            label="Paper tone"
            value={tweaks.paperTone}
            onChange={(v) => setTweak("paperTone", v)}
            options={[
              { value: "ivory", label: "Ivory (near-white, default)" },
              { value: "paper", label: "Paper (warm white)" },
              { value: "cream", label: "Cream (antique)" },
            ]}
          />
          <TweakSelect
            label="Accent palette"
            value={tweaks.accentScheme}
            onChange={(v) => setTweak("accentScheme", v)}
            options={[
              { value: "house", label: "House (red/green/blue/gold)" },
              { value: "dusk", label: "Dusk (muted)" },
              { value: "forest", label: "Forest (deep)" },
            ]}
          />
        </TweakSection>
        <TweakSection title="Visibility">
          <TweakToggle
            label="Show debug section"
            value={tweaks.showDebug}
            onChange={(v) => setTweak("showDebug", v)}
          />
          <TweakToggle
            label="Show lore + credits"
            value={tweaks.showLore}
            onChange={(v) => setTweak("showLore", v)}
          />
        </TweakSection>
      </TweaksPanel>

      <style>{`
        @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
        button:focus-visible { outline: 2px solid #c9a44a; outline-offset: 2px; }
      `}</style>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
