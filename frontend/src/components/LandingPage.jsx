/* global React */
const { useState } = React;

function LandingPage({ apiBase, onSuccess, onDemo }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const body = isLogin
        ? { email: form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password };
      const res = await fetch(`${apiBase}${endpoint}`, {
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
    <div className="landing landing--enter">
      <div className="landing__ambient" aria-hidden="true">
        <span className="landing__orb landing__orb--one" />
        <span className="landing__orb landing__orb--two" />
        <span className="landing__orb landing__orb--three" />
      </div>
      <div className="landing__left">
        <div className="landing__copy">
          <h1 className="landing__brand">exposr</h1>
          <div className="landing__rule" />
          <p className="landing__line1">shoot freely.</p>
          <p className="landing__line2">see honestly.</p>
        </div>
      </div>

      <div className="landing__right">
        <div className={`landing__form-wrap${shake ? ' form--shake' : ''}`}>
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
              <label className="auth-label">email</label>
              <input
                className="auth-input"
                type="email"
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
            <button className="auth-demo-btn" onClick={onDemo}>try the demo -&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.LandingPage = LandingPage;
