import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";

function readRecentOrders() {
  const orders = [];
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith("order:")) continue;
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const order = JSON.parse(raw);
      orders.push(order);
    }
  } catch {
    // ignore
  }
  orders.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  return orders.slice(0, 20);
}

// PUBLIC_INTERFACE
export default function OrderStatusListPage() {
  /** Order status landing page: search by order id and show recent local orders. */
  const lastOrderId = useMemo(() => {
    try {
      return localStorage.getItem("lastOrderId") || "";
    } catch {
      return "";
    }
  }, []);

  const [orderId, setOrderId] = useState(lastOrderId);
  const recent = useMemo(() => readRecentOrders(), []);

  return (
    <PageShell
      title="Order Status"
      subtitle="Enter an order ID to view the latest status. Recent orders are shown when available."
      right={
        <div className="row">
          <input
            className="input"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Order ID…"
            aria-label="Order ID"
          />
          <Link
            className={`btn btn-primary btn-small ${orderId.trim() ? "" : "is-disabled"}`}
            to={orderId.trim() ? `/orders/${encodeURIComponent(orderId.trim())}` : "#"}
            onClick={(e) => {
              if (!orderId.trim()) e.preventDefault();
            }}
          >
            View
          </Link>
        </div>
      }
    >
      <div className="card">
        <h2 className="h2">Recent</h2>
        {recent.length === 0 ? (
          <p className="muted">No recent orders stored on this device yet.</p>
        ) : (
          <div className="list">
            {recent.map((o) => (
              <Link className="list__link" to={`/orders/${encodeURIComponent(o.id)}`} key={o.id}>
                <div>
                  <div className="strong">Order {o.id}</div>
                  <div className="muted small">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}</div>
                </div>
                <span className="badge">{String(o.status || "processing")}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
