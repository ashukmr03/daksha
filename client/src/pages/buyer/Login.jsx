import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBuyer } from "../../context/BuyerContext";
import { useToast } from "../../components/Toast";

export default function BuyerLogin() {
  const [name, setName]   = useState("");
  const [phone, setPhone] = useState("");
  const { loginBuyer }    = useBuyer();
  const navigate          = useNavigate();
  const toast             = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { toast("Enter your name", "error"); return; }
    if (phone.trim().length < 10) { toast("Enter a valid 10-digit phone number", "error"); return; }
    loginBuyer(name.trim(), phone.trim());
    toast("Welcome to Daksha!", "success");
    navigate("/");
  };

  return (
    <div style={styles.wrap}>
      {/* Left panel */}
      <div style={styles.panel}>
        <div style={styles.panelInner}>
          <div style={styles.panelLogo}>D</div>
          <h2 style={styles.panelTitle}>Discover Local Businesses</h2>
          <p style={styles.panelSub}>
            Browse home kitchens, craft studios and beauty makers
            in your city. Order directly from women entrepreneurs.
          </p>
          <div style={styles.panelFeatures}>
            {[
              "Browse verified women-led businesses",
              "Order directly, pay via UPI",
              "Track all your orders in one place",
              "Support local entrepreneurs"
            ].map(f => (
              <div key={f} style={styles.panelFeature}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={styles.formSide}>
        <div style={styles.card}>
          <div style={styles.logoRow}>
            <div style={styles.logoBox}>D</div>
            <span style={styles.logoText}>Daksha</span>
          </div>
          <h1 style={styles.title}>Sign In</h1>
          <p style={styles.sub}>Enter your name and phone number to continue</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                maxLength={10}
                onKeyDown={e => e.key === "Enter" && handleSubmit(e)}
              />
              <div className="hint">No password needed — your phone number is your identity.</div>
            </div>
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              style={{ width: "100%", marginTop: 8 }}
            >
              Continue to Daksha
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "calc(100vh - 68px)",
    display: "flex",
  },
  panel: {
    flex: "0 0 420px",
    background: "linear-gradient(135deg, #3d2145 0%, #6b2875 60%, #d63384 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 48,
  },
  panelInner: { color: "white", maxWidth: 320 },
  panelLogo: {
    width: 52, height: 52, borderRadius: 14,
    background: "rgba(255,255,255,0.15)",
    border: "2px solid rgba(255,255,255,0.25)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 900, fontSize: "1.6rem", marginBottom: 22
  },
  panelTitle: { fontSize: "1.75rem", fontWeight: 800, marginBottom: 12, lineHeight: 1.25 },
  panelSub: { fontSize: "0.93rem", opacity: 0.78, lineHeight: 1.7, marginBottom: 30 },
  panelFeatures: { display: "flex", flexDirection: "column", gap: 10 },
  panelFeature: {
    background: "rgba(255,255,255,0.10)",
    borderRadius: 10, padding: "10px 16px",
    fontSize: "0.86rem", fontWeight: 500,
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex", alignItems: "center", gap: 10
  },
  formSide: {
    flex: 1, display: "flex", alignItems: "center",
    justifyContent: "center", padding: 40,
    background: "linear-gradient(135deg, #fff0f6 0%, #f8eaff 100%)"
  },
  card: {
    background: "white", borderRadius: 20,
    padding: "40px 36px", width: "100%", maxWidth: 420,
    boxShadow: "0 10px 40px rgba(61,33,69,0.12)",
    border: "1px solid var(--border-light)"
  },
  logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  logoBox: {
    width: 38, height: 38, borderRadius: 10,
    background: "linear-gradient(135deg, #3d2145, #d63384)",
    color: "white", fontWeight: 900, fontSize: "1.1rem",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  logoText: { fontWeight: 800, fontSize: "1.3rem", color: "var(--purple)" },
  title: { fontSize: "1.6rem", fontWeight: 800, color: "var(--purple)", marginBottom: 6 },
  sub: { color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 28 },
};
