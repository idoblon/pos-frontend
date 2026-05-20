import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingBag, Users, RotateCcw, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getTodayOrdersByBranch, getOrdersByBranch, getRecentOrdersByBranch } from "@/Redux Toolkit/Features/order/orderThunk";
import { findBranchEmployee } from "@/Redux Toolkit/Features/Employee/employeeThunk";
import { getRefundsByBranch } from "@/Redux Toolkit/Features/refund/refundThunk";
import secureStorage from "@/util/secureStorage";

const card = { background: "white", border: "1px solid #e2e5e9", borderRadius: 10, padding: "18px 20px" };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #e2e5e9", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{label}</p>
      <p style={{ margin: 0, color: "#059669", fontWeight: 700 }}>रु {payload[0].value?.toLocaleString("en-IN")}</p>
    </div>
  );
}

export default function BranchDashboard() {
  const dispatch = useDispatch();
  const userData = secureStorage.getUserData();
  const branchId = userData?.branchId;

  const { todayOrders, orders, recentOrders } = useSelector((s) => s.order);
  const { employees } = useSelector((s) => s.employee);
  const { refunds } = useSelector((s) => s.refund);

  useEffect(() => {
    if (!branchId) return;
    dispatch(getTodayOrdersByBranch(branchId));
    dispatch(getOrdersByBranch({ branchId }));
    dispatch(getRecentOrdersByBranch(branchId));
    dispatch(findBranchEmployee({ branchId }));
    dispatch(getRefundsByBranch(branchId));
  }, [dispatch, branchId]);

  const todayRevenue = todayOrders?.reduce((s, o) => s + (o.totalAmount ?? 0), 0) ?? 0;
  const totalOrders = orders?.length ?? 0;
  const totalRefunds = refunds?.length ?? 0;
  const totalEmployees = employees?.length ?? 0;

  // Payment breakdown for today's orders
  const paymentBreakdown = {
    cash: todayOrders?.filter(o => (o.paymentType ?? o.paymentMethod ?? "").toUpperCase() === "CASH").reduce((s, o) => s + (o.totalAmount ?? 0), 0) ?? 0,
    card: todayOrders?.filter(o => (o.paymentType ?? o.paymentMethod ?? "").toUpperCase() === "CARD").reduce((s, o) => s + (o.totalAmount ?? 0), 0) ?? 0,
    esewa: todayOrders?.filter(o => (o.paymentType ?? o.paymentMethod ?? "").toUpperCase() === "ESEWA").reduce((s, o) => s + (o.totalAmount ?? 0), 0) ?? 0,
  };

  const trendData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        dateStr: d.toISOString().slice(0, 10),
        revenue: 0,
      };
    });
    orders?.forEach((o) => {
      const date = new Date(o.createdAt).toISOString().slice(0, 10);
      const day = days.find((d) => d.dateStr === date);
      if (day) day.revenue += o.totalAmount ?? 0;
    });
    return days.map(({ label, revenue }) => ({ label, revenue }));
  }, [orders]);

  const stats = [
    { label: "Today's Revenue",  value: `रु ${todayRevenue.toLocaleString("en-IN")}`, sub: `${todayOrders?.length ?? 0} orders today`, icon: TrendingUp, color: "#059669" },
    { label: "Total Orders",     value: totalOrders,   sub: "all time",           icon: ShoppingBag, color: "#0d9488" },
    { label: "Employees",        value: totalEmployees, sub: "active staff",      icon: Users,       color: "#059669" },
    { label: "Refunds",          value: totalRefunds,  sub: "processed",          icon: RotateCcw,   color: "#e53e3e" },
  ];

  const displayRecent = recentOrders?.length ? recentOrders : orders?.slice(0, 5) ?? [];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24, background: "#f0fdf4", minHeight: "100%", fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Today's Overview</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>Real-time branch performance for {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} style={card}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: "#8a909c" }}>{label}</p>
                <p style={{ margin: "6px 0 2px", fontSize: 26, fontWeight: 800, letterSpacing: "-1px" }}>{value}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{sub}</p>
              </div>
              <Icon size={20} color={color} />
            </div>
          </div>
        ))}
      </div>

      {/* Payment Breakdown */}
      <div style={card}>
        <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700 }}>Today's Payment Breakdown</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
          {[
            { label: "Cash", amount: paymentBreakdown.cash, color: "#059669", bg: "#f0fdf4" },
            { label: "Card", amount: paymentBreakdown.card, color: "#3b82f6", bg: "#eff6ff" },
            { label: "eSewa", amount: paymentBreakdown.esewa, color: "#7c3aed", bg: "#f5f3ff" },
          ].map(({ label, amount, color, bg }) => (
            <div key={label} style={{ padding: "12px 16px", borderRadius: 8, background: bg, textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 11, color: "#8a909c", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
              <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 700, color }}>
                रु {amount.toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart + Recent Orders */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        {/* Today's Hourly Sales */}
        <div style={{ ...card, padding: "20px 20px 12px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Today's Sales Activity</p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>Hourly breakdown for today</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData.slice(-1)} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="branchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fill="url(#branchGrad)" dot={false} activeDot={{ r: 4, fill: "#059669" }} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 12, padding: "8px 12px", background: "#f0fdf4", borderRadius: 6, fontSize: 12, color: "#059669", textAlign: "center" }}>
            Target: रु 15,000 • Current: रु {todayRevenue.toLocaleString("en-IN")} • {todayRevenue >= 15000 ? '✅ Target Achieved!' : `रु ${(15000 - todayRevenue).toLocaleString("en-IN")} to go`}
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{ ...card, display: "flex", flexDirection: "column" }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Recent Orders</p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>Latest transactions</p>
          {displayRecent.length === 0 ? (
            <p style={{ color: "#8a909c", fontSize: 13, textAlign: "center", marginTop: 40 }}>No orders yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {displayRecent.slice(0, 6).map((o, i) => (
                <div key={o.id ?? o._id ?? i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0fdf4" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>Order #{(o.id ?? o._id ?? "").toString().slice(-6)}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#059669" }}>रु {(o.totalAmount ?? 0).toLocaleString("en-IN")}</p>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: o.status === "COMPLETED" ? "#f0fdf4" : "#fffbeb", color: o.status === "COMPLETED" ? "#059669" : "#d97706" }}>
                      {o.status ?? "PENDING"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
