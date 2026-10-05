import api from "@/util/api";

// Canonical frontend subscription catalog.
// Single source of truth for plan names, NPR/year pricing, limits and
// feature lists. The backend GET /api/admin/plans is consulted only for
// limit sync (maxBranches/maxUsers) — display prices/features always come
// from this file. Keep backend SubscriptionPlanCatalog in sync
// with PLAN_PRICES below.
//
// Fixed pricing (NPR/year, flat — no paid add-ons):
// - BASIC        NPR 75,000/yr  — 1 store, 3 branches, 10 users, 5GB
// - PROFESSIONAL NPR 135,000/yr — 1 store, 10 branches, 50 users, 25GB
// - ENTERPRISE   NPR 210,000/yr — unlimited stores, 25 branches/store,
//   200 users, 100GB
// Branch/user/storage limits are hard caps: exceeding a limit requires
// upgrading the plan, never a per-unit payment.

export const PLAN_PRICES = {
  BASIC: 75000,
  PROFESSIONAL: 135000,
  ENTERPRISE: 210000,
};

export const PLAN_LIMITS = {
  BASIC: { stores: 1, branches: 3, users: 10, storage: "5GB", storageGB: 5, support: "Email" },
  PROFESSIONAL: { stores: 1, branches: 10, users: 50, storage: "25GB", storageGB: 25, support: "Priority" },
  ENTERPRISE: { stores: "unlimited", branches: 25, users: 200, storage: "100GB", storageGB: 100, support: "24/7 Dedicated" },
};

// Fallback catalog for showcase/demo when the backend is unreachable.
// Live truth comes from GET /api/admin/plans (single source with backend
// SubscriptionPlanCatalog). Amounts are NPR per year.
export const SUBSCRIPTION_PLANS_FALLBACK = {
  BASIC: {
    name: "Basic",
    price: "NPR 75,000/year",
    priceValue: PLAN_PRICES.BASIC,
    color: "#1a1d23",
    features: ["1 Store", "3 Branches", "10 Users", "5GB Storage", "Core POS + Daily Sales Reports", "Inventory Management", "Email Support"],
  },
  PROFESSIONAL: {
    name: "Professional",
    price: "NPR 135,000/year",
    priceValue: PLAN_PRICES.PROFESSIONAL,
    color: "#1a1d23",
    features: ["1 Store", "10 Branches", "50 Users", "25GB Storage", "Advanced Analytics + Branch Targets", "Warehouse + Restock Transfers", "Priority Support", "API Access"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: "NPR 210,000/year",
    priceValue: PLAN_PRICES.ENTERPRISE,
    color: "#1a1d23",
    features: ["Unlimited Stores", "25 Branches per Store", "200 Users", "100GB Storage", "Custom Reports + Integrations", "Audit Log + Advanced Security", "White-label Options", "24/7 Dedicated Support"],
  },
};

export const formatNpr = (value) => `NPR ${Number(value || 0).toLocaleString("en-IN")}/year`;

/** Numeric NPR/year price for a plan key. */
export const getPlanPriceValue = (plan) =>
  PLAN_PRICES[String(plan || "").toUpperCase()] ?? PLAN_PRICES.BASIC;

/** Display label, e.g. "NPR 75,000/year". */
export const getPlanPriceLabel = (plan) => formatNpr(getPlanPriceValue(plan));

/**
 * Fetch the plan catalog for display in store-admin and POS-admin UIs.
 * The canonical local catalog (prices + features above) is ALWAYS the
 * display truth, so both admin systems show the same new planning.
 * When the backend is reachable, only its limits (maxBranches/maxUsers)
 * are overlaid — server prices never override the canonical fees, until
 * the backend SubscriptionPlanCatalog is synced to the same values.
 * Returns { plans, source: 'server' | 'fallback' } where source tells
 * whether limits were synced from the backend or are local defaults.
 */
export const fetchSubscriptionPlans = async () => {
  const plans = Object.fromEntries(
    Object.entries(SUBSCRIPTION_PLANS_FALLBACK).map(([key, p]) => [key, { ...p }]),
  );
  try {
    const res = await api.get("/api/admin/plans");
    const serverPlans = res.data?.plans;
    if (serverPlans && typeof serverPlans === "object" && Object.keys(serverPlans).length > 0) {
      for (const [key, p] of Object.entries(serverPlans)) {
        const upper = String(key).toUpperCase();
        if (!plans[upper]) continue;
        if (p.maxBranches != null) plans[upper].maxBranches = p.maxBranches;
        if (p.maxUsers != null) plans[upper].maxUsers = p.maxUsers;
        plans[upper].currency = p.currency || "NPR";
        plans[upper].billing = p.billing || "yearly";
      }
      return { plans, source: "server" };
    }
  } catch {
    // backend unreachable — canonical local catalog below
  }
  return { plans, source: "fallback" };
};

export const getUpgradeAmount = (plans, currentPlan, requestedPlan) => {
  const current = plans[currentPlan]?.priceValue || 0;
  const requested = plans[requestedPlan]?.priceValue || current;
  return Math.max(requested - current, requested);
};
