import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useAuth } from "../state/AuthContext";

// PUBLIC_INTERFACE
export default function SignupPage() {
  /** Signup page using Supabase email/password. */
  const { signUp, supabaseConfigured } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setWorking(true);
    try {
      await signUp({ email, password });
      setSuccess("Account created. Check your email for a confirmation link (if enabled).");
    } catch (err) {
      setError(err?.message || "Signup failed.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <PageShell title="Sign up" subtitle="Create an account to make checkout faster and track orders.">
      <div className="authWrap">
        <form className="card authCard" onSubmit={onSubmit}>
          {!supabaseConfigured ? (
            <div className="errorBox">
              Supabase is not configured. Add <code>REACT_APP_SUPABASE_URL</code> and{" "}
              <code>REACT_APP_SUPABASE_ANON_KEY</code> to enable signup.
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
              autoComplete="new-password"
              required
              disabled={!supabaseConfigured || working}
            />
            <div className="muted small">Use at least 6 characters.</div>
          </div>

          {error ? <div className="errorBox">{error}</div> : null}
          {success ? <div className="successBox">{success}</div> : null}

          <button className="btn btn-primary btn-block" type="submit" disabled={!supabaseConfigured || working}>
            {working ? "Creating account…" : "Create account"}
          </button>

          <div className="muted small">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
