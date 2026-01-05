import React from "react";
import NavBar from "./NavBar";

// PUBLIC_INTERFACE
export default function PageShell({ title, subtitle, children, right }) {
  /** Shared page layout with header section. */
  return (
    <div className="app">
      <NavBar />
      <main className="container page">
        <div className="page__header">
          <div>
            <h1 className="h1">{title}</h1>
            {subtitle ? <p className="muted">{subtitle}</p> : null}
          </div>
          {right ? <div className="page__headerRight">{right}</div> : null}
        </div>
        {children}
      </main>
      <footer className="footer">
        <div className="container footer__inner">
          <span className="muted">© {new Date().getFullYear()} Ocean Bistro</span>
          <span className="muted">Classic Ocean Professional theme</span>
        </div>
      </footer>
    </div>
  );
}
