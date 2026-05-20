import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Package } from "lucide-react";
import { getInventoryByBranch } from "@/Redux Toolkit/Features/inventory/inventoryThunk";
import secureStorage from "@/util/secureStorage";

const s = {
  page: { padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f0fdf4", minHeight: "100%" },
  card: { background: "white", border: "1px solid #d1fae5", borderRadius: 10 },
  cardHeader: { padding: "14px 18px", borderBottom: "1px solid #d1fae5", display: "flex", alignItems: "center", justifyContent: "space-between" },
  searchInput: { width: "100%", border: "1px solid #d1fae5", borderRadius: 8, padding: "7px 12px 7px 34px", fontFamily: "inherit", fontSize: 13, outline: "none", background: "#f0fdf4", boxSizing: "border-box" },
  th: { padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f0fdf4", textAlign: "left", borderBottom: "1px solid #d1fae5" },
  td: { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #d1fae5" },
};

export default function BranchInventory() {
  const dispatch = useDispatch();
  const userData = secureStorage.getUserData();
  const branchId = userData?.branchId;
  const { inventory, loading } = useSelector((s) => s.inventory);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (branchId) dispatch(getInventoryByBranch({ branchId }));
  }, [dispatch, branchId]);

  const filtered = inventory?.filter((item) =>
    (item.productName ?? item.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (item.sku ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const getStockStyle = (qty) => {
    if (qty <= 0)  return { background: "#fef2f2", color: "#e53e3e" };
    if (qty <= 10) return { background: "#fffbeb", color: "#d97706" };
    return { background: "#f0fdf4", color: "#059669" };
  };

  return (
    <div style={s.page}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Inventory</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>Stock levels for this branch</p>
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
          </div>
        )}

        {filtered?.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Product", "SKU", "Category", "Stock", "Unit Price"].map((h, i) => (
                    <th key={h} style={{ ...s.th, textAlign: i === 4 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item.id ?? item._id ?? i} style={{ background: "white" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ ...s.td, fontWeight: 600 }}>{item.productName ?? item.name ?? "—"}</td>
                    <td style={{ ...s.td, color: "#8a909c" }}>{item.sku ?? "—"}</td>
                    <td style={{ ...s.td, color: "#8a909c" }}>{item.categoryName ?? item.category ?? "—"}</td>
                    <td style={s.td}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, ...getStockStyle(item.quantity ?? item.stock ?? 0) }}>
                        {item.quantity ?? item.stock ?? 0} units
                      </span>
                    </td>
                    <td style={{ ...s.td, textAlign: "right", fontWeight: 700, color: "#059669" }}>
                      रु {(item.unitPrice ?? item.price ?? 0).toLocaleString("en-IN")}
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
