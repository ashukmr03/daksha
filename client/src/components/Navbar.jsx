import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBuyer } from "../context/BuyerContext";

export default function Navbar() {
  const { seller, logout } = useAuth();
  const { buyer, loginBuyer, logoutBuyer } = useBuyer();
  const navigate = useNavigate();
  const [sellerMenu, setSellerMenu] = useState(false);
  const [loginMenu, setLoginMenu] = useState(false);
  const [buyerModal, setBuyerModal] = useState(false);
  const [buyerTab, setBuyerTab] = useState("login");
  const [bName, setBName] = useState("");
  const [bPhone, setBPhone] = useState("");
  const navRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setSellerMenu(false);
        setLoginMenu(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleBuyerLogin = () => {
    if (!bName.trim() || bPhone.trim().length < 10) return;
    loginBuyer(bName.trim(), bPhone.trim());
    setBuyerModal(false);
    setBName(""); setBPhone("");
  };

  const handleSellerLogout = () => { logout(); setSellerMenu(false); navigate("/"); };
  const handleBuyerLogout = () => { logoutBuyer(); navigate("/"); };

  return (
    <>
      <nav style={styles.nav} ref={navRef}>
        <div style={styles.inner}>
          <Link to="/" style={styles.logo}>
            <div style={styles.logoIcon}>S</div>
            <div>
              <span style={styles.logoText}>Sakhi</span>
              <span style={styles.logoTag}>Women's Marketplace</span>
            </div>
          </Link>

          <div style={styles.links}>
            <Link to="/" style={styles.link}>Discover</Link>
            {buyer && <Link to="/my-orders" style={styles.link}>My Orders</Link>}
            {seller && <Link to="/dashboard" style={styles.link}>Dashboard</Link>}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {seller ? (
              <div style={{ position: "relative" }}>
                <div style={styles.avatar} onClick={() => setSellerMenu(o => !o)}>
                  {seller.ownerName[0].toUpperCase()}
                </div>
                {sellerMenu && (
                  <div style={styles.dropdown}>
                    <div style={styles.ddMeta}>{seller.shopName}</div>
                    <Link to="/dashboard" style={styles.ddItem} onClick={() => setSellerMenu(false)}>Dashboard</Link>
                    <Link to="/" style={styles.ddItem} onClick={() => setSellerMenu(false)}>Marketplace</Link>
                    <hr style={styles.hr} />
                    <button style={styles.ddBtn} onClick={handleSellerLogout}>Sign Out</button>
                  </div>
                )}
              </div>
            ) : buyer ? (
              <div style={{ position: "relative" }}>
                <div style={styles.avatar} onClick={() => setLoginMenu(o => !o)}>
                  {buyer.name[0].toUpperCase()}
                </div>
                {loginMenu && (
                  <div style={styles.dropdown}>
                    <div style={styles.ddMeta}>{buyer.name}</div>
                    <Link to="/my-orders" style={styles.ddItem} onClick={() => setLoginMenu(false)}>My Orders</Link>
                    <hr style={styles.hr} />
                    <button style={styles.ddBtn} onClick={() => { handleBuyerLogout(); setLoginMenu(false); }}>Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <button className="btn btn-outline btn-sm" onClick={() => setLoginMenu(o => !o)}>
                  Login
                </button>
                {loginMenu && (
                  <div style={{ ...styles.dropdown, minWidth: 210 }}>
                    <div style={styles.ddLabel}>Buyer</div>
                    <button
                      style={styles.ddItem}
                      onClick={() => { setLoginMenu(false); setBuyerModal(true); setBuyerTab("login"); }}
                    >
                      Sign in to order & track
                    </button>
                    <hr style={styles.hr} />
                    <div style={styles.ddLabel}>Seller</div>
                    <Link to="/seller/login" style={styles.ddItem} onClick={() => setLoginMenu(false)}>
                      Seller login
                    </Link>
                    <Link to="/seller/register" style={styles.ddItem} onClick={() => setLoginMenu(false)}>
                      Register my business
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {buyerModal && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setBuyerModal(false)}>
          <div style={styles.modal}>
            <button style={styles.modalClose} onClick={() => setBuyerModal(false)}>x</button>
            <h2 style={styles.modalTitle}>Continue as Buyer</h2>
            <p style={styles.modalSub}>No password needed — just your name and phone.</p>

            <div style={styles.tabBar}>
              <button
                style={{ ...styles.tab, ...(buyerTab === "login" ? styles.tabActive : {}) }}
                onClick={() => setBuyerTab("login")}
              >
                Sign In
              </button>
              <button
                style={{ ...styles.tab, ...(buyerTab === "register" ? styles.tabActive : {}) }}
                onClick={() => setBuyerTab("register")}
              >
                New here
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Your Name</label>
              <input
                style={styles.input}
                value={bName}
                onChange={e => setBName(e.target.value)}
                placeholder="Full name"
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={styles.label}>Phone Number</label>
              <input
                style={styles.input}
                value={bPhone}
                onChange={e => setBPhone(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleBuyerLogin()}
                placeholder="10-digit mobile number"
                maxLength={10}
              />
              <div style={styles.hint}>
                {buyerTab === "login"
                  ? "We use your phone to find your orders."
                  : "You'll use this to track all your orders."}
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
              onClick={handleBuyerLogin}
              disabled={!bName.trim() || bPhone.trim().length < 10}
            >
              {buyerTab === "login" ? "Sign In" : "Create Account"}
            </button>

            <p style={styles.sellerLink}>
              Are you a seller?{" "}
              <Link to="/seller/login" style={{ color: "var(--rose-dark)", fontWeight: 600 }} onClick={() => setBuyerModal(false)}>
                Seller login
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    background: "var(--white)", borderBottom: "1px solid var(--border)",
    boxShadow: "0 1px 4px rgba(61,31,45,0.06)"
  },
  inner: {
    maxWidth: 1200, margin: "0 auto", padding: "0 24px",
    height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: {
    width: 34, height: 34, borderRadius: 8, background: "var(--plum)",
    color: "white", display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 800, fontSize: "1rem"
  },
  logoText: { display: "block", fontWeight: 800, fontSize: "1.2rem", color: "var(--plum)", letterSpacing: "-0.5px" },
  logoTag: { display: "block", fontSize: "0.67rem", color: "var(--text-muted)", lineHeight: 1 },
  links: { display: "flex", alignItems: "center", gap: 2 },
  link: { padding: "8px 14px", borderRadius: 6, fontSize: "0.88rem", fontWeight: 500, color: "var(--text-muted)" },
  avatar: {
    width: 36, height: 36, borderRadius: "50%", background: "var(--plum)",
    color: "white", fontWeight: 700, fontSize: "0.85rem",
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
  },
  dropdown: {
    position: "absolute", top: "calc(100% + 8px)", right: 0,
    background: "var(--white)", border: "1px solid var(--border)",
    borderRadius: 8, boxShadow: "var(--shadow-lg)", minWidth: 180, padding: 6, zIndex: 200
  },
  ddMeta: { padding: "8px 14px 4px", fontSize: "0.8rem", fontWeight: 700, color: "var(--plum)" },
  ddLabel: {
    padding: "6px 14px 3px", fontSize: "0.7rem", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)"
  },
  ddItem: {
    display: "block", padding: "9px 14px", borderRadius: 6,
    fontSize: "0.87rem", color: "var(--text)", background: "none",
    border: "none", cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "inherit"
  },
  ddBtn: {
    display: "block", padding: "9px 14px", borderRadius: 6,
    fontSize: "0.87rem", color: "var(--text)", background: "none",
    border: "none", cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "inherit"
  },
  hr: { border: "none", borderTop: "1px solid var(--border)", margin: "4px 0" },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(61,31,45,0.5)",
    backdropFilter: "blur(3px)", zIndex: 500,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20
  },
  modal: {
    background: "var(--white)", borderRadius: 12, width: "100%", maxWidth: 400,
    padding: 36, boxShadow: "var(--shadow-lg)", position: "relative"
  },
  modalClose: {
    position: "absolute", top: 14, right: 14, background: "var(--cream-dark)",
    border: "none", width: 30, height: 30, borderRadius: "50%",
    cursor: "pointer", fontSize: "0.9rem", color: "var(--text-muted)",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  modalTitle: { fontSize: "1.35rem", fontWeight: 800, color: "var(--plum)", marginBottom: 6 },
  modalSub: { fontSize: "0.87rem", color: "var(--text-muted)", marginBottom: 22 },
  tabBar: {
    display: "flex", background: "var(--cream-dark)", borderRadius: 6,
    padding: 4, marginBottom: 22, gap: 4
  },
  tab: {
    flex: 1, padding: "8px", background: "none", border: "none",
    borderRadius: 4, fontSize: "0.87rem", fontWeight: 600,
    cursor: "pointer", color: "var(--text-muted)", fontFamily: "inherit"
  },
  tabActive: { background: "var(--white)", color: "var(--plum)", boxShadow: "0 1px 4px rgba(61,31,45,0.12)" },
  label: {
    display: "block", fontSize: "0.8rem", fontWeight: 600,
    color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em"
  },
  input: {
    width: "100%", padding: "11px 14px", border: "1.5px solid var(--border)",
    borderRadius: 6, fontSize: "0.92rem", fontFamily: "inherit",
    color: "var(--text)", background: "var(--white)", outline: "none"
  },
  hint: { fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 5 },
  sellerLink: { textAlign: "center", marginTop: 18, fontSize: "0.84rem", color: "var(--text-muted)" }
};
