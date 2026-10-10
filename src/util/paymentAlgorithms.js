// ============================================================
// POS Payment + Auth Algorithms — read later by ALGORITHM NAME
// File: src/util/paymentAlgorithms.js
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: Luhn Check (Mod-10 Card Validation)
// USE: Optional local typo-screen before gateway submission. A valid checksum
// does not prove a card is issued, active, authorized, or safe to charge.
// HOW: Double every 2nd digit from right, subtract 9 if >9, sum % 10 == 0.
// The payment provider remains responsible for payment validation.
// ------------------------------------------------------------
export function isValidCardLuhn(number = "") {
  const digits = String(number || "").replace(/\D/g, "");
  if (digits.length < 12) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

// ------------------------------------------------------------
// ALGORITHM NAME: Card Brand Detection (BIN prefix range scan)
// USE: Non-authoritative UI hint; never use this to route or authorize a charge.
// TABLE: longest prefixes are checked first. Current lookup is O(ranges).
// ------------------------------------------------------------
const BIN_RANGES = [
  // [lowPrefix, highPrefix, prefixLen, brand] sorted by (len DESC, low) so
  // longer (more specific) prefixes match first in the linear scan below.
  { low: 34, high: 34, len: 2, brand: "AMEX" },
  { low: 37, high: 37, len: 2, brand: "AMEX" },
  { low: 35, high: 35, len: 2, brand: "JCB" },
  { low: 51, high: 55, len: 2, brand: "MASTERCARD" },
  { low: 64, high: 65, len: 2, brand: "DISCOVER" }, // 64[4-9]+65, narrowed below
  { low: 2221, high: 2720, len: 4, brand: "MASTERCARD" },
  { low: 6011, high: 6011, len: 4, brand: "DISCOVER" },
  { low: 644, high: 649, len: 3, brand: "DISCOVER" },
  { low: 4, high: 4, len: 1, brand: "VISA" },
].sort((a, b) => b.len - a.len || a.low - b.low);

export function detectCardBrand(number = "") {
  const digits = String(number || "").replace(/\D/g, "");
  if (!digits) return "UNKNOWN";
  for (const r of BIN_RANGES) {
    if (digits.length < r.len) continue;
    const prefix = Number(digits.slice(0, r.len));
    if (!Number.isFinite(prefix)) continue;
    if (prefix >= r.low && prefix <= r.high) {
      if (r.brand === "DISCOVER" && r.len === 2 && prefix === 64) {
        const third = Number(digits[2]);
        if (!(third >= 4 && third <= 9)) continue; // 64x that isn't 644-649
      }
      return r.brand;
    }
  }
  return "UNKNOWN";
}

// ------------------------------------------------------------
// ALGORITHM NAME: Exponential Backoff (Rate-Limit / Login Lockout)
// USE: delay = base * 2^fails, capped. Stops brute force.
// FORMULA: min(cap, baseMs * 2^failCount)
// UPGRADE: optional Full Jitter (AWS Architecture Blog): sleep = random(0, cap)
// to avoid thundering-herd retries. Default off (deterministic, test-safe).
// ------------------------------------------------------------
export function backoffDelayMs(failCount = 0, baseMs = 1000, capMs = 30000, { jitter = false, random = Math.random } = {}) {
  const n = Math.max(0, Number(failCount) || 0);
  const base = Number(baseMs) > 0 ? Number(baseMs) : 1000;
  const cap = Number(capMs) > 0 ? Number(capMs) : 30000;
  const deterministic = Math.min(cap, base * 2 ** n);
  if (!jitter) return deterministic;
  // ALGORITHM NAME: Full Jitter — uniform(0, min(cap, base*2^n)).
  return Math.floor(random() * deterministic);
}

// ------------------------------------------------------------
// ALGORITHM NAME: Token Bucket (OTP / API Throttle)
// USE: Bucket refills rate*elapsed, each request costs 1 token. No token = block.
// WORLDWIDE USE: OTP resend + API throttling.
// UPGRADE: returns retryAfterMs + timeToFullMs so UI can show countdowns
// instead of a bare "try later".
// ------------------------------------------------------------
export function tokenBucketTake({ tokens, lastRefillMs, nowMs = Date.now(), capacity = 5, refillPerSec = 0.2 }) {
  const cap = Number(capacity) > 0 ? Number(capacity) : 5;
  const rate = Number(refillPerSec) > 0 ? Number(refillPerSec) : 0.2;
  const current = Number(tokens);
  const start = Number.isFinite(current) ? current : cap;
  const elapsed = Math.max(0, (nowMs - Number(lastRefillMs || nowMs)) / 1000);
  const refilled = Math.min(cap, start + elapsed * rate);
  if (refilled < 1) {
    return {
      allowed: false,
      tokens: refilled,
      lastRefillMs: nowMs,
      retryAfterMs: Math.ceil(((1 - refilled) / rate) * 1000),
      timeToFullMs: Math.ceil(((cap - refilled) / rate) * 1000),
    };
  }
  return {
    allowed: true,
    tokens: refilled - 1,
    lastRefillMs: nowMs,
    retryAfterMs: 0,
    timeToFullMs: Math.ceil(((cap - (refilled - 1)) / rate) * 1000),
  };
}
