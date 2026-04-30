/* global React */
const { useState } = React;
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
  const feed = DEMO_FEED;

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
        apiBase={API}
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
            onRollWith={handleBack}
          />
        )}
      </div>
    </div>
  );
}

window.App = App;
