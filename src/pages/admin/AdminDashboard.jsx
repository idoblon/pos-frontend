import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Store, Users, ShoppingCart, DollarSign,
  TrendingUp, Building2, UserCheck, BarChart3, FileText, CreditCard
} from "lucide-react";
import { getAllStores } from "@/Redux Toolkit/Features/Store/storeThunk";
import { getAllUsers } from "@/Redux Toolkit/Features/user/userThunk";

const ROLE_COLORS = ["#1a1d23", "#3d3d3d", "#6b6b6b", "#9e9e9e"];

function StatCard({ title, value, subtitle, icon: Icon, loading }) {
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
      gap: 16
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
          letterSpacing: "-1px"
        }}>
          {loading ? "—" : value}
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
        flexShrink: 0
      }}>
        <Icon size={22} color="white" />
      </div>
    </div>
  );
}

function QuickAction({ title, description, icon: Icon, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "18px 20px",
        cursor: "pointer",
        transition: "box-shadow 0.2s ease",
        display: "flex",
        alignItems: "center",
        gap: 14
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: "#1a1d23",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }}>
        <Icon size={19} color="white" />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1a1d23" }}>
          {title}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { stores, loading: storesLoading } = useSelector((s) => s.store);
  const { users, loading: usersLoading } = useSelector((s) => s.user);

  useEffect(() => {
    dispatch(getAllStores());
    dispatch(getAllUsers());
  }, [dispatch]);

  // --- Derived metrics from real data ---
  const totalStores = stores?.length || 0;
  const activeStores = stores?.filter(s =>
    (s.status || "").toLowerCase() === "active"
  ).length || 0;

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(u =>
    (u.status || "").toLowerCase() === "active" || !u.status
  ).length || 0;

  // Revenue: sum from stores if available
  const totalRevenue = useMemo(() =>
    (stores || []).reduce((sum, s) => sum + (s.totalRevenue || s.monthlyRevenue || 0), 0),
    [stores]
  );

  // Orders: sum from stores if available
  const totalOrders = useMemo(() =>
    (stores || []).reduce((sum, s) => sum + (s.totalOrders || 0), 0),
    [stores]
  );

  // --- Store performance chart ---
  const storePerformanceData = useMemo(() =>
    (stores || [])
      .filter(s => s.brand || s.name)
      .map(s => ({
        name: (s.brand || s.name || "Store").slice(0, 12),
        orders: s.totalOrders || s.branches?.reduce((a, b) => a + (b.totalOrders || 0), 0) || 0,
        revenue: s.totalRevenue || s.monthlyRevenue || 0,
      }))
      .slice(0, 6),
    [stores]
  );

  // --- Store status distribution ---
  const storeStatusData = useMemo(() => {
    const active = stores?.filter(s => (s.status || "").toLowerCase() === "active").length || 0;
    const inactive = stores?.filter(s => (s.status || "").toLowerCase() === "inactive").length || 0;
    const suspended = stores?.filter(s => (s.status || "").toLowerCase() === "suspended").length || 0;
    const pending = stores?.filter(s => (s.status || "").toLowerCase() === "pending").length || 0;
    return [
      { name: "Active", value: active, color: "#1a1d23" },
      { name: "Inactive", value: inactive, color: "#6b7280" },
      { name: "Suspended", value: suspended, color: "#374151" },
      { name: "Pending", value: pending, color: "#9ca3af" },
    ].filter(d => d.value > 0);
  }, [stores]);

  // --- User role distribution ---
  const userRoleData = useMemo(() => {
    const roleMap = {};
    (users || []).forEach(u => {
      const role = u.role || "UNKNOWN";
      const label = role === "ROLE_ADMIN" ? "Admin"
        : role === "ROLE_STORE_ADMIN" ? "Store Admin"
        : role === "ROLE_BRANCH_MANAGER" ? "Branch Mgr"
        : role === "ROLE_BRANCH_CASHIER" ? "Cashier"
        : "Other";
      roleMap[label] = (roleMap[label] || 0) + 1;
    });
    return Object.entries(roleMap).map(([name, value], i) => ({
      name, value, color: ROLE_COLORS[i % ROLE_COLORS.length]
    }));
  }, [users]);

  const loading = storesLoading || usersLoading;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 24,
      fontFamily: "'DM Sans','Inter',sans-serif"
    }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1d23", letterSpacing: "-0.3px" }}>
          System Dashboard
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
          Live overview of your entire POS network
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16
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
          value={totalOrders > 0 ? totalOrders.toLocaleString() : "—"}
          subtitle="Across all branches"
          icon={ShoppingCart}
          loading={storesLoading}
        />
        <StatCard
          title="Total Revenue"
          value={totalRevenue > 0 ? `रु ${totalRevenue.toLocaleString("en-IN")}` : "—"}
          subtitle="Across all stores"
          icon={DollarSign}
          loading={storesLoading}
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>

        {/* Store Performance Bar Chart */}
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1a1d23" }}>
            Store Performance
          </p>
          <p style={{ margin: "0 0 20px", fontSize: 12, color: "#6b7280" }}>
            Orders per store
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
                        background: "white", border: "1px solid #e5e7eb",
                        borderRadius: 8, padding: "10px 14px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                      }}>
                        <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 13 }}>{label}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
                          Orders: {payload[0]?.value}
                        </p>
                        {payload[0]?.payload?.revenue > 0 && (
                          <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
                            Revenue: रु {payload[0].payload.revenue.toLocaleString("en-IN")}
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
                {storesLoading ? "Loading..." : "No store data available"}
              </p>
            </div>
          )}
        </div>

        {/* Store Status Donut */}
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1a1d23" }}>
            Store Status
          </p>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7280" }}>
            By current status
          </p>
          {storeStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={storeStatusData}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70}
                    paddingAngle={2} dataKey="value"
                  >
                    {storeStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {storeStatusData.map((entry) => (
                  <div key={entry.name} style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between"
                  }}>
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

      {/* User Role Distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        {/* Donut */}
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1a1d23" }}>
            Users by Role
          </p>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7280" }}>
            Role distribution
          </p>
          {userRoleData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%" cy="50%"
                    innerRadius={40} outerRadius={65}
                    paddingAngle={2} dataKey="value"
                  >
                    {userRoleData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {userRoleData.map((entry) => (
                  <div key={entry.name} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                  }}>
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

        {/* Store list table */}
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1a1d23" }}>
            Registered Stores
          </p>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7280" }}>
            All stores in the system
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
                    {["Store", "Admin", "Status", "Branches"].map(h => (
                      <th key={h} style={{
                        padding: "8px 12px", textAlign: "left",
                        fontSize: 11, fontWeight: 600, color: "#6b7280",
                        textTransform: "uppercase", letterSpacing: "0.05em"
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stores.map((s, i) => {
                    const status = (s.status || "active").toLowerCase();
                    return (
                      <tr key={s._id || i} style={{ borderBottom: "1px solid #f9fafb" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1a1d23" }}>
                          {s.brand || s.name || "—"}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#6b7280" }}>
                          {s.storeAdmin?.fullName || s.ownerName || "—"}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 600,
                            background: status === "active" ? "#f0fdf4" : status === "suspended" ? "#fef2f2" : "#f9fafb",
                            color: status === "active" ? "#166534" : status === "suspended" ? "#991b1b" : "#6b7280"
                          }}>
                            {status}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", color: "#6b7280" }}>
                          {s.branches?.length ?? "—"}
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

      {/* Quick Actions */}
      <div>
        <p style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#1a1d23" }}>
          Quick Actions
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12
        }}>
          <QuickAction
            title="Registration Requests"
            description="Review pending store signups"
            icon={FileText}
            onClick={() => navigate("/admin/registration-requests")}
          />
          <QuickAction
            title="Manage Stores"
            description="Add, edit or remove stores"
            icon={Building2}
            onClick={() => navigate("/admin/stores")}
          />
          <QuickAction
            title="Subscriptions"
            description="Monitor store subscriptions"
            icon={CreditCard}
            onClick={() => navigate("/admin/subscriptions")}
          />
          <QuickAction
            title="User Management"
            description="Manage accounts and roles"
            icon={UserCheck}
            onClick={() => navigate("/admin/users")}
          />
          <QuickAction
            title="System Reports"
            description="View analytics and reports"
            icon={BarChart3}
            onClick={() => navigate("/admin/reports")}
          />
        </div>
      </div>
    </div>
  );
}
