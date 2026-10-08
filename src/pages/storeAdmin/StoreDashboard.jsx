import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { GitBranch, Package, Users, Tag, Banknote, CreditCard, Smartphone } from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getBranchesByStore } from "@/Redux Toolkit/Features/branch/branchThunk";
import { getProductsByStore } from "@/Redux Toolkit/Features/product/productThunk";
import { findStoreEmployee } from "@/Redux Toolkit/Features/Employee/employeeThunk";
import { getCategoriesByStore } from "@/Redux Toolkit/Features/category/categoryThunk";
import {
  getStoreByAdmin,
  getStoreById,
  updateStore,
} from "@/Redux Toolkit/Features/Store/storeThunk";
import ExpiryAlerts from "@/components/ExpiryAlerts";
import {
  getBulkTiers,
  getModifierOptions,
  getMoq,
  inferStoreType,
  isControlled,
  isExpired,
  isNearExpiry,
  isWeightedProduct,
  requiresPrescription,
  resolveStoreType,
  STORE_TYPES,
} from "@/util/storeTypes";
import api from "@/util/api";
import secureStorage from "@/util/secureStorage";

const card = {
  background: "white",
  border: "1px solid #e2e5e9",
  borderRadius: 10,
  padding: "18px 20px",
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e5e9",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        fontSize: 12,
      }}
    >
      <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#1a1d23" }}>{label}</p>
      <p style={{ margin: 0, color: "#1a5c38", fontWeight: 700 }}>
        रु {payload[0].value?.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

export default function StoreDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { userProfile } = useSelector((s) => s.user);
  const userData = secureStorage.getUserData();
  const storeId =
    user?.storeId ||
    userData?.storeId ||
    userProfile?.storeId ||
    localStorage.getItem("storeId");

  const { branches } = useSelector((s) => s.branch);
  const { products } = useSelector((s) => s.product);
  const { employees } = useSelector((s) => s.employee);
  const { categories } = useSelector((s) => s.category);
  const { store } = useSelector((s) => s.store);
  // Resolution order: admin store endpoint → user profile (carries
  // storeType from the backend UserMapper) → session → direct store fetch.
  const storeType = resolveStoreType(
    store,
    userProfile?.storeType || user?.storeType || userData?.storeType || "",
  );

  const [allOrders, setAllOrders] = useState([]);
  // One-time store-type setup for stores registered before types existed.
  const [setupType, setSetupType] = useState("");
  const [savingType, setSavingType] = useState(false);

  // Start of current calendar month — resets naturally on the 1st
  const monthStart = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    if (!storeId) return;
    dispatch(getBranchesByStore(storeId));
    dispatch(getProductsByStore(storeId));
    dispatch(findStoreEmployee({ storeId }));
    dispatch(getCategoriesByStore({ storeId }));
    // Admin endpoint first; direct store fetch as backup — both fill s.store.
    dispatch(getStoreByAdmin())
      .unwrap()
      .catch(() => dispatch(getStoreById(storeId)).catch(() => undefined));
  }, [dispatch, storeId]);

  // Fetch this store's monthly orders in one call (previously one call per
  // branch), refresh every 30s
  useEffect(() => {
    if (!storeId) return;
    const loadOrders = () =>
      api
        .get(`/api/orders/monthly/store/${storeId}`)
        .then((res) => setAllOrders(Array.isArray(res.data) ? res.data : []))
        .catch(() => {});
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [storeId]);

  // Scope all financial metrics to current month
  const monthlyOrders = useMemo(
    () => allOrders.filter((o) => o.createdAt && new Date(o.createdAt) >= monthStart),
    [allOrders, monthStart]
  );

  const activeBranches = branches?.filter((b) => b.status === "active")?.length ?? 0;

  const trendData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const label = date.toLocaleDateString("en-US", { weekday: "short" });
      const dateStr = date.toISOString().slice(0, 10);
      const dayOrders = monthlyOrders.filter((o) => {
        const d = o.createdAt || o.orderDate || o.date || "";
        return d.slice(0, 10) === dateStr;
      });
      days.push({
        label,
        revenue: dayOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0),
        orders: dayOrders.length,
      });
    }
    return days;
  }, [monthlyOrders]);

  const branchSales = useMemo(() => {
    if (!branches?.length) return [];
    return branches
      .map((branch) => {
        const id = branch.id || branch._id;
        const branchOrders = monthlyOrders.filter((o) => String(o.branchId) === String(id));
        return {
          name: branch.name || `Branch ${id}`,
          address: branch.address || branch.location || "No address",
          revenue: branchOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0),
          orders: branchOrders.length,
        };
      })
      // ALGORITHM: Descending Sort for ranking (Top branches first)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);
  }, [branches, monthlyOrders]);

  const maxRevenue = Math.max(...branchSales.map((b) => b.revenue), 1);

  const paymentBreakdown = useMemo(() => {
    const totals = { CASH: 0, CARD: 0, ESEWA: 0, KHALTI: 0 };
    monthlyOrders.forEach((order) => {
      const method = String(order.paymentType || order.paymentMethod || "").toUpperCase();
      if (Object.hasOwn(totals, method)) {
        totals[method] += Number(order.totalAmount ?? order.total ?? 0) || 0;
      }
    });
    return totals;
  }, [monthlyOrders]);

  // ── Per-store-type operations insights (client-side, catalog + orders) ──
  const productList = useMemo(
    () => (Array.isArray(products) ? products : products?.content || []),
    [products],
  );

  const ops = useMemo(() => {
    const expired = productList.filter(isExpired);
    const nearExpiry = productList.filter((p) => isNearExpiry(p));
    const rx = productList.filter(requiresPrescription);
    const controlled = productList.filter(isControlled);
    const weighted = productList.filter(isWeightedProduct);
    const serialized = productList.filter((p) => p.requiresSerial || p.serialRequired);
    const warranty = productList.filter((p) => p.warrantyMonths || p.warranty);
    const bulk = productList.filter((p) => getBulkTiers(p).length > 0);
    const moq = productList.filter((p) => getMoq(p) > 0);
    const variants = productList.filter(
      (p) => (Array.isArray(p.variants) && p.variants.length > 0) || p.sizeVariant || p.colorVariant,
    );
    const modifiers = productList.filter((p) => getModifierOptions(p).length > 0);
    const prep = productList.filter((p) => p.preparationTime);
    const care = productList.filter((p) => p.careInstructions);
    const guarantee = productList.filter((p) => p.guaranteeDays);
    const orderTypes = { DINE_IN: 0, TAKEAWAY: 0, DELIVERY: 0 };
    const tables = new Set();
    monthlyOrders.forEach((o) => {
      const t = String(o.orderType || "").toUpperCase();
      if (orderTypes[t] !== undefined) orderTypes[t] += 1;
      if (o.tableNumber) tables.add(String(o.tableNumber));
    });
    let wastageEntries = 0;
    try {
      const log = JSON.parse(localStorage.getItem("pos_wastage_log") || "[]");
      wastageEntries = Array.isArray(log) ? log.length : 0;
    } catch { wastageEntries = 0; }
    return {
      expired, nearExpiry, rx, controlled, weighted, serialized, warranty,
      bulk, moq, variants, modifiers, prep, care, guarantee,
      orderTypes, tablesUsed: tables.size, wastageEntries,
    };
  }, [productList, monthlyOrders]);

  const summaryStats = [
    {
      label: "Total Branches",
      value: branches?.length ?? 0,
      sub: `${activeBranches} active`,
      icon: GitBranch,
      iconColor: "#1a1d23",
    },
    {
      label: "Total Products",
      value: Array.isArray(products)
        ? products.length
        : (products?.content?.length ?? products?.totalElements ?? 0),
      sub: `${categories?.length ?? 0} categories`,
      icon: Package,
      iconColor: "#4a4d55",
    },
    {
      label: "Employees",
      value: employees?.length ?? 0,
      sub: "across all branches",
      icon: Users,
      iconColor: "#1a1d23",
    },
    {
      label: "Categories",
      value: categories?.length ?? 0,
      sub: "product groups",
      icon: Tag,
      iconColor: "#4a4d55",
    },
  ];

  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // ── Unique panel per store type (system colors only) ──
  const verticalPanel = useMemo(() => {
    const kpi = (label, value, alert = false) => ({ label, value, alert });
    const act = (to, label) => ({ to, label });
    switch (storeType) {
      case "RESTAURANT":
        return {
          title: "Restaurant operations", badge: "RESTAURANT",
          kpis: [
            kpi("Dine-in orders", ops.orderTypes.DINE_IN),
            kpi("Takeaway", ops.orderTypes.TAKEAWAY),
            kpi("Delivery", ops.orderTypes.DELIVERY),
            kpi("Tables served", ops.tablesUsed),
            kpi("Timed menu items", ops.prep.length),
            kpi("Items with modifiers", ops.modifiers.length),
          ],
          actions: [act("operations", "Live tables & KOT"), act("products", "Menu & modifiers"), act("reports", "Sales reports")],
          expiryAlerts: false,
        };
      case "PHARMACY":
        return {
          title: "Pharmacy operations", badge: "PHARMACY",
          kpis: [
            kpi("Rx SKUs", ops.rx.length),
            kpi("Controlled", ops.controlled.length, ops.controlled.length > 0),
            kpi("Expired (blocked)", ops.expired.length, ops.expired.length > 0),
            kpi("Near expiry ≤30d", ops.nearExpiry.length, ops.nearExpiry.length > 0),
          ],
          actions: [act("products", "Rx catalog"), act("inventory", "Batches & FEFO"), act("reports", "Sales reports")],
          expiryAlerts: true,
        };
      case "GROCERY":
        return {
          title: "Grocery operations", badge: "GROCERY",
          kpis: [
            kpi("Weighted SKUs", ops.weighted.length),
            kpi("Bulk tiers", ops.bulk.length),
            kpi("Near expiry ≤30d", ops.nearExpiry.length, ops.nearExpiry.length > 0),
            kpi("Expired (blocked)", ops.expired.length, ops.expired.length > 0),
            kpi("Wastage entries", ops.wastageEntries),
          ],
          actions: [act("products", "Catalog & units"), act("inventory", "Stock & wastage"), act("reports", "Sales reports")],
          expiryAlerts: true,
        };
      case "ELECTRONICS":
        return {
          title: "Electronics operations", badge: "ELECTRONICS",
          kpis: [
            kpi("Serialized SKUs", ops.serialized.length),
            kpi("Warranty SKUs", ops.warranty.length),
            kpi("Bulk tiers", ops.bulk.length),
            kpi("Variants", ops.variants.length),
          ],
          actions: [act("products", "Serials & warranty"), act("inventory", "Stock levels"), act("reports", "Sales reports")],
          expiryAlerts: false,
        };
      case "WHOLESALE":
        return {
          title: "Wholesale operations", badge: "WHOLESALE",
          kpis: [
            kpi("Bulk-tier SKUs", ops.bulk.length),
            kpi("MOQ SKUs", ops.moq.length),
            kpi("Weighted SKUs", ops.weighted.length),
            kpi("Variants", ops.variants.length),
          ],
          actions: [act("products", "Tiers & MOQ"), act("inventory", "Stock levels"), act("reports", "Sales reports")],
          expiryAlerts: false,
        };
      case "PLANT":
        return {
          title: "Nursery operations", badge: "PLANT",
          kpis: [
            kpi("Care-card SKUs", ops.care.length),
            kpi("Guarantee SKUs", ops.guarantee.length),
            kpi("Variants", ops.variants.length),
            kpi("Bulk tiers", ops.bulk.length),
          ],
          actions: [act("products", "Care & guarantee"), act("inventory", "Stock levels"), act("reports", "Sales reports")],
          expiryAlerts: false,
        };
      case "RETAIL":
        return {
          title: "Retail operations", badge: "RETAIL",
          kpis: [
            kpi("Variant SKUs", ops.variants.length),
            kpi("Warranty SKUs", ops.warranty.length),
            kpi("Bulk tiers", ops.bulk.length),
            kpi("Categories", categories?.length ?? 0),
          ],
          actions: [act("products", "Variants & warranty"), act("inventory", "Stock levels"), act("reports", "Sales reports")],
          expiryAlerts: false,
        };
      default:
        return {
          title: "Store operations", badge: "SET STORE TYPE",
          kpis: [
            kpi("Products", productList.length),
            kpi("Near expiry ≤30d", ops.nearExpiry.length, ops.nearExpiry.length > 0),
            kpi("Expired (blocked)", ops.expired.length, ops.expired.length > 0),
          ],
          actions: [act("profile", "Set store type"), act("products", "Catalog"), act("reports", "Sales reports")],
          expiryAlerts: false,
        };
    }
  }, [storeType, ops, productList.length, categories?.length]);

  // Best-guess type for old stores with nothing saved — advisory only.
  const inferredType = useMemo(() => inferStoreType(productList), [productList]);

  useEffect(() => {
    if (!storeType && inferredType && !setupType) {
      setSetupType(inferredType);
    }
  }, [storeType, inferredType, setupType]);

  const handleSaveStoreType = async () => {
    const targetId = store?._id || store?.id || storeId;
    if (!setupType) {
      toast.error("Please choose a store type");
      return;
    }
    if (!targetId) {
      toast.error("Store not loaded yet — please retry in a moment");
      return;
    }
    setSavingType(true);
    try {
      const result = await dispatch(updateStore({ id: targetId, storeData: { storeType: setupType } }));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success(`Store type set to ${setupType} — dashboard updated`);
        dispatch(getStoreByAdmin()).catch(() => undefined);
      } else {
        toast.error(result.payload || "Failed to save store type");
      }
    } finally {
      setSavingType(false);
    }
  };

  return (
    <div
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        fontFamily: "'DM Sans','Inter',sans-serif",
        color: "#1a1d23",
        background: "#f5f5f5",
        minHeight: "100%",
      }}
    >
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px", color: "#1a1d23" }}>
          Dashboard
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>
          {monthLabel} — month-to-date overview{storeType ? ` · ${storeType}` : ""}
        </p>
      </div>

      {/* One-time setup for stores registered before types existed */}
      {!storeType && (
        <div style={{ ...card, border: "2px solid #1a1d23" }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>
            What kind of store is this?
          </p>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7280" }}>
            Your store was registered before store types existed. Pick one to unlock
            its tailored dashboard, product fields and checkout flow.
            {inferredType
              ? ` Your catalog looks like a ${inferredType} — confirm or change it below.`
              : " Choose the closest match below."}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              aria-label="Store type"
              value={setupType}
              onChange={(e) => setSetupType(e.target.value)}
              style={{ flex: 1, minWidth: 200, border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 12px", fontSize: 13, background: "white" }}
            >
              <option value="">Select store type…</option>
              {STORE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}{t.value === inferredType ? " (detected)" : ""}
                </option>
              ))}
            </select>
            <button
              onClick={handleSaveStoreType}
              disabled={savingType}
              style={{
                padding: "9px 20px", borderRadius: 8, border: "none",
                background: "#1a1d23", color: "white",
                fontSize: 13, fontWeight: 700,
                cursor: savingType ? "not-allowed" : "pointer",
                opacity: savingType ? 0.6 : 1,
              }}
            >
              {savingType ? "Saving…" : "Save & unlock dashboard"}
            </button>
          </div>
        </div>
      )}

      {/* Unique per-store-type operations panel */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{verticalPanel.title}</p>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", padding: "3px 12px", borderRadius: 20, background: "#1a1d23", color: "white" }}>
            {verticalPanel.badge}
          </span>
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>
          Live from your catalog{verticalPanel.badge === "RESTAURANT" ? " and this month's orders" : ""} — unique to this store type
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: verticalPanel.expiryAlerts ? 12 : 0 }}>
          {verticalPanel.kpis.map(({ label, value, alert }) => (
            <div key={label} style={{
              padding: 14, borderRadius: 8, background: alert ? "#fef2f2" : "#f5f5f5",
              border: `1px solid ${alert ? "#fecaca" : "#e2e5e9"}`,
            }}>
              <p style={{ margin: 0, fontSize: 11, color: alert ? "#991b1b" : "#8a909c", fontWeight: alert ? 700 : 400 }}>{label}</p>
              <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 800, color: alert ? "#991b1b" : "#1a1d23" }}>{value}</p>
            </div>
          ))}
        </div>
        {verticalPanel.expiryAlerts && <ExpiryAlerts products={productList} compact />}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          {verticalPanel.actions.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 8,
                background: "#1a1d23", color: "white", textDecoration: "none",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {summaryStats.map(({ label, value, sub, icon: Icon, iconColor }) => (
          <div
            key={label}
            style={{ ...card, transition: "box-shadow 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: "#8a909c" }}>{label}</p>
                <p style={{ margin: "6px 0 2px", fontSize: 28, fontWeight: 800, color: "#1a1d23", letterSpacing: "-1px" }}>
                  {value}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{sub}</p>
              </div>
              <Icon size={20} color={iconColor} />
            </div>
          </div>
        ))}
      </div>

      {/* Payments by Method */}
      <div style={card}>
        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Payments by Method</p>
        <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>
          This month's sales across your branches
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {[
            { type: "CASH", label: "Cash", icon: Banknote, color: "#1a1d23", bg: "#f3f4f6" },
            { type: "CARD", label: "Card", icon: CreditCard, color: "#4a4d55", bg: "#f3f4f6" },
            { type: "ESEWA", label: "eSewa", icon: Smartphone, color: "#6b7280", bg: "#f3f4f6" },
            { type: "KHALTI", label: "Khalti", icon: Smartphone, color: "#9ca3af", bg: "#f3f4f6" },
          ].map(({ type, label, icon: Icon, color, bg }) => (
            <div key={type} style={{ padding: 14, borderRadius: 8, background: bg, border: "1px solid #e2e5e9" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color }}>{label}</span>
                <Icon size={17} color={color} />
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 800, color: "#1a1d23" }}>
                Rs {paymentBreakdown[type].toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sales Trend + Branch Sales */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        {/* Sales Trend Chart */}
        <div style={{ ...card, padding: "20px 20px 12px" }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Sales Trend</p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "#8a909c" }}>
              Last 7 days · {monthLabel}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a1d23" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1a1d23" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#1a1d23"
                strokeWidth={2}
                fill="url(#revGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#1a1d23" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Branch Sales */}
        <div style={{ ...card, padding: "20px", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Top Branches by Sales</p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "#8a909c" }}>
              This month · ranked by revenue
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
            {branchSales.length > 0 ? (
              branchSales.map((b, i) => {
                const pct = Math.round((b.revenue / maxRevenue) * 100);
                return (
                  <div key={b.name}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 22, height: 22, borderRadius: "50%",
                            background: i === 0 ? "linear-gradient(135deg,#1a1d23,#4a4d55)" : "#f5f5f5",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}
                        >
                          <span style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? "white" : "#8a909c" }}>
                            {i + 1}
                          </span>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1a1d23" }}>{b.name}</p>
                          <p style={{ margin: 0, fontSize: 10, color: "#8a909c" }}>
                            {b.address} · {b.orders} orders
                          </p>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1a1d23" }}>
                        रु {b.revenue.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div style={{ height: 4, borderRadius: 4, background: "#e5e7eb" }}>
                      <div
                        style={{
                          height: "100%", borderRadius: 4, width: `${pct}%`,
                          background: i === 0 ? "linear-gradient(90deg,#1a1d23,#4a4d55)" : "#9ca3af",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#6b7280" }}>
                <p style={{ margin: 0, fontSize: 12 }}>No branch sales data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
