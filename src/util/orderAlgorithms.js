// ============================================================
// POS Order Algorithms — read later by ALGORITHM NAME
// File: src/util/orderAlgorithms.js
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: Priority Queue Score (Age x Value)
// USE: Sorts held/kitchen orders: score = ageMin*0.6 + valueRank*0.4.
// Higher = serve first. WORLDWIDE USE: kitchen display + hold resume.
// ------------------------------------------------------------
export function orderPriorityScore({ createdAt, totalAmount = 0, nowMs = Date.now() }) {
  // Guard: missing/invalid dates score by value only (no NaN ordering).
  // Value contribution is capped so huge tickets can't swamp waiting time.
  const t = new Date(createdAt).getTime();
  const ageMin = Number.isFinite(t) ? Math.max(0, (nowMs - t) / 60000) : 0;
  const valueRank = Math.min((Number(totalAmount) || 0) / 1000, 50);
  return ageMin * 0.6 + valueRank * 0.4;
}

export function sortByPriority(orders = [], nowMs = Date.now()) {
  return [...orders]
    .map((o) => ({ o, s: orderPriorityScore({ createdAt: o.createdAt, totalAmount: o.totalAmount ?? o.total ?? 0, nowMs }) }))
    .sort((a, b) => b.s - a.s) // ALGORITHM: Descending Sort
    .map((r) => r.o);
}

// ------------------------------------------------------------
// ALGORITHM NAME: Z-Score Anomaly Detection (Fraud / Spike Flag)
// USE: z = (x - mean)/std. |z| >= 3 = anomaly (refund abuse, void spike).
// ------------------------------------------------------------
export function meanStd(values = []) {
  // Coerce + drop non-numeric entries: without this, one string revenue
  // poisons the sum (concatenation) and every downstream z-score is NaN.
  const nums = (values || []).map(Number).filter(Number.isFinite);
  const n = nums.length;
  if (!n) return { mean: 0, std: 0 };
  const mean = nums.reduce((a, v) => a + v, 0) / n;
  const variance = nums.reduce((a, v) => a + (v - mean) ** 2, 0) / n;
  return { mean, std: Math.sqrt(variance) };
}

export function zScore(value, values = []) {
  const { mean, std } = meanStd(values);
  if (!std) return 0;
  return (Number(value) - mean) / std;
}

export function isAnomaly(value, values = [], threshold = 3) {
  return Math.abs(zScore(value, values)) >= threshold;
}
