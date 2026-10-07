import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import { useToast } from "../../../components/Toast";

export default function Earnings() {
  const [orders, setOrders]   = useState([]);
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
    const d   = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const lbl = d.toLocaleString("default", { month: "short", year: "numeric" });
    if (!monthly[key]) monthly[key] = { label: lbl, revenue: 0, count: 0 };
    monthly[key].revenue += o.total;
    monthly[key].count++;
  });

  const sorted  = Object.entries(monthly).sort((a,b) => a[0].localeCompare(b[0]));
  const last6   = sorted.slice(-6);
  const maxVal  = Math.max(...last6.map(([,v]) => v.revenue), 1);

  const now      = new Date();
  const thisKey  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const lastDate = new Date(now.getFullYear(), now.getMonth()-1, 1);
  const lastKey  = `${lastDate.getFullYear()}-${String(lastDate.getMonth()+1).padStart(2,"0")}`;
  const thisMonth  = monthly[thisKey]?.revenue || 0;
  const lastMonth  = monthly[lastKey]?.revenue || 0;
  const bestMonth  = sorted.reduce((b,[,v]) => v.revenue > b ? v.revenue : b, 0);
  const allTime    = orders.reduce((s,o) => s+o.total, 0);

  return (
    <div>
      <div style={styles.pageHead}>
        <h1 style={styles.title}>Monthly Earnings</h1>
        <p style={styles.sub}>Your revenue breakdown by month</p>
      </div>

      <div className="stat-grid">
        {[
          { label: "This Month", value: `Rs.${thisMonth}` },
          { label: "Last Month", value: `Rs.${lastMonth}` },
          { label: "Best Month", value: `Rs.${bestMonth}` },
          { label: "All Time",   value: `Rs.${allTime}`   },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.chartCard}>
        <div style={styles.chartHead}>
          <h3 style={styles.chartTitle}>Revenue — Last 6 Months</h3>
        </div>
        <div style={styles.chartBody}>
          {last6.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.88rem", textAlign: "center", padding: "40px 0" }}>
              No data yet — complete some orders first.
            </div>
          ) : (
            <div style={styles.barChart}>
              {last6.map(([key, v]) => {
                const pct = Math.max(Math.round((v.revenue / maxVal) * 100), 4);
                return (
                  <div key={key} style={styles.barWrap}>
                    <div style={styles.barValue}>Rs.{v.revenue}</div>
                    <div style={styles.barTrack}>
                      <div style={{ ...styles.bar, height: `${pct}%` }} title={`${v.label}: Rs.${v.revenue}`} />
                    </div>
                    <div style={styles.barLabel}>{v.label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header"><h3>Monthly Breakdown</h3></div>
        {loading ? (
          <div style={styles.centered}>Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}><h3>No earnings data yet</h3></div>
        ) : (
          <table>
            <thead><tr><th>Month</th><th>Orders</th><th>Revenue</th><th>Avg Order</th></tr></thead>
            <tbody>
              {[...sorted].reverse().map(([key, v]) => (
                <tr key={key}>
                  <td><strong style={{ color: "var(--purple)" }}>{v.label}</strong></td>
                  <td style={{ color: "var(--text-muted)" }}>{v.count}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: "var(--success)", background: "var(--success-bg)", padding: "3px 10px", borderRadius: 20, fontSize: "0.83rem" }}>
                      Rs.{v.revenue}
                    </span>
                  </td>
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
  pageHead: { marginBottom: 24 },
  title: { fontSize: "1.55rem", fontWeight: 800, color: "var(--purple)" },
  sub: { color: "var(--text-muted)", fontSize: "0.88rem", marginTop: 4 },
  chartCard: {
    background: "white", border: "1px solid var(--border-light)",
    borderRadius: 18, overflow: "hidden", marginBottom: 24, boxShadow: "var(--shadow)"
  },
  chartHead: { padding: "18px 22px", borderBottom: "1px solid var(--border-light)" },
  chartTitle: { fontSize: "1rem", fontWeight: 700, color: "var(--purple)" },
  chartBody: { padding: "24px 28px" },
  barChart: { display: "flex", alignItems: "flex-end", gap: 10, height: 160 },
  barWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", gap: 4 },
  barValue: { fontSize: "0.65rem", color: "var(--text-muted)", whiteSpace: "nowrap" },
  barTrack: { flex: 1, width: "100%", display: "flex", alignItems: "flex-end" },
  bar: {
    width: "100%",
    background: "linear-gradient(to top, var(--pink-dark), var(--pink-light))",
    borderRadius: "6px 6px 0 0", transition: "height 0.4s ease", minHeight: 4
  },
  barLabel: { fontSize: "0.68rem", color: "var(--text-muted)", textAlign: "center" },
  centered: { padding: 50, textAlign: "center", color: "var(--text-muted)" },
};
