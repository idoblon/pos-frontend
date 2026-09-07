import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, ShoppingCart, RotateCcw, DollarSign,
  Users, BarChart2, RefreshCw, Clock,
} from "lucide-react";
import {
  getStoreAnalytics,
  getSalesChart,
  getTopProducts,
  getPaymentSummary,
  getPeakHours,
  getEmployeeAnalytics,
} from "@/Redux Toolkit/Features/analytics/analyticsThunk";
import secureStorage from "@/util/secureStorage";

const RANGES = [
  { label: "Last 7 days",  days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "This year",    days: 365 },
];

const PAYMENT_COLORS = ["#1a1d23", "#4a4d55", "#6b7280", "#9ca3af"];

const s = {
  page: { padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f5f5f5", minHeight: "100%" },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: "18px 20px" },
};

const money = (v) => `रु ${Math.round(v || 0).toLocaleString("en-IN")}`;
const num   = (v) => Number(v || 0).toLocaleString();

function StatCard({ label, value, sub, icon: Icon, iconColor = "#1a1d23" }) {
  return (
    <div style={s.card}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{label}</p>
          <p style={{ margin: "5px 0 2px", fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>{value}</p>
          <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{sub}</p>
        </div>
        <Icon size={18} color={iconColor} />
      </div>
    </div>
  );
}

function Empty({ message }) {
  return (
    <div style={{ textAlign: "center", padding: "50px 20px", color: "#6b7280" }}>
      <BarChart2 size={40} color="#e2e5e9" style={{ margin: "0 auto 12px", display: "block" }} />
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>No data yet</p>
      <p style={{ margin: "4px 0 0", fontSize: 12 }}>{message}</p>
    </div>
  );
}

const getDateRange = (days) => {
  const end   = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate:   end.toISOString().slice(0, 10),
  };
};

export default function StoreAnalytics() {
  const dispatch = useDispatch();
  const { summary, salesChart, topProducts, paymentSummary, peakHours, employees: empAnalytics, loading } =
    useSelector((s) => s.analytics);

  const { user }        = useSelector((s) => s.auth);
  const { userProfile } = useSelector((s) => s.user);
  const userData        = secureStorage.getUserData();
  const storeId         = user?.storeId || userData?.storeId || userProfile?.storeId;

  const [rangeIdx, setRangeIdx] = useState(1); // default: last 30 days

  const fetchAll = (idx = rangeIdx) => {
    if (!storeId) return;
    const { startDate, endDate } = getDateRange(RANGES[idx].days);
    dispatch(getStoreAnalytics({ storeId, startDate, endDate }));
    dispatch(getSalesChart(storeId));
    dispatch(getTopProducts({ storeId, limit: 8 }));
    dispatch(getPaymentSummary(storeId));
    dispatch(getPeakHours(storeId));
    dispatch(getEmployeeAnalytics(storeId));
  };

  useEffect(() => { fetchAll(); }, [storeId, rangeIdx]);

  const handleRangeChange = (e) => {
    const idx = Number(e.target.value);
    setRangeIdx(idx);
  };

  // Format sales chart — backend returns month names in uppercase
  const chartData = (salesChart || []).map((d) => ({
    period: d.period?.charAt(0) + (d.period?.slice(1).toLowerCase() || ""),
    sales:  d.sales  || 0,
    orders: d.orders || 0,
  }));

  // Peak hours — only show 6am–11pm for readability
  const peakData = (peakHours || []).filter((h) => {
    const hour = parseInt(h.hour);
    return hour >= 6 && hour <= 23;
  });

  const peakMax = Math.max(...peakData.map((h) => h.orders || 0), 1);

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px" }}>Analytics</p>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#8a909c" }}>Store-wide performance insights</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            value={rangeIdx}
            onChange={handleRangeChange}
            style={{ border: "1px solid #e2e5e9", borderRadius: 8, padding: "7px 12px", fontSize: 12, background: "white", outline: "none", cursor: "pointer" }}
          >
            {RANGES.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
          </select>
          <button
            onClick={() => fetchAll()}
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#1a1d23", color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.6 : 1 }}
          >
            <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard label="Total Revenue"     value={money(summary?.totalSales)}         sub={`${RANGES[rangeIdx].label}`}  icon={DollarSign} />
        <StatCard label="Total Orders"      value={num(summary?.totalOrders)}           sub="completed orders"             icon={ShoppingCart} />
        <StatCard label="Unique Customers"  value={num(summary?.totalCustomers)}        sub="distinct buyers"              icon={Users} />
        <StatCard label="Avg Order Value"   value={money(summary?.averageOrderValue)}   sub="per transaction"              icon={TrendingUp} />
      </div>

      {/* Sales Trend + Payment Methods */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>

        {/* Sales Chart */}
        <div style={{ ...s.card, padding: "20px 20px 12px" }}>
          <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700 }}>Monthly Sales Trend</p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>Revenue over the last 6 months</p>
          {chartData.some((d) => d.sales > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1a1d23" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1a1d23" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div style={{ background: "white", border: "1px solid #e2e5e9", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
                        <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{label}</p>
                        <p style={{ margin: 0, fontWeight: 700, color: "#1a1d23" }}>{money(payload[0].value)}</p>
                        <p style={{ margin: 0, color: "#8a909c", fontSize: 11 }}>{payload[0].payload.orders} orders</p>
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="sales" stroke="#1a1d23" strokeWidth={2} fill="url(#salesGrad)" dot={false} activeDot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Empty message="Sales data will appear once orders are processed" />
          )}
        </div>

        {/* Payment Summary */}
        <div style={{ ...s.card, display: "flex", flexDirection: "column" }}>
          <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700 }}>Payment Methods</p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>Distribution by payment type</p>
          {paymentSummary?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={paymentSummary} cx="50%" cy="50%" innerRadius={38} outerRadius={65} paddingAngle={2} dataKey="amount">
                    {paymentSummary.map((_, i) => (
                      <Cell key={i} fill={PAYMENT_COLORS[i % PAYMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div style={{ background: "white", border: "1px solid #e2e5e9", borderRadius: 6, padding: "6px 10px", fontSize: 12 }}>
                          <p style={{ margin: 0, fontWeight: 600 }}>{d.paymentType}</p>
                          <p style={{ margin: 0 }}>{money(d.amount)} · {d.count} orders</p>
                          <p style={{ margin: 0, color: "#8a909c" }}>{d.percentage}%</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                {paymentSummary.map((p, i) => (
                  <div key={p.paymentType} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: PAYMENT_COLORS[i % PAYMENT_COLORS.length] }} />
                      <span style={{ fontSize: 12 }}>{p.paymentType}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{p.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Empty message="Payment data will appear here" />
          )}
        </div>
      </div>

      {/* Top Products + Peak Hours */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Top Products */}
        <div style={{ ...s.card, padding: "18px 20px 12px" }}>
          <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700 }}>Top Products</p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>By units sold</p>
          {topProducts?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="productName"
                  tick={{ fontSize: 10, fill: "#8a909c" }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                  tickFormatter={(v) => v?.length > 12 ? v.slice(0, 12) + "…" : v}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: "white", border: "1px solid #e2e5e9", borderRadius: 6, padding: "6px 10px", fontSize: 12 }}>
                        <p style={{ margin: "0 0 2px", fontWeight: 600 }}>{d.productName}</p>
                        <p style={{ margin: 0 }}>{d.quantitySold} units · {money(d.revenue)}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="quantitySold" fill="#1a1d23" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty message="Top products will appear once orders are placed" />
          )}
        </div>

        {/* Peak Hours */}
        <div style={s.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <Clock size={14} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Peak Hours</p>
          </div>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>Order volume by hour of day</p>
          {peakData.some((h) => h.orders > 0) ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {peakData.map((h) => {
                const pct = Math.round((h.orders / peakMax) * 100);
                const isPeak = h.orders === peakMax && peakMax > 0;
                return (
                  <div key={h.hour} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "#8a909c", width: 38, flexShrink: 0 }}>{h.hour}</span>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#f0f0f0" }}>
                      <div style={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: isPeak ? "#1a1d23" : "#9ca3af", transition: "width 0.4s ease" }} />
                    </div>
                    <span style={{ fontSize: 10, color: "#8a909c", width: 20, textAlign: "right", flexShrink: 0 }}>{h.orders}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty message="Peak hour data will appear once orders are placed" />
          )}
        </div>
      </div>

      {/* Employee Performance */}
      {empAnalytics?.length > 0 && (
        <div style={s.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <Users size={14} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Employee Performance</p>
          </div>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>Sales, refunds and shift stats per employee</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  {["Employee", "Role", "Orders", "Total Sales", "Refunds", "Net Sales", "Shifts", "Avg Shift", "Last Login"].map((h) => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#8a909c", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {empAnalytics.map((e, i) => (
                  <tr key={e.employeeId} style={{ borderBottom: i < empAnalytics.length - 1 ? "1px solid #f3f4f6" : "none" }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = "white")}
                  >
                    <td style={{ padding: "10px 10px", fontWeight: 600 }}>{e.fullName}</td>
                    <td style={{ padding: "10px 10px", color: "#6b7280" }}>{String(e.role)}</td>
                    <td style={{ padding: "10px 10px" }}>{e.totalOrders}</td>
                    <td style={{ padding: "10px 10px", fontWeight: 600 }}>{money(e.totalSales)}</td>
                    <td style={{ padding: "10px 10px", color: "#dc2626" }}>{money(e.totalRefunds)}</td>
                    <td style={{ padding: "10px 10px", fontWeight: 600, color: "#16a34a" }}>{money(e.netSales)}</td>
                    <td style={{ padding: "10px 10px" }}>{e.totalShifts}</td>
                    <td style={{ padding: "10px 10px", color: "#6b7280" }}>{e.avgShiftHours}h</td>
                    <td style={{ padding: "10px 10px", color: "#6b7280", whiteSpace: "nowrap" }}>
                      {e.lastLogin ? new Date(e.lastLogin).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
