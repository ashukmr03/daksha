import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import api from "../../api/axios";

const steps = ["About You", "Your Business", "Payment", "Products"];
const cats  = ["food", "bakery", "craft", "beauty", "fashion", "other"];

export default function Register() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    ownerName: "", phone: "", city: "", locality: "",
    username: "", password: "",
    shopName: "", category: "", description: "",
    upiId: ""
  });
  const [products, setProducts] = useState([{ name: "", price: "", unit: "" }]);
  const [loading, setLoading]   = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();
  const toast        = useToast();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    if (step === 0) {
      if (!form.ownerName || !form.phone || !form.city || !form.locality || !form.username || !form.password)
        return "Fill all required fields";
      if (form.phone.length < 10) return "Enter a valid 10-digit phone";
      if (form.password.length < 6) return "Password must be at least 6 characters";
    }
    if (step === 1 && (!form.shopName || !form.category || !form.description)) return "Fill all required fields";
    if (step === 2 && !form.upiId) return "UPI ID is required";
    return null;
  };

  const next = () => {
    const err = validate();
    if (err) { toast(err, "error"); return; }
    setStep(s => s + 1);
  };

  const addProductRow = () => setProducts(p => [...p, { name: "", price: "", unit: "" }]);
  const setProd = (i, k) => (e) => setProducts(p => p.map((r, j) => j === i ? { ...r, [k]: e.target.value } : r));
  const removeProd = (i) => setProducts(p => p.filter((_, j) => j !== i));

  const submit = async () => {
    const validProds = products.filter(p => p.name.trim() && p.price);
    if (!validProds.length) { toast("Add at least one product with name and price", "error"); return; }
    setLoading(true);
    try {
      const newSeller = await register({ ...form, locality: `${form.locality}, ${form.city}` });
      for (const p of validProds) {
        await api.post(`/sellers/${newSeller._id}/products`, { name: p.name, price: p.price, unit: p.unit || "each" });
      }
      toast("Business registered! Welcome to Daksha.", "success");
      navigate("/dashboard");
    } catch (err) {
      toast(err.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <a href="http://localhost:3000" style={styles.back}>Back to Marketplace</a>

        <div style={styles.logoRow}>
          <div style={styles.logoBox}>D</div>
          <span style={styles.logoText}>Daksha</span>
        </div>

        <h1 style={styles.title}>Register Your Business</h1>
        <p style={styles.sub}>Join women entrepreneurs on Daksha</p>

        {/* Stepper */}
        <div style={styles.stepper}>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div style={styles.stepItem}>
                <div style={{ ...styles.stepDot, ...(i < step ? styles.dotDone : i === step ? styles.dotActive : {}) }}>
                  {i < step ? "+" : i + 1}
                </div>
                <div style={{ ...styles.stepLabel, ...(i === step ? { color: "var(--pink)", fontWeight: 700 } : {}) }}>
                  {s}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ ...styles.stepLine, ...(i < step ? styles.lineDone : {}) }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 0: About You */}
        {step === 0 && (
          <div>
            <div className="form-group">
              <label>Full Name *</label>
              <input value={form.ownerName} onChange={set("ownerName")} placeholder="Your full name" autoFocus />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone *</label>
                <input value={form.phone} onChange={set("phone")} placeholder="10-digit number" maxLength={10} />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input value={form.city} onChange={set("city")} placeholder="e.g. Mumbai" />
              </div>
            </div>
            <div className="form-group">
              <label>Locality / Area *</label>
              <input value={form.locality} onChange={set("locality")} placeholder="e.g. Andheri West" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Username *</label>
                <input value={form.username} onChange={set("username")} placeholder="seller_username" />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input type="password" value={form.password} onChange={set("password")} placeholder="Min 6 characters" />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Business */}
        {step === 1 && (
          <div>
            <div className="form-group">
              <label>Shop / Business Name *</label>
              <input value={form.shopName} onChange={set("shopName")} placeholder="e.g. Priya's Kitchen" />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <div style={styles.catGrid}>
                {cats.map(c => (
                  <div
                    key={c}
                    onClick={() => setForm(f => ({ ...f, category: c }))}
                    style={{ ...styles.catOption, ...(form.category === c ? styles.catActive : {}) }}
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea value={form.description} onChange={set("description")} placeholder="Tell customers what you make..." />
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div>
            <div className="form-group">
              <label>UPI ID *</label>
              <input value={form.upiId} onChange={set("upiId")} placeholder="e.g. priya@upi or 9876543210@paytm" />
              <div className="hint">Customers will pay directly to this UPI ID after you accept their order.</div>
            </div>
            {form.upiId && (
              <div style={styles.upiPreview}>
                <div style={{ fontSize: "0.72rem", color: "var(--purple-soft)", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Payment Preview
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-body)" }}>
                  Pay to: <strong style={{ color: "var(--pink)" }}>{form.upiId}</strong>
                </div>
              </div>
            )}
            <div style={styles.tipBox}>
              Customers pay you directly — no platform cut. Find your UPI ID in PhonePe, GPay or Paytm under "Your UPI ID".
            </div>
          </div>
        )}

        {/* Step 3: Products */}
        {step === 3 && (
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: 18 }}>
              Add your products so customers know what to order.
            </p>
            {products.map((p, i) => (
              <div key={i} style={styles.prodRow}>
                {i > 0 && (
                  <button onClick={() => removeProd(i)} style={styles.removeBtn}>Remove</button>
                )}
                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Product Name *</label>
                    <input value={p.name} onChange={setProd(i, "name")} placeholder="e.g. Lunch Tiffin" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Price (Rs.) *</label>
                    <input type="number" value={p.price} onChange={setProd(i, "price")} placeholder="e.g. 120" min="0" />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: 10, marginBottom: 0 }}>
                  <label>Unit</label>
                  <input value={p.unit} onChange={setProd(i, "unit")} placeholder="per box, each, per kg..." />
                </div>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={addProductRow} style={{ marginTop: 4 }}>
              + Add another product
            </button>
          </div>
        )}

        <div style={styles.actions}>
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>Back</button>
          )}
          {step < 3
            ? <button className="btn btn-primary" onClick={next}>Continue</button>
            : <button className="btn btn-primary" onClick={submit} disabled={loading}>
                {loading ? "Registering..." : "Register My Business"}
              </button>
          }
        </div>

        <p style={styles.footer}>
          Already registered?{" "}
          <a href="/login" style={{ color: "var(--pink-dark)", fontWeight: 600 }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "calc(100vh - 68px)",
    display: "flex", alignItems: "flex-start", justifyContent: "center",
    padding: "40px 20px",
    background: "linear-gradient(135deg, #fff0f6 0%, #f8eaff 100%)"
  },
  card: {
    background: "white", borderRadius: 22,
    border: "1px solid var(--border-light)",
    padding: "40px 36px", width: "100%", maxWidth: 560,
    boxShadow: "0 10px 40px rgba(61,33,69,0.12)"
  },
  back: { fontSize: "0.82rem", color: "var(--text-muted)", display: "inline-block", marginBottom: 22 },
  logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 20 },
  logoBox: {
    width: 38, height: 38, borderRadius: 10,
    background: "linear-gradient(135deg, #3d2145, #d63384)",
    color: "white", fontWeight: 900, fontSize: "1.1rem",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  logoText: { fontWeight: 800, fontSize: "1.3rem", color: "var(--purple)" },
  title: { fontSize: "1.5rem", fontWeight: 800, color: "var(--purple)", marginBottom: 6 },
  sub: { color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: 28 },
  stepper: { display: "flex", alignItems: "center", marginBottom: 30 },
  stepItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 5 },
  stepDot: {
    width: 34, height: 34, borderRadius: "50%",
    background: "var(--bg-section)", border: "2px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)"
  },
  dotDone: { background: "var(--success)", borderColor: "var(--success)", color: "white" },
  dotActive: { background: "var(--pink)", borderColor: "var(--pink)", color: "white" },
  stepLabel: { fontSize: "0.68rem", color: "var(--text-muted)", whiteSpace: "nowrap" },
  stepLine: { flex: 1, height: 2, background: "var(--border)", marginBottom: 20 },
  lineDone: { background: "var(--success)" },
  catGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 },
  catOption: {
    border: "2px solid var(--border)", borderRadius: 12,
    padding: "12px 8px", cursor: "pointer", fontSize: "0.88rem",
    textAlign: "center", transition: "all 0.2s", color: "var(--text-body)", fontWeight: 500
  },
  catActive: {
    borderColor: "var(--pink)", background: "var(--pink-pale)",
    color: "var(--pink-dark)", fontWeight: 700,
    boxShadow: "0 0 0 3px rgba(214,51,132,0.12)"
  },
  upiPreview: { background: "var(--bg-section)", borderRadius: 12, padding: 16, marginTop: 12 },
  tipBox: {
    background: "var(--pink-pale)", border: "1px solid var(--border-light)",
    borderRadius: 12, padding: "12px 16px",
    fontSize: "0.83rem", color: "var(--purple-soft)", marginTop: 14, lineHeight: 1.6
  },
  prodRow: { border: "1.5px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 12, position: "relative" },
  removeBtn: { position: "absolute", top: 10, right: 10, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.78rem" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 28 },
  footer: { textAlign: "center", marginTop: 22, fontSize: "0.85rem", color: "var(--text-muted)" },
};
