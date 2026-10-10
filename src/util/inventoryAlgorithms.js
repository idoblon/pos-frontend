// ============================================================
// POS Inventory Algorithms — read later by ALGORITHM NAME
// File: src/util/inventoryAlgorithms.js
// Each export is commented with its worldwide-used algorithm name.
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: Economic Order Quantity (EOQ)
// USE: Optimal restock quantity that minimizes ordering + holding cost.
// FORMULA: EOQ = sqrt(2 * D * S / H)
//   D = annual demand (units/year), S = cost per order, H = holding cost/unit/year
// WORLDWIDE USE: inventory / restock in every POS/ERP (SAP, Oracle, Odoo).
// UPGRADE: optional quantity-discount evaluation + sensitivity band.
// ------------------------------------------------------------
export function calculateEOQ({ annualDemand, orderingCost, holdingCost }) {
  const D = Number(annualDemand) || 0;
  const S = Number(orderingCost) || 0;
  const H = Number(holdingCost) || 0;
  if (D <= 0 || S <= 0 || H <= 0) return 0;
  return Math.ceil(Math.sqrt((2 * D * S) / H));
}

// ALGORITHM NAME: EOQ with Quantity-Discount Breaks (Total-Cost Minimization)
// USE: When suppliers offer price breaks, plain EOQ can be non-optimal.
// Picks the break quantity with min total cost: TC = D*P + (D/Q)*S + (Q/2)*H.
// priceBreaks: [{ minQty, unitPrice }] sorted asc by minQty.
export function calculateEOQWithDiscounts({
  annualDemand,
  orderingCost,
  holdingRate = 0.2,
  priceBreaks = [],
}) {
  const D = Number(annualDemand) || 0;
  const S = Number(orderingCost) || 0;
  if (D <= 0 || S <= 0 || !Array.isArray(priceBreaks) || priceBreaks.length === 0) return 0;
  const breaks = [...priceBreaks]
    .map((b) => ({ minQty: Math.max(1, Math.floor(Number(b.minQty) || 1)), unitPrice: Number(b.unitPrice) || 0 }))
    .filter((b) => b.unitPrice > 0)
    .sort((a, b) => a.minQty - b.minQty);
  if (!breaks.length) return 0;
  let best = null;
  for (const b of breaks) {
    const H = b.unitPrice * Number(holdingRate);
    if (H <= 0) continue;
    const eoq = Math.sqrt((2 * D * S) / H);
    const q = Math.max(eoq, b.minQty); // feasible qty for this break
    const tc = D * b.unitPrice + (D / q) * S + (q / 2) * H;
    if (!best || tc < best.totalCost) {
      best = { orderQty: Math.ceil(q), unitPrice: b.unitPrice, totalCost: Math.round(tc) };
    }
  }
  return best || 0;
}

// ------------------------------------------------------------
// ALGORITHM NAME: Inverse Normal CDF (Acklam's rational approximation)
// USE: Exact Z for ANY service level — replaces the 90/95/97.5/99 lookup
// table + linear interpolation (inaccurate between anchors, misbehaves for
// numeric inputs like 0.95). Accurate to ~1.15e-9. Throws outside (0,1).
// ------------------------------------------------------------
export function zFromProbability(p) {
  const v = Number(p);
  if (!(v > 0 && v < 1)) throw new RangeError("p must be in (0,1)");
  // Coefficients for central + tail regions (Peter J. Acklam).
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const plow = 0.02425;
  const phigh = 1 - plow;
  let q, z;
  if (v < plow) {
    q = Math.sqrt(-2 * Math.log(v));
    z = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (v <= phigh) {
    q = v - 0.5;
    const r = q * q;
    z = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - v));
    z = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  return z; // zFromProbability(0.95) ≈ 1.6449
}

// Lookup kept for the four canonical labels (backward compatible exact
// values); every other level is computed exactly via zFromProbability.
export const SERVICE_LEVEL_Z = {
  "90%": 1.28,
  "95%": 1.65,
  "97.5%": 1.96,
  "99%": 2.33,
};

