/* global React, ReactDOM */
const { useState, useEffect, useMemo } = React;

const API = 'http://localhost:3001/api';

const LIGHT_LEAKS = [
  'radial-gradient(ellipse at 96% 4%,  rgba(255,158,55,0.35) 0%, transparent 52%)',
  'radial-gradient(ellipse at 4%  92%, rgba(255,80,40,0.25)  0%, transparent 48%)',
  'radial-gradient(ellipse at 2%  3%,  rgba(255,220,72,0.30) 0%, transparent 54%)',
  'radial-gradient(ellipse at 98% 52%, rgba(255,135,72,0.28) 0%, transparent 50%)',
];

const DEMO_USER = { username: 'you.demo', email: 'demo@exposr.app' };

const DEMO_FEED = [
  // your demo user's photos (show up in Album)
  { id: 100, username: 'you.demo',     url: 'https://picsum.photos/seed/me1/400/400'  },
  { id: 101, username: 'you.demo',     url: 'https://picsum.photos/seed/me2/400/400'  },
  { id: 102, username: 'you.demo',     url: 'https://picsum.photos/seed/me3/400/400'  },
  // friends' photos
  { id: 1,   username: 'maya.film',    url: 'https://picsum.photos/seed/ex1/400/400'  },
  { id: 2,   username: 'j.reel',       url: 'https://picsum.photos/seed/ex2/400/400'  },
  { id: 3,   username: 'sam.captures', url: 'https://picsum.photos/seed/ex3/400/400'  },
  { id: 4,   username: 'noa.shoots',   url: 'https://picsum.photos/seed/ex4/400/400'  },
  { id: 5,   username: 'rio.lens',     url: 'https://picsum.photos/seed/ex5/400/400'  },
  { id: 6,   username: 'leo.frames',   url: 'https://picsum.photos/seed/ex6/400/400'  },
  { id: 7,   username: 'maya.film',    url: 'https://picsum.photos/seed/ex7/400/400'  },
  { id: 8,   username: 'j.reel',       url: 'https://picsum.photos/seed/ex8/400/400'  },
  { id: 9,   username: 'sam.captures', url: 'https://picsum.photos/seed/ex9/400/400'  },
  { id: 10,  username: 'noa.shoots',   url: 'https://picsum.photos/seed/ex10/400/400' },
  { id: 11,  username: 'rio.lens',     url: 'https://picsum.photos/seed/ex11/400/400' },
  { id: 12,  username: 'leo.frames',   url: 'https://picsum.photos/seed/ex12/400/400' },
  { id: 13,  username: 'maya.film',    url: 'https://picsum.photos/seed/ex13/400/400' },
  { id: 14,  username: 'j.reel',       url: 'https://picsum.photos/seed/ex14/400/400' },
  { id: 15,  username: 'sam.captures', url: 'https://picsum.photos/seed/ex15/400/400' },
  { id: 16,  username: 'noa.shoots',   url: 'https://picsum.photos/seed/ex16/400/400' },
  { id: 17,  username: 'rio.lens',     url: 'https://picsum.photos/seed/ex17/400/400' },
  { id: 18,  username: 'leo.frames',   url: 'https://picsum.photos/seed/ex18/400/400' },
  { id: 19,  username: 'maya.film',    url: 'https://picsum.photos/seed/ex19/400/400' },
  { id: 20,  username: 'j.reel',       url: 'https://picsum.photos/seed/ex20/400/400' },
];

