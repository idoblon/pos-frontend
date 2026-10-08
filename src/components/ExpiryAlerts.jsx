import { isExpired, isNearExpiry } from "@/util/storeTypes";

// Store-admin + cashier alert strip: expired / near-expiry / low-batch visibility.
// Pure presentational — pass already-fetched products.
export default function ExpiryAlerts({ products = [], compact = false }) {
  const expired = products.filter((p) => isExpired(p));
  const near = products.filter((p) => isNearExpiry(p));
  if (!expired.length && !near.length) return null;
  return (
    <div
      style={{
        border: "1px solid #fecaca",
        background: "#fef2f2",
        borderRadius: 10,
        padding: compact ? "8px 12px" : "12px 16px",
        fontSize: 12,
        color: "#991b1b",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
      role="alert"
    >
      {expired.length > 0 && (
        <span><strong>{expired.length} expired</strong> — blocked at checkout: {expired.slice(0, 3).map((p) => p.name).join(", ")}{expired.length > 3 ? "…" : ""}</span>
      )}
      {near.length > 0 && (
        <span><strong>{near.length} near expiry (≤30d)</strong> — consider markdown / FEFO first: {near.slice(0, 3).map((p) => p.name).join(", ")}{near.length > 3 ? "…" : ""}</span>
      )}
    </div>
  );
}
