/* global React */

function Navbar({ view, onNav, username }) {
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
        {view === 'shoot'
          ? <span className="navbar__username">@{username}</span>
          : <div className="navbar__avatar">{username[0].toUpperCase()}</div>
        }
      </div>
    </nav>
  );
}

window.Navbar = Navbar;
