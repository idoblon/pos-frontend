import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Package, AlertTriangle, Truck } from "lucide-react";
import { getInventoryByBranch } from "@/Redux Toolkit/Features/inventory/inventoryThunk";
import { getOrdersByBranch } from "@/Redux Toolkit/Features/order/orderThunk";
import useBranchContext from "@/hooks/useBranchContext";
import { getLowStockThreshold } from "@/util/adminSystemSettings";
// REPLACED: plain threshold style + filter -> ROP with Safety Stock + Fuzzy Search
import { deriveDemandSeriesFromOrders, forecastAuto, forecastCroston, getReorderSuggestion } from "@/util/inventoryAlgorithms";
import { fuzzySearchByKeys } from "@/util/searchAlgorithms";
import { toast } from "sonner";

const s = {
  page:        { padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f5f5f5", minHeight: "100%" },
  card:        { background: "white", border: "1px solid #e5e7eb", borderRadius: 10 },
  cardHeader:  { padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" },
  searchInput: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px 7px 34px", fontFamily: "inherit", fontSize: 13, outline: "none", background: "#f5f5f5", boxSizing: "border-box" },
  th:          { padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f5f5f5", textAlign: "left", borderBottom: "1px solid #e5e7eb" },
  td:          { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #e5e7eb" },
  iconBtn:     { border: "1px solid #e5e7eb", background: "white", borderRadius: 6, padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center" },
};

const productIdOf = (item) => {
  const value = item?.productId ?? item?.product?.id ?? item?.product?._id ?? "";
  return String(typeof value === "object" ? value?.id ?? value?._id ?? "" : value);
};

export default function BranchInventory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { branchId } = useBranchContext();

  const { inventory, loading } = useSelector((s) => s.inventory);
  const { orders = [] } = useSelector((s) => s.order);
  const [search, setSearch] = useState("");
  const lowStockThreshold = getLowStockThreshold();

  useEffect(() => {
    if (branchId && branchId !== "null") {
      dispatch(getInventoryByBranch({ branchId }));
      dispatch(getOrdersByBranch({ branchId }));
    }
  }, [dispatch, branchId]);

  // REPLACED BUILT-IN plain `filter(includes)` -> Ranked Fuzzy Search
  const filtered = fuzzySearchByKeys(inventory || [], search, [
    (item) => item.productName ?? item.name,
    (item) => item.productSku ?? item.sku,
  ]);

  // Forecast demand from actual branch orders; zero-sales days are included.
  const demandForecasts = useMemo(() => {
    const inventoryByProduct = new Map((inventory || []).map((item) => [productIdOf(item), item]).filter(([productId]) => productId));
    const productIds = [...inventoryByProduct.keys()];
    const branchOrders = (Array.isArray(orders) ? orders : []).filter((order) => {
      const orderBranch = order.branchId ?? order.branch?.id ?? order.branch?._id;
      return Boolean(orderBranch) && String(orderBranch) === String(branchId);
    });
    const histories = deriveDemandSeriesFromOrders({ orders: branchOrders, productIds, days: 30 });
    return new Map(productIds.map((productId) => {
      const history = histories.get(productId) || [];
      const nonZeroDays = history.filter((value) => value > 0).length;
      const mean = history.reduce((sum, value) => sum + value, 0) / Math.max(history.length, 1);
      const variance = history.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(history.length, 1);
      const intermittent = nonZeroDays >= 2 && nonZeroDays / history.length <= 0.4;
      const method = intermittent ? "Croston SBA" : "Auto-selected (rolling MAE)";
      const forecast = nonZeroDays < 2
        ? null
        : intermittent
          ? forecastCroston({ history, variant: "sba" })
          : forecastAuto({ history }).forecast;
      const item = inventoryByProduct.get(productId);
      const suggestion = forecast === null ? null : getReorderSuggestion({
        quantityOnHand: Number(item?.quantity ?? item?.stock ?? 0),
        avgDailyDemand: forecast,
        dailyStdDev: Math.sqrt(variance),
        leadTimeDays: 7,
      });
      return [productId, { history, nonZeroDays, forecast, method, suggestion }];
    }));
  }, [branchId, inventory, orders]);

  const getInsight = (item) => demandForecasts.get(productIdOf(item));
  // Use forecast-driven reorder points where there is enough history; fall
  // back to the configured minimum-stock threshold for new/slowly observed SKUs.
  const lowStockCount  = filtered?.filter((item) => {
    const insight = getInsight(item);
    const quantity = Number(item.quantity ?? item.stock ?? 0);
    return quantity > 0 && (insight?.suggestion ? insight.suggestion.shouldReorder : quantity <= lowStockThreshold);
  }).length || 0;
  const outOfStockCount = filtered?.filter(item => item.quantity === 0).length || 0;

  const getStockStyle = (qty) => {
    if (qty <= 0)  return { background: "#fef2f2", color: "#e53e3e" };
    if (qty <= lowStockThreshold) return { background: "#fffbeb", color: "#d97706" };
    return { background: "#f0f0f0", color: "#1a1d23" };
  };

  const requestRestock = (item) => {
    try {
      localStorage.setItem("restockPrefill", JSON.stringify({
        productId: String(item.productId ?? item.id ?? ""),
        productName: item.productName ?? item.name ?? "",
        currentStock: item.quantity ?? item.stock ?? 0,
      }));
    } catch {
      // storage unavailable — navigate anyway, dialog opens blank
    }
    navigate("/branch/restock-requests");
    toast.info(`Requesting restock for ${item.productName ?? item.name ?? "product"}`);
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
            <AlertTriangle size={20} color="#6b7280" />
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>Low Stock</p>
              <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 700, color: "#1a1d23" }}>{lowStockCount}</p>
            </div>
          </div>
        </div>
        <div style={{ ...s.card, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={20} color="#6b7280" />
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>Out of Stock</p>
              <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 700, color: "#1a1d23" }}>{outOfStockCount}</p>
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
                  {["Product", "SKU", "Category", "Stock", "Forecast / day", "Reorder at", "Actions"].map((h, i) => (
                    <th key={h} style={{ ...s.th, textAlign: i === 6 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const insight = getInsight(item);
                  return (
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
                    <td style={{ ...s.td, color: insight?.forecast === null || !insight ? "#8a909c" : "#1a1d23" }} title={insight?.method || "Not enough recent sales history"}>
                      {insight?.forecast === null || !insight ? "Need sales history" : `${insight.forecast} units`}
                      {insight?.forecast !== null && insight && <div style={{ marginTop: 3, fontSize: 10, color: "#8a909c" }}>{insight.method}</div>}
                    </td>
                    <td style={{ ...s.td, color: insight?.suggestion?.shouldReorder ? "#b45309" : "#6b7280" }}>
                      {insight?.suggestion ? `${insight.suggestion.reorderPoint} units` : "—"}
                    </td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <button
                        style={{ ...s.iconBtn, borderColor: "#d1d5db" }}
                        onClick={() => requestRestock(item)}
                        title="Request restock from Store Admin"
                      >
                        <Truck size={13} color="#1a1d23" />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>


    </div>
  );
}
