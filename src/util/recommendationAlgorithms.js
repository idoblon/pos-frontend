// ============================================================
// POS Recommendation Algorithms — read later by ALGORITHM NAME
// File: src/util/recommendationAlgorithms.js
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: Apriori Lite (Market-Basket: support/confidence/lift)
// USE: "Bought A => suggest B".
//   support(A,B)    = pairCount / totalOrders
//   confidence(A=>B)= pairCount / countA
//   lift(A=>B)      = confidence / P(B)  (>1 = real affinity, 1 = coincidence)
// RANK: confidence * lift * log(1 + support*100). Old code ranked by
// confidence*log(support) which over-suggests globally popular items
// (milk with everything). Multiplying by lift demotes coincidences.
// INPUT: orders = [{items:[{productId}]}]. WORLDWIDE USE: Amazon/POS cross-sell.
// ------------------------------------------------------------
export function aprioriSuggest({
  orders = [],
  cartIds = [],
  topK = 3,
  minSupport = 0.01,
  minConfidence = 0,
  minLift = 0,
}) {
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
    if (confidence < minConfidence) continue;
    // ALGORITHM: Lift — P(B|A)/P(B). Filters "popular with everything".
    const pSuggest = (countA.get(suggest) || 0) / total;
    const lift = pSuggest > 0 ? confidence / pSuggest : 0;
    if (lift < minLift) continue;
    scored.push({
      productId: suggest,
      support: Number(support.toFixed(4)),
      confidence: Number(confidence.toFixed(4)),
      lift: Number(lift.toFixed(4)),
      score: confidence * Math.max(0.1, lift) * Math.log10(1 + support * 100),
    });
  }
  // ALGORITHM: Descending Sort for ranking + Top-K slice
  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

// ------------------------------------------------------------
// ALGORITHM NAME: Item-Item Cosine with Bayesian Shrinkage
// USE: Apriori lift explodes for rare pairs (bought once together =>
// lift 50). Cosine over order-vectors with shrinkage:
//   sim = dot / (||a||*||b||) * (pair / (pair + k))
// k (default 5) pulls rare-pair scores toward 0 — a continuous discount,
// not a min-support cliff. Sparse-basket friendly.
// INPUT: same orders/cartIds. Returns [{ productId, cosine, pair, score }].
// ------------------------------------------------------------
export function cosineSuggest({ orders = [], cartIds = [], topK = 3, shrinkage = 5 } = {}) {
  const total = (orders || []).length;
  if (!total || !cartIds?.length) return [];
  const k = Math.max(0, Number(shrinkage) || 0);
  const inCart = new Set(cartIds.map(String));
  const baskets = (orders || []).map((o) => new Set((o.items || []).map((i) => String(i.productId ?? i.id ?? i)).filter(Boolean)));
  const df = new Map(); // item -> #baskets containing it
  const co = new Map(); // "a|b" sorted -> #baskets containing both
  for (const b of baskets) {
    for (const id of b) df.set(id, (df.get(id) || 0) + 1);
    const ids = [...b];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = [ids[i], ids[j]].sort().join("|");
        co.set(key, (co.get(key) || 0) + 1);
      }
    }
  }
  const agg = new Map(); // suggest -> { num, den }
  for (const [key, pair] of co) {
    const [x, y] = key.split("|");
    const xIn = inCart.has(x);
    const yIn = inCart.has(y);
    if (xIn === yIn) continue;
    const suggest = xIn ? y : x;
    if (inCart.has(suggest)) continue;
    const anchor = xIn ? x : y;
    const cosine = pair / Math.sqrt((df.get(anchor) || 1) * (df.get(suggest) || 1));
    const shrunk = cosine * (pair / (pair + k));
    const cur = agg.get(suggest) || { score: 0, pair: 0, cosine: 0 };
    // Max-pool across anchors: strongest evidence wins.
    if (shrunk > cur.score) agg.set(suggest, { score: shrunk, pair, cosine });
  }
  return [...agg.entries()]
    .map(([productId, v]) => ({ productId, ...v, score: Number(v.score.toFixed(4)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, topK));
}
