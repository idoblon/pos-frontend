import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  GitBranch, Package, Users, Tag,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { getBranchesByStore } from "@/Redux Toolkit/Features/branch/branchThunk";
import { getProductsByStore } from "@/Redux Toolkit/Features/product/productThunk";
import { findStoreEmployee } from "@/Redux Toolkit/Features/Employee/employeeThunk";
import { getCategoriesByStore } from "@/Redux Toolkit/Features/category/categoryThunk";
import { getAllRefund } from "@/Redux Toolkit/Features/refund/refundThunk";

const card = {
  background: "white", border: "1px solid #e2e5e9", borderRadius: 10,
  padding: "18px 20px",
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #e2e5e9", borderRadius: 8, padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 12 }}>
      <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#1a1d23" }}>{label}</p>
      <p style={{ margin: 0, color: "#1a5c38", fontWeight: 700 }}>रु {payload[0].value?.toLocaleString("en-IN")}</p>
    </div>
  );
}

const DEMO_TREND = [
  { label: "Mon, Jul 14", revenue: 12400 },
  { label: "Tue, Jul 15", revenue: 9800 },
  { label: "Wed, Jul 16", revenue: 15600 },
  { label: "Thu, Jul 17", revenue: 11200 },
  { label: "Fri, Jul 18", revenue: 18900 },
  { label: "Sat, Jul 19", revenue: 22300 },
  { label: "Sun, Jul 20", revenue: 17500 },
];

const DEMO_BRANCH_SALES = [
  { name: "Main Branch",     address: "Kathmandu",  orders: 142, revenue: 87400 },
  { name: "New Road Branch", address: "Kathmandu",  orders: 98,  revenue: 61200 },
  { name: "Pokhara Branch",  address: "Pokhara",    orders: 76,  revenue: 48900 },
  { name: "Lalitpur Branch", address: "Lalitpur",   orders: 54,  revenue: 33500 },
  { name: "Bhaktapur Branch",address: "Bhaktapur",  orders: 31,  revenue: 19800 },
];

export default function StoreDashboard() {
  const dispatch = useDispatch();
  const storeId = localStorage.getItem("storeId");

  const { branches } = useSelector((s) => s.branch);
  const { products } = useSelector((s) => s.product);
  const { employees } = useSelector((s) => s.employee);
  const { categories } = useSelector((s) => s.category);
  const { refunds } = useSelector((s) => s.refund);
  const { orders } = useSelector((s) => s.order);

  useEffect(() => {
    if (!storeId) return;
    dispatch(getBranchesByStore(storeId));
    dispatch(getProductsByStore(storeId));
    dispatch(findStoreEmployee({ storeId }));
    dispatch(getCategoriesByStore({ storeId }));
    dispatch(getAllRefund());
  }, [dispatch, storeId]);

  const activeBranches = branches?.filter((b) => b.status === "active" || !b.status).length ?? 0;

  const displayBranches   = branches?.length   ? branches   : [{ _id:"b1" }, { _id:"b2" }, { _id:"b3" }, { _id:"b4" }];
  const displayProducts   = products?.length   ? products   : Array(8).fill(null);
  const displayEmployees  = employees?.length  ? employees  : Array(6).fill(null);
  const displayCategories = categories?.length ? categories : Array(6).fill(null);

  const activeCount = branches?.length
    ? activeBranches
    : displayBranches.length;

  // Build last-7-days trend — use demo if no real orders
  const trendData = useMemo(() => {
    if (!orders?.length) return DEMO_TREND;
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        dateStr: d.toISOString().slice(0, 10),
        revenue: 0,
      };
    });
    orders.forEach((o) => {
      const date = new Date(o.createdAt).toISOString().slice(0, 10);
      const day = days.find((d) => d.dateStr === date);
      if (day) day.revenue += o.totalAmount ?? 0;
    });
    return days.map(({ label, revenue }) => ({ label, revenue }));
  }, [orders]);

  // Branch sales — aggregate orders per branch, sorted by revenue
  const branchSales = useMemo(() => {
    if (!branches?.length) return DEMO_BRANCH_SALES;
    const map = {};
    orders?.forEach((o) => {
      const id = o.branchId;
      if (!id) return;
      if (!map[id]) map[id] = { orders: 0, revenue: 0 };
      map[id].orders += 1;
      map[id].revenue += o.totalAmount ?? 0;
    });
    return [...branches]
      .map((b) => ({
        name: b.name,
        address: b.address ?? b.city ?? "—",
        orders: map[b._id]?.orders ?? 0,
        revenue: map[b._id]?.revenue ?? 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [branches, orders]);

  const maxRevenue = branchSales[0]?.revenue ?? 1;

  const summaryStats = [
    { label: "Total Branches", value: displayBranches.length,   sub: `${activeCount} active`,          icon: GitBranch, iconColor: "#3b82f6" },
    { label: "Total Products", value: displayProducts.length,   sub: `${displayCategories.length} categories`, icon: Package,   iconColor: "#8b5cf6" },
    { label: "Employees",      value: displayEmployees.length,  sub: "across all branches",             icon: Users,     iconColor: "#f59e0b" },
    { label: "Categories",     value: displayCategories.length, sub: "product groups",                  icon: Tag,       iconColor: "#10b981" },
  ];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23" }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px" }}>Dashboard</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>Welcome back — here's what's happening in your store</p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {summaryStats.map(({ label, value, sub, icon: Icon, iconColor }) => (
          <div key={label} style={{ ...card, transition: "box-shadow 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: "#8a909c" }}>{label}</p>
                <p style={{ margin: "6px 0 2px", fontSize: 28, fontWeight: 800, color: "#1a1d23", letterSpacing: "-1px" }}>{value}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{sub}</p>
              </div>
              <Icon size={20} color={iconColor} />
            </div>
          </div>
        ))}
      </div>

      {/* Two panels — Sales Trend + Recent Sales */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>

        {/* Sales Trend Chart */}
        <div style={{ ...card, padding: "20px 20px 12px" }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Sales Trend</p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "#8a909c" }}>Total sales over the last 7 days</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a5c38" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1a5c38" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#1a5c38" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: "#1a5c38" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Branch Sales */}
        <div style={{ ...card, padding: "20px", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Top Branches by Sales</p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "#8a909c" }}>Ranked by total revenue</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
            {branchSales.map((b, i) => {
              const pct = Math.round((b.revenue / maxRevenue) * 100);
              return (
                <div key={b.name}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: i === 0 ? "#1a5c38" : "#f5f6f8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? "white" : "#8a909c" }}>{i + 1}</span>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1a1d23" }}>{b.name}</p>
                        <p style={{ margin: 0, fontSize: 10, color: "#8a909c" }}>{b.address} · {b.orders} orders</p>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1a1d23" }}>रु {b.revenue.toLocaleString("en-IN")}</p>
                  </div>
                  <div style={{ height: 4, borderRadius: 4, background: "#f5f6f8" }}>
                    <div style={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: i === 0 ? "#1a5c38" : "#e2e5e9", transition: "width 0.4s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
