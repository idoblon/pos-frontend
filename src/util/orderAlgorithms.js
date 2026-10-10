// ============================================================
// POS Order Algorithms — read later by ALGORITHM NAME
// File: src/util/orderAlgorithms.js
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: Priority Queue Score (logistic SLA urgency + log value)
// USE: score = wAge * urgency(age) + wValue * valueNorm, where
// urgency(age) = age/sla capped + logistic breach curve 1/(1+e^-(age-sla)/5)
// so priority rises SMOOTHLY through the SLA instead of jumping +0.5 at it.
// Status is a weight MAP (table-driven), not an if/else chain.
// WORLDWIDE USE: kitchen display + hold resume.
// BACKWARD COMPAT: default weights reproduce old oldest-first ordering for
// equal-value tickets.
// ------------------------------------------------------------
const LOG_CAP = Math.log1p(50000);
const STATUS_WEIGHT = {
  PENDING: 0,
  PREPARING: 0.05,
  READY: 0.1,
  URGENT: 0.3,
  VIP: 0.3,
  COMPLETED: -1,
  CANCELLED: -1,
};

export function orderPriorityScore({
  createdAt,
  totalAmount = 0,
  nowMs = Date.now(),
  slaMinutes = 30,
  weights = { age: 0.6, value: 0.4 },
  status = "PENDING",
}) {
  const t = new Date(createdAt).getTime();
  const ageMin = Number.isFinite(t) ? Math.max(0, (nowMs - t) / 60000) : 0;
  const sla = Math.max(1, Number(slaMinutes) || 30);
  // Logistic breach curve: ~0 well before SLA, 0.5 at SLA, ~1 well after.
  const breach = 1 / (1 + Math.exp(-(ageMin - sla) / Math.max(1, sla / 6)));
  const ageNorm = Math.min(1.2, ageMin / sla) * (1 - breach * 0.3) + breach * 0.8;
  // valueNorm: log-scaled so Rs.1k vs Rs.2k matters, Rs.50k vs Rs.100k barely does.
  const valueNorm = Math.min(1, Math.log1p(Math.max(0, Number(totalAmount) || 0)) / LOG_CAP);
  const wAge = Number(weights?.age ?? 0.6);
  const wValue = Number(weights?.value ?? 0.4);
  const statusBoost = STATUS_WEIGHT[String(status || "PENDING").toUpperCase()] ?? 0;
  return wAge * ageNorm + wValue * valueNorm + statusBoost;
}

export function sortByPriority(orders = [], nowMs = Date.now(), options = {}) {
  return [...orders]
    .map((o, index) => ({
      o,
      index, // stable tiebreak: original position wins
      s: orderPriorityScore({
        createdAt: o.createdAt,
        totalAmount: o.totalAmount ?? o.total ?? 0,
        nowMs,
        slaMinutes: options.slaMinutes,
        weights: options.weights,
        status: o.status || o.priority,
      }),
    }))
    .sort((a, b) => b.s - a.s || a.index - b.index) // ALGORITHM: Descending Sort (stable)
    .map((r) => r.o);
}

// ------------------------------------------------------------
// ALGORITHM NAME: Robust Descriptive Stats (mean/std + median/MAD)
// USE: mean/std are outlier-fragile (one Rs.10k refund moves the mean).
// median/MAD power the anomaly detector below.
// ------------------------------------------------------------
export function median(values = []) {
  const nums = (values || []).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  const n = nums.length;
  if (!n) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

export function mad(values = [], med = null) {
  const nums = (values || []).map(Number).filter(Number.isFinite);
  if (!nums.length) return 0;
  const m = med ?? median(nums);
  return median(nums.map((v) => Math.abs(v - m)));
}

export function meanStd(values = []) {
  // Coerce + drop non-numeric entries: without this, one string revenue
  // poisons the sum (concatenation) and every downstream z-score is NaN.
  const nums = (values || []).map(Number).filter(Number.isFinite);
  const n = nums.length;
  if (!n) return { mean: 0, std: 0, count: 0 };
  const mean = nums.reduce((a, v) => a + v, 0) / n;
  const variance = nums.reduce((a, v) => a + (v - mean) ** 2, 0) / n;
  return { mean, std: Math.sqrt(variance), count: n, median: median(nums), mad: mad(nums, median(nums)) };
}

export function zScore(value, values = []) {
  const { mean, std } = meanStd(values);
  if (!std) return 0;
  return (Number(value) - mean) / std;
}

// ------------------------------------------------------------
// ALGORITHM NAME: Modified Z-Score (MAD-based Anomaly Detection)
// USE: robustZ = 0.6745 * (x - median) / MAD. Immune to the outlier
// inflating its own std (which is why plain z-scores miss fraud clusters).
// THRESHOLD: 3.5 (Iglewicz & Hoaglin). Falls back to classic z when MAD=0.
// ------------------------------------------------------------
export function robustZScore(value, values = []) {
  const nums = (values || []).map(Number).filter(Number.isFinite);
  if (!nums.length) return 0;
  const med = median(nums);
  const m = mad(nums, med);
  if (!m) return zScore(value, values); // constant history -> classic path
  return (0.6745 * (Number(value) - med)) / m;
}

export function isAnomaly(value, values = [], threshold = 3) {
  // Dual detector: classic z OR robust z. Either firing = anomaly.
  // Backward compatible: old spike cases still return true.
  const z = Math.abs(zScore(value, values));
  const rz = Math.abs(robustZScore(value, values));
  const robustThreshold = threshold <= 3 ? 3.5 : threshold;
  return z >= threshold || rz >= robustThreshold;
}
