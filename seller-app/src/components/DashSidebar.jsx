import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const items = [
  { to: "/dashboard",              label: "Overview",     end: true },
  { to: "/dashboard/orders",       label: "Orders" },
  { to: "/dashboard/transactions", label: "Transactions" },
  { to: "/dashboard/earnings",     label: "Earnings" },
  { to: "/dashboard/products",     label: "Products" },
];

export default function DashSidebar() {
  const { seller, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };

  const initials = seller?.ownerName
    ? seller.ownerName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <aside style={styles.sidebar}>
      <div style={styles.top}>
        <div style={styles.avatar}>{initials}</div>
        <div style={{ minWidth: 0 }}>
          <div style={styles.shopName}>{seller?.shopName || "My Shop"}</div>
          <div style={styles.ownerName}>{seller?.ownerName}</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "8px 0" }}>
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end || false}
            style={({ isActive }) => ({ ...styles.item, ...(isActive ? styles.itemActive : {}) })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={styles.bottom}>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 220,
    background: "linear-gradient(180deg, #3d2145 0%, #6b2875 100%)",
    color: "white", flexShrink: 0,
    position: "sticky", top: 68,
    height: "calc(100vh - 68px)",
    overflowY: "auto",
    display: "flex", flexDirection: "column",
  },
  top: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "24px 18px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    marginBottom: 4
  },
  avatar: {
    width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
    background: "linear-gradient(135deg, #d63384, #f0a8c8)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 800, fontSize: "0.9rem", color: "white",
    border: "2px solid rgba(255,255,255,0.25)"
  },
  shopName: { color: "white", fontWeight: 700, fontSize: "0.92rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  ownerName: { color: "rgba(255,255,255,0.5)", fontSize: "0.76rem", marginTop: 2 },
  item: {
    display: "flex", alignItems: "center",
    padding: "11px 20px",
    color: "rgba(255,255,255,0.55)",
    fontSize: "0.88rem", fontWeight: 500,
    cursor: "pointer",
    borderLeft: "3px solid transparent",
    transition: "all 0.15s",
    textDecoration: "none"
  },
  itemActive: {
    background: "rgba(255,255,255,0.10)",
    color: "white", borderLeftColor: "#f0a8c8", fontWeight: 700
  },
  bottom: { padding: "12px 14px 20px", borderTop: "1px solid rgba(255,255,255,0.10)" },
  logoutBtn: {
    width: "100%", padding: "9px 14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.45)",
    borderRadius: 8, cursor: "pointer",
    fontSize: "0.83rem", fontFamily: "inherit", textAlign: "left"
  }
};
