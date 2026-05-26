import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, GitBranch, MapPin, Phone, Pencil } from "lucide-react";
import { getBranchesByStore, createBranch, updateBranch } from "@/Redux Toolkit/Features/branch/branchThunk";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EMPTY_FORM = { name: "", address: "", phone: "", city: "" };

const s = {
  page: { padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f0fdf4", minHeight: "100%" },
  card: { background: "white", border: "1px solid #d1fae5", borderRadius: 10 },
  cardHeader: { padding: "14px 18px", borderBottom: "1px solid #d1fae5", display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardBody: { padding: 18 },
  searchWrap: { position: "relative" },
  searchInput: { width: "100%", border: "1px solid #d1fae5", borderRadius: 8, padding: "7px 12px 7px 34px", fontFamily: "inherit", fontSize: 13, color: "#1a1d23", background: "#f0fdf4", outline: "none", boxSizing: "border-box" },
  addBtn: { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "linear-gradient(135deg,#059669,#0d9488)", color: "white", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  branchCard: { border: "1px solid #d1fae5", borderRadius: 10, padding: "14px 16px", background: "white", transition: "box-shadow 0.15s" },
  editBtn: { border: "1px solid #d1fae5", background: "white", borderRadius: 6, padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center", color: "#6b7280" },
  empty: { textAlign: "center", padding: "40px 0", color: "#6b7280", fontSize: 13 },
};

export default function BranchManagement() {
  const dispatch = useDispatch();
  const storeId = localStorage.getItem("storeId");
  const { branches, loading } = useSelector((st) => st.branch);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (storeId) dispatch(getBranchesByStore(storeId));
  }, [dispatch, storeId]);

  const filtered = branches?.filter(
    (b) =>
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.address?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (b) => { setEditing(b); setForm({ name: b.name ?? "", address: b.address ?? "", phone: b.phone ?? "", city: b.city ?? "" }); setDialogOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) dispatch(updateBranch({ id: editing._id, dto: { ...form, storeId } }));
    else dispatch(createBranch({ ...form, storeId }));
    setDialogOpen(false);
  };

  return (
    <div style={s.page}>
      {/* Top */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px" }}>Branch Management</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>Manage all branches of your store</p>
        </div>
        <button style={s.addBtn} onClick={openAdd}>
          <Plus size={14} /> Add Branch
        </button>
      </div>

      {/* Card */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Branches ({filtered?.length ?? 0})</span>
          <div style={{ ...s.searchWrap, width: 240 }}>
            <Search size={14} color="#8a909c" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              style={s.searchInput}
              placeholder="Search branches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div style={s.cardBody}>
          {loading && <p style={s.empty}>Loading...</p>}
          {!loading && filtered?.length === 0 && (
            <div style={s.empty}>
              <GitBranch size={36} color="#e2e5e9" style={{ margin: "0 auto 10px", display: "block" }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No branches found</p>
              <p style={{ margin: "4px 0 0", fontSize: 12 }}>Add your first branch to get started</p>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {filtered?.map((b) => (
              <div key={b._id} style={s.branchCard}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ padding: 7, borderRadius: 8, background: "#d1fae5" }}>
                      <GitBranch size={15} color="#059669" />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{b.name}</p>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20,
                        background: b.status === "inactive" ? "#eef1f5" : "#f0fdf4",
                        color: b.status === "inactive" ? "#6b7280" : "#1a6b3c",
                      }}>
                        {b.status ?? "active"}
                      </span>
                    </div>
                  </div>
                  <button style={s.editBtn} onClick={() => openEdit(b)}>
                    <Pencil size={13} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {b.address && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#8a909c" }}>
                      <MapPin size={12} /> {b.address}
                    </div>
                  )}
                  {b.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#8a909c" }}>
                      <Phone size={12} /> {b.phone}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Branch" : "Add New Branch"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {[
              { id: "name", label: "Branch Name", placeholder: "Main Branch" },
              { id: "address", label: "Address", placeholder: "123 Street, City" },
              { id: "city", label: "City", placeholder: "Kathmandu" },
              { id: "phone", label: "Phone", placeholder: "+977-..." },
            ].map(({ id, label, placeholder }) => (
              <div key={id} className="space-y-1.5">
                <Label htmlFor={id}>{label}</Label>
                <Input id={id} placeholder={placeholder} value={form[id]} onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))} required={id === "name"} />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#059669,#0d9488)", color: "white", border: "none" }}>
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
