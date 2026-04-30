/* global React */

function Navbar({ view, onNav, username, onLogout }) {
  return (
    <nav className="navbar">
      <span className="navbar__brand" onClick={() => onNav('feed')}>exposr</span>
      <div className="navbar__links">
        {['shoot', 'feed', 'album', 'friends'].map((v) => (
          <button
            key={v}
            className={`navbar__link${view === v ? ' navbar__link--active' : ''}`}
            onClick={() => onNav(v)}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="navbar__user">
        <span className="navbar__username">@{username}</span>
        <button className="navbar__logout" onClick={onLogout}>log out</button>
      </div>
    </nav>
  );
}

window.Navbar = Navbar;
