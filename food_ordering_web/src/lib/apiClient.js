/**
 * Lightweight API client for the Food Ordering backend.
 * The backend currently exposes only a health check in this repo snapshot,
 * so this client includes fallbacks (static menu + local checkout simulation)
 * to keep the end-to-end UI flow functional.
 */

const DEFAULT_BASE_URL = "http://localhost:3001";

function getBaseUrl() {
  return process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL;
}

async function request(path, { method = "GET", body, headers } = {}) {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  // Some endpoints might not exist; bubble up for callers to fallback.
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Request failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.bodyText = text;
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

const staticMenu = [
  {
    id: "burger-classic",
    name: "Classic Burger",
    description: "Beef patty, cheddar, lettuce, tomato, house sauce.",
    price: 12.5,
    imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=60"
  },
  {
    id: "salmon-bowl",
    name: "Salmon Bowl",
    description: "Roasted salmon, rice, greens, sesame dressing.",
    price: 15.0,
    imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=60"
  },
  {
    id: "margherita",
    name: "Margherita Pizza",
    description: "San Marzano tomatoes, mozzarella, basil, olive oil.",
    price: 14.0,
    imageUrl: "https://images.unsplash.com/photo-1548365328-9f547f05b5ae?auto=format&fit=crop&w=900&q=60"
  },
  {
    id: "avocado-salad",
    name: "Avocado Salad",
    description: "Avocado, mixed greens, citrus vinaigrette, seeds.",
    price: 10.0,
    imageUrl: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=900&q=60"
  }
];

// PUBLIC_INTERFACE
export async function getHealth() {
  /** Returns backend health if available. */
  return request("/", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function getMenuItems() {
  /** Fetch menu items from backend; falls back to a static menu. */
  try {
    // Prefer a conventional REST path if backend implements it.
    return await request("/menu", { method: "GET" });
  } catch (e) {
    return staticMenu;
  }
}

// PUBLIC_INTERFACE
export async function createOrder({ items, customer }) {
  /**
   * Create an order.
   * - If backend supports /orders, we POST there.
   * - Otherwise simulate an order and return an order-like object.
   */
  try {
    return await request("/orders", { method: "POST", body: { items, customer } });
  } catch (e) {
    const now = new Date();
    return {
      id: `local_${now.getTime()}`,
      status: "confirmed",
      createdAt: now.toISOString(),
      items,
      customer
    };
  }
}

// PUBLIC_INTERFACE
export async function getOrderStatus(orderId) {
  /** Fetch order status; falls back to reading localStorage simulated orders. */
  try {
    return await request(`/orders/${encodeURIComponent(orderId)}`, { method: "GET" });
  } catch (e) {
    const raw = localStorage.getItem(`order:${orderId}`);
    if (raw) return JSON.parse(raw);
    // Minimal fallback
    return { id: orderId, status: "processing" };
  }
}
