export const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: "Basic",
    basePrice: 2999,
    currency: "रु",
    billing: "month",
    included: {
      stores: 1,
      branches: 3,
      users: 10,
      storage: "5GB",
      support: "Email"
    },
    addOns: {
      extraBranch: {
        price: 500,
        name: "Additional Branch",
        description: "Per branch beyond the included limit"
      },
      extraUser: {
        price: 100,
        name: "Additional User", 
        description: "Per user beyond the included limit"
      },
      extraStorage: {
        price: 200,
        name: "Extra Storage",
        description: "Per GB beyond the included limit"
      }
    },
    features: [
      "Basic POS System",
      "Inventory Management", 
      "Sales Reports",
      "Email Support"
    ]
  },
  PROFESSIONAL: {
    name: "Professional",
    basePrice: 5999,
    currency: "रु", 
    billing: "month",
    included: {
      stores: 1,
      branches: 10,
      users: 50,
      storage: "25GB",
      support: "Priority"
    },
    addOns: {
      extraBranch: {
        price: 400,
        name: "Additional Branch",
        description: "Per branch beyond the included limit"
      },
      extraUser: {
        price: 80,
        name: "Additional User",
        description: "Per user beyond the included limit"
      },
      extraStorage: {
        price: 150,
        name: "Extra Storage", 
        description: "Per GB beyond the included limit"
      }
    },
    features: [
      "Advanced POS System",
      "Multi-location Management",
      "Advanced Analytics",
      "Priority Support",
      "API Access"
    ]
  },
  ENTERPRISE: {
    name: "Enterprise",
    basePrice: 12999,
    currency: "रु",
    billing: "month", 
    included: {
      stores: "unlimited",
      branches: 25,
      users: 200,
      storage: "100GB",
      support: "24/7 Dedicated"
    },
    addOns: {
      extraBranch: {
        price: 300,
        name: "Additional Branch",
        description: "Per branch beyond the included limit"
      },
      extraUser: {
        price: 50,
        name: "Additional User",
        description: "Per user beyond the included limit"
      },
      extraStorage: {
        price: 100,
        name: "Extra Storage",
        description: "Per GB beyond the included limit"
      }
    },
    features: [
      "Complete POS Suite",
      "Unlimited Stores",
      "Custom Integrations", 
      "24/7 Dedicated Support",
      "Advanced Security",
      "White-label Options"
    ]
  }
};

export const calculateSubscriptionCost = (plan, usage) => {
  const planDetails = SUBSCRIPTION_PLANS[plan];
  if (!planDetails) return { total: 0, breakdown: [] };

  let total = planDetails.basePrice;
  const breakdown = [{
    item: `${planDetails.name} Plan Base`,
    quantity: 1,
    unitPrice: planDetails.basePrice,
    totalPrice: planDetails.basePrice
  }];

  // Calculate extra branches
  if (usage.branches > planDetails.included.branches) {
    const extraBranches = usage.branches - planDetails.included.branches;
    const branchCost = extraBranches * planDetails.addOns.extraBranch.price;
    total += branchCost;
    breakdown.push({
      item: "Extra Branches",
      quantity: extraBranches,
      unitPrice: planDetails.addOns.extraBranch.price,
      totalPrice: branchCost
    });
  }

  // Calculate extra users
  if (usage.users > planDetails.included.users) {
    const extraUsers = usage.users - planDetails.included.users;
    const userCost = extraUsers * planDetails.addOns.extraUser.price;
    total += userCost;
    breakdown.push({
      item: "Extra Users",
      quantity: extraUsers,
      unitPrice: planDetails.addOns.extraUser.price,
      totalPrice: userCost
    });
  }

  // Calculate extra storage
  if (usage.storage > parseInt(planDetails.included.storage)) {
    const extraStorage = usage.storage - parseInt(planDetails.included.storage);
    const storageCost = extraStorage * planDetails.addOns.extraStorage.price;
    total += storageCost;
    breakdown.push({
      item: "Extra Storage",
      quantity: extraStorage,
      unitPrice: planDetails.addOns.extraStorage.price,
      totalPrice: storageCost
    });
  }

  return { total, breakdown, currency: planDetails.currency };
};

export const getRecommendedPlan = (usage) => {
  const plans = Object.keys(SUBSCRIPTION_PLANS);
  let recommendedPlan = "BASIC";
  let lowestCost = Infinity;

  plans.forEach(plan => {
    const cost = calculateSubscriptionCost(plan, usage);
    if (cost.total < lowestCost) {
      lowestCost = cost.total;
      recommendedPlan = plan;
    }
  });

  return recommendedPlan;
};