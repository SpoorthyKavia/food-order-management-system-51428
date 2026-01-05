import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { createOrder } from "../lib/apiClient";
import { useAuth } from "../state/AuthContext";
import { useCart } from "../state/CartContext";

function formatMoney(v) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v);
}

// PUBLIC_INTERFACE
export default function CheckoutPage() {
  /** Checkout page with order summary and customer information. */
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const deliveryFee = items.length ? 3.5 : 0;
  const tax = subtotal * 0.0825;
  const total = subtotal + deliveryFee + tax;

  const canPlace = useMemo(() => {
    return items.length > 0 && fullName.trim().length >= 2 && phone.trim().length >= 7;
  }, [items.length, fullName, phone]);

  const placeOrder = async () => {
    setError("");
    setPlacing(true);
    try {
      const customer = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
        email: user?.email || null
      };

      const order = await createOrder({
        items: items.map((x) => ({ id: x.id, name: x.name, price: x.price, quantity: x.quantity })),
        customer
      });

      // Persist for status fallback and deep-linking.
      try {
        localStorage.setItem(`order:${order.id}`, JSON.stringify(order));
        localStorage.setItem("lastOrderId", order.id);
      } catch {
        // ignore
      }

      clear();
      navigate(`/orders/${encodeURIComponent(order.id)}`);
    } catch (e) {
      setError(e?.message || "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <PageShell title="Checkout" subtitle="Enter your details and confirm your order.">
      {items.length === 0 ? (
        <div className="card">
          <p className="muted">Your cart is empty. Add items before checking out.</p>
        </div>
      ) : (
        <div className="layout2">
          <section className="card">
            <h2 className="h2">Customer</h2>

            {!user ? (
              <div className="callout">
                <div className="strong">Tip</div>
                <div className="muted small">
                  You can place an order without signing in, but logging in will help you track orders
                  across devices.
                </div>
              </div>
            ) : null}

            <div className="formGrid">
              <div>
                <label className="label" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Alex Johnson"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="label" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., (555) 123-4567"
                  autoComplete="tel"
                />
              </div>
              <div className="span2">
                <label className="label" htmlFor="notes">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  className="input textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Allergies, delivery notes, etc."
                />
              </div>
            </div>

            {error ? <div className="errorBox">{error}</div> : null}

            <div className="row row--right">
              <button className="btn btn-primary" onClick={placeOrder} disabled={!canPlace || placing}>
                {placing ? "Placing order…" : "Place order"}
              </button>
            </div>
          </section>

          <aside className="card">
            <h2 className="h2">Order summary</h2>
            <div className="list">
              {items.map((x) => (
                <div className="list__row" key={x.id}>
                  <span className="muted">
                    {x.quantity}× {x.name}
                  </span>
                  <span className="strong">{formatMoney(x.price * x.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="divider" />

            <div className="kv">
              <div className="kv__row">
                <span className="muted">Subtotal</span>
                <span className="strong">{formatMoney(subtotal)}</span>
              </div>
              <div className="kv__row">
                <span className="muted">Delivery</span>
                <span className="strong">{formatMoney(deliveryFee)}</span>
              </div>
              <div className="kv__row">
                <span className="muted">Tax</span>
                <span className="strong">{formatMoney(tax)}</span>
              </div>
              <div className="kv__row kv__row--total">
                <span className="muted">Total</span>
                <span className="strong">{formatMoney(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </PageShell>
  );
}
