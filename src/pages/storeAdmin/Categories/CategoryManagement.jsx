import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, Tag, Pencil, Trash2 } from "lucide-react";
import { getCategoriesByStore, createCategory, updateCategory, deleteCategory } from "@/Redux Toolkit/Features/category/categoryThunk";
import { getUserProfile } from "@/Redux Toolkit/Features/user/userThunk";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import secureStorage from "@/util/secureStorage";

const EMPTY_FORM = { name: "", description: "" };

const TAG_COLORS = [
  { bg: "#eff6ff", border: "#bfdbfe", color: "#3b82f6" },
  { bg: "#f5f5f5", border: "#e5e7eb", color: "#1a1d23" },
  { bg: "#f5f3ff", border: "#ddd6fe", color: "#7c3aed" },
  { bg: "#fffbeb", border: "#fde68a", color: "#d97706" },
  { bg: "#fff1f2", border: "#fecdd3", color: "#e53e3e" },
  { bg: "#f5f5f5", border: "#e5e7eb", color: "#4a4d55" },
];

const s = {
  page: { padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f5f5f5", minHeight: "100%" },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 10 },
  cardHeader: { padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardBody: { padding: 18 },
  searchInput: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px 7px 34px", fontFamily: "inherit", fontSize: 13, color: "#1a1d23", background: "#f5f5f5", outline: "none", boxSizing: "border-box" },
  addBtn: { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  iconBtn: { border: "none", background: "rgba(255,255,255,0.6)", borderRadius: 6, padding: "3px 5px", cursor: "pointer", display: "flex", alignItems: "center" },
  empty: { textAlign: "center", padding: "40px 0", color: "#6b7280", fontSize: 13 },
};

export default function CategoryManagement() {
  const dispatch = useDispatch();
  const { user } = useSelector((st) => st.auth);
  const { userProfile } = useSelector((st) => st.user);
  const userData = secureStorage.getUserData();
  
  const storeId = user?.storeId || userData?.storeId || userProfile?.storeId || localStorage.getItem("storeId");
  
  const { categories, loading } = useSelector((st) => st.category);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!storeId) {
      toast.error("Store ID not found. Fetching user profile...");
      dispatch(getUserProfile()).then((result) => {
        if (result.payload?.storeId) {
          dispatch(getCategoriesByStore({ storeId: result.payload.storeId }));
        }
      });
      return;
    }
    dispatch(getCategoriesByStore({ storeId }));
  }, [dispatch, storeId]);

  const filtered = categories?.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name ?? "", description: c.description ?? "" }); setDialogOpen(true); };
  const openDelete = (c) => { setSelected(c); setDeleteDialogOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!storeId) {
      toast.error("Store ID not found. Please log in again.");
      return;
    }
    
    const dto = { 
      ...form, 
      storeId: parseInt(storeId),
      store: { id: parseInt(storeId) }
    };
    
    if (editing) {
      const categoryId = editing.id || editing._id;
      dispatch(updateCategory({ id: categoryId, dto }))
        .then((result) => {
          if (result.type.includes('fulfilled')) {
            toast.success("Category updated successfully");
            dispatch(getCategoriesByStore({ storeId }));
          } else {
            toast.error(result.payload || "Failed to update category");
          }
        });
    } else {
      dispatch(createCategory({ dto }))
        .then((result) => {
          if (result.type.includes('fulfilled')) {
            toast.success("Category created successfully");
            dispatch(getCategoriesByStore({ storeId }));
          } else {
            toast.error(result.payload || "Failed to create category");
          }
        });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    const categoryId = selected.id || selected._id;
    dispatch(deleteCategory({ id: categoryId }))
      .then((result) => {
        if (result.type.includes('fulfilled')) {
          toast.success("Category deleted successfully");
          dispatch(getCategoriesByStore({ storeId }));
        } else {
          toast.error(result.payload || "Failed to delete category");
        }
      });
    setDeleteDialogOpen(false);
  };

  return (
    <div style={s.page}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px" }}>Category Management</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>Organize your products with categories</p>
        </div>
        <button style={s.addBtn} onClick={openAdd}><Plus size={14} /> Add Category</button>
      </div>

      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Categories ({filtered?.length ?? 0})</span>
          <div style={{ position: "relative", width: 240 }}>
            <Search size={14} color="#8a909c" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input style={s.searchInput} placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={s.cardBody}>
          {!loading && filtered?.length === 0 && (
            <div style={s.empty}>
              <Tag size={36} color="#e2e5e9" style={{ margin: "0 auto 10px", display: "block" }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No categories found</p>
              <p style={{ margin: "4px 0 0", fontSize: 12 }}>Add categories to organize your products</p>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {filtered?.map((cat, i) => {
              const tc = TAG_COLORS[i % TAG_COLORS.length];
              const catId = cat.id || cat._id;
              return (
                <div key={catId} style={{ background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <Tag size={14} color={tc.color} />
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: tc.color }}>{cat.name}</p>
                    </div>
                    <div style={{ display: "flex", gap: 2 }}>
                      <button style={s.iconBtn} onClick={() => openEdit(cat)}><Pencil size={12} color={tc.color} /></button>
                      <button style={s.iconBtn} onClick={() => openDelete(cat)}><Trash2 size={12} color="#e53e3e" /></button>
                    </div>
                  </div>
                  {cat.description && (
                    <p style={{ margin: 0, fontSize: 11, color: tc.color, opacity: 0.75, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {cat.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update category information" : "Create a new category to organize products"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Category Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}>{editing ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selected?.name}</strong>? Products under this category may be affected.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
