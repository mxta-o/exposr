/* global React */

function App() {
  React.useEffect(() => {
    let rafId = null;

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const leakShift = Math.min(1, y / 800);
        document.documentElement.style.setProperty('--scrollY', String(y));
        document.documentElement.style.setProperty('--leakShift', String(leakShift));
        rafId = null;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="page">
      <div className="grain" aria-hidden="true" />
      <div className="light-leaks" aria-hidden="true">
        <span className="leak leak--left" />
        <span className="leak leak--right" />
        <span className="leak leak--bottom" />
      </div>

      <header className="nav">
        <div className="nav__brand">exposr</div>
        <nav className="nav__links">
          <a href="#manifesto">Manifesto</a>
          <a href="#features">Features</a>
          <a href="#strips">Strips</a>
          <a href="#cta">Enter</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Photobooth social</p>
          <h1 className="hero__title">Real light. Real moments. No polish.</h1>
          <p className="hero__subtitle">
            Exposr is a photobooth-style social app that celebrates the unfiltered.
            Ten shots a week, developing rolls, and honest frames.
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#cta">Enter Exposr</a>
            <a className="btn btn--ghost" href="#features">See the roll</a>
          </div>
          <div className="hero__meta">
            <span>10 photos / week</span>
            <span>Developing rolls</span>
            <span>VSCO-style grains</span>
          </div>
        </div>

        <div className="hero__stack" aria-hidden="true">
          <figure className="polaroid polaroid--one">
            <div className="polaroid__photo" />
            <figcaption>Kitchen glow</figcaption>
          </figure>
          <figure className="polaroid polaroid--two">
            <div className="polaroid__photo" />
            <figcaption>Midnight bus</figcaption>
          </figure>
          <figure className="polaroid polaroid--three">
            <div className="polaroid__photo" />
            <figcaption>Quiet street</figcaption>
          </figure>
        </div>
      </section>

      <section id="manifesto" className="manifesto">
        <p>
          We designed Exposr for the in-between moments. The roll develops later, so you
          stop chasing likes and start chasing feeling.
        </p>
      </section>

      <section id="features" className="features">
        <div className="features__grid">
          <div className="feature">
            <h3>Developing rolls</h3>
            <p>Upload a 10-shot roll each week. Anticipation is the point.</p>
          </div>
          <div className="feature">
            <h3>Analog filters</h3>
            <p>Subtle grain, light leaks, and faded highlights — no plastic gloss.</p>
          </div>
          <div className="feature">
            <h3>Authenticity first</h3>
            <p>Photos only. No vanity metrics. Just moments that feel human.</p>
          </div>
          <div className="feature">
            <h3>AI moderation</h3>
            <p>Quiet, careful safety checks for reported posts — always human-first.</p>
          </div>
        </div>
      </section>

      <section id="strips" className="strips">
        <div className="strip strip--left">
          <div className="strip__frame" />
          <div className="strip__frame" />
          <div className="strip__frame" />
        </div>
        <div className="strip strip--right">
          <div className="strip__frame" />
          <div className="strip__frame" />
          <div className="strip__frame" />
        </div>
        <div className="strip strip--left">
          <div className="strip__frame" />
          <div className="strip__frame" />
          <div className="strip__frame" />
        </div>
      </section>

      <section id="cta" className="cta">
        <h2>Enter Exposr</h2>
        <p>Join the roll and keep it real.</p>
        <div className="hero__actions">
          <a className="btn btn--primary" href="#">Launch App</a>
          <a className="btn btn--ghost" href="#">Enter Exposr</a>
        </div>
      </section>

      <footer className="site-footer">
        <small>© {new Date().getFullYear()} Exposr. Real moments, no polish.</small>
      </footer>
    </div>
  );
}

// expose globally for in-browser scripts
window.App = App;