// ── Polaroid Card ─────────────────────────────────────────────────────────────
function PolaroidCard({ photo, onClick, index }) {
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
      <div className="polaroid__strip" />
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ view, onNav }) {
  return (
    <nav className="navbar">
      <span className="navbar__brand" onClick={() => onNav('feed')}>exposr</span>
      <div className="navbar__links">
        {['feed', 'album', 'friends'].map((v) => (
          <button
            key={v}
            className={`navbar__link${view === v ? ' navbar__link--active' : ''}`}
            onClick={() => onNav(v)}
          >
            {v.toUpperCase()}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ── Landing Page ──────────────────────────────────────────────────────────────
function LandingPage({ onSuccess, onDemo }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '', password: '' });
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
        : { username: form.firstName, email: form.email, password: form.password };
      const res  = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
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
    setForm({ firstName: '', lastName: '', email: '', password: '' });
  };

  return (
    <div className="landing">
      {/* Left: auth card */}
      <div className="landing__left">
        <div className={`auth-card${shake ? ' auth-card--shake' : ''}`}>
          <div className="auth-card__tabs">
            <button
              className={`auth-tab${isLogin ? ' auth-tab--active' : ''}`}
              onClick={() => switchTab(true)}
            >
              LOG IN
            </button>
            <button
              className={`auth-tab${!isLogin ? ' auth-tab--active' : ''}`}
              onClick={() => switchTab(false)}
            >
              SIGN UP
            </button>
          </div>

          <form className="auth-card__form" onSubmit={handleSubmit}>
            {isLogin ? (
              <>
                <div className="auth-field-group">
                  <label className="auth-label">Username:</label>
                  <input className="auth-input" value={form.email} onChange={set('email')} required />
                </div>
                <div className="auth-field-group">
                  <label className="auth-label">Password:</label>
                  <input className="auth-input" type="password" value={form.password} onChange={set('password')} required />
                </div>
              </>
            ) : (
              <>
                <div className="auth-field-group">
                  <label className="auth-label">First Name:</label>
                  <input className="auth-input" value={form.firstName} onChange={set('firstName')} required />
                </div>
                <div className="auth-field-group">
                  <label className="auth-label">Last Name:</label>
                  <input className="auth-input" value={form.lastName} onChange={set('lastName')} />
                </div>
                <div className="auth-field-group">
                  <label className="auth-label">Email Address:</label>
                  <input className="auth-input" type="email" value={form.email} onChange={set('email')} required />
                </div>
                <div className="auth-field-group">
                  <label className="auth-label">Password:</label>
                  <input className="auth-input" type="password" value={form.password} onChange={set('password')} required />
                </div>
              </>
            )}
            {error && <p className="auth-error">{error}</p>}
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? '...' : isLogin ? 'LOG IN' : 'SIGN UP'}
              </button>
            </div>
          </form>

          <div className="auth-divider"><span>or</span></div>
          <button className="demo-btn" type="button" onClick={onDemo}>
            try the demo →
          </button>
        </div>
      </div>

      {/* Right: brand + tagline */}
      <div className="landing__right">
        <h1 className="landing__brand">exposr</h1>
        <p className="landing__hero-light">Shoot freely</p>
        <p className="landing__hero-dark">See Honestly</p>
      </div>
    </div>
  );
}

// ── Feed Page ─────────────────────────────────────────────────────────────────
function FeedPage({ feed, onPhotoClick }) {
  const shuffled = useMemo(() => [...feed].sort(() => Math.random() - 0.5), []);
  return (
    <div className="page-content">
      <div className="photo-grid">
        {shuffled.map((photo, i) => (
          <PolaroidCard key={photo.id} photo={photo} onClick={onPhotoClick} index={i} />
        ))}
      </div>
    </div>
  );
}

// ── Friends Page ──────────────────────────────────────────────────────────────
function FriendsPage({ feed, onPhotoClick }) {
  return (
    <div className="page-content">
      <div className="photo-grid">
        {feed.map((photo, i) => (
          <PolaroidCard key={photo.id} photo={photo} onClick={onPhotoClick} index={i} />
        ))}
      </div>
    </div>
  );
}

// ── Album Page (your own) ─────────────────────────────────────────────────────
function AlbumPage({ user, feed }) {
  const username = user.username || 'you.demo';
  const photos   = feed.filter((p) => p.username === username);
  return (
    <div className="album-page">
      <div className="album-header">
        <div>
          <h1 className="album-title">@{username}'s ALBUM</h1>
          <p className="album-stats">{photos.length} ROLLs this week&nbsp;&nbsp;&nbsp;5 ROLLING WITH</p>
        </div>
      </div>
      <div className="album-grid">
        {photos.length > 0
          ? photos.map((photo, i) => (
              <PolaroidCard key={photo.id} photo={photo} index={i} />
            ))
          : <p className="album-empty">no photos yet this week — go shoot something.</p>
        }
      </div>
    </div>
  );
}

// ── User Profile Page ─────────────────────────────────────────────────────────
function UserProfilePage({ username, feed }) {
  const photos   = feed.filter((p) => p.username === username);
  const seed     = username.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rolls    = (seed * 13) % 800 + 200;
  const rolling  = Math.floor(rolls * 0.45);

  return (
    <div className="album-page">
      <div className="album-header">
        <div>
          <h1 className="album-title">@{username}'s ALBUM</h1>
          <p className="album-stats">{rolls} ROLLs&nbsp;&nbsp;&nbsp;{rolling} ROLLING WITH</p>
        </div>
        <button className="roll-with-btn">ROLL WITH</button>
      </div>
      <div className="album-grid">
        {photos.map((photo, i) => (
          <PolaroidCard key={photo.id} photo={photo} index={i} />
        ))}
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
          <button
            className="zoom-polaroid__username"
            onClick={() => onProfileClick(photo.username)}
          >
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
    if (view === 'profile') {
      setView('zoom');
    } else {
      setView(prevView);
      setZoomedPhoto(null);
    }
  };

  const handleNav = (newView) => {
    setView(newView);
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
      {!hideNav && <Navbar view={view} onNav={handleNav} />}
      <div key={view} className="view-wrapper">
        {view === 'feed'    && <FeedPage        feed={feed} onPhotoClick={handlePhotoClick} />}
        {view === 'friends' && <FriendsPage     feed={feed} onPhotoClick={handlePhotoClick} />}
        {view === 'album'   && <AlbumPage       user={user} feed={feed} />}
        {view === 'zoom'    && zoomedPhoto && (
          <ZoomPage photo={zoomedPhoto} onBack={handleBack} onProfileClick={handleProfileClick} />
        )}
        {view === 'profile' && profileUser && (
          <UserProfilePage username={profileUser} feed={feed} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
