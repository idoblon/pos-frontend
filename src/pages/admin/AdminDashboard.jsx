import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Bell, ShoppingCart, Store, Users } from "lucide-react";
import { getAllStores } from "@/Redux Toolkit/Features/Store/storeThunk";
import { getAllUsers } from "@/Redux Toolkit/Features/user/userThunk";
import paymentNotificationService from "@/services/paymentNotificationService";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import {
  getAdminSystemSettings,
  secondsToMilliseconds,
  subscribeAdminSystemSettings,
} from "@/util/adminSystemSettings";

const ROLE_COLORS = ["#1a1d23", "#3d3d3d", "#6b6b6b", "#9e9e9e"];

function getCollection(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  return [
    value.data,
    value.items,
    value.results,
    value.content,
    value.branches,
    value.orders,
  ].find(Array.isArray) || [];
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getStoreId(store) {
  return store?._id || store?.id || store?.createdStoreId;
}

function getStoreName(store) {
  return store?.brand || store?.name || store?.storeName || "Store";
}

function getOrderAmount(order) {
  return toNumber(
    order.totalAmount ??
    order.total ??
    order.amount ??
    order.grandTotal ??
    order.netAmount,
  );
}

function getStoreMetricFallback(store) {
  const branchOrders = getCollection(store?.branches).reduce(
    (sum, branch) => sum + toNumber(branch.totalOrders ?? branch.orderCount ?? branch.ordersCount),
    0,
  );

  return {
    orders: toNumber(store?.totalOrders ?? store?.ordersCount ?? store?.orderCount, branchOrders),
    revenue: toNumber(store?.totalRevenue ?? store?.monthlyRevenue ?? store?.revenue ?? store?.totalSales ?? store?.salesAmount),
    branchCount: getCollection(store?.branches).length,
  };
}

function formatMoney(amount) {
  return `NPR ${toNumber(amount).toLocaleString("en-IN")}`;
}

function StatCard({ title, value, subtitle, icon, loading }) {
  return (
    <div style={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "20px 24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
    }}>
      <div>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
          {title}
        </p>
        <p style={{
          margin: "6px 0 4px",
          fontSize: 30,
          fontWeight: 700,
          color: "#1a1d23",
          letterSpacing: "-1px",
        }}>
          {loading ? "-" : value}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
          {subtitle}
        </p>
      </div>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: "#1a1d23",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        {React.createElement(icon, { size: 22, color: "white" })}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [paymentStats, setPaymentStats] = useState({});
  const [storeMetrics, setStoreMetrics] = useState({});
  const [adminSettings, setAdminSettings] = useState(getAdminSystemSettings);

  const { stores, loading: storesLoading } = useSelector((s) => s.store);
  const { users, loading: usersLoading } = useSelector((s) => s.user);

  const loadPaymentStats = useCallback(async () => {
    const stats = await paymentNotificationService.getPaymentStats();
    setPaymentStats(stats || {});
  }, []);

  useEffect(() => subscribeAdminSystemSettings(setAdminSettings), []);

  useEffect(() => {
    dispatch(getAllStores());
    dispatch(getAllUsers());
    const initialTimer = setTimeout(loadPaymentStats, 0);
    const interval = setInterval(
      loadPaymentStats,
      secondsToMilliseconds(adminSettings.paymentPollingSeconds, 10, 5),
    );

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [dispatch, adminSettings.paymentPollingSeconds, loadPaymentStats]);

  const storeMetricIds = (stores || [])
    .map(getStoreId)
    .filter(Boolean)
    .map(String)
    .join("|");

  useEffect(() => {
    const storesWithIds = (stores || []).filter((store) => getStoreId(store) && !store.isRegistrationOnly);
    if (!storesWithIds.length) {
      const clearTimer = setTimeout(() => setStoreMetrics({}), 0);
      return () => clearTimeout(clearTimer);
    }

    let cancelled = false;
    async function loadStoreMetrics() {
      const headers = getAuthHeaders();
      const entries = await Promise.all(
        storesWithIds.map(async (store) => {
          const storeId = getStoreId(store);
          const fallback = getStoreMetricFallback(store);

          try {
            const branchResult = await api.get(`/api/branches/store/${storeId}`, { headers });
            const branches = getCollection(branchResult.data);
            const orderResults = await Promise.allSettled(
              branches
                .map((branch) => branch._id || branch.id)
                .filter(Boolean)
                .map((branchId) => api.get(`/api/orders/branch/${branchId}`, { headers })),
            );

            const orders = orderResults.flatMap((result) =>
              result.status === "fulfilled" ? getCollection(result.value.data) : [],
            );

            return [String(storeId), {
              orders: orders.length || fallback.orders,
              revenue: orders.reduce((sum, order) => sum + getOrderAmount(order), 0) || fallback.revenue,
              branchCount: branches.length || fallback.branchCount,
            }];
          } catch {
            return [String(storeId), fallback];
          }
        }),
      );

      if (!cancelled) {
        setStoreMetrics(Object.fromEntries(entries));
      }
    }

    loadStoreMetrics();

    return () => {
      cancelled = true;
    };
  }, [storeMetricIds, stores]);

  const totalStores = stores?.length || 0;
  const activeStores = stores?.filter((store) =>
    (store.status || "").toLowerCase() === "active",
  ).length || 0;

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((user) =>
    (user.status || "").toLowerCase() === "active" || !user.status,
  ).length || 0;

  const totalOrders = useMemo(() => (
    (stores || []).reduce((sum, store) => {
      const storeId = String(getStoreId(store) || "");
      const metrics = storeMetrics[storeId] || getStoreMetricFallback(store);
      return sum + toNumber(metrics.orders);
    }, 0)
  ), [storeMetrics, stores]);

  const storePerformanceData = useMemo(() =>
    (stores || [])
      .filter((store) => getStoreName(store))
      .map((store) => {
        const storeId = String(getStoreId(store) || "");
        const metrics = storeMetrics[storeId] || getStoreMetricFallback(store);
        return {
          name: getStoreName(store).slice(0, 12),
          orders: toNumber(metrics.orders),
          revenue: toNumber(metrics.revenue),
        };
      })
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 6),
    [storeMetrics, stores],
  );

  const storeStatusData = useMemo(() => {
    const counts = (stores || []).reduce((acc, store) => {
      const status = (store.status || "active").toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: "Active", value: counts.active || 0, color: "#1a1d23" },
      { name: "Inactive", value: counts.inactive || 0, color: "#6b7280" },
      { name: "Suspended", value: counts.suspended || 0, color: "#374151" },
      { name: "Pending", value: (counts.pending || 0) + (counts.payment_pending || 0), color: "#9ca3af" },
    ].filter((item) => item.value > 0);
  }, [stores]);

  const userRoleData = useMemo(() => {
    const roleMap = {};
    (users || []).forEach((user) => {
      const role = user.role || "UNKNOWN";
      const label = role === "ROLE_ADMIN" ? "Admin"
        : role === "ROLE_STORE_ADMIN" ? "Store Admin"
        : role === "ROLE_BRANCH_MANAGER" ? "Branch Mgr"
        : role === "ROLE_BRANCH_CASHIER" ? "Cashier"
        : "Other";
      roleMap[label] = (roleMap[label] || 0) + 1;
    });

    return Object.entries(roleMap).map(([name, value], index) => ({
      name,
      value,
      color: ROLE_COLORS[index % ROLE_COLORS.length],
    }));
  }, [users]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 24,
      fontFamily: "'DM Sans','Inter',sans-serif",
    }}>
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
              width: 44,
              height: 44,
              borderRadius: 12,
              background: paymentStats.unreadCount > 0 ? "#059669" : "#f3f4f6",
              color: paymentStats.unreadCount > 0 ? "white" : "#6b7280",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            title="Payment Notifications"
          >
            <Bell size={20} />
          </button>
          {paymentStats.unreadCount > 0 && (
            <div style={{
              position: "absolute",
              top: -6,
              right: -6,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#dc2626",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
            }}>
              {paymentStats.unreadCount}
            </div>
          )}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
      }}>
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
          title="Total Orders"
          value={totalOrders > 0 ? totalOrders.toLocaleString() : "-"}
          subtitle="Fetched from branch orders"
          icon={ShoppingCart}
          loading={storesLoading}
        />
        <StatCard
          title="Subscription Revenue"
          value={paymentStats.totalRevenue > 0 ? formatMoney(paymentStats.totalRevenue) : "-"}
          subtitle="Fetched from payment stats"
          icon={() => <span style={{ fontSize: 18, fontWeight: 700, color: "white", lineHeight: 1 }}>NPR</span>}
          loading={false}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24,
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1a1d23" }}>
            Store Performance
          </p>
          <p style={{ margin: "0 0 20px", fontSize: 12, color: "#6b7280" }}>
            Orders per store from branch order records
          </p>
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
                      <div style={{
                        background: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: "10px 14px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}>
                        <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 13 }}>{label}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
                          Orders: {payload[0]?.value}
                        </p>
                        {payload[0]?.payload?.revenue > 0 && (
                          <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
                            Revenue: {formatMoney(payload[0].payload.revenue)}
                          </p>
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
              <p style={{ fontSize: 13, color: "#9ca3af" }}>
                {storesLoading ? "Loading..." : "No store order data available"}
              </p>
            </div>
          )}
        </div>

        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24,
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1a1d23" }}>
            Store Status
          </p>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7280" }}>
            By backend store status
          </p>
          {storeStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={storeStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {storeStatusData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color || ROLE_COLORS[index % ROLE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
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
              <p style={{ fontSize: 13, color: "#9ca3af" }}>
                {storesLoading ? "Loading..." : "No store data"}
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24,
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1a1d23" }}>
            Users by Role
          </p>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7280" }}>
            From backend user accounts
          </p>
          {userRoleData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {userRoleData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
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
              <p style={{ fontSize: 13, color: "#9ca3af" }}>
                {usersLoading ? "Loading..." : "No user data"}
              </p>
            </div>
          )}
        </div>

        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24,
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1a1d23" }}>
            Registered Stores
          </p>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7280" }}>
            Store records returned by the backend
          </p>
          {storesLoading ? (
            <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>
              Loading...
            </p>
          ) : stores?.length > 0 ? (
            <div style={{ overflow: "auto", maxHeight: 280 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    {["Store", "Admin", "Status", "Branches"].map((header) => (
                      <th key={header} style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store, index) => {
                    const storeId = String(getStoreId(store) || "");
                    const status = (store.status || "active").toLowerCase();
                    return (
                      <tr key={storeId || index} style={{ borderBottom: "1px solid #f9fafb" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1a1d23" }}>
                          {getStoreName(store)}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#6b7280" }}>
                          {store.storeAdmin?.fullName || store.ownerName || store.fullName || "-"}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 600,
                            background: status === "active" ? "#f0fdf4" : status === "suspended" ? "#fef2f2" : "#f9fafb",
                            color: status === "active" ? "#166534" : status === "suspended" ? "#991b1b" : "#6b7280",
                          }}>
                            {status}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", color: "#6b7280" }}>
                          {storeMetrics[storeId]?.branchCount ?? getCollection(store.branches).length}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>
              No stores registered yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
