/* global React, ReactDOM */
const { useState, useEffect, useMemo } = React;

const API = 'http://localhost:3001/api';

const DEMO_USER = { username: 'arianacruz', email: 'demo@exposr.app' };

const LIGHT_LEAKS = [
  'radial-gradient(ellipse at 96% 4%,  rgba(255,158,55,0.28) 0%, transparent 52%)',
  'radial-gradient(ellipse at 4%  92%, rgba(255,80,40,0.20)  0%, transparent 48%)',
  'radial-gradient(ellipse at 2%  3%,  rgba(255,220,72,0.22) 0%, transparent 54%)',
  'radial-gradient(ellipse at 98% 52%, rgba(255,135,72,0.22) 0%, transparent 50%)',
];

const DEMO_FEED = [
  { id: 100, username: 'arianacruz', url: 'https://picsum.photos/seed/me1/300/400' },
  { id: 101, username: 'arianacruz', url: 'https://picsum.photos/seed/me2/300/400' },
  { id: 102, username: 'arianacruz', url: 'https://picsum.photos/seed/me3/300/400' },
  { id: 1,  username: 'maya.film',   url: 'https://picsum.photos/seed/ex1/300/400'  },
  { id: 2,  username: 'maya.film',   url: 'https://picsum.photos/seed/ex2/300/400'  },
  { id: 3,  username: 'maya.film',   url: 'https://picsum.photos/seed/ex3/300/400'  },
  { id: 4,  username: 'maya.film',   url: 'https://picsum.photos/seed/ex4/300/400'  },
  { id: 5,  username: 'maya.film',   url: 'https://picsum.photos/seed/ex5/300/400'  },
  { id: 6,  username: 'maya.film',   url: 'https://picsum.photos/seed/ex6/300/400'  },
  { id: 7,  username: 'j.reel',      url: 'https://picsum.photos/seed/ex7/300/400'  },
  { id: 8,  username: 'j.reel',      url: 'https://picsum.photos/seed/ex8/300/400'  },
  { id: 9,  username: 'j.reel',      url: 'https://picsum.photos/seed/ex9/300/400'  },
  { id: 10, username: 'j.reel',      url: 'https://picsum.photos/seed/ex10/300/400' },
  { id: 11, username: 'j.reel',      url: 'https://picsum.photos/seed/ex11/300/400' },
  { id: 12, username: 'j.reel',      url: 'https://picsum.photos/seed/ex12/300/400' },
  { id: 13, username: 'sam.captures',url: 'https://picsum.photos/seed/ex13/300/400' },
  { id: 14, username: 'sam.captures',url: 'https://picsum.photos/seed/ex14/300/400' },
  { id: 15, username: 'sam.captures',url: 'https://picsum.photos/seed/ex15/300/400' },
  { id: 16, username: 'sam.captures',url: 'https://picsum.photos/seed/ex16/300/400' },
  { id: 17, username: 'sam.captures',url: 'https://picsum.photos/seed/ex17/300/400' },
  { id: 18, username: 'noa.shoots',  url: 'https://picsum.photos/seed/ex18/300/400' },
  { id: 19, username: 'noa.shoots',  url: 'https://picsum.photos/seed/ex19/300/400' },
  { id: 20, username: 'noa.shoots',  url: 'https://picsum.photos/seed/ex20/300/400' },
  { id: 21, username: 'noa.shoots',  url: 'https://picsum.photos/seed/ex21/300/400' },
  { id: 22, username: 'rio.lens',    url: 'https://picsum.photos/seed/ex22/300/400' },
  { id: 23, username: 'rio.lens',    url: 'https://picsum.photos/seed/ex23/300/400' },
  { id: 24, username: 'rio.lens',    url: 'https://picsum.photos/seed/ex24/300/400' },
];

const DEMO_DEVELOPING = [
  { id: 'd1', time: 'today 9:42am' },
  { id: 'd2', time: 'today 9:38am' },
  { id: 'd3', time: 'yesterday 6pm' },
];

function daysUntilSunday() {
  const d = new Date().getDay();
  return d === 0 ? 0 : 7 - d;
}

