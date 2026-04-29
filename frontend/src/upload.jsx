/* global React, ReactDOM, ExposrAPI */

function UploadApp() {
  const [file, setFile] = React.useState(null);
  const [preview, setPreview] = React.useState(null);
  const [shots, setShots] = React.useState(null);
  const [status, setStatus] = React.useState('idle'); // idle | uploading | success | error
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    if (!ExposrAPI.getToken()) {
      window.location.href = '/public/login.html';
      return;
    }
    ExposrAPI.getMyShots().then((data) => setShots(data));
  }, []);

  const onFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setStatus('idle');
    setMessage('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setStatus('uploading');
    setMessage('');
    try {
      const data = await ExposrAPI.uploadPhoto(file);
      if (data.error) {
        setStatus('error');
        setMessage(data.error);
      } else {
        setStatus('success');
        setMessage(`Shot taken! Develops in about 1 hour. ${data.shots_remaining} shots remaining this week.`);
        setFile(null);
        setPreview(null);
      }
    } catch {
      setStatus('error');
      setMessage('Could not connect to server. Is the backend running?');
    }
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
          <a href="/public/feed.html" className="btn btn--ghost">← feed</a>
        </nav>
      </header>

      <section className="login">
        <div className="login__card">
          <h2>Take a shot</h2>
          <p>No filters. No retakes. What you shoot is what you get.</p>

          {shots !== null && shots.shots_remaining <= 0 ? (
            <p className="field-error">You've used all 10 shots this week. Come back next week.</p>
          ) : (
            <form className="login__form" onSubmit={onSubmit}>
              <label className="upload__label">
                {preview ? (
                  <img src={preview} className="upload__preview" alt="preview" />
                ) : (
                  <div className="upload__placeholder">tap to choose photo</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={onFileChange}
                  style={{ display: 'none' }}
                />
              </label>

              {status === 'error' && <span className="field-error">{message}</span>}
              {status === 'success' && <span className="upload__success">{message}</span>}

              <button
                type="submit"
                className="btn btn--primary"
                disabled={!file || status === 'uploading'}
              >
                {status === 'uploading' ? 'Developing…' : 'Shoot'}
              </button>

              {status === 'success' && (
                <a href="/public/feed.html" className="btn btn--ghost">Back to feed</a>
              )}
            </form>
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
root.render(<UploadApp />);
