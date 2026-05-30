import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Package, AlertTriangle, RefreshCw, Edit } from "lucide-react";
import { getInventoryByBranch, updateInventoryStock } from "@/Redux Toolkit/Features/inventory/inventoryThunk";
import { createRestockRequest } from "@/Redux Toolkit/Features/restock/restockThunk";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import secureStorage from "@/util/secureStorage";

const s = {
  page:        { padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f5f5f5", minHeight: "100%" },
  card:        { background: "white", border: "1px solid #e5e7eb", borderRadius: 10 },
  cardHeader:  { padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" },
  searchInput: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px 7px 34px", fontFamily: "inherit", fontSize: 13, outline: "none", background: "#f5f5f5", boxSizing: "border-box" },
  th:          { padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f5f5f5", textAlign: "left", borderBottom: "1px solid #e5e7eb" },
  td:          { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #e5e7eb" },
  iconBtn:     { border: "1px solid #e5e7eb", background: "white", borderRadius: 6, padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center" },
};

export default function BranchInventory() {
  const dispatch = useDispatch();
  const { userProfile } = useSelector((s) => s.user);
  const { user } = useSelector((s) => s.auth);
  const userData = secureStorage.getUserData();
  const branchId = userProfile?.branchId || user?.branchId || userData?.branchId;

  const { inventory, loading } = useSelector((s) => s.inventory);
  const [search, setSearch] = useState("");
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [restockForm, setRestockForm] = useState({ quantity: 50, notes: "" });
  const [updateForm, setUpdateForm] = useState({ quantity: 0 });

  useEffect(() => {
    if (branchId && branchId !== "null") dispatch(getInventoryByBranch({ branchId }));
  }, [dispatch, branchId]);

  const filtered = inventory?.filter((item) =>
    (item.productName ?? item.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (item.productSku ?? item.sku ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount  = filtered?.filter(item => item.quantity > 0 && item.quantity <= 10).length || 0;
  const outOfStockCount = filtered?.filter(item => item.quantity === 0).length || 0;

  const getStockStyle = (qty) => {
    if (qty <= 0)  return { background: "#fef2f2", color: "#e53e3e" };
    if (qty <= 10) return { background: "#fffbeb", color: "#d97706" };
    return { background: "#f0f0f0", color: "#1a1d23" };
  };

  const openRestockDialog = (item) => { setSelected(item); setRestockForm({ quantity: 50, notes: "" }); setRestockDialogOpen(true); };
  const openUpdateDialog  = (item) => { setSelected(item); setUpdateForm({ quantity: item.quantity || 0 }); setUpdateDialogOpen(true); };

  const handleRestockRequest = (e) => {
    e.preventDefault();
    if (!branchId || branchId === "null") { toast.error("Branch ID not found"); return; }
    dispatch(createRestockRequest({
      branchId,
      productId: selected.productId || selected.id,
      requestedQuantity: Number(restockForm.quantity),
      notes: restockForm.notes,
    }))
      .unwrap()
      .then(() => { toast.success("Restock request submitted successfully"); setRestockDialogOpen(false); })
      .catch((error) => { toast.error(error || "Failed to submit restock request"); });
  };

  const handleUpdateStock = (e) => {
    e.preventDefault();
    dispatch(updateInventoryStock({ inventoryId: selected.id || selected._id, quantity: Number(updateForm.quantity) }))
      .unwrap()
      .then(() => {
        toast.success("Stock updated successfully");
        setUpdateDialogOpen(false);
        if (branchId && branchId !== "null") dispatch(getInventoryByBranch({ branchId }));
      })
      .catch((error) => { toast.error(error || "Failed to update stock"); });
  };

  return (
    <div style={s.page}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Branch Inventory</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>Manage stock levels for your branch</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div style={{ ...s.card, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Package size={20} color="#1a1d23" />
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
          <span style={{ fontSize: 13, fontWeight: 600 }}>Items ({filtered?.length ?? 0})</span>
          <div style={{ position: "relative", width: 240 }}>
            <Search size={14} color="#8a909c" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input style={s.searchInput} placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading && <p style={{ textAlign: "center", padding: 40, color: "#8a909c" }}>Loading...</p>}

        {!loading && filtered?.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
            <Package size={36} color="#e2e5e9" style={{ margin: "0 auto 10px", display: "block" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No inventory items found</p>
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>Contact your Store Admin to add products to your branch</p>
          </div>
        )}

        {filtered?.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Product", "SKU", "Category", "Stock", "Actions"].map((h, i) => (
                    <th key={h} style={{ ...s.th, textAlign: i === 4 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item.id ?? item._id ?? i} style={{ background: "white" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ ...s.td, fontWeight: 600 }}>{item.productName ?? item.name ?? "—"}</td>
                    <td style={{ ...s.td, color: "#8a909c" }}>{item.productSku ?? item.sku ?? "—"}</td>
                    <td style={{ ...s.td, color: "#8a909c" }}>{item.categoryName ?? item.category ?? "—"}</td>
                    <td style={s.td}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, ...getStockStyle(item.quantity ?? item.stock ?? 0) }}>
                        {item.quantity ?? item.stock ?? 0} units
                      </span>
                    </td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                        <button style={s.iconBtn} onClick={() => openUpdateDialog(item)} title="Update Stock">
                          <Edit size={13} color="#6b7280" />
                        </button>
                        <button style={{ ...s.iconBtn, borderColor: "#4a4d55", background: "#f5f5f5" }} onClick={() => openRestockDialog(item)} title="Request Restock">
                          <RefreshCw size={13} color="#1a1d23" />
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

      <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Restock</DialogTitle>
            <DialogDescription>Submit a restock request for {selected?.productName}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRestockRequest} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Current Stock</Label>
              <Input value={selected?.quantity || 0} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Requested Quantity <span className="text-red-500">*</span></Label>
              <Input type="number" min="1" value={restockForm.quantity} onChange={(e) => setRestockForm(f => ({ ...f, quantity: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Notes (Optional)</Label>
              <Input value={restockForm.notes} onChange={(e) => setRestockForm(f => ({ ...f, notes: e.target.value }))} placeholder="Add any notes for the store admin..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setRestockDialogOpen(false)}>Cancel</Button>
              <Button type="submit" style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}>Submit Request</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>Update the stock quantity for {selected?.productName}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStock} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input type="number" min="0" value={updateForm.quantity} onChange={(e) => setUpdateForm(f => ({ ...f, quantity: e.target.value }))} required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}>Update</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}