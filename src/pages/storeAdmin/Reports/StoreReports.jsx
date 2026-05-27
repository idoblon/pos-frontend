import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, ShoppingCart, RotateCcw, DollarSign,
  Package, GitBranch, Download, BarChart2,
} from "lucide-react";

const RANGES = ["This Month", "Last 3 Months", "Last 6 Months", "This Year"];

// ── Styles ─────────────────────────────────────────────────────────────────
const card = { background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: "18px 20px" };

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

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280" }}>
      <BarChart2 size={48} color="#e2e5e9" style={{ margin: "0 auto 16px", display: "block" }} />
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1a1d23" }}>No Data Available</p>
      <p style={{ margin: "6px 0 0", fontSize: 12, color: "#8a909c" }}>{message}</p>
    </div>
  );
}

export default function StoreReports() {
  const [range, setRange] = useState("This Year");

  // TODO: Fetch real data from API
  const totalRevenue = 0;
  const totalOrders = 0;
  const totalRefunds = 0;
  const avgOrder = 0;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f5f5f5", minHeight: "100%" }}>

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
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard label="Total Revenue" value={`रु ${totalRevenue.toLocaleString("en-IN")}`} sub="across all branches" icon={DollarSign} iconColor="#1a1d23" />
        <StatCard label="Total Orders" value={totalOrders} sub="completed orders" icon={ShoppingCart} iconColor="#4a4d55" />
        <StatCard label="Total Refunds" value={totalRefunds} sub="processed refunds" icon={RotateCcw} iconColor="#e53e3e" />
        <StatCard label="Avg Order Value" value={`रु ${avgOrder.toLocaleString("en-IN")}`} sub="per transaction" icon={TrendingUp} iconColor="#1a1d23" />
      </div>

      {/* Sales Trend + Payment Methods */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>

        {/* Monthly Sales Chart */}
        <div style={{ ...card, padding: "20px 20px 12px" }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Monthly Sales Trend</p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "#8a909c" }}>Revenue and orders per month</p>
          </div>
          <EmptyState message="Sales data will appear here once orders are processed" />
        </div>

        {/* Payment Methods */}
        <div style={{ ...card, display: "flex", flexDirection: "column" }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Payment Methods</p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>Distribution by payment type</p>
          <EmptyState message="Payment distribution will appear here" />
        </div>
      </div>

      {/* Top Products + Branch Performance */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Top Products */}
        <div style={{ ...card, padding: "18px 20px 12px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Top Products</p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>By units sold</p>
          <EmptyState message="Top selling products will appear here" />
        </div>

        {/* Branch Performance */}
        <div style={card}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Branch Performance</p>
          <p style={{ margin: "0 0 14px", fontSize: 11, color: "#8a909c" }}>Revenue by branch</p>
          <EmptyState message="Branch performance data will appear here" />
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={card}>
        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Recent Transactions</p>
        <p style={{ margin: "0 0 14px", fontSize: 11, color: "#8a909c" }}>Latest sales across all branches</p>
        <EmptyState message="Recent transactions will appear here once orders are placed" />
      </div>

    </div>
  );
}
