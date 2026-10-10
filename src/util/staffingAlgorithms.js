// ============================================================
// POS Staffing Algorithms — read later by ALGORITHM NAME
// File: src/util/staffingAlgorithms.js
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: Capacity-Cover Staffing (Greedy Peak-Hour Cover)
// USE: Given forecast sales/hour + sales-per-cashier capacity, assigns min
// cashiers per hour. UPGRADE: min/max coverage bounds + break relief factor
// so the optimizer can't schedule 0 or 50 cashiers from a bad forecast.
// WORLDWIDE USE: workforce management.
// ------------------------------------------------------------
export function optimizeStaffing({
  salesByHour = [],
  salesPerCashier = 5000,
  minCashiers = 1,
  maxCashiers = 10,
  reliefFactor = 0,
}) {
  const cap = Math.max(1, Number(salesPerCashier) || 5000);
  const lo = Math.max(0, Math.floor(Number(minCashiers) || 0));
  const hi = Math.max(lo, Math.floor(Number(maxCashiers) || 10));
  const relief = Math.min(0.5, Math.max(0, Number(reliefFactor) || 0));
  return (salesByHour || []).map((h) => {
    const base = Math.ceil((Number(h.sales) || 0) / cap);
    const withRelief = Math.ceil(base * (1 + relief));
    return {
      hour: h.hour,
      forecastSales: h.sales,
      cashiers: Math.min(hi, Math.max(lo, withRelief || lo)),
      utilization: Number((((Number(h.sales) || 0) / (Math.max(1, Math.min(hi, Math.max(lo, withRelief || lo))) * cap)) * 100).toFixed(1)),
    };
  });
}

// ------------------------------------------------------------
// ALGORITHM NAME: Overtime Predictor (Threshold + Linear-Trend Projection)
// USE: Old code was a bare `open >= 540` check. UPGRADE: when shiftHistory
// (past total shift lengths, minutes) is supplied, fit a least-squares line
// and project today's close: projected = slope*n + intercept, blended with
// the current open time. Returns risk + label + projection.
// ------------------------------------------------------------
export function predictOvertime({
  openMinutes = 0,
  avgShiftMinutes = 480,
  thresholdMinutes = 540,
  shiftHistory = [],
  expectedShiftMinutes = null,
}) {
  const threshold = Number(thresholdMinutes) > 0 ? Number(thresholdMinutes) : 540;
  const open = Number(openMinutes) || 0;
  let projected = open;
  let trendSlope = 0;
  const hist = (Array.isArray(shiftHistory) ? shiftHistory : []).map(Number).filter(Number.isFinite);
  if (hist.length >= 2) {
    // ALGORITHM: Least-Squares fit on history; project next point.
    const n = hist.length;
    const meanX = (n - 1) / 2;
    const meanY = hist.reduce((a, v) => a + v, 0) / n;
    let sxy = 0;
    let sxx = 0;
    for (let i = 0; i < n; i++) {
      sxy += (i - meanX) * (hist[i] - meanY);
      sxx += (i - meanX) ** 2;
    }
    trendSlope = sxx ? sxy / sxx : 0;
    const intercept = meanY - trendSlope * meanX;
    const trendProjected = trendSlope * n + intercept;
    // Blend: trust live clock 70%, trend 30% (trend alone misfires on roster changes).
    projected = Math.max(open, 0.7 * open + 0.3 * trendProjected);
  } else if (expectedShiftMinutes) {
    projected = Math.max(open, Number(expectedShiftMinutes) || open);
  }
  const willOvertime = projected >= threshold;
  const risk = projected / threshold;
  // Table-driven bands (no if/else ladder): index = count of cutoffs passed.
  const CUTS = [0.6, 0.85, 1.0];
  const LABELS = ["LOW", "MED", "HIGH", "OVERTIME"];
  const band = CUTS.reduce((acc, c) => acc + (risk >= c ? 1 : 0), 0);
  return {
    willOvertime,
    // Backward-compat: old callers read willOvertime + risk only.
    risk: Number(risk.toFixed(2)),
    riskLabel: LABELS[Math.min(LABELS.length - 1, band)],
    avgShiftMinutes,
    projectedMinutes: Math.round(projected),
    trendSlope: Number(trendSlope.toFixed(2)),
    minutesToOvertime: Math.max(0, Math.round(threshold - projected)),
  };
}

// ------------------------------------------------------------
// ALGORITHM NAME: Erlang C Queueing (M/M/c staffing)
// USE: Ceil(sales/capacity) staffs to 100% utilization — queues grow
// without bound under random arrivals. Erlang C takes arrival rate λ,
// service rate μ and a wait target (P(wait>t) <= target) and returns the
// SMALLEST cashier count meeting it. Standard for call centers + retail.
// λ = arrivalsPerHour/60 per min, μ = 1/serviceMinutes, A = λ/μ Erlangs.
// Stability needs A < c; the loop starts at floor(A)+1 to guarantee it.
// Erlang B via stable recurrence B = A*B/(k + A*B); Erlang C from B.
// ------------------------------------------------------------
export function erlangStaff({
  arrivalsPerHour,
  serviceMinutes,
  maxWaitSec = 60,
  target = 0.2,
  maxC = 50,
}) {
  const lambda = (Number(arrivalsPerHour) || 0) / 60;
  const mu = 1 / Math.max(0.1, Number(serviceMinutes) || 3);
  const A = lambda / mu;
  const limit = Math.max(1, Math.floor(Number(maxC) || 50));
  const maxWaitMinutes = Math.max(0, Number(maxWaitSec) || 0) / 60;
  const waitTarget = Math.min(1, Math.max(0, Number(target) || 0));
  if (!(A > 0)) return { cashiers: 1, utilization: 0, pWait: 0, pLong: 0, targetMet: true };
  const start = Math.max(1, Math.floor(A) + 1);
  const calculate = (c) => {
    let B = 1;
    for (let k = 1; k <= c; k++) B = (A * B) / (k + A * B);
    const rho = A / c;
    const pWait = B / (1 - rho * (1 - B));
    const pLong = pWait * Math.exp(-(c * mu - lambda) * maxWaitMinutes);
    return { cashiers: c, utilization: Number((rho * 100).toFixed(1)), pWait, pLong };
  };
  // If the cap is below the minimum stable server count, queues are
  // unbounded in the M/M/c model. Report that explicitly.
  if (limit < start) {
    return { cashiers: limit, utilization: Number(((A / limit) * 100).toFixed(1)), pWait: 1, pLong: 1, targetMet: false };
  }
  for (let c = start; c <= limit; c++) {
    const result = calculate(c);
    if (result.pLong <= waitTarget) {
      return { ...result, pWait: Number(result.pWait.toFixed(3)), pLong: Number(result.pLong.toFixed(3)), targetMet: true };
    }
  }
  const result = calculate(limit);
  return { ...result, pWait: Number(result.pWait.toFixed(3)), pLong: Number(result.pLong.toFixed(3)), targetMet: false };
}
