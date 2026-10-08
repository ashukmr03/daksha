import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashSidebar from "../../components/DashSidebar";

export default function Dashboard() {
  const { seller, loading } = useAuth();

  if (loading) return <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>Loading...</div>;
  if (!seller) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
      <DashSidebar />
      <main style={{ flex: 1, padding: 32, overflowY: "auto", background: "var(--cream)" }}>
        <Outlet />
      </main>
    </div>
  );
}
