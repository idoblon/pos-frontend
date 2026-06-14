import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, Package, AlertTriangle, Edit, Trash2, Send } from "lucide-react";
import { getInventoryByStore, addInventoryItem, updateInventoryStock, deleteInventoryItem } from "@/Redux Toolkit/Features/inventory/inventoryThunk";
import { getBranchesByStore } from "@/Redux Toolkit/Features/branch/branchThunk";
import { getProductsByStore } from "@/Redux Toolkit/Features/product/productThunk";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import secureStorage from "@/util/secureStorage";
import { getLowStockThreshold } from "@/util/adminSystemSettings";

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
  tab: { padding: "8px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#6b7280", borderBottom: "2px solid transparent", transition: "all 0.2s" },
  tabActive: { color: "#1a1d23", borderBottomColor: "#1a1d23" },
};

const getStockStyle = (qty, lowStockThreshold) => {
  if (qty <= 0) return { background: "#fef2f2", color: "#e53e3e" };
  if (qty <= lowStockThreshold) return { background: "#fffbeb", color: "#d97706" };
  return { background: "#f0fdf4", color: "#059669" };
};

export default function StoreWarehouseInventory() {
  const dispatch = useDispatch();
  const { user } = useSelector((st) => st.auth);
  const { userProfile } = useSelector((st) => st.user);
  const userData = secureStorage.getUserData();
  
  const storeId = user?.storeId || userData?.storeId || userProfile?.storeId;
  
  const { inventory, loading } = useSelector((st) => st.inventory);
  const { branches } = useSelector((st) => st.branch);
  const { products } = useSelector((st) => st.product);

  const [activeTab, setActiveTab] = useState("warehouse");
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ productId: "", quantity: "" });
  const [distributeForm, setDistributeForm] = useState({ branchId: "", quantity: "" });
  const lowStockThreshold = getLowStockThreshold();

  useEffect(() => {
    if (storeId) {
      dispatch(getInventoryByStore({ storeId }));
      dispatch(getBranchesByStore(storeId));
      dispatch(getProductsByStore(storeId));
    }
  }, [dispatch, storeId]);

  const warehouseInventory = inventory?.filter(item => !item.branchId || item.branchId === null) || [];
  const branchInventory = inventory?.filter(item => item.branchId && item.branchId !== null) || [];
  
  useEffect(() => {
    console.log("DEBUG - Inventory from Redux:", inventory);
    console.log("DEBUG - Warehouse inventory filtered:", warehouseInventory);
  }, [inventory, warehouseInventory]);

  const currentInventory = activeTab === "warehouse" ? warehouseInventory : branchInventory;

  const filtered = currentInventory?.filter((item) => {
    const matchesSearch = 
      item.productName?.toLowerCase().includes(search.toLowerCase()) ||
      item.productSku?.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = activeTab === "warehouse" || !branchFilter || item.branchId === branchFilter;
    return matchesSearch && matchesBranch;
  });

  const productList = Array.isArray(products) ? products : (products?.content || []);
  
  useEffect(() => {
    console.log("DEBUG - Products from Redux:", products);
    console.log("DEBUG - Processed productList:", productList);
    console.log("DEBUG - form.productId:", form.productId);
    if (form.productId && productList?.length > 0) {
      const found = productList.find(p => String(p.id || p._id) === String(form.productId));
      console.log("DEBUG - Selected product found:", found);
    }
  }, [products, productList, form.productId]);

  const lowStockCount = filtered?.filter(item => item.quantity > 0 && item.quantity <= lowStockThreshold).length || 0;
  const outOfStockCount = filtered?.filter(item => item.quantity === 0).length || 0;
  const totalValue = filtered?.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0) || 0;

  const openAdd = () => {
    setForm({ productId: "", quantity: "" });
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

  const openDistribute = (item) => {
    setSelected(item);
    setDistributeForm({ branchId: "", quantity: "" });
    setDistributeDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.productId || !form.quantity) {
      toast.error("Please fill all required fields");
      return;
    }

    const selectedProduct = productList?.find(p => String(p.id || p._id) === String(form.productId));
    
    if (!selectedProduct) {
      console.error("Product not found. Looking for ID:", form.productId);
      console.error("Available products:", productList);
      toast.error("Selected product not found");
      return;
    }

    const unitPrice = selectedProduct?.sellingPrice || selectedProduct?.price;

    dispatch(addInventoryItem({
      branchId: null,
      storeId: storeId,
      productId: selectedProduct.id,
      quantity: Number(form.quantity),
      unitPrice: Number(unitPrice),
    }))
      .unwrap()
      .then(() => {
        console.log("Product added, now fetching updated inventory");
        toast.success("Product added to warehouse inventory successfully");
        setDialogOpen(false);
        setForm({ productId: "", quantity: "" });
        dispatch(getInventoryByStore({ storeId }));
      })
      .catch((error) => {
        toast.error(error || "Failed to add product to warehouse");
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

  const handleDistribute = (e) => {
    e.preventDefault();

    if (!selected) {
      toast.error("No item selected");
      return;
    }

    const distributeQty = Number(distributeForm.quantity);
    
    if (!distributeForm.branchId || !distributeQty) {
      toast.error("Please select branch and enter quantity");
      return;
    }

    if (distributeQty > selected.quantity) {
      toast.error(`Cannot distribute ${distributeQty} units. Only ${selected.quantity} available in warehouse.`);
      return;
    }

    const newWarehouseQty = selected.quantity - distributeQty;
    
    dispatch(updateInventoryStock({
      inventoryId: selected.id || selected._id,
      quantity: newWarehouseQty,
    }))
      .unwrap()
      .then(() => {
        const existingBranchItem = branchInventory.find(
          item => item.branchId === distributeForm.branchId && item.productId === selected.productId
        );

        if (existingBranchItem) {
          dispatch(updateInventoryStock({
            inventoryId: existingBranchItem.id || existingBranchItem._id,
            quantity: existingBranchItem.quantity + distributeQty,
          }))
            .unwrap()
            .then(() => {
              toast.success(`Distributed ${distributeQty} units to branch successfully`);
              setDistributeDialogOpen(false);
              dispatch(getInventoryByStore({ storeId }));
            })
            .catch((error) => {
              toast.error(error || "Failed to update branch inventory");
            });
        } else {
          dispatch(addInventoryItem({
            branchId: distributeForm.branchId,
            storeId: null,
            productId: selected.productId,
            quantity: distributeQty,
            unitPrice: selected.unitPrice,
          }))
            .unwrap()
            .then(() => {
              toast.success(`Distributed ${distributeQty} units to branch successfully`);
              setDistributeDialogOpen(false);
              dispatch(getInventoryByStore({ storeId }));
            })
            .catch((error) => {
              toast.error(error || "Failed to create branch inventory");
            });
        }
      })
      .catch((error) => {
        toast.error(error || "Failed to update warehouse stock");
      });
  };

  return (
    <div style={s.page}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px" }}>Store Inventory Management</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>Manage warehouse stock and branch distributions</p>
        </div>
        {activeTab === "warehouse" && (
          <button style={s.addBtn} onClick={openAdd}>
            <Plus size={14} /> Add to Warehouse
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 16, borderBottom: "1px solid #e5e7eb" }}>
        <button 
          style={{ ...s.tab, ...(activeTab === "warehouse" ? s.tabActive : {}) }}
          onClick={() => setActiveTab("warehouse")}
        >
          Package Warehouse Inventory
        </button>
        <button 
          style={{ ...s.tab, ...(activeTab === "branches" ? s.tabActive : {}) }}
          onClick={() => setActiveTab("branches")}
        >
          Store Branch Inventories
        </button>
      </div>

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
        <div style={{ ...s.card, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Package size={20} color="#3b82f6" />
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>Total Value</p>
              <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 700, color: "#3b82f6" }}>रु {totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {activeTab === "warehouse" ? "Warehouse Stock" : "Branch Stock"} ({filtered?.length || 0})
          </span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {activeTab === "branches" && (
              <select style={{ ...s.select, width: 150 }} value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                <option value="">All Branches</option>
                {branches?.map((b) => (
                  <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>
                ))}
              </select>
            )}
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
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>
              {activeTab === "warehouse" ? "Add products to your warehouse to get started" : "No products distributed to branches yet"}
            </p>
          </div>
        )}

        {filtered?.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {activeTab === "warehouse" 
                    ? ["Product", "SKU", "Stock", "Unit Price", "Total Value", "Actions"].map((h, i) => (
                        <th key={h} style={{ ...s.th, textAlign: i >= 4 ? "right" : "left" }}>{h}</th>
                      ))
                    : ["Product", "SKU", "Branch", "Stock", "Actions"].map((h, i) => (
                        <th key={h} style={{ ...s.th, textAlign: i === 4 ? "right" : "left" }}>{h}</th>
                      ))
                  }
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
                    {activeTab === "branches" && (
                      <td style={{ ...s.td, color: "#8a909c" }}>
                        {branches?.find(b => (b._id || b.id) === item.branchId)?.name || "NA"}
                      </td>
                    )}
                    <td style={s.td}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, ...getStockStyle(item.quantity, lowStockThreshold) }}>
                        {item.quantity} units
                      </span>
                    </td>
                    {activeTab === "warehouse" && (
                      <>
                        <td style={{ ...s.td, textAlign: "right" }}>रु {item.unitPrice || 0}</td>
                        <td style={{ ...s.td, textAlign: "right", fontWeight: 600 }}>रु {(item.quantity * (item.unitPrice || 0)).toFixed(2)}</td>
                      </>
                    )}
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                        {activeTab === "warehouse" && (
                          <button 
                            style={{ ...s.iconBtn, borderColor: "#3b82f6", background: "#eff6ff" }} 
                            onClick={() => openDistribute(item)}
                            title="Distribute to Branch"
                          >
                            <Send size={13} color="#3b82f6" />
                          </button>
                        )}
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

      {/* Add to Warehouse Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Product to Warehouse</DialogTitle>
            <DialogDescription>Add stock to your central warehouse inventory</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Product <span className="text-red-500">*</span></Label>
              {loading ? (
                <div style={{ padding: "12px", background: "#f5f5f5", borderRadius: 8, color: "#8a909c", fontSize: 13 }}>Loading products...</div>
              ) : productList?.length === 0 ? (
                <div style={{ padding: "12px", background: "#fef2f2", borderRadius: 8, color: "#e53e3e", fontSize: 13 }}>No products found. Please ensure backend is running and products are created.</div>
              ) : (
                <select 
                  style={s.select} 
                  value={form.productId} 
                  onChange={(e) => setForm(f => ({ ...f, productId: e.target.value }))} 
                  required
                >
                  <option value="">Select product</option>
                  {productList?.map((p) => {
                    const productId = String(p.id || p._id);
                    return (
                      <option key={productId} value={productId}>
                        {p.name} - {p.sku} (रु {p.sellingPrice || p.price})
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Quantity <span className="text-red-500">*</span></Label>
              <Input type="number" min="0" value={form.quantity} onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value }))} required />
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Info: Warehouse Stock</p>
              <p className="text-xs text-blue-600 mt-1">This stock will be added to your central warehouse. You can distribute it to branches later.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading || productList?.length === 0} style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}>Add to Warehouse</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Distribute to Branch Dialog */}
      <Dialog open={distributeDialogOpen} onOpenChange={setDistributeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Distribute to Branch</DialogTitle>
            <DialogDescription>Send stock from warehouse to a branch</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDistribute} className="space-y-4 mt-2">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Product: {selected?.productName}</p>
              <p className="text-sm text-gray-600">Available in Warehouse: <span className="font-bold text-green-600">{selected?.quantity} units</span></p>
            </div>
            <div className="space-y-1.5">
              <Label>Branch <span className="text-red-500">*</span></Label>
              <select style={s.select} value={distributeForm.branchId} onChange={(e) => setDistributeForm(f => ({ ...f, branchId: e.target.value }))} required>
                <option value="">Select branch</option>
                {branches?.map((b) => (
                  <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Quantity to Distribute <span className="text-red-500">*</span></Label>
              <Input 
                type="number" 
                min="1" 
                max={selected?.quantity} 
                value={distributeForm.quantity} 
                onChange={(e) => setDistributeForm(f => ({ ...f, quantity: e.target.value }))} 
                required 
              />
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-sm text-amber-800 font-medium">Warning: Stock Transfer</p>
              <p className="text-xs text-amber-700 mt-1">This will reduce warehouse stock and add to the selected branch's inventory.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDistributeDialogOpen(false)}>Cancel</Button>
              <Button type="submit" style={{ background: "#3b82f6", color: "white", border: "none" }}>
                <Send size={14} style={{ marginRight: 6 }} /> Distribute
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Stock Dialog */}
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
