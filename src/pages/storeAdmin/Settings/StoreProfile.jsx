import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Store as StoreIcon, Save } from "lucide-react";
import { getStoreByAdmin, updateStore } from "@/Redux Toolkit/Features/Store/storeThunk";

const inputStyle = {
  width: "100%", boxSizing: "border-box", border: "1px solid #e5e7eb",
  borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none",
};
const labelStyle = { fontSize: 12, fontWeight: 700, color: "#4b5563", display: "block", marginBottom: 6 };

export default function StoreProfile() {
  const dispatch = useDispatch();
  const { store, loading } = useSelector((s) => s.store);
  const [form, setForm] = useState({ name: "", address: "", phone: "", email: "", description: "", type: "" });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    dispatch(getStoreByAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (store && !loaded) {
      setForm({
        name: store.brand || store.name || "",
        address: store.contact?.address || store.storeAddress || "",
        phone: store.contact?.phone || store.phone || "",
        email: store.contact?.email || store.email || "",
        description: store.description || "",
        type: store.storeType || store.type || "RETAIL",
      });
      setLoaded(true);
    }
  }, [store, loaded]);

  const storeId = store?._id || store?.id;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!storeId) {
      toast.error("Store not loaded yet");
      return;
    }
    setSaving(true);
    try {
      const result = await dispatch(updateStore({
        id: storeId,
        storeData: {
          brand: form.name,
          storeAddress: form.address,
          email: form.email,
          phone: form.phone,
          contact: { address: form.address, email: form.email, phone: form.phone },
          description: form.description,
          storeType: form.type,
        },
      }));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Store profile updated");
        dispatch(getStoreByAdmin());
      } else {
        toast.error(result.payload || "Failed to update store profile");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "'DM Sans','Inter',sans-serif", maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <StoreIcon size={20} />
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Store Profile</h1>
      </div>
      <p style={{ margin: "0 0 20px", fontSize: 12, color: "#8a909c" }}>
        Update your store's public details. Subscription plan and status are managed by POS admin.
      </p>
      {loading && !loaded ? (
        <p style={{ color: "#6b7280" }}>Loading…</p>
      ) : (
        <form onSubmit={handleSave} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, display: "grid", gap: 14 }}>
          <div>
            <label style={labelStyle}>Store name</label>
            <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label style={labelStyle}>Address</label>
            <input style={inputStyle} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Store type</label>
            <input style={inputStyle} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} placeholder="RETAIL" />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#1a1d23", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
              <Save size={14} /> {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
