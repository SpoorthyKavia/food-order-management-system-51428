import React from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";

// PUBLIC_INTERFACE
export default function NotFoundPage() {
  /** 404 page. */
  return (
    <PageShell title="Page not found" subtitle="The page you’re looking for doesn’t exist.">
      <div className="card">
        <p className="muted">Use the menu to continue.</p>
        <div className="row row--right">
          <Link className="btn btn-primary" to="/">
            Go to menu
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
