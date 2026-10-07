import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import StatusBadge from "../../../components/StatusBadge";
import { useToast } from "../../../components/Toast";

const filters = ["all","pending","accepted","payment_done","delivered","cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/orders/seller")
      .then(r => setOrders(r.data))
      .catch(() => toast("Could not load orders", "error"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      if (selected?._id === orderId) setSelected(prev => ({ ...prev, status }));
      toast(status === "accepted" ? "Order accepted!" : status === "delivered" ? "Marked delivered!" : "Updated", "success");
    } catch {
      toast("Could not update order", "error");
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={{ fontSize: "1.55rem", fontWeight: 800, color: "var(--plum)" }}>All Orders</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 4 }}>Review, accept or reject incoming orders</p>
      </div>

      <div style={styles.filterRow}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-ghost btn-sm`}
            style={{ ...(filter === f ? { background: "var(--rose)", color: "white", borderColor: "var(--rose)" } : {}) }}
          >
            {f === "all" ? "All" : f.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}><h3>No orders found</h3></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o._id} style={{ cursor: "pointer" }} onClick={() => setSelected(o)}>
                  <td>
                    <strong>{o.buyerName}</strong>
                    <br/>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{o.buyerPhone}</span>
                  </td>
                  <td style={{ fontSize: "0.83rem", maxWidth: 180 }}>{o.items.map(i => `${i.name} x${i.qty}`).join(", ")}</td>
                  <td style={{ fontWeight: 700, color: "var(--rose-dark)" }}>Rs.{o.total}</td>
                  <td style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td><StatusBadge status={o.status} /></td>
                  <td onClick={e => e.stopPropagation()}>
                    {o.status === "pending" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(o._id, "accepted")}>Accept</button>
                        <button className="btn btn-danger btn-sm"  onClick={() => updateStatus(o._id, "cancelled")}>Reject</button>
                      </div>
                    )}
                    {(o.status === "accepted" || o.status === "payment_done") && (
                      <button className="btn btn-primary btn-sm" onClick={() => updateStatus(o._id, "delivered")}>Mark Delivered</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <button className="modal-close" onClick={() => setSelected(null)}>x</button>
            <h2>Order Details</h2>
            <p className="modal-sub">Order from {selected.buyerName}</p>

            <div style={styles.detailHead}>
              <div style={{ fontWeight: 700, color: "var(--plum)" }}>{selected.buyerName}</div>
              <div style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}>{selected.buyerPhone}</div>
              {selected.note && <div style={{ marginTop: 6, fontSize: "0.82rem" }}><strong>Note:</strong> {selected.note}</div>}
            </div>

            <table style={{ marginBottom: 14 }}>
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
              <tbody>
                {selected.items.map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.name}</td>
                    <td>{i.qty}</td>
                    <td>Rs.{i.price}</td>
                    <td style={{ fontWeight: 700 }}>Rs.{i.price * i.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={styles.totalRow}>
              <span>Total</span>
              <span style={{ fontWeight: 800, color: "var(--rose-dark)", fontSize: "1.1rem" }}>Rs.{selected.total}</span>
            </div>

            {selected.status === "accepted" && (
              <div style={styles.waitBanner}>Waiting for customer payment — Rs.{selected.total}</div>
            )}
            {["payment_done","delivered"].includes(selected.status) && (
              <div style={styles.paidBanner}>Payment received — Rs.{selected.total}</div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              {selected.status === "pending" && (
                <>
                  <button className="btn btn-success" onClick={() => updateStatus(selected._id, "accepted")}>Accept Order</button>
                  <button className="btn btn-danger" onClick={() => { updateStatus(selected._id, "cancelled"); setSelected(null); }}>Reject</button>
                </>
              )}
              {(selected.status === "accepted" || selected.status === "payment_done") && (
                <button className="btn btn-primary" onClick={() => updateStatus(selected._id, "delivered")}>Mark Delivered</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { marginBottom: 24 },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 },
  detailHead: { background: "var(--cream-dark)", borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 16 },
  totalRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "var(--cream-dark)", borderRadius: "var(--radius-sm)",
    padding: "12px 14px", marginBottom: 14
  },
  waitBanner: {
    background: "#fef3d8", border: "1px solid #f0c040",
    borderRadius: "var(--radius-sm)", padding: "10px 14px",
    fontSize: "0.85rem", color: "#7a5000"
  },
  paidBanner: {
    background: "#e8f7ef", border: "1px solid #b2dfca",
    borderRadius: "var(--radius-sm)", padding: "10px 14px",
    fontSize: "0.85rem", color: "#1a6040"
  }
};