export function zForServiceLevel(serviceLevel = "95%", fallback = 1.65) {
  if (typeof serviceLevel === "number" && Number.isFinite(serviceLevel)) {
    // Numeric z (>1) passes through; fractions are probabilities.
    if (serviceLevel > 1) return serviceLevel;
    if (serviceLevel > 0 && serviceLevel < 1) return zFromProbability(serviceLevel);
    return fallback;
  }
  const key = String(serviceLevel || "").trim();
  if (key in SERVICE_LEVEL_Z) return SERVICE_LEVEL_Z[key];
  const n = Number(key.replace("%", ""));
  if (Number.isFinite(n) && n > 0 && n < 1) return zFromProbability(n);
  if (Number.isFinite(n) && n > 50 && n < 100) return zFromProbability(n / 100);
  const asNum = Number(serviceLevel);
  return Number.isFinite(asNum) && asNum > 0 ? asNum : fallback;
}

// ------------------------------------------------------------
// ALGORITHM NAME: Reorder Point (ROP) with Safety Stock
// USE: Decides WHEN to reorder so you don't go out of stock.
// FORMULA: SafetyStock = Z * sqrt(L * sigma_d^2 + d^2 * sigma_L^2)
//          ReorderPoint = (avgDailyDemand * leadTimeDays) + SafetyStock
//   Z = service-level factor (1.65 = 95% service), sigma_d = daily demand std-dev,
//   sigma_L = lead-time std-dev (0 = constant lead time, backward compatible).
// WORLDWIDE USE: POS + warehouse auto-reorder / low-stock alerts.
// ------------------------------------------------------------
export function calculateSafetyStock({
  dailyStdDev,
  leadTimeDays,
  zScore = 1.65,
  serviceLevel,
  avgDailyDemand = 0,
  leadTimeStdDev = 0,
}) {
  const sigmaD = Number(dailyStdDev) || 0;
  const L = Number(leadTimeDays) || 0;
  const sigmaL = Number(leadTimeStdDev) || 0;
  const d = Number(avgDailyDemand) || 0;
  const Z = serviceLevel !== undefined ? zForServiceLevel(serviceLevel, Number(zScore) || 1.65) : Number(zScore);
  if (L <= 0) return 0;
  if (sigmaD <= 0 && sigmaL <= 0) return 0;
  // Full variable-demand + variable-lead-time form. Collapses to
  // Z*sigma*sqrt(L) when sigmaL = 0 (backward compatible).
  const variance = L * sigmaD * sigmaD + d * d * sigmaL * sigmaL;
  if (variance <= 0) return 0;
  return Math.ceil(Z * Math.sqrt(variance));
}

export function calculateReorderPoint({
  avgDailyDemand,
  leadTimeDays,
  safetyStock = 0,
}) {
  const d = Number(avgDailyDemand) || 0;
  const L = Number(leadTimeDays) || 0;
  return Math.ceil(d * L + Number(safetyStock || 0));
}

// Convenience: one call -> { safetyStock, reorderPoint, shouldReorder }
// ALGORITHM NAMES inside: Reorder Point + Safety Stock (see above).
// UPGRADE: also returns daysOfCover, deficit, urgency (0-1) and a
// suggested order qty (deficit + EOQ top-up) instead of a bare boolean.
export function getReorderSuggestion({
  quantityOnHand,
  avgDailyDemand,
  dailyStdDev,
  leadTimeDays,
  zScore,
  serviceLevel,
  leadTimeStdDev,
  annualDemand,
  orderingCost,
  holdingCost,
}) {
  const safetyStock = calculateSafetyStock({
    dailyStdDev,
    leadTimeDays,
    zScore,
    serviceLevel,
    avgDailyDemand,
    leadTimeStdDev,
  });
  const reorderPoint = calculateReorderPoint({
    avgDailyDemand,
    leadTimeDays,
    safetyStock,
  });
  const onHand = Number(quantityOnHand || 0);
  const d = Number(avgDailyDemand) || 0;
  const deficit = Math.max(0, reorderPoint - onHand);
  const daysOfCover = d > 0 ? onHand / d : onHand > 0 ? Infinity : 0;
  // urgency 0 (healthy) -> 1 (stockout): fraction of ROP consumed.
  const urgency = reorderPoint > 0 ? Math.min(1, Math.max(0, deficit / reorderPoint)) : onHand <= 0 ? 1 : 0;
  let suggestedOrderQty = Math.ceil(deficit);
  if (annualDemand && orderingCost && holdingCost) {
    const eoq = calculateEOQ({ annualDemand, orderingCost, holdingCost });
    if (eoq > 0) suggestedOrderQty = Math.max(suggestedOrderQty, eoq);
  }
  return {
    safetyStock,
    reorderPoint,
    shouldReorder: onHand <= reorderPoint,
    deficit,
    daysOfCover: Number.isFinite(daysOfCover) ? Number(daysOfCover.toFixed(2)) : null,
    urgency: Number(urgency.toFixed(3)),
    suggestedOrderQty,
  };
}

