import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import StatusBadge from "../../../components/StatusBadge";
import { useToast } from "../../../components/Toast";

export default function Transactions() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get("/orders/seller")
      .then(r => setOrders(r.data.filter(o => ["payment_done","delivered"].includes(o.status))))
      .catch(() => toast("Could not load transactions", "error"))
      .finally(() => setLoading(false));
  }, []);

  const total = orders.reduce((s, o) => s + o.total, 0);
  const avg   = orders.length ? Math.round(total / orders.length) : 0;

  return (
    <div>
      <div style={styles.pageHead}>
        <h1 style={styles.title}>Transaction History</h1>
        <p style={styles.sub}>All completed payments — every rupee tracked.</p>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
        <div className="stat-card">
          <div className="stat-value">Rs.{total}</div>
          <div className="stat-label">Total Collected</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">Paid Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">Rs.{avg}</div>
          <div className="stat-label">Avg Order Value</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header"><h3>Payment Records</h3></div>
        {loading ? (
          <div style={styles.centered}>Loading...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state" style={{ padding: 50 }}>
            <h3>No transactions yet</h3>
            <p>Completed paid orders will appear here</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th><th>Customer</th><th>Items</th><th>Amount</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o._id}>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600 }}>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--purple)" }}>{o.buyerName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{o.buyerPhone}</div>
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {o.items.map(i => `${i.name} x${i.qty}`).join(", ")}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: "var(--success)", background: "var(--success-bg)", padding: "3px 10px", borderRadius: 20, fontSize: "0.85rem" }}>
                      +Rs.{o.total}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageHead: { marginBottom: 24 },
  title: { fontSize: "1.55rem", fontWeight: 800, color: "var(--purple)" },
  sub: { color: "var(--text-muted)", fontSize: "0.88rem", marginTop: 4 },
  centered: { padding: 50, textAlign: "center", color: "var(--text-muted)" },
};
