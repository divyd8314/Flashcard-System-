/*
  ============================================================
  HowItWorks.jsx
  ============================================================

  3 clickable step cards. The active card gets a blue border
  and reveals a bonus detail line.

  Key concepts:
  ─────────────────────────────────────────────────────────
  • useState  → React's way of storing local UI state.
                `activeStep` tracks which card is selected.
                When you call setActiveStep(i), React
                re-renders the component with the new value.

    const [activeStep, setActiveStep] = useState(0);
    //     ^ current value  ^ setter fn   ^ initial value

  • Conditional className  → we dynamically add a CSS class
    based on state:
      style={{ borderColor: activeStep === i ? 'var(--blue)' : 'var(--border)' }}

  • id="how" → anchor target for the hero "See how it works" link
  ============================================================
*/

import { useState } from 'react';

const STEPS = [
  {
    num: '1',
    title: 'Create your deck',
    desc: 'Add cards manually or paste in notes. Organize by subject and tag your exam date.',
    detail: '✓ Supports rich text, images, and LaTeX math',
  },
  {
    num: '2',
    title: 'Study with the algorithm',
    desc: 'FlashLearn queues the right cards at the right time. You just show up and review.',
    detail: '✓ Average session: 12 minutes per day',
  },
  {
    num: '3',
    title: 'Track your retention',
    desc: 'See your forgetting curves flatten as long-term memory locks in over time.',
    detail: '✓ Full analytics dashboard included',
  },
];

export default function HowItWorks() {
  // useState(0) means card index 0 is active by default
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how" className="section" style={{ background: '#fff' }}>
      <div className="section-inner">

        <p className="section-label">How it works</p>
        <h2 className="section-title">Three steps to mastery.</h2>

        <div style={styles.grid}>

          {/* Dashed connector line behind the cards */}
          <div style={styles.connector} />

          {STEPS.map((step, i) => {
            const isActive = activeStep === i;

            return (
              <div
                key={step.num}
                className="card"  /* base card styles from index.css */
                style={{
                  ...styles.card,
                  borderColor: isActive ? 'var(--blue)' : 'var(--border)',
                  boxShadow:   isActive ? '0 8px 32px rgba(37,99,235,.12)' : 'none',
                  background:  isActive ? '#fff' : 'var(--surface)',
                  /* override the .card hover transform since we handle it via state */
                  transform: 'none',
                }}
                onClick={() => setActiveStep(i)}
              >
                {/* Numbered badge */}
                <div style={{
                  ...styles.numBadge,
                  background: isActive ? 'var(--blue)' : 'var(--surface2)',
                  color:       isActive ? '#fff'         : 'var(--muted)',
                }}>
                  {step.num}
                </div>

                <h3 style={styles.title}>{step.title}</h3>
                <p style={styles.desc}>{step.desc}</p>

                {/* Only shown when this card is active */}
                {isActive && (
                  <p style={styles.detail}>{step.detail}</p>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 32,
    marginTop: 56,
    position: 'relative', /* needed so the connector line positions relative to this */
  },
  /* Dashed line connecting the 3 steps visually */
  connector: {
    position: 'absolute',
    top: 36,
    left: 'calc(16.67% + 24px)',
    right: 'calc(16.67% + 24px)',
    height: 1.5,
    backgroundImage: 'repeating-linear-gradient(90deg, var(--blue) 0, var(--blue) 8px, transparent 8px, transparent 20px)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  card: {
    padding: 32,
    cursor: 'pointer',
    position: 'relative',
    zIndex: 1,
    transition: 'border-color .25s, box-shadow .25s, background .25s',
  },
  numBadge: {
    width: 42,
    height: 42,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Sora, sans-serif',
    fontWeight: 800,
    fontSize: 16,
    marginBottom: 20,
    transition: 'background .25s, color .25s',
  },
  title: {
    fontSize: 17,
    fontWeight: 700,
    marginBottom: 10,
  },
  desc: {
    fontSize: 14,
    color: 'var(--muted)',
    lineHeight: 1.6,
  },
  detail: {
    marginTop: 14,
    fontSize: 13,
    color: 'var(--blue)',
    fontWeight: 600,
  },
};