// ── Polaroid Card ─────────────────────────────────────────────────────────────
function PolaroidCard({ photo, onClick, index, showLabel }) {
  return (
    <div
      className="polaroid"
      style={{ '--i': index }}
      onClick={() => onClick && onClick(photo)}
    >
      <div className="polaroid__film">
        <img className="polaroid__img" src={photo.url} alt="" loading="lazy" />
        <div className="polaroid__grain" />
        <div className="polaroid__leak" style={{ background: LIGHT_LEAKS[photo.id % 4] }} />
      </div>
      <div className="polaroid__strip">
        {showLabel && <span className="polaroid__label">@{photo.username}</span>}
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
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

// ── Landing Page ──────────────────────────────────────────────────────────────
function LandingPage({ onSuccess, onDemo }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm]       = useState({ username: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake]     = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const body     = isLogin
        ? { email: form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password };
      const res  = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'something went wrong');
      localStorage.setItem('exposr_token', data.token);
      onSuccess(data.user);
    } catch (err) {
      setError(err.message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (login) => {
    setIsLogin(login);
    setError('');
    setForm({ username: '', email: '', password: '' });
  };

  return (
    <div className="landing">
      {/* Left: brand copy */}
      <div className="landing__left">
        <div className="landing__copy">
          <h1 className="landing__brand">exposr</h1>
          <div className="landing__rule" />
          <p className="landing__line1">shoot freely.</p>
          <p className="landing__line2">see honestly.</p>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="landing__right">
        <div className={`landing__form-wrap${shake ? ' form--shake' : ''}`}>
          {/* pill toggle */}
          <div className="auth-pill">
            <button
              className={`auth-pill__btn${isLogin ? ' auth-pill__btn--active' : ''}`}
              onClick={() => switchTab(true)}
            >
              log in
            </button>
            <button
              className={`auth-pill__btn${!isLogin ? ' auth-pill__btn--active' : ''}`}
              onClick={() => switchTab(false)}
            >
              sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="auth-field">
                <label className="auth-label">username</label>
                <input className="auth-input" value={form.username} onChange={set('username')} required />
              </div>
            )}
            <div className="auth-field">
              <label className="auth-label">{isLogin ? 'username' : 'email'}</label>
              <input
                className="auth-input"
                type={isLogin ? 'text' : 'email'}
                value={form.email}
                onChange={set('email')}
                required
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">password</label>
              <input className="auth-input" type="password" value={form.password} onChange={set('password')} required />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? '...' : isLogin ? 'log in' : 'sign up'}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? 'no account?' : 'already rolling?'}{' '}
            <button className="auth-switch__btn" onClick={() => switchTab(!isLogin)}>
              {isLogin ? 'sign up' : 'log in'}
            </button>
          </p>

          <div className="auth-demo-row">
            <button className="auth-demo-btn" onClick={onDemo}>try the demo →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shoot Page ────────────────────────────────────────────────────────────────
