/*
  ============================================================
  FAQ.jsx — Accordion FAQ
  ============================================================

  Clicking a question expands its answer. Only one answer
  is open at a time (accordion behavior).

  Key concepts:
  ─────────────────────────────────────────────────────────
  • useState with null:
      const [open, setOpen] = useState(null);
      `null` means nothing is open initially.
      When a question is clicked, we set open = its index.
      Clicking the open one sets it back to null (closes it).

  • Accordion toggle logic:
      setOpen(open === i ? null : i)
      — if i is already open, close it (null)
      — otherwise open i

  • max-height animation trick:
      You can't CSS-animate height: auto.
      The workaround: animate max-height from 0 to a large
      value (like 300px). The content expands naturally up
      to its real height and the transition looks smooth.

  • id="faq" → anchor target
  ============================================================
*/

import { useState } from 'react';

const FAQS = [
  {
    q: 'How is FlashLearn different from Anki?',
    a: 'FlashLearn has a modern UI, built-in analytics, and an exam urgency engine that Anki lacks. We handle scheduling complexity so you can focus on studying — not configuring plugins.',
  },
  {
    q: 'Is FlashLearn free to use?',
    a: 'Yes — you can create unlimited decks and cards on the free plan. Premium features like advanced analytics and exam urgency scheduling are available on paid plans.',
  },
  {
    q: 'Can I import my existing Anki decks?',
    a: 'Anki import is on our roadmap and coming soon. In the meantime, you can create decks manually or paste in content from any source.',
  },
  {
    q: 'What is the exam urgency algorithm?',
    a: 'When you set an exam date, FlashLearn calculates how many cards to review per day and reprioritizes your queue to ensure full coverage before your exam — automatically adjusting if you miss a day.',
  },
  {
    q: 'Does FlashLearn work on mobile?',
    a: 'Our web app is fully mobile-responsive. Dedicated iOS and Android apps are planned for a future release.',
  },
];

export default function FAQ() {
  // null = nothing open; a number = that index is open
  const [open, setOpen] = useState(null);

  const toggle = (i) => setOpen(open === i ? null : i);

  return (
    <section id="faq" className="section" style={{ background: '#fff' }}>
      <div className="section-inner">

        <p className="section-label">FAQ</p>
        <h2 className="section-title">Questions answered.</h2>

        <div style={styles.list}>
          {FAQS.map((faq, i) => {
            const isOpen = open === i;

            return (
              <div
                key={i}
                style={{
                  ...styles.item,
                  borderColor: isOpen ? '#93c5fd' : 'var(--border)',
                }}
              >
                {/* Question row — clicking toggles open state */}
                <button style={styles.questionBtn} onClick={() => toggle(i)}>
                  <span style={styles.questionText}>{faq.q}</span>

                  {/* Plus/X icon — rotates when open */}
                  <span style={{
                    ...styles.icon,
                    background:  isOpen ? 'var(--blue)' : 'var(--surface2)',
                    color:       isOpen ? '#fff'        : 'var(--muted)',
                    transform:   isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}>
                    +
                  </span>
                </button>

                {/* Answer — max-height trick for smooth expand/collapse */}
                <div style={{
                  ...styles.answer,
                  maxHeight: isOpen ? 300 : 0,
                  paddingBottom: isOpen ? 20 : 0,
                }}>
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

const styles = {
  list: {
    maxWidth: 680,
    marginTop: 48,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  item: {
    border: '1px solid',
    borderRadius: 12,
    overflow: 'hidden',
    transition: 'border-color .2s',
  },
  questionBtn: {
    width: '100%',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    gap: 12,
    textAlign: 'left',
  },
  questionText: {
    fontWeight: 600,
    fontSize: 16,
    color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif',
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: 16,
    transition: 'all .25s',
    fontFamily: 'monospace',
  },
  answer: {
    overflow: 'hidden',
    transition: 'max-height .3s ease, padding-bottom .3s ease',
    fontSize: 15,
    color: 'var(--muted)',
    lineHeight: 1.65,
    padding: '0 24px',
  },
};
