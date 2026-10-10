// ============================================================
// BEST POS ALGORITHM — read later by ALGORITHM NAME
// File: src/util/searchAlgorithms.js
// Why best: cashier search runs on EVERY sale. Typo/barcode-tolerant
// instant ranking = fastest checkout, fewer dead sales.
// Ranking is a CONTINUOUS 0..100 similarity score (field-weighted edit +
// trigram + Jaro-Winkler signals), not a fixed 100/80/60/40/15 ladder.
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: Text Normalization (lowercase + trim + de-space)
// USE: Pre-step so "  Coca-Cola " == "coca cola".
// ------------------------------------------------------------
export function normalizeText(v = "") {
  return String(v || "")
    .toLowerCase()
    .trim()
    .replace(/[-_+/.,:;|]+/g, " ")
    .replace(/\s+/g, " ");
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
// ALGORITHM NAME: Optimal String Alignment (restricted Damerau-Levenshtein)
// USE: Counts an adjacent transposition as 1 edit ("amdin"->"admin" = 1,
// Levenshtein says 2). Strict superset of Levenshtein for ranking.
// HOW: Levenshtein DP + transposition recurrence, O(m*n).
// ------------------------------------------------------------
export function optimalStringAlignmentDistance(a = "", b = "") {
  const s = normalizeText(a);
  const t = normalizeText(b);
  const m = s.length;
  const n = t.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...new Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && s[i - 1] === t[j - 2] && s[i - 2] === t[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // transposition
      }
    }
  }
  return d[m][n];
}

// Backward-compatible name used by the current product-ranking implementation.
export const damerauLevenshtein = optimalStringAlignmentDistance;

// ------------------------------------------------------------
// ALGORITHM NAME: Jaro-Winkler Similarity (0..1)
// USE: Prefix-biased typo signal blended into the continuous score.
// ------------------------------------------------------------
export function jaroWinkler(a = "", b = "") {
  const s = normalizeText(a);
  const t = normalizeText(b);
  if (s === t) return 1;
  const m = s.length;
  const n = t.length;
  if (!m || !n) return 0;
  const range = Math.max(0, Math.floor(Math.max(m, n) / 2) - 1);
  const sHit = new Array(m).fill(false);
  const tHit = new Array(n).fill(false);
  let matches = 0;
  for (let i = 0; i < m; i++) {
    const lo = Math.max(0, i - range);
    const hi = Math.min(n - 1, i + range);
    for (let j = lo; j <= hi; j++) {
      if (!tHit[j] && s[i] === t[j]) {
        sHit[i] = true;
        tHit[j] = true;
        matches++;
        break;
      }
    }
  }
  if (!matches) return 0;
  let k = 0;
  let transpositions = 0;
  for (let i = 0; i < m; i++) {
    if (!sHit[i]) continue;
    while (!tHit[k]) k++;
    if (s[i] !== t[k]) transpositions++;
    k++;
  }
  const jaro = (matches / m + matches / n + (matches - transpositions / 2) / matches) / 3;
  let prefix = 0;
  for (let i = 0; i < Math.min(4, m, n); i++) {
    if (s[i] === t[i]) prefix++;
    else break;
  }
  return jaro + prefix * 0.1 * (1 - jaro);
}

// ------------------------------------------------------------
// ALGORITHM NAME: Char-Trigram Dice Similarity (0..1)
// USE: Handles missing spaces ("cocacola"~"coca cola") and partial words
// where edit distance on whole strings fails. Dice = 2|intersection|/(|A|+|B|).
// ------------------------------------------------------------
export function trigrams(s = "") {
  const t = `  ${normalizeText(s)}  `;
  const out = [];
  for (let i = 0; i + 3 <= t.length; i++) out.push(t.slice(i, i + 3));
  return out;
}

export function trigramDice(a = "", b = "") {
  const A = trigrams(a);
  const B = trigrams(b);
  if (!A.length || !B.length) return 0;
  const counts = new Map();
  for (const g of A) counts.set(g, (counts.get(g) || 0) + 1);
  let inter = 0;
  for (const g of B) {
    const c = counts.get(g) || 0;
    if (c > 0) {
      inter++;
      counts.set(g, c - 1);
    }
  }
  return (2 * inter) / (A.length + B.length);
}

