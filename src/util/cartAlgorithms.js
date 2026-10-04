// ============================================================
// POS Cart + Tender Algorithms — read later by ALGORITHM NAME
// File: src/util/cartAlgorithms.js
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: Tiered / Bundle Discount Solver (Brute-Force Min)
// USE: Tries every discount rule, picks cheapest total. Rules:
// [{type:'percent'|'fixed'|'buyXgetY', value, minSubtotal, productId, buy, get}]
// WORLDWIDE USE: POS promo engine (buy-2-get-1, tiered %).
// ------------------------------------------------------------
export function solveBestDiscount({ subtotal = 0, quantity = 0, rules = [] }) {
  const sub = Number(subtotal) || 0;
  let best = { total: sub, discount: 0, rule: null };
  for (const r of rules || []) {
    if (r?.minSubtotal && sub < Number(r.minSubtotal)) continue;
    let discount = 0;
    if (r.type === "percent") discount = sub * (Math.min(100, Math.max(0, Number(r.value))) / 100);
    else if (r.type === "fixed") discount = Math.min(Number(r.value) || 0, sub);
    else if (r.type === "buyXgetY") {
      const buy = Number(r.buy) || 1;
      const get = Number(r.get) || 0;
      const unitPrice = Number(r.unitPrice) || (quantity ? sub / quantity : 0);
      const freeUnits = Math.floor(quantity / (buy + get)) * get;
      discount = Math.min(sub, freeUnits * unitPrice);
    }
    const total = Math.max(0, sub - discount);
    if (total < best.total) best = { total, discount, rule: r };
  }
  return best;
}

// ------------------------------------------------------------
// ALGORITHM NAME: Greedy Change-Making
// USE: Breaks change into fewest notes/coins. Denoms DESC, take max each.
// WORLDWIDE USE: cash tender in every POS. Optimal for NPR canonical denoms.
// ------------------------------------------------------------
export function makeChangeGreedy({ change = 0, denominations = [1000, 500, 100, 50, 20, 10, 5, 2, 1] }) {
  let remaining = Math.round(Number(change) || 0);
  const out = [];
  const denoms = [...denominations].sort((a, b) => b - a); // ALGORITHM: Descending Sort
  for (const d of denoms) {
    if (d <= 0 || remaining < d) continue;
    const count = Math.floor(remaining / d);
    remaining -= count * d;
    out.push({ denom: d, count });
  }
  return { breakdown: out, leftover: remaining };
}
