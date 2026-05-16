import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { decksAPI, cardsAPI } from '../api/client';

export default function Decks() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [decks, setDecks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [expandedDeck, setExpandedDeck] = useState(null); // deck_id that's open
  const [deckCards, setDeckCards]   = useState({});        // { deck_id: [cards] }
  const [showNewDeck, setShowNewDeck] = useState(false);

  // Load all decks on mount
  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    decksAPI.getAll(user.id)
      .then(res => { if (mounted) { setDecks(res.data); setLoading(false); } })
      .catch(() => { if (mounted) { setError('Failed to load decks.'); setLoading(false); } });
    return () => { mounted = false; };
  }, [user?.id]);

  // Load cards when a deck is expanded
  const expandDeck = async (deckId) => {
    if (expandedDeck === deckId) { setExpandedDeck(null); return; }
    setExpandedDeck(deckId);
    if (deckCards[deckId]) return; // already loaded
    try {
      const res = await cardsAPI.getByDeck(deckId);
      setDeckCards(prev => ({ ...prev, [deckId]: res.data }));
    } catch {
      setDeckCards(prev => ({ ...prev, [deckId]: [] }));
    }
  };

  const handleDeleteDeck = async (deckId) => {
    if (!confirm('Delete this deck and all its cards?')) return;
    await decksAPI.delete(deckId);
    setDecks(prev => prev.filter(d => d.id !== deckId));
  };

  const handleDeleteCard = async (deckId, cardId) => {
    await cardsAPI.delete(cardId);
    setDeckCards(prev => ({
      ...prev,
      [deckId]: prev[deckId].filter(c => c.id !== cardId),
    }));
  };

  const handleDeckCreated = (newDeck) => {
    setDecks(prev => [newDeck, ...prev]);
    setShowNewDeck(false);
  };

  const handleCardCreated = (deckId, newCard) => {
    setDeckCards(prev => ({
      ...prev,
      [deckId]: [...(prev[deckId] || []), newCard],
    }));
  };

  if (loading) return <div className="page"><p style={{ color: 'var(--muted)' }}>Loading decks…</p></div>;

  return (
    <div className="page">

      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>Your Decks</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>{decks.length} deck{decks.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNewDeck(true)}>
          + New Deck
        </button>
      </div>

      {error && <p style={{ color: '#ef4444', marginBottom: 20 }}>{error}</p>}

      {/* New Deck Modal */}
      {showNewDeck && (
        <NewDeckForm
          userId={user.id}
          onCreated={handleDeckCreated}
          onClose={() => setShowNewDeck(false)}
        />
      )}

      {/* Empty state */}
      {decks.length === 0 && !showNewDeck && (
        <div style={styles.empty}>
          <span style={{ fontSize: 48 }}>🗂️</span>
          <h3 style={styles.emptyTitle}>No decks yet</h3>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>Create your first deck to start studying.</p>
          <button className="btn btn-primary btn-lg" onClick={() => setShowNewDeck(true)}>
            Create a deck
          </button>
        </div>
      )}

      {/* Deck list */}
      <div style={styles.deckList}>
        {decks.map(deck => (
          <DeckRow
            key={deck.id}
            deck={deck}
            isExpanded={expandedDeck === deck.id}
            cards={deckCards[deck.id]}
            onExpand={() => expandDeck(deck.id)}
            onDelete={() => handleDeleteDeck(deck.id)}
            onDeleteCard={(cardId) => handleDeleteCard(deck.id, cardId)}
            onCardCreated={(card) => handleCardCreated(deck.id, card)}
            onStudy={() => navigate(`/study/${deck.id}`)}
          />
        ))}
      </div>

    </div>
  );
}