function ShootPage() {
  const [flash, setFlash]       = useState(false);
  const days                    = daysUntilSunday();
  const weekProgress            = Math.round(((7 - days) / 7) * 100);

  const shoot = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  };

  return (
    <div className="shoot-page">
      {flash && <div className="shutter-flash" />}

      {/* main column */}
      <div className="shoot-main">
        <div className="viewfinder">
          <div className="viewfinder__corner viewfinder__corner--tl" />
          <div className="viewfinder__corner viewfinder__corner--tr" />
          <div className="viewfinder__corner viewfinder__corner--bl" />
          <div className="viewfinder__corner viewfinder__corner--br" />
          <div className="viewfinder__badge viewfinder__badge--left">live</div>
          <div className="viewfinder__badge viewfinder__badge--right">reveals sunday</div>
          <p className="viewfinder__hint">point and shoot</p>
        </div>

        <div className="shoot-controls">
          <div className="shoot-stat">
            <span className="shoot-stat__num">{DEMO_DEVELOPING.length}</span>
            <span className="shoot-stat__label">shots this week</span>
          </div>
          <button className="shutter-btn" onClick={shoot} aria-label="Take photo">
            <div className="shutter-btn__inner" />
          </button>
          <div className="shoot-stat">
            <span className="shoot-stat__num">{days}</span>
            <span className="shoot-stat__label">days to reveal</span>
          </div>
        </div>

        <p className="shoot-tagline">no previews — shoot freely, see sunday</p>
      </div>

      {/* sidebar */}
      <div className="shoot-sidebar">
        <p className="sidebar-section-label">THIS WEEK</p>
        <div className="week-card">
          <span className="week-card__day">sunday</span>
          <p className="week-card__sub">photos develop in {days} day{days !== 1 ? 's' : ''}</p>
          <div className="week-progress">
            <div className="week-progress__fill" style={{ width: `${weekProgress}%` }} />
          </div>
        </div>

        <p className="sidebar-section-label" style={{ marginTop: 28 }}>DEVELOPING</p>
        <div className="developing-list">
          {DEMO_DEVELOPING.map((d) => (
            <div key={d.id} className="developing-item">
              <div className="developing-thumb" />
              <div>
                <p className="developing-time">{d.time}</p>
                <p className="developing-status">developing...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Feed Page ─────────────────────────────────────────────────────────────────
function FeedPage({ feed, onPhotoClick }) {
  const friends = feed.filter((p) => p.username !== 'arianacruz');
  const shuffled = useMemo(() => [...friends].sort(() => Math.random() - 0.5), []);
  return (
    <div className="page-content">
      <div className="photo-grid photo-grid--5">
        {shuffled.map((photo, i) => (
          <PolaroidCard key={photo.id} photo={photo} onClick={onPhotoClick} index={i} showLabel />
        ))}
      </div>
    </div>
  );
}

// ── Friends Page ──────────────────────────────────────────────────────────────
function FriendsPage({ feed, onPhotoClick }) {
  const grouped = useMemo(() => {
    const map = {};
    feed.filter((p) => p.username !== 'arianacruz').forEach((p) => {
      if (!map[p.username]) map[p.username] = [];
      map[p.username].push(p);
    });
    return Object.entries(map);
  }, [feed]);

  return (
    <div className="page-content">
      {grouped.map(([username, photos]) => (
        <div key={username} className="friend-section">
          <p className="friend-section__name">@{username}</p>
          <div className="photo-grid photo-grid--6">
            {photos.map((photo, i) => (
              <PolaroidCard key={photo.id} photo={photo} onClick={onPhotoClick} index={i} />
            ))}
          </div>
        </div>
      ))}
      <div className="scroll-hint">
        <div className="scroll-hint__btn">↓</div>
      </div>
    </div>
  );
}

// ── Album Page ────────────────────────────────────────────────────────────────
function AlbumPage({ user, feed, isOwn, onRollWith }) {
  const username = user.username;
  const photos   = feed.filter((p) => p.username === username);
  const seed     = username.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rolls    = isOwn ? photos.length : ((seed * 13) % 800 + 200);
  const rolling  = isOwn ? 5 : Math.floor(rolls * 0.45);

  return (
    <div className="album-page">
      <div className="album-header">
        <div className="album-user">
          <div className="album-avatar">{username[0].toUpperCase()}</div>
          <div>
            <h2 className="album-username">@{username}</h2>
            <p className="album-stats">{rolls} rolls&nbsp;&nbsp;&nbsp;{rolling} rolling with</p>
          </div>
        </div>
        {!isOwn && (
          <button className="roll-with-btn" onClick={onRollWith}>+ roll with</button>
        )}
      </div>
      <div className="photo-grid photo-grid--4 photo-grid--dark">
        {photos.map((photo, i) => (
          <PolaroidCard key={photo.id} photo={photo} index={i} />
        ))}
        {photos.length === 0 && (
          <p className="album-empty">no photos yet this week.</p>
        )}
      </div>
    </div>
  );
}

// ── Zoom Page ─────────────────────────────────────────────────────────────────
function ZoomPage({ photo, onBack, onProfileClick }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onBack(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  return (
    <div className="zoom-page" onClick={onBack}>
      <div className="zoom-polaroid" onClick={(e) => e.stopPropagation()}>
        <div className="zoom-polaroid__film">
          <img className="zoom-polaroid__img" src={photo.url} alt="" />
          <div className="polaroid__grain" />
          <div className="polaroid__leak" style={{ background: LIGHT_LEAKS[photo.id % 4] }} />
        </div>
        <div className="zoom-polaroid__strip">
          <button className="zoom-username" onClick={() => onProfileClick(photo.username)}>
            @{photo.username}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [user, setUser]               = useState(null);
  const [view, setView]               = useState('feed');
  const [prevView, setPrevView]       = useState('feed');
  const [zoomedPhoto, setZoomedPhoto] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const feed = DEMO_FEED;

  useEffect(() => {
    const token = localStorage.getItem('exposr_token');
    if (token) setUser(DEMO_USER);
  }, []);

  const handlePhotoClick = (photo) => {
    setPrevView(view);
    setZoomedPhoto(photo);
    setView('zoom');
  };

  const handleProfileClick = (username) => {
    setProfileUser(username);
    setView('profile');
  };

  const handleBack = () => {
    if (view === 'profile') { setView('zoom'); }
    else { setView(prevView); setZoomedPhoto(null); }
  };

  const handleNav = (v) => {
    setView(v);
    setZoomedPhoto(null);
    setProfileUser(null);
  };

  if (!user) {
    return (
      <LandingPage
        onSuccess={(u) => setUser(u)}
        onDemo={() => { localStorage.setItem('exposr_token', 'demo'); setUser(DEMO_USER); }}
      />
    );
  }

  const hideNav = view === 'zoom' || view === 'profile';

  return (
    <div className="app">
      {!hideNav && <Navbar view={view} onNav={handleNav} username={user.username} />}
      <div key={view} className="view-wrapper">
        {view === 'shoot'   && <ShootPage />}
        {view === 'feed'    && <FeedPage    feed={feed} onPhotoClick={handlePhotoClick} />}
        {view === 'friends' && <FriendsPage feed={feed} onPhotoClick={handlePhotoClick} />}
        {view === 'album'   && (
          <AlbumPage user={user} feed={feed} isOwn={true} />
        )}
        {view === 'zoom' && zoomedPhoto && (
          <ZoomPage photo={zoomedPhoto} onBack={handleBack} onProfileClick={handleProfileClick} />
        )}
        {view === 'profile' && profileUser && (
          <AlbumPage
            user={{ username: profileUser }}
            feed={feed}
            isOwn={false}
            onRollWith={handleBack}
          />
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
