import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides Supabase session + auth actions. */
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let unsub = null;

    async function init() {
      if (!supabase) {
        setSession(null);
        setAuthReady(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      setSession(data.session || null);

      const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession || null);
      });

      unsub = listener?.subscription?.unsubscribe;
      setAuthReady(true);
    }

    init();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const value = useMemo(() => {
    const signIn = async ({ email, password }) => {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    };

    const signUp = async ({ email, password }) => {
      if (!supabase) throw new Error("Supabase is not configured.");
      const emailRedirectTo = process.env.REACT_APP_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo }
      });
      if (error) throw error;
    };

    const signOut = async () => {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    };

    return {
      supabaseConfigured: Boolean(supabase),
      authReady,
      session,
      user: session?.user || null,
      signIn,
      signUp,
      signOut
    };
  }, [authReady, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth state/actions. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
