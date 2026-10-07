import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/Toast";
import api from "../../../api/axios";

export default function Products() {
  const { seller, setSeller } = useAuth();
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [saving, setSaving] = useState(false);

  const addProduct = async () => {
    if (!name.trim() || !price) { toast("Name and price are required", "error"); return; }
    setSaving(true);
    try {
      const res = await api.post(`/sellers/${seller._id}/products`, { name, price, unit: unit || "each" });
      setSeller(prev => ({ ...prev, products: [...prev.products, res.data] }));
      toast(name + " added!", "success");
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
          <h1 style={{ fontSize: "1.55rem", fontWeight: 800, color: "var(--plum)" }}>My Products</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 4 }}>
            {seller?.products?.length || 0} products in your catalogue
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Product</button>
      </div>

      {!seller?.products?.length ? (
        <div className="empty-state">
          <h3>No products yet</h3>
          <p>Add your first product so customers can order</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {seller.products.map(p => (
            <div key={p._id} style={styles.prodCard}>
              <button style={styles.delBtn} onClick={() => deleteProduct(p._id)}>Remove</button>
              <div style={styles.prodName}>{p.name}</div>
              <div style={styles.prodUnit}>{p.unit}</div>
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
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={addProduct} disabled={saving}>
              {saving ? "Adding..." : "Add Product"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 },
  prodCard: {
    background: "var(--white)", border: "1px solid var(--border)",
    borderRadius: "var(--radius)", padding: 18, position: "relative"
  },
  delBtn: {
    position: "absolute", top: 10, right: 10,
    background: "none", border: "none", color: "var(--text-muted)",
    cursor: "pointer", fontSize: "0.82rem", padding: "4px 8px",
    borderRadius: 4
  },
  prodName: { fontWeight: 700, color: "var(--plum)", marginBottom: 4 },
  prodUnit: { fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 10 },
  prodPrice: { fontSize: "1.2rem", fontWeight: 800, color: "var(--rose-dark)" }
};
