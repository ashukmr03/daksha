import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import { useToast } from "../../../components/Toast";

export default function Pending() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    api.get("/orders/seller")
      .then(r => setOrders(r.data.filter(o => o.status === "pending")))
      .catch(() => toast("Could not load orders", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const act = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast(status === "accepted" ? "Order accepted! Customer can now pay." : "Order rejected.", status === "accepted" ? "success" : "");
      load();
    } catch {
      toast("Could not update", "error");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.55rem", fontWeight: 800, color: "var(--plum)" }}>Pending Orders</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 4 }}>
          Accept to let the customer pay, or reject if you cannot fulfil.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <h3>No pending orders</h3>
          <p>New orders will appear here for your review.</p>
        </div>
      ) : (
        orders.map(o => (
          <div key={o._id} className="table-card" style={{ marginBottom: 14 }}>
            <div style={{ padding: "18px 20px" }}>
              <div style={styles.timelineRow}>
                {["Ordered","Accepted","Paid","Delivered"].map((lbl, i) => (
                  <React.Fragment key={lbl}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ ...styles.dot, ...(i === 0 ? styles.dotDone : i === 1 ? styles.dotActive : {}) }}>
                        {i === 0 ? "✓" : i + 1}
                      </div>
                      <div style={styles.dotLabel}>{lbl}</div>
                    </div>
                    {i < 3 && <div style={styles.line} />}
                  </React.Fragment>
                ))}
              </div>

              <div style={styles.buyerBox}>
                <div style={{ fontWeight: 700, color: "var(--plum)" }}>{o.buyerName}</div>
                <div style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}>{o.buyerPhone}</div>
                {o.note && <div style={{ marginTop: 6, fontSize: "0.82rem", background: "white", padding: "6px 10px", borderRadius: 4 }}>Note: {o.note}</div>}
              </div>

              <table style={{ marginBottom: 12 }}>
                <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {o.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.qty}</td>
                      <td>Rs.{item.price}</td>
                      <td style={{ fontWeight: 700 }}>Rs.{item.price * item.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={styles.totalRow}>
                <span>Total</span>
                <span style={{ fontWeight: 800, color: "var(--rose-dark)", fontSize: "1.05rem" }}>Rs.{o.total}</span>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-success" onClick={() => act(o._id, "accepted")}>Accept Order</button>
                <button className="btn btn-danger"  onClick={() => act(o._id, "cancelled")}>Reject</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  timelineRow: { display: "flex", alignItems: "center", marginBottom: 18 },
  dot: {
    width: 28, height: 28, borderRadius: "50%",
    background: "var(--cream-dark)", border: "2px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)"
  },
  dotDone: { background: "var(--success)", borderColor: "var(--success)", color: "white" },
  dotActive: { background: "var(--rose)", borderColor: "var(--rose)", color: "white" },
  dotLabel: { fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 4, textAlign: "center" },
  line: { flex: 1, height: 2, background: "var(--border)", marginBottom: 22 },
  buyerBox: { background: "var(--cream-dark)", borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 14 },
  totalRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "var(--cream-dark)", borderRadius: "var(--radius-sm)",
    padding: "12px 14px", marginBottom: 16
  }
};
