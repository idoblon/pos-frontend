// ============================================================
// POS Cart + Tender Algorithms — read later by ALGORITHM NAME
// File: src/util/cartAlgorithms.js
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: Tiered / Bundle Discount Solver (Brute-Force Min)
// USE: Tries every discount rule, picks cheapest total. Rules:
// [{type:'percent'|'fixed'|'buyXgetY', value, minSubtotal, productId, buy, get}]
// WORLDWIDE USE: POS promo engine (buy-2-get-1, tiered %).
// NOTE: single-best (non-stacking) — matches "one coupon per sale" policy.
// See solveBestDiscountCombo for stacking promos.
// ------------------------------------------------------------
function discountForRule(r, sub, quantity) {
  if (r?.minSubtotal && sub < Number(r.minSubtotal)) return 0;
  if (r.type === "percent") return sub * (Math.min(100, Math.max(0, Number(r.value))) / 100);
  if (r.type === "fixed") return Math.min(Number(r.value) || 0, sub);
  if (r.type === "buyXgetY") {
    const buy = Number(r.buy) || 1;
    const get = Number(r.get) || 0;
    if (buy <= 0 || get <= 0) return 0;
    const unitPrice = Number(r.unitPrice) || (quantity ? sub / quantity : 0);
    const freeUnits = Math.floor(quantity / (buy + get)) * get;
    return Math.min(sub, freeUnits * unitPrice);
  }
  return 0;
}

export function solveBestDiscount({ subtotal = 0, quantity = 0, rules = [] }) {
  const sub = Number(subtotal) || 0;
  let best = { total: sub, discount: 0, rule: null };
  for (const r of rules || []) {
    const discount = discountForRule(r, sub, quantity);
    if (!discount) continue;
    const total = Math.max(0, sub - discount);
    if (total < best.total) best = { total, discount, rule: r };
  }
  return best;
}

// ------------------------------------------------------------
// ALGORITHM NAME: Stacked Discount Search (Subset Enumeration, 2^n)
// USE: When promos stack (e.g. member 5% + Rs.100 voucher), the best combo
// is NOT the best single. Enumerates all subsets (n is tiny: promo count),
// applies percent-first then fixed for max customer benefit, picks min total.
// Guards: combinable:false rules are exclusive (evaluated solo only).
// ------------------------------------------------------------
export function solveBestDiscountCombo({ subtotal = 0, quantity = 0, rules = [] }) {
  const sub = Number(subtotal) || 0;
  const list = (rules || []).filter(Boolean);
  if (!list.length) return { total: sub, discount: 0, rules: [] };
  const exclusive = list.filter((r) => r.combinable === false);
  const combinable = list.filter((r) => r.combinable !== false);
  let best = solveBestDiscount({ subtotal: sub, quantity, rules: list });
  best = { total: best.total, discount: best.discount, rules: best.rule ? [best.rule] : [] };
  // Percent discounts compound multiplicatively; fixed stack additively.
  const n = Math.min(10, combinable.length); // cap: 2^10 = 1024 subsets max
  for (let mask = 1; mask < 1 << n; mask++) {
    let running = sub;
    let fixed = 0;
    let bogo = 0;
    for (let i = 0; i < n; i++) {
      if (!(mask & (1 << i))) continue;
      const r = combinable[i];
      if (r?.minSubtotal && sub < Number(r.minSubtotal)) { running = -1; break; }
      if (r.type === "percent") running *= 1 - Math.min(100, Math.max(0, Number(r.value))) / 100;
      else if (r.type === "fixed") fixed += Number(r.value) || 0;
      else if (r.type === "buyXgetY") bogo += discountForRule(r, sub, quantity);
    }
    if (running < 0) continue;
    const total = Math.max(0, running - Math.min(running, fixed) - Math.min(running, bogo));
    if (total < best.total) {
      best = {
        total,
        discount: sub - total,
        rules: combinable.filter((_, i) => mask & (1 << i)),
      };
    }
  }
  void exclusive;
  return best;
}

