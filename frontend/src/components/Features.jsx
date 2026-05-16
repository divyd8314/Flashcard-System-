/*
  ============================================================
  Features.jsx
  ============================================================

  A 3×2 grid of feature cards explaining FlashLearn's value.

  Key concepts:
  ─────────────────────────────────────────────────────────
  • Data-driven rendering — instead of copy-pasting 6 cards
    manually, we define an array of objects (FEATURES) and
    .map() over it to render each card.

    Why this matters: if you want to add, remove, or reorder
    a feature, you only touch the data array — not the JSX.

  • SVG icons inline — small icons defined as JSX <svg>
    elements. No icon library needed for a few icons.

  • id="features" on the section — this is what the header's
    "Features" anchor link (#features) scrolls to.
  ============================================================
*/

const FEATURES = [
    {
      title: 'Smart Scheduling',
      desc: 'Our algorithm surfaces cards exactly when your memory is about to fade — not too early, not too late.',
      chip: 'SM-2 + AI layer',
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 2v4M11 16v4M2 11h4M16 11h4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="11" cy="11" r="4" stroke="#2563eb" strokeWidth="2"/>
        </svg>
      ),
    },
    {
      title: 'Retention Tracking',
      desc: 'See exactly how well you know each deck with accuracy scores, streak data, and forgetting curves.',
      chip: 'Per-card analytics',
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="12" width="3" height="7" rx="1.5" fill="#2563eb"/>
          <rect x="9" y="7" width="3" height="12" rx="1.5" fill="#2563eb"/>
          <rect x="15" y="3" width="3" height="16" rx="1.5" fill="#2563eb"/>
        </svg>
      ),
    },
    {
      title: 'Exam Urgency Engine',
      desc: 'Set an exam date and FlashLearn automatically reprioritizes your review queue to maximize coverage in time.',
      chip: 'Deadline-aware',
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="9" stroke="#2563eb" strokeWidth="2"/>
          <path d="M11 7v5l3 3" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      title: 'Better Than Anki',
      desc: "No XML imports, no clunky UI. FlashLearn gives you everything Anki does — with a modern interface you'll actually use.",
      chip: 'Anki importer coming',
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M3 17l5-5 4 4 7-9" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      title: 'Deck Management',
      desc: 'Organize decks by subject, tag cards, and share decks with classmates — all in one clean workspace.',
      chip: 'Collaboration soon',
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="2" stroke="#2563eb" strokeWidth="2"/>
          <rect x="12" y="3" width="7" height="7" rx="2" stroke="#2563eb" strokeWidth="2"/>
          <rect x="3" y="12" width="7" height="7" rx="2" stroke="#2563eb" strokeWidth="2"/>
          <rect x="12" y="12" width="7" height="7" rx="2" stroke="#2563eb" strokeWidth="2"/>
        </svg>
      ),
    },
    {
      title: 'Confidence Ratings',
      desc: 'Rate how confident you felt after each card. The system learns your weak spots faster and drills them harder.',
      chip: 'Self-calibrating',
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 3a8 8 0 100 16A8 8 0 0011 3z" stroke="#2563eb" strokeWidth="2"/>
          <path d="M8 11l2 2 4-4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];
  
  export default function Features() {
    return (
      <section id="features" className="section" style={{ background: 'var(--surface)' }}>
        <div className="section-inner">
  
          {/* ── HEADER ROW ── */}
          <div style={styles.headerRow}>
            <div>
              <p className="section-label">Why FlashLearn</p>
              <h2 className="section-title">
                Built different<br />from the start.
              </h2>
            </div>
            <p className="section-sub">
              Not just flashcards. A system that understands how memory actually works.
            </p>
          </div>
  
          {/* ── FEATURE GRID ──
              .map() turns the FEATURES array into JSX cards.
              `key` is required by React when rendering lists —
              it helps React track which items changed.
          ── */}
          <div style={styles.grid}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card" style={styles.card}>
                <div style={styles.iconBox}>{f.icon}</div>
                <h3 style={styles.cardTitle}>{f.title}</h3>
                <p style={styles.cardDesc}>{f.desc}</p>
                <span style={styles.chip}>{f.chip}</span>
              </div>
            ))}
          </div>
  
        </div>
      </section>
    );
  }
  
  const styles = {
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      gap: 20,
      marginBottom: 56,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 24,
    },
    card: {
      /* .card class from index.css provides base styles */
      padding: 32,
    },
    iconBox: {
      width: 48,
      height: 48,
      background: 'var(--blue-light)',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 10,
    },
    cardDesc: {
      fontSize: 15,
      color: 'var(--muted)',
      lineHeight: 1.6,
    },
    chip: {
      display: 'inline-block',
      marginTop: 16,
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--blue)',
      background: 'var(--blue-light)',
      padding: '4px 10px',
      borderRadius: 999,
    },
  };
  