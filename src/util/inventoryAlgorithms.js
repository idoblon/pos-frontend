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
// ------------------------------------------------------------
export function calculateEOQ({ annualDemand, orderingCost, holdingCost }) {
  const D = Number(annualDemand) || 0;
  const S = Number(orderingCost) || 0;
  const H = Number(holdingCost) || 0;
  if (D <= 0 || S <= 0 || H <= 0) return 0;
  return Math.ceil(Math.sqrt((2 * D * S) / H));
}

// ------------------------------------------------------------
// ALGORITHM NAME: Reorder Point (ROP) with Safety Stock
// USE: Decides WHEN to reorder so you don't go out of stock.
// FORMULA: SafetyStock = Z * sigma * sqrt(L)
//          ReorderPoint = (avgDailyDemand * leadTimeDays) + SafetyStock
//   Z = service-level factor (1.65 = 95% service), sigma = daily demand std-dev
// WORLDWIDE USE: POS + warehouse auto-reorder / low-stock alerts.
// ------------------------------------------------------------
export function calculateSafetyStock({ dailyStdDev, leadTimeDays, zScore = 1.65 }) {
  const sigma = Number(dailyStdDev) || 0;
  const L = Number(leadTimeDays) || 0;
  if (sigma <= 0 || L <= 0) return 0;
  return Math.ceil(Number(zScore) * sigma * Math.sqrt(L));
}

export function calculateReorderPoint({ avgDailyDemand, leadTimeDays, safetyStock = 0 }) {
  const d = Number(avgDailyDemand) || 0;
  const L = Number(leadTimeDays) || 0;
  return Math.ceil(d * L + Number(safetyStock || 0));
}

// Convenience: one call -> { safetyStock, reorderPoint, shouldReorder }
// ALGORITHM NAMES inside: Reorder Point + Safety Stock (see above).
export function getReorderSuggestion({ quantityOnHand, avgDailyDemand, dailyStdDev, leadTimeDays, zScore }) {
  const safetyStock = calculateSafetyStock({ dailyStdDev, leadTimeDays, zScore });
  const reorderPoint = calculateReorderPoint({ avgDailyDemand, leadTimeDays, safetyStock });
  return {
    safetyStock,
    reorderPoint,
    shouldReorder: Number(quantityOnHand || 0) <= reorderPoint,
  };
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
// ALGORITHM NAME: ABC Analysis (Pareto 80/15/5 Classification + Sort)
// USE: Ranks SKUs by consumption value (annualDemand * unitPrice) DESC,
//      then labels A ~80% value, B ~15%, C ~5%. Focus counting/promo on A.
// WORLDWIDE USE: inventory prioritization in every POS/ERP.
// ------------------------------------------------------------
export function classifyABC(items = []) {
  // items: [{ id, name, annualDemand, unitPrice }]
  const withValue = items.map((it) => ({
    ...it,
    annualValue: (Number(it.annualDemand) || 0) * (Number(it.unitPrice) || 0),
  }));
  // ALGORITHM inside: Descending Sort (Timsort via Array.sort) for ranking
  withValue.sort((a, b) => b.annualValue - a.annualValue);
  const total = withValue.reduce((acc, it) => acc + it.annualValue, 0);
  if (total <= 0) return withValue.map((it) => ({ ...it, abc: "C", cumShare: 0 }));

  let running = 0;
  return withValue.map((it) => {
    const prevShare = total ? running / total : 0;
    running += it.annualValue;
    const cumShare = running / total;
    // ALGORITHM NAME: Pareto Threshold Classification (item that crosses 80% still counts as A)
    const abc = prevShare < 0.8 ? "A" : prevShare < 0.95 ? "B" : "C";
    return { ...it, abc, cumShare: Number(cumShare.toFixed(4)) };
  });
}
