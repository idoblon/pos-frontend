// ============================================================
// POS Customer Algorithms — read later by ALGORITHM NAME
// File: src/util/customerAlgorithms.js
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: Piecewise-Linear RFM Calibration (continuous 1..5)
// USE: Maps raw R/F/M onto 1..5 by LINEAR INTERPOLATION between anchor
// points — not a stepped if/else ladder. Same anchors as the old buckets,
// but a customer at 29 days no longer scores a full point below 30 days.
// quadrants: value below first anchor clamps, above last clamps.
// ------------------------------------------------------------
const R_ANCHORS = [
  [0, 5],
  [7, 5],
  [30, 4],
  [90, 3],
  [180, 2],
  [365, 1],
];
const F_ANCHORS = [
  [0, 1],
  [1, 1],
  [2, 2],
  [5, 3],
  [10, 4],
  [20, 5],
];
const M_ANCHORS = [
  [0, 1],
  [1000, 2],
  [5000, 3],
  [20000, 4],
  [50000, 5],
];

function interpScore(value, anchors) {
  const v = Number(value);
  if (!Number.isFinite(v)) return 1;
  if (v <= anchors[0][0]) return anchors[0][1];
  for (let i = 1; i < anchors.length; i++) {
    const [x1, y1] = anchors[i];
    if (v <= x1) {
      const [x0, y0] = anchors[i - 1];
      const t = (v - x0) / (x1 - x0 || 1);
      return y0 + t * (y1 - y0);
    }
  }
  return anchors[anchors.length - 1][1];
}

function quintileScore(value, population, { reverse = false } = {}) {
  const nums = (population || []).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!nums.length) return null;
  const n = nums.length;
  let le = 0;
  for (const x of nums) {
    if (x <= value) le++;
    else break;
  }
  let score = Math.min(5, Math.max(1, Math.ceil((le / n) * 5)));
  if (reverse) score = 6 - score;
  return Math.min(5, Math.max(1, score));
}

// ------------------------------------------------------------
// ALGORITHM NAME: Nearest-Centroid RFM Labeling (11 segments)
// USE: Each segment is a centroid in (r,f,m) space; the label is the
// argmin Euclidean distance — one distance computation, no overlapping
// if/else rule chain whose order decides the answer (the old AtRisk bug).
// ------------------------------------------------------------
const SEGMENT_CENTROIDS = [
  { label: "Champion", c: [5, 5, 5] },
  { label: "Loyal", c: [3.5, 4, 4] },
  { label: "Potential Loyalist", c: [4, 2, 3.5] },
  { label: "New", c: [5, 1, 2] },
  { label: "Promising", c: [4, 1.5, 2] },
  { label: "Need Attention", c: [3, 3, 3] },
  { label: "About to Sleep", c: [3, 1.5, 2] },
  { label: "AtRisk", c: [1.5, 4, 3.5] },
  { label: "Can't Lose Them", c: [1.5, 4.5, 5] },
  { label: "Hibernating", c: [1.5, 1.5, 1.5] },
  { label: "Lost", c: [1, 1, 1] },
];

function nearestSegment(r, f, m) {
  let best = SEGMENT_CENTROIDS[0].label;
  let bestD = Infinity;
  for (const { label, c } of SEGMENT_CENTROIDS) {
    const d = (r - c[0]) ** 2 + (f - c[1]) ** 2 + (m - c[2]) ** 2;
    if (d < bestD) {
      bestD = d;
      best = label;
    }
  }
  return best;
}

// ------------------------------------------------------------
// ALGORITHM NAME: RFM Segmentation (Recency/Frequency/Monetary)
// MODES: (a) calibration-interpolation (default, store-portable);
// (b) quintile rank when populations.* supplied (fully data-driven).
// ------------------------------------------------------------
export function rfmSegment({
  daysSinceLast = 999,
  orderCount = 0,
  totalSpent = 0,
  populations = null,
}) {
  let r, f, m;
  if (populations && (populations.recencies?.length || populations.frequencies?.length || populations.monetaries?.length)) {
    r = quintileScore(Number(daysSinceLast), populations.recencies, { reverse: true }) ?? Math.round(interpScore(daysSinceLast, R_ANCHORS));
    f = quintileScore(Number(orderCount), populations.frequencies) ?? Math.round(interpScore(orderCount, F_ANCHORS));
    m = quintileScore(Number(totalSpent), populations.monetaries) ?? Math.round(interpScore(totalSpent, M_ANCHORS));
  } else {
    r = interpScore(daysSinceLast, R_ANCHORS);
    f = interpScore(orderCount, F_ANCHORS);
    m = interpScore(totalSpent, M_ANCHORS);
  }
  const ri = Math.min(5, Math.max(1, Math.round(r)));
  const fi = Math.min(5, Math.max(1, Math.round(f)));
  const mi = Math.min(5, Math.max(1, Math.round(m)));
  return { r: ri, f: fi, m: mi, score: ri * 100 + fi * 10 + mi, segment: nearestSegment(ri, fi, mi) };
}

// ------------------------------------------------------------
// ALGORITHM NAME: CLV Prediction (AOV x Frequency x Margin, discounted)
// USE: CLV = margin * AOV * freq_per_month * retention_factor, where
// retention_factor = sum_{t=1..horizon} (retention/(1+discount))^t.
// DEFAULTS (retention=1, discount=0, margin=1, horizon=12) collapse exactly
// to the old AOV*freq*12, so old callers/tests are unaffected.
// ------------------------------------------------------------
export function predictCLV({
  totalSpent = 0,
  orderCount = 0,
  monthsActive = 1,
  margin = 1,
  retentionRate = 1,
  discountRate = 0,
  horizonMonths = 12,
}) {
  const aov = orderCount > 0 ? Number(totalSpent) / orderCount : 0;
  const freq = orderCount / Math.max(1, Number(monthsActive) || 1);
  const mg = Math.min(1, Math.max(0, Number(margin) || 0));
  const rr = Math.min(1, Math.max(0, Number(retentionRate)));
  const dr = Math.max(0, Number(discountRate) || 0);
  const h = Math.max(1, Math.floor(Number(horizonMonths) || 12));
  if (rr >= 1 && dr <= 0) return Math.round(aov * freq * h * mg);
  const k = rr / (1 + dr / 12);
  if (k >= 1) return Math.round(aov * freq * h * mg);
  const factor = (k * (1 - k ** h)) / (1 - k);
  return Math.round(aov * freq * factor * mg);
}
