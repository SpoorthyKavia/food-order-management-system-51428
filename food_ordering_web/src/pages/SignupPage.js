import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useAuth } from "../state/AuthContext";

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

// PUBLIC_INTERFACE
export default function SignupPage() {
  /** Signup page using Supabase email/password. */
  const { signUp, supabaseConfigured, session } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSubmit = useMemo(() => {
    if (!supabaseConfigured) return false;
    const e = email.trim();
    return isValidEmail(e) && password.length >= 6;
  }, [email, password, supabaseConfigured]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
      // AuthContext wraps supabase.auth.signUp(). Session may or may not be created depending on
      // whether email confirmation is required.
      await signUp({ email: email.trim(), password });

      // If email confirmation is disabled, Supabase typically creates a session immediately.
      // Otherwise, session stays null and the user must confirm email.
      if (session?.user) {
        navigate("/menu", { replace: true });
        return;
      }

      setSuccess(
        "Account created. If email confirmation is enabled, check your inbox for a confirmation link before signing in."
      );
    } catch (err) {
      setError(String(err?.message || "Signup failed."));
    } finally {
      setWorking(false);
    }
  };

  return (
    <PageShell title="Sign up" subtitle="Create an account to make checkout faster and track orders.">
      <div className="authWrap">
        <form className="card authCard" onSubmit={onSubmit} noValidate>
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
              autoComplete="new-password"
              required
              disabled={!supabaseConfigured || working}
            />
            <div className="muted small">Use at least 6 characters.</div>
          </div>

          {error ? (
            <div className="errorBox" role="alert">
              {error}
            </div>
          ) : null}
          {success ? <div className="successBox">{success}</div> : null}

          <button
            className={`btn btn-primary btn-block ${!canSubmit || working ? "is-disabled" : ""}`}
            type="submit"
            disabled={!canSubmit || working}
          >
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
