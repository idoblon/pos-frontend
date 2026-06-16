import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Bell, Store, Users, AlertTriangle } from "lucide-react";
import { getAllStores } from "@/Redux Toolkit/Features/Store/storeThunk";
import { getAllUsers } from "@/Redux Toolkit/Features/user/userThunk";
import subscriptionService from "@/services/subscriptionService";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";

const ROLE_COLORS = ["#1a1d23", "#3d3d3d", "#6b6b6b", "#9e9e9e"];

function getCollection(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  return [value.data, value.items, value.results, value.content, value.branches, value.orders]
    .find(Array.isArray) || [];
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getStoreId(store) { return store?.id || store?._id; }
function getStoreName(store) { return store?.brand || store?.name || store?.storeName || "Store"; }
function getOrderAmount(order) {
  return toNumber(order.totalAmount ?? order.total ?? order.amount ?? order.grandTotal ?? order.netAmount);
}
function formatMoney(amount) { return `NPR ${toNumber(amount).toLocaleString("en-IN")}`; }

function StatCard({ title, value, subtitle, icon, loading }) {
  return (
    <div style={{
      background: "white", border: "1px solid #e5e7eb", borderRadius: "12px",
      padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16,
    }}>
      <div>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{title}</p>
        <p style={{ margin: "6px 0 4px", fontSize: 30, fontWeight: 700, color: "#1a1d23", letterSpacing: "-1px" }}>
          {loading ? "—" : value}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{subtitle}</p>
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 10, background: "#1a1d23", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {React.createElement(icon, { size: 22, color: "white" })}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { stores, loading: storesLoading } = useSelector((s) => s.store);
  const { users, loading: usersLoading } = useSelector((s) => s.user);

  const [subscriptionStats, setSubscriptionStats] = useState(null);
  const [storeMetrics, setStoreMetrics] = useState({});
  const hasFetchedStats = useRef(false);

  // Fetch stores and users once on mount
  useEffect(() => {
    dispatch(getAllStores());
    dispatch(getAllUsers());
  }, [dispatch]);

  // Fetch subscription stats once on mount
  useEffect(() => {
    if (hasFetchedStats.current) return;
    hasFetchedStats.current = true;
    subscriptionService.getSubscriptionStats()
      .then((stats) => setSubscriptionStats(stats || {}))
      .catch(() => setSubscriptionStats({}));
  }, []);

  // Real stores: exclude registration-only ghost entries
  const realStores = useMemo(
    () => (stores || []).filter((s) => !s.isRegistrationOnly),
    [stores],
  );

  // Stable key for store metrics effect
  const storeIdsKey = useMemo(
    () => realStores.map(getStoreId).filter(Boolean).sort().join(","),
    [realStores],
  );

  // Fetch branch/order metrics per store
  useEffect(() => {
    if (!realStores.length) return;
    let cancelled = false;
    const headers = getAuthHeaders();

    Promise.all(
      realStores.map(async (store) => {
        const storeId = getStoreId(store);
        try {
          const branchRes = await api.get(`/api/branches/store/${storeId}`, { headers });
          const branches = getCollection(branchRes.data);
          const orderResults = await Promise.allSettled(
            branches
              .map((b) => b.id || b._id)
              .filter(Boolean)
              .map((branchId) => api.get(`/api/orders/branch/${branchId}`, { headers })),
          );
          const orders = orderResults.flatMap((r) =>
            r.status === "fulfilled" ? getCollection(r.value.data) : [],
          );
          return [String(storeId), {
            branchCount: branches.length,
            orders: orders.length,
            revenue: orders.reduce((sum, o) => sum + getOrderAmount(o), 0),
          }];
        } catch {
          return [String(storeId), {
            branchCount: 0,
            orders: toNumber(store.totalOrders),
            revenue: toNumber(store.totalRevenue),
          }];
        }
      }),
    ).then((entries) => {
      if (!cancelled) setStoreMetrics(Object.fromEntries(entries));
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeIdsKey]);

  // ── Stat card values ──────────────────────────────────────────────
  const totalStores = realStores.length;

  const activeStores = useMemo(
    () => realStores.filter((s) => String(s.status || "").toUpperCase() === "ACTIVE").length,
    [realStores],
  );

  const totalUsers = users?.length || 0;
  const activeUsers = useMemo(
    () => (users || []).filter((u) => !u.status || u.status.toLowerCase() === "active").length,
    [users],
  );

  const expiringSubscriptions = useMemo(() => {
    const now = new Date();
    const limit = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    return realStores.filter((s) => {
      if (!s.subscriptionExpiry) return false;
      const exp = new Date(s.subscriptionExpiry);
      return exp > now && exp <= limit;
    }).length;
  }, [realStores]);

  // Use backend stats if loaded, else fall back to realStores calculation
  const subscriptionRevenue = useMemo(() => {
    if (subscriptionStats?.totalRevenue > 0) return subscriptionStats.totalRevenue;
    // Fallback: sum plan prices from store data
    const PRICES = { BASIC: 3500, PROFESSIONAL: 7000, ENTERPRISE: 10000 };
    return realStores.reduce((sum, s) => sum + (PRICES[s.subscriptionPlan] || 0), 0);
  }, [subscriptionStats, realStores]);

  const expiringCount = subscriptionStats?.expiringCount ?? expiringSubscriptions;

  // ── Chart data ────────────────────────────────────────────────────
  const storePerformanceData = useMemo(() =>
    realStores
      .map((store) => {
        const id = String(getStoreId(store) || "");
        const m = storeMetrics[id] || {};
        return {
          name: getStoreName(store).slice(0, 12),
          orders: toNumber(m.orders),
          revenue: toNumber(m.revenue),
        };
      })
      .filter((d) => d.name)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 6),
    [storeMetrics, realStores],
  );

  const storeStatusData = useMemo(() => {
    const counts = realStores.reduce((acc, s) => {
      const key = String(s.status || "ACTIVE").toUpperCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return [
      { name: "Active",    value: counts.ACTIVE    || 0, color: "#1a1d23" },
      { name: "Suspended", value: counts.SUSPENDED || 0, color: "#374151" },
      { name: "Pending",   value: (counts.PENDING || 0) + (counts.PAYMENT_PENDING || 0), color: "#9ca3af" },
      { name: "Inactive",  value: counts.INACTIVE  || 0, color: "#6b7280" },
    ].filter((d) => d.value > 0);
  }, [realStores]);

  const userRoleData = useMemo(() => {
    const map = {};
    (users || []).forEach((u) => {
      const label =
        u.role === "ROLE_ADMIN" ? "Admin"
        : u.role === "ROLE_STORE_ADMIN" ? "Store Admin"
        : u.role === "ROLE_BRANCH_MANAGER" ? "Branch Mgr"
        : u.role === "ROLE_BRANCH_CASHIER" ? "Cashier"
        : "Other";
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([name, value], i) => ({
      name, value, color: ROLE_COLORS[i % ROLE_COLORS.length],
    }));
  }, [users]);

  const statsLoading = storesLoading || subscriptionStats === null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'DM Sans','Inter',sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1d23", letterSpacing: "-0.3px" }}>
            System Dashboard
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
            Live overview of your entire POS network
          </p>
        </div>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => navigate("/admin/payments")}
            style={{
              width: 44, height: 44, borderRadius: 12, border: "none", cursor: "pointer",
              background: expiringCount > 0 ? "#f59e0b" : "#f3f4f6",
              color: expiringCount > 0 ? "white" : "#6b7280",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            title="Payment Notifications"
          >
            <Bell size={20} />
          </button>
          {expiringCount > 0 && (
            <div style={{
              position: "absolute", top: -6, right: -6, width: 20, height: 20,
              borderRadius: "50%", background: "#dc2626", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700,
            }}>
              {expiringCount}
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <StatCard
          title="Total Stores"
          value={totalStores}
          subtitle={`${activeStores} active`}
          icon={Store}
          loading={storesLoading}
        />
        <StatCard
          title="Total Users"
          value={totalUsers}
          subtitle={`${activeUsers} active`}
          icon={Users}
          loading={usersLoading}
        />
        <StatCard
          title="Expiring Subscriptions"
          value={expiringSubscriptions}
          subtitle="Expiring in next 60 days"
          icon={AlertTriangle}
          loading={storesLoading}
        />
        <StatCard
          title="Subscription Revenue"
          value={subscriptionRevenue > 0 ? formatMoney(subscriptionRevenue) : "NPR 0"}
          subtitle="Annual plan total"
          icon={() => <span style={{ fontSize: 16, fontWeight: 700, color: "white" }}>NPR</span>}
          loading={statsLoading}
        />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1a1d23" }}>Store Performance</p>
          <p style={{ margin: "0 0 20px", fontSize: 12, color: "#6b7280" }}>Orders per store</p>
          {storePerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={storePerformanceData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" }}>
                        <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 13 }}>{label}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Orders: {payload[0]?.value}</p>
                        {payload[0]?.payload?.revenue > 0 && (
                          <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Revenue: {formatMoney(payload[0].payload.revenue)}</p>
                        )}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="orders" fill="#1a1d23" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>{storesLoading ? "Loading..." : "No order data available"}</p>
            </div>
          )}
        </div>

        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1a1d23" }}>Store Status</p>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7280" }}>By store status</p>
          {storeStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={storeStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                    {storeStatusData.map((entry, i) => <Cell key={entry.name} fill={entry.color || ROLE_COLORS[i % ROLE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {storeStatusData.map((entry) => (
                  <div key={entry.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: entry.color }} />
                      <span style={{ fontSize: 12, color: "#4b5563" }}>{entry.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1d23" }}>{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>{storesLoading ? "Loading..." : "No store data"}</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1a1d23" }}>Users by Role</p>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7280" }}>From backend user accounts</p>
          {userRoleData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={userRoleData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                    {userRoleData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {userRoleData.map((entry) => (
                  <div key={entry.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: entry.color }} />
                      <span style={{ fontSize: 12, color: "#4b5563" }}>{entry.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1d23" }}>{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>{usersLoading ? "Loading..." : "No user data"}</p>
            </div>
          )}
        </div>

        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1a1d23" }}>Registered Stores</p>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7280" }}>Store records from the backend</p>
          {storesLoading ? (
            <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>Loading...</p>
          ) : realStores.length > 0 ? (
            <div style={{ overflow: "auto", maxHeight: 280 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    {["Store", "Admin", "Status", "Branches"].map((h) => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {realStores.map((store, i) => {
                    const sid = String(getStoreId(store) || "");
                    const status = String(store.status || "ACTIVE").toUpperCase();
                    return (
                      <tr key={sid || i} style={{ borderBottom: "1px solid #f9fafb" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1a1d23" }}>{getStoreName(store)}</td>
                        <td style={{ padding: "10px 12px", color: "#6b7280" }}>
                          {store.storeAdmin?.fullName || store.fullName || store.ownerName || "—"}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{
                            padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                            background: status === "ACTIVE" ? "#f0fdf4" : status === "SUSPENDED" ? "#fef2f2" : "#f9fafb",
                            color: status === "ACTIVE" ? "#166534" : status === "SUSPENDED" ? "#991b1b" : "#6b7280",
                          }}>
                            {status}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", color: "#6b7280" }}>
                          {storeMetrics[sid]?.branchCount ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>No stores registered yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
