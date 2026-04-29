/* global React, ReactDOM, ExposrAPI */

function useCountdown(revealAt) {
  const [timeLeft, setTimeLeft] = React.useState('');
  React.useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(revealAt) - new Date());
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(diff === 0 ? 'Developed!' : `${m}m ${String(s).padStart(2, '0')}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [revealAt]);
  return timeLeft;
}

function DevelopingCard({ photo }) {
  const timeLeft = useCountdown(photo.reveal_at);
  return (
    <div className="polaroid polaroid--developing">
      <div className="polaroid__developing-inner">
        <span className="polaroid__timer">{timeLeft}</span>
        <span className="polaroid__label">developing…</span>
      </div>
      <div className="polaroid__caption">@{photo.users?.username || 'unknown'}</div>
    </div>
  );
}

function PhotoCard({ photo, onReport }) {
  const [reported, setReported] = React.useState(false);
  const handleReport = async () => {
    await ExposrAPI.reportPhoto(photo.id, 'Reported by user');
    setReported(true);
  };
  return (
    <div className="polaroid">
      <img className="polaroid__img" src={photo.storage_url} alt="exposr photo" />
      <div className="polaroid__caption">@{photo.users?.username || 'unknown'}</div>
      {!reported ? (
        <button className="polaroid__report" onClick={handleReport}>report</button>
      ) : (
        <span className="polaroid__reported">reported</span>
      )}
    </div>
  );
}

function FeedApp() {
  const [photos, setPhotos] = React.useState([]);
  const [shots, setShots] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const user = ExposrAPI.getUser();

  React.useEffect(() => {
    if (!ExposrAPI.getToken()) {
      window.location.href = '/public/login.html';
      return;
    }
    async function load() {
      try {
        const [feedData, shotsData] = await Promise.all([
          ExposrAPI.getFeed(),
          ExposrAPI.getMyShots(),
        ]);
        if (feedData.error) throw new Error(feedData.error);
        setPhotos(feedData.photos || []);
        setShots(shotsData);
      } catch (err) {
        setError(err.message || 'Failed to load feed');
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    ExposrAPI.clearAuth();
    window.location.href = '/public/login.html';
  };

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
          {shots !== null && (
            <span className="nav__shots">{shots.shots_remaining} shots left</span>
          )}
          <a href="/public/upload.html" className="btn btn--primary">+ shoot</a>
          <button className="btn btn--ghost" onClick={logout}>log out</button>
        </nav>
      </header>

      <section className="feed">
        {loading && <p className="feed__status">Loading your roll…</p>}
        {error && <p className="feed__status feed__status--error">{error}</p>}
        {!loading && !error && photos.length === 0 && (
          <div className="feed__empty">
            <p>No developed photos yet.</p>
            <a href="/public/upload.html" className="btn btn--primary">Take your first shot</a>
          </div>
        )}
        <div className="feed__grid">
          {photos.map((photo) =>
            photo.status === 'developing' ? (
              <DevelopingCard key={photo.id} photo={photo} />
            ) : (
              <PhotoCard key={photo.id} photo={photo} />
            )
          )}
        </div>
      </section>

      <footer className="site-footer">
        <small>© {new Date().getFullYear()} Exposr. Real moments, no polish.</small>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<FeedApp />);
