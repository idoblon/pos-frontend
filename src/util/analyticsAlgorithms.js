// ============================================================
// POS Analytics Algorithms — read later by ALGORITHM NAME
// File: src/util/analyticsAlgorithms.js
// ============================================================
import { meanStd } from "./orderAlgorithms";

// ------------------------------------------------------------
// ALGORITHM NAME: Time-Series Group-By Aggregation
// USE: Buckets orders by day -> [{date, revenue, count}]. Basis for
// trend charts + forecasts in StoreDashboard/BranchReports.
// ------------------------------------------------------------
export function groupByDay(orders = [], days = 30, nowMs = Date.now()) {
  const span = Math.max(1, Math.floor(Number(days) || 30));
  // Bucket key: UTC day. Order dates are normalized the same way so both
  // sides always agree (raw string slicing mis-buckets non-ISO timestamps).
  const dayKey = (value) => {
    const t = new Date(value).getTime();
    if (Number.isFinite(t)) return new Date(t).toISOString().slice(0, 10);
    return String(value || "").slice(0, 10);
  };
  const out = [];
  for (let i = span - 1; i >= 0; i--) {
    const d = new Date(nowMs - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const dayOrders = (orders || []).filter((o) => dayKey(o.createdAt) === key);
    out.push({
      date: key,
      revenue: dayOrders.reduce((s, o) => s + (Number(o.totalAmount ?? o.total ?? 0) || 0), 0),
      count: dayOrders.length,
    });
  }
  return out;
}

// ------------------------------------------------------------
// ALGORITHM NAME: Z-Score Sales Anomaly Flag (per day)
// USE: Flags revenue spikes/dips vs trailing mean. Reuses meanStd.
// ------------------------------------------------------------
export function flagSalesAnomalies(daily = [], threshold = 2.5) {
  const vals = daily.map((d) => d.revenue);
  const { mean, std } = meanStd(vals);
  if (!std) return daily.map((d) => ({ ...d, anomaly: false, z: 0 }));
  return daily.map((d) => {
    const z = (d.revenue - mean) / std;
    return { ...d, z: Number(z.toFixed(2)), anomaly: Math.abs(z) >= threshold };
  });
}