// ------------------------------------------------------------
// ALGORITHM NAME: Demand Derivation from Order History (Dynamic ROP input)
// USE: Turns raw orders into { avgDailyDemand, dailyStdDev } per SKU so ROP
// follows real sales instead of threshold/7. O(n) single pass.
// INPUT: orders = [{ createdAt, items:[{productId, quantity}]}]
// ------------------------------------------------------------
export function deriveDemandFromOrders({ orders = [], productId, days = 30, nowMs = Date.now() }) {
  const pid = String(productId ?? "");
  if (!pid) return { avgDailyDemand: 0, dailyStdDev: 0, daysSampled: 0 };
  const span = Math.max(1, Math.floor(Number(days) || 30));
  const series = deriveDemandSeriesFromOrders({ orders, productIds: [pid], days: span, nowMs }).get(pid);
  const mean = series.reduce((a, v) => a + v, 0) / span;
  const variance = series.reduce((a, v) => a + (v - mean) ** 2, 0) / span;
  return {
    avgDailyDemand: Number(mean.toFixed(3)),
    dailyStdDev: Number(Math.sqrt(variance).toFixed(3)),
    daysSampled: span,
  };
}

// ALGORITHM NAME: Daily SKU Demand Bucketing (single-pass aggregation)
// USE: Builds complete, chronological daily unit-sales series for a catalog.
// Zero-sale days are included so forecasts do not overstate slow movers.
export function deriveDemandSeriesFromOrders({ orders = [], productIds = [], days = 30, nowMs = Date.now() } = {}) {
  const span = Math.max(1, Math.floor(Number(days) || 30));
  const wanted = new Set((productIds || []).map((id) => String(id ?? "")).filter(Boolean));
  const perProduct = new Map([...wanted].map((id) => [id, new Map()]));
  for (const o of orders || []) {
    const t = new Date(o.createdAt).getTime();
    if (!Number.isFinite(t)) continue;
    const ageDays = Math.floor((nowMs - t) / 86400000);
    if (ageDays < 0 || ageDays >= span) continue;
    const status = String(o.status || "").toUpperCase();
    if (["CANCELLED", "CANCELED", "VOID", "REFUNDED"].includes(status)) continue;
    const items = Array.isArray(o.items) ? o.items : Array.isArray(o.orderItems) ? o.orderItems : [];
    for (const it of items) {
      const rawId = it.productId ?? it.product?.id ?? it.product?._id;
      const pid = String(typeof rawId === "object" ? rawId?.id ?? rawId?._id ?? "" : rawId ?? "");
      const daysByAge = perProduct.get(pid);
      if (!daysByAge) continue;
      const qty = Math.max(0, Number(it.quantity) || 0);
      if (qty > 0) daysByAge.set(ageDays, (daysByAge.get(ageDays) || 0) + qty);
    }
  }
  return new Map([...perProduct].map(([pid, daysByAge]) => [
    pid,
    Array.from({ length: span }, (_, index) => daysByAge.get(span - 1 - index) || 0),
  ]));
}

