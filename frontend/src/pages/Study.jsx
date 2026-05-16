import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

/* ─── tiny inline keyframes injected once ─── */
const injectStyles = () => {
  if (document.getElementById('study-styles')) return;
  const s = document.createElement('style');
  s.id = 'study-styles';
  s.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;0,700;1,300&family=DM+Sans:wght@400;500;600&display=swap');

    .study-page { font-family: 'DM Sans', sans-serif; }

    @keyframes fadeUp {
      from { opacity:0; transform:translateY(18px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes pop {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.06); }
      100% { transform: scale(1); }
    }
    @keyframes shimmerPulse {
      0%, 100% { opacity: 0.5; }
      50%       { opacity: 1; }
    }
    @keyframes progressFill {
      from { width: 0%; }
    }
    @keyframes scoreCount {
      from { opacity:0; transform: scale(0.7); }
      to   { opacity:1; transform: scale(1); }
    }

    /* 3-D card flip */
    .card-scene { perspective: 1200px; }
    .card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1);
      transform-style: preserve-3d;
    }
    .card-inner.flipped { transform: rotateY(180deg); }
    .card-face {
      position: absolute;
      inset: 0;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }
    .card-front-face {
      background: #ffffff;
      border: 1.5px solid #e8e8f0;
      box-shadow: 0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
    }
    .card-back-face {
      background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
      transform: rotateY(180deg);
      box-shadow: 0 8px 40px rgba(26,26,46,0.35);
    }

    .btn-wrong {
      background: #fff;
      color: #dc2626;
      border: 2px solid #fecaca;
      transition: all .18s ease;
    }
    .btn-wrong:hover { background: #fef2f2; border-color: #dc2626; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(220,38,38,0.15); }
    .btn-wrong:active { transform: translateY(0); }

    .btn-got {
      background: #16a34a;
      color: #fff;
      border: 2px solid #16a34a;
      transition: all .18s ease;
    }
    .btn-got:hover { background: #15803d; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(22,163,74,0.3); }
    .btn-got:active { transform: translateY(0); animation: pop .25s ease; }

    .btn-flip {
      background: transparent;
      border: 2px solid #e8e8f0;
      color: #64748b;
      transition: all .18s ease;
    }
    .btn-flip:hover { border-color: #6366f1; color: #6366f1; background: #f0f0ff; transform: translateY(-2px); }

    .retention-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 999px;
      letter-spacing: 0.03em;
    }
    .hint-tap { animation: shimmerPulse 2s ease-in-out infinite; }

    .summary-score { animation: scoreCount .5s cubic-bezier(0.34,1.56,0.64,1) both; }
    .summary-card-row { animation: fadeUp .3s ease both; }

    .result-btn { 
      padding: 14px 32px;
      border-radius: 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all .2s ease;
      border: none;
    }
    .result-btn:hover { transform: translateY(-2px); }
    .result-btn-primary { background: #1a1a2e; color: #fff; }
    .result-btn-primary:hover { box-shadow: 0 8px 24px rgba(26,26,46,0.25); }
    .result-btn-outline { background: #fff; color: #1a1a2e; border: 2px solid #e8e8f0; }
    .result-btn-outline:hover { border-color: #1a1a2e; }
  `;
  document.head.appendChild(s);
};

/* ─── helpers ─── */
const retentionColor = (r) => {
  if (r >= 0.8) return { bg: '#f0fdf4', text: '#16a34a' };
  if (r >= 0.5) return { bg: '#fefce8', text: '#ca8a04' };
  return { bg: '#fef2f2', text: '#dc2626' };
};

const retentionLabel = (r) => {
  if (r >= 0.8) return 'Strong';
  if (r >= 0.5) return 'Moderate';
  return 'Weak';
};

/* ─── LOADING STATE ─── */
function LoadingState() {
  return (
    <div style={s.center} className="study-page">
      <div style={{ textAlign: 'center' }}>
        <div style={s.loadingCard} />
        <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 24 }}>Preparing your session…</p>
      </div>
    </div>
  );
}

/* ─── EMPTY STATE ─── */
function EmptyState({ navigate }) {
  return (
    <div style={s.center} className="study-page">
      <div style={{ textAlign: 'center', animation: 'fadeUp .4s ease' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#1a1a2e' }}>
          All caught up!
        </h2>
        <p style={{ color: '#64748b', fontSize: 15, maxWidth: 320, margin: '0 auto 32px' }}>
          No cards are due right now. Come back later or check your other decks.
        </p>
        <button className="result-btn result-btn-primary" onClick={() => navigate('/decks')}>
          Back to Decks
        </button>
      </div>
    </div>
  );
}

/* ─── SUMMARY SCREEN ─── */
function SummaryScreen({ results, onRestart, navigate }) {
  const correct = results.filter(r => r.wasCorrect).length;
  const pct = Math.round((correct / results.length) * 100);
  const emoji = pct >= 80 ? '🔥' : pct >= 60 ? '👍' : '📖';

  return (
    <div style={s.summaryWrapper} className="study-page">
      <div style={s.summaryCard}>
        {/* Score */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{emoji}</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>
            Session Complete
          </h2>
          <div className="summary-score" style={{ fontSize: 56, fontWeight: 800, color: pct >= 80 ? '#16a34a' : pct >= 60 ? '#ca8a04' : '#dc2626', lineHeight: 1.1, marginBottom: 4 }}>
            {pct}%
          </div>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            {correct} of {results.length} cards correct
          </p>
        </div>

        {/* Per-card breakdown */}
        <div style={s.breakdownList}>
          {results.map((r, i) => {
            const rc = retentionColor(r.newRetention ?? 0);
            return (
              <div
                key={i}
                className="summary-card-row"
                style={{ ...s.breakdownRow, animationDelay: `${i * 0.05}s` }}
              >
                <span style={{ fontSize: 16 }}>{r.wasCorrect ? '✅' : '❌'}</span>
                <span style={{ flex: 1, fontSize: 14, color: '#1a1a2e', fontWeight: 500 }}>
                  {r.front}
                </span>
                <span className="retention-pill" style={{ background: rc.bg, color: rc.text }}>
                  {retentionLabel(r.newRetention ?? 0)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button className="result-btn result-btn-primary" style={{ flex: 1 }} onClick={onRestart}>
            Study Again
          </button>
          <button className="result-btn result-btn-outline" onClick={() => navigate('/analytics')}>
            View Analytics
          </button>
          <button className="result-btn result-btn-outline" onClick={() => navigate('/decks')}>
            Back to Decks
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                              */
/* ═══════════════════════════════════════════════════════════ */
export default function Study() {
  injectStyles();

  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cards, setCards]         = useState([]);
  const [index, setIndex]         = useState(0);
  const [flipped, setFlipped]     = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [phase, setPhase]         = useState('study'); // 'study' | 'summary'
  const [results, setResults]     = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null); // 'correct' | 'wrong' | null

  const startTimeRef = useRef(null);

  const card = cards[index];

  const init = async () => {
    if (!deckId || !user?.id) return;
    try {
      setLoading(true);
      setCards([]);
      setIndex(0);
      setSessionId(null);
      setFlipped(false);
      setResults([]);
      setLastResult(null);
      setPhase('study');

      const sessionRes = await sessionsAPI.start(user.id, deckId);
      setSessionId(sessionRes.data.id);

      const dueRes = await sessionsAPI.getDueCards(deckId);
      const rawCards = dueRes?.data?.cards || dueRes?.data || [];
      setCards(rawCards);
    } catch (err) {
      console.error('Study init error:', err);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { init(); }, [deckId, user?.id]);

  // Track when card appears so we can measure response time
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [index, flipped]);

  const handleFlip = () => {
    setFlipped(f => !f);
    // Start timing from when the answer is revealed
    if (!flipped) startTimeRef.current = Date.now();
  };

  const submit = async (wasCorrect) => {
    if (!sessionId || !card || submitting) return;
    setSubmitting(true);
    setLastResult(wasCorrect ? 'correct' : 'wrong');

    const responseTimeMs = Date.now() - (startTimeRef.current ?? Date.now());

    let newRetention = null;
    try {
      const res = await sessionsAPI.review(
        sessionId,
        card.id,
        wasCorrect,
        responseTimeMs
      );
      newRetention = res?.data?.new_retention ?? null;
    } catch (err) {
      console.error('Review error:', err);
    }

    // Record result for summary
    setResults(prev => [...prev, {
      front: card.front,
      wasCorrect,
      newRetention,
    }]);

    const next = index + 1;

    if (next >= cards.length) {
      // End session then show summary
      try { await sessionsAPI.end(sessionId); } catch (_) {}
      setPhase('summary');
    } else {
      setTimeout(() => {
        setIndex(next);
        setFlipped(false);
        setLastResult(null);
        setSubmitting(false);
      }, 350);
      return;
    }

    setSubmitting(false);
  };

  /* ── RENDER STATES ── */
  if (loading) return <LoadingState />;

  if (!cards.length) return <EmptyState navigate={navigate} />;

  if (phase === 'summary') {
    return (
      <SummaryScreen
        results={results}
        onRestart={init}
        navigate={navigate}
      />
    );
  }

  if (!card) return null;

  const progress = ((index) / cards.length) * 100;

  /* ── STUDY UI ── */
  return (
    <div style={s.wrapper} className="study-page">

      {/* ── TOP BAR ── */}
      <div style={s.topBar}>
        <button
          style={s.backBtn}
          onClick={() => navigate('/decks')}
        >
          ← Decks
        </button>

        {/* Progress bar */}
        <div style={s.progressBg}>
          <div
            style={{
              ...s.progressFill,
              width: `${progress}%`,
              transition: 'width .5s ease',
            }}
          />
        </div>

        <span style={s.counter}>
          {index + 1} <span style={{ color: '#94a3b8' }}>/ {cards.length}</span>
        </span>
      </div>

      {/* ── CARD ── */}
      <div
        style={{
          ...s.cardScene,
          filter: lastResult === 'correct'
            ? 'drop-shadow(0 0 24px rgba(22,163,74,0.4))'
            : lastResult === 'wrong'
            ? 'drop-shadow(0 0 24px rgba(220,38,38,0.35))'
            : 'none',
          transition: 'filter .3s ease',
        }}
        className="card-scene"
        onClick={handleFlip}
      >
        <div className={`card-inner ${flipped ? 'flipped' : ''}`}>

          {/* FRONT */}
          <div className="card-face card-front-face">
            <span style={s.cardLabel}>QUESTION</span>
            <p style={s.cardTextFront}>{card.front}</p>
            <span className="hint-tap" style={s.tapHint}>
              tap to reveal answer
            </span>
          </div>

          {/* BACK */}
          <div className="card-face card-back-face">
            <span style={{ ...s.cardLabel, color: '#94a3b8' }}>ANSWER</span>
            <p style={s.cardTextBack}>{card.back}</p>
            {card.retention_score != null && (
              <div style={{ marginTop: 20 }}>
                <span
                  className="retention-pill"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  📊 Retention: {Math.round((card.retention_score ?? 0) * 100)}%
                </span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── BUTTONS — only show after flip ── */}
      <div style={{
        ...s.actions,
        opacity: flipped ? 1 : 0,
        transform: flipped ? 'translateY(0)' : 'translateY(10px)',
        pointerEvents: flipped ? 'auto' : 'none',
        transition: 'opacity .25s ease, transform .25s ease',
      }}>
        <button
          className="btn-wrong"
          style={s.actionBtn}
          onClick={(e) => { e.stopPropagation(); submit(false); }}
          disabled={submitting}
        >
          <span style={{ fontSize: 20 }}>✗</span>
          <span>Didn't know</span>
        </button>

        <button
          className="btn-flip"
          style={{ ...s.actionBtn, minWidth: 100 }}
          onClick={(e) => { e.stopPropagation(); handleFlip(); }}
        >
          ↩ Flip
        </button>

        <button
          className="btn-got"
          style={s.actionBtn}
          onClick={(e) => { e.stopPropagation(); submit(true); }}
          disabled={submitting}
        >
          <span style={{ fontSize: 20 }}>✓</span>
          <span>Got it</span>
        </button>
      </div>

      {/* ── HINT (before flip) ── */}
      {!flipped && (
        <p style={s.keyHint}>Press <kbd style={s.kbd}>Space</kbd> to flip</p>
      )}

    </div>
  );
}

/* ─── keyboard shortcut ─── */
// Attach globally via a tiny effect — done outside component to avoid re-renders
if (typeof window !== 'undefined') {
  window.__studyKeyHandler && window.removeEventListener('keydown', window.__studyKeyHandler);
}

/* ─── STYLES ─── */
const s = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    padding: '24px 20px',
    background: '#f8f9fe',
    position: 'relative',
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f9fe',
    padding: 24,
  },
  topBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '14px 24px',
    background: 'rgba(248,249,254,0.9)',
    backdropFilter: 'blur(10px)',
    zIndex: 10,
    borderBottom: '1px solid #e8e8f0',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif',
    padding: '4px 8px',
    borderRadius: 8,
    whiteSpace: 'nowrap',
  },
  progressBg: {
    flex: 1,
    height: 6,
    background: '#e2e8f0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
    borderRadius: 999,
    animation: 'progressFill .5s ease',
  },
  counter: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 14,
    fontWeight: 700,
    color: '#1a1a2e',
    whiteSpace: 'nowrap',
  },
  cardScene: {
    width: '100%',
    maxWidth: 540,
    height: 300,
    cursor: 'pointer',
    marginTop: 32,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: '#94a3b8',
    marginBottom: 16,
    fontFamily: 'DM Sans, sans-serif',
  },
  cardTextFront: {
    fontFamily: 'Fraunces, serif',
    fontSize: 26,
    fontWeight: 600,
    color: '#1a1a2e',
    lineHeight: 1.4,
    margin: 0,
  },
  cardTextBack: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 22,
    fontWeight: 500,
    color: '#f1f5f9',
    lineHeight: 1.5,
    margin: 0,
  },
  tapHint: {
    marginTop: 24,
    fontSize: 12,
    color: '#cbd5e1',
    fontFamily: 'DM Sans, sans-serif',
  },
  actions: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '13px 24px',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif',
    borderRadius: 14,
    cursor: 'pointer',
    minWidth: 140,
    justifyContent: 'center',
  },
  keyHint: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: 'DM Sans, sans-serif',
  },
  kbd: {
    background: '#e2e8f0',
    border: '1px solid #cbd5e1',
    borderRadius: 5,
    padding: '1px 6px',
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#475569',
  },
  loadingCard: {
    width: 480,
    height: 280,
    borderRadius: 24,
    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmerPulse 1.4s infinite',
  },
  summaryWrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f9fe',
    padding: 24,
  },
  summaryCard: {
    background: '#fff',
    borderRadius: 24,
    border: '1.5px solid #e8e8f0',
    padding: 40,
    width: '100%',
    maxWidth: 560,
    boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
    animation: 'fadeUp .4s ease',
  },
  breakdownList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 300,
    overflowY: 'auto',
    paddingRight: 4,
  },
  breakdownRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    borderRadius: 10,
    background: '#f8f9fe',
    border: '1px solid #e8e8f0',
  },
};
