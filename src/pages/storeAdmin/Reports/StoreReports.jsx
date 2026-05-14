import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, ShoppingCart, RotateCcw, DollarSign,
  Package, GitBranch, Download,
} from "lucide-react";

// ── Demo Data ──────────────────────────────────────────────────────────────
const MONTHLY_SALES = [
  { month: "Jan", revenue: 42000, orders: 134 },
  { month: "Feb", revenue: 38500, orders: 118 },
  { month: "Mar", revenue: 51200, orders: 162 },
  { month: "Apr", revenue: 47800, orders: 149 },
  { month: "May", revenue: 63400, orders: 198 },
  { month: "Jun", revenue: 58900, orders: 184 },
  { month: "Jul", revenue: 72100, orders: 226 },
  { month: "Aug", revenue: 68300, orders: 213 },
  { month: "Sep", revenue: 55600, orders: 174 },
  { month: "Oct", revenue: 79200, orders: 248 },
  { month: "Nov", revenue: 84500, orders: 264 },
  { month: "Dec", revenue: 91300, orders: 285 },
];

const TOP_PRODUCTS = [
  { name: "Monstera Deliciosa", sales: 186, revenue: 223200 },
  { name: "Fiddle Leaf Fig",    sales: 142, revenue: 312400 },
  { name: "Peace Lily",         sales: 218, revenue: 141700 },
  { name: "Snake Plant",        sales: 304, revenue: 167200 },
  { name: "Aloe Vera",          sales: 267, revenue: 120150 },
  { name: "Orchid Plant",       sales: 98,  revenue:  96040 },
];

const BRANCH_PERFORMANCE = [
  { name: "Kathmandu Main",   revenue: 287400, orders: 892, refunds: 14 },
  { name: "Pokhara Branch",   revenue: 198600, orders: 614, refunds: 9  },
  { name: "Lalitpur Branch",  revenue: 154200, orders: 478, refunds: 7  },
  { name: "Bhaktapur Branch", revenue:  89300, orders: 276, refunds: 4  },
];

const PAYMENT_METHODS = [
  { name: "Cash",   value: 42, color: "#059669" },
  { name: "Card",   value: 35, color: "#0d9488" },
  { name: "QR/UPI", value: 23, color: "#6ee7b7" },
];

const RECENT_TRANSACTIONS = [
  { id: "TXN-8821", branch: "Kathmandu Main",   product: "Monstera Deliciosa", amount: 1200, method: "Card",   date: "Dec 15, 2024", status: "completed" },
  { id: "TXN-8820", branch: "Pokhara Branch",   product: "Snake Plant",        amount: 550,  method: "Cash",   date: "Dec 15, 2024", status: "completed" },
  { id: "TXN-8819", branch: "Lalitpur Branch",  product: "Ceramic Pot 6in",    amount: 320,  method: "QR/UPI", date: "Dec 14, 2024", status: "completed" },
  { id: "TXN-8818", branch: "Kathmandu Main",   product: "Fiddle Leaf Fig",    amount: 2200, method: "Card",   date: "Dec 14, 2024", status: "refunded"  },
  { id: "TXN-8817", branch: "Bhaktapur Branch", product: "Aloe Vera",          amount: 450,  method: "Cash",   date: "Dec 13, 2024", status: "completed" },
  { id: "TXN-8816", branch: "Pokhara Branch",   product: "Peace Lily",         amount: 650,  method: "Card",   date: "Dec 13, 2024", status: "completed" },
  { id: "TXN-8815", branch: "Kathmandu Main",   product: "Potting Mix 5kg",    amount: 280,  method: "QR/UPI", date: "Dec 12, 2024", status: "completed" },
  { id: "TXN-8814", branch: "Lalitpur Branch",  product: "Orchid Plant",       amount: 980,  method: "Cash",   date: "Dec 12, 2024", status: "completed" },
];

const RANGES = ["This Month", "Last 3 Months", "Last 6 Months", "This Year"];

// ── Styles ─────────────────────────────────────────────────────────────────
const card = { background: "white", border: "1px solid #d1fae5", borderRadius: 10, padding: "18px 20px" };
const th = { padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#6b7280", background: "#f0fdf4", textAlign: "left", borderBottom: "1px solid #d1fae5" };
const td = { padding: "11px 14px", fontSize: 12, borderBottom: "1px solid #d1fae5", color: "#1a1d23" };

function StatCard({ label, value, sub, icon: Icon, iconColor }) {
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{label}</p>
          <p style={{ margin: "5px 0 2px", fontSize: 24, fontWeight: 800, color: "#1a1d23", letterSpacing: "-0.5px" }}>{value}</p>
          <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{sub}</p>
        </div>
        <Icon size={18} color={iconColor} />
      </div>
    </div>
  );
}

function SalesTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #e2e5e9", borderRadius: 8, padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 12 }}>
      <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#1a1d23" }}>{label}</p>
      <p style={{ margin: 0, color: "#1a5c38", fontWeight: 700 }}>रु {payload[0]?.value?.toLocaleString("en-IN")}</p>
      {payload[1] && <p style={{ margin: "2px 0 0", color: "#3b82f6", fontWeight: 600 }}>{payload[1].value} orders</p>}
    </div>
  );
}

