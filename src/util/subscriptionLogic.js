// Canonical plan definitions (flat pricing — no paid add-ons).
// Branch/user/storage limits are hard caps; exceeding them requires a plan
// upgrade, never a per-unit payment.

export const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: "Basic",
    basePrice: 75000,
    currency: "रु",
    billing: "year",
    included: {
      stores: 1,
      branches: 3,
      users: 10,
      storage: "5GB",
      support: "Email"
    },
    features: [
      "1 Store · 3 Branches · 10 Users",
      "5GB Storage",
      "Core POS System",
      "Inventory Management",
      "Daily Sales + Shift Reports",
      "Email Support"
    ]
  },
  PROFESSIONAL: {
    name: "Professional",
    basePrice: 135000,
    currency: "रु",
    billing: "year",
    included: {
      stores: 1,
      branches: 10,
      users: 50,
      storage: "25GB",
      support: "Priority"
    },
    features: [
      "1 Store · 10 Branches · 50 Users",
      "25GB Storage",
      "Advanced POS System",
      "Multi-location + Warehouse Transfers",
      "Advanced Analytics + Branch Targets",
      "Priority Support",
      "API Access"
    ]
  },
  ENTERPRISE: {
    name: "Enterprise",
    basePrice: 210000,
    currency: "रु",
    billing: "year",
    included: {
      stores: "unlimited",
      branches: 25,
      users: 200,
      storage: "100GB",
      support: "24/7 Dedicated"
    },
    features: [
      "Unlimited Stores · 25 Branches/Store · 200 Users",
      "100GB Storage",
      "Complete POS Suite",
      "Custom Reports + Integrations",
      "24/7 Dedicated Support",
      "Advanced Security + Audit Log",
      "White-label Options"
    ]
  }
};

// Flat cost: every plan bills its base price regardless of usage within limits.
export const calculateSubscriptionCost = (plan) => {
  const planDetails = SUBSCRIPTION_PLANS[plan];
  if (!planDetails) return { total: 0, breakdown: [], currency: "रु" };

  return {
    total: planDetails.basePrice,
    breakdown: [{
      item: `${planDetails.name} Plan (flat yearly)`,
      quantity: 1,
      unitPrice: planDetails.basePrice,
      totalPrice: planDetails.basePrice
    }],
    currency: planDetails.currency
  };
};

// Does a usage profile fit inside a plan's hard caps?
export const planFitsUsage = (plan, usage = {}) => {
  const planDetails = SUBSCRIPTION_PLANS[plan];
  if (!planDetails) return false;
  const num = (v, fallback = 1) => {
    if (typeof v === "string") {
      const parsed = parseFloat(v);
      return Number.isFinite(parsed) ? parsed : fallback;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  const branches = num(usage.branches);
  const users = num(usage.users);
  const storage = num(usage.storage);
  const includedBranches = planDetails.included.branches === "unlimited" ? Infinity : planDetails.included.branches;
  const includedUsers = planDetails.included.users === "unlimited" ? Infinity : planDetails.included.users;
  const includedStorage = parseFloat(planDetails.included.storage);
  return branches <= includedBranches && users <= includedUsers && storage <= includedStorage;
};

// Smallest plan whose hard caps fit the requested usage.
export const getRecommendedPlan = (usage = {}) => {
  const order = ["BASIC", "PROFESSIONAL", "ENTERPRISE"];
  for (const plan of order) {
    if (planFitsUsage(plan, usage)) return plan;
  }
  return "ENTERPRISE";
};
