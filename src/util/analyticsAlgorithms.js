// ============================================================
// POS Analytics Algorithms — read later by ALGORITHM NAME
// File: src/util/analyticsAlgorithms.js
// ============================================================
import { meanStd, median, mad } from "./orderAlgorithms";

// ------------------------------------------------------------
// ALGORITHM NAME: Time-Series Group-By Aggregation (hash-bucket, O(n))
// USE: Buckets orders by day -> [{date, revenue, count}]. Basis for
// trend charts + forecasts in StoreDashboard/BranchReports.
// UPGRADE: single pass via Map (old code was O(days*n) filter loop).
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
  // ALGORITHM: Hash Aggregation — one pass over orders into day buckets.
  const buckets = new Map();
  for (const o of orders || []) {
    const key = dayKey(o.createdAt);
    if (!key) continue;
    const b = buckets.get(key) || { revenue: 0, count: 0 };
    b.revenue += Number(o.totalAmount ?? o.total ?? 0) || 0;
    b.count += 1;
    buckets.set(key, b);
  }
  const out = [];
  for (let i = span - 1; i >= 0; i--) {
    const d = new Date(nowMs - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const b = buckets.get(key);
    out.push({ date: key, revenue: b?.revenue || 0, count: b?.count || 0 });
  }
  return out;
}

// ------------------------------------------------------------
// ALGORITHM NAME: Robust Sales Anomaly Flag (MAD + trailing window)
// USE: Flags revenue spikes/dips. Classic mean/std lets one huge day drag
// the mean up and hide itself; MAD (median-based) does not.
// method 'mad' (default): modified z >= threshold. 'z': classic path.
// window: trailing N days for local context (0 = whole series).
// ------------------------------------------------------------
export function flagSalesAnomalies(daily = [], threshold = 2.5, { method = "mad", window = 0 } = {}) {
  if (!Array.isArray(daily) || daily.length === 0) return [];
  if (daily.length === 1) return daily.map((d) => ({ ...d, anomaly: false, z: 0 }));
  const th = Number(threshold) || 2.5;
  const w = Math.floor(Number(window) || 0);
  return daily.map((d, i) => {
    // Compare against the other observations, never against the point being
    // tested. A rolling window uses only preceding days to avoid leakage.
    const baseline = w > 0
      ? daily.slice(Math.max(0, i - w), i)
      : daily.filter((_, index) => index !== i);
    const scope = baseline.map((x) => x.revenue);
    if (scope.length < 2) return { ...d, z: 0, anomaly: false };
    let z = 0;
    if (method === "z") {
      const { mean, std } = meanStd(scope);
      z = std
        ? (d.revenue - mean) / std
        : d.revenue === mean ? 0 : Math.sign(d.revenue - mean) * (th + 1);
    } else {
      const med = median(scope);
      const m = mad(scope, med);
      z = m ? (0.6745 * (d.revenue - med)) / m : 0;
      if (!m) {
        // Flat history has no scale estimate. Any nonzero departure from
        // that baseline is therefore flagged instead of lost to 0/0.
        const { mean, std } = meanStd(scope);
        z = std
          ? (d.revenue - mean) / std
          : d.revenue === mean ? 0 : Math.sign(d.revenue - mean) * (th + 1);
      }
    }
    return { ...d, z: Number(z.toFixed(2)), anomaly: Math.abs(z) >= th };
  });
}

// ------------------------------------------------------------
// ALGORITHM NAME: Least-Squares Trend (slope/intercept/R^2)
// USE: Answers "are we growing?" with a number, not eyeballing a chart.
// Returns per-day slope, intercept, R-squared and direction.
// ------------------------------------------------------------
export function linearTrend(values = []) {
  const nums = (values || []).map(Number).filter(Number.isFinite);
  const n = nums.length;
  if (n < 2) return { slope: 0, intercept: nums[0] || 0, r2: 0, direction: "flat" };
  const xs = nums.map((_, i) => i);
  const meanX = xs.reduce((a, v) => a + v, 0) / n;
  const meanY = nums.reduce((a, v) => a + v, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - meanX) * (nums[i] - meanY);
    sxx += (xs[i] - meanX) ** 2;
    syy += (nums[i] - meanY) ** 2;
  }
  const slope = sxx ? sxy / sxx : 0;
  const intercept = meanY - slope * meanX;
  const r2 = sxx && syy ? (sxy * sxy) / (sxx * syy) : 0;
  return {
    slope: Number(slope.toFixed(4)),
    intercept: Number(intercept.toFixed(2)),
    r2: Number(r2.toFixed(4)),
    direction: slope > 1e-9 ? "up" : slope < -1e-9 ? "down" : "flat",
  };
}

