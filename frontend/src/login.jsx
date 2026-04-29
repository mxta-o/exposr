/* global React, ReactDOM */

function LoginApp() {
  const [mode, setMode] = React.useState('login');
  const [form, setForm] = React.useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = React.useState({});
  const [submitted, setSubmitted] = React.useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const getStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    };
    const score = Object.values(checks).filter(Boolean).length;
    let label = 'Weak';
    if (score >= 4) label = 'Strong';
    else if (score === 3) label = 'Good';
    else if (score === 2) label = 'Okay';

    const tips = [];
    if (!checks.length) tips.push('Use at least 8 characters');
    if (!checks.upper) tips.push('Add an uppercase letter');
    if (!checks.lower) tips.push('Add a lowercase letter');
    if (!checks.number) tips.push('Add a number');
    if (!checks.symbol) tips.push('Add a symbol');

    return { score, label, tips };
  };

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);
  const isValidPassword = (value) => value.length >= 8;

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) {
      nextErrors.email = 'Field cannot be empty';
    } else if (!isValidEmail(form.email)) {
      nextErrors.email = 'Email is invalid';
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Field cannot be empty';
    } else if (!isValidPassword(form.password)) {
      nextErrors.password = 'Password is invalid';
    }

    if (mode === 'signup') {
      if (!form.username.trim()) nextErrors.username = 'Field cannot be empty';
      if (!form.confirmPassword.trim()) {
        nextErrors.confirmPassword = 'Field cannot be empty';
      } else if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
        nextErrors.confirmPassword = 'Passwords do not match';
      }
    }

    return nextErrors;
  };

  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      let data;
      if (mode === 'login') {
        data = await ExposrAPI.login(form.email, form.password);
      } else {
        data = await ExposrAPI.signup(form.username, form.email, form.password);
      }
      if (data.error) {
        setErrors({ api: data.error });
      } else {
        ExposrAPI.setAuth(data.token, data.user);
        window.location.href = '/public/feed.html';
      }
    } catch {
      setErrors({ api: 'Could not connect to server. Is the backend running?' });
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);
  const meterWidth = `${Math.min(100, (strength.score / 5) * 100)}%`;

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setSubmitted(false);
    setErrors({});
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
          <a href="/public/index.html">Landing</a>
          <a href="/public/login.html">Login</a>
        </nav>
      </header>

      <section className="login">
        <div className="login__card">
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p>
            {mode === 'login'
              ? "Log in to see your roll and capture today's moments."
              : 'Join Exposr and start your weekly roll.'}
          </p>
          <form className="login__form" onSubmit={onSubmit} noValidate>
            <label>
              Email
              <input
                type="email"
                name="email"
                placeholder="you@exposr.com"
                value={form.email}
                onChange={onChange}
                className={errors.email ? 'input-error' : ''}
                required
              />
              {submitted && errors.email && <span className="field-error">{errors.email}</span>}
            </label>

            {mode === 'signup' && (
              <label>
                Username
                <input
                  type="text"
                  name="username"
                  placeholder="exposr.user"
                  value={form.username}
                  onChange={onChange}
                  className={errors.username ? 'input-error' : ''}
                  required
                />
                {submitted && errors.username && <span className="field-error">{errors.username}</span>}
              </label>
            )}

            <label>
              Password
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                className={errors.password ? 'input-error' : ''}
                required
              />
              {submitted && errors.password && <span className="field-error">{errors.password}</span>}
            </label>

            {mode === 'signup' && (
              <div className="password-meter">
                <div className="meter">
                  <span className="meter__fill" style={{ width: meterWidth }} />
                </div>
                <div className="meter__label">Strength: {strength.label}</div>
                <ul className="tips">
                  {strength.tips.length === 0
                    ? <li>Strong password.</li>
                    : strength.tips.map((tip) => <li key={tip}>{tip}</li>)}
                </ul>
              </div>
            )}

            {mode === 'signup' && (
              <label>
                Confirm password
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={onChange}
                  className={errors.confirmPassword ? 'input-error' : ''}
                  required
                />
                {submitted && errors.confirmPassword && (
                  <span className="field-error">{errors.confirmPassword}</span>
                )}
              </label>
            )}

            {errors.api && <span className="field-error">{errors.api}</span>}
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create account'}
            </button>
          </form>

          <div className="login__footer">
            {mode === 'login' ? (
              <button type="button" className="btn btn--ghost" onClick={() => switchMode('signup')}>
                New here? Create account
              </button>
            ) : (
              <button type="button" className="btn btn--ghost" onClick={() => switchMode('login')}>
                Back to login
              </button>
            )}
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
root.render(<LoginApp />);
