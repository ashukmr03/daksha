import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/Toast";
import api from "../../../api/axios";

export default function Products() {
  const { seller, setSeller } = useAuth();
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [name,  setName]  = useState("");
  const [price, setPrice] = useState("");
  const [unit,  setUnit]  = useState("");
  const [saving, setSaving] = useState(false);

  const addProduct = async () => {
    if (!name.trim() || !price) { toast("Name and price are required", "error"); return; }
    setSaving(true);
    try {
      const res = await api.post(`/sellers/${seller._id}/products`, { name, price, unit: unit || "each" });
      setSeller(prev => ({ ...prev, products: [...prev.products, res.data] }));
      toast(`${name} added!`, "success");
      setName(""); setPrice(""); setUnit(""); setShowAdd(false);
    } catch {
      toast("Could not add product", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Remove this product?")) return;
    try {
      await api.delete(`/sellers/${seller._id}/products/${productId}`);
      setSeller(prev => ({ ...prev, products: prev.products.filter(p => p._id !== productId) }));
      toast("Product removed", "");
    } catch {
      toast("Could not remove product", "error");
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Products</h1>
          <p style={styles.sub}>{seller?.products?.length || 0} products in your catalogue</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Product</button>
      </div>

      {!seller?.products?.length ? (
        <div className="empty-state">
          <h3>No products yet</h3>
          <p>Add your first product so customers can order from you</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>
            Add First Product
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {seller.products.map(p => (
            <div key={p._id} style={styles.prodCard}>
              <button style={styles.delBtn} onClick={() => deleteProduct(p._id)} title="Remove">x</button>
              <div style={styles.prodName}>{p.name}</div>
              <div style={styles.prodUnit}>{p.unit || "each"}</div>
              <div style={styles.prodPrice}>Rs.{p.price}</div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <button className="modal-close" onClick={() => setShowAdd(false)}>x</button>
            <h2>Add Product</h2>
            <p className="modal-sub">Add a new item to your catalogue</p>
            <div className="form-group">
              <label>Product Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Lunch Tiffin" autoFocus />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price (Rs.) *</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 120" min="0" />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="per box, each..." />
              </div>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={addProduct} disabled={saving}>
              {saving ? "Adding..." : "Add to Catalogue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 },
  title: { fontSize: "1.55rem", fontWeight: 800, color: "var(--purple)" },
  sub: { color: "var(--text-muted)", fontSize: "0.88rem", marginTop: 4 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 },
  prodCard: {
    background: "white", border: "1px solid var(--border-light)",
    borderRadius: 16, padding: "20px 18px",
    position: "relative", boxShadow: "var(--shadow)"
  },
  delBtn: {
    position: "absolute", top: 10, right: 10,
    background: "var(--bg-section)", border: "none",
    width: 28, height: 28, borderRadius: "50%",
    cursor: "pointer", fontSize: "0.8rem", color: "var(--text-muted)",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  prodName: { fontWeight: 700, color: "var(--purple)", fontSize: "0.95rem", marginBottom: 4 },
  prodUnit: { fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 10 },
  prodPrice: {
    fontSize: "1.25rem", fontWeight: 800, color: "var(--pink)",
    background: "var(--pink-pale)", padding: "4px 14px",
    borderRadius: 20, display: "inline-block"
  },
};
