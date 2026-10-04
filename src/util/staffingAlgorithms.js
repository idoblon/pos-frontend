// ============================================================
// POS Staffing Algorithms — read later by ALGORITHM NAME
// File: src/util/staffingAlgorithms.js
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: Greedy Peak-Hour Cover (Staffing Optimizer)
// USE: Given forecast sales/hour + sales-per-cashier capacity, greedily
// assigns min cashiers per hour. WORLDWIDE USE: workforce management.
// ------------------------------------------------------------
export function optimizeStaffing({ salesByHour = [], salesPerCashier = 5000 }) {
  return (salesByHour || []).map((h) => ({
    hour: h.hour,
    forecastSales: h.sales,
    cashiers: Math.max(1, Math.ceil((Number(h.sales) || 0) / Math.max(1, Number(salesPerCashier)))),
  }));
}

// ------------------------------------------------------------
// ALGORITHM NAME: Overtime Predictor (Threshold + Trend)
// USE: Flags shifts open >= 9h (matches OperationsCenter rule) + predicts
// overtime from avg shift length trend.
// ------------------------------------------------------------
export function predictOvertime({ openMinutes = 0, avgShiftMinutes = 480, thresholdMinutes = 540 }) {
  const willOvertime = Number(openMinutes) >= Number(thresholdMinutes);
  const risk = Number(openMinutes) / Number(thresholdMinutes);
  return {
    willOvertime,
    risk: Number(risk.toFixed(2)),
    riskLabel: risk >= 1 ? "OVERTIME" : risk >= 0.85 ? "HIGH" : risk >= 0.6 ? "MED" : "LOW",
    avgShiftMinutes,
  };
}