// ------------------------------------------------------------
// ALGORITHM NAME: Exponential Smoothing (Single) Forecasting
// USE: Predicts next-period demand from sales history, more weight on recent.
// FORMULA: F(t+1) = alpha * A(t) + (1 - alpha) * F(t), alpha in (0,1)
// WORLDWIDE USE: POS demand forecasting / sales trend prediction.
// ------------------------------------------------------------
export function forecastExponentialSmoothing({ history = [], alpha = 0.3 }) {
  if (!Array.isArray(history) || history.length === 0) return 0;
  const a = Math.min(0.99, Math.max(0.01, Number(alpha) || 0.3));
  let forecast = Number(history[0]) || 0; // F(1) = A(1) seed
  for (let i = 1; i < history.length; i++) {
    const actual = Number(history[i]) || 0;
    forecast = a * actual + (1 - a) * forecast;
  }
  return Math.ceil(forecast);
}

// ------------------------------------------------------------
// ALGORITHM NAME: Holt's Linear Trend (Double Exponential Smoothing)
// USE: SES plus a trend component — follows growing/declining SKUs instead
// of lagging them. F(t+1) = level + trend.
// FORMULA: l(t) = a*A(t) + (1-a)*(l(t-1)+b(t-1))
//          b(t) = g*(l(t)-l(t-1)) + (1-g)*b(t-1)
// ------------------------------------------------------------
export function forecastHolt({ history = [], alpha = 0.4, beta = 0.3 }) {
  if (!Array.isArray(history) || history.length === 0) return 0;
  const nums = history.map(Number).filter(Number.isFinite);
  if (!nums.length) return 0;
  if (nums.length === 1) return Math.ceil(nums[0]);
  const a = Math.min(0.99, Math.max(0.01, Number(alpha) || 0.4));
  const g = Math.min(0.99, Math.max(0.01, Number(beta) || 0.3));
  let level = nums[0];
  let trend = nums[1] - nums[0];
  for (let i = 1; i < nums.length; i++) {
    const prevLevel = level;
    level = a * nums[i] + (1 - a) * (level + trend);
    trend = g * (level - prevLevel) + (1 - g) * trend;
  }
  return Math.max(0, Math.ceil(level + trend));
}

// ------------------------------------------------------------
// ALGORITHM NAME: Moving Average Forecasting
// USE: Simple baseline forecast = mean of last N periods.
// FORMULA: F = sum(last N actuals) / N
// WORLDWIDE USE: POS quick forecast when history is short/noisy.
// ------------------------------------------------------------
export function forecastMovingAverage({ history = [], window = 3 }) {
  if (!Array.isArray(history) || history.length === 0) return 0;
  const n = Math.max(1, Math.min(Number(window) || 3, history.length));
  const slice = history.slice(history.length - n);
  const sum = slice.reduce((acc, v) => acc + (Number(v) || 0), 0);
  return Math.ceil(sum / n);
}

// ------------------------------------------------------------
// ALGORITHM NAME: Auto-Select Forecast (Backtest by rolling MAE)
// USE: Splits history into train/holdout, scores SES vs Holt vs MA on the
// holdout by mean absolute error, returns the winner. Removes the
// "which alpha/window?" guesswork.
// ------------------------------------------------------------
export function forecastAuto({ history = [] }) {
  const nums = (Array.isArray(history) ? history : []).map(Number).filter(Number.isFinite);
  if (!nums.length) return { forecast: 0, method: "none", mae: 0 };
  if (nums.length < 4) {
    return { forecast: forecastMovingAverage({ history: nums }), method: "movingAverage", mae: 0 };
  }
  const split = Math.max(2, Math.floor(nums.length * 0.7));
  const train = nums.slice(0, split);
  const holdout = nums.slice(split);
  const candidates = [
    { method: "ses", fn: (h) => forecastExponentialSmoothing({ history: h }) },
    { method: "holt", fn: (h) => forecastHolt({ history: h }) },
    { method: "movingAverage", fn: (h) => forecastMovingAverage({ history: h }) },
  ];
  let best = null;
  for (const c of candidates) {
    // Rolling-origin: grow train one point at a time, measure MAE.
    let err = 0;
    const growing = [...train];
    for (const actual of holdout) {
      err += Math.abs(c.fn(growing) - actual);
      growing.push(actual);
    }
    const mae = err / holdout.length;
    if (!best || mae < best.mae) best = { method: c.method, mae: Number(mae.toFixed(3)) };
  }
  const finalFn = candidates.find((c) => c.method === best.method).fn;
  return { forecast: finalFn(nums), ...best };
}

