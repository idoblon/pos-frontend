import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BarChart2, TrendingUp, RotateCcw, ShoppingBag } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { getShiftsByBranch } from "@/Redux Toolkit/Features/shiftReport/shiftReportThunk";
import { getOrdersByBranch } from "@/Redux Toolkit/Features/order/orderThunk";
import { getRefundsByBranch } from "@/Redux Toolkit/Features/refund/refundThunk";
import secureStorage from "@/util/secureStorage";

const card = { background: "white", border: "1px solid #e2e5e9", borderRadius: 10, padding: "20px" };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #e2e5e9", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{label}</p>
      <p style={{ margin: 0, color: "#059669", fontWeight: 700 }}>रु {payload[0].value?.toLocaleString("en-IN")}</p>
    </div>
  );
}

export default function BranchReports() {
  const dispatch = useDispatch();
  const userData = secureStorage.getUserData();
  const branchId = userData?.branchId;
  const [range, setRange] = useState("7");

  const { shiftsByBranch } = useSelector((s) => s.shiftReport);
  const { orders } = useSelector((s) => s.order);
  const { refunds } = useSelector((s) => s.refund);

  useEffect(() => {
    if (!branchId) return;
    dispatch(getShiftsByBranch(branchId));
    dispatch(getOrdersByBranch({ branchId }));
    dispatch(getRefundsByBranch(branchId));
  }, [dispatch, branchId]);

  const days = Number(range);
  const trendData = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const revenue = orders?.filter((o) => new Date(o.createdAt).toISOString().slice(0, 10) === dateStr)
      .reduce((s, o) => s + (o.totalAmount ?? 0), 0) ?? 0;
    return { label, revenue };
  });

  const totalRevenue  = orders?.reduce((s, o) => s + (o.totalAmount ?? 0), 0) ?? 0;
  const totalRefunds  = refunds?.reduce((s, r) => s + (r.amount ?? 0), 0) ?? 0;
  const totalShifts   = shiftsByBranch?.length ?? 0;
  const totalOrders   = orders?.length ?? 0;

  // Payment breakdown
  const paymentData = ["CASH", "CARD", "ESEWA"].map((method) => ({
    method,
    total: orders?.filter((o) => (o.paymentType ?? o.paymentMethod ?? "").toUpperCase() === method)
      .reduce((s, o) => s + (o.totalAmount ?? 0), 0) ?? 0,
  }));

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24, background: "#f0fdf4", minHeight: "100%", fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Analytics & Reports</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>Historical performance analysis and insights</p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          style={{ border: "1px solid #d1fae5", borderRadius: 8, padding: "7px 12px", fontSize: 13, background: "white", outline: "none", fontFamily: "inherit" }}
        >
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
        </select>
      </div>

      {/* Performance Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Revenue",  value: `रु ${totalRevenue.toLocaleString("en-IN")}`, sub: `Avg: रु ${Math.round(totalRevenue / Math.max(days, 1)).toLocaleString("en-IN")}/day`, icon: TrendingUp, color: "#059669" },
          { label: "Total Orders",   value: totalOrders, sub: `Avg: ${Math.round(totalOrders / Math.max(days, 1))} orders/day`, icon: ShoppingBag, color: "#0d9488" },
          { label: "Refund Rate",    value: `${totalOrders > 0 ? ((refunds?.length ?? 0) / totalOrders * 100).toFixed(1) : 0}%`, sub: `रु ${totalRefunds.toLocaleString("en-IN")} refunded`, icon: RotateCcw, color: "#e53e3e" },
          { label: "Active Shifts",  value: totalShifts, sub: `${Math.round(totalShifts / Math.max(days, 1) * 7)} shifts/week`, icon: BarChart2, color: "#059669" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} style={{ ...card, padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: "#8a909c" }}>{label}</p>
                <p style={{ margin: "6px 0 2px", fontSize: 22, fontWeight: 800, color, letterSpacing: "-0.5px" }}>{value}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{sub}</p>
              </div>
              <Icon size={18} color={color} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        {/* Revenue Trend */}
        <div style={{ ...card, padding: "20px 20px 12px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Revenue Trend</p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>Daily revenue for selected period</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fill="url(#reportGrad)" dot={false} activeDot={{ r: 4, fill: "#059669" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Breakdown */}
        <div style={card}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Payment Breakdown</p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>Revenue by payment method</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={paymentData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="method" tick={{ fontSize: 11, fill: "#8a909c" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Shift Reports Table */}
      <div style={card}>
        <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700 }}>Shift History</p>
        {shiftsByBranch?.length === 0 ? (
          <p style={{ color: "#8a909c", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No shift records found</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Shift ID", "Cashier", "Start Time", "End Time", "Total Sales", "Status"].map((h, i) => (
                    <th key={h} style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f0fdf4", textAlign: i === 4 ? "right" : "left", borderBottom: "1px solid #d1fae5" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shiftsByBranch?.map((shift, i) => (
                  <tr key={shift.id ?? i} style={{ background: "white" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #d1fae5", fontWeight: 600 }}>#{(shift.id ?? "").toString().slice(-6)}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #d1fae5", color: "#8a909c" }}>{shift.cashierName ?? shift.cashierId ?? "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #d1fae5", color: "#8a909c" }}>
                      {shift.startTime ? new Date(shift.startTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #d1fae5", color: "#8a909c" }}>
                      {shift.endTime ? new Date(shift.endTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Active"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #d1fae5", textAlign: "right", fontWeight: 700, color: "#059669" }}>
                      रु {(shift.totalSales ?? shift.totalAmount ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #d1fae5" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: shift.endTime ? "#f0fdf4" : "#fffbeb", color: shift.endTime ? "#059669" : "#d97706" }}>
                        {shift.endTime ? "Closed" : "Active"}
                      </span>
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
