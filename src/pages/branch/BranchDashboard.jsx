import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Users, RotateCcw, TrendingUp, RefreshCw, ShoppingCart } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getTodayOrdersByBranch,
  getOrdersByBranch,
  getRecentOrdersByBranch,
} from "@/Redux Toolkit/Features/order/orderThunk";
import { findBranchEmployee } from "@/Redux Toolkit/Features/Employee/employeeThunk";
import { getRefundsByBranch } from "@/Redux Toolkit/Features/refund/refundThunk";
import BranchSalesTargetCard from "@/components/branch/BranchSalesTargetCard";
import useBranchContext from "@/hooks/useBranchContext";

const card = {
  background: "white",
  border: "1px solid #e2e5e9",
  borderRadius: 10,
  padding: "18px 20px",
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #e2e5e9", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{label}</p>
      <p style={{ margin: 0, color: "#1a1d23", fontWeight: 700 }}>
        रु {payload[0].value?.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

export default function BranchDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { branchId, userProfile, user, userData } = useBranchContext();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { todayOrders, orders, recentOrders } = useSelector((s) => s.order);
  const { refundsByBranch: refunds } = useSelector((s) => s.refund);

  // Start of current calendar month — resets naturally on the 1st
  const monthStart = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const fetchAllData = useCallback(async () => {
    if (!branchId) return;
    setIsRefreshing(true);
    try {
      await Promise.all([
        dispatch(getTodayOrdersByBranch(branchId)),
        dispatch(getOrdersByBranch({ branchId })),
        dispatch(getRecentOrdersByBranch(branchId)),
        dispatch(findBranchEmployee({ branchId })),
        dispatch(getRefundsByBranch(branchId)),
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch, branchId]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // Pause background polling while the tab is hidden.
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchAllData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const userRole = userProfile?.role || user?.role || userData?.role || "ROLE_BRANCH_MANAGER";

  const formatRole = (role) => {
    if (!role) return "Branch Manager";
    return role.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const displayRole = formatRole(userRole);

  // Current-month orders and refunds
  const monthlyOrders = useMemo(
    () => (orders || []).filter((o) => o.createdAt && new Date(o.createdAt) >= monthStart),
    [orders, monthStart]
  );

  const monthlyRefunds = useMemo(
    () => (refunds || []).filter((r) => r.createdAt && new Date(r.createdAt) >= monthStart),
    [refunds, monthStart]
  );

  const todayRefunds = useMemo(() => {
    const today = new Date().toDateString();
    return (refunds || []).filter((r) => r.createdAt && new Date(r.createdAt).toDateString() === today);
  }, [refunds]);

  const todayRevenue = todayOrders?.reduce((s, o) => s + (o.totalAmount ?? 0), 0) ?? 0;
  const todayRefundAmount = todayRefunds.reduce((sum, r) => sum + (r.amount || 0), 0);

  const monthlyRevenue = useMemo(
    () => monthlyOrders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0),
    [monthlyOrders]
  );

  const totalMonthlyOrders = monthlyOrders.length;
  const totalMonthlyRefunds = monthlyRefunds.length;
  const totalMonthlyRefundAmount = monthlyRefunds.reduce((sum, r) => sum + (r.amount ?? 0), 0);

  const avgOrderValue = totalMonthlyOrders > 0 ? monthlyRevenue / totalMonthlyOrders : 0;
  const refundRate = totalMonthlyOrders > 0 ? (totalMonthlyRefunds / totalMonthlyOrders) * 100 : 0;

  const estimatedProfit = todayRevenue * 0.3;
  const monthlyProfit = monthlyRevenue * 0.3;

  const paymentBreakdown = {
    cash: todayOrders?.filter((o) => (o.paymentType ?? o.paymentMethod ?? "").toUpperCase() === "CASH").reduce((s, o) => s + (o.totalAmount ?? 0), 0) ?? 0,
    card: todayOrders?.filter((o) => (o.paymentType ?? o.paymentMethod ?? "").toUpperCase() === "CARD").reduce((s, o) => s + (o.totalAmount ?? 0), 0) ?? 0,
    esewa: todayOrders?.filter((o) => (o.paymentType ?? o.paymentMethod ?? "").toUpperCase() === "ESEWA").reduce((s, o) => s + (o.totalAmount ?? 0), 0) ?? 0,
    khalti: todayOrders?.filter((o) => (o.paymentType ?? o.paymentMethod ?? "").toUpperCase() === "KHALTI").reduce((s, o) => s + (o.totalAmount ?? 0), 0) ?? 0,
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
    monthlyOrders.forEach((o) => {
      const date = new Date(o.createdAt).toISOString().slice(0, 10);
      const day = days.find((d) => d.dateStr === date);
      if (day) day.revenue += o.totalAmount ?? 0;
    });
    return days.map(({ label, revenue }) => ({ label, revenue }));
  }, [monthlyOrders]);

  const stats = [
    {
      label: "Today's Revenue",
      value: `रु ${todayRevenue.toLocaleString("en-IN")}`,
      sub: `${todayOrders?.length ?? 0} orders · Est. profit: रु ${estimatedProfit.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: "#1a1d23",
      realTime: true,
    },
    {
      label: "Monthly Revenue",
      value: `रु ${monthlyRevenue.toLocaleString("en-IN")}`,
      sub: `Est. profit: रु ${monthlyProfit.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      icon: ShoppingBag,
      color: "#1a1d23",
      realTime: false,
    },
    {
      label: "Avg Order Value",
      value: `रु ${avgOrderValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      sub: `${totalMonthlyOrders} orders this month`,
      icon: Users,
      color: "#6b7280",
      realTime: false,
    },
    {
      label: "Refund Rate",
      value: `${refundRate.toFixed(1)}%`,
      sub: `रु ${totalMonthlyRefundAmount.toLocaleString("en-IN")} this month`,
      icon: RotateCcw,
      color: "#6b7280",
      realTime: true,
    },
  ];

  const displayRecent = recentOrders?.length ? recentOrders : (orders?.slice(0, 5) ?? []);
  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        background: "#f5f5f5",
        minHeight: "100%",
        fontFamily: "'DM Sans','Inter',sans-serif",
        color: "#1a1d23",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Financial Overview</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
              {monthLabel} — month-to-date ·{" "}
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <span style={{ color: "#e5e7eb" }}>•</span>
            <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>
              Last updated: {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <span style={{ color: "#e5e7eb" }}>•</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: "#f5f5f5", color: "#6b7280" }}>
              {displayRole}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => navigate("/branch/register")}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              background: "#1a1d23", color: "white", border: "none", borderRadius: 6,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
          >
            <ShoppingCart size={14} /> Open Register
          </button>
          <button
            onClick={fetchAllData}
            disabled={isRefreshing}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 12px",
            background: isRefreshing ? "#f3f4f6" : "#1a1d23",
            color: isRefreshing ? "#6b7280" : "white",
            border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
            cursor: isRefreshing ? "not-allowed" : "pointer", transition: "all 0.2s ease",
          }}
        >
          <RefreshCw size={14} style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none" }} />
          {isRefreshing ? "Updating..." : "Refresh"}
        </button>
      </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {stats.map(({ label, value, sub, icon: Icon, color, realTime }) => (
          <div key={label} style={{ ...card, position: "relative" }}>
            {realTime && (
              <div style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%", background: "#1a1d23", animation: "pulse 2s infinite" }} />
            )}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#8a909c" }}>{label}</p>
                  {realTime && <span style={{ fontSize: 9, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>LIVE</span>}
                </div>
                <p style={{ margin: "6px 0 2px", fontSize: 26, fontWeight: 800, letterSpacing: "-1px" }}>{value}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{sub}</p>
              </div>
              <Icon size={20} color={color} />
            </div>
          </div>
        ))}
      </div>

      <BranchSalesTargetCard />

      {/* Financial Breakdown */}
      <div style={card}>
        <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700 }}>Financial Breakdown</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          {[
            { label: "Cash Sales", amount: paymentBreakdown.cash, percentage: todayRevenue > 0 ? (paymentBreakdown.cash / todayRevenue * 100).toFixed(1) : 0 },
            { label: "Card Sales", amount: paymentBreakdown.card, percentage: todayRevenue > 0 ? (paymentBreakdown.card / todayRevenue * 100).toFixed(1) : 0 },
            { label: "eSewa", amount: paymentBreakdown.esewa, percentage: todayRevenue > 0 ? (paymentBreakdown.esewa / todayRevenue * 100).toFixed(1) : 0 },
            { label: "Khalti", amount: paymentBreakdown.khalti, percentage: todayRevenue > 0 ? (paymentBreakdown.khalti / todayRevenue * 100).toFixed(1) : 0 },
            { label: "Est. Profit", amount: estimatedProfit, percentage: "30%" },
            { label: "Refunds", amount: todayRefundAmount, percentage: todayRevenue > 0 ? (todayRefundAmount / todayRevenue * 100).toFixed(1) : 0, muted: true },
          ].map(({ label, amount, percentage, muted }) => (
            <div key={label} style={{ padding: "12px 16px", borderRadius: 8, background: "#f5f5f5", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 11, color: "#8a909c", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
              <p style={{ margin: "4px 0 2px", fontSize: 16, fontWeight: 700, color: muted ? "#6b7280" : "#1a1d23" }}>
                रु {amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
              <p style={{ margin: 0, fontSize: 10, color: "#6b7280" }}>
                {typeof percentage === "string" ? percentage : `${percentage}%`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart + Recent Orders */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div style={{ ...card, padding: "20px 20px 12px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Revenue Analytics</p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>
            Last 7 days · {monthLabel}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="branchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a1d23" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#1a1d23" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8a909c" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#1a1d23" strokeWidth={2} fill="url(#branchGrad)" dot={false} activeDot={{ r: 4, fill: "#1a1d23" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...card, display: "flex", flexDirection: "column" }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>Recent Orders</p>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "#8a909c" }}>Latest transactions</p>
          {displayRecent.length === 0 ? (
            <p style={{ color: "#8a909c", fontSize: 13, textAlign: "center", marginTop: 40 }}>No orders yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {displayRecent.slice(0, 6).map((o, i) => (
                <div
                  key={o.id ?? o._id ?? i}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>
                      Order #{(o.id ?? o._id ?? "").toString().slice(-6)}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1a1d23" }}>
                      रु {(o.totalAmount ?? 0).toLocaleString("en-IN")}
                    </p>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: o.status === "COMPLETED" ? "#f0f0f0" : "#fffbeb", color: o.status === "COMPLETED" ? "#1a1d23" : "#d97706" }}>
                      {o.status ?? "PENDING"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
