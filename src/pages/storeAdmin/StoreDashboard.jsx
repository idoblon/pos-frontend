import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GitBranch, Package, Users, Tag, Banknote, CreditCard, Smartphone } from "lucide-react";
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

  const [allOrders, setAllOrders] = useState([]);

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
          {monthLabel} — month-to-date overview
        </p>
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
