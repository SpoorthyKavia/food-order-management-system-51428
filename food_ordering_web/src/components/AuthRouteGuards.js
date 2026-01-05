import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

/**
 * Simple route guards used by React Router route `element` wrappers.
 * - Only guards auth pages (login/signup) in this task.
 */

// PUBLIC_INTERFACE
export function RedirectIfAuthed({ children, to = "/menu" }) {
  /** Redirect authenticated users away from auth pages (login/signup). */
  const { authReady, user } = useAuth();

  // Avoid redirect flicker while we don't yet know if there's a session.
  if (!authReady) return null;

  return user ? <Navigate to={to} replace /> : children;
}
