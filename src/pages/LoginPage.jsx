import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const next = {};
    if (!username.trim()) next.username = "Username is required.";
    if (!password) next.password = "Password is required.";
    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // small delay, like a real API call
    const ok = login(username, password);
    setLoading(false);
    if (!ok) setErrors({ form: "Incorrect username or password. Please try again." });
  }

  function checkCaps(e) {
    setCapsLock(e.getModifierState && e.getModifierState("CapsLock"));
  }

  return (
    <div className="login-page">
      <section className="login-brand">
        <div className="brand-logo">
          <LogoIcon />
          <span>Image Label Manager</span>
        </div>
        <div className="brand-copy">
          <h1>Label images with clarity.</h1>
          <p>Mark points and areas on any photo, name them, and manage changes with a clear approval trail.</p>
          <ul className="brand-features">
            <li><CheckIcon /> Point & area annotations with numbered arrows</li>
            <li><CheckIcon /> Approval workflow for every deletion</li>
            <li><CheckIcon /> Full history with reasons and timestamps</li>
          </ul>
        </div>
        <p className="brand-footer">© {new Date().getFullYear()} Image Label Manager</p>
      </section>

      <section className="login-form-side">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div className="login-mobile-logo">
            <LogoIcon />
          </div>
          <h2>Welcome back</h2>
          <p className="muted">Sign in to your account to continue.</p>

          {errors.form && (
            <div className="alert alert-error" role="alert">
              {errors.form}
            </div>
          )}

          <label className="field">
            <span>Username</span>
            <div className={`input-icon ${errors.username ? "has-error" : ""}`}>
              <UserIcon />
              <input
                autoFocus
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors({});
                }}
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>
            {errors.username && <small className="field-error">{errors.username}</small>}
          </label>

          <label className="field">
            <span>Password</span>
            <div className={`input-icon ${errors.password ? "has-error" : ""}`}>
              <LockIcon />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({});
                }}
                onKeyUp={checkCaps}
                onKeyDown={checkCaps}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && <small className="field-error">{errors.password}</small>}
            {capsLock && <small className="field-warning">Caps Lock is on</small>}
          </label>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" /> Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>

          <p className="login-help muted small">Having trouble signing in? Contact your administrator.</p>
        </form>
      </section>
    </div>
  );
}

/* ---- Small inline SVG icons (no icon library needed) ---- */
const iconProps = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

function LogoIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <rect width="34" height="34" rx="9" fill="currentColor" opacity="0.15" />
      <rect x="7" y="9" width="20" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="21" cy="14" r="3" fill="currentColor" />
      <path d="M9 23l6-6 4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6C3.9 8.3 2 12 2 12s4 7 10 7a9.8 9.8 0 0 0 4.4-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg {...iconProps} width={16} height={16} aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}
