/* global React */

function App() {
  return (
    <div className="page">
      <header className="nav">
        <div className="nav__brand">exposr</div>
        <nav className="nav__links">
          <a href="#features">Features</a>
          <a href="#demo">Demo</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero__inner">
          <h1 className="hero__title">Capture polaroid-style moments, instantly</h1>
          <p className="hero__subtitle">A lightweight photo booth web UI for events and pop-ups.</p>
          <p>
            <a className="btn" href="#demo">Try the demo</a>
          </p>
        </div>
      </section>

      <section id="features" className="features">
        <h2>Features</h2>
        <ul>
          <li>Polaroid-style frames and filters</li>
          <li>Share or download prints</li>
          <li>Easy setup for events</li>
        </ul>
      </section>

      <section id="demo" className="demo">
        <h2>Live demo</h2>
        <p>Insert camera capture or demo controls here.</p>
      </section>

      <footer id="contact" className="site-footer">
        <small>© {new Date().getFullYear()} exposr — built for quick demos</small>
      </footer>
    </div>
  );
}

// expose globally for in-browser scripts
window.App = App;
