import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge";
import { useToast } from "../../components/Toast";
import { useBuyer } from "../../context/BuyerContext";

export default function MyOrders() {
  const navigate = useNavigate();
  const toast = useToast();
  const { buyer } = useBuyer();
  const [phone, setPhone]     = useState("");
  const [orders, setOrders]   = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payOrder, setPayOrder] = useState(null);

  useEffect(() => {
    if (buyer?.phone) { setPhone(buyer.phone); fetchOrders(buyer.phone); }
  }, [buyer]);

  const fetchOrders = async (p) => {
    const target = p || phone;
    if (!target || target.trim().length < 10) { toast("Enter a valid 10-digit phone number", "error"); return; }
    setLoading(true);
    try {
      const res = await api.get(`/orders/buyer/${target.trim()}`);
      setOrders(res.data);
      setSearched(true);
    } catch {
      toast("Could not fetch orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/pay`);
      toast("Payment marked! Seller will confirm delivery.", "success");
      setPayOrder(null);
      fetchOrders();
    } catch (err) {
      toast(err.response?.data?.message || "Error", "error");
    }
  };

  const statusBorderColor = {
    pending: "#f0c040", accepted: "var(--pink)",
    payment_done: "var(--success)", delivered: "var(--success)", cancelled: "#ccc"
  };

  return (
    <div style={styles.page}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        Back
      </button>

      <div style={styles.pageHead}>
        <h1 style={styles.title}>My Orders</h1>
        <p style={styles.sub}>Enter your phone number to view all your orders</p>
      </div>

      <div style={styles.lookupCard}>
        <div style={styles.lookupRow}>
          <input
            style={styles.lookupInput}
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchOrders()}
            placeholder="Your 10-digit mobile number"
            maxLength={10}
          />
          <button className="btn btn-primary" onClick={() => fetchOrders()} disabled={loading}>
            {loading ? "Searching..." : "Find Orders"}
          </button>
        </div>
      </div>

      {searched && orders.length === 0 && (
        <div className="empty-state">
          <h3>No orders found</h3>
          <p>No orders placed from this number yet.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {orders.map(o => {
          const canPay = o.status === "accepted";
          return (
            <div key={o._id} style={{ ...styles.orderCard, borderLeft: `4px solid ${statusBorderColor[o.status] || "#ccc"}` }}>
              <div style={styles.orderTop}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={styles.shopName}>{o.seller?.shopName || "Seller"}</div>
                  <div style={styles.orderItems}>{o.items.map(i => `${i.name} x${i.qty}`).join("  ·  ")}</div>
                  <div style={styles.orderMeta}>
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {o.note && <span style={{ marginLeft: 12 }}>Note: {o.note}</span>}
                  </div>
                </div>
                <div style={styles.orderRight}>
                  <div style={styles.orderTotal}>Rs.{o.total}</div>
                  <StatusBadge status={o.status} />
                  {canPay && (
                    <button className="btn btn-success btn-sm" onClick={() => setPayOrder(o)}>Pay Now</button>
                  )}
                </div>
              </div>
              {o.status === "pending" && (
                <div style={styles.infoBanner}>
                  Waiting for seller to accept your order. You will be able to pay once accepted.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {payOrder && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPayOrder(null)}>
          <div className="modal" style={{ maxWidth: 420, textAlign: "center" }}>
            <button className="modal-close" onClick={() => setPayOrder(null)}>x</button>
            <h2>Pay Now</h2>
            <p className="modal-sub">Order accepted. Pay directly to the seller via UPI.</p>

            <div style={styles.payBox}>
              <div style={styles.payQr}>UPI</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 8 }}>Pay to UPI ID</div>
              <div style={styles.upiId}>{payOrder.seller?.upiId}</div>
            </div>

            <div style={styles.payMeta}>
              <div style={styles.payRow}>
                <span style={{ color: "var(--text-muted)" }}>Order ID</span>
                <strong style={{ fontSize: "0.85rem" }}>#{payOrder._id.slice(-8).toUpperCase()}</strong>
              </div>
              <div style={{ ...styles.payRow, marginTop: 6, fontSize: "1.05rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Amount</span>
                <strong style={{ color: "var(--pink)" }}>Rs.{payOrder.total}</strong>
              </div>
            </div>

            <button
              className="btn btn-success btn-lg"
              style={{ width: "100%", marginBottom: 10 }}
              onClick={() => confirmPayment(payOrder._id)}
            >
              I Have Paid
            </button>
            <p style={{ fontSize: "0.77rem", color: "var(--text-muted)" }}>
              Click only after completing the UPI transfer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 800, margin: "0 auto", padding: "32px 20px 60px" },
  pageHead: { marginBottom: 24 },
  title: { fontSize: "1.5rem", fontWeight: 800, color: "var(--purple)" },
  sub: { color: "var(--text-muted)", fontSize: "0.88rem", marginTop: 4 },
  lookupCard: {
    background: "white", borderRadius: 16, border: "1px solid var(--border-light)",
    padding: "20px 22px", marginBottom: 28, boxShadow: "var(--shadow)"
  },
  lookupRow: { display: "flex", gap: 12 },
  lookupInput: {
    flex: 1, padding: "12px 15px", border: "1.5px solid var(--border)",
    borderRadius: 10, fontSize: "0.92rem", fontFamily: "inherit", outline: "none", color: "var(--text)"
  },
  orderCard: {
    background: "white", borderRadius: 16,
    border: "1px solid var(--border-light)",
    padding: "18px 20px", boxShadow: "var(--shadow)"
  },
  orderTop: { display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" },
  shopName: { fontWeight: 700, color: "var(--purple)", fontSize: "1rem", marginBottom: 4 },
  orderItems: { fontSize: "0.83rem", color: "var(--text-muted)", marginBottom: 4 },
  orderMeta: { fontSize: "0.78rem", color: "var(--text-muted)" },
  orderRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 },
  orderTotal: { fontWeight: 800, color: "var(--pink)", fontSize: "1.1rem" },
  infoBanner: {
    marginTop: 14, background: "var(--warning-bg)",
    border: "1px solid #f0d080", borderRadius: 10,
    padding: "10px 14px", fontSize: "0.82rem", color: "#7a5000"
  },
  payBox: {
    background: "var(--bg-section)", borderRadius: 14,
    padding: 24, textAlign: "center", marginBottom: 18
  },
  payQr: {
    width: 110, height: 110, background: "white",
    borderRadius: 10, margin: "0 auto 12px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)",
    border: "1px solid var(--border-light)"
  },
  upiId: {
    fontWeight: 700, color: "var(--purple)", letterSpacing: "0.03em",
    background: "white", padding: "8px 18px", borderRadius: 10,
    display: "inline-block", border: "1px solid var(--border-light)", fontSize: "0.95rem"
  },
  payMeta: { background: "var(--bg-section)", borderRadius: 10, padding: "14px 18px", marginBottom: 18 },
  payRow: { display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }
};
