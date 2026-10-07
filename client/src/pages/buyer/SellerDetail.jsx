import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/Toast";
import { useBuyer } from "../../context/BuyerContext";

export default function SellerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { buyer } = useBuyer();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOrder, setShowOrder] = useState(false);
  const [cart, setCart] = useState({});
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/sellers/${id}`)
      .then(r => setSeller(r.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id]);

  const openOrder = () => {
    setBuyerName(buyer?.name || "");
    setBuyerPhone(buyer?.phone || "");
    setShowOrder(true);
  };

  const changeQty = (productId, delta) => {
    setCart(prev => ({ ...prev, [productId]: Math.max(0, (prev[productId] || 0) + delta) }));
  };

  const total = seller ? seller.products.reduce((s, p) => s + (cart[p._id] || 0) * p.price, 0) : 0;

  const submitOrder = async () => {
    if (!buyerName.trim() || buyerPhone.trim().length < 10) {
      toast("Enter your name and a 10-digit phone number", "error"); return;
    }
    const items = seller.products
      .filter(p => (cart[p._id] || 0) > 0)
      .map(p => ({ productId: p._id, name: p.name, price: p.price, qty: cart[p._id] }));
    if (!items.length) { toast("Add at least one item", "error"); return; }
    setSubmitting(true);
    try {
      await api.post("/orders", { sellerId: seller._id, buyerName, buyerPhone, items, note });
      toast("Order sent! The seller will review and accept it.", "success");
      setShowOrder(false);
      setCart({});
    } catch (err) {
      toast(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>Loading...</div>;
  if (!seller) return null;

  const initials = seller.ownerName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        Back
      </button>

      <div style={styles.header}>
        <div style={styles.avatar}>{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={styles.cat}>{seller.category.toUpperCase()}</div>
          <h1 style={styles.name}>{seller.shopName}</h1>
          <div style={styles.meta}>by {seller.ownerName} · {seller.locality}{seller.locality.includes(seller.city) ? "" : ", " + seller.city}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span style={{ color: "#f0b429" }}>{"★".repeat(Math.round(seller.rating))}</span>
            <strong>{seller.rating || "—"}</strong>
            <span style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}>({seller.reviewCount} reviews)</span>
            {seller.verified && <span className="badge badge-green">Verified</span>}
          </div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={openOrder}>
          Place Order
        </button>
      </div>

      <div style={styles.desc}>{seller.description}</div>

      <h2 style={styles.sectionH}>Products</h2>
      <div style={styles.productList}>
        {seller.products.map(p => (
          <div key={p._id} style={styles.productRow}>
            <div>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{p.unit}</div>
            </div>
            <div style={{ fontWeight: 800, color: "var(--rose-dark)", fontSize: "1rem" }}>Rs.{p.price}</div>
          </div>
        ))}
      </div>

      {seller.reviews.length > 0 && (
        <>
          <h2 style={styles.sectionH}>Reviews</h2>
          {seller.reviews.map((r, i) => (
            <div key={i} style={styles.reviewItem}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <strong style={{ fontSize: "0.88rem" }}>{r.user}</strong>
                <span style={{ color: "#f0b429", fontSize: "0.8rem" }}>{"★".repeat(r.rating)}</span>
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{r.text}</div>
            </div>
          ))}
        </>
      )}

      {showOrder && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowOrder(false)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <button className="modal-close" onClick={() => setShowOrder(false)}>x</button>
            <h2>Place Order</h2>
            <p className="modal-sub">Ordering from {seller.shopName}</p>

            <div style={styles.orderList}>
              {seller.products.map(p => (
                <div key={p._id} style={styles.orderItem}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Rs.{p.price} / {p.unit}</div>
                  </div>
                  <div style={styles.qtyRow}>
                    <button style={styles.qtyBtn} onClick={() => changeQty(p._id, -1)}>-</button>
                    <span style={{ minWidth: 24, textAlign: "center", fontWeight: 700 }}>{cart[p._id] || 0}</span>
                    <button style={styles.qtyBtn} onClick={() => changeQty(p._id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.summary}>
              <div style={styles.summaryRow}><span>Subtotal</span><span>Rs.{total}</span></div>
              <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: "1rem", borderTop: "1px solid var(--border)", paddingTop: 8, marginTop: 4, color: "var(--plum)" }}>
                <span>Total</span><span>Rs.{total}</span>
              </div>
            </div>

            <div className="form-group">
              <label>Your Name</label>
              <input value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} placeholder="10-digit mobile" maxLength={10} />
            </div>
            <div className="form-group">
              <label>Note (optional)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Address or special instructions..." />
            </div>
            <div style={{ background: "var(--cream-dark)", borderRadius: "var(--radius-sm)", padding: "12px 14px", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 18 }}>
              The seller will review and accept your order. You pay directly via UPI only after acceptance.
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={submitOrder} disabled={submitting}>
              {submitting ? "Sending..." : "Send Order Request"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24, flexWrap: "wrap" },
  avatar: {
    width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
    background: "linear-gradient(135deg, var(--rose), var(--plum-mid))",
    color: "white", fontWeight: 800, fontSize: "1.4rem",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  cat: { fontSize: "0.78rem", fontWeight: 700, color: "var(--rose-dark)", textTransform: "uppercase", letterSpacing: "0.05em" },
  name: { fontSize: "1.6rem", fontWeight: 800, color: "var(--plum)", marginBottom: 2 },
  meta: { fontSize: "0.85rem", color: "var(--text-muted)" },
  desc: { background: "var(--cream-dark)", padding: 16, borderRadius: "var(--radius-sm)", fontSize: "0.92rem", lineHeight: 1.7, marginBottom: 28 },
  sectionH: { fontSize: "1rem", fontWeight: 700, color: "var(--plum)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" },
  productList: { border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: 28 },
  productRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "13px 16px", borderBottom: "1px solid var(--border)"
  },
  reviewItem: { padding: "12px 0", borderBottom: "1px solid var(--border)" },
  orderList: { border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: 16 },
  orderItem: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 14px", borderBottom: "1px solid var(--border)"
  },
  qtyRow: { display: "flex", alignItems: "center", gap: 10 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 6, background: "var(--cream-dark)",
    border: "none", fontSize: "1rem", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  summary: { background: "var(--cream-dark)", borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 18 },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: 4 }
};
