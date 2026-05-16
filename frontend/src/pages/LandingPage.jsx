/*
  ============================================================
  LandingPage.jsx
  ============================================================

  The public homepage. Composes all landing page sections
  together in order. This file is intentionally thin —
  all logic and styling lives inside each component.

  The paddingTop: 80 accounts for the sticky header's
  height (64px) plus a little breathing room, so the hero
  content doesn't start behind the header.
  ============================================================
*/

import Hero       from '../components/Hero';
import Features   from '../components/Features';
import HowItWorks from '../components/HowitWorks';
import Stories    from '../components/Stories';
import FAQ        from '../components/FAQ';
import CTA        from '../components/CTA.jsx';

export default function LandingPage() {
  return (
    <div style={{ paddingTop: 80 }}>
      <Hero />
      <Features />
      <HowItWorks />
      <Stories />
      <FAQ />
      <CTA />
    </div>
  );
}