// ------------------------------------------------------------
// ALGORITHM NAME: ABC Analysis (Pareto 80/15/5 Classification + Sort)
// USE: Ranks SKUs by consumption value (annualDemand * unitPrice) DESC,
//      then labels A ~80% value, B ~15%, C ~5%. Focus counting/promo on A.
// WORLDWIDE USE: inventory prioritization in every POS/ERP.
// UPGRADE: thresholds configurable; emits service-level + count policy hint.
// ------------------------------------------------------------
export function classifyABC(items = [], { thresholds = [0.8, 0.95] } = {}) {
  // items: [{ id, name, annualDemand, unitPrice }]
  const [aCut, bCut] = thresholds;
  const withValue = items.map((it) => ({
    ...it,
    annualValue: (Number(it.annualDemand) || 0) * (Number(it.unitPrice) || 0),
  }));
  // ALGORITHM inside: Descending Sort (Timsort via Array.sort) for ranking
  withValue.sort((a, b) => b.annualValue - a.annualValue);
  const total = withValue.reduce((acc, it) => acc + it.annualValue, 0);
  if (total <= 0)
    return withValue.map((it) => ({ ...it, abc: "C", cumShare: 0, serviceLevel: "90%", countPerYear: 1 }));

  let running = 0;
  return withValue.map((it) => {
    const prevShare = total ? running / total : 0;
    running += it.annualValue;
    const cumShare = running / total;
    // Pareto cut on PREVIOUS share (item crossing 80% still counts as A).
    const abc = prevShare < aCut ? "A" : prevShare < bCut ? "B" : "C";
    return {
      ...it,
      abc,
      cumShare: Number(cumShare.toFixed(4)),
      // Policy hint: A items deserve the highest service level + cycle counts.
      serviceLevel: abc === "A" ? "99%" : abc === "B" ? "95%" : "90%",
      countPerYear: abc === "A" ? 12 : abc === "B" ? 4 : 1,
    };
  });
}

// ------------------------------------------------------------
// ALGORITHM NAME: Croston / SBA / TSB (intermittent-demand forecasting)
// USE: SES/Holt are BIASED on slow movers (many zero days): they drag the
// forecast toward zero after every gap. Croston smooths demand SIZE and
// inter-demand INTERVAL separately: forecast = size / interval.
// SBA (Syntetos-Boylan) debiases Croston by (1 - alpha/2); TSB updates the
// demand PROBABILITY every period (decays through zeros) instead of the
// interval only on hits — better after obsolescence gaps.
// history: per-period demand (zeros allowed). Returns per-period forecast.
// ------------------------------------------------------------
export function forecastCroston({ history = [], alpha = 0.2, variant = "sba" } = {}) {
  const nums = (Array.isArray(history) ? history : []).map(Number).filter(Number.isFinite);
  if (!nums.length) return 0;
  const a = Math.min(0.99, Math.max(0.01, Number(alpha) || 0.2));
  let size = 0; // smoothed nonzero demand size
  let interval = 1; // smoothed inter-demand interval
  let prob = 0; // TSB: smoothed demand probability
  let gap = 0; // periods since last nonzero
  let seen = 0; // nonzero count
  for (const x of nums) {
    gap++;
    if (x > 0) {
      seen++;
      if (seen === 1) {
        size = x;
        interval = gap;
        prob = 1;
      } else {
        size = a * x + (1 - a) * size;
        interval = a * gap + (1 - a) * interval;
        if (variant === "tsb") prob = a + (1 - a) * prob;
      }
      gap = 0;
    } else if (variant === "tsb") {
      prob = (1 - a) * prob; // probability decays through zeros
    }
  }
  if (!seen) return 0;
  if (variant === "tsb") return Math.max(0, Math.ceil(prob * size));
  const croston = size / Math.max(1, interval);
  const sba = croston * (1 - a / 2); // debiased
  return Math.max(0, Math.ceil(variant === "croston" ? croston : sba));
}

