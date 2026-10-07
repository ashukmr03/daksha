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
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payOrder, setPayOrder] = useState(null);

  useEffect(() => {
    if (buyer?.phone) {
      setPhone(buyer.phone);
      fetchOrders(buyer.phone);
    }
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

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        Back
      </button>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--plum)", marginBottom: 6 }}>Track My Orders</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 28 }}>Enter your phone number to view your orders.</p>

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

      {searched && orders.length === 0 && (
        <div className="empty-state">
          <h3>No orders found</h3>
          <p>No orders placed from this number yet.</p>
        </div>
      )}

      {orders.map(o => {
        const canPay = o.status === "accepted";
        return (
          <div key={o._id} style={styles.orderCard}>
            <div style={styles.orderTop}>
              <div>
                <div style={styles.shopName}>{o.seller?.shopName || "Seller"}</div>
                <div style={styles.orderItems}>{o.items.map(i => `${i.name} x${i.qty}`).join(", ")}</div>
                <div style={styles.orderTime}>{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                {o.note && <div style={styles.orderNote}>Note: {o.note}</div>}
              </div>
              <div style={styles.orderRight}>
                <div style={styles.orderTotal}>Rs.{o.total}</div>
                <StatusBadge status={o.status} />
                {canPay && (
                  <button className="btn btn-success btn-sm" onClick={() => setPayOrder(o)}>
                    Pay Now
                  </button>
                )}
              </div>
            </div>
            {o.status === "pending" && (
              <div style={styles.infoBanner}>
                Waiting for seller to accept your order.
              </div>
            )}
          </div>
        );
      })}

      {payOrder && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPayOrder(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <button className="modal-close" onClick={() => setPayOrder(null)}>x</button>
            <h2>Pay Now</h2>
            <p className="modal-sub">Order accepted. Pay directly to the seller via UPI.</p>
            <div style={styles.payBox}>
              <div style={styles.payQr}>UPI</div>
              <div style={{ fontSize: "0.83rem", color: "var(--text-muted)", marginBottom: 8 }}>Pay to UPI ID</div>
              <div style={styles.upiId}>{payOrder.seller?.upiId}</div>
            </div>
            <div style={styles.payMeta}>
              <div style={styles.payRow}><span>Order ID</span><strong>{payOrder._id.slice(-8)}</strong></div>
              <div style={{ ...styles.payRow, fontSize: "1rem" }}><span>Amount</span><strong style={{ color: "var(--rose-dark)" }}>Rs.{payOrder.total}</strong></div>
            </div>
            <button className="btn btn-success btn-lg" style={{ width: "100%", marginBottom: 10 }} onClick={() => confirmPayment(payOrder._id)}>
              I have paid
            </button>
            <p style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Click only after completing the UPI transfer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  lookupRow: { display: "flex", gap: 12, marginBottom: 28 },
  lookupInput: {
    flex: 1, padding: "11px 14px", border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-sm)", fontSize: "0.92rem", fontFamily: "inherit",
    outline: "none"
  },
  orderCard: {
    background: "var(--white)", border: "1px solid var(--border)",
    borderRadius: "var(--radius)", padding: "18px", marginBottom: 14
  },
  orderTop: { display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" },
  shopName: { fontWeight: 700, color: "var(--plum)", fontSize: "1rem" },
  orderItems: { fontSize: "0.83rem", color: "var(--text-muted)", marginTop: 3 },
  orderTime: { fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 },
  orderNote: { fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 },
  orderRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 },
  orderTotal: { fontWeight: 800, color: "var(--rose-dark)", fontSize: "1.05rem" },
  infoBanner: {
    marginTop: 12, background: "#fef3d8", border: "1px solid #f0c040",
    borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: "0.83rem", color: "#7a5000"
  },
  payBox: {
    background: "var(--cream-dark)", borderRadius: "var(--radius-sm)",
    padding: 24, textAlign: "center", marginBottom: 18
  },
  payQr: {
    width: 120, height: 120, background: "var(--white)",
    borderRadius: 8, margin: "0 auto 12px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)",
    border: "1px solid var(--border)"
  },
  upiId: {
    fontWeight: 700, color: "var(--plum)", letterSpacing: "0.03em",
    background: "white", padding: "8px 16px", borderRadius: "var(--radius-sm)",
    display: "inline-block", border: "1px solid var(--border)", fontSize: "1rem"
  },
  payMeta: {
    background: "var(--cream-dark)", borderRadius: "var(--radius-sm)",
    padding: 14, marginBottom: 18
  },
  payRow: {
    display: "flex", justifyContent: "space-between",
    fontSize: "0.88rem", marginBottom: 6
  }
};
