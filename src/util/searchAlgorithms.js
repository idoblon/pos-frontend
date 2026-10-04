// ============================================================
// BEST POS ALGORITHM — read later by ALGORITHM NAME
// File: src/util/searchAlgorithms.js
// Why best: cashier search runs on EVERY sale. Typo/barcode-tolerant
// instant ranking = fastest checkout, fewer dead sales.
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: Text Normalization (lowercase + trim + de-space)
// USE: Pre-step so "  Coca-Cola " == "coca cola".
// ------------------------------------------------------------
export function normalizeText(v = "") {
  return String(v || "").toLowerCase().trim().replace(/\s+/g, " ");
}

// ------------------------------------------------------------
// ALGORITHM NAME: Levenshtein Distance (Edit Distance, DP)
// USE: Counts min inserts/deletes/substitutes to turn a->b.
// e.g. "coke" vs "coka" = 1. Tolerates typos in POS search.
// HOW: DP matrix (m+1)x(n+1), O(m*n) time. m,n = tiny here (names/SKUs).
// ------------------------------------------------------------
export function levenshtein(a = "", b = "") {
  const s = normalizeText(a);
  const t = normalizeText(b);
  const m = s.length;
  const n = t.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1, // deletion
        curr[j - 1] + 1, // insertion
        prev[j - 1] + cost // substitution
      );
    }
    prev = curr;
  }
  return prev[n];
}

// ------------------------------------------------------------
// ALGORITHM NAME: Ranked Fuzzy Match (Exact > Prefix > Substring > Fuzzy)
// USE: Worldwide POS/Google-style ranking: best match on top.
// SCORES: exact SKU/ID=100, prefix=80, substring=60, fuzzy(lev<=2)=40-dist*10
// ------------------------------------------------------------
export function scoreProduct(query, p) {
  const q = normalizeText(query);
  if (!q) return 1; // empty query = show all
  const name = normalizeText(p.name);
  const sku = normalizeText(p.sku);
  const cat = normalizeText(p.category?.name || p.category);
  const id = normalizeText(p.id ?? p._id);

  // ALGORITHM: Exact-Match fast path (barcode scanner)
  if (sku === q || id === q) return 100;
  // ALGORITHM: Prefix Match (Trie-like behavior without the tree)
  if (name.startsWith(q) || sku.startsWith(q)) return 80;
  // ALGORITHM: Substring Match (Linear Search)
  if (name.includes(q) || sku.includes(q) || cat.includes(q)) return 60;

  // ALGORITHM: Fuzzy Match via Levenshtein on each word (typo tolerance)
  if (q.length >= 3) {
    const words = name.split(" ");
    let best = Infinity;
    for (const w of words) {
      if (!w) continue;
      // only compare similar-length words to keep it fast
      if (Math.abs(w.length - q.length) > 2) continue;
      const d = levenshtein(w, q);
      if (d < best) best = d;
    }
    const skuDist = sku ? levenshtein(sku, q) : Infinity;
    best = Math.min(best, skuDist);
    if (best <= 2) return 40 - best * 10; // dist 0->40, 1->30, 2->20
  }
  return 0;
}

// ------------------------------------------------------------
// ALGORITHM NAME: Rank + Filter + Top-K Sort (Best-match first)
// USE: Filters to score>0 then sorts DESC by score. This is THE best
// algorithm wiring for POS checkout search.
// ------------------------------------------------------------
export function fuzzySearchProducts(products = [], query = "", limit = 200) {
  const q = normalizeText(query);
  if (!q) return (products || []).slice(0, limit);
  return (products || [])
    .map((p) => ({ p, score: scoreProduct(q, p) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score) // ALGORITHM: Descending Sort for ranking
    .slice(0, limit)
    .map((r) => r.p);
}

// ------------------------------------------------------------
// ALGORITHM NAME: Generic Ranked Fuzzy Search (any keys)
// USE: Best-suited replacement for plain `filter(includes)` lists:
// customers (fullName/email/phone), orders (id/customerName), inventory.
// keys: e.g. [(c)=>c.fullName,(c)=>c.email,(c)=>c.phone]
// ------------------------------------------------------------
export function fuzzySearchByKeys(items = [], query = "", keyFns = [], limit = 500) {
  const q = normalizeText(query);
  if (!q) return (items || []).slice(0, limit);
  const scored = [];
  for (const item of items || []) {
    let best = 0;
    for (const fn of keyFns) {
      const val = normalizeText(fn(item));
      if (!val) continue;
      if (val === q) best = Math.max(best, 100); // exact
      else if (val.startsWith(q)) best = Math.max(best, 80); // prefix
      else if (val.includes(q)) best = Math.max(best, 60); // substring
      else if (q.length >= 3) {
        // fuzzy per word, Levenshtein <= 2
        for (const w of val.split(" ")) {
          if (!w || Math.abs(w.length - q.length) > 2) continue;
          const d = levenshtein(w, q);
          if (d <= 2) best = Math.max(best, 40 - d * 10);
        }
      }
      if (best === 100) break;
    }
    if (best > 0) scored.push({ item, score: best });
  }
  // ALGORITHM: Descending Sort for ranking + Top-K
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((r) => r.item);
}