// ------------------------------------------------------------
// ALGORITHM NAME: Bootstrap Safety Stock (empirical quantile, Monte Carlo)
// USE: Z*σ*√L assumes NORMAL demand — false for lumpy POS data. Instead:
// resample actual daily demand over the lead time `draws` times, take the
// service-level quantile of lead-time demand minus its mean. No normality
// assumption; ties SS to the real distribution. Seeded LCG for determinism.
// ------------------------------------------------------------
function lcg(seed = 42) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

export function bootstrapSafetyStock({
  dailyDemand = [],
  leadTimeDays = 7,
  serviceLevel = 0.95,
  draws = 2000,
  seed = 42,
} = {}) {
  const hist = (Array.isArray(dailyDemand) ? dailyDemand : []).map(Number).filter(Number.isFinite);
  const L = Math.max(1, Math.floor(Number(leadTimeDays) || 7));
  if (!hist.length) return 0;
  const p = typeof serviceLevel === "number" && serviceLevel > 0 && serviceLevel < 1
    ? serviceLevel
    : Number(String(serviceLevel).replace("%", "")) / 100 || 0.95;
  const rand = lcg(seed);
  const totals = new Array(Math.max(100, Math.floor(draws)));
  for (let d = 0; d < totals.length; d++) {
    let sum = 0;
    for (let i = 0; i < L; i++) sum += hist[Math.floor(rand() * hist.length)];
    totals[d] = sum;
  }
  totals.sort((a, b) => a - b);
  const mean = totals.reduce((a, v) => a + v, 0) / totals.length;
  const q = totals[Math.min(totals.length - 1, Math.floor(p * totals.length))];
  return Math.max(0, Math.ceil(q - mean));
}

// ------------------------------------------------------------
// ALGORITHM NAME: Holt-Winters Additive (level + trend + season, grid-fit)
// USE: SES/Holt with FIXED α/β miss weekday/payday seasonality (huge in
// retail). Additive HW tracks season of length `seasonLen`; α/β/γ are FIT by
// coarse grid search minimizing in-sample SSE — not constants. Falls back
// to Holt when history < 2 seasons.
// ------------------------------------------------------------
export function forecastHoltWinters({ history = [], seasonLen = 7, alpha, beta, gamma } = {}) {
  const nums = (Array.isArray(history) ? history : []).map(Number).filter(Number.isFinite);
  const m = Math.max(2, Math.floor(Number(seasonLen) || 7));
  if (!nums.length) return { forecast: 0, params: null };
  if (nums.length < 2 * m) {
    return { forecast: forecastHolt({ history: nums }), params: null, fallback: "holt" };
  }
  const grid = [0.1, 0.3, 0.5, 0.7, 0.9];
  const tryParams = [];
  if (alpha !== undefined) tryParams.push([alpha, beta ?? 0.3, gamma ?? 0.3]);
  else for (const a of grid) for (const b of [0.1, 0.3, 0.5]) for (const g of [0.1, 0.3, 0.5]) tryParams.push([a, b, g]);
  const fit = (a, b, g) => {
    const season = nums.slice(0, m);
    const base = season.reduce((x, v) => x + v, 0) / m;
    let level = base;
    let trend = (nums.slice(m, 2 * m).reduce((x, v) => x + v, 0) / m - base) / m;
    const seas = season.map((v) => v - base);
    let sse = 0;
    for (let t = 0; t < nums.length; t++) {
      const sIdx = ((t - m) % m + m) % m;
      const f = level + trend + (t >= m ? seas[sIdx] : 0);
      const err = nums[t] - f;
      sse += err * err;
      const prevLevel = level;
      level = a * (nums[t] - seas[sIdx]) + (1 - a) * (level + trend);
      trend = b * (level - prevLevel) + (1 - b) * trend;
      seas[t % m] = g * (nums[t] - level) + (1 - g) * seas[t % m];
    }
    return { sse, level, trend, seas };
  };
  let best = null;
  for (const [a, b, g] of tryParams) {
    const r = fit(a, b, g);
    if (!best || r.sse < best.sse) best = { ...r, params: { alpha: a, beta: b, gamma: g } };
  }
  const nextSeas = best.seas[nums.length % m];
  return {
    forecast: Math.max(0, Math.ceil(best.level + best.trend + nextSeas)),
    params: best.params,
    sse: Math.round(best.sse),
  };
}

