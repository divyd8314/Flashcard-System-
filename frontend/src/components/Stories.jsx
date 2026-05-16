import '../App.css'; // imports .stories-track-wrap and @keyframes marquee

const STORIES = [
  {
    text: '"Went from failing practice exams to acing my med school boards. The urgency engine is a game changer."',
    name: 'Jordan K.',
    role: 'Medical student, Year 2',
    initials: 'JK',
    color: { bg: '#dbeafe', fg: '#1d4ed8' },
  },
  {
    text: '"I\'ve tried every flashcard app. FlashLearn is the first one that actually made me feel like I was making progress."',
    name: 'Sarah M.',
    role: 'Law student',
    initials: 'SM',
    color: { bg: '#dcfce7', fg: '#15803d' },
  },
  {
    text: '"The streak feature keeps me accountable. 45 days in and my retention scores went from 61% to 89%."',
    name: 'Tyler C.',
    role: 'MCAT Prep',
    initials: 'TC',
    color: { bg: '#fef3c7', fg: '#b45309' },
  },
  {
    text: '"Switched from competitor after 3 years. Took one day to migrate, and I haven\'t looked back."',
    name: 'Aisha L.',
    role: 'PhD candidate',
    initials: 'AL',
    color: { bg: '#fce7f3', fg: '#be185d' },
  },
  {
    text: '"The analytics show exactly which topics need more work. I stopped wasting time on cards I already know."',
    name: 'Ravi M.',
    role: 'Software engineering prep',
    initials: 'RM',
    color: { bg: '#ede9fe', fg: '#6d28d9' },
  },
  {
    text: '"Set my exam date and the app completely restructured my review schedule. Felt like having a personal tutor."',
    name: 'Emma C.',
    role: 'Nursing student',
    initials: 'EC',
    color: { bg: '#fce7f3', fg: '#be185d' },
  },
];

export default function Stories() {
  return (
    <section style={styles.section}>

      {/* Section header — constrained to normal page width */}
      <div style={styles.header}>
  <p className="section-label">What learners say</p>

  <h2 style={styles.title}>
    Real results, real students.
  </h2>
</div>

      {/* Marquee wrapper — full bleed (no max-width) */}
      <div className="stories-track-wrap">
        <div className="stories-track">
          {/* Render STORIES twice for the seamless loop */}
          {[...STORIES, ...STORIES].map((s, i) => (
            <Bubble key={i} story={s} />
          ))}
        </div>
      </div>

    </section>
  );
}

/* ── BUBBLE ──────────────────────────────────────────────
   Each testimonial card. Receives a `story` object as prop.
──────────────────────────────────────────────────────────── */
function Bubble({ story }) {
  return (
    <div style={styles.bubble}>
      <p style={styles.bubbleText}>{story.text}</p>
      <div style={styles.author}>
        {/* Avatar circle */}
        <div style={{
          ...styles.avatar,
          background: story.color.bg,
          color: story.color.fg,
        }}>
          {story.initials}
        </div>
        <div>
          <div style={styles.name}>{story.name}</div>
          <div style={styles.role}>{story.role}</div>
        </div>
      </div>
    </div>
  );
}



const styles = {
  section: {
    background: 'var(--surface)',
    padding: '80px 0',
    overflow: 'hidden',
  },
  header: {
    maxWidth: 900,
    margin: '0 auto 50px',
    padding: '0 24px',
    textAlign: 'center',
  },
  bubble: {
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '20px 24px',
    minWidth: 280,
    maxWidth: 320,
    flexShrink: 0,
  },
  bubbleText: {
    fontSize: 14,
    color: 'var(--text)',
    lineHeight: 1.6,
    marginBottom: 14,
  },
  author: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    fontFamily: 'Sora, sans-serif',
    flexShrink: 0,
  },
  name: {
    fontSize: 13,
    fontWeight: 600,
  },
  role: {
    fontSize: 12,
    color: 'var(--muted)',
  },
};
