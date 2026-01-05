import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import { RedirectIfAuthed } from "./components/AuthRouteGuards";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderStatusListPage from "./pages/OrderStatusListPage";
import OrderStatusDetailPage from "./pages/OrderStatusDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFoundPage from "./pages/NotFoundPage";

// PUBLIC_INTERFACE
function App() {
  /** Application root (routes only). Providers are mounted in index.js. */
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/menu" replace />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />

      <Route path="/orders" element={<OrderStatusListPage />} />
      <Route path="/orders/:orderId" element={<OrderStatusDetailPage />} />

      <Route
        path="/login"
        element={
          <RedirectIfAuthed to="/menu">
            <LoginPage />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/signup"
        element={
          <RedirectIfAuthed to="/menu">
            <SignupPage />
          </RedirectIfAuthed>
        }
      />

      <Route path="/home" element={<Navigate to="/menu" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
