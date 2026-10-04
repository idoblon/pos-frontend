// ============================================================
// POS Recommendation Algorithms — read later by ALGORITHM NAME
// File: src/util/recommendationAlgorithms.js
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: Apriori Lite (Market-Basket Co-occurrence)
// USE: "Bought A => suggest B". support = pairCount/totalOrders,
// confidence = pairCount/countA. Rank by confidence*log(support).
// INPUT: orders = [{items:[{productId}]}]. WORLDWIDE USE: Amazon/POS cross-sell.
// ------------------------------------------------------------
export function aprioriSuggest({ orders = [], cartIds = [], topK = 3, minSupport = 0.01 }) {
  const total = (orders || []).length;
  if (!total || !cartIds?.length) return [];
  const inCart = new Set(cartIds.map(String));
  const countA = new Map(); // single counts
  const pair = new Map(); // "a|b" counts
  for (const o of orders) {
    const ids = [...new Set((o.items || []).map((i) => String(i.productId ?? i.id ?? i)))].filter(Boolean);
    for (const id of ids) countA.set(id, (countA.get(id) || 0) + 1);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = [ids[i], ids[j]].sort().join("|");
        pair.set(key, (pair.get(key) || 0) + 1);
      }
    }
  }
  const scored = [];
  for (const [key, c] of pair) {
    const support = c / total;
    if (support < minSupport) continue;
    const [x, y] = key.split("|");
    const xIn = inCart.has(x);
    const yIn = inCart.has(y);
    if (xIn === yIn) continue; // need exactly one side in cart
    const anchor = xIn ? x : y;
    const suggest = xIn ? y : x;
    if (inCart.has(suggest)) continue;
    const confidence = c / (countA.get(anchor) || 1);
    scored.push({ productId: suggest, support, confidence, score: confidence * Math.log10(1 + support * 100) });
  }
  // ALGORITHM: Descending Sort for ranking + Top-K slice
  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}
