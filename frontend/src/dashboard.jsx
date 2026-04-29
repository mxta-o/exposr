/* global React, ReactDOM */

function DashboardApp() {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const streamRef = React.useRef(null);

  const [shots, setShots] = React.useState([]);
  const [error, setError] = React.useState('');
  const [isReady, setIsReady] = React.useState(false);
  const [isStarting, setIsStarting] = React.useState(false);

  const startCamera = async () => {
    setError('');
    setIsStarting(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsReady(true);
    } catch (err) {
      setError(err.message || 'Camera access was denied.');
    } finally {
      setIsStarting(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsReady(false);
  };

  const takeShot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (shots.length >= 3) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setShots((prev) => [...prev, dataUrl]);
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
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
          <a href="/public/dashboard.html">Roll</a>
          <a href="#friends">Friends</a>
          <a href="#capture">Capture</a>
          <a href="#profile">Profile</a>
        </nav>
      </header>

      <section className="dashboard">
        <div className="dashboard__hero">
          <div>
            <p className="eyebrow">Today&apos;s roll</p>
            <h1 className="dashboard__title">Shoot freely. No previews.</h1>
            <p className="dashboard__subtitle">
              Max 3 shots per day, 10 per week. Developing reveals on Monday.
            </p>
            <div className="dashboard__actions">
              <button className="btn btn--primary" type="button" onClick={startCamera} disabled={isStarting}>
                {isStarting ? 'Starting camera…' : isReady ? 'Camera ready' : 'Enable camera'}
              </button>
              <button className="btn btn--ghost" type="button" onClick={stopCamera} disabled={!isReady}>
                Stop camera
              </button>
            </div>
          </div>
          <div className="dashboard__stats">
            <div className="stat">
              <span>Shots left today</span>
              <strong>{Math.max(0, 3 - shots.length)}</strong>
            </div>
            <div className="stat">
              <span>Shots left this week</span>
              <strong>{Math.max(0, 10 - shots.length)}</strong>
            </div>
            <div className="stat">
              <span>Next reveal</span>
              <strong>Monday 7 AM</strong>
            </div>
          </div>
        </div>

        <div id="capture" className="dashboard__section">
          <h2>Capture</h2>
          <div className="capture">
            <div className="capture__preview">
              {isReady ? (
                <video ref={videoRef} autoPlay playsInline muted />
              ) : (
                <div className="capture__placeholder">Camera preview</div>
              )}
            </div>
            {error && <div className="field-error">{error}</div>}
            <div className="capture__actions">
              <button className="btn btn--primary" type="button" onClick={takeShot} disabled={!isReady || shots.length >= 3}>
                Take shot
              </button>
              <span className="capture__note">No uploads. 3-second timer in full app.</span>
            </div>
            <canvas ref={canvasRef} className="capture__canvas" />
          </div>
        </div>

        <div id="roll" className="dashboard__section">
          <h2>Today&apos;s roll</h2>
          <div className="roll-grid">
            {shots.length === 0 && <div className="roll-card">No shots yet</div>}
            {shots.map((shot, index) => (
              <div className="roll-card" key={shot}>
                <img src={shot} alt={`Shot ${index + 1}`} />
                <span>Shot {index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div id="friends" className="dashboard__section">
          <h2>Friends</h2>
          <div className="friends">
            <div className="friend">Ari — Roll developing</div>
            <div className="friend">ZJ — 2 new frames</div>
            <div className="friend">Maya — Roll revealed</div>
          </div>
        </div>

        <div id="profile" className="dashboard__section">
          <h2>Profile</h2>
          <div className="profile">
            <div>
              <p>@exposr.user</p>
              <p>Weekly roll: {shots.length}/10</p>
            </div>
            <a className="btn btn--ghost" href="/public/index.html">Log out</a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <small>© {new Date().getFullYear()} Exposr. Real moments, no polish.</small>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<DashboardApp />);
