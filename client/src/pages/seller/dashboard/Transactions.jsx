import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import StatusBadge from "../../../components/StatusBadge";
import { useToast } from "../../../components/Toast";

export default function Transactions() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get("/orders/seller")
      .then(r => setOrders(r.data.filter(o => ["payment_done","delivered"].includes(o.status))))
      .catch(() => toast("Could not load transactions", "error"))
      .finally(() => setLoading(false));
  }, []);

  const total = orders.reduce((s, o) => s + o.total, 0);
  const avg = orders.length ? Math.round(total / orders.length) : 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.55rem", fontWeight: 800, color: "var(--plum)" }}>Transaction History</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 4 }}>All completed payments — every rupee tracked.</p>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
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
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <h3>No transactions yet</h3>
            <p>Completed paid orders will appear here</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o._id}>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{i + 1}</td>
                  <td><strong>{o.buyerName}</strong></td>
                  <td style={{ fontSize: "0.83rem" }}>{o.items.map(i => `${i.name} x${i.qty}`).join(", ")}</td>
                  <td style={{ fontWeight: 700, color: "var(--success)" }}>+Rs.{o.total}</td>
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
