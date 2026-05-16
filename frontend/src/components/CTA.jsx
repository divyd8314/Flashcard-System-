/*
  ============================================================
  CTA.jsx — Final Call to Action + Footer
  ============================================================

  The closing punch of the landing page. Blue background,
  big headline, signup button, then the footer.

  Key concepts:
  ─────────────────────────────────────────────────────────
  • useNavigate() → navigate to /signup on button click

  • We include the Footer here since it's closely tied to
    the bottom of the landing page. You could split it into
    its own Footer.jsx if the app grows.

  • .btn-white → white button on blue background.
    Defined in index.css. This is a good example of why
    having a design system pays off — we just add a class
    and get the right look without writing new CSS.
  ============================================================
*/

import { useNavigate } from 'react-router-dom';

export default function CTA() {
  const navigate = useNavigate();

  return (
    <>
      {/* ── BLUE CTA BANNER ── */}
      <section style={styles.section}>
        <div style={styles.inner}>

          <h2 style={styles.heading}>
            Ready to actually remember<br />what you study?
          </h2>

          <p style={styles.sub}>
            Join thousands of students using FlashLearn to build real, lasting
            knowledge — not just cramming the night before.
          </p>

          <button
            className="btn btn-white btn-xl"
            onClick={() => navigate('/signup')}
          >
            Create your free account
          </button>

          <p style={styles.note}>
            No credit card required · Free forever plan available
          </p>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>FlashLearn</div>

        <div style={styles.footerLinks}>
          <a href="#" style={styles.footerLink}>Privacy</a>
          <a href="#" style={styles.footerLink}>Terms</a>
          <a href="#" style={styles.footerLink}>Contact</a>
          <a href="#" style={styles.footerLink}>Status</a>
        </div>

        <span style={styles.footerCopy}>© 2025 FlashLearn</span>
      </footer>
    </>
  );
}

const styles = {
  section: {
    background: 'var(--blue)',
    padding: '100px 40px',
  },
  inner: {
    maxWidth: 680,
    margin: '0 auto',
    textAlign: 'center',
  },
  heading: {
    fontSize: 'clamp(36px, 5vw, 54px)',
    fontWeight: 800,
    color: '#fff',
    marginBottom: 18,
    lineHeight: 1.1,
  },
  sub: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 40,
    lineHeight: 1.65,
  },
  note: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 16,
  },
  footer: {
    background: 'var(--text)',
    padding: '32px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  footerLogo: {
    fontFamily: 'Sora, sans-serif',
    fontWeight: 800,
    color: '#fff',
    fontSize: 17,
    letterSpacing: '-0.03em',
  },
  footerLinks: {
    display: 'flex',
    gap: 20,
  },
  footerLink: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  footerCopy: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
  },
};
