import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useCart } from "../state/CartContext";

// PUBLIC_INTERFACE
export default function NavBar() {
  /** Top navigation bar with auth controls and cart access. */
  const { user, signOut, supabaseConfigured } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const cartCount = items.reduce((sum, x) => sum + x.quantity, 0);

  const onLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="topnav">
      <div className="topnav__inner container">
        <Link to="/" className="brand" aria-label="Ocean Bistro Home">
          <span className="brand__mark" aria-hidden="true">
            OB
          </span>
          <span className="brand__text">
            <span className="brand__title">Ocean Bistro</span>
            <span className="brand__subtitle">Order Online</span>
          </span>
        </Link>

        <nav className="topnav__links" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "navlink is-active" : "navlink")}>
            Menu
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? "navlink is-active" : "navlink")}>
            Order Status
          </NavLink>
        </nav>

        <div className="topnav__actions">
          <Link to="/cart" className="btn btn-secondary btn-small" aria-label="Open cart">
            Cart
            <span className="pill" aria-label={`${cartCount} items in cart`}>
              {cartCount}
            </span>
          </Link>

          {!supabaseConfigured ? (
            <span className="hint" title="Configure Supabase env vars to enable auth">
              Auth not configured
            </span>
          ) : user ? (
            <>
              <span className="userchip" title={user.email}>
                {user.email}
              </span>
              <button className="btn btn-primary btn-small" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost btn-small" to="/login">
                Login
              </Link>
              <Link className="btn btn-primary btn-small" to="/signup">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
