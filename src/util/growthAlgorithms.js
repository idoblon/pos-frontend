// ============================================================
// POS Subscription + List Algorithms — read later by ALGORITHM NAME
// File: src/util/growthAlgorithms.js
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: Plan Upsell Recommender (Threshold Rule)
// USE: If usage >= 80% of plan limits, recommend next tier.
// INPUT: usage {branches, users, storageGB}, plans ordered BASIC<PRO<ENTERPRISE>.
// ------------------------------------------------------------
const ORDER = ["BASIC", "PROFESSIONAL", "ENTERPRISE"];
// Stored plan values sometimes use the short "PRO" alias.
const normalizePlan = (plan) => {
  const upper = String(plan || "").toUpperCase();
  if (upper === "PRO") return "PROFESSIONAL";
  return upper;
};
export function recommendUpsell({ currentPlan, usage = {}, limitsByPlan = {} }) {
  const plan = normalizePlan(currentPlan);
  const i = ORDER.indexOf(plan);
  if (i < 0 || i === ORDER.length - 1) return null;
  const lim = limitsByPlan[currentPlan] || limitsByPlan[plan] || {};
  const hot = ["branches", "users", "storageGB"].some((k) => {
    const l = Number(lim[k]) || 0;
    if (!l) return false;
    return (Number(usage[k]) || 0) / l >= 0.8;
  });
  return hot ? ORDER[i + 1] : null;
}

// ------------------------------------------------------------
// ALGORITHM NAME: MRR Churn Forecast (Moving Average)
// USE: Next-month revenue = mean(last N months MRR).
// ------------------------------------------------------------
export function forecastMRR({ mrrHistory = [], window = 3 }) {
  if (!mrrHistory.length) return 0;
  const w = Math.max(1, Math.floor(Number(window) || 3));
  const n = Math.min(w, mrrHistory.length);
  const s = mrrHistory.slice(-n).reduce((a, v) => a + (Number(v) || 0), 0);
  return Math.round(s / n);
}

// ------------------------------------------------------------
// ALGORITHM NAME: Paginate + Clamp (Server-list helper)
// USE: totalPages = ceil(n/size); clamp(page) into [1,totalPages].
// WORLDWIDE USE: UserManagement/AuditLog/StoreManagement lists.
// ------------------------------------------------------------
export function paginate({ total = 0, page = 1, size = 20 }) {
  const s = Math.max(1, Number(size) || 20);
  const totalPages = Math.max(1, Math.ceil(Number(total) / s));
  const p = Math.min(totalPages, Math.max(1, Number(page) || 1));
  return { page: p, size: s, totalPages, offset: (p - 1) * s };
}
