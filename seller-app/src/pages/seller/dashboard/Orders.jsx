import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import StatusBadge from "../../../components/StatusBadge";
import { useToast } from "../../../components/Toast";

const filters = ["all","pending","accepted","payment_done","delivered","cancelled"];
const filterLabel = { all: "All", pending: "Pending", accepted: "Accepted", payment_done: "Paid", delivered: "Delivered", cancelled: "Cancelled" };

export default function Orders() {
  const [orders, setOrders]     = useState([]);
  const [filter, setFilter]     = useState("all");
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const toast = useToast();

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
      toast(status === "accepted" ? "Order accepted!" : status === "delivered" ? "Marked as delivered!" : "Updated", "success");
    } catch {
      toast("Could not update order", "error");
    }
  };

  return (
    <div>
      <div style={styles.pageHead}>
        <h1 style={styles.title}>All Orders</h1>
        <p style={styles.sub}>Review, accept or reject incoming orders</p>
      </div>

      <div style={styles.filterRow}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
          >
            {filterLabel[f]}
            {f !== "all" && (
              <span style={styles.filterCount}>{orders.filter(o => o.status === f).length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="table-card">
        {loading ? (
          <div style={styles.centered}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 50 }}>
            <h3>No orders found</h3>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o._id} style={{ cursor: "pointer" }} onClick={() => setSelected(o)}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--purple)" }}>{o.buyerName}</div>
                    <div style={{ fontSize: "0.77rem", color: "var(--text-muted)" }}>{o.buyerPhone}</div>
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "var(--text-muted)", maxWidth: 180 }}>
                    {o.items.map(i => `${i.name} x${i.qty}`).join(", ")}
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--pink)" }}>Rs.{o.total}</td>
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
            <p className="modal-sub">From {selected.buyerName}</p>

            <div style={styles.detailBox}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--purple)" }}>{selected.buyerName}</div>
                  <div style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}>{selected.buyerPhone}</div>
                </div>
                <StatusBadge status={selected.status} />
              </div>
              {selected.note && (
                <div style={{ marginTop: 10, fontSize: "0.83rem", padding: "8px 12px", background: "var(--pink-pale)", borderRadius: 8 }}>
                  Note: {selected.note}
                </div>
              )}
            </div>

            <table style={{ marginBottom: 14 }}>
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
              <tbody>
                {selected.items.map((i, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{i.name}</td>
                    <td>{i.qty}</td>
                    <td>Rs.{i.price}</td>
                    <td style={{ fontWeight: 700, color: "var(--purple)" }}>Rs.{i.price * i.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={styles.totalRow}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontWeight: 800, color: "var(--pink)", fontSize: "1.15rem" }}>Rs.{selected.total}</span>
            </div>

            {selected.status === "accepted" && (
              <div style={styles.waitBanner}>Waiting for customer payment — Rs.{selected.total}</div>
            )}
            {["payment_done","delivered"].includes(selected.status) && (
              <div style={styles.paidBanner}>Payment received — Rs.{selected.total}</div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              {selected.status === "pending" && (
                <>
                  <button className="btn btn-success" onClick={() => updateStatus(selected._id, "accepted")}>Accept Order</button>
                  <button className="btn btn-danger"  onClick={() => { updateStatus(selected._id, "cancelled"); setSelected(null); }}>Reject</button>
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
  pageHead: { marginBottom: 24 },
  title: { fontSize: "1.55rem", fontWeight: 800, color: "var(--purple)" },
  sub: { color: "var(--text-muted)", fontSize: "0.88rem", marginTop: 4 },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 },
  filterBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 14px", borderRadius: 30,
    border: "1.5px solid var(--border)", background: "white",
    fontSize: "0.83rem", fontWeight: 500, cursor: "pointer",
    color: "var(--text-muted)", transition: "all 0.15s", fontFamily: "inherit"
  },
  filterBtnActive: {
    background: "var(--pink)", color: "white",
    borderColor: "var(--pink)", fontWeight: 700,
    boxShadow: "0 3px 10px rgba(214,51,132,0.3)"
  },
  filterCount: {
    background: "rgba(255,255,255,0.25)", borderRadius: 20,
    padding: "1px 7px", fontSize: "0.75rem", fontWeight: 700
  },
  centered: { padding: 50, textAlign: "center", color: "var(--text-muted)" },
  detailBox: { background: "var(--bg-section)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 },
  totalRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "var(--pink-pale)", borderRadius: 10, padding: "12px 16px", marginBottom: 14
  },
  waitBanner: {
    background: "var(--warning-bg)", border: "1px solid #f0d080",
    borderRadius: 10, padding: "10px 14px", fontSize: "0.85rem", color: "#7a5000", marginBottom: 10
  },
  paidBanner: {
    background: "var(--success-bg)", border: "1px solid #b2dfca",
    borderRadius: 10, padding: "10px 14px", fontSize: "0.85rem", color: "#1a6040", marginBottom: 10
  }
};
