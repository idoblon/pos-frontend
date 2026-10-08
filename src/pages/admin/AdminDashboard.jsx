import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Store, Users, AlertTriangle } from "lucide-react";
import { getAllStores } from "@/Redux Toolkit/Features/Store/storeThunk";
import { getAllUsers } from "@/Redux Toolkit/Features/user/userThunk";
import subscriptionService from "@/services/subscriptionService";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { getSubscriptionExpiryDate } from "@/util/subscriptionUtils";
import { normalizeStoreType } from "@/util/storeTypes";

const ROLE_COLORS = ["#1a1d23", "#3d3d3d", "#6b6b6b", "#9e9e9e"];

// Unique platform identity, but strictly in SYSTEM colors:
// --chart-1..5 grayscale ramp + --primary near-black + --destructive for risk.
// (index.css: chart-1 #d4d4d4 → chart-5 #262626, primary #1a1d23.)
const TYPE_COLORS = {
  RETAIL: "#262626",
  WHOLESALE: "#525252",
  RESTAURANT: "#1a1d23",
  PHARMACY: "#404040",
  GROCERY: "#737373",
  ELECTRONICS: "#0a0a0a",
  PLANT: "#a3a3a3",
};
const typeColor = (t) => TYPE_COLORS[normalizeStoreType(t)] || "#9ca3af";
const storeTypeOf = (s) => normalizeStoreType(s?.storeType || s?.type) || "UNKNOWN";

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
function formatMoney(amount) { return `रु ${toNumber(amount).toLocaleString("en-IN")}`; }

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

  // Fetch branch/order metrics per store: 2 calls per store
  // (branches list + pre-aggregated analytics) instead of 1 + N branch order fetches.
  useEffect(() => {
    if (!realStores.length) return;
    let cancelled = false;
    const headers = getAuthHeaders();

    Promise.all(
      realStores.map(async (store) => {
        const storeId = getStoreId(store);
        try {
          const [branchRes, analyticsRes] = await Promise.all([
            api.get(`/api/branches/store/${storeId}`, { headers }),
            api.get(`/api/analytics/store/${storeId}`, { headers }),
          ]);
          const branches = getCollection(branchRes.data);
          const summary = analyticsRes.data || {};
          return [String(storeId), {
            branchCount: branches.length,
            orders: toNumber(summary.totalOrders),
            revenue: toNumber(summary.totalSales),
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
    () => realStores.filter((s) => String(s.status || "ACTIVE").toUpperCase() === "ACTIVE").length,
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
      const exp = getSubscriptionExpiryDate(s);
      return exp > now && exp <= limit;
    }).length;
  }, [realStores]);

  // Use backend stats if loaded, else fall back to realStores calculation
  const subscriptionRevenue = useMemo(() => {
    if (subscriptionStats?.totalRevenue > 0) return subscriptionStats.totalRevenue;
    // Fallback: sum plan prices from store data
    const PRICES = { BASIC: 75000, PROFESSIONAL: 135000, ENTERPRISE: 210000 };
    return realStores.reduce((sum, s) => sum + (PRICES[s.subscriptionPlan] || 0), 0);
  }, [subscriptionStats, realStores]);

  const hasReportedSubscriptionRevenue = toNumber(subscriptionStats?.totalRevenue) > 0;
  const subscriptionValueTitle = hasReportedSubscriptionRevenue
    ? "Subscription Revenue"
    : "Annual Plan Value";
  const subscriptionValueNote = hasReportedSubscriptionRevenue
    ? "Reported subscription revenue"
    : "Estimated from current store plans";

  const expiringCount = subscriptionStats?.expiringCount ?? expiringSubscriptions;

  // ── Chart data ────────────────────────────────────────────────────
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

  // ── Unique platform intelligence (client-side, no new APIs) ─────────────
  const platformGmv = useMemo(
    () => Object.values(storeMetrics).reduce((sum, m) => sum + toNumber(m.revenue), 0),
    [storeMetrics],
  );
  const platformOrders = useMemo(
    () => Object.values(storeMetrics).reduce((sum, m) => sum + toNumber(m.orders), 0),
    [storeMetrics],
  );
  const totalBranches = useMemo(
    () => Object.values(storeMetrics).reduce((sum, m) => sum + toNumber(m.branchCount), 0),
    [storeMetrics],
  );

  const typeMixData = useMemo(() => {
    const counts = {};
    realStores.forEach((s) => {
      const t = storeTypeOf(s);
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, color: typeColor(name) }))
      .sort((a, b) => b.value - a.value);
  }, [realStores]);

  const planMixData = useMemo(() => {
    const counts = {};
    realStores.forEach((s) => {
      const p = String(s.subscriptionPlan || "UNKNOWN").toUpperCase();
      counts[p] = (counts[p] || 0) + 1;
    });
    const colors = { BASIC: "#a3a3a3", PROFESSIONAL: "#525252", ENTERPRISE: "#1a1d23" };
    return Object.entries(counts).map(([name, value]) => ({
      name, value, color: colors[name] || "#9ca3af",
    }));
  }, [realStores]);

  const trialFunnel = useMemo(() => {
    const t = { TRIAL: 0, CONVERTED: 0, EXPIRED: 0 };
    realStores.forEach((s) => {
      const k = String(s.trialStatus || s.trial_status || "NONE").toUpperCase();
      if (t[k] !== undefined) t[k] += 1;
    });
    const total = t.TRIAL + t.CONVERTED + t.EXPIRED;
    return { ...t, total, conversion: total ? Math.round((t.CONVERTED / total) * 100) : 0 };
  }, [realStores]);

  const leaderboard = useMemo(() =>
    realStores
      .map((s) => {
        const sid = String(getStoreId(s) || "");
        const m = storeMetrics[sid] || {};
        return { store: s, revenue: toNumber(m.revenue), orders: toNumber(m.orders) };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    [realStores, storeMetrics],
  );

  const riskQueue = useMemo(() => {
    const now = new Date();
    const out = [];
    realStores.forEach((s) => {
      const status = String(s.status || "").toUpperCase();
      const trial = String(s.trialStatus || s.trial_status || "").toUpperCase();
      const exp = getSubscriptionExpiryDate(s);
      if (status === "SUSPENDED") out.push({ store: s, reason: "Suspended", tone: "#991b1b", bg: "#fef2f2" });
      else if (trial === "EXPIRED") out.push({ store: s, reason: "Trial expired", tone: "#991b1b", bg: "#fef2f2" });
      else if (exp > now && exp <= new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000))
        out.push({ store: s, reason: `Plan ends ${exp.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`, tone: "#404040", bg: "#f5f5f5" });
      else if (status === "INACTIVE" || status === "PENDING" || status === "PAYMENT_PENDING")
        out.push({ store: s, reason: status.replace("_", " "), tone: "#6b7280", bg: "#f9fafb" });
    });
    return out.slice(0, 6);
  }, [realStores]);

  return (
    <div style={{
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 24,
      background: "#f5f5f5",
      minHeight: "100%",
      fontFamily: "'DM Sans','Inter',sans-serif",
      color: "#1a1d23",
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a1d23" }} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: "#6b7280" }}>SYSTEM DASHBOARD · LIVE</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1d23", letterSpacing: "-0.3px" }}>
            Network overview
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
            {totalStores} stores · {totalBranches} branches · every vertical, plan and trial in one glance
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {typeMixData.map((t) => (
            <span key={t.name} style={{
              fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20,
              background: "white", border: "1px solid #e5e7eb", color: "#1a1d23",
            }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: t.color, marginRight: 6 }} />
              {t.name} · {t.value}
            </span>
          ))}
        </div>
      </div>

      {/* Platform strip */}
      <div style={{
        background: "white", border: "1px solid #e5e7eb", borderRadius: 12,
        display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
      }}>
        {[
          { label: "Platform GMV", value: formatMoney(platformGmv) },
          { label: "Platform orders", value: platformOrders.toLocaleString("en-IN") },
          { label: "Active stores", value: `${activeStores}/${totalStores}` },
          { label: "Trial conversion", value: `${trialFunnel.conversion}%` },
        ].map((k, i) => (
          <div key={k.label} style={{
            padding: "16px 20px",
            borderLeft: i === 0 ? "none" : "1px solid #f3f4f6",
          }}>
            <p style={{ margin: 0, fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: "#1a1d23", letterSpacing: "-0.5px" }}>
              {statsLoading ? "—" : k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Network by vertical */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Stores by vertical</p>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7280" }}>One system shade per type</p>
          {typeMixData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={typeMixData} cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={3} dataKey="value">
                    {typeMixData.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {typeMixData.map((e) => (
                  <span key={e.name} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#f8fafc", border: "1px solid #e5e7eb", color: "#1a1d23" }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: e.color, marginRight: 6 }} />
                    {e.name} · {e.value}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>{storesLoading ? "Loading..." : "No stores yet"}</p>
          )}
        </div>

        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Trial funnel</p>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7280" }}>{trialFunnel.conversion}% convert to paid</p>
          {[["Active trials", trialFunnel.TRIAL, "#737373"], ["Converted", trialFunnel.CONVERTED, "#1a1d23"], ["Expired", trialFunnel.EXPIRED, "#dc2626"]].map(([label, v, color]) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: "#4b5563", fontWeight: 600 }}>{label}</span>
                <span style={{ fontWeight: 800 }}>{v}</span>
              </div>
              <div style={{ height: 8, borderRadius: 8, background: "#f3f4f6" }}>
                <div style={{ width: trialFunnel.total ? `${Math.round((v / trialFunnel.total) * 100)}%` : "0%", height: "100%", borderRadius: 8, background: color }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#4b5563" }}>
            Plan mix: {planMixData.map((p) => `${p.name} ${p.value}`).join(" · ") || "—"}
          </div>
        </div>

        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Action queue</p>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7280" }}>{riskQueue.length} stores need attention</p>
          {riskQueue.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflow: "auto" }}>
              {riskQueue.map(({ store, reason, tone, bg }) => (
                <div key={String(getStoreId(store))} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: typeColor(storeTypeOf(store)), flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getStoreName(store)}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 10px", borderRadius: 20, background: bg, color: tone, whiteSpace: "nowrap" }}>{reason}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#1a1d23", fontWeight: 700, textAlign: "center", padding: "40px 0" }}>All clear — nothing at risk</p>
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
          value={expiringCount}
          subtitle="Expiring in next 60 days"
          icon={AlertTriangle}
          loading={statsLoading}
        />
        <StatCard
          title={subscriptionValueTitle}
          value={formatMoney(subscriptionRevenue)}
          subtitle={subscriptionValueNote}
          icon={() => <span style={{ fontSize: 20, fontWeight: 700, color: "white" }}>रु</span>}
          loading={statsLoading}
        />
      </div>

      {/* Rankings + Status */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1a1d23" }}>Top stores by revenue</p>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7280" }}>Badge shows each store's vertical</p>
          {leaderboard.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {leaderboard.map(({ store, revenue, orders }, i) => {
                const t = storeTypeOf(store);
                const max = leaderboard[0]?.revenue || 1;
                return (
                  <div key={String(getStoreId(store)) || i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 800, color: "white", background: i === 0 ? "#1a1d23" : "#6b7280",
                    }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getStoreName(store)}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: "#f5f5f5", color: "#404040", border: "1px solid #e5e7eb" }}>{t}</span>
                      </div>
                      <div style={{ marginTop: 6, height: 6, borderRadius: 6, background: "#f3f4f6" }}>
                        <div style={{ width: `${Math.max(4, Math.round((revenue / max) * 100))}%`, height: "100%", borderRadius: 6, background: typeColor(t) }} />
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800 }}>{formatMoney(revenue)}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{orders} orders</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>{storesLoading ? "Loading..." : "No revenue data available"}</p>
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

      {/* Users + Directory */}
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
                    const trialStatus = String(store.trialStatus || store.trial_status || "NONE").toUpperCase();
                    const trialEndsAt = store.trialEndsAt || store.trial_ends_at;
                    const trialDaysLeft = trialEndsAt
                      ? Math.max(0, Math.ceil((new Date(trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)))
                      : null;
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
                          {trialStatus === "TRIAL" && (
                            <span title={trialEndsAt ? `Trial ends ${new Date(trialEndsAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}` : "Trial active"} style={{
                              marginLeft: 6, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                              background: "#f5f5f5", color: "#404040",
                            }}>
                              TRIAL{trialDaysLeft !== null ? ` · ${trialDaysLeft}d` : ""}
                            </span>
                          )}
                          {trialStatus === "EXPIRED" && (
                            <span style={{
                              marginLeft: 6, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                              background: "#fef2f2", color: "#991b1b",
                            }}>
                              TRIAL EXPIRED
                            </span>
                          )}
                          {trialStatus === "CONVERTED" && (
                            <span style={{
                              marginLeft: 6, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                              background: "#f5f5f5", color: "#6b7280",
                            }}>
                              TRIAL → PAID
                            </span>
                          )}
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
