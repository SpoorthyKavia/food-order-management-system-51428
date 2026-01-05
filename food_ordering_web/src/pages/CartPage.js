import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useCart } from "../state/CartContext";

function formatMoney(v) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v);
}

// PUBLIC_INTERFACE
export default function CartPage() {
  /** Cart management page. */
  const { items, subtotal, removeItem, updateQuantity, clear } = useCart();
  const navigate = useNavigate();

  const deliveryFee = items.length ? 3.5 : 0;
  const tax = subtotal * 0.0825;
  const total = subtotal + deliveryFee + tax;

  return (
    <PageShell
      title="Cart"
      subtitle="Review your items, update quantities, and proceed to checkout."
      right={
        items.length ? (
          <button className="btn btn-ghost btn-small" onClick={clear}>
            Clear cart
          </button>
        ) : null
      }
    >
      {items.length === 0 ? (
        <div className="card">
          <p className="muted">Your cart is empty.</p>
          <div className="row row--right">
            <Link to="/" className="btn btn-primary">
              Browse menu
            </Link>
          </div>
        </div>
      ) : (
        <div className="layout2">
          <section className="card">
            <div className="table">
              <div className="table__head">
                <div>Item</div>
                <div className="taRight">Price</div>
                <div className="taRight">Qty</div>
                <div className="taRight">Line</div>
                <div className="taRight"> </div>
              </div>

              {items.map((x) => (
                <div className="table__row" key={x.id}>
                  <div>
                    <div className="strong">{x.name}</div>
                    <div className="muted small">{x.description}</div>
                  </div>
                  <div className="taRight">{formatMoney(x.price)}</div>
                  <div className="taRight">
                    <label className="srOnly" htmlFor={`qty-${x.id}`}>
                      Quantity for {x.name}
                    </label>
                    <input
                      id={`qty-${x.id}`}
                      className="input input--qty"
                      type="number"
                      min={1}
                      value={x.quantity}
                      onChange={(e) => updateQuantity(x.id, e.target.value)}
                    />
                  </div>
                  <div className="taRight">{formatMoney(x.price * x.quantity)}</div>
                  <div className="taRight">
                    <button className="btn btn-danger btn-small" onClick={() => removeItem(x.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="card">
            <h2 className="h2">Summary</h2>
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
            <div className="stack">
              <button className="btn btn-primary btn-block" onClick={() => navigate("/checkout")}>
                Checkout
              </button>
              <Link className="btn btn-secondary btn-block" to="/">
                Add more items
              </Link>
            </div>
          </aside>
        </div>
      )}
    </PageShell>
  );
}
