import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

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
      <div style={styles.card}>
        <Link to="/" style={styles.back}>Back to Marketplace</Link>
        <h1 style={styles.title}>Seller Login</h1>
        <p style={styles.sub}>Sign in to access your dashboard</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your seller username" autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" />
          </div>
          <button className="btn btn-primary btn-lg" type="submit" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p style={styles.footer}>
          New seller? <Link to="/seller/register" style={styles.footerLink}>Register your business</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "calc(100vh - 64px)", display: "flex",
    alignItems: "center", justifyContent: "center", padding: 20,
    background: "linear-gradient(160deg, var(--cream) 0%, var(--cream-dark) 100%)"
  },
  card: {
    background: "var(--white)", borderRadius: "var(--radius)",
    border: "1px solid var(--border)", padding: 40,
    width: "100%", maxWidth: 420, boxShadow: "var(--shadow-lg)"
  },
  back: { fontSize: "0.83rem", color: "var(--text-muted)", display: "inline-block", marginBottom: 24 },
  title: { fontSize: "1.6rem", fontWeight: 800, color: "var(--plum)", marginBottom: 6 },
  sub: { color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 28 },
  footer: { textAlign: "center", marginTop: 20, fontSize: "0.85rem", color: "var(--text-muted)" },
  footerLink: { color: "var(--rose-dark)", fontWeight: 600 }
};