// ------------------------------------------------------------
// ALGORITHM NAME: Continuous Field Similarity (0..1, blended)
// HOW: single number from three signals —
//   edit  = 1 - damerau/bestWordLen   (typos, transpositions)
//   tri   = trigram Dice              (spacing/partial)
//   jw    = Jaro-Winkler              (prefix-biased)
// blend = 0.5*edit + 0.3*tri + 0.2*jw, computed on the best-matching word
// (or whole value for short SKUs). Prefix/substring coverage scales the
// result instead of jumping between fixed buckets.
// ------------------------------------------------------------
function fieldSimilarity(query, value) {
  const q = normalizeText(query);
  const v = normalizeText(value);
  if (!q || !v) return 0;
  if (v === q) return 1;
  const coverage = q.length / v.length; // 0..>1
  if (v.startsWith(q)) return Math.min(1, 0.82 + 0.18 * Math.min(1, coverage));
  if (v.includes(q)) return Math.min(1, 0.58 + 0.22 * Math.min(1, coverage));
  // Word-level fuzzy: compare against each token, keep the best blend.
  const tokens = v.split(" ").filter(Boolean);
  let best = 0;
  const candidates = tokens.length && q.length >= 3 ? [...tokens, v] : [v];
  for (const tok of candidates) {
    if (Math.abs(tok.length - q.length) > Math.max(3, Math.floor(q.length / 2))) continue;
    const maxLen = Math.max(tok.length, q.length) || 1;
    const edit = 1 - damerauLevenshtein(tok, q) / maxLen;
    const tri = trigramDice(tok, q);
    const jw = jaroWinkler(tok, q);
    const blend = 0.5 * edit + 0.3 * tri + 0.2 * jw;
    if (blend > best) best = blend;
  }
  return best;
}

// Noise gate: similarities below this are indistinguishable from random.
const NOISE_FLOOR = 0.42;

// ------------------------------------------------------------
// ALGORITHM NAME: Continuous Product Rank (0..100, field-weighted max)
// USE: score = 100 * max over fields(fieldSim * fieldWeight), floored at 0.
// Weights: SKU/ID 1.2 (barcode precision matters), name 1.0, category 0.5.
// Exact identity still returns 100 (scanner fast path, not a rank bucket).
// ------------------------------------------------------------
export function scoreProduct(query, p) {
  if (!p) return 0;
  const q = normalizeText(query);
  if (!q) return 1; // empty query = show all
  const name = normalizeText(p.name);
  const sku = normalizeText(p.sku);
  const cat = normalizeText(p.category?.name || p.category);
  const id = normalizeText(p.id ?? p._id);
  if ((sku && sku === q) || (id && id === q) || (name && name === q)) return 100;
  const fields = [
    [name, 1.0],
    [sku, 1.2],
    [id, 1.2],
    [cat, 0.5],
  ];
  let best = 0;
  for (const [val, w] of fields) {
    if (!val) continue;
    const s = fieldSimilarity(q, val) * w;
    if (s > best) best = s;
  }
  best = Math.min(1, best);
  if (best < NOISE_FLOOR) return 0;
  return Math.round(best * 100);
}

// ------------------------------------------------------------
// ALGORITHM NAME: Rank + Filter + Top-K Sort (Best-match first)
// USE: Filters to score>0 then sorts DESC by score. This is THE best
// algorithm wiring for POS checkout search.
// ------------------------------------------------------------
export function fuzzySearchProducts(products = [], query = "", limit = 200) {
  const topK = Math.max(1, Math.floor(Number(limit) || 200));
  const q = normalizeText(query);
  if (!q) return (products || []).slice(0, topK);
  return (products || [])
    .map((p) => ({ p, score: scoreProduct(q, p) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((r) => r.p);
}

// ------------------------------------------------------------
// ALGORITHM NAME: Generic Continuous Ranked Search (any keys)
// USE: Same continuous similarity per key fn, max across keys. Replaces
// plain `filter(includes)` for customers/orders/inventory.
// ------------------------------------------------------------
export function fuzzySearchByKeys(items = [], query = "", keyFns = [], limit = 500) {
  const topK = Math.max(1, Math.floor(Number(limit) || 500));
  const q = normalizeText(query);
  if (!q) return (items || []).slice(0, topK);
  const scored = [];
  for (const item of items || []) {
    let best = 0;
    for (const fn of keyFns) {
      const val = normalizeText(fn(item));
      if (!val) continue;
      if (val === q) {
        best = 100;
        break;
      }
      const s = fieldSimilarity(q, val);
      if (s * 100 > best) best = Math.round(Math.min(1, s) * 100);
    }
    if (best > 0 && best / 100 >= NOISE_FLOOR) scored.push({ item, score: best });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, topK).map((r) => r.item);
}
