import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { seller, logout } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = () => { logout(); setMenu(false); navigate("/login"); };
  const initials = seller?.ownerName
    ? seller.ownerName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <nav style={styles.nav} ref={navRef}>
      <div style={styles.inner}>

        <Link to="/dashboard" style={styles.logo}>
          <div style={styles.logoBox}>D</div>
          <div>
            <span style={styles.logoText}>Daksha</span>
            <span style={styles.logoTag}>Seller Dashboard</span>
          </div>
        </Link>

        {seller && (
          <div style={styles.links}>
            <Link to="/dashboard"          style={styles.link}>Overview</Link>
            <Link to="/dashboard/orders"   style={styles.link}>Orders</Link>
            <Link to="/dashboard/products" style={styles.link}>Products</Link>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {seller ? (
            <div style={{ position: "relative" }}>
              <div style={styles.avatar} onClick={() => setMenu(o => !o)} title={seller.ownerName}>
                {initials}
              </div>
              {menu && (
                <div style={styles.dropdown}>
                  <div style={styles.ddMeta}>
                    <div style={{ fontWeight: 700, color: "var(--purple)", fontSize: "0.88rem" }}>{seller.shopName}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.77rem" }}>{seller.ownerName}</div>
                  </div>
                  <hr style={styles.hr} />
                  <Link to="/dashboard" style={styles.ddItem} onClick={() => setMenu(false)}>Dashboard</Link>
                  <Link to="/dashboard/products" style={styles.ddItem} onClick={() => setMenu(false)}>My Products</Link>
                  <hr style={styles.hr} />
                  <button style={{ ...styles.ddItem, color: "var(--danger)" }} onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <Link to="/login"><button className="btn btn-outline btn-sm">Sign In</button></Link>
              <Link to="/register"><button className="btn btn-primary btn-sm">Register</button></Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    background: "white", borderBottom: "1px solid var(--border-light)",
    boxShadow: "0 2px 12px rgba(61,33,69,0.07)"
  },
  inner: {
    maxWidth: 1200, margin: "0 auto", padding: "0 28px",
    height: 68, display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 16
  },
  logo: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  logoBox: {
    width: 38, height: 38, borderRadius: 10,
    background: "linear-gradient(135deg, #3d2145, #d63384)",
    color: "white", fontWeight: 900, fontSize: "1.15rem",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  logoText: { display: "block", fontWeight: 800, fontSize: "1.2rem", color: "var(--purple)", letterSpacing: "-0.5px" },
  logoTag:  { display: "block", fontSize: "0.63rem", color: "var(--text-muted)", lineHeight: 1.2 },
  links: { display: "flex", alignItems: "center", gap: 2 },
  link: { padding: "8px 15px", borderRadius: 8, fontSize: "0.88rem", fontWeight: 500, color: "var(--text-muted)" },
  avatar: {
    width: 38, height: 38, borderRadius: "50%",
    background: "linear-gradient(135deg, var(--pink), var(--purple-mid))",
    color: "white", fontWeight: 700, fontSize: "0.88rem",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", border: "2px solid var(--pink-pale2)",
    boxShadow: "0 2px 8px rgba(214,51,132,0.25)"
  },
  dropdown: {
    position: "absolute", top: "calc(100% + 10px)", right: 0,
    background: "white", border: "1px solid var(--border-light)",
    borderRadius: 14, boxShadow: "var(--shadow-lg)",
    minWidth: 200, padding: 6, zIndex: 200
  },
  ddMeta: { padding: "10px 14px 8px" },
  ddItem: {
    display: "block", padding: "9px 14px", borderRadius: 8,
    fontSize: "0.87rem", color: "var(--text-body)",
    background: "none", border: "none", cursor: "pointer",
    width: "100%", textAlign: "left", fontFamily: "inherit"
  },
  hr: { border: "none", borderTop: "1px solid var(--border-light)", margin: "4px 0" },
};
