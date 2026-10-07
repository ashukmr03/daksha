import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import { useToast } from "../../../components/Toast";

export default function Earnings() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get("/orders/seller")
      .then(r => setOrders(r.data.filter(o => ["payment_done","delivered"].includes(o.status))))
      .catch(() => toast("Could not load earnings", "error"))
      .finally(() => setLoading(false));
  }, []);

  const monthly = {};
  orders.forEach(o => {
    const d = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const lbl = d.toLocaleString("default", { month: "short", year: "numeric" });
    if (!monthly[key]) monthly[key] = { label: lbl, revenue: 0, count: 0 };
    monthly[key].revenue += o.total;
    monthly[key].count++;
  });

  const sorted = Object.entries(monthly).sort((a,b) => a[0].localeCompare(b[0]));
  const last6 = sorted.slice(-6);
  const maxVal = Math.max(...last6.map(([,v]) => v.revenue), 1);

  const now = new Date();
  const thisKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const lastDate = new Date(now.getFullYear(), now.getMonth()-1, 1);
  const lastKey = `${lastDate.getFullYear()}-${String(lastDate.getMonth()+1).padStart(2,"0")}`;
  const thisMonth = monthly[thisKey]?.revenue || 0;
  const lastMonth = monthly[lastKey]?.revenue || 0;
  const bestMonth = sorted.reduce((b, [,v]) => v.revenue > b ? v.revenue : b, 0);
  const allTime = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.55rem", fontWeight: 800, color: "var(--plum)" }}>Monthly Earnings</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 4 }}>Your revenue breakdown by month</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">Rs.{thisMonth}</div>
          <div className="stat-label">This Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">Rs.{lastMonth}</div>
          <div className="stat-label">Last Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">Rs.{bestMonth}</div>
          <div className="stat-label">Best Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">Rs.{allTime}</div>
          <div className="stat-label">All Time</div>
        </div>
      </div>

      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Monthly Revenue — Last 6 Months</h3>
        {last6.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No data yet</div>
        ) : (
          <div style={styles.barChart}>
            {last6.map(([key, v]) => {
              const pct = Math.round((v.revenue / maxVal) * 100);
              return (
                <div key={key} style={styles.barWrap}>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: 4 }}>Rs.{v.revenue}</div>
                  <div style={{ ...styles.bar, height: `${pct}%`, minHeight: 4 }} title={`${v.label}: Rs.${v.revenue}`} />
                  <div style={styles.barLabel}>{v.label}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="table-card">
        <div className="table-card-header"><h3>Monthly Breakdown</h3></div>
        {loading ? (
          <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}><h3>No earnings data yet</h3></div>
        ) : (
          <table>
            <thead><tr><th>Month</th><th>Orders</th><th>Revenue</th><th>Avg Order</th></tr></thead>
            <tbody>
              {[...sorted].reverse().map(([key, v]) => (
                <tr key={key}>
                  <td><strong>{v.label}</strong></td>
                  <td>{v.count}</td>
                  <td style={{ fontWeight: 700, color: "var(--success)" }}>Rs.{v.revenue}</td>
                  <td style={{ color: "var(--text-muted)" }}>Rs.{v.count ? Math.round(v.revenue/v.count) : 0}</td>
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
  chartCard: {
    background: "var(--white)", border: "1px solid var(--border)",
    borderRadius: "var(--radius)", padding: 22, marginBottom: 24
  },
  chartTitle: { fontSize: "1rem", fontWeight: 700, color: "var(--plum)", marginBottom: 20 },
  barChart: { display: "flex", alignItems: "flex-end", gap: 8, height: 140 },
  barWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 4 },
  bar: { width: "100%", background: "linear-gradient(to top, var(--rose-dark), var(--rose-light))", borderRadius: "4px 4px 0 0" },
  barLabel: { fontSize: "0.7rem", color: "var(--text-muted)" }
};
