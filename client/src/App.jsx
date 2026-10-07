import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BuyerProvider } from "./context/BuyerContext";
import { ToastProvider } from "./components/Toast";
import Navbar from "./components/Navbar";

import Home from "./pages/buyer/Home";
import SellerDetail from "./pages/buyer/SellerDetail";
import MyOrders from "./pages/buyer/MyOrders";

import Login from "./pages/seller/Login";
import Register from "./pages/seller/Register";
import Dashboard from "./pages/seller/Dashboard";
import Overview from "./pages/seller/dashboard/Overview";
import Orders from "./pages/seller/dashboard/Orders";
import Transactions from "./pages/seller/dashboard/Transactions";
import Earnings from "./pages/seller/dashboard/Earnings";
import Products from "./pages/seller/dashboard/Products";

export default function App() {
  return (
    <AuthProvider>
      <BuyerProvider>
        <ToastProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/seller/:id" element={<SellerDetail />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/seller/login" element={<Login />} />
            <Route path="/seller/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Overview />} />
              <Route path="orders" element={<Orders />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="earnings" element={<Earnings />} />
              <Route path="products" element={<Products />} />
            </Route>
          </Routes>
        </ToastProvider>
      </BuyerProvider>
    </AuthProvider>
  );
}
