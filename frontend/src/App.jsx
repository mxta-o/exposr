/* global React */
const { useState, useEffect } = React;
const {
  LandingPage,
  Navbar,
  ShootPage,
  FeedPage,
  FriendsPage,
  AlbumPage,
  ZoomPage,
} = window;
const { DEMO_USER, DEMO_FEED } = window;

const API = 'http://localhost:3001/api';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('feed');
  const [prevView, setPrevView] = useState('feed');
  const [zoomedPhoto, setZoomedPhoto] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [rolls, setRolls] = useState(() => new Set());
  const feed = DEMO_FEED;

  useEffect(() => {
    const token = localStorage.getItem('exposr_token');
    if (!token) return;

    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          localStorage.setItem('exposr_user_id', data.user.id);
          setUser(data.user);
        }
      })
      .catch(() => {});
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

  const handleToggleRoll = (username) => {
    setRolls((prev) => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
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

  const handleLogout = () => {
    localStorage.removeItem('exposr_token');
    localStorage.removeItem('exposr_user_id');
    setUser(null);
    setView('feed');
    setZoomedPhoto(null);
    setProfileUser(null);
  };

  if (!user) {
    return (
      <LandingPage
        apiBase={API}
        onSuccess={(u) => {
          localStorage.setItem('exposr_user_id', u.id);
          setUser(u);
        }}
        onDemo={() => {
          localStorage.setItem('exposr_token', 'demo');
          localStorage.setItem('exposr_user_id', DEMO_USER.id || 'demo');
          setUser(DEMO_USER);
        }}
      />
    );
  }

  const hideNav = view === 'zoom';

  return (
    <div className="app">
      {!hideNav && (
        <Navbar view={view} onNav={handleNav} username={user.username} onLogout={handleLogout} />
      )}
      <div key={view} className="view-wrapper">
        {view === 'shoot' && <ShootPage />}
        {view === 'feed' && <FeedPage feed={feed} onPhotoClick={handlePhotoClick} />}
        {view === 'friends' && <FriendsPage feed={feed} onPhotoClick={handlePhotoClick} />}
        {view === 'album' && (
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
            isRolled={rolls.has(profileUser)}
            onToggleRoll={() => handleToggleRoll(profileUser)}
          />
        )}
      </div>
    </div>
  );
}

window.App = App;
