import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../api/client';

/* ── inject styles once ── */
const injectStyles = () => {
  if (document.getElementById('analytics-styles')) return;
  const s = document.createElement('style');
  s.id = 'analytics-styles';
  s.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@300;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes barGrow { from { height: 0%; } }
    @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
    .analytics-page { font-family: 'DM Sans', sans-serif; }
    .stat-card { transition: box-shadow .2s, transform .2s; }
    .stat-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .acc-bar { animation: barGrow .6s cubic-bezier(0.34,1.56,0.64,1) both; }
    .ret-cell { transition: transform .15s; }
    .ret-cell:hover { transform: scale(1.25); z-index: 10; }
    .skeleton { animation: shimmer 1.4s ease-in-out infinite; background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; border-radius:12px; }
  `;
  document.head.appendChild(s);
};

/* ── helpers ── */
const retentionColor = (r) => {
  if (r >= 0.8) return '#16a34a';
  if (r >= 0.6) return '#65a30d';
  if (r >= 0.4) return '#ca8a04';
  if (r >= 0.2) return '#ea580c';
  return '#dc2626';
};
const retentionBg = (r) => {
  if (r >= 0.8) return '#f0fdf4';
  if (r >= 0.6) return '#f7fee7';
  if (r >= 0.4) return '#fefce8';
  if (r >= 0.2) return '#fff7ed';
  return '#fef2f2';
};
const statusColor = {
  healthy:  { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  moderate: { bg: '#fefce8', text: '#ca8a04', border: '#fde68a' },
  weak:     { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
  critical: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
};

/* ── mini bar chart for accuracy over time ── */
function AccuracyChart({ data }) {
  if (!data?.length) {
    return (
      <div style={s.emptyChart}>
        <span style={{ fontSize: 32 }}>📈</span>
        <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 8 }}>No sessions yet</p>
      </div>
    );
  }

  // Show last 20 sessions max
  const visible = data.slice(-20);
  const maxCards = Math.max(...visible.map(d => d.cards_reviewed), 1);

  return (
    <div style={s.chartWrapper}>
      {/* Gridlines */}
      {[100, 75, 50, 25, 0].map(pct => (
        <div key={pct} style={{ ...s.gridline, bottom: `${pct}%` }}>
          <span style={s.gridLabel}>{pct}%</span>
        </div>
      ))}

      {/* Bars */}
      <div style={s.barsRow}>
        {visible.map((d, i) => {
          const acc = Math.round((d.accuracy ?? 0) * 100);
          const barColor = acc >= 80 ? '#16a34a' : acc >= 60 ? '#ca8a04' : '#dc2626';
          const heightPct = acc;
          const dateStr = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <div key={i} style={s.barCol} title={`${dateStr}: ${acc}% (${d.cards_reviewed} cards)`}>
              <div style={s.barBg}>
                <div
                  className="acc-bar"
                  style={{
                    ...s.barFill,
                    height: `${heightPct}%`,
                    background: barColor,
                    animationDelay: `${i * 0.03}s`,
                  }}
                />
              </div>
              {/* Dot for cards reviewed */}
              <div style={{ ...s.cardsDot, opacity: d.cards_reviewed / maxCards }} />
            </div>
          );
        })}
      </div>

      <p style={s.chartCaption}>Accuracy per session · last {visible.length} sessions</p>
    </div>
  );
}

/* ── retention heatmap dots ── */
function RetentionHeatmap({ cards }) {
  if (!cards?.length) {
    return (
      <div style={s.emptyChart}>
        <span style={{ fontSize: 32 }}>🧠</span>
        <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 8 }}>No cards reviewed yet</p>
      </div>
    );
  }

  return (
    <div>
      <div style={s.heatmapGrid}>
        {cards.slice(0, 80).map((c) => {
          const ret = c.retention ?? 0;
          const color = retentionColor(ret);
          const bg = retentionBg(ret);
          return (
            <div
              key={c.card_id}
              className="ret-cell"
              title={`${c.front} — ${Math.round(ret * 100)}% retention`}
              style={{
                ...s.heatCell,
                background: bg,
                border: `1.5px solid ${color}30`,
              }}
            >
              <div style={{ ...s.heatDot, background: color }} />
            </div>
          );
        })}
      </div>
      <div style={s.legendRow}>
        {[0.9, 0.7, 0.5, 0.3, 0.1].map(r => (
          <div key={r} style={s.legendItem}>
            <div style={{ ...s.legendDot, background: retentionColor(r) }} />
            <span>{Math.round(r * 100)}%</span>
          </div>
        ))}
        <span style={{ color: '#94a3b8', marginLeft: 8 }}>retention</span>
      </div>
    </div>
  );
}

/* ── deck health cards ── */
function DeckHealthGrid({ decks, navigate }) {
  if (!decks?.length) {
    return (
      <div style={s.emptyChart}>
        <span style={{ fontSize: 32 }}>🗂️</span>
        <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 8 }}>No decks found</p>
      </div>
    );
  }

  return (
    <div style={s.deckHealthGrid}>
      {decks.map((deck, i) => {
        const sc = statusColor[deck.status] || statusColor.moderate;
        const pct = Math.round((deck.avg_retention ?? 0) * 100);

        return (
          <div
            key={deck.deck_id}
            className="stat-card"
            style={{ ...s.deckHealthCard, animationDelay: `${i * 0.07}s` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                {deck.deck_title}
              </h3>
              <span style={{ ...s.badge, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                {deck.status}
              </span>
            </div>

            {/* Retention bar */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Avg Retention</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: sc.text }}>{pct}%</span>
              </div>
              <div style={s.miniBarBg}>
                <div style={{ ...s.miniBarFill, width: `${pct}%`, background: sc.text, transition: 'width .6s ease' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
              <span style={{ color: deck.cards_due > 0 ? '#ea580c' : '#16a34a', fontWeight: 600 }}>
                {deck.cards_due} due
              </span>
              {deck.exam_date && (
                <span>
                  📅 {new Date(deck.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>

            <button
              style={{
                ...s.studyBtn,
                background: deck.cards_due > 0 ? '#1a1a2e' : '#f1f5f9',
                color: deck.cards_due > 0 ? '#fff' : '#94a3b8',
                cursor: deck.cards_due > 0 ? 'pointer' : 'default',
              }}
              onClick={() => deck.cards_due > 0 && navigate(`/study/${deck.deck_id}`)}
              disabled={deck.cards_due === 0}
            >
              {deck.cards_due > 0 ? `Study now →` : 'All caught up ✓'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ── skeleton loader ── */
function Skeleton({ height = 60, style = {} }) {
  return <div className="skeleton" style={{ height, ...style }} />;
}

/* ═══════════════════════════════ MAIN ═══════════════════════════════ */
export default function Analytics() {
  injectStyles();

  const { user } = useAuth();
  const navigate = useNavigate();

  const [streak,    setStreak]    = useState(null);
  const [accuracy,  setAccuracy]  = useState(null);
  const [retention, setRetention] = useState(null);
  const [health,    setHealth]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;

    const load = async () => {
      try {
        const [streakRes, accRes, retRes, healthRes] = await Promise.all([
          analyticsAPI.getStreak(user.id),
          analyticsAPI.getAccuracy(user.id),
          analyticsAPI.getRetention(user.id),
          analyticsAPI.getDeckHealth(user.id),
        ]);
        if (!mounted) return;
        setStreak(streakRes.data);
        setAccuracy(accRes.data);
        setRetention(retRes.data);
        setHealth(healthRes.data);
      } catch (err) {
        if (mounted) setError('Failed to load analytics. Is the backend running?');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [user?.id]);

  /* ── computed stats ── */
  const avgAccuracy = accuracy?.length
    ? Math.round(accuracy.reduce((a, d) => a + (d.accuracy ?? 0), 0) / accuracy.length * 100)
    : null;

  const totalCards = accuracy?.reduce((a, d) => a + (d.cards_reviewed ?? 0), 0) ?? 0;

  const avgRetention = retention?.length
    ? Math.round(retention.reduce((a, d) => a + (d.retention ?? 0), 0) / retention.length * 100)
    : null;

  return (
    <div className="analytics-page page">

      {/* ── HEADER ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Analytics</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Track your retention, streak, and study patterns.
          </p>
        </div>
        <button
          style={s.backBtn}
          onClick={() => navigate('/dashboard')}
        >
          ← Dashboard
        </button>
      </div>

      {error && (
        <div style={s.errorBanner}>{error}</div>
      )}

      {/* ── STAT STRIP ── */}
      <div style={s.statStrip}>
        {[
          {
            icon: '🔥',
            label: 'Day Streak',
            value: loading ? null : (streak?.streak_days ?? 0),
            suffix: 'days',
            color: '#ea580c',
            bg: '#fff7ed',
          },
          {
            icon: '🎯',
            label: 'Avg Accuracy',
            value: loading ? null : (avgAccuracy != null ? `${avgAccuracy}%` : '—'),
            color: '#6366f1',
            bg: '#f0f0ff',
          },
          {
            icon: '🧠',
            label: 'Avg Retention',
            value: loading ? null : (avgRetention != null ? `${avgRetention}%` : '—'),
            color: '#0891b2',
            bg: '#f0f9ff',
          },
          {
            icon: '📚',
            label: 'Total Reviews',
            value: loading ? null : totalCards,
            suffix: 'cards',
            color: '#16a34a',
            bg: '#f0fdf4',
          },
          {
            icon: '📅',
            label: 'Last Studied',
            value: loading ? null : (streak?.last_studied
              ? new Date(streak.last_studied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'Never'),
            color: '#7c3aed',
            bg: '#ede9fe',
          },
        ].map((stat, i) => (
          <div key={i} className="stat-card" style={s.statCard}>
            <div style={{ ...s.statIcon, background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              {stat.value == null
                ? <Skeleton height={28} style={{ width: 64, marginBottom: 6 }} />
                : <div style={{ ...s.statValue, color: stat.color }}>
                    {stat.value}
                    {stat.suffix && <span style={s.statSuffix}> {stat.suffix}</span>}
                  </div>
              }
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── TWO COLUMN: accuracy chart + retention heatmap ── */}
      <div style={s.twoCol}>

        {/* Accuracy over time */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Accuracy Over Time</h2>
          {loading
            ? <Skeleton height={200} />
            : <AccuracyChart data={accuracy} />
          }
        </div>

        {/* Retention heatmap */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Card Retention Map</h2>
          <p style={s.sectionSub}>Each dot = one card. Hover for details.</p>
          {loading
            ? <Skeleton height={200} />
            : <RetentionHeatmap cards={retention} />
          }
        </div>

      </div>

      {/* ── DECK HEALTH ── */}
      <div style={{ ...s.section, marginTop: 8 }}>
        <h2 style={s.sectionTitle}>Deck Health</h2>
        <p style={s.sectionSub}>
          Average retention and cards due per deck.
        </p>
        {loading
          ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[0,1,2].map(i => <Skeleton key={i} height={160} />)}
            </div>
          : <DeckHealthGrid decks={health} navigate={navigate} />
        }
      </div>

      {/* ── WEAK CARDS TABLE ── */}
      {!loading && retention?.length > 0 && (
        <div style={{ ...s.section, marginTop: 8 }}>
          <h2 style={s.sectionTitle}>Cards That Need Work</h2>
          <p style={s.sectionSub}>Lowest retention cards — sorted weakest first.</p>
          <div style={s.table}>
            <div style={s.tableHead}>
              <span>Card (front)</span>
              <span>Retention</span>
              <span>Next Review</span>
            </div>
            {retention.slice(0, 10).map((c, i) => {
              const color = retentionColor(c.retention ?? 0);
              const bg = retentionBg(c.retention ?? 0);
              const pct = Math.round((c.retention ?? 0) * 100);
              return (
                <div key={c.card_id} style={{ ...s.tableRow, animationDelay: `${i * 0.04}s` }}>
                  <span style={{ fontSize: 14, color: '#1a1a2e', fontWeight: 500 }}>
                    {c.front?.length > 60 ? c.front.slice(0, 60) + '…' : c.front}
                  </span>
                  <span style={{ ...s.badge, background: bg, color, border: `1px solid ${color}30` }}>
                    {pct}%
                  </span>
                  <span style={{ fontSize: 13, color: '#64748b' }}>
                    {c.next_review
                      ? new Date(c.next_review).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

/* ─── STYLES ─── */
const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 },
  title: { fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 },
  backBtn: { background: 'none', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '8px 16px', fontSize: 14, fontWeight: 600, color: '#64748b', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  errorBanner: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', color: '#dc2626', fontSize: 14, marginBottom: 20 },

  statStrip: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 28 },
  statCard: { background: '#fff', border: '1px solid #e8e8f0', borderRadius: 14, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', animation: 'fadeUp .4s ease both' },
  statIcon: { width: 42, height: 42, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 },
  statValue: { fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, lineHeight: 1 },
  statSuffix: { fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 400, color: '#94a3b8' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 3, fontWeight: 500 },

  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 },
  section: { background: '#fff', border: '1px solid #e8e8f0', borderRadius: 16, padding: 24, animation: 'fadeUp .4s ease both' },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 },
  sectionSub: { fontSize: 13, color: '#94a3b8', marginBottom: 16 },

  /* Accuracy chart */
  chartWrapper: { position: 'relative', height: 200 },
  gridline: { position: 'absolute', left: 36, right: 0, borderTop: '1px dashed #f1f5f9', display: 'flex', alignItems: 'center' },
  gridLabel: { position: 'absolute', left: -34, fontSize: 10, color: '#cbd5e1', width: 30, textAlign: 'right' },
  barsRow: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: 3, paddingLeft: 36, paddingBottom: 20 },
  barCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' },
  barBg: { width: '100%', height: 'calc(100% - 20px)', background: '#f8f9fe', borderRadius: 4, overflow: 'hidden', display: 'flex', alignItems: 'flex-end' },
  barFill: { width: '100%', borderRadius: '4px 4px 0 0', minHeight: 2 },
  cardsDot: { width: 4, height: 4, borderRadius: '50%', background: '#6366f1', marginTop: 2 },
  chartCaption: { position: 'absolute', bottom: 0, left: 36, right: 0, fontSize: 11, color: '#cbd5e1', textAlign: 'center' },
  emptyChart: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 160 },

  /* Retention heatmap */
  heatmapGrid: { display: 'flex', flexWrap: 'wrap', gap: 5 },
  heatCell: { width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default', position: 'relative' },
  heatDot: { width: 10, height: 10, borderRadius: '50%' },
  legendRow: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, fontSize: 11, color: '#64748b' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: '50%' },

  /* Deck health */
  deckHealthGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  deckHealthCard: { background: '#fff', border: '1px solid #e8e8f0', borderRadius: 14, padding: 20, animation: 'fadeUp .4s ease both', display: 'flex', flexDirection: 'column', gap: 4 },
  badge: { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, textTransform: 'capitalize', whiteSpace: 'nowrap' },
  miniBarBg: { height: 5, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 999 },
  studyBtn: { marginTop: 12, padding: '9px 0', borderRadius: 10, border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, width: '100%', transition: 'all .2s' },

  /* Weak cards table */
  table: { border: '1px solid #e8e8f0', borderRadius: 12, overflow: 'hidden' },
  tableHead: { display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, padding: '10px 16px', background: '#f8f9fe', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e8e8f0' },
  tableRow: { display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, padding: '12px 16px', borderBottom: '1px solid #f1f5f9', alignItems: 'center', animation: 'fadeUp .3s ease both' },
};
