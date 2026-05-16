import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, sessionsAPI } from '../api/client';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [streak, setStreak]         = useState(null);
  const [dueNow, setDueNow]         = useState(null);
  const [deckHealth, setDeckHealth] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true; // memory leak guard

    const load = async () => {
      try {
        // Run all 3 requests in parallel
        const [streakRes, dueRes, healthRes] = await Promise.all([
          analyticsAPI.getStreak(user.id),
          analyticsAPI.getDueNow(user.id),
          analyticsAPI.getDeckHealth(user.id),
        ]);

        if (!mounted) return; // component unmounted while fetching

        setStreak(streakRes.data);
        setDueNow(dueRes.data);
        setDeckHealth(healthRes.data);
      } catch (err) {
        if (mounted) setError('Failed to load dashboard data.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [user?.id]);

  if (loading) return <LoadingDash />;
  if (error)   return <p style={{ padding: 40, color: '#ef4444' }}>{error}</p>;

  const firstName = user?.email?.split('@')[0];
  const hourNow   = new Date().getHours();
  const greeting  = hourNow < 12 ? 'Good morning' : hourNow < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page">

      {/* ── GREETING ── */}
      <div style={styles.greeting}>
        <div>
          <h1 style={styles.greetingTitle}>{greeting}, {firstName} 👋</h1>
          <p style={styles.greetingDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/decks')}
        >
          + New Deck
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={styles.statsGrid}>
        <StatCard
          label="Day Streak"
          value={streak?.streak_days ?? 0}
          suffix="days"
          icon="🔥"
          color="var(--blue)"
          bgColor="var(--blue-light)"
        />
        <StatCard
          label="Cards Due Now"
          value={dueNow?.total_due ?? 0}
          suffix="cards"
          icon="📚"
          color="#16a34a"
          bgColor="#f0fdf4"
          onClick={dueNow?.total_due > 0 ? () => navigate('/decks') : undefined}
          cta={dueNow?.total_due > 0 ? 'Start reviewing →' : null}
        />
        <StatCard
          label="Decks"
          value={deckHealth.length}
          suffix="active"
          icon="🗂️"
          color="#ea580c"
          bgColor="#fff7ed"
          onClick={() => navigate('/decks')}
        />
        <StatCard
          label="Last Studied"
          value={streak?.last_studied
            ? new Date(streak.last_studied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Never'}
          icon="📅"
          color="#7c3aed"
          bgColor="#ede9fe"
        />
      </div>

      {/* ── DECK HEALTH GRID ── */}
      {deckHealth.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Deck Health</h2>
            <button className="btn btn-outline" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => navigate('/analytics')}>
              View analytics →
            </button>
          </div>
          <div style={styles.deckGrid}>
            {deckHealth.map((deck) => (
              <DeckHealthCard
                key={deck.deck_id}
                deck={deck}
                onStudy={() => navigate(`/study/${deck.deck_id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {deckHealth.length === 0 && (
        <div style={styles.empty}>
          <span style={{ fontSize: 48 }}>📖</span>
          <h3 style={styles.emptyTitle}>No decks yet</h3>
          <p style={styles.emptySub}>Create your first flashcard deck to get started.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/decks')}>
            Create your first deck
          </button>
        </div>
      )}

    </div>
  );
}

/* ── SUB-COMPONENTS ─────────────────────────────────────── */

function StatCard({ label, value, suffix, icon, color, bgColor, onClick, cta }) {
  return (
    <div
      style={{ ...styles.statCard, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div style={{ ...styles.statIcon, background: bgColor, color }}>
        {icon}
      </div>
      <div>
        <div style={styles.statValue}>
          {value}
          {suffix && <span style={styles.statSuffix}> {suffix}</span>}
        </div>
        <div style={styles.statLabel}>{label}</div>
        {cta && <div style={{ ...styles.statCta, color }}>{cta}</div>}
      </div>
    </div>
  );
}

function DeckHealthCard({ deck, onStudy }) {
  const statusColors = {
    healthy:  { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
    moderate: { bg: '#fefce8', text: '#ca8a04', border: '#fde68a' },
    weak:     { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
    critical: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  };
  const colors = statusColors[deck.status] || statusColors.moderate;
  const pct    = Math.round((deck.avg_retention || 0) * 100);

  return (
    <div style={styles.deckCard}>
      <div style={styles.deckCardTop}>
        <h3 style={styles.deckCardTitle}>{deck.deck_title}</h3>
        <span style={{ ...styles.statusBadge, background: colors.bg, color: colors.text, borderColor: colors.border }}>
          {deck.status}
        </span>
      </div>

      {/* Retention bar */}
      <div style={styles.retentionRow}>
        <span style={styles.retentionLabel}>Retention</span>
        <span style={{ ...styles.retentionPct, color: colors.text }}>{pct}%</span>
      </div>
      <div style={styles.progressBg}>
        <div style={{ ...styles.progressFill, width: `${pct}%`, background: colors.text }} />
      </div>

      <div style={styles.deckMeta}>
        <span style={{ color: deck.cards_due > 0 ? '#ea580c' : 'var(--muted)' }}>
          {deck.cards_due} due
        </span>
        {deck.exam_date && (
          <span style={{ color: 'var(--muted)' }}>
            Exam: {new Date(deck.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%', marginTop: 16, fontSize: 14 }}
        onClick={onStudy}
        disabled={deck.cards_due === 0}
      >
        {deck.cards_due > 0 ? `Study now (${deck.cards_due} due)` : 'All caught up ✓'}
      </button>
    </div>
  );
}

function LoadingDash() {
  return (
    <div className="page">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={styles.skeleton} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ ...styles.skeleton, height: 180 }} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  greeting: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 },
  greetingTitle: { fontSize: 28, fontWeight: 800, marginBottom: 4 },
  greetingDate: { fontSize: 14, color: 'var(--muted)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 },
  statCard: { background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', gap: 16, transition: 'box-shadow .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  statIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 },
  statValue: { fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 700 },
  statSuffix: { fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 400, color: 'var(--muted)' },
  statLabel: { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
  statCta: { fontSize: 12, fontWeight: 600, marginTop: 4 },
  section: { marginBottom: 40 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 700 },
  deckGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  deckCard: { background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 24, transition: 'box-shadow .2s' },
  deckCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 10 },
  deckCardTitle: { fontSize: 16, fontWeight: 700 },
  statusBadge: { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, border: '1px solid', textTransform: 'capitalize', whiteSpace: 'nowrap' },
  retentionRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  retentionLabel: { fontSize: 12, color: 'var(--muted)' },
  retentionPct: { fontSize: 12, fontWeight: 700 },
  progressBg: { height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: '100%', borderRadius: 999, transition: 'width .4s ease' },
  deckMeta: { display: 'flex', justifyContent: 'space-between', fontSize: 12 },
  empty: { textAlign: 'center', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 700 },
  emptySub: { fontSize: 15, color: 'var(--muted)', maxWidth: 360 },
  skeleton: { height: 90, background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', borderRadius: 14, animation: 'shimmer 1.4s infinite' },
};

// Skeleton shimmer animation
const shimmer = document.createElement('style');
shimmer.innerHTML = `@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`;
document.head.appendChild(shimmer);
