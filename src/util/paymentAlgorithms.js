// ============================================================
// POS Payment + Auth Algorithms — read later by ALGORITHM NAME
// File: src/util/paymentAlgorithms.js
// ============================================================

// ------------------------------------------------------------
// ALGORITHM NAME: Luhn Check (Mod-10 Card Validation)
// USE: Rejects mistyped card numbers before gateway call.
// HOW: Double every 2nd digit from right, subtract 9 if >9, sum % 10 == 0.
// WORLDWIDE USE: Visa/Mastercard validation in every POS.
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
// ALGORITHM NAME: Exponential Backoff (Rate-Limit / Login Lockout)
// USE: delay = base * 2^fails, capped. Stops brute force.
// FORMULA: min(cap, baseMs * 2^failCount)
// ------------------------------------------------------------
export function backoffDelayMs(failCount = 0, baseMs = 1000, capMs = 30000) {
  const n = Math.max(0, Number(failCount) || 0);
  const base = Number(baseMs) > 0 ? Number(baseMs) : 1000;
  const cap = Number(capMs) > 0 ? Number(capMs) : 30000;
  return Math.min(cap, base * 2 ** n);
}

// ------------------------------------------------------------
// ALGORITHM NAME: Token Bucket (OTP / API Throttle)
// USE: Bucket refills rate*elapsed, each request costs 1 token. No token = block.
// WORLDWIDE USE: OTP resend + API throttling.
// ------------------------------------------------------------
export function tokenBucketTake({ tokens, lastRefillMs, nowMs = Date.now(), capacity = 5, refillPerSec = 0.2 }) {
  const cap = Number(capacity) > 0 ? Number(capacity) : 5;
  const rate = Number(refillPerSec) > 0 ? Number(refillPerSec) : 0.2;
  const current = Number(tokens);
  const start = Number.isFinite(current) ? current : cap;
  const elapsed = Math.max(0, (nowMs - Number(lastRefillMs || nowMs)) / 1000);
  const refilled = Math.min(cap, start + elapsed * rate);
  if (refilled < 1) return { allowed: false, tokens: refilled, lastRefillMs: nowMs };
  return { allowed: true, tokens: refilled - 1, lastRefillMs: nowMs };
}
