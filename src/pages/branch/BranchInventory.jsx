import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Package, AlertTriangle } from "lucide-react";
import { getInventoryByBranch } from "@/Redux Toolkit/Features/inventory/inventoryThunk";
import secureStorage from "@/util/secureStorage";
import { getLowStockThreshold } from "@/util/adminSystemSettings";

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
  const storeId = userProfile?.storeId || user?.storeId || userData?.storeId;

  const { inventory, loading } = useSelector((s) => s.inventory);
  const [search, setSearch] = useState("");
  const lowStockThreshold = getLowStockThreshold();

  useEffect(() => {
    if (branchId && branchId !== "null") {
      dispatch(getInventoryByBranch({ branchId }));
    }
  }, [dispatch, branchId]);

  const filtered = inventory?.filter((item) =>
    (item.productName ?? item.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (item.productSku ?? item.sku ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount  = filtered?.filter(item => item.quantity > 0 && item.quantity <= lowStockThreshold).length || 0;
  const outOfStockCount = filtered?.filter(item => item.quantity === 0).length || 0;

  const getStockStyle = (qty) => {
    if (qty <= 0)  return { background: "#fef2f2", color: "#e53e3e" };
    if (qty <= lowStockThreshold) return { background: "#fffbeb", color: "#d97706" };
    return { background: "#f0f0f0", color: "#1a1d23" };
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
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>Go to Restock Requests to request products from Store Admin</p>
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
                      <span style={{ color: "#8a909c", fontSize: 12 }}>—</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


    </div>
  );
}