/* ── NEW DECK FORM ─────────────────────────────────────── */
function NewDeckForm({ userId, onCreated, onClose }) {
  const [title, setTitle]     = useState('');
  const [subject, setSubject] = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await decksAPI.create(userId, { title, subject });
      onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create deck.');
      setSaving(false);
    }
  };

  return (
    <div style={styles.formCard}>
      <h3 style={{ fontWeight: 700, marginBottom: 16 }}>New Deck</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          placeholder="Deck title (e.g. Cell Biology)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={styles.input}
          required
          autoFocus
        />
        <input
          placeholder="Subject (optional)"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          style={styles.input}
        />
        {error && <p style={{ fontSize: 13, color: '#ef4444' }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create deck'}
          </button>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

/* ── DECK ROW ──────────────────────────────────────────── */
function DeckRow({ deck, isExpanded, cards, onExpand, onDelete, onDeleteCard, onCardCreated, onStudy }) {
  const [showAddCard, setShowAddCard] = useState(false);

  return (
    <div style={styles.deckCard}>
      {/* Deck header row */}
      <div style={styles.deckHeader} onClick={onExpand}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={styles.deckTitle}>{deck.title}</h3>
            {deck.subject && <span style={styles.subjectChip}>{deck.subject}</span>}
          </div>
          {deck.exam_date && (
            <p style={styles.examDate}>
              📅 Exam: {new Date(deck.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
          <button
            className="btn btn-primary"
            style={{ fontSize: 13, padding: '7px 14px' }}
            onClick={onStudy}
          >
            Study
          </button>
          <button
            className="btn btn-outline"
            style={{ fontSize: 13, padding: '7px 14px', color: '#ef4444', borderColor: '#fecaca' }}
            onClick={onDelete}
          >
            Delete
          </button>
          <span style={{ ...styles.chevron, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▾
          </span>
        </div>
      </div>

      {/* Expanded card list */}
      {isExpanded && (
        <div style={styles.cardList}>
          <div style={styles.cardListHeader}>
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
              {cards?.length ?? 0} card{cards?.length !== 1 ? 's' : ''}
            </span>
            <button
              className="btn btn-outline"
              style={{ fontSize: 12, padding: '5px 12px' }}
              onClick={() => setShowAddCard(v => !v)}
            >
              {showAddCard ? 'Cancel' : '+ Add card'}
            </button>
          </div>

          {showAddCard && (
            <AddCardForm
              deckId={deck.id}
              onCreated={(card) => { onCardCreated(card); setShowAddCard(false); }}
            />
          )}

          {cards === undefined && (
            <p style={{ fontSize: 13, color: 'var(--muted)', padding: '12px 0' }}>Loading cards…</p>
          )}

          {cards?.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--muted)', padding: '12px 0' }}>No cards yet. Add your first one above.</p>
          )}

          {cards?.map(card => (
            <div key={card.id} style={styles.cardRow}>
              <div style={{ flex: 1 }}>
                <p style={styles.cardFront}>{card.front}</p>
                <p style={styles.cardBack}>{card.back}</p>
              </div>
              <button
                style={styles.deleteBtn}
                onClick={() => onDeleteCard(card.id)}
                title="Delete card"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── ADD CARD FORM ─────────────────────────────────────── */
function AddCardForm({ deckId, onCreated }) {
  const [front, setFront]   = useState('');
  const [back, setBack]     = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await cardsAPI.create(deckId, front, back);
      onCreated(res.data);
      setFront(''); setBack('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add card.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.addCardForm}>
      <input
        placeholder="Front (question)"
        value={front}
        onChange={e => setFront(e.target.value)}
        style={styles.input}
        required
        autoFocus
      />
      <input
        placeholder="Back (answer)"
        value={back}
        onChange={e => setBack(e.target.value)}
        style={styles.input}
        required
      />
      {error && <p style={{ fontSize: 12, color: '#ef4444' }}>{error}</p>}
      <button type="submit" className="btn btn-primary" style={{ fontSize: 13 }} disabled={saving}>
        {saving ? 'Adding…' : 'Add card'}
      </button>
    </form>
  );
}

const styles = {
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 4 },
  formCard: { background: 'var(--blue-light)', border: '1px solid var(--blue-mid)', borderRadius: 14, padding: 24, marginBottom: 24 },
  input: { padding: '10px 14px', fontSize: 14, border: '1.5px solid var(--border)', borderRadius: 10, outline: 'none', fontFamily: 'DM Sans, sans-serif', color: 'var(--text)', background: '#fff', width: '100%', boxSizing: 'border-box' },
  empty: { textAlign: 'center', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 700 },
  deckList: { display: 'flex', flexDirection: 'column', gap: 12 },
  deckCard: { background: '#fff', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' },
  deckHeader: { padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'background .15s' },
  deckTitle: { fontSize: 17, fontWeight: 700 },
  subjectChip: { background: 'var(--blue-light)', color: 'var(--blue)', fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 999 },
  examDate: { fontSize: 12, color: 'var(--muted)', marginTop: 4 },
  chevron: { fontSize: 18, color: 'var(--muted)', transition: 'transform .2s', display: 'inline-block' },
  cardList: { borderTop: '1px solid var(--border)', padding: '16px 24px', background: 'var(--surface)' },
  cardListHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardRow: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' },
  cardFront: { fontSize: 14, fontWeight: 600, marginBottom: 3 },
  cardBack: { fontSize: 13, color: 'var(--muted)' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14, padding: '4px 6px', borderRadius: 6, flexShrink: 0 },
  addCardForm: { display: 'flex', flexDirection: 'column', gap: 10, background: '#fff', border: '1px solid var(--blue-mid)', borderRadius: 10, padding: 16, marginBottom: 12 },
};
