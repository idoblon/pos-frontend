import api from "@/util/api";

// Fallback catalog for showcase/demo when the backend is unreachable.
// Live truth comes from GET /api/admin/plans (single source with backend
// SubscriptionPlanCatalog). Amounts are NPR per year.
export const SUBSCRIPTION_PLANS_FALLBACK = {
  BASIC: {
    name: "Basic",
    price: "NPR 3,500/year",
    priceValue: 3500,
    color: "#1a1d23",
    features: ["1 Store", "3 Branches", "10 Users", "5GB Storage", "Email Support"],
  },
  PROFESSIONAL: {
    name: "Professional",
    price: "NPR 7,000/year",
    priceValue: 7000,
    color: "#1a1d23",
    features: ["1 Store", "10 Branches", "50 Users", "25GB Storage", "Priority Support", "API Access"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: "NPR 10,000/year",
    priceValue: 10000,
    color: "#1a1d23",
    features: ["Unlimited Stores", "25 Branches", "200 Users", "100GB Storage", "24/7 Dedicated Support", "Custom Integrations"],
  },
};

const FEATURES_BY_PLAN = {
  BASIC: SUBSCRIPTION_PLANS_FALLBACK.BASIC.features,
  PROFESSIONAL: SUBSCRIPTION_PLANS_FALLBACK.PROFESSIONAL.features,
  ENTERPRISE: SUBSCRIPTION_PLANS_FALLBACK.ENTERPRISE.features,
};

export const formatNpr = (value) => `NPR ${Number(value || 0).toLocaleString("en-IN")}/year`;

/**
 * Fetch the admin plan catalog. Falls back to the local showcase catalog
 * when the backend is unreachable (live pending / demo mode).
 * Returns { plans, source: 'server' | 'fallback' }.
 */
export const fetchSubscriptionPlans = async () => {
  try {
    const res = await api.get("/api/admin/plans");
    const serverPlans = res.data?.plans;
    if (serverPlans && typeof serverPlans === "object") {
      const plans = {};
      for (const [key, p] of Object.entries(serverPlans)) {
        const upper = String(key).toUpperCase();
        plans[upper] = {
          name: p.name || upper,
          price: formatNpr(p.price),
          priceValue: Number(p.price) || 0,
          color: "#1a1d23",
          features: FEATURES_BY_PLAN[upper] || [],
          currency: p.currency || "NPR",
          billing: p.billing || "yearly",
          maxBranches: p.maxBranches,
          maxUsers: p.maxUsers,
        };
      }
      if (Object.keys(plans).length > 0) return { plans, source: "server" };
    }
  } catch {
    // demo/offline fallback below
  }
  return { plans: SUBSCRIPTION_PLANS_FALLBACK, source: "fallback" };
};

export const getUpgradeAmount = (plans, currentPlan, requestedPlan) => {
  const current = plans[currentPlan]?.priceValue || 0;
  const requested = plans[requestedPlan]?.priceValue || current;
  return Math.max(requested - current, requested);
};