// ------------------------------------------------------------
// ALGORITHM NAME: Jenks Natural Breaks (1-D k-means optimal, Fisher DP)
// USE: Data-driven ABC cutoffs: optimal partition of sorted values into k
// classes minimizing within-class variance — replaces fixed 80/95%.
// n = values, k = 3. O(k*n^2); catalogs here are small.
// Returns break values (upper bound of class 1..k-1).
// ------------------------------------------------------------
export function jenksBreaks(values = [], k = 3) {
  const nums = (values || []).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  const n = nums.length;
  const classes = Math.min(Math.max(2, Math.floor(k) || 3), n);
  if (n < 2) return [];
  // Prefix sums for O(1) interval variance.
  const sum = new Array(n + 1).fill(0);
  const sumSq = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) {
    sum[i + 1] = sum[i] + nums[i];
    sumSq[i + 1] = sumSq[i] + nums[i] * nums[i];
  }
  const varOf = (i, j) => {
    // variance * count over nums[i..j] inclusive
    const len = j - i + 1;
    const s = sum[j + 1] - sum[i];
    const ss = sumSq[j + 1] - sumSq[i];
    return ss - (s * s) / len;
  };
  const dp = Array.from({ length: classes + 1 }, () => new Array(n).fill(Infinity));
  const back = Array.from({ length: classes + 1 }, () => new Array(n).fill(0));
  for (let j = 0; j < n; j++) dp[1][j] = varOf(0, j);
  for (let c = 2; c <= classes; c++) {
    for (let j = c - 1; j < n; j++) {
      for (let i = c - 2; i < j; i++) {
        const v = dp[c - 1][i] + varOf(i + 1, j);
        if (v < dp[c][j]) {
          dp[c][j] = v;
          back[c][j] = i;
        }
      }
    }
  }
  const breaks = [];
  let j = n - 1;
  for (let c = classes; c > 1; c--) {
    j = back[c][j];
    breaks.unshift(nums[j]);
  }
  return breaks;
}

// ------------------------------------------------------------
// ALGORITHM NAME: ABC-XYZ Matrix (value rank x demand variability)
// USE: ABC (consumption value) alone mistreats erratic-A items. X/Y/Z from
// coefficient of variation CV = σ/μ of per-period demand (needs
// demand Series per item: { id, annualDemand, unitPrice, cv }): X CV<0.5
// (steady), Y <1.0, else Z (erratic). Returns abc + xyz + policy cell.
// ------------------------------------------------------------
export function classifyABCXYZ(items = []) {
  const abc = classifyABC(items);
  return abc.map((it) => {
    const mu = Number(it.avgDailyDemand) || 0;
    const sigma = Number(it.dailyStdDev) || 0;
    const cv = mu > 0 ? sigma / mu : it.cv !== undefined ? Number(it.cv) : 1;
    const xyz = cv < 0.5 ? "X" : cv < 1 ? "Y" : "Z";
    const cell = `${it.abc}${xyz}`;
    // Policy: AX = tight JIT, AZ = high SS/attention, CX = bulk/simple.
    const policy =
      it.abc === "A" && xyz === "X" ? "JIT-tight"
      : it.abc === "A" ? "high-service+review"
      : it.abc === "B" && xyz === "Z" ? "watch-erratic"
      : it.abc === "C" ? "bulk-simple"
      : "standard";
    return { ...it, cv: Number(cv.toFixed(3)), xyz, cell, policy };
  });
}
