import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { BuyerProvider } from "./context/BuyerContext";
import { ToastProvider } from "./components/Toast";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import BuyerLogin   from "./pages/buyer/Login";
import Home         from "./pages/buyer/Home";
import SellerDetail from "./pages/buyer/SellerDetail";
import MyOrders     from "./pages/buyer/MyOrders";

export default function App() {
  return (
    <BuyerProvider>
      <ToastProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<BuyerLogin />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/seller/:id" element={
            <ProtectedRoute>
              <SellerDetail />
            </ProtectedRoute>
          } />
          <Route path="/my-orders" element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BuyerProvider>
  );
}
