// ============================================================
// POS Customer Algorithms — read later by ALGORITHM NAME
// File: src/util/customerAlgorithms.js
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: RFM Segmentation (Recency/Frequency/Monetary)
// USE: Labels customers Champion/Loyal/AtRisk/Lost from order history.
// SCORES 1-5 per axis by quintile rank; segment by rule table.
// WORLDWIDE USE: retail CRM in every POS.
// ------------------------------------------------------------
export function rfmSegment({ daysSinceLast = 999, orderCount = 0, totalSpent = 0 }) {
  const r = daysSinceLast <= 7 ? 5 : daysSinceLast <= 30 ? 4 : daysSinceLast <= 90 ? 3 : daysSinceLast <= 180 ? 2 : 1;
  const f = orderCount >= 20 ? 5 : orderCount >= 10 ? 4 : orderCount >= 5 ? 3 : orderCount >= 2 ? 2 : 1;
  const m = totalSpent >= 50000 ? 5 : totalSpent >= 20000 ? 4 : totalSpent >= 5000 ? 3 : totalSpent >= 1000 ? 2 : 1;
  let segment = "Lost";
  if (r >= 4 && f >= 4) segment = "Champion";
  // Lapsing-but-valuable customers must be caught before Loyal, otherwise
  // the Loyal rule (f>=3 && m>=3) shadows them and AtRisk is unreachable.
  else if (r <= 2 && f >= 3) segment = "AtRisk";
  else if (f >= 3 && m >= 3) segment = "Loyal";
  else if (r >= 3) segment = "Active";
  else if (r <= 2 && f <= 2) segment = "Lost";
  return { r, f, m, score: r * 100 + f * 10 + m, segment };
}

// ------------------------------------------------------------
// ALGORITHM NAME: CLV Prediction (Simple: AOV x Frequency x Lifespan)
// USE: totalSpent/orders = AOV; orders/month = freq; CLV = AOV*freq*12 months.
// ------------------------------------------------------------
export function predictCLV({ totalSpent = 0, orderCount = 0, monthsActive = 1 }) {
  const aov = orderCount > 0 ? Number(totalSpent) / orderCount : 0;
  const freq = orderCount / Math.max(1, Number(monthsActive) || 1);
  return Math.round(aov * freq * 12);
}
