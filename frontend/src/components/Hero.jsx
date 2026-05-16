/*
  ============================================================
  Hero.jsx
  ============================================================

  The first thing visitors see. Goal: communicate value
  instantly and get them to click "Start for free".

  Key concepts:
  ─────────────────────────────────────────────────────────
  • useNavigate()  → navigates to /signup on CTA click

  • Inline styles  → used sparingly here for one-off values
                     that don't warrant a CSS class
                     (e.g. a specific margin or flex gap).
                     Global, reusable styles live in index.css.

  • CSS classes from App.css:
      .fade-in, .fade-in-1/.fade-in-2/etc → staggered
      entrance animation. Each child animates in slightly
      after the previous one, creating a smooth cascade.
      .hero-badge-dot → the pulsing blue dot

  • The browser mockup is pure HTML/CSS — no images needed.
    This is called a "code mockup" or "UI skeleton" and is
    common in SaaS landing pages.
  ============================================================
*/

import { useNavigate } from 'react-router-dom';
import '../App.css'; // imports fade-in animations

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section style={styles.hero}>

      {/* ── BADGE ── */}
      <div className="fade-in fade-in-1" style={styles.badge}>
        <span className="hero-badge-dot" />
        Adaptive flashcard engine — now in beta
      </div>

      {/* ── HEADLINE ── */}
      <h1 className="fade-in fade-in-2" style={styles.headline}>
        Study smarter.<br />
        <span style={{ color: 'var(--blue)' }}>Remember everything.</span>
      </h1>

      {/* ── SUBHEADLINE ── */}
      <p className="fade-in fade-in-3" style={styles.sub}>
        FlashLearn uses spaced repetition and exam urgency algorithms to make
        sure you never forget what matters — right when it matters.
      </p>

      {/* ── CTA BUTTONS ── */}
      <div className="fade-in fade-in-4" style={styles.cta}>
        <button
          className="btn btn-primary btn-xl"
          onClick={() => navigate('/signup')}
        >
          Start for free
        </button>
        <a href="#how" className="btn btn-outline btn-lg">
          See how it works
        </a>
      </div>

      {/* ── SOCIAL PROOF STATS ── */}
      <div className="fade-in fade-in-4" style={styles.stats}>
        <Stat number="94%" label="Average retention rate" />
        <div style={styles.divider} />
        <Stat number="3.2×" label="Faster than Anki" />
        <div style={styles.divider} />
        <Stat number="12k+" label="Active learners" />
      </div>

      {/* ── BROWSER MOCKUP ── */}
      <div className="fade-in" style={{ animationDelay: '0.5s', width: '100%', maxWidth: 760, marginTop: 64 }}>
        <div style={styles.mockup}>

          {/* browser chrome bar */}
          <div style={styles.mockBar}>
            <div style={{ ...styles.mockDot, background: '#ff5f57' }} />
            <div style={{ ...styles.mockDot, background: '#febc2e' }} />
            <div style={{ ...styles.mockDot, background: '#28c840' }} />
            <div style={styles.mockUrl}>app.flashlearn.io/dashboard</div>
          </div>

          {/* deck cards */}
          <div style={styles.mockBody}>
            <MockCard title="Cell Biology" tag="Biology" tagColor="blue" sub="148 cards · 12 due today" progress={82} />
            <MockCard title="WW2 Timeline" tag="History" tagColor="green" sub="84 cards · 5 due today" progress={67} />
            <MockCard title="Calculus II" tag="Math" tagColor="orange" sub="210 cards · 27 due today" progress={45} />
          </div>

          {/* footer bar */}
          <div style={styles.mockFooter}>
            <span>Last studied 2h ago</span>
            <span style={{ color: 'var(--blue)', fontWeight: 700 }}>🔥 14-day streak</span>
            <span>Next review: 4:00 PM</span>
          </div>
        </div>
      </div>

    </section>
  );
}

/* ── SUB-COMPONENTS ──────────────────────────────────────
   Small presentational components defined in the same file.
   These are "private" — only used by Hero, not exported.
   If they grew complex or were reused, we'd move them to
   their own files in /components/.
──────────────────────────────────────────────────────────── */

function Stat({ number, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, fontWeight: 700 }}>
        {number}
      </div>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

const tagColors = {
  blue:   { background: 'var(--blue-light)', color: 'var(--blue)' },
  green:  { background: '#f0fdf4',           color: '#16a34a'      },
  orange: { background: '#fff7ed',           color: '#ea580c'      },
};

function MockCard({ title, tag, tagColor, sub, progress }) {
  const barColors = { blue: 'var(--blue)', green: '#16a34a', orange: '#ea580c' };

  return (
    <div style={styles.mockCard}>
      <span style={{ ...styles.mockTag, ...tagColors[tagColor] }}>{tag}</span>
      <div style={styles.mockTitle}>{title}</div>
      <div style={styles.mockSub}>{sub}</div>
      <div style={styles.progressBg}>
        <div style={{ ...styles.progressBar, width: `${progress}%`, background: barColors[tagColor] }} />
      </div>
    </div>
  );
}

/* ── STYLES ───────────────────────────────────────────────
   Inline style objects for layout-specific values.
   Everything reusable (btn, card, etc) is in index.css.
──────────────────────────────────────────────────────────── */
const styles = {
  hero: {
    minHeight: '88vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '80px 40px 60px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--blue-light)',
    border: '1px solid var(--blue-mid)',
    color: 'var(--blue)',
    fontSize: 13,
    fontWeight: 600,
    padding: '6px 14px',
    borderRadius: 999,
    marginBottom: 28,
  },
  headline: {
    fontSize: 'clamp(42px, 6vw, 76px)',
    fontWeight: 800,
    lineHeight: 1.05,
    maxWidth: 820,
    marginBottom: 24,
  },
  sub: {
    fontSize: 19,
    color: 'var(--muted)',
    maxWidth: 540,
    lineHeight: 1.65,
    marginBottom: 40,
  },
  cta: {
    display: 'flex',
    gap: 14,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 56,
  },
  stats: {
    display: 'flex',
    gap: 48,
    justifyContent: 'center',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 36,
    background: 'var(--border)',
  },
  mockup: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 18,
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(37,99,235,.08), 0 4px 16px rgba(0,0,0,.06)',
  },
  mockBar: {
    background: '#fff',
    borderBottom: '1px solid var(--border)',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  mockDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  mockUrl: {
    flex: 1,
    background: 'var(--surface)',
    borderRadius: 6,
    height: 26,
    margin: '0 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    color: 'var(--muted)',
  },
  mockBody: {
    padding: 20,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
  },
  mockCard: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 16,
  },
  mockTag: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 999,
    marginBottom: 10,
  },
  mockTitle: {
    fontFamily: 'Sora, sans-serif',
    fontWeight: 700,
    fontSize: 14,
    marginBottom: 6,
  },
  mockSub: {
    fontSize: 12,
    color: 'var(--muted)',
  },
  progressBg: {
    height: 5,
    background: 'var(--border)',
    borderRadius: 999,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
    transition: 'width 0.4s ease',
  },
  mockFooter: {
    padding: '14px 20px',
    borderTop: '1px solid var(--border)',
    background: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 13,
    color: 'var(--muted)',
  },
};
