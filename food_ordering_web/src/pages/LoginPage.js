import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useAuth } from "../state/AuthContext";

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Login page using Supabase email/password. */
  const { signIn, supabaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    if (!supabaseConfigured) return false;
    const e = email.trim();
    const p = password;
    return isValidEmail(e) && p.length >= 6;
  }, [email, password, supabaseConfigured]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!supabaseConfigured) {
      setError("Supabase is not configured.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setWorking(true);
    try {
      await signIn({ email: email.trim(), password });
      // AuthContext session will update via onAuthStateChange; navigate immediately for UX.
      navigate("/", { replace: true });
    } catch (err) {
      // Supabase errors often include useful messages; normalize common ones.
      const msg = String(err?.message || "Login failed.");
      setError(msg);
    } finally {
      setWorking(false);
    }
  };

  return (
    <PageShell title="Login" subtitle="Sign in to track your orders across devices.">
      <div className="authWrap">
        <form className="card authCard" onSubmit={onSubmit} noValidate>
          {!supabaseConfigured ? (
            <div className="errorBox">
              Supabase is not configured. Add <code>REACT_APP_SUPABASE_URL</code> and{" "}
              <code>REACT_APP_SUPABASE_ANON_KEY</code> to enable login.
            </div>
          ) : null}

          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={!supabaseConfigured || working}
              aria-invalid={email.trim().length > 0 && !isValidEmail(email) ? "true" : "false"}
            />
            {email.trim().length > 0 && !isValidEmail(email) ? (
              <div className="muted small">Enter a valid email like name@example.com.</div>
            ) : null}
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={!supabaseConfigured || working}
            />
            <div className="muted small">Minimum 6 characters.</div>
          </div>

          {error ? <div className="errorBox" role="alert">{error}</div> : null}

          <button
            className={`btn btn-primary btn-block ${!canSubmit || working ? "is-disabled" : ""}`}
            type="submit"
            disabled={!canSubmit || working}
          >
            {working ? "Signing in…" : "Sign in"}
          </button>

          <div className="muted small">
            New here? <Link to="/signup">Create an account</Link>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
