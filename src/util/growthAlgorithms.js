// ============================================================
// POS Subscription + List Algorithms — read later by ALGORITHM NAME
// File: src/util/growthAlgorithms.js
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: Plan Upsell Recommender (Threshold + Burn-Rate Forecast)
// USE: Old code fired only at >=80% usage. UPGRADE: also forecasts
// days-to-breach from usageHistory burn rate, so "BASIC, 60% but adding a
// branch/week" warns early instead of the day it breaks.
// Returns the plan string (backward compatible). Use
// recommendUpsellDetailed for reasons + daysToBreach.
// INPUT: usage {branches, users, storageGB}, plans ordered BASIC<PRO<ENTERPRISE>.
// ------------------------------------------------------------
const ORDER = ["BASIC", "PROFESSIONAL", "ENTERPRISE"];
// Stored plan values sometimes use the short "PRO" alias.
const normalizePlan = (plan) => {
  const upper = String(plan || "").toUpperCase();
  if (upper === "PRO") return "PROFESSIONAL";
  return upper;
};

export function recommendUpsell({ currentPlan, usage = {}, limitsByPlan = {}, usageHistory = null }) {
  return recommendUpsellDetailed({ currentPlan, usage, limitsByPlan, usageHistory }).plan;
}

// ------------------------------------------------------------
// ALGORITHM NAME: Ordinary Least Squares slope (all-points burn rate)
// USE: slope over the full history — unlike first-to-last endpoints, every
// middle point counts. Closed form, O(n).
// ------------------------------------------------------------
export function olsSlope(values = []) {
  const nums = (values || []).map(Number).filter(Number.isFinite);
  const n = nums.length;
  if (n < 2) return 0;
  const meanX = (n - 1) / 2;
  const meanY = nums.reduce((a, v) => a + v, 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i++) {
    sxy += (i - meanX) * (nums[i] - meanY);
    sxx += (i - meanX) ** 2;
  }
  return sxx ? sxy / sxx : 0;
}

// ------------------------------------------------------------
// ALGORITHM NAME: Theil-Sen slope (outlier-robust trend)
// USE: median of all pairwise slopes — a single promo spike can't drag it.
// O(n^2), fine for n < ~200 (usage histories are tiny).
// ------------------------------------------------------------
export function theilSenSlope(values = []) {
  const nums = (values || []).map(Number).filter(Number.isFinite);
  const n = nums.length;
  if (n < 2) return 0;
  const slopes = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) slopes.push((nums[j] - nums[i]) / (j - i));
  }
  slopes.sort((a, b) => a - b);
  const mid = Math.floor(slopes.length / 2);
  return slopes.length % 2 ? slopes[mid] : (slopes[mid - 1] + slopes[mid]) / 2;
}

export function recommendUpsellDetailed({ currentPlan, usage = {}, limitsByPlan = {}, usageHistory = null }) {
  const plan = normalizePlan(currentPlan);
  const i = ORDER.indexOf(plan);
  if (i < 0 || i === ORDER.length - 1) return { plan: null, reasons: [], daysToBreach: null };
  const lim = limitsByPlan[currentPlan] || limitsByPlan[plan] || {};
  const reasons = [];
  let nearestBreach = null;
  for (const k of ["branches", "users", "storageGB"]) {
    const l = Number(lim[k]) || 0;
    if (!l) continue;
    const u = Number(usage[k]) || 0;
    const ratio = u / l;
    // ALGORITHM: OLS burn-rate projection — slope over ALL history points.
    let daysLeft = ratio >= 1 ? 0 : Infinity;
    const hist = usageHistory?.[k];
    if (Array.isArray(hist) && hist.length >= 2) {
      const burn = olsSlope(hist); // units/day
      if (burn > 0 && u < l) daysLeft = (l - u) / burn;
      else if (burn <= 0 && ratio < 1) daysLeft = Infinity;
    }
    // Continuous breach urgency (logistic around 80%): no hard 0.8 cliff —
    // a metric at 79% with fast burn still warns via daysLeft below.
    const urgency = 1 / (1 + Math.exp(-12 * (ratio - 0.8)));
    if (ratio >= 1) reasons.push(`${k} at limit (${u}/${l})`);
    else if (urgency >= 0.5) reasons.push(`${k} at ${Math.round(ratio * 100)}% of ${plan} limit`);
    else if (Number.isFinite(daysLeft) && daysLeft <= 30) {
      reasons.push(`${k} breaches in ~${Math.ceil(daysLeft)}d at current burn`);
    }
    if (Number.isFinite(daysLeft) && (nearestBreach === null || daysLeft < nearestBreach)) {
      nearestBreach = daysLeft;
    }
  }
  const hot = reasons.length > 0;
  return {
    plan: hot ? ORDER[i + 1] : null,
    reasons,
    daysToBreach: nearestBreach === Infinity ? null : nearestBreach === null ? null : Math.ceil(nearestBreach),
  };
}

// ------------------------------------------------------------
// ALGORITHM NAME: MRR Forecast (Holt Linear Trend, damped)
// USE: Old code returned mean(last N) — blind to growth/decline ([100,200,300]
// forecast 200 while actually growing +100/mo). UPGRADE: least-squares trend
// lightly damped (x0.8) so one spike doesn't catapult the forecast.
// Falls back to the mean when history < 3.
// ------------------------------------------------------------
export function forecastMRR({ mrrHistory = [], window = 3, damping = 0.8 }) {
  const nums = (mrrHistory || []).map(Number).filter(Number.isFinite);
  if (!nums.length) return 0;
  const w = Math.max(1, Math.floor(Number(window) || 3));
  const slice = nums.slice(-Math.min(w, nums.length));
  if (slice.length < 3) {
    return Math.round(slice.reduce((a, v) => a + v, 0) / slice.length);
  }
  // ALGORITHM: Least-Squares on the window -> next-point projection.
  // Next x = n (0-indexed): forecast = intercept + slope*n
  //   = meanY + slope*(n - meanX). Damped so spikes don't catapult it.
  const n = slice.length;
  const meanX = (n - 1) / 2;
  const meanY = slice.reduce((a, v) => a + v, 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i++) {
    sxy += (i - meanX) * (slice[i] - meanY);
    sxx += (i - meanX) ** 2;
  }
  const slope = sxx ? sxy / sxx : 0;
  const d = Math.min(1, Math.max(0, Number(damping) ?? 0.8));
  return Math.max(0, Math.round(meanY + d * slope * (n - meanX)));
}

// Simpler, numerically transparent form used above expanded for clarity:
// forecast = lastLevel + dampedSlope, where lastLevel ~= window mean path.
// (Kept as separate helper so dashboards can show the trend slope too.)
export function forecastMRRTrend({ mrrHistory = [], window = 3 } = {}) {
  const nums = (mrrHistory || []).map(Number).filter(Number.isFinite);
  if (nums.length < 2) return { forecast: nums[0] || 0, slope: 0 };
  const slice = nums.slice(-Math.max(2, Math.min(window || 3, nums.length)));
  const n = slice.length;
  const meanX = (n - 1) / 2;
  const meanY = slice.reduce((a, v) => a + v, 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i++) {
    sxy += (i - meanX) * (slice[i] - meanY);
    sxx += (i - meanX) ** 2;
  }
  const slope = sxx ? sxy / sxx : 0;
  return { forecast: Math.max(0, Math.round(meanY + slope * ((n - 1) / 2 + 1 - meanX))), slope: Number(slope.toFixed(2)) };
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
  return { page: p, size: s, totalPages, offset: (p - 1) * s, hasNext: p < totalPages, hasPrev: p > 1 };
}
