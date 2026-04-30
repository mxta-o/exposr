/* global React */
const { useState, useEffect, useRef } = React;

const API_BASE = 'http://localhost:3001/api';

function getEtNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
}

function getNextSundayNoonEt() {
  const nowEt = getEtNow();
  const next = new Date(nowEt);
  const daysUntilSunday = (7 - next.getDay()) % 7;
  next.setDate(next.getDate() + daysUntilSunday);
  next.setHours(12, 0, 0, 0);
  if (next <= nowEt) {
    next.setDate(next.getDate() + 7);
  }
  return next;
}

function getLastSundayNoonEt() {
  const nowEt = getEtNow();
  const last = new Date(nowEt);
  const daysSinceSunday = last.getDay();
  last.setDate(last.getDate() - daysSinceSunday);
  last.setHours(12, 0, 0, 0);
  if (last > nowEt) {
    last.setDate(last.getDate() - 7);
  }
  return last;
}

function ShootPage() {
  const [flash, setFlash] = useState(false);
  const [toast, setToast] = useState('');
  const [weeklyShots, setWeeklyShots] = useState(0);
  const [developingPhotos, setDevelopingPhotos] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [rulesKey, setRulesKey] = useState('exposr_rules_seen');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const nextSundayNoonEt = getNextSundayNoonEt();
  const lastSundayNoonEt = getLastSundayNoonEt();
  const nowEt = getEtNow();
  const msToReveal = Math.max(0, nextSundayNoonEt - nowEt);
  const daysToReveal = Math.ceil(msToReveal / (1000 * 60 * 60 * 24));
  const weekProgress = Math.min(100, Math.max(
    0,
    Math.round(((nowEt - lastSundayNoonEt) / (nextSundayNoonEt - lastSundayNoonEt)) * 100)
  ));

  const fetchStats = (headers) =>
    fetch(`${API_BASE}/photos/my-shots`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.weekly_shots_used === 'number') {
          setWeeklyShots(data.weekly_shots_used);
        }
      });

  const fetchDeveloping = (headers) =>
    fetch(`${API_BASE}/photos/developing`, { headers })
      .then((res) => res.json())
      .then((data) => setDevelopingPhotos(Array.isArray(data.photos) ? data.photos : []));

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return true;
    } catch (err) {
      setToast('Must enable camera access');
      setTimeout(() => setToast(''), 2200);
      return false;
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('exposr_user_id') || 'anon';
    const key = `exposr_rules_seen_${userId}`;
    setRulesKey(key);
    setShowRules(!localStorage.getItem(key));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('exposr_token');
    if (token) {
      const headers = { Authorization: `Bearer ${token}` };
      fetchStats(headers).catch(() => {});
      fetchDeveloping(headers).catch(() => {});
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const shoot = async () => {
    if (!videoRef.current) return;
    if (!streamRef.current) {
      const ok = await startCamera();
      if (!ok) return;
    }

    const token = localStorage.getItem('exposr_token');
    if (!token) {
      setToast('Please log in to shoot');
      setTimeout(() => setToast(''), 2200);
      return;
    }

    setFlash(true);
    setTimeout(() => setFlash(false), 600);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!blob) {
      setToast('Failed to capture photo');
      setTimeout(() => setToast(''), 2200);
      return;
    }

    const preview = URL.createObjectURL(blob);
    setPreviewUrl(preview);

    const formData = new FormData();
    formData.append('photo', blob, 'capture.jpg');

    try {
      const res = await fetch(`${API_BASE}/photos/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      const headers = { Authorization: `Bearer ${token}` };
      await fetchStats(headers);
      await fetchDeveloping(headers);
    } catch (err) {
      setToast(err.message);
      setTimeout(() => setToast(''), 2200);
    } finally {
      setTimeout(() => {
        URL.revokeObjectURL(preview);
        setPreviewUrl('');
      }, 1200);
    }
  };

  return (
    <div className="shoot-page">
      {flash && <div className="shutter-flash" />}
      {toast && <div className="camera-toast">{toast}</div>}
      {showRules && (
        <div className="rules-modal" role="dialog" aria-modal="true">
          <div className="rules-card">
            <h2 className="rules-title">Before you shoot</h2>
            <p className="rules-subtitle">
              Exposr is a weekly roll. You shoot now, and see everything together on Sunday at 12 PM ET.
            </p>
            <ul className="rules-list">
              <li>Photos stay hidden until Sunday release.</li>
              <li>Photos cannot be deleted once captured.</li>
              <li>Camera access is required to shoot.</li>
              <li>Uploads develop automatically and post on release.</li>
              <li>Safety checks may apply before release.</li>
            </ul>
            <button
              className="rules-btn"
              onClick={() => {
                localStorage.setItem(rulesKey, '1');
                setShowRules(false);
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="shoot-main">
        <div className="viewfinder">
          <video
            ref={videoRef}
            className="viewfinder__video"
            autoPlay
            playsInline
            muted
          />
          {previewUrl && (
            <img
              className="viewfinder__preview"
              src={previewUrl}
              alt="Captured preview"
            />
          )}
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
            <span className="shoot-stat__num">{weeklyShots}</span>
            <span className="shoot-stat__label">shots this week</span>
          </div>
          <button className="shutter-btn" onClick={shoot} aria-label="Take photo">
            <div className="shutter-btn__inner" />
          </button>
          <div className="shoot-stat">
            <span className="shoot-stat__num">{daysToReveal}</span>
            <span className="shoot-stat__label">days to reveal</span>
          </div>
        </div>

        <p className="shoot-tagline">no previews -- shoot freely, see sunday</p>
      </div>

      <div className="shoot-sidebar">
        <p className="sidebar-section-label">THIS WEEK</p>
        <div className="week-card">
          <span className="week-card__day">sunday</span>
          <p className="week-card__sub">
            photos develop in {daysToReveal} day{daysToReveal !== 1 ? 's' : ''} (12 PM ET)
          </p>
          <div className="week-progress">
            <div className="week-progress__fill" style={{ width: `${weekProgress}%` }} />
          </div>
        </div>

        <p className="sidebar-section-label" style={{ marginTop: 28 }}>DEVELOPING</p>
        <div className="developing-list">
          {developingPhotos.map((photo) => (
            <div key={photo.id} className="developing-item">
              <div
                className="developing-thumb"
                style={photo.storage_url ? { backgroundImage: `url(${photo.storage_url})`, backgroundSize: 'cover' } : null}
              />
              <div>
                <p className="developing-time">
                  {photo.created_at ? new Date(photo.created_at).toLocaleString() : 'processing'}
                </p>
                <p className="developing-status">developing...</p>
              </div>
            </div>
          ))}
          {developingPhotos.length === 0 && (
            <div className="developing-item">
              <div className="developing-thumb" />
              <div>
                <p className="developing-time">no photos developing</p>
                <p className="developing-status">shoot to start a roll</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.ShootPage = ShootPage;
