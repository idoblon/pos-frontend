import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, Package, Pencil, Trash2 } from "lucide-react";
import { getProductsByStore, createProduct, updateProduct, deleteProduct } from "@/Redux Toolkit/Features/product/productThunk";
import { getCategoriesByStore } from "@/Redux Toolkit/Features/category/categoryThunk";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EMPTY_FORM = { name: "", sku: "", price: "", categoryId: "", description: "" };

const DEMO_CATEGORIES = [
  { _id: "cat1", name: "Succulents" },
  { _id: "cat2", name: "Tropical Plants" },
  { _id: "cat3", name: "Flowering Plants" },
  { _id: "cat4", name: "Accessories" },
];

const DEMO_PRODUCTS = [
  { _id: "p1", name: "Aloe Vera",          sku: "PLT-001", price: 450,  categoryId: "cat1" },
  { _id: "p2", name: "Monstera Deliciosa", sku: "PLT-002", price: 1200, categoryId: "cat2" },
  { _id: "p3", name: "Peace Lily",         sku: "PLT-003", price: 650,  categoryId: "cat3" },
  { _id: "p4", name: "Snake Plant",        sku: "PLT-004", price: 550,  categoryId: "cat1" },
  { _id: "p5", name: "Fiddle Leaf Fig",    sku: "PLT-005", price: 2200, categoryId: "cat2" },
  { _id: "p6", name: "Ceramic Pot 6in",    sku: "ACC-001", price: 320,  categoryId: "cat4" },
  { _id: "p7", name: "Potting Mix 5kg",    sku: "ACC-002", price: 280,  categoryId: "cat4" },
  { _id: "p8", name: "Orchid Plant",       sku: "PLT-006", price: 980,  categoryId: "cat3" },
];

const s = {
  page: { padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f0fdf4", minHeight: "100%" },
  card: { background: "white", border: "1px solid #d1fae5", borderRadius: 10 },
  cardHeader: { padding: "14px 18px", borderBottom: "1px solid #d1fae5", display: "flex", alignItems: "center", justifyContent: "space-between" },
  searchInput: { width: "100%", border: "1px solid #d1fae5", borderRadius: 8, padding: "7px 12px 7px 34px", fontFamily: "inherit", fontSize: 13, color: "#1a1d23", background: "#f0fdf4", outline: "none", boxSizing: "border-box" },
  addBtn: { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "linear-gradient(135deg,#059669,#0d9488)", color: "white", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  th: { padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f0fdf4", textAlign: "left", borderBottom: "1px solid #d1fae5" },
  td: { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #d1fae5", color: "#1a1d23" },
  iconBtn: { border: "1px solid #d1fae5", background: "white", borderRadius: 6, padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center" },
  empty: { textAlign: "center", padding: "40px 0", color: "#6b7280", fontSize: 13 },
};

export default function ProductManagement() {
  const dispatch = useDispatch();
  const storeId = localStorage.getItem("storeId");
  const { products, loading } = useSelector((st) => st.product);
  const { categories } = useSelector((st) => st.category);
  const displayProducts = products?.length ? products : DEMO_PRODUCTS;
  const displayCategories = categories?.length ? categories : DEMO_CATEGORIES;

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (storeId) {
      dispatch(getProductsByStore(storeId));
      dispatch(getCategoriesByStore({ storeId }));
    }
  }, [dispatch, storeId]);

  const filtered = displayProducts?.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name ?? "", sku: p.sku ?? "", price: p.price ?? "", categoryId: p.categoryId ?? "", description: p.description ?? "" }); setDialogOpen(true); };
  const openDelete = (p) => { setSelected(p); setDeleteDialogOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dto = { ...form, price: Number(form.price), storeId };
    if (editing) dispatch(updateProduct({ id: editing._id, dto }));
    else dispatch(createProduct(dto));
    setDialogOpen(false);
  };

  const handleDelete = () => { dispatch(deleteProduct(selected._id)); setDeleteDialogOpen(false); };

  return (
    <div style={s.page}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px" }}>Product Management</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>Manage your store's product catalog</p>
        </div>
        <button style={s.addBtn} onClick={openAdd}><Plus size={14} /> Add Product</button>
      </div>

      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Products ({filtered?.length ?? 0})</span>
          <div style={{ position: "relative", width: 240 }}>
            <Search size={14} color="#8a909c" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input style={s.searchInput} placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {!loading && filtered?.length === 0 && (
          <div style={s.empty}>
            <Package size={36} color="#e2e5e9" style={{ margin: "0 auto 10px", display: "block" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No products found</p>
          </div>
        )}

        {filtered?.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "SKU", "Category", "Price", "Actions"].map((h, i) => (
                    <th key={h} style={{ ...s.th, textAlign: i >= 3 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} style={{ background: "white" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ ...s.td, fontWeight: 600 }}>{p.name}</td>
                    <td style={{ ...s.td, color: "#8a909c" }}>{p.sku ?? "—"}</td>
                    <td style={{ ...s.td, color: "#8a909c" }}>{displayCategories?.find((c) => c._id === p.categoryId)?.name ?? "—"}</td>
                    <td style={{ ...s.td, textAlign: "right", fontWeight: 700, color: "#059669" }}>रु {p.price}</td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                        <button style={s.iconBtn} onClick={() => openEdit(p)}><Pencil size={13} color="#6b7280" /></button>
                        <button style={{ ...s.iconBtn, borderColor: "#fecaca" }} onClick={() => openDelete(p)}><Trash2 size={13} color="#e53e3e" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "Add New Product"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Product Name</Label>
                <Input placeholder="e.g. Cotton T-Shirt" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>SKU</Label>
                <Input placeholder="SKU-001" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Price (रु)</Label>
                <Input type="number" placeholder="0" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Category</Label>
                <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none" style={{ borderColor: "#e2e5e9", background: "#f5f6f8" }} value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
                  <option value="">Select category</option>
                  {displayCategories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Description</Label>
                <Input placeholder="Optional description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#059669,#0d9488)", color: "white", border: "none" }}>{editing ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Product</DialogTitle></DialogHeader>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            Are you sure you want to delete <strong>{selected?.name}</strong>? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
