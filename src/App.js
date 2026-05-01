import { useState, useEffect, createContext, useContext } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const API = "https://land-marketplace-api.onrender.com/api";
const UPLOADS = "https://land-marketplace-api.onrender.com/api/images/serve";
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const api = {
  get: async (path, token) => {
    const res = await fetch(`${API}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.json();
  },
  post: async (path, body, token) => {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return res.json();
  },
  put: async (path, body, token) => {
    const res = await fetch(`${API}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    return res.json();
  },
  del: async (path, token) => {
    const res = await fetch(`${API}${path}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  },
  patch: async (path, token) => {
    const res = await fetch(`${API}${path}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
  upload: async (path, formData, token) => {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return res.json();
  },
};

const injectStyles = () => {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --earth: #2C1810; --soil: #5C3D2E; --clay: #A0522D; --wheat: #D4A96A;
      --cream: #FAF3E0; --sage: #6B7C5C; --moss: #4A5C3A;
      --white: #FFFFFF; --gray: #8a8a8a; --light: #f5f0e8; --red: #C0392B; --green: #27AE60;
    }
    body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--earth); }
    h1,h2,h3,h4 { font-family: 'Playfair Display', serif; }
    input, select, textarea {
      font-family: 'DM Sans', sans-serif; width: 100%; padding: 12px 16px;
      border: 1.5px solid #ddd; border-radius: 8px; font-size: 14px;
      background: white; transition: border-color 0.2s; outline: none;
    }
    input:focus, select:focus, textarea:focus { border-color: var(--clay); }
    button { font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; transition: all 0.2s; }
    .btn-primary { background: var(--clay); color: white; padding: 12px 24px; }
    .btn-primary:hover { background: var(--soil); transform: translateY(-1px); }
    .btn-secondary { background: transparent; color: var(--clay); border: 1.5px solid var(--clay); padding: 11px 24px; }
    .btn-secondary:hover { background: var(--clay); color: white; }
    .btn-danger { background: var(--red); color: white; padding: 10px 20px; }
    .btn-danger:hover { background: #a93226; }
    .btn-green { background: var(--green); color: white; padding: 10px 20px; }
    .card { background: white; border-radius: 16px; box-shadow: 0 2px 20px rgba(44,24,16,0.08); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
    .card:hover { transform: translateY(-4px); box-shadow: 0 8px 40px rgba(44,24,16,0.15); }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-green { background: #d5f5e3; color: #1e8449; }
    .badge-orange { background: #fdebd0; color: #d35400; }
    .badge-red { background: #fadbd8; color: #922b21; }
    .toast { position: fixed; top: 20px; right: 20px; padding: 14px 24px; border-radius: 10px; font-weight: 500; z-index: 9999; animation: slideIn 0.3s ease; }
    .toast-success { background: var(--green); color: white; }
    .toast-error { background: var(--red); color: white; }
    @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .spinner { width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid var(--clay); border-radius: 50%; animation: spin 1s linear infinite; margin: 40px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 13px; color: var(--soil); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media(max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
    .page { min-height: 100vh; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    @media(max-width: 900px) { .grid-3 { grid-template-columns: repeat(2, 1fr); } }
    @media(max-width: 600px) { .grid-3 { grid-template-columns: 1fr; } }
    .tag { background: var(--light); color: var(--soil); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
    .divider { height: 1px; background: #eee; margin: 20px 0; }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--gray); }
    .empty-state h3 { font-size: 22px; margin-bottom: 8px; color: var(--soil); }
    .error-msg { color: var(--red); font-size: 13px; margin-top: 4px; }
    .leaflet-container { z-index: 1; }
    .upload-zone { border: 2px dashed var(--wheat); border-radius: 12px; padding: 32px; text-align: center; cursor: pointer; transition: all 0.2s; background: #fffbf0; }
    .upload-zone:hover { border-color: var(--clay); background: #fdf5ec; }
    .image-preview { position: relative; border-radius: 10px; overflow: hidden; aspect-ratio: 4/3; }
    .image-preview img { width: 100%; height: 100%; object-fit: cover; }
    .image-preview .delete-btn { position: absolute; top: 6px; right: 6px; background: rgba(192,57,43,0.9); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }
    .gallery-main { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 16px; cursor: pointer; }
    .gallery-thumb { aspect-ratio: 4/3; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; }
    .gallery-thumb:hover, .gallery-thumb.active { border-color: var(--clay); }
    .lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 9998; display: flex; align-items: center; justify-content: center; }
    .lightbox img { max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 8px; }
    .lightbox-close { position: absolute; top: 20px; right: 24px; color: white; font-size: 32px; cursor: pointer; background: none; border: none; }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [fetchLands]);
  return <div className={`toast toast-${type}`}>{message}</div>;
};

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const Navbar = ({ page, setPage }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav style={{ background: "var(--earth)", color: "white", position: "sticky", top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setPage("home")}>
          <span style={{ fontSize: 24 }}>🌾</span>
          <span style={{ fontFamily: "Playfair Display", fontSize: 20, fontWeight: 700 }}>LandMart</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => setPage("home")} style={{ background: "none", color: page === "home" ? "var(--wheat)" : "rgba(255,255,255,0.8)", padding: "8px 12px", fontWeight: 500 }}>Browse</button>
          {user ? (
            <>
              {user.role === "SELLER" && <button onClick={() => setPage("post-land")} style={{ background: "var(--clay)", color: "white", padding: "8px 16px", borderRadius: 8 }}>+ Post Land</button>}
              <div style={{ position: "relative" }}>
                <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "var(--wheat)", color: "var(--earth)", padding: "8px 16px", borderRadius: 8, fontWeight: 600 }}>{user.fullName?.split(" ")[0]} ▾</button>
                {menuOpen && (
                  <div style={{ position: "absolute", right: 0, top: "110%", background: "white", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", minWidth: 180, overflow: "hidden", zIndex: 200 }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #eee", color: "var(--earth)" }}>
                      <div style={{ fontWeight: 600 }}>{user.fullName}</div>
                      <div style={{ fontSize: 12, color: "var(--gray)" }}>{user.role}</div>
                    </div>
                    {user.role === "SELLER" && <MenuItem icon="📋" label="My Listings" onClick={() => { setPage("my-listings"); setMenuOpen(false); }} />}
                    <MenuItem icon="👤" label="Profile" onClick={() => { setPage("profile"); setMenuOpen(false); }} />
                    <MenuItem icon="🚪" label="Logout" onClick={() => { logout(); setMenuOpen(false); setPage("home"); }} danger />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setPage("login")} className="btn-secondary" style={{ color: "var(--wheat)", borderColor: "var(--wheat)", padding: "8px 16px" }}>Login</button>
              <button onClick={() => setPage("register")} style={{ background: "var(--wheat)", color: "var(--earth)", padding: "8px 16px", borderRadius: 8, fontWeight: 600 }}>Register</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const MenuItem = ({ icon, label, onClick, danger }) => (
  <div onClick={onClick} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: danger ? "var(--red)" : "var(--earth)", fontSize: 14, fontWeight: 500 }}
    onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
    <span>{icon}</span>{label}
  </div>
);

// ─── IMAGE GALLERY ────────────────────────────────────────────────────────────
const ImageGallery = ({ images }) => {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div style={{ height: 300, background: "linear-gradient(135deg, var(--moss), var(--sage), var(--wheat))", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 80 }}>🌿</span>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ position: "relative" }}>
       <img src={`${UPLOADS}/${images[active].imagePath}`}
          alt="Land"
          className="gallery-main"
          onClick={() => setLightbox(true)}
          style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 16, cursor: "pointer" }}
        />
        <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>
          📸 {active + 1} / {images.length}
        </div>
      </div>
      {images.length > 1 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${images.length}, 1fr)`, gap: 8, marginTop: 8 }}>
          {images.map((img, i) => (
            <img
              key={img.id}
              src={`${UPLOADS}/${img.imagePath}`}
              alt={`Land ${i + 1}`}
              className={`gallery-thumb ${i === active ? "active" : ""}`}
              onClick={() => setActive(i)}
              style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 8, cursor: "pointer", border: i === active ? "2px solid var(--clay)" : "2px solid transparent" }}
            />
          ))}
        </div>
      )}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(false)}>
          <button className="lightbox-close" onClick={() => setLightbox(false)}>✕</button>
          <img src={`${UPLOADS}/${images[active].imagePath}`} alt="Land" />
        </div>
      )}
    </div>
  );
};

// ─── IMAGE UPLOAD COMPONENT ───────────────────────────────────────────────────
const ImageUpload = ({ landId, token, showToast, existingImages = [], onImagesChange }) => {
  const [images, setImages] = useState(existingImages);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 3 - images.length;
    if (files.length > remaining) {
      showToast(`You can only add ${remaining} more image(s)`, "error");
      return;
    }
    const newPreviews = files.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setPreviews([...previews, ...newPreviews]);
  };

  const removePreview = (index) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
  };

  const uploadImages = async () => {
    if (previews.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    previews.forEach(p => formData.append("files", p.file));
    const res = await api.upload(`/images/upload/${landId}`, formData, token);
    setUploading(false);
    if (res.success) {
      showToast("Images uploaded! 📸", "success");
      setPreviews([]);
      const updated = await api.get(`/images/land/${landId}`);
      if (updated.success) { setImages(updated.data); onImagesChange && onImagesChange(updated.data); }
    } else {
      showToast(res.message || "Upload failed", "error");
    }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm("Delete this image?")) return;
    const res = await api.del(`/images/${imageId}`, token);
    if (res) {
      showToast("Image deleted", "success");
      const updated = images.filter(img => img.id !== imageId);
      setImages(updated);
      onImagesChange && onImagesChange(updated);
    }
  };

  const totalCount = images.length + previews.length;

  return (
    <div>
      {/* Existing uploaded images */}
      {images.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: "var(--soil)", marginBottom: 8, fontWeight: 600 }}>Uploaded Images ({images.length}/3)</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {images.map(img => (
              <div key={img.id} className="image-preview">
                <img src={`${UPLOADS}/${img.imagePath}`} alt="Land" />
                <button className="delete-btn" onClick={() => deleteImage(img.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview new images */}
      {previews.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: "var(--soil)", marginBottom: 8, fontWeight: 600 }}>New Images (not uploaded yet)</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {previews.map((p, i) => (
              <div key={i} className="image-preview">
                <img src={p.url} alt="Preview" />
                <button className="delete-btn" onClick={() => removePreview(i)}>✕</button>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={uploadImages} disabled={uploading} style={{ marginTop: 12, padding: "10px 24px" }}>
            {uploading ? "Uploading..." : `Upload ${previews.length} Image(s) 📸`}
          </button>
        </div>
      )}

      {/* Upload zone */}
      {totalCount < 3 && (
        <label className="upload-zone" style={{ display: "block", cursor: "pointer" }}>
          <input type="file" accept="image/*" multiple onChange={handleFileSelect} style={{ display: "none" }} />
          <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
          <div style={{ fontWeight: 600, color: "var(--soil)", marginBottom: 4 }}>Click to add photos</div>
          <div style={{ fontSize: 12, color: "var(--gray)" }}>{totalCount}/3 images • JPG, PNG supported</div>
        </label>
      )}

      {totalCount >= 3 && previews.length === 0 && (
        <div style={{ background: "#d5f5e3", borderRadius: 10, padding: 12, textAlign: "center", color: "#1e8449", fontWeight: 600 }}>
          ✅ Maximum 3 images uploaded!
        </div>
      )}
    </div>
  );
};

// ─── MAP ──────────────────────────────────────────────────────────────────────
const LandMap = ({ lands, setSelectedLand, setPage }) => {
  const validLands = lands.filter(l => l.latitude && l.longitude && l.latitude !== 0 && l.longitude !== 0);
  if (validLands.length === 0) {
    return (
      <div style={{ background: "#f0ebe0", borderRadius: 16, height: 420, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, border: "2px dashed var(--wheat)" }}>
        <span style={{ fontSize: 56 }}>🗺️</span>
        <h3 style={{ color: "var(--soil)" }}>No Map Data Yet</h3>
        <p style={{ color: "var(--gray)", fontSize: 14, textAlign: "center", maxWidth: 300 }}>Add latitude & longitude when posting land!</p>
      </div>
    );
  }
  const center = [validLands[0].latitude, validLands[0].longitude];
  const createColorIcon = (land) => {
    let color = "#2980b9";
    if (land.status === "SOLD") color = "#c0392b";
    else if (land.roadAccess === "NATIONAL_HIGHWAY" || land.roadAccess === "STATE_HIGHWAY") color = "#27ae60";
    else if (land.roadAccess === "NO_ROAD") color = "#e67e22";
    return L.divIcon({ html: `<div style="width:18px;height:18px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`, className: "", iconSize: [18, 18], iconAnchor: [9, 9] });
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap", padding: "12px 16px", background: "white", borderRadius: 12 }}>
        {[["#27ae60","Highway"],["#2980b9","Village Road"],["#e67e22","No Road"],["#c0392b","Sold"]].map(([color, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: color, border: "2px solid white", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />{label}
          </div>
        ))}
      </div>
      <div style={{ borderRadius: 16, overflow: "hidden", border: "2px solid var(--wheat)" }}>
        <MapContainer center={center} zoom={10} style={{ height: 500, width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
          {validLands.map(land => (
            <Marker key={land.id} position={[land.latitude, land.longitude]} icon={createColorIcon(land)}>
              <Popup minWidth={220}>
                <div style={{ fontFamily: "DM Sans, sans-serif", padding: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{land.title}</div>
                  <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>📍 {land.city}, {land.state}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#A0522D", marginBottom: 8 }}>₹{land.price?.toLocaleString("en-IN")}</div>
                  <button onClick={() => { setSelectedLand(land); setPage("land-detail"); }} style={{ width: "100%", background: "#A0522D", color: "white", border: "none", borderRadius: 8, padding: "9px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>View Details →</button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

// ─── LAND CARD ────────────────────────────────────────────────────────────────
const LandCard = ({ land, onClick }) => {
  const [cardImage, setCardImage] = useState(null);

  useEffect(() => {
    api.get(`/images/land/${land.id}`).then(res => {
      if (res.success && res.data && res.data.length > 0) setCardImage(res.data[0]);
    });
  }, [land.id]);

  const statusBadge = { AVAILABLE: { cls: "badge-green", label: "Available" }, SOLD: { cls: "badge-red", label: "Sold" }, UNDER_NEGOTIATION: { cls: "badge-orange", label: "Negotiating" } }[land.status] || { cls: "badge-green", label: land.status };

  return (
    <div className="card" onClick={onClick} style={{ cursor: "pointer" }}>
      <div style={{ height: 180, position: "relative", overflow: "hidden" }}>
        {cardImage ? (
<img src={`${UPLOADS}/${cardImage.imagePath}`} alt={land.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ height: "100%", background: "linear-gradient(135deg, var(--moss) 0%, var(--sage) 50%, var(--wheat) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 48 }}>🌿</span>
          </div>
        )}
        <div style={{ position: "absolute", top: 12, left: 12 }}><span className={`badge ${statusBadge.cls}`}>{statusBadge.label}</span></div>
        <div style={{ position: "absolute", top: 12, right: 12 }}><span className="badge" style={{ background: "rgba(0,0,0,0.5)", color: "white" }}>{land.landType?.replace(/_/g, " ")}</span></div>
        {land.latitude && land.latitude !== 0 && <div style={{ position: "absolute", bottom: 12, right: 12 }}><span style={{ background: "rgba(255,255,255,0.9)", color: "var(--moss)", padding: "3px 8px", borderRadius: 8, fontSize: 11, fontWeight: 600 }}>🗺️ On Map</span></div>}
      </div>
      <div style={{ padding: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 8, lineHeight: 1.3 }}>{land.title}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--gray)", fontSize: 13, marginBottom: 12 }}>📍 {land.city}, {land.state}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--clay)", fontFamily: "Playfair Display" }}>₹{land.price?.toLocaleString("en-IN")}</div>
            <div style={{ fontSize: 12, color: "var(--gray)" }}>{land.areaInAcres} Acres</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {land.waterSource && <span className="tag">💧 Water</span>}
            {land.electricity && <span className="tag">⚡ Power</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
const HomePage = ({ setPage, setSelectedLand }) => {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [search, setSearch] = useState({ city: "", state: "", landType: "" });
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });

  const fetchLands = async (page = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, size: 9, sortBy: "createdAt" });
      Object.entries(search).forEach(([k, v]) => v && params.append(k, v));
      const isSearch = Object.values(search).some(Boolean);
      const endpoint = isSearch ? `/lands/search?${params}` : `/lands?${params}`;
      const res = await api.get(endpoint);
      if (res.success) { setLands(res.data.content || []); setPagination({ page, totalPages: res.data.totalPages, totalElements: res.data.totalElements }); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchLands(); }, [fetchLands]);

  return (
    <div className="page">
      <div style={{ background: "linear-gradient(135deg, var(--earth) 0%, var(--soil) 60%, var(--clay) 100%)", color: "white", padding: "60px 0 40px" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", marginBottom: 12, lineHeight: 1.2 }}>Buy & Sell Land Directly 🌾</h1>
          <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 36 }}>No middleman, no broker — connect directly with owners</p>
          <div style={{ background: "white", borderRadius: 16, padding: 20, maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12 }}>
            <input placeholder="City" value={search.city} onChange={e => setSearch({ ...search, city: e.target.value })} style={{ border: "1.5px solid #eee" }} />
            <input placeholder="State" value={search.state} onChange={e => setSearch({ ...search, state: e.target.value })} style={{ border: "1.5px solid #eee" }} />
            <select value={search.landType} onChange={e => setSearch({ ...search, landType: e.target.value })} style={{ border: "1.5px solid #eee" }}>
              <option value="">All Types</option>
              <option value="AGRICULTURAL">Agricultural</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="INDUSTRIAL">Industrial</option>
              <option value="FOREST">Forest</option>
              <option value="PLANTATION">Plantation</option>
            </select>
            <button className="btn-primary" onClick={() => fetchLands(0)} style={{ whiteSpace: "nowrap" }}>🔍 Search</button>
          </div>
        </div>
      </div>
      <div style={{ background: "var(--wheat)", padding: "16px 0" }}>
        <div className="container" style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
          {[["🏡", pagination.totalElements, "Total Listings"], ["🚫", "0%", "Brokerage"], ["📞", "Direct", "Owner Contact"], ["🗺️", "Live Map", "View on Map"]].map(([icon, value, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{icon} <strong style={{ fontFamily: "Playfair Display", fontSize: 18 }}>{value}</strong></div>
              <div style={{ fontSize: 12, color: "var(--soil)", fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="container" style={{ padding: "40px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontSize: 24 }}>Available Lands {pagination.totalElements > 0 && <span style={{ color: "var(--gray)", fontSize: 14, fontFamily: "DM Sans", fontWeight: 400, marginLeft: 12 }}>{pagination.totalElements} listings</span>}</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView("list")} style={{ padding: "10px 22px", borderRadius: 10, border: "1.5px solid var(--clay)", background: view === "list" ? "var(--clay)" : "white", color: view === "list" ? "white" : "var(--clay)", fontWeight: 600 }}>🏡 List</button>
            <button onClick={() => setView("map")} style={{ padding: "10px 22px", borderRadius: 10, border: "1.5px solid var(--clay)", background: view === "map" ? "var(--clay)" : "white", color: view === "map" ? "white" : "var(--clay)", fontWeight: 600 }}>🗺️ Map</button>
          </div>
        </div>
        {loading ? <div className="spinner" /> : (
          view === "map" ? <LandMap lands={lands} setSelectedLand={setSelectedLand} setPage={setPage} /> : (
            lands.length === 0 ? (
              <div className="empty-state"><div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div><h3>No listings found</h3><p>Try different search criteria</p></div>
            ) : (
              <>
                <div className="grid-3">{lands.map(land => <LandCard key={land.id} land={land} onClick={() => { setSelectedLand(land); setPage("land-detail"); }} />)}</div>
                {pagination.totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                      <button key={i} onClick={() => fetchLands(i)} style={{ width: 36, height: 36, borderRadius: 8, background: i === pagination.page ? "var(--clay)" : "white", color: i === pagination.page ? "white" : "var(--earth)", border: "1.5px solid #ddd", fontWeight: 600 }}>{i + 1}</button>
                    ))}
                  </div>
                )}
              </>
            )
          )
        )}
      </div>
    </div>
  );
};

// ─── LAND DETAIL ──────────────────────────────────────────────────────────────
const LandDetail = ({ land, setPage, showToast }) => {
  const { user, token } = useAuth();
  const [images, setImages] = useState([]);
  const [inquiry, setInquiry] = useState({ message: "", buyerName: "", buyerPhone: "", buyerEmail: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (land) {
      api.get(`/images/land/${land.id}`).then(res => {
        if (res.success) setImages(res.data || []);
      });
    }
  }, [land]);

  if (!land) return null;

  const sendInquiry = async () => {
    setSending(true);
    const body = user ? { message: inquiry.message } : { message: inquiry.message, buyerName: inquiry.buyerName, buyerPhone: inquiry.buyerPhone, buyerEmail: inquiry.buyerEmail };
    const res = await api.post(`/inquiries/land/${land.id}`, body, token);
    setSending(false);
    if (res.success) { setSent(true); showToast("Inquiry sent!", "success"); }
    else showToast(res.message || "Failed", "error");
  };

  const statusColor = { AVAILABLE: "var(--green)", SOLD: "var(--red)", UNDER_NEGOTIATION: "orange" }[land.status] || "var(--green)";
  const hasLocation = land.latitude && land.longitude && land.latitude !== 0;

  return (
    <div className="page" style={{ background: "var(--cream)" }}>
      <div className="container" style={{ padding: "32px 24px" }}>
        <button onClick={() => setPage("home")} style={{ background: "none", color: "var(--clay)", fontWeight: 600, marginBottom: 20, padding: 0, fontSize: 14 }}>← Back to Listings</button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
          <div>
            {/* Image Gallery */}
            <ImageGallery images={images} />

            {/* Mini Map */}
            {hasLocation && (
              <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 24, border: "2px solid var(--wheat)" }}>
                <MapContainer center={[land.latitude, land.longitude]} zoom={14} style={{ height: 220, width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[land.latitude, land.longitude]}><Popup>{land.title}</Popup></Marker>
                </MapContainer>
              </div>
            )}

            <div className="card" style={{ padding: 28, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                <h1 style={{ fontSize: 26, lineHeight: 1.3 }}>{land.title}</h1>
                <span style={{ background: statusColor, color: "white", padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{land.status?.replace(/_/g, " ")}</span>
              </div>
              <div style={{ color: "var(--gray)", marginBottom: 20 }}>📍 {land.address}, {land.city}, {land.state} - {land.pincode}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
                {[["💰","Price",`₹${land.price?.toLocaleString("en-IN")}`],["📐","Area",`${land.areaInAcres} Acres`],["🛣️","Road",land.roadAccess?.replace(/_/g," ")]].map(([icon,label,value]) => (
                  <div key={label} style={{ background: "var(--light)", borderRadius: 10, padding: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 11, color: "var(--gray)", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{value}</div>
                  </div>
                ))}
              </div>
              <div className="divider" />
              <h3 style={{ marginBottom: 12, fontSize: 16 }}>Description</h3>
              <p style={{ color: "var(--soil)", lineHeight: 1.7 }}>{land.description}</p>
              <div className="divider" />
              <h3 style={{ marginBottom: 12, fontSize: 16 }}>Amenities</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[["💧","Water",land.waterSource],["⚡","Electricity",land.electricity],["🪧","Fencing",land.fencing]].map(([icon,label,active]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: active ? "#d5f5e3" : "#f5f5f5", color: active ? "var(--moss)" : "#aaa", fontWeight: 500, fontSize: 13 }}>{icon} {label} {active ? "✓" : "✗"}</div>
                ))}
              </div>
            </div>
          </div>

          <div>
            {land.owner && (
              <div className="card" style={{ padding: 24, marginBottom: 20, border: "2px solid var(--wheat)" }}>
                <h3 style={{ marginBottom: 16, fontSize: 18 }}>🏡 Owner Contact</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--clay)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700 }}>{land.owner.fullName?.[0]}</div>
                  <div><div style={{ fontWeight: 700, fontSize: 16 }}>{land.owner.fullName}</div><div style={{ fontSize: 12, color: "var(--gray)" }}>{land.owner.city}</div></div>
                </div>
                <a href={`tel:${land.owner.phone}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--green)", color: "white", borderRadius: 10, textDecoration: "none", fontWeight: 600, marginBottom: 10 }}>📞 {land.owner.phone}</a>
                <a href={`mailto:${land.owner.email}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--light)", color: "var(--earth)", borderRadius: 10, textDecoration: "none", fontWeight: 600 }}>✉️ {land.owner.email}</a>
                <div style={{ marginTop: 12, fontSize: 12, color: "var(--gray)", textAlign: "center" }}>🚫 No broker — Direct contact!</div>
              </div>
            )}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 16, fontSize: 18 }}>💬 Send Inquiry</h3>
              {sent ? (
                <div style={{ textAlign: "center", padding: 20 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <p style={{ fontWeight: 600, color: "var(--green)" }}>Inquiry sent!</p>
                  <p style={{ fontSize: 13, color: "var(--gray)" }}>Owner will contact you soon</p>
                </div>
              ) : (
                <>
                  {!user && (
                    <>
                      <div className="form-group"><label>Your Name</label><input placeholder="Full Name" value={inquiry.buyerName} onChange={e => setInquiry({ ...inquiry, buyerName: e.target.value })} /></div>
                      <div className="form-group"><label>Phone</label><input placeholder="Phone Number" value={inquiry.buyerPhone} onChange={e => setInquiry({ ...inquiry, buyerPhone: e.target.value })} /></div>
                      <div className="form-group"><label>Email</label><input placeholder="Email" value={inquiry.buyerEmail} onChange={e => setInquiry({ ...inquiry, buyerEmail: e.target.value })} /></div>
                    </>
                  )}
                  <div className="form-group"><label>Message</label><textarea rows={4} placeholder="I am interested in this land..." value={inquiry.message} onChange={e => setInquiry({ ...inquiry, message: e.target.value })} style={{ resize: "vertical" }} /></div>
                  <button className="btn-primary" onClick={sendInquiry} disabled={sending} style={{ width: "100%" }}>{sending ? "Sending..." : "Send Inquiry"}</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const LoginPage = ({ setPage, showToast }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Please fill all fields"); return; }
    setLoading(true);
    const res = await api.post("/auth/login", form);
    setLoading(false);
    if (res.success) { login(res.data); showToast(`Welcome back, ${res.data.fullName}!`, "success"); setPage("home"); }
    else setError(res.message || "Invalid email or password");
  };

  return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", background: "var(--cream)" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: 24 }}>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌾</div>
            <h2 style={{ fontSize: 28 }}>Welcome Back</h2>
            <p style={{ color: "var(--gray)", marginTop: 6 }}>Login to your account</p>
          </div>
          <div className="form-group"><label>Email</label><input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
          <div className="form-group"><label>Password</label><input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
          {error && <div className="error-msg" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
          <button className="btn-primary" onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: 14, fontSize: 15, marginTop: 8 }}>{loading ? "Logging in..." : "Login"}</button>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <span onClick={() => setPage("forgot-password")} style={{ color: "var(--clay)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>🔑 Forgot Password?</span>
          </div>
          <p style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "var(--gray)" }}>
            Don't have an account?{" "}
            <span onClick={() => setPage("register")} style={{ color: "var(--clay)", fontWeight: 600, cursor: "pointer" }}>Register</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
const ForgotPasswordPage = ({ setPage, showToast }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email) { setError("Please enter your email"); return; }
    setLoading(true);
    const res = await api.post("/auth/forgot-password", { email });
    setLoading(false);
    if (res.success) { setSent(true); }
    else setError(res.message || "No account found with this email");
  };

  return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", background: "var(--cream)" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: 24 }}>
        <div className="card" style={{ padding: 40 }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
              <h2 style={{ fontSize: 24, marginBottom: 12 }}>Check Your Email!</h2>
              <p style={{ color: "var(--gray)", marginBottom: 8 }}>Reset link sent to:</p>
              <p style={{ fontWeight: 700, color: "var(--clay)", marginBottom: 24 }}>{email}</p>
              <div style={{ background: "var(--light)", borderRadius: 12, padding: 16, marginBottom: 24, textAlign: "left" }}>
                <p style={{ fontSize: 13, color: "var(--soil)", lineHeight: 2 }}>1. Open your email inbox<br />2. Find email from LandMart<br />3. Click the reset link<br />⏰ Expires in 30 minutes!</p>
              </div>
              <button className="btn-primary" onClick={() => setPage("login")} style={{ width: "100%", padding: 14 }}>Back to Login</button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔑</div>
                <h2 style={{ fontSize: 28 }}>Forgot Password?</h2>
                <p style={{ color: "var(--gray)", marginTop: 8 }}>Enter your email and we'll send a reset link</p>
              </div>
              <div className="form-group"><label>Email Address</label><input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} /></div>
              {error && <div className="error-msg" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
              <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: 14, fontSize: 15 }}>{loading ? "Sending..." : "Send Reset Link 📧"}</button>
              <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--gray)" }}>
                <span onClick={() => setPage("login")} style={{ color: "var(--clay)", fontWeight: 600, cursor: "pointer" }}>← Back to Login</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
const ResetPasswordPage = ({ setPage, showToast, resetToken }) => {
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    setError("");
    if (!form.newPassword) { setError("Please enter new password"); return; }
    if (form.newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (form.newPassword !== form.confirmPassword) { setError("Passwords do not match!"); return; }
    setLoading(true);
    const res = await api.post("/auth/reset-password", { token: resetToken, newPassword: form.newPassword });
    setLoading(false);
    if (res.success) { setDone(true); }
    else setError(res.message || "Reset failed — link may have expired");
  };

  return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", background: "var(--cream)" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: 24 }}>
        <div className="card" style={{ padding: 40 }}>
          {done ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontSize: 26, marginBottom: 12 }}>Password Reset!</h2>
              <p style={{ color: "var(--gray)", marginBottom: 28 }}>Login with your new password!</p>
              <button className="btn-primary" onClick={() => setPage("login")} style={{ width: "100%", padding: 14 }}>Login Now →</button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
                <h2 style={{ fontSize: 28 }}>Set New Password</h2>
              </div>
              <div className="form-group"><label>New Password</label><input type="password" placeholder="Min 6 characters" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} /></div>
              <div className="form-group"><label>Confirm Password</label><input type="password" placeholder="Type again" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} onKeyDown={e => e.key === "Enter" && handleReset()} /></div>
              {error && <div className="error-msg" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
              <button className="btn-primary" onClick={handleReset} disabled={loading} style={{ width: "100%", padding: 14, fontSize: 15 }}>{loading ? "Resetting..." : "Reset Password ✅"}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
const RegisterPage = ({ setPage, showToast }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", role: "BUYER", city: "", state: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    if (!form.fullName || !form.email || !form.phone || !form.password) { setError("Please fill all required fields"); return; }
    if (form.phone.length !== 10) { setError("Phone must be 10 digits"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    const res = await api.post("/auth/register", form);
    setLoading(false);
    if (res.success) {
      const loginRes = await api.post("/auth/login", { email: form.email, password: form.password });
      if (loginRes.success) { login(loginRes.data); showToast("Account created! 🎉", "success"); setPage("home"); }
    } else { setError(res.message || "Registration failed"); }
  };

  return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", background: "var(--cream)", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
            <h2 style={{ fontSize: 28 }}>Create Account</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[["🏡","Seller","Sell land","SELLER"],["🔍","Buyer","Buy land","BUYER"]].map(([icon,title,desc,role]) => (
              <div key={role} onClick={() => setForm({ ...form, role })} style={{ padding: 16, border: `2px solid ${form.role === role ? "var(--clay)" : "#ddd"}`, borderRadius: 12, cursor: "pointer", textAlign: "center", background: form.role === role ? "#fdf5ec" : "white" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontWeight: 700, color: form.role === role ? "var(--clay)" : "var(--earth)" }}>{title}</div>
                <div style={{ fontSize: 12, color: "var(--gray)" }}>{desc}</div>
              </div>
            ))}
          </div>
          <div className="form-group"><label>Full Name *</label><input placeholder="Ravi Kumar" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group"><label>Email *</label><input type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="form-group"><label>Phone * (10 digits)</label><input placeholder="9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} maxLength={10} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>City</label><input placeholder="Chennai" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
            <div className="form-group"><label>State</label><input placeholder="Tamil Nadu" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Password *</label><input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          {error && <div className="error-msg" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
          <button className="btn-primary" onClick={handleRegister} disabled={loading} style={{ width: "100%", padding: 14, fontSize: 15 }}>{loading ? "Creating..." : "Create Account"}</button>
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--gray)" }}>
            Already have account?{" "}
            <span onClick={() => setPage("login")} style={{ color: "var(--clay)", fontWeight: 600, cursor: "pointer" }}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── POST LAND ────────────────────────────────────────────────────────────────
const PostLandPage = ({ setPage, showToast, editLand = null }) => {
  const { token } = useAuth();
  const [form, setForm] = useState(editLand || { title: "", description: "", price: "", address: "", city: "", state: "", pincode: "", latitude: "", longitude: "", areaInAcres: "", landType: "AGRICULTURAL", status: "AVAILABLE", surveyNumber: "", documentNumber: "", roadAccess: "VILLAGE_ROAD", waterSource: false, electricity: false, fencing: false });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [savedLandId, setSavedLandId] = useState(editLand?.id || null);
  const [step, setStep] = useState(1);

  const validate = () => {
    const e = {};
    if (!form.title) e.title = "Title is required";
    if (!form.price || form.price <= 0) e.price = "Valid price required";
    if (!form.areaInAcres || form.areaInAcres <= 0) e.areaInAcres = "Valid area required";
    if (!form.city) e.city = "City is required";
    if (!form.state) e.state = "State is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const body = { ...form, price: Number(form.price), areaInAcres: Number(form.areaInAcres), latitude: Number(form.latitude) || 0, longitude: Number(form.longitude) || 0 };
    const res = editLand ? await api.put(`/lands/${editLand.id}`, body, token) : await api.post("/lands", body, token);
    setLoading(false);
    if (res.success) {
      const landId = editLand ? editLand.id : res.data?.id;
      setSavedLandId(landId);
      showToast(editLand ? "Land updated! Now add photos 📸" : "Land posted! Now add photos 📸", "success");
      setStep(2);
    } else showToast(res.message || "Failed", "error");
  };

  const F = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });

  return (
    <div className="page" style={{ background: "var(--cream)", padding: "32px 0" }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <button onClick={() => setPage("my-listings")} style={{ background: "none", color: "var(--clay)", fontWeight: 600, marginBottom: 20, padding: 0 }}>← Back</button>
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>{editLand ? "Edit Land" : "Post Your Land"} 🏡</h2>

        {/* Steps indicator */}
        <div style={{ display: "flex", gap: 0, marginBottom: 32 }}>
          {[["1","Land Details"],["2","Add Photos 📸"]].map(([num, label], i) => (
            <div key={num} style={{ flex: 1, textAlign: "center", padding: "10px", background: step === i+1 ? "var(--clay)" : step > i+1 ? "var(--green)" : "white", color: step >= i+1 ? "white" : "var(--gray)", borderRadius: i === 0 ? "10px 0 0 10px" : "0 10px 10px 0", fontWeight: 600, fontSize: 14, border: "1.5px solid #ddd" }}>
              {step > i+1 ? "✅" : num} {label}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="card" style={{ padding: 32 }}>
            <Section title="Basic Information">
              <div className="form-group"><label>Title *</label><input placeholder="e.g. 5 Acres Agricultural Land" {...F("title")} />{errors.title && <div className="error-msg">{errors.title}</div>}</div>
              <div className="form-group"><label>Description</label><textarea rows={4} placeholder="Describe your land..." {...F("description")} style={{ resize: "vertical" }} /></div>
              <div className="form-row">
                <div className="form-group"><label>Price (₹) *</label><input type="number" placeholder="2500000" {...F("price")} />{errors.price && <div className="error-msg">{errors.price}</div>}</div>
                <div className="form-group"><label>Area (Acres) *</label><input type="number" step="0.01" placeholder="5.0" {...F("areaInAcres")} />{errors.areaInAcres && <div className="error-msg">{errors.areaInAcres}</div>}</div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Land Type</label><select {...F("landType")}><option value="AGRICULTURAL">Agricultural</option><option value="RESIDENTIAL">Residential</option><option value="COMMERCIAL">Commercial</option><option value="INDUSTRIAL">Industrial</option><option value="FOREST">Forest</option><option value="PLANTATION">Plantation</option><option value="OTHER">Other</option></select></div>
                <div className="form-group"><label>Status</label><select {...F("status")}><option value="AVAILABLE">Available</option><option value="UNDER_NEGOTIATION">Under Negotiation</option><option value="SOLD">Sold</option></select></div>
              </div>
            </Section>
            <Section title="Location">
              <div className="form-group"><label>Address</label><input placeholder="Street / Village / Area" {...F("address")} /></div>
              <div className="form-row">
                <div className="form-group"><label>City *</label><input placeholder="Chennai" {...F("city")} />{errors.city && <div className="error-msg">{errors.city}</div>}</div>
                <div className="form-group"><label>State *</label><input placeholder="Tamil Nadu" {...F("state")} />{errors.state && <div className="error-msg">{errors.state}</div>}</div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Pincode</label><input placeholder="600001" {...F("pincode")} maxLength={6} /></div>
                <div className="form-group"><label>Road Access</label><select {...F("roadAccess")}><option value="NATIONAL_HIGHWAY">National Highway</option><option value="STATE_HIGHWAY">State Highway</option><option value="VILLAGE_ROAD">Village Road</option><option value="PRIVATE_ROAD">Private Road</option><option value="NO_ROAD">No Road</option></select></div>
              </div>
            </Section>
            <Section title="📍 Map Location (Optional)">
              <div style={{ background: "#fffbf0", border: "1.5px solid var(--wheat)", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: "var(--soil)" }}>
                <strong>How to get coordinates:</strong> Open Google Maps → Right click on land → Copy numbers (e.g. 16.5062, 80.6480)
              </div>
              <div className="form-row">
                <div className="form-group"><label>Latitude</label><input type="number" step="any" placeholder="16.5062" {...F("latitude")} /></div>
                <div className="form-group"><label>Longitude</label><input type="number" step="any" placeholder="80.6480" {...F("longitude")} /></div>
              </div>
            </Section>
            <Section title="Amenities">
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[["💧","Water Source","waterSource"],["⚡","Electricity","electricity"],["🪧","Fencing","fencing"]].map(([icon,label,field]) => (
                  <div key={field} onClick={() => setForm({ ...form, [field]: !form[field] })} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", border: `2px solid ${form[field] ? "var(--clay)" : "#ddd"}`, borderRadius: 10, cursor: "pointer", background: form[field] ? "#fdf5ec" : "white", userSelect: "none" }}>
                    <span>{icon}</span><span style={{ fontWeight: 500 }}>{label}</span><span>{form[field] ? "✅" : "⭕"}</span>
                  </div>
                ))}
              </div>
            </Section>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-secondary" onClick={() => setPage("my-listings")} style={{ flex: 1, padding: 14 }}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: 14, fontSize: 15 }}>{loading ? "Saving..." : "Save & Add Photos →"}</button>
            </div>
          </div>
        )}

        {step === 2 && savedLandId && (
          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>📸 Add Photos</h3>
            <p style={{ color: "var(--gray)", marginBottom: 24, fontSize: 14 }}>Add up to 3 photos of your land. Good photos get more buyers!</p>
            <ImageUpload landId={savedLandId} token={token} showToast={showToast} />
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button className="btn-secondary" onClick={() => setPage("my-listings")} style={{ flex: 1, padding: 14 }}>Skip Photos</button>
              <button className="btn-primary" onClick={() => setPage("my-listings")} style={{ flex: 2, padding: 14, fontSize: 15 }}>Done ✅</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 28 }}>
    <h3 style={{ fontSize: 16, color: "var(--soil)", marginBottom: 16, paddingBottom: 8, borderBottom: "2px solid var(--light)" }}>{title}</h3>
    {children}
  </div>
);

// ─── MY LISTINGS ──────────────────────────────────────────────────────────────
const MyListingsPage = ({ setPage, setSelectedLand, setEditLand, showToast }) => {
  const { token } = useAuth();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedImages, setExpandedImages] = useState(null);

  const fetchMyLands = async () => {
    setLoading(true);
    const res = await api.get("/lands/my-listings", token);
    if (res.success) setLands(res.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMyLands(); }, [onClose]);

  const deleteLand = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    const ok = await api.del(`/lands/${id}`, token);
    if (ok) { showToast("Deleted!", "success"); fetchMyLands(); }
    else showToast("Failed to delete", "error");
  };

  const markSold = async (id) => {
    const res = await api.patch(`/lands/${id}/sold`, token);
    if (res.success) { showToast("Marked as sold!", "success"); fetchMyLands(); }
  };

  return (
    <div className="page" style={{ background: "var(--cream)", padding: "32px 0" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 28 }}>My Listings 📋</h2>
          <button className="btn-primary" onClick={() => setPage("post-land")}>+ Post New Land</button>
        </div>
        {loading ? <div className="spinner" /> : lands.length === 0 ? (
          <div className="empty-state card" style={{ padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
            <h3>No listings yet</h3>
            <p style={{ marginBottom: 24 }}>Post your first land listing!</p>
            <button className="btn-primary" onClick={() => setPage("post-land")}>+ Post Land</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {lands.map(land => (
              <div key={land.id} className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <div style={{ width: 80, height: 80, borderRadius: 12, background: "linear-gradient(135deg, var(--moss), var(--wheat))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0, overflow: "hidden" }}>
                    🌿
                   
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 6 }}>{land.title}</h3>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ color: "var(--gray)", fontSize: 13 }}>📍 {land.city}, {land.state}</span>
                      <span style={{ color: "var(--clay)", fontWeight: 700 }}>₹{land.price?.toLocaleString("en-IN")}</span>
                      <span className={`badge ${land.status === "AVAILABLE" ? "badge-green" : land.status === "SOLD" ? "badge-red" : "badge-orange"}`}>{land.status?.replace(/_/g, " ")}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                    <button onClick={() => setExpandedImages(expandedImages === land.id ? null : land.id)} style={{ background: "#fff3e0", color: "#e65100", padding: "8px 14px", borderRadius: 8 }}>📸 Photos</button>
                    <button onClick={() => { setSelectedLand(land); setPage("land-detail"); }} style={{ background: "var(--light)", color: "var(--earth)", padding: "8px 14px", borderRadius: 8 }}>View</button>
                    <button onClick={() => { setEditLand(land); setPage("edit-land"); }} style={{ background: "#eaf4ff", color: "#2980b9", padding: "8px 14px", borderRadius: 8 }}>Edit</button>
                    {land.status !== "SOLD" && <button className="btn-green" onClick={() => markSold(land.id)} style={{ padding: "8px 14px" }}>Mark Sold</button>}
                    <button className="btn-danger" onClick={() => deleteLand(land.id)} style={{ padding: "8px 14px" }}>Delete</button>
                  </div>
                </div>
                {/* Expanded image manager */}
                {expandedImages === land.id && (
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #eee" }}>
                    <h4 style={{ marginBottom: 16, color: "var(--soil)" }}>📸 Manage Photos</h4>
                    <ImageUpload landId={land.id} token={token} showToast={showToast} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PROFILE ──────────────────────────────────────────────────────────────────
const ProfilePage = ({ showToast }) => {
  const { user, token, updateUser } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName || "", phone: user?.phone || "", city: user?.city || "", state: user?.state || "" });
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    const res = await api.put("/users/me", form, token);
    setSaving(false);
    if (res.success) { updateUser(res.data); showToast("Profile updated!", "success"); }
    else showToast(res.message || "Failed", "error");
  };

  const changePassword = async () => {
    if (!pwForm.oldPassword || !pwForm.newPassword) { showToast("Fill all fields", "error"); return; }
    if (pwForm.newPassword.length < 6) { showToast("Min 6 characters", "error"); return; }
    setSavingPw(true);
    const res = await api.post("/users/change-password", pwForm, token);
    setSavingPw(false);
    if (res.success) { showToast("Password changed!", "success"); setPwForm({ oldPassword: "", newPassword: "" }); }
    else showToast(res.message || "Failed", "error");
  };

  return (
    <div className="page" style={{ background: "var(--cream)", padding: "32px 0" }}>
      <div className="container" style={{ maxWidth: 640 }}>
        <h2 style={{ fontSize: 28, marginBottom: 32 }}>My Profile 👤</h2>
        <div className="card" style={{ padding: 32, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--clay)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700 }}>{user?.fullName?.[0]}</div>
            <div><h3 style={{ fontSize: 20 }}>{user?.fullName}</h3><span className={`badge ${user?.role === "SELLER" ? "badge-orange" : "badge-green"}`}>{user?.role}</span></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Full Name</label><input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
            <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>City</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
            <div className="form-group"><label>State</label><input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Email (cannot change)</label><input value={user?.email} disabled style={{ background: "#f5f5f5", color: "var(--gray)" }} /></div>
          <button className="btn-primary" onClick={saveProfile} disabled={saving} style={{ padding: "12px 32px" }}>{saving ? "Saving..." : "Save Changes"}</button>
        </div>
        <div className="card" style={{ padding: 32 }}>
          <h3 style={{ fontSize: 20, marginBottom: 20 }}>🔒 Change Password</h3>
          <div className="form-group"><label>Current Password</label><input type="password" value={pwForm.oldPassword} onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })} /></div>
          <div className="form-group"><label>New Password</label><input type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} /></div>
          <button className="btn-primary" onClick={changePassword} disabled={savingPw} style={{ padding: "12px 32px" }}>{savingPw ? "Changing..." : "Change Password"}</button>
        </div>
      </div>
    </div>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => { injectStyles(); }, []);

  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("token")) return "reset-password";
    return "home";
  });

  const [resetToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "";
  });

  const [selectedLand, setSelectedLand] = useState(null);
  const [editLand, setEditLand] = useState(null);
  const [toast, setToast] = useState(null);

  const [authState, setAuthState] = useState(() => {
    try {
      const saved = sessionStorage.getItem("landmart_user");
      return saved ? JSON.parse(saved) : { user: null, token: null };
    } catch { return { user: null, token: null }; }
  });

  const showToast = (message, type = "success") => setToast({ message, type, id: Date.now() });

  const auth = {
    user: authState.user,
    token: authState.token,
    login: (data) => {
      const state = { user: { id: data.userId, fullName: data.fullName, email: data.email, phone: data.phone, role: data.role }, token: data.token };
      setAuthState(state);
      try { sessionStorage.setItem("landmart_user", JSON.stringify(state)); } catch {}
    },
    logout: () => {
      setAuthState({ user: null, token: null });
      try { sessionStorage.removeItem("landmart_user"); } catch {}
    },
    updateUser: (userData) => {
      const state = { ...authState, user: { ...authState.user, ...userData } };
      setAuthState(state);
      try { sessionStorage.setItem("landmart_user", JSON.stringify(state)); } catch {}
    },
  };

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage setPage={setPage} setSelectedLand={setSelectedLand} />;
      case "land-detail": return <LandDetail land={selectedLand} setPage={setPage} showToast={showToast} />;
      case "login": return <LoginPage setPage={setPage} showToast={showToast} />;
      case "register": return <RegisterPage setPage={setPage} showToast={showToast} />;
      case "forgot-password": return <ForgotPasswordPage setPage={setPage} showToast={showToast} />;
      case "reset-password": return <ResetPasswordPage setPage={setPage} showToast={showToast} resetToken={resetToken} />;
      case "post-land": return <PostLandPage setPage={setPage} showToast={showToast} />;
      case "edit-land": return <PostLandPage setPage={setPage} showToast={showToast} editLand={editLand} />;
      case "my-listings": return <MyListingsPage setPage={setPage} setSelectedLand={setSelectedLand} setEditLand={setEditLand} showToast={showToast} />;
      case "profile": return <ProfilePage showToast={showToast} />;
      default: return <HomePage setPage={setPage} setSelectedLand={setSelectedLand} />;
    }
  };

  return (
    <AuthContext.Provider value={auth}>
      <div>
        <Navbar page={page} setPage={setPage} />
        {renderPage()}
        {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AuthContext.Provider>
  );
}