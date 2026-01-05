import React, { useEffect, useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import { getMenuItems } from "../lib/apiClient";
import { useCart } from "../state/CartContext";

function formatMoney(v) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v);
}

// PUBLIC_INTERFACE
export default function MenuPage() {
  /** Menu browsing page; add items to cart. */
  const { addItem } = useCart();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      const data = await getMenuItems();
      if (!alive) return;
      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter(
      (x) =>
        String(x.name || "").toLowerCase().includes(qq) ||
        String(x.description || "").toLowerCase().includes(qq)
    );
  }, [items, q]);

  return (
    <PageShell
      title="Menu"
      subtitle="Browse today’s selection and add your favorites to the cart."
      right={
        <div className="search">
          <label className="srOnly" htmlFor="menuSearch">
            Search menu
          </label>
          <input
            id="menuSearch"
            className="input"
            placeholder="Search (e.g., pizza, salad)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      }
    >
      {loading ? (
        <div className="card">
          <p className="muted">Loading menu…</p>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((item) => (
            <article className="card card--menuItem" key={item.id}>
              <div className="card__media">
                {item.imageUrl ? (
                  <img className="mediaImg" src={item.imageUrl} alt={item.name} loading="lazy" />
                ) : (
                  <div className="mediaPlaceholder" aria-hidden="true" />
                )}
              </div>
              <div className="card__body">
                <div className="card__titleRow">
                  <h2 className="h2">{item.name}</h2>
                  <span className="price">{formatMoney(item.price)}</span>
                </div>
                <p className="muted">{item.description}</p>
              </div>
              <div className="card__actions">
                <button className="btn btn-primary" onClick={() => addItem(item)}>
                  Add to cart
                </button>
              </div>
            </article>
          ))}
          {filtered.length === 0 ? (
            <div className="card">
              <p className="muted">No items match your search.</p>
            </div>
          ) : null}
        </div>
      )}
    </PageShell>
  );
}
