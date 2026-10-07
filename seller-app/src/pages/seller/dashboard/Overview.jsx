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
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/seller")
      .then(r => setOrders(r.data))
      .catch(() => toast("Could not load orders", "error"))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const todayOrders  = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const todayRevenue = todayOrders.filter(o => ["payment_done","delivered"].includes(o.status)).reduce((s,o) => s+o.total, 0);
  const pending      = orders.filter(o => o.status === "pending");
  const accepted     = orders.filter(o => o.status === "accepted");
  const completed    = orders.filter(o => ["payment_done","delivered"].includes(o.status));
  const totalRevenue = completed.reduce((s,o) => s+o.total, 0);

  const hour  = new Date().getHours();
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

  const stats = [
    { label: "Today's Revenue", value: `Rs.${todayRevenue}`, sub: `${todayOrders.length} orders today`,    accent: "var(--pink)" },
    { label: "Pending",         value: pending.length,       sub: "Awaiting your review",                  accent: "var(--warning)" },
    { label: "Accepted",        value: accepted.length,      sub: "Awaiting payment",                      accent: "var(--success)" },
    { label: "Total Revenue",   value: `Rs.${totalRevenue}`, sub: `${completed.length} completed`,         accent: "var(--purple-mid)" },
  ];

  return (
    <div>
      <div style={styles.greeting}>
        <h1 style={styles.greetTitle}>{greet}, {seller?.ownerName?.split(" ")[0]}</h1>
        <p style={styles.greetSub}>{seller?.shopName} &middot; {seller?.locality}</p>
      </div>

      <div style={styles.upiCard}>
        <div style={styles.upiIconBox}>UPI</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "var(--purple)", fontSize: "0.95rem" }}>
            Payments go directly to you
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 3 }}>
            UPI ID: <strong style={{ color: "var(--pink)" }}>{seller?.upiId}</strong>
          </div>
        </div>
        <span className="badge badge-green">Active</span>
      </div>

      <div className="stat-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.accent}` }}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div style={{ fontSize: "0.77rem", color: "var(--text-muted)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <h3>Pending Orders — Action Required</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard/orders")}>View All</button>
        </div>
        {loading ? (
          <div style={styles.centered}>Loading...</div>
        ) : pending.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <h3>All caught up</h3>
            <p>No pending orders right now</p>
          </div>
        ) : (
          pending.slice(0, 5).map(o => (
            <div key={o._id} style={styles.pendingRow} onClick={() => navigate("/dashboard/orders")}>
              <div style={styles.pendingLeft}>
                <div style={styles.pendingName}>{o.buyerName}</div>
                <div style={styles.pendingItems}>{o.items.map(i => `${i.name} x${i.qty}`).join(", ")}</div>
              </div>
              <div style={styles.pendingRight}>
                <strong style={{ color: "var(--pink)", fontSize: "0.95rem" }}>Rs.{o.total}</strong>
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
              <div style={styles.pendingLeft}>
                <div style={styles.pendingName}>{o.buyerName}</div>
                <div style={styles.pendingItems}>{o.items.map(i => `${i.name} x${i.qty}`).join(", ")}</div>
              </div>
              <div style={styles.pendingRight}>
                <strong style={{ color: "var(--success)", fontSize: "0.95rem" }}>+Rs.{o.total}</strong>
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
  greeting: { marginBottom: 24 },
  greetTitle: { fontSize: "1.6rem", fontWeight: 800, color: "var(--purple)" },
  greetSub: { color: "var(--text-muted)", fontSize: "0.88rem", marginTop: 4 },
  upiCard: {
    background: "white", border: "1px solid var(--border-light)",
    borderRadius: 16, padding: "16px 20px",
    display: "flex", alignItems: "center", gap: 14, marginBottom: 24,
    boxShadow: "var(--shadow)"
  },
  upiIconBox: {
    width: 44, height: 44, borderRadius: 12,
    background: "var(--pink-pale)", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: "0.65rem", fontWeight: 800, color: "var(--pink-dark)", flexShrink: 0
  },
  centered: { padding: 40, textAlign: "center", color: "var(--text-muted)" },
  pendingRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 22px", borderBottom: "1px solid var(--border-light)",
    cursor: "pointer", transition: "background 0.15s", gap: 12
  },
  pendingLeft: { flex: 1, minWidth: 0 },
  pendingName: { fontWeight: 600, color: "var(--purple)", fontSize: "0.9rem" },
  pendingItems: { fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  pendingRight: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
};
