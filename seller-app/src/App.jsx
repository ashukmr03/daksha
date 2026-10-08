import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import Navbar from "./components/Navbar";

import Login      from "./pages/seller/Login";
import Register   from "./pages/seller/Register";
import Dashboard  from "./pages/seller/Dashboard";
import Overview   from "./pages/seller/dashboard/Overview";
import Orders     from "./pages/seller/dashboard/Orders";
import Transactions from "./pages/seller/dashboard/Transactions";
import Earnings   from "./pages/seller/dashboard/Earnings";
import Products   from "./pages/seller/dashboard/Products";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Navbar />
        <Routes>
          {/* Default: go to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index          element={<Overview />} />
            <Route path="orders"       element={<Orders />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="earnings"     element={<Earnings />} />
            <Route path="products"     element={<Products />} />
          </Route>
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