export default function StoreReports() {
  const [range, setRange] = useState("This Year");

  const totalRevenue = MONTHLY_SALES.reduce((s, m) => s + m.revenue, 0);
  const totalOrders  = MONTHLY_SALES.reduce((s, m) => s + m.orders, 0);
  const totalRefunds = BRANCH_PERFORMANCE.reduce((s, b) => s + b.refunds, 0);
  const avgOrder     = Math.round(totalRevenue / totalOrders);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f0fdf4", minHeight: "100%" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px" }}>Reports</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>Store-wide sales analytics and performance</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            style={{ border: "1px solid #e2e5e9", borderRadius: 8, padding: "7px 12px", fontSize: 12, background: "white", color: "#1a1d23", outline: "none", cursor: "pointer" }}
          >
            {RANGES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "linear-gradient(135deg,#059669,#0d9488)", color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard label="Total Revenue"   value={`रु ${(totalRevenue / 1000).toFixed(0)}K`} sub="across all branches"  icon={DollarSign}  iconColor="#059669" />
        <StatCard label="Total Orders"    value={totalOrders}                                sub="completed orders"    icon={ShoppingCart} iconColor="#0d9488" />
        <StatCard label="Total Refunds"   value={totalRefunds}                               sub="processed refunds"   icon={RotateCcw}    iconColor="#e53e3e" />
        <StatCard label="Avg Order Value" value={`रु ${avgOrder.toLocaleString("en-IN")}`}  sub="per transaction"     icon={TrendingUp}   iconColor="#059669" />
      </div>

      {/* Sales Trend + Payment Methods */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>

        {/* Monthly Sales Chart */}
        <div style={{ ...card, padding: "20px 20px 12px" }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Monthly Sales Trend</p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "#8a909c" }}>Revenue and orders per month</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_SALES} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#059669" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
              <Tooltip content={<SalesTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fill="url(#revG)" dot={false} activeDot={{ r: 4, fill: "#059669" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div style={{ ...card, display: "flex", flexDirection: "column" }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Payment Methods</p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>Distribution by payment type</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
            <PieChart width={140} height={140}>
              <Pie data={PAYMENT_METHODS} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                {PAYMENT_METHODS.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginLeft: 16 }}>
              {PAYMENT_METHODS.map((m) => (
                <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>{m.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{m.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products + Branch Performance */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Top Products */}
        <div style={{ ...card, padding: "18px 20px 12px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Top Products</p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>By units sold</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={TOP_PRODUCTS} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} width={110} />
              <Tooltip
                formatter={(v) => [`${v} units`, "Sales"]}
                contentStyle={{ fontSize: 12, border: "1px solid #e2e5e9", borderRadius: 8 }}
              />
              <Bar dataKey="sales" fill="#059669" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Branch Performance */}
        <div style={card}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Branch Performance</p>
          <p style={{ margin: "0 0 14px", fontSize: 11, color: "#8a909c" }}>Revenue by branch</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {BRANCH_PERFORMANCE.map((b, i) => {
              const max = BRANCH_PERFORMANCE[0].revenue;
              const pct = Math.round((b.revenue / max) * 100);
              return (
                <div key={b.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: i === 0 ? "linear-gradient(135deg,#059669,#0d9488)" : "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: i === 0 ? "white" : "#8a909c" }}>{i + 1}</span>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>{b.name}</p>
                        <p style={{ margin: 0, fontSize: 10, color: "#8a909c" }}>{b.orders} orders · {b.refunds} refunds</p>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>रु {b.revenue.toLocaleString("en-IN")}</p>
                  </div>
                  <div style={{ height: 4, borderRadius: 4, background: "#d1fae5" }}>
                    <div style={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: i === 0 ? "linear-gradient(90deg,#059669,#0d9488)" : "#6ee7b7" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={card}>
        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Recent Transactions</p>
        <p style={{ margin: "0 0 14px", fontSize: 11, color: "#8a909c" }}>Latest sales across all branches</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Transaction ID", "Branch", "Product", "Method", "Date", "Amount", "Status"].map((h, i) => (
                  <th key={h} style={{ ...th, textAlign: i >= 5 ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_TRANSACTIONS.map((t) => (
                <tr key={t.id}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >
                  <td style={{ ...td, fontWeight: 600, color: "#059669" }}>{t.id}</td>
                  <td style={{ ...td, display: "flex", alignItems: "center", gap: 6 }}>
                    <GitBranch size={12} color="#8a909c" /> {t.branch}
                  </td>
                  <td style={{ ...td }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Package size={12} color="#8a909c" /> {t.product}
                    </div>
                  </td>
                  <td style={{ ...td, color: "#8a909c" }}>{t.method}</td>
                  <td style={{ ...td, color: "#8a909c" }}>{t.date}</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>रु {t.amount.toLocaleString("en-IN")}</td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                      background: t.status === "completed" ? "#f0fdf4" : "#fff5f5",
                      color: t.status === "completed" ? "#1a6b3c" : "#e53e3e",
                    }}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