// ------------------------------------------------------------
// ALGORITHM NAME: Classical Decomposition (trend + weekly season + residual)
// USE: Revenue has weekly seasonality — a normal Saturday flags as anomaly
// against Tuesday baselines. Decompose first: trend via centered 7-day
// moving average, season = weekday mean detrended value, residual = actual
// - trend - season. Test the RESIDUAL with MAD, not raw revenue.
// Returns { trend, seasonal[7], residuals }.
// ------------------------------------------------------------
export function decomposeWeekly(values = [], seasonLen = 7, startDate = null) {
  const rows = (values || []).map((item, index) => {
    const objectValue = item && typeof item === "object";
    const value = Number(objectValue ? item.value ?? item.revenue : item);
    const date = objectValue ? item.date : null;
    const parsedDate = date == null ? null : new Date(date);
    const weekday = parsedDate && Number.isFinite(parsedDate.getTime())
      ? parsedDate.getUTCDay()
      : null;
    return { value, weekday, index };
  }).filter((row) => Number.isFinite(row.value));
  const nums = rows.map((row) => row.value);
  const n = nums.length;
  const m = Math.max(2, Math.floor(seasonLen) || 7);
  if (n < m) return { trend: [...nums], seasonal: new Array(m).fill(0), residuals: nums.map(() => 0) };
  // Centered moving average trend.
  const trend = nums.map((_, i) => {
    const lo = Math.max(0, i - Math.floor(m / 2));
    const hi = Math.min(n - 1, i + Math.floor(m / 2));
    const win = nums.slice(lo, hi + 1);
    return win.reduce((a, v) => a + v, 0) / win.length;
  });
  // Weekday seasonal indices from detrended values.
  const buckets = Array.from({ length: m }, () => []);
  const parsedStart = startDate == null ? null : new Date(startDate);
  const startWeekday = parsedStart && Number.isFinite(parsedStart.getTime())
    ? parsedStart.getUTCDay()
    : 0;
  for (let i = 0; i < n; i++) {
    // Dated observations use their actual weekday. Numeric arrays retain the
    // old positional cycle; pass startDate to anchor that cycle when dates
    // are unavailable.
    const bucket = (m === 7 && rows[i].weekday !== null)
      ? rows[i].weekday
      : (startWeekday + rows[i].index) % m;
    buckets[bucket % m].push(nums[i] - trend[i]);
  }
  const seasonal = buckets.map((b) => (b.length ? b.reduce((a, v) => a + v, 0) / b.length : 0));
  const meanSeas = seasonal.reduce((a, v) => a + v, 0) / m;
  for (let i = 0; i < m; i++) seasonal[i] -= meanSeas; // center to zero
  const residuals = nums.map((v, i) => {
    const bucket = (m === 7 && rows[i].weekday !== null)
      ? rows[i].weekday
      : (startWeekday + rows[i].index) % m;
    return v - trend[i] - seasonal[bucket % m];
  });
  return { trend, seasonal, residuals };
}

// ------------------------------------------------------------
// ALGORITHM NAME: Hampel Filter (rolling median/MAD outlier flags)
// USE: For each point, median + MAD of the trailing window; flags when
// |x - median| > threshold * 1.4826 * MAD (1.4826 makes MAD consistent
// with σ for normal data). Rolling = adapts to regime shifts.
// ------------------------------------------------------------
export function hampelFilter(values = [], { window = 7, threshold = 3 } = {}) {
  const nums = (values || []).map(Number).filter(Number.isFinite);
  const w = Math.max(3, Math.floor(window) || 7);
  const th = Number(threshold) || 3;
  return nums.map((x, i) => {
    // Exclude the candidate point so a spike cannot pull its own baseline.
    const scope = nums.slice(Math.max(0, i - w), i);
    if (scope.length < 2) return { index: i, value: x, median: median(scope), anomaly: false };
    const med = median(scope);
    const m = mad(scope, med) || 0;
    const sigma = 1.4826 * m;
    const dev = Math.abs(x - med);
    return {
      index: i,
      value: x,
      median: med,
      anomaly: sigma > 0 ? dev > th * sigma : dev > 0,
    };
  });
}

// ------------------------------------------------------------
// ALGORITHM NAME: CUSUM Drift Detector (tabular, two-sided)
// USE: Spike detectors miss small SUSTAINED shifts (slow theft, margin
// bleed). CUSUM accumulates (x - target - k); crossing h signals drift.
// k = slack (0.5σ), h = decision interval (5σ) — standard Montgomery setup.
// Returns { drift: 'up'|'down'|null, at } — first crossing index.
// ------------------------------------------------------------
export function cusumDrift(values = [], { target = null, k = null, h = null } = {}) {
  const nums = (values || []).map(Number).filter(Number.isFinite);
  if (nums.length < 3) return { drift: null, at: -1 };
  const { mean, std } = meanStd(nums);
  const mu = target ?? mean;
  const sigma = std || 1;
  const slack = k ?? 0.5 * sigma;
  const limit = h ?? 5 * sigma;
  let sh = 0;
  let sl = 0;
  for (let i = 0; i < nums.length; i++) {
    sh = Math.max(0, sh + (nums[i] - mu - slack));
    sl = Math.min(0, sl + (nums[i] - mu + slack));
    if (sh > limit) return { drift: "up", at: i };
    if (-sl > limit) return { drift: "down", at: i };
  }
  return { drift: null, at: -1 };
}