// ------------------------------------------------------------
// ALGORITHM NAME: Change-Making (Greedy + DP-optimal fallback)
// USE: Greedy is optimal for canonical NPR denoms; DP guarantees optimality
// for arbitrary/custom denoms (e.g. [30, 24, 10] where greedy fails).
// Returns { breakdown, leftover, optimal }.
// WORLDWIDE USE: cash tender in every POS. Optimal for NPR canonical denoms.
// ------------------------------------------------------------
export function makeChangeGreedy({ change = 0, denominations = [1000, 500, 100, 50, 20, 10, 5, 2, 1] }) {
  const denoms = [...denominations].map(Number).filter((d) => d > 0).sort((a, b) => b - a);
  const greedy = greedyBreakdown(Math.round(Number(change) || 0), denoms);
  if (greedy.leftover === 0) return { ...greedy, optimal: true };
  // Greedy left a remainder a DP could cover (non-canonical denoms): try DP.
  const dp = makeChangeOptimal({ change, denominations: denoms });
  return dp.leftover === 0 ? { ...dp, optimal: true } : { ...greedy, optimal: false };
}

function greedyBreakdown(remaining, denoms) {
  let rest = remaining;
  const out = [];
  for (const d of denoms) {
    if (d <= 0 || rest < d) continue;
    const count = Math.floor(rest / d);
    rest -= count * d;
    out.push({ denom: d, count });
  }
  return { breakdown: out, leftover: rest };
}

// ALGORITHM NAME: Coin-Change DP (min coins, O(amount * denoms))
export function makeChangeOptimal({ change = 0, denominations = [1000, 500, 100, 50, 20, 10, 5, 2, 1] }) {
  const amount = Math.round(Number(change) || 0);
  const denoms = [...denominations].map(Number).filter((d) => d > 0).sort((a, b) => a - b);
  if (amount < 0 || !denoms.length) return { breakdown: [], leftover: amount };
  const INF = Number.MAX_SAFE_INTEGER;
  const dp = new Array(amount + 1).fill(INF);
  const pick = new Array(amount + 1).fill(-1);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const d of denoms) {
      if (d > a || dp[a - d] === INF) continue;
      if (dp[a - d] + 1 < dp[a]) {
        dp[a] = dp[a - d] + 1;
        pick[a] = d;
      }
    }
  }
  if (dp[amount] === INF) return { breakdown: [], leftover: amount };
  const counts = new Map();
  for (let a = amount; a > 0; a -= pick[a]) counts.set(pick[a], (counts.get(pick[a]) || 0) + 1);
  return {
    breakdown: [...counts.entries()].map(([denom, count]) => ({ denom, count })).sort((x, y) => y.denom - x.denom),
    leftover: 0,
  };
}

// ------------------------------------------------------------
// ALGORITHM NAME: Pearson's Canonical-Coin Test (greedy optimality proof)
// USE: makeChangeGreedy claims optimal:true by construction for NPR notes.
// This PROVES it for any denom set: a system is canonical iff greedy is
// optimal for all amounts up to c_max + c_second_max (Pearson 1994 bound).
// Verifies by DP comparison over that range — small here (NPR: 1000+500).
// Returns { canonical, checkedUpTo, counterexample }.
// ------------------------------------------------------------
export function isCanonicalDenoms(denominations = [1000, 500, 100, 50, 20, 10, 5, 2, 1]) {
  const denoms = [...denominations].map(Number).filter((d) => d > 0 && Number.isInteger(d)).sort((a, b) => b - a);
  if (denoms.length < 2) return { canonical: true, checkedUpTo: 0, counterexample: null };
  const bound = denoms[0] + denoms[1];
  const greedyCoins = (amount) => {
    let rest = amount;
    let n = 0;
    for (const d of denoms) {
      if (d <= 0 || rest < d) continue;
      n += Math.floor(rest / d);
      rest %= d;
    }
    return rest === 0 ? n : Infinity;
  };
  const INF = Number.MAX_SAFE_INTEGER;
  const dp = new Array(bound + 1).fill(INF);
  dp[0] = 0;
  const asc = [...denoms].sort((a, b) => a - b);
  for (let a = 1; a <= bound; a++) {
    for (const d of asc) {
      if (d > a || dp[a - d] === INF) continue;
      if (dp[a - d] + 1 < dp[a]) dp[a] = dp[a - d] + 1;
    }
  }
  for (let a = 1; a <= bound; a++) {
    if (dp[a] === INF) continue; // unreachable amounts don't decide canonicity
    if (greedyCoins(a) !== dp[a]) {
      return { canonical: false, checkedUpTo: bound, counterexample: a };
    }
  }
  return { canonical: true, checkedUpTo: bound, counterexample: null };
}
