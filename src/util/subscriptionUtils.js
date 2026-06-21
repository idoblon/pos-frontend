// Subscription utility functions
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: 'Basic',
    price: 3500,
    duration: 365, // days
    features: ['1 Branch', '5 Users', 'Basic Reports', 'Email Support'],
    color: '#059669'
  },
  PROFESSIONAL: {
    name: 'Professional', 
    price: 7000,
    duration: 365,
    features: ['5 Branches', '25 Users', 'Advanced Reports', 'Priority Support', 'Analytics'],
    color: '#3b82f6'
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 10000,
    duration: 365,
    features: ['Unlimited Branches', 'Unlimited Users', 'Custom Reports', '24/7 Support', 'API Access'],
    color: '#7c3aed'
  }
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: { color: '#059669', bg: '#dcfce7', text: 'Active' },
  EXPIRED: { color: '#dc2626', bg: '#fee2e2', text: 'Expired' },
  EXPIRING_SOON: { color: '#f59e0b', bg: '#fef3c7', text: 'Expiring Soon' },
  SUSPENDED: { color: '#6b7280', bg: '#f3f4f6', text: 'Suspended' }
};

// Calculate subscription expiry date
export function calculateExpiryDate(purchaseDate, plan = 'BASIC') {
  const purchase = new Date(purchaseDate);
  if (isNaN(purchase.getTime())) return null;
  const planInfo = SUBSCRIPTION_PLANS[plan] || SUBSCRIPTION_PLANS.BASIC;
  const expiry = new Date(purchase.getTime() + (planInfo.duration * 24 * 60 * 60 * 1000));
  return expiry;
}

export function parseSubscriptionDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (Array.isArray(value)) {
    const [y, m, d, h = 0, min = 0, s = 0] = value;
    const date = new Date(y, m - 1, d, h, min, s);
    return isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

const pickFirstDate = (record, fields) => {
  for (const field of fields) {
    const date = parseSubscriptionDate(record?.[field]);
    if (date) return date;
  }
  return null;
};

export function getSubscriptionPurchaseDate(record) {
  return (
    pickFirstDate(record, [
      'subscriptionPurchaseDate',
      'purchaseDate',
      'purchasedAt',
      'subscriptionStartDate',
      'subscriptionStartedAt',
      'startDate',
      'startedAt',
      'paidAt',
      'paymentDate',
      'approvedAt',
      'createdAt',
    ]) ||
    pickFirstDate(record?.subscription, [
      'purchaseDate',
      'purchasedAt',
      'startDate',
      'startedAt',
      'createdAt',
    ]) ||
    pickFirstDate(record?.paymentDetails, ['paidAt', 'paymentDate', 'createdAt'])
  );
}

export function getSubscriptionExpiryDate(record, purchaseDate = getSubscriptionPurchaseDate(record)) {
  return (
    pickFirstDate(record, [
      'subscriptionExpiry',
      'subscriptionExpiryDate',
      'expiryDate',
      'expiresAt',
      'expirationDate',
      'subscriptionEndDate',
      'endDate',
      'validUntil',
    ]) ||
    pickFirstDate(record?.subscription, [
      'expiryDate',
      'expiresAt',
      'endDate',
      'validUntil',
    ]) ||
    (purchaseDate ? calculateExpiryDate(purchaseDate, record?.subscriptionPlan || record?.plan) : null)
  );
}

export function normalizeSubscriptionRecord(record = {}) {
  const purchaseDate = getSubscriptionPurchaseDate(record);
  const expiryDate = getSubscriptionExpiryDate(record, purchaseDate);
  const subscriptionPlan = String(
    record.subscriptionPlan ||
    record.plan ||
    record.subscription?.subscriptionPlan ||
    record.subscription?.plan ||
    'BASIC',
  ).toUpperCase();

  return {
    ...record,
    subscriptionPlan,
    subscriptionPurchaseDate: purchaseDate,
    subscriptionExpiry: expiryDate,
  };
}

export function formatSubscriptionDate(date, fallback = 'N/A') {
  const parsed = parseSubscriptionDate(date);
  return parsed ? parsed.toLocaleDateString('en-IN') : fallback;
}

// Calculate days remaining until expiry
export function getDaysRemaining(expiryDate) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Determine subscription status
export function getSubscriptionStatus(expiryDate) {
  const daysRemaining = getDaysRemaining(expiryDate);
  
  if (daysRemaining < 0) {
    return 'EXPIRED';
  } else if (daysRemaining <= 30) {
    return 'EXPIRING_SOON';
  } else {
    return 'ACTIVE';
  }
}

// Check if subscription is expiring soon
export function isExpiringSoon(expiryDate, days = 30) {
  const daysRemaining = getDaysRemaining(expiryDate);
  return daysRemaining > 0 && daysRemaining <= days;
}

// Format subscription price
export function formatPrice(amount) {
  return `रु ${amount.toLocaleString('en-IN')}`;
}

// Generate renewal price (same as original)
export function getRenewalPrice(plan) {
  return SUBSCRIPTION_PLANS[plan]?.price || SUBSCRIPTION_PLANS.BASIC.price;
}

// Create subscription notification message
export function createSubscriptionNotification(store, daysRemaining) {
  if (daysRemaining <= 0) {
    return {
      type: 'EXPIRED',
      title: 'Subscription Expired',
      message: `Your subscription has expired. Renew now to continue using the POS system.`,
      priority: 'HIGH',
      actionText: 'Renew Now'
    };
  } else if (daysRemaining <= 7) {
    return {
      type: 'CRITICAL',
      title: 'Subscription Expiring Soon',
      message: `Your subscription expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}. Renew now to avoid service interruption.`,
      priority: 'HIGH',
      actionText: 'Renew Now'
    };
  } else if (daysRemaining <= 30) {
    return {
      type: 'WARNING',
      title: 'Subscription Renewal Due',
      message: `Your subscription expires in ${daysRemaining} days. Consider renewing your plan.`,
      priority: 'MEDIUM',
      actionText: 'View Plans'
    };
  }
  return null;
}
