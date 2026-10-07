import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/Toast";
import StatusBadge from "../../../components/StatusBadge";
import api from "../../../api/axios";

export default function Overview() {
  const { seller } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/seller")
      .then(r => setOrders(r.data))
      .catch(() => toast("Could not load orders", "error"))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const todayRevenue = todayOrders.filter(o => ["payment_done","delivered"].includes(o.status)).reduce((s,o) => s+o.total, 0);
  const pending = orders.filter(o => o.status === "pending");
  const accepted = orders.filter(o => o.status === "accepted");
  const completed = orders.filter(o => ["payment_done","delivered"].includes(o.status));
  const totalRevenue = completed.reduce((s,o) => s+o.total, 0);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      toast(status === "accepted" ? "Order accepted!" : "Order rejected", status === "accepted" ? "success" : "");
    } catch {
      toast("Could not update order", "error");
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h1>{greet}, {seller?.ownerName?.split(" ")[0]}</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: "0.9rem" }}>
          {seller?.shopName} · {seller?.locality}
        </p>
      </div>

      <div style={styles.upiCard}>
        <div style={styles.upiIcon}>UPI</div>
        <div>
          <div style={{ fontWeight: 700, color: "var(--plum)", fontSize: "0.95rem" }}>Payments go directly to you</div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>
            Customers pay to: <strong style={{ color: "var(--plum)" }}>{seller?.upiId}</strong>
          </div>
        </div>
        <span className="badge badge-green" style={{ marginLeft: "auto" }}>Active</span>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div style={styles.statIcon}>Rs</div>
          <div className="stat-value">Rs.{todayRevenue}</div>
          <div className="stat-label">Today's Revenue</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{todayOrders.length} orders today</div>
        </div>
        <div className="stat-card">
          <div style={styles.statIcon}>{pending.length}</div>
          <div className="stat-value">{pending.length}</div>
          <div className="stat-label">Pending Orders</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Awaiting your review</div>
        </div>
        <div className="stat-card">
          <div style={styles.statIcon}>{accepted.length}</div>
          <div className="stat-value">{accepted.length}</div>
          <div className="stat-label">Accepted</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Awaiting payment</div>
        </div>
        <div className="stat-card">
          <div style={styles.statIcon}>Rs</div>
          <div className="stat-value">Rs.{totalRevenue}</div>
          <div className="stat-label">Total Revenue</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{completed.length} completed</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <h3>Pending Orders — Action Required</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard/orders")}>View All</button>
        </div>
        {loading ? (
          <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
        ) : pending.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <h3>No pending orders</h3>
            <p>You are all caught up!</p>
          </div>
        ) : (
          pending.slice(0, 5).map(o => (
            <div key={o._id} style={styles.pendingRow} onClick={() => navigate("/dashboard/orders")}>
              <div>
                <div style={{ fontWeight: 600 }}>{o.buyerName}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{o.items.map(i => `${i.name} x${i.qty}`).join(", ")}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <strong style={{ color: "var(--rose-dark)" }}>Rs.{o.total}</strong>
                <button className="btn btn-success btn-sm" onClick={e => { e.stopPropagation(); updateStatus(o._id, "accepted"); }}>Accept</button>
                <button className="btn btn-danger btn-sm"  onClick={e => { e.stopPropagation(); updateStatus(o._id, "cancelled"); }}>Reject</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="table-card">
        <div className="table-card-header"><h3>Recently Paid</h3></div>
        {completed.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}><h3>No payments yet</h3></div>
        ) : (
          completed.slice(0, 5).map(o => (
            <div key={o._id} style={styles.pendingRow}>
              <div>
                <div style={{ fontWeight: 600 }}>{o.buyerName}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{o.items.map(i => `${i.name} x${i.qty}`).join(", ")}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <strong style={{ color: "var(--rose-dark)" }}>Rs.{o.total}</strong>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  header: { marginBottom: 24 },
  upiCard: {
    background: "var(--white)", border: "1px solid var(--border)",
    borderRadius: "var(--radius)", padding: 20,
    display: "flex", alignItems: "center", gap: 16, marginBottom: 24
  },
  upiIcon: {
    width: 44, height: 44, borderRadius: 8,
    background: "var(--cream-dark)", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "0.7rem", fontWeight: 800,
    color: "var(--text-muted)", flexShrink: 0
  },
  statIcon: {
    width: 36, height: 36, borderRadius: 6,
    background: "var(--cream-dark)", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "0.7rem", fontWeight: 700,
    color: "var(--text-muted)"
  },
  pendingRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 22px", borderBottom: "1px solid var(--border)",
    cursor: "pointer", transition: "background 0.15s"
  }
};
