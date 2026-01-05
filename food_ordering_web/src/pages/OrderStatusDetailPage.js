import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import { getOrderStatus } from "../lib/apiClient";

function formatMoney(v) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(v);
}

function statusStep(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("confirm")) return 1;
  if (s.includes("prepar")) return 2;
  if (s.includes("out") || s.includes("deliver")) return 3;
  if (s.includes("complete") || s.includes("deliver")) return 4;
  return 2;
}

// PUBLIC_INTERFACE
export default function OrderStatusDetailPage() {
  /** Detail page for a specific order ID. */
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      const data = await getOrderStatus(orderId);
      if (!alive) return;
      setOrder(data);
      setLoading(false);

      // Store as latest for convenience
      try {
        localStorage.setItem("lastOrderId", orderId);
      } catch {
        // ignore
      }
    }

    load();

    // Very simple "status progression" simulation for local orders:
    const timer = setInterval(() => {
      setOrder((prev) => {
        if (!prev) return prev;
        const id = prev.id;
        if (!id || !String(id).startsWith("local_")) return prev;

        const current = String(prev.status || "confirmed").toLowerCase();
        const nextStatus =
          current === "confirmed"
            ? "preparing"
            : current === "preparing"
              ? "out_for_delivery"
              : current === "out_for_delivery"
                ? "completed"
                : current;

        if (nextStatus === current) return prev;

        const updated = { ...prev, status: nextStatus };
        try {
          localStorage.setItem(`order:${id}`, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    }, 6000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [orderId]);

  const step = useMemo(() => statusStep(order?.status), [order?.status]);

  return (
    <PageShell
      title={`Order ${orderId}`}
      subtitle="Live status updates (backend if available; otherwise a local simulation)."
      right={
        <Link className="btn btn-secondary btn-small" to="/orders">
          Back
        </Link>
      }
    >
      {loading ? (
        <div className="card">
          <p className="muted">Loading status…</p>
        </div>
      ) : (
        <div className="layout2">
          <section className="card">
            <div className="row row--between">
              <div>
                <div className="muted small">Current status</div>
                <div className="h2">{String(order?.status || "processing")}</div>
              </div>
              <span className="badge badge--primary">#{orderId}</span>
            </div>

            <div className="divider" />

            <div className="steps" aria-label="Order progress">
              <div className={step >= 1 ? "step is-done" : "step"}>
                <div className="step__dot" />
                <div className="step__label">Confirmed</div>
              </div>
              <div className={step >= 2 ? "step is-done" : "step"}>
                <div className="step__dot" />
                <div className="step__label">Preparing</div>
              </div>
              <div className={step >= 3 ? "step is-done" : "step"}>
                <div className="step__dot" />
                <div className="step__label">Out for delivery</div>
              </div>
              <div className={step >= 4 ? "step is-done" : "step"}>
                <div className="step__dot" />
                <div className="step__label">Completed</div>
              </div>
            </div>
          </section>

          <aside className="card">
            <h2 className="h2">Order details</h2>
            {Array.isArray(order?.items) && order.items.length ? (
              <>
                <div className="list">
                  {order.items.map((x) => (
                    <div className="list__row" key={x.id || `${x.name}-${x.price}`}>
                      <span className="muted">
                        {x.quantity}× {x.name}
                      </span>
                      <span className="strong">{formatMoney((x.price || 0) * (x.quantity || 0))}</span>
                    </div>
                  ))}
                </div>
                <div className="divider" />
              </>
            ) : (
              <p className="muted">Items are not available for this order.</p>
            )}

            {order?.customer ? (
              <div className="kv">
                <div className="kv__row">
                  <span className="muted">Name</span>
                  <span className="strong">{order.customer.fullName || "—"}</span>
                </div>
                <div className="kv__row">
                  <span className="muted">Phone</span>
                  <span className="strong">{order.customer.phone || "—"}</span>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      )}
    </PageShell>
  );
}
