import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const items = [
  { to: "/dashboard",              label: "Overview",      end: true },
  { to: "/dashboard/orders",       label: "Orders"               },
  { to: "/dashboard/transactions", label: "Transactions"         },
  { to: "/dashboard/earnings",     label: "Earnings"             },
  { to: "/dashboard/products",     label: "Products"             }
];

export default function DashSidebar() {
  const { seller, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.top}>
        <div style={styles.shopName}>{seller?.shopName || "My Shop"}</div>
        <div style={styles.ownerName}>{seller?.ownerName}</div>
      </div>

      <nav style={{ flex: 1 }}>
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

      <div style={{ padding: "0 16px 16px" }}>
        <NavLink to="/" style={{ ...styles.item, color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>
          View Marketplace
        </NavLink>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 220, background: "var(--plum)", color: "var(--white)",
    padding: "28px 0", flexShrink: 0,
    position: "sticky", top: 64, height: "calc(100vh - 64px)",
    overflowY: "auto", display: "flex", flexDirection: "column"
  },
  top: {
    padding: "0 20px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 12
  },
  shopName: { color: "var(--white)", fontWeight: 700, fontSize: "1rem" },
  ownerName: { color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", marginTop: 2 },
  item: {
    display: "flex", alignItems: "center",
    padding: "11px 20px", color: "rgba(255,255,255,0.6)",
    fontSize: "0.88rem", fontWeight: 500, cursor: "pointer",
    borderLeft: "2px solid transparent", transition: "all 0.15s",
    textDecoration: "none"
  },
  itemActive: {
    background: "rgba(255,255,255,0.07)",
    color: "var(--white)", borderLeftColor: "var(--rose-light)"
  },
  logoutBtn: {
    width: "100%", marginTop: 8, padding: "9px 14px",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.45)", borderRadius: 4,
    cursor: "pointer", fontSize: "0.83rem", fontFamily: "inherit",
    textAlign: "left"
  }
};
