import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();
  const toast     = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { toast("Fill in both fields", "error"); return; }
    setLoading(true);
    try {
      await login(username.trim(), password);
      toast("Welcome back!", "success");
      navigate("/dashboard");
    } catch (err) {
      toast(err.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      {/* Left panel */}
      <div style={styles.panel}>
        <div style={styles.panelInner}>
          <div style={styles.panelLogo}>D</div>
          <h2 style={styles.panelTitle}>Grow Your Business</h2>
          <p style={styles.panelSub}>
            Manage orders, track earnings and reach more customers — all in one place.
          </p>
          <div style={styles.panelFeatures}>
            {[
              "Manage orders in real-time",
              "Track every rupee earned",
              "Showcase your products",
              "Monthly earnings reports"
            ].map(f => (
              <div key={f} style={styles.panelFeature}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={styles.formSide}>
        <div style={styles.card}>
          <a href="http://localhost:3000" style={styles.back}>Back to Marketplace</a>
          <div style={styles.logoRow}>
            <div style={styles.logoBox}>D</div>
            <span style={styles.logoText}>Daksha</span>
          </div>
          <h1 style={styles.title}>Seller Sign In</h1>
          <p style={styles.sub}>Access your seller dashboard</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your seller username" autoFocus />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

          <div style={styles.divider} />
          <a href="/register" style={{ display: "block" }}>
            <button className="btn btn-outline btn-lg" style={{ width: "100%" }}>
              Register My Business
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { minHeight: "calc(100vh - 68px)", display: "flex" },
  panel: {
    flex: "0 0 420px",
    background: "linear-gradient(135deg, #3d2145 0%, #6b2875 60%, #d63384 100%)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 48,
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
    background: "rgba(255,255,255,0.10)", borderRadius: 10,
    padding: "10px 16px", fontSize: "0.86rem", fontWeight: 500,
    backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.12)"
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
  back: { fontSize: "0.82rem", color: "var(--text-muted)", display: "inline-block", marginBottom: 24 },
  logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 24 },
  logoBox: {
    width: 38, height: 38, borderRadius: 10,
    background: "linear-gradient(135deg, #3d2145, #d63384)",
    color: "white", fontWeight: 900, fontSize: "1.1rem",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  logoText: { fontWeight: 800, fontSize: "1.3rem", color: "var(--purple)" },
  title: { fontSize: "1.6rem", fontWeight: 800, color: "var(--purple)", marginBottom: 6 },
  sub: { color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 28 },
  divider: { borderTop: "1px solid var(--border-light)", margin: "20px 0" },
};
