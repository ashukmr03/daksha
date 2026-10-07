import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const categoryBg = {
  food: "linear-gradient(135deg, #3d2e1a 0%, #7a4e2d 60%, #c97a2d 100%)",
  bakery: "linear-gradient(135deg, #3d2a1a 0%, #8a5a3d 60%, #e0956b 100%)",
  craft: "linear-gradient(135deg, #1a2e3d 0%, #2d5a7a 60%, #3d9bc9 100%)",
  beauty: "linear-gradient(135deg, #2e1a2e 0%, #7a2d5a 60%, #c93d7a 100%)",
  fashion: "linear-gradient(135deg, #1a2e1a 0%, #2d7a4e 60%, #3dc97a 100%)",
  other: "linear-gradient(135deg, var(--plum), var(--plum-mid), var(--rose))"
};

const cats = ["all","food","bakery","craft","beauty","fashion"];

export default function Home() {
  const [sellers, setSellers] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("all");
  const [sort, setSort] = useState("rating");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/sellers/cities").then(r => setCities(r.data));
    fetchSellers();
  }, []);

  const fetchSellers = async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/sellers", { params });
      setSellers(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = {};
    if (search) params.q = search;
    if (category !== "all") params.category = category;
    if (city !== "all") params.city = city;
    if (verifiedOnly) params.verified = "true";
    fetchSellers(params);
  };

  const sorted = [...sellers].sort((a, b) => {
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "reviews") return b.reviewCount - a.reviewCount;
    if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  const initials = (name) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Shop from <span style={{ color: "var(--rose-light)" }}>Women Who Create</span>
        </h1>
        <p style={styles.heroSub}>
          Discover home kitchens, craft studios and beauty makers in your city.
        </p>

        <div style={styles.searchBar}>
          <input
            style={styles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search by name, product or locality..."
          />
          <button className="btn btn-primary" onClick={handleSearch} style={{ borderRadius: "0 3px 3px 0", padding: "14px 24px" }}>
            Search
          </button>
        </div>

        <div style={styles.catStrip}>
          {cats.map(c => (
            <span
              key={c}
              onClick={() => { setCategory(c); handleSearch(); }}
              style={{ ...styles.pill, ...(category === c ? styles.pillActive : {}) }}
            >
              {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
            </span>
          ))}
        </div>
      </div>

      <div style={styles.filterBar}>
        <div style={styles.filterInner}>
          <select style={styles.filterSelect} value={city} onChange={e => setCity(e.target.value)}>
            <option value="all">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select style={styles.filterSelect} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest</option>
            <option value="reviews">Most Reviews</option>
          </select>
          <label style={styles.checkLabel}>
            <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} />
            Verified only
          </label>
          <button className="btn btn-ghost btn-sm" onClick={handleSearch}>Apply</button>
          <span style={{ marginLeft: "auto", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {sorted.length} businesses found
          </span>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>All Businesses</div>
        <div style={styles.sectionSub}>Supporting women entrepreneurs across India</div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">
            <h3>No businesses found</h3>
            <p>Try a different search or category</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {sorted.map(seller => (
              <div key={seller._id} className="card" style={{ cursor: "pointer" }} onClick={() => navigate(`/seller/${seller._id}`)}>
                <div style={{ ...styles.cardBanner, background: categoryBg[seller.category] || categoryBg.other }}>
                  {seller.verified && (
                    <span style={styles.verifiedBadge}>Verified</span>
                  )}
                  <div style={styles.cardAvatar}>{initials(seller.ownerName)}</div>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardCat}>{seller.category.toUpperCase()}</div>
                  <div style={styles.cardName}>{seller.shopName}</div>
                  <div style={styles.cardMeta}>
                    <span>{seller.locality}{seller.locality.includes(seller.city) ? "" : ", " + seller.city}</span>
                  </div>
                  <div style={styles.productTags}>
                    {seller.products.slice(0, 3).map(p => (
                      <span key={p._id} style={styles.productTag}>
                        {p.name} <span style={{ color: "var(--rose-dark)", fontWeight: 700 }}>Rs.{p.price}</span>
                      </span>
                    ))}
                  </div>
                  <div style={styles.rating}>
                    <span style={{ color: "#f0b429" }}>{"★".repeat(Math.round(seller.rating))}</span>
                    <strong style={{ marginLeft: 4 }}>{seller.rating || "—"}</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>({seller.reviewCount} reviews)</span>
                  </div>
                </div>
                <div style={styles.cardFooter}>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{seller.products.length} products</span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={e => { e.stopPropagation(); navigate(`/seller/${seller._id}`); }}
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  hero: {
    background: "linear-gradient(135deg, var(--plum) 0%, var(--plum-mid) 60%, var(--rose-dark) 100%)",
    color: "var(--white)", padding: "64px 24px 56px", textAlign: "center"
  },
  heroTitle: { fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, marginBottom: 12, lineHeight: 1.2 },
  heroSub: { fontSize: "1.05rem", color: "rgba(255,255,255,0.78)", maxWidth: 520, margin: "0 auto 32px" },
  searchBar: {
    display: "flex", maxWidth: 560, margin: "0 auto",
    background: "var(--white)", borderRadius: 3, overflow: "hidden",
    boxShadow: "0 4px 20px rgba(61,31,45,0.25)"
  },
  searchInput: {
    flex: 1, border: "none", outline: "none",
    padding: "14px 22px", fontSize: "0.95rem", fontFamily: "inherit",
    background: "transparent", color: "var(--text)"
  },
  catStrip: {
    maxWidth: 1200, margin: "28px auto 0", padding: "0 24px",
    display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center"
  },
  pill: {
    padding: "7px 16px", borderRadius: 4,
    background: "rgba(255,255,255,0.12)", color: "var(--white)",
    fontSize: "0.84rem", fontWeight: 500, cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.2)", transition: "all 0.2s"
  },
  pillActive: { background: "var(--white)", color: "var(--plum)", borderColor: "var(--white)" },
  heroStats: {},
  heroStat: {},
  statNum: {},
  statLbl: {},
  filterBar: {
    background: "var(--white)", borderBottom: "1px solid var(--border)",
    padding: "14px 24px", position: "sticky", top: 64, zIndex: 90
  },
  filterInner: {
    maxWidth: 1200, margin: "0 auto",
    display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
  },
  filterSelect: {
    padding: "8px 14px", border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-sm)", fontSize: "0.85rem",
    background: "var(--white)", color: "var(--text)", outline: "none", cursor: "pointer"
  },
  checkLabel: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--text-muted)", cursor: "pointer" },
  section: { maxWidth: 1200, margin: "0 auto", padding: "36px 24px" },
  sectionTitle: { fontSize: "1.35rem", fontWeight: 700, color: "var(--plum)", marginBottom: 6 },
  sectionSub: { fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: 24 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 },
  cardBanner: { height: 110, position: "relative" },
  verifiedBadge: {
    position: "absolute", top: 10, right: 10,
    background: "var(--success)", color: "white",
    fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20
  },
  cardAvatar: {
    position: "absolute", bottom: -22, left: 20,
    width: 48, height: 48, borderRadius: "50%",
    border: "3px solid var(--white)",
    background: "linear-gradient(135deg, var(--rose), var(--plum-mid))",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--white)", fontWeight: 800, fontSize: "1rem",
    boxShadow: "0 2px 8px rgba(61,31,45,0.2)"
  },
  cardBody: { padding: "32px 20px 16px" },
  cardCat: { fontSize: "0.78rem", fontWeight: 700, color: "var(--rose-dark)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 },
  cardName: { fontSize: "1.05rem", fontWeight: 700, color: "var(--plum)", marginBottom: 8 },
  cardMeta: { display: "flex", gap: 14, fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 12, flexWrap: "wrap" },
  productTags: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  productTag: {
    background: "var(--cream-dark)", color: "var(--text)",
    padding: "4px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 500
  },
  rating: { display: "flex", alignItems: "center", gap: 4, fontSize: "0.83rem" },
  cardFooter: {
    borderTop: "1px solid var(--border)", padding: "14px 20px",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10
  }
};
