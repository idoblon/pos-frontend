import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, Package, AlertTriangle, Edit, Trash2 } from "lucide-react";
import { getInventoryByStore, addInventoryItem, updateInventoryStock, deleteInventoryItem } from "@/Redux Toolkit/Features/inventory/inventoryThunk";
import { getBranchesByStore } from "@/Redux Toolkit/Features/branch/branchThunk";
import { getProductsByStore } from "@/Redux Toolkit/Features/product/productThunk";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import secureStorage from "@/util/secureStorage";

const s = {
  page: { padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f5f5f5", minHeight: "100%" },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 10 },
  cardHeader: { padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" },
  searchInput: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px 7px 34px", fontFamily: "inherit", fontSize: 13, color: "#1a1d23", background: "#f5f5f5", outline: "none", boxSizing: "border-box" },
  addBtn: { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  th: { padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f5f5f5", textAlign: "left", borderBottom: "1px solid #e5e7eb" },
  td: { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #e5e7eb", color: "#1a1d23" },
  iconBtn: { border: "1px solid #e5e7eb", background: "white", borderRadius: 6, padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center" },
  empty: { textAlign: "center", padding: "40px 0", color: "#6b7280", fontSize: 13 },
  select: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontFamily: "inherit", fontSize: 13, background: "#f5f5f5", outline: "none" },
};

const getStockStyle = (qty) => {
  if (qty <= 0) return { background: "#fef2f2", color: "#e53e3e" };
  if (qty <= 10) return { background: "#fffbeb", color: "#d97706" };
  return { background: "#f0fdf4", color: "#059669" };
};

export default function InventoryManagement() {
  const dispatch = useDispatch();
  const { user } = useSelector((st) => st.auth);
  const { userProfile } = useSelector((st) => st.user);
  const userData = secureStorage.getUserData();
  
  const storeId = user?.storeId || userData?.storeId || userProfile?.storeId;
  
  const { inventory, loading } = useSelector((st) => st.inventory);
  const { branches } = useSelector((st) => st.branch);
  const { products } = useSelector((st) => st.product);

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ branchId: "", productId: "", quantity: "" });

  useEffect(() => {
    if (storeId) {
      dispatch(getInventoryByStore({ storeId }));
      dispatch(getBranchesByStore(storeId));
      dispatch(getProductsByStore(storeId));
    }
  }, [dispatch, storeId]);

  const filtered = inventory?.filter((item) => {
    const matchesSearch = 
      item.productName?.toLowerCase().includes(search.toLowerCase()) ||
      item.productSku?.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = !branchFilter || item.branchId === branchFilter;
    return matchesSearch && matchesBranch;
  });

  // Handle both array and paginated response for products
  const productList = Array.isArray(products) ? products : (products?.content || []);

  const lowStockCount = filtered?.filter(item => item.quantity > 0 && item.quantity <= 10).length || 0;
  const outOfStockCount = filtered?.filter(item => item.quantity === 0).length || 0;

  const openAdd = () => {
    setForm({ branchId: "", productId: "", quantity: "" });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setSelected(item);
    setForm({ quantity: item.quantity || 0 });
    setEditDialogOpen(true);
  };

  const openDelete = (item) => {
    setSelected(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.branchId || !form.productId || !form.quantity) {
      toast.error("Please fill all required fields");
      return;
    }

    const selectedProduct = productList?.find(p => (p._id || p.id) === form.productId);
    const unitPrice = selectedProduct?.sellingPrice || selectedProduct?.price;

    if (!unitPrice) {
      toast.error("Product must have a selling price");
      return;
    }

    dispatch(addInventoryItem({
      branchId: form.branchId,
      productId: form.productId,
      quantity: Number(form.quantity),
      unitPrice: Number(unitPrice),
    }))
      .unwrap()
      .then(() => {
        toast.success("Product added to branch inventory successfully");
        setDialogOpen(false);
        dispatch(getInventoryByStore({ storeId }));
      })
      .catch((error) => {
        toast.error(error || "Failed to add product to inventory");
      });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    
    dispatch(updateInventoryStock({
      inventoryId: selected.id || selected._id,
      quantity: Number(form.quantity),
    }))
      .unwrap()
      .then(() => {
        toast.success("Stock updated successfully");
        setEditDialogOpen(false);
        dispatch(getInventoryByStore({ storeId }));
      })
      .catch((error) => {
        toast.error(error || "Failed to update stock");
      });
  };

  const handleDelete = () => {
    dispatch(deleteInventoryItem({ inventoryId: selected.id || selected._id }))
      .unwrap()
      .then(() => {
        toast.success("Inventory item removed successfully");
        setDeleteDialogOpen(false);
        dispatch(getInventoryByStore({ storeId }));
      })
      .catch((error) => {
        toast.error(error || "Failed to remove inventory item");
      });
  };

  return (
    <div style={s.page}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px" }}>Inventory Management</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>Manage stock across all branches</p>
        </div>
        <button style={s.addBtn} onClick={openAdd}>
          <Plus size={14} /> Add to Inventory
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div style={{ ...s.card, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Package size={20} color="#059669" />
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>Total Items</p>
              <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 700 }}>{filtered?.length || 0}</p>
            </div>
          </div>
        </div>
        <div style={{ ...s.card, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={20} color="#d97706" />
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>Low Stock</p>
              <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 700, color: "#d97706" }}>{lowStockCount}</p>
            </div>
          </div>
        </div>
        <div style={{ ...s.card, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={20} color="#e53e3e" />
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>Out of Stock</p>
              <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 700, color: "#e53e3e" }}>{outOfStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Inventory ({filtered?.length || 0})</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select style={{ ...s.select, width: 150 }} value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
              <option value="">All Branches</option>
              {branches?.map((b) => (
                <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>
              ))}
            </select>
            <div style={{ position: "relative", width: 240 }}>
              <Search size={14} color="#8a909c" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input style={s.searchInput} placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {!loading && filtered?.length === 0 && (
          <div style={s.empty}>
            <Package size={36} color="#e2e5e9" style={{ margin: "0 auto 10px", display: "block" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No inventory items found</p>
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>Add products to branch inventory to get started</p>
          </div>
        )}

        {filtered?.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Product", "SKU", "Branch", "Stock", "Actions"].map((h, i) => (
                    <th key={h} style={{ ...s.th, textAlign: i === 4 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id || item._id} style={{ background: "white" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ ...s.td, fontWeight: 600 }}>{item.productName}</td>
                    <td style={{ ...s.td, color: "#8a909c" }}>{item.productSku}</td>
                    <td style={{ ...s.td, color: "#8a909c" }}>
                      {branches?.find(b => (b._id || b.id) === item.branchId)?.name || "—"}
                    </td>
                    <td style={s.td}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, ...getStockStyle(item.quantity) }}>
                        {item.quantity} units
                      </span>
                    </td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                        <button style={s.iconBtn} onClick={() => openEdit(item)}>
                          <Edit size={13} color="#6b7280" />
                        </button>
                        <button style={{ ...s.iconBtn, borderColor: "#fecaca" }} onClick={() => openDelete(item)}>
                          <Trash2 size={13} color="#e53e3e" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Product to Inventory</DialogTitle>
            <DialogDescription>Add a product from your catalog to a branch's inventory</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Branch <span className="text-red-500">*</span></Label>
              <select style={s.select} value={form.branchId} onChange={(e) => setForm(f => ({ ...f, branchId: e.target.value }))} required>
                <option value="">Select branch</option>
                {branches?.map((b) => (
                  <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Product <span className="text-red-500">*</span></Label>
              <select 
                style={s.select} 
                value={form.productId} 
                onChange={(e) => setForm(f => ({ ...f, productId: e.target.value }))} 
                required
              >
                <option value="">Select product</option>
                {productList?.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name} - {p.sku} (रु {p.sellingPrice || p.price})
                  </option>
                ))}
              </select>
              {!productList || productList.length === 0 ? (
                <p className="text-xs text-gray-500">No products available. Create products first.</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label>Initial Quantity <span className="text-red-500">*</span></Label>
              <Input type="number" min="0" value={form.quantity} onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value }))} required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}>Add to Inventory</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>Update the stock quantity for {selected?.productName}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input type="number" min="0" value={form.quantity} onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value }))} required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}>Update</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove from Inventory</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{selected?.productName}</strong> from inventory?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Remove</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
