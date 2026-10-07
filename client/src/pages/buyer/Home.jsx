import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const categoryConfig = {
  food:    { img: "https://images.unsplash.com/photo-1567364000001-f5f9ab6e7f49?w=600&q=80", label: "Food & Tiffin",      desc: "Home-cooked meals, tiffin services & cloud kitchens" },
  bakery:  { img: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&q=80", label: "Bakery & Sweets",    desc: "Cakes, mithai, cookies & artisan breads" },
  craft:   { img: "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?w=600&q=80", label: "Craft & Art",        desc: "Handmade crafts, embroidery & home decor" },
  beauty:  { img: "https://images.unsplash.com/photo-1596704017254-9b5e2a025acf?w=600&q=80", label: "Beauty & Wellness",  desc: "Skincare, natural products & beauty services" },
  fashion: { img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", label: "Fashion & Clothing",   desc: "Handloom, stitching & ethnic wear" },
  other:   { img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80", label: "Other",              desc: "Everything else from local women entrepreneurs" },
};

const cats = ["all", "food", "bakery", "craft", "beauty", "fashion"];
const catLabel = { all: "All", food: "Food", bakery: "Bakery", craft: "Craft", beauty: "Beauty", fashion: "Fashion" };

export default function Home() {
  const [sellers, setSellers]       = useState([]);
  const [cities, setCities]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("all");
  const [city, setCity]             = useState("all");
  const [sort, setSort]             = useState("rating");
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

  const handleCatClick = (c) => {
    setCategory(c);
    const params = {};
    if (search) params.q = search;
    if (c !== "all") params.category = c;
    if (city !== "all") params.city = city;
    if (verifiedOnly) params.verified = "true";
    fetchSellers(params);
  };

  const sorted = [...sellers].sort((a, b) => {
    if (sort === "rating")  return b.rating - a.rating;
    if (sort === "reviews") return b.reviewCount - a.reviewCount;
    if (sort === "newest")  return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  const initials = (name) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const cfg = (cat) => categoryConfig[cat] || categoryConfig.other;

  return (
    <div>
      {/* HERO */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <p style={styles.heroBadge}>Women's Marketplace</p>
          <h1 style={styles.heroTitle}>
            From Local Hands<br />
            <span style={styles.heroAccent}>To Wider Markets.</span>
          </h1>
          <p style={styles.heroSub}>
            Discover home kitchens, craft studios and beauty makers in your city.
            Support women entrepreneurs across India.
          </p>

          <div style={styles.searchBar}>
            <input
              style={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search by name, product or locality..."
            />
            <button
              className="btn btn-primary"
              onClick={handleSearch}
              style={{ borderRadius: "0 10px 10px 0", padding: "0 24px", height: "100%", flexShrink: 0 }}
            >
              Search
            </button>
          </div>

          <div style={styles.catStrip}>
            {cats.map(c => (
              <button
                key={c}
                onClick={() => handleCatClick(c)}
                style={{ ...styles.pill, ...(category === c ? styles.pillActive : {}) }}
              >
                {catLabel[c]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORY SHOWCASE */}
      {category === "all" && !search && (
        <div style={styles.showcaseSection}>
          <div style={styles.showcaseInner}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Explore Categories</h2>
              <p style={styles.sectionSub}>Find what you are looking for</p>
            </div>
            <div style={styles.showcaseGrid}>
              {Object.entries(categoryConfig).map(([key, val]) => (
                <div
                  key={key}
                  style={styles.showcaseCard}
                  onClick={() => handleCatClick(key)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === "Enter" && handleCatClick(key)}
                >
                  <img src={val.img} alt={val.label} style={styles.showcaseImg} loading="lazy" />
                  <div style={styles.showcaseOverlay} />
                  <div style={styles.showcaseText}>
                    <div style={styles.showcaseLabel}>{val.label}</div>
                    <div style={styles.showcaseDesc}>{val.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FILTER BAR */}
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
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={e => setVerifiedOnly(e.target.checked)}
              style={{ accentColor: "var(--pink)" }}
            />
            Verified only
          </label>
          <button className="btn btn-primary btn-sm" onClick={handleSearch}>Apply</button>
          <span style={{ marginLeft: "auto", fontSize: "0.84rem", color: "var(--text-muted)", fontWeight: 500 }}>
            {sorted.length} businesses found
          </span>
        </div>
      </div>

      {/* SELLER GRID */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            {category === "all" ? "All Businesses" : cfg(category).label}
          </h2>
          <p style={styles.sectionSub}>Supporting women entrepreneurs across India</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)" }}>
            Loading...
          </div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">
            <h3>No businesses found</h3>
            <p>Try a different search or category</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {sorted.map(seller => {
              const c = cfg(seller.category);
              return (
                <div
                  key={seller._id}
                  className="card"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/seller/${seller._id}`)}
                >
                  <div style={styles.cardBanner}>
                    <img src={c.img} alt={c.label} style={styles.cardBannerImg} loading="lazy" />
                    <div style={styles.cardBannerOverlay} />
                    {seller.verified && (
                      <span style={styles.verifiedBadge}>Verified</span>
                    )}
                    <div style={styles.cardCatBadge}>
                      {seller.category.charAt(0).toUpperCase() + seller.category.slice(1)}
                    </div>
                  </div>

                  <div style={styles.avatarWrap}>
                    <div style={styles.cardAvatar}>{initials(seller.ownerName)}</div>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.cardName}>{seller.shopName}</div>
                    <div style={styles.cardMeta}>
                      {seller.locality}{seller.locality.includes(seller.city) ? "" : ", " + seller.city}
                    </div>
                    <div style={styles.productTags}>
                      {seller.products.slice(0, 3).map(p => (
                        <span key={p._id} style={styles.productTag}>
                          {p.name} <span style={{ color: "var(--pink-dark)", fontWeight: 700 }}>Rs.{p.price}</span>
                        </span>
                      ))}
                    </div>
                    <div style={styles.rating}>
                      <span style={{ color: "#f0b429" }}>
                        {"★".repeat(Math.round(seller.rating || 0))}
                        {"☆".repeat(5 - Math.round(seller.rating || 0))}
                      </span>
                      <strong style={{ marginLeft: 5, fontSize: "0.88rem" }}>{seller.rating || "—"}</strong>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>({seller.reviewCount} reviews)</span>
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
              );
            })}
          </div>
        )}
      </div>

      <div style={styles.footerStrip}>
        <p>© 2026 Daksha — Empowering Women Entrepreneurs</p>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    background: "linear-gradient(135deg, #fff0f6 0%, #f8eaff 100%)",
    padding: "72px 24px 60px", textAlign: "center",
    borderBottom: "1px solid var(--border-light)"
  },
  heroContent: { maxWidth: 680, margin: "0 auto" },
  heroBadge: {
    display: "inline-block", background: "white",
    border: "1.5px solid var(--border)", borderRadius: 30,
    padding: "5px 18px", fontSize: "0.82rem", fontWeight: 600,
    color: "var(--purple-soft)", marginBottom: 18, boxShadow: "var(--shadow)"
  },
  heroTitle: {
    fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800,
    color: "var(--purple)", lineHeight: 1.18, marginBottom: 16
  },
  heroAccent: { color: "var(--pink)" },
  heroSub: {
    fontSize: "1.05rem", color: "var(--text-muted)",
    maxWidth: 500, margin: "0 auto 32px", lineHeight: 1.7
  },
  searchBar: {
    display: "flex", maxWidth: 580, margin: "0 auto 28px",
    background: "white", borderRadius: 12, overflow: "hidden",
    boxShadow: "0 6px 24px rgba(214,51,132,0.15)",
    border: "1.5px solid var(--border)", height: 52
  },
  searchInput: {
    flex: 1, border: "none", outline: "none",
    padding: "0 18px", fontSize: "0.95rem",
    fontFamily: "inherit", background: "transparent", color: "var(--text)"
  },
  catStrip: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  pill: {
    padding: "8px 18px", borderRadius: 30,
    background: "white", color: "var(--text-body)",
    fontSize: "0.85rem", fontWeight: 500, cursor: "pointer",
    border: "1.5px solid var(--border)", transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(61,33,69,0.06)"
  },
  pillActive: {
    background: "var(--pink)", color: "white",
    borderColor: "var(--pink)", boxShadow: "0 4px 12px rgba(214,51,132,0.3)"
  },
  showcaseSection: {
    background: "white", padding: "52px 24px",
    borderBottom: "1px solid var(--border-light)"
  },
  showcaseInner: { maxWidth: 1200, margin: "0 auto" },
  showcaseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 18
  },
  showcaseCard: {
    position: "relative", borderRadius: 16, overflow: "hidden",
    height: 180, cursor: "pointer",
    boxShadow: "var(--shadow-card)", transition: "transform 0.2s, box-shadow 0.2s"
  },
  showcaseImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  showcaseOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to top, rgba(61,33,69,0.82) 0%, rgba(61,33,69,0.2) 55%, transparent 100%)"
  },
  showcaseText: { position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 16px" },
  showcaseLabel: { color: "white", fontWeight: 700, fontSize: "0.95rem" },
  showcaseDesc: { color: "rgba(255,255,255,0.72)", fontSize: "0.72rem", marginTop: 2, lineHeight: 1.3 },
  filterBar: {
    background: "white", borderBottom: "1px solid var(--border-light)",
    padding: "14px 24px", position: "sticky", top: 68, zIndex: 90,
    boxShadow: "0 2px 10px rgba(61,33,69,0.05)"
  },
  filterInner: {
    maxWidth: 1200, margin: "0 auto",
    display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
  },
  filterSelect: {
    padding: "8px 14px", border: "1.5px solid var(--border)",
    borderRadius: 8, fontSize: "0.85rem",
    background: "white", color: "var(--text)", outline: "none",
    cursor: "pointer", fontFamily: "inherit"
  },
  checkLabel: {
    display: "flex", alignItems: "center", gap: 6,
    fontSize: "0.85rem", color: "var(--text-muted)", cursor: "pointer"
  },
  section: { maxWidth: 1200, margin: "0 auto", padding: "40px 24px 60px" },
  sectionHeader: { marginBottom: 28 },
  sectionTitle: { fontSize: "1.5rem", fontWeight: 800, color: "var(--purple)", marginBottom: 4 },
  sectionSub: { fontSize: "0.88rem", color: "var(--text-muted)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 },
  cardBanner: { height: 160, position: "relative", overflow: "hidden" },
  cardBannerImg: { width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s ease" },
  cardBannerOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to top, rgba(61,33,69,0.55) 0%, transparent 60%)"
  },
  verifiedBadge: {
    position: "absolute", top: 10, right: 10,
    background: "var(--success)", color: "white",
    fontSize: "0.7rem", fontWeight: 700,
    padding: "3px 10px", borderRadius: 20
  },
  cardCatBadge: {
    position: "absolute", bottom: 10, left: 12,
    background: "rgba(255,255,255,0.92)", color: "var(--purple)",
    fontSize: "0.72rem", fontWeight: 700,
    padding: "3px 10px", borderRadius: 20, backdropFilter: "blur(4px)"
  },
  avatarWrap: { padding: "0 16px", marginTop: -22, position: "relative", zIndex: 2 },
  cardAvatar: {
    width: 46, height: 46, borderRadius: "50%",
    border: "3px solid white",
    background: "linear-gradient(135deg, var(--pink), var(--purple-mid))",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", fontWeight: 800, fontSize: "1rem",
    boxShadow: "0 3px 10px rgba(214,51,132,0.3)"
  },
  cardBody: { padding: "10px 18px 14px" },
  cardName: { fontSize: "1.05rem", fontWeight: 700, color: "var(--purple)", marginBottom: 4 },
  cardMeta: { fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 10 },
  productTags: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 },
  productTag: {
    background: "var(--pink-pale)", color: "var(--text-body)",
    padding: "4px 10px", borderRadius: 20, fontSize: "0.76rem",
    fontWeight: 500, border: "1px solid var(--border-light)"
  },
  rating: { display: "flex", alignItems: "center", gap: 4, fontSize: "0.82rem" },
  cardFooter: {
    borderTop: "1px solid var(--border-light)", padding: "12px 18px",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10
  },
  footerStrip: {
    background: "#222", color: "rgba(255,255,255,0.6)",
    textAlign: "center", padding: "22px 24px", fontSize: "0.85rem"
  }
};
