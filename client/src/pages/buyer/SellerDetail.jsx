import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/Toast";
import { useBuyer } from "../../context/BuyerContext";

const categoryImg = {
  food:    "https://images.unsplash.com/photo-1567364000001-f5f9ab6e7f49?w=800&q=80",
  bakery:  "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&q=80",
  craft:   "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?w=800&q=80",
  beauty:  "https://images.unsplash.com/photo-1596704017254-9b5e2a025acf?w=800&q=80",
  fashion: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  other:   "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
};

/* DiceBear — free illustrated avatar, unique per seller name */
const avatarUrl = (name) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,ffd5dc`;

export default function SellerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { buyer } = useBuyer();

  const [seller, setSeller]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showOrder, setShowOrder] = useState(false);
  const [cart, setCart]           = useState({});
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [note, setNote]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError]   = useState(false);

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

  const changeQty = (productId, delta) =>
    setCart(prev => ({ ...prev, [productId]: Math.max(0, (prev[productId] || 0) + delta) }));

  const total = seller
    ? seller.products.reduce((s, p) => s + (cart[p._id] || 0) * p.price, 0)
    : 0;

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

  if (loading) return <div style={{ textAlign: "center", padding: 100, color: "var(--text-muted)" }}>Loading...</div>;
  if (!seller) return null;

  const initials    = seller.ownerName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const bannerImg   = categoryImg[seller.category] || categoryImg.other;

  return (
    <div style={styles.page}>

      <div style={styles.topBar}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>Back</button>
      </div>

      {/* Header card */}
      <div style={styles.headerCard}>
        <div style={styles.bannerWrap}>
          <img src={bannerImg} alt={seller.category} style={styles.bannerImg} loading="lazy" />
          <div style={styles.bannerOverlay} />
          <div style={styles.bannerChip}>
            {seller.category.charAt(0).toUpperCase() + seller.category.slice(1)}
          </div>
        </div>

        <div style={styles.infoRow}>
          <div style={styles.avatarWrap}>
            {!imgError ? (
              <img
                src={avatarUrl(seller.ownerName)}
                alt={seller.ownerName}
                style={styles.avatarImg}
                onError={() => setImgError(true)}
              />
            ) : (
              <div style={styles.avatarFallback}>{initials}</div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={styles.shopName}>{seller.shopName}</h1>
            <div style={styles.ownerLine}>
              by {seller.ownerName} &nbsp;&middot;&nbsp;
              {seller.locality}{seller.locality.includes(seller.city) ? "" : ", " + seller.city}
            </div>
            <div style={styles.ratingRow}>
              <span style={{ color: "#f0b429", fontSize: "1rem" }}>
                {"★".repeat(Math.round(seller.rating || 0))}
                {"☆".repeat(5 - Math.round(seller.rating || 0))}
              </span>
              <strong style={{ fontSize: "0.9rem", color: "var(--purple)" }}>{seller.rating || "—"}</strong>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>({seller.reviewCount} reviews)</span>
              {seller.verified && <span className="badge badge-green">Verified</span>}
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={openOrder} style={{ flexShrink: 0 }}>
            Place Order
          </button>
        </div>
      </div>

      {/* Description */}
      {seller.description && (
        <div style={styles.descCard}>
          <div style={styles.descLabel}>About this business</div>
          <p style={styles.descText}>{seller.description}</p>
        </div>
      )}

      {/* Products */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionHead}>
          <h2 style={styles.sectionTitle}>Products</h2>
          <span style={styles.sectionCount}>{seller.products.length} items</span>
        </div>
        <div>
          {seller.products.map(p => (
            <div key={p._id} style={styles.productRow}>
              <div>
                <div style={styles.productName}>{p.name}</div>
                <div style={styles.productUnit}>{p.unit}</div>
              </div>
              <div style={styles.productPrice}>Rs.{p.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      {seller.reviews?.length > 0 && (
        <div style={styles.sectionCard}>
          <div style={styles.sectionHead}>
            <h2 style={styles.sectionTitle}>Customer Reviews</h2>
            <span style={styles.sectionCount}>{seller.reviews.length} reviews</span>
          </div>
          {seller.reviews.map((r, i) => (
            <div key={i} style={styles.reviewCard}>
              <div style={styles.reviewTop}>
                <div style={styles.reviewAvatar}>{r.user?.[0]?.toUpperCase() || "?"}</div>
                <div>
                  <strong style={{ fontSize: "0.88rem", color: "var(--purple)" }}>{r.user}</strong>
                  <div style={{ color: "#f0b429", fontSize: "0.82rem" }}>
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </div>
                </div>
              </div>
              {r.text && <p style={styles.reviewText}>"{r.text}"</p>}
            </div>
          ))}
        </div>
      )}

      {/* Order modal */}
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
                    <span style={{ minWidth: 28, textAlign: "center", fontWeight: 700 }}>{cart[p._id] || 0}</span>
                    <button style={styles.qtyBtn} onClick={() => changeQty(p._id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.summary}>
              <div style={styles.summaryRow}>
                <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                <span>Rs.{total}</span>
              </div>
              <div style={{ ...styles.summaryRow, fontWeight: 800, fontSize: "1.05rem", borderTop: "1px solid var(--border-light)", paddingTop: 8, marginTop: 6 }}>
                <span>Total</span>
                <span style={{ color: "var(--pink)" }}>Rs.{total}</span>
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

            <div style={styles.infoBox}>
              The seller will review and accept your order. You pay directly via UPI only after acceptance.
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
              onClick={submitOrder}
              disabled={submitting || total === 0}
            >
              {submitting ? "Sending..." : "Send Order Request"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 860, margin: "0 auto", padding: "24px 20px 60px" },
  topBar: { marginBottom: 18 },
  headerCard: {
    background: "white", borderRadius: 20, overflow: "hidden",
    boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-light)", marginBottom: 20
  },
  bannerWrap: { height: 200, position: "relative", overflow: "hidden" },
  bannerImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  bannerOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to top, rgba(61,33,69,0.65) 0%, transparent 55%)"
  },
  bannerChip: {
    position: "absolute", top: 14, left: 14,
    background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)",
    color: "var(--purple)", fontWeight: 700, fontSize: "0.8rem",
    padding: "5px 13px", borderRadius: 20, textTransform: "capitalize"
  },
  avatarWrap: {
    width: 80, height: 80, borderRadius: "50%",
    border: "4px solid white", overflow: "hidden", flexShrink: 0,
    boxShadow: "0 4px 14px rgba(214,51,132,0.25)", background: "var(--pink-pale)"
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarFallback: {
    width: "100%", height: "100%",
    background: "linear-gradient(135deg, var(--pink), var(--purple-mid))",
    color: "white", fontWeight: 800, fontSize: "1.5rem",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  infoRow: { display: "flex", alignItems: "center", gap: 18, padding: "18px 24px 22px", flexWrap: "wrap" },
  shopName: { fontSize: "1.55rem", fontWeight: 800, color: "var(--purple)", marginBottom: 4 },
  ownerLine: { fontSize: "0.84rem", color: "var(--text-muted)", marginBottom: 8 },
  ratingRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  descCard: {
    background: "white", borderRadius: 16, border: "1px solid var(--border-light)",
    padding: "20px 24px", marginBottom: 18, boxShadow: "var(--shadow)"
  },
  descLabel: {
    fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.06em", color: "var(--purple-soft)", marginBottom: 8
  },
  descText: { fontSize: "0.93rem", color: "var(--text-body)", lineHeight: 1.75 },
  sectionCard: {
    background: "white", borderRadius: 18, border: "1px solid var(--border-light)",
    overflow: "hidden", marginBottom: 18, boxShadow: "var(--shadow)"
  },
  sectionHead: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "18px 22px", borderBottom: "1px solid var(--border-light)"
  },
  sectionTitle: { fontSize: "1rem", fontWeight: 700, color: "var(--purple)" },
  sectionCount: {
    background: "var(--pink-pale)", color: "var(--pink-dark)",
    fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20
  },
  productRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 22px", borderBottom: "1px solid var(--border-light)"
  },
  productName: { fontWeight: 600, fontSize: "0.92rem", color: "var(--purple)" },
  productUnit: { fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 },
  productPrice: {
    fontWeight: 800, color: "var(--pink)", fontSize: "1.1rem",
    background: "var(--pink-pale)", padding: "4px 12px", borderRadius: 20, flexShrink: 0
  },
  reviewCard: { padding: "14px 22px", borderBottom: "1px solid var(--border-light)" },
  reviewTop: { display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 8 },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: "50%",
    background: "linear-gradient(135deg, var(--pink-pale2), var(--lavender))",
    color: "var(--purple-soft)", fontWeight: 700, fontSize: "0.88rem",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "2px solid var(--border)", flexShrink: 0
  },
  reviewText: {
    fontSize: "0.87rem", color: "var(--text-body)",
    lineHeight: 1.6, fontStyle: "italic", paddingLeft: 48
  },
  orderList: { border: "1px solid var(--border-light)", borderRadius: 10, overflow: "hidden", marginBottom: 16 },
  orderItem: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "13px 16px", borderBottom: "1px solid var(--border-light)"
  },
  qtyRow: { display: "flex", alignItems: "center", gap: 10 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 8,
    background: "var(--bg-section)", border: "1px solid var(--border)",
    fontSize: "1.1rem", cursor: "pointer", fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)"
  },
  summary: { background: "var(--bg-section)", borderRadius: 10, padding: "14px 16px", marginBottom: 18 },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: 4 },
  infoBox: {
    background: "var(--pink-pale)", border: "1px solid var(--border-light)",
    borderRadius: 10, padding: "12px 15px",
    fontSize: "0.82rem", color: "var(--purple-soft)", marginBottom: 18, lineHeight: 1.5
  }
};
