import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useAuth } from "../state/AuthContext";

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Login page using Supabase email/password. */
  const { signIn, supabaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setWorking(true);
    try {
      await signIn({ email, password });
      navigate("/");
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <PageShell title="Login" subtitle="Sign in to track your orders across devices.">
      <div className="authWrap">
        <form className="card authCard" onSubmit={onSubmit}>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={!supabaseConfigured || working}
            />
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
          </div>

          {error ? <div className="errorBox">{error}</div> : null}

          <button className="btn btn-primary btn-block" type="submit" disabled={!supabaseConfigured || working}>
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
