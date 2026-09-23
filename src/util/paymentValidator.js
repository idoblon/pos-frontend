import { isPaymentRequiredBeforeActivation } from "@/util/adminSystemSettings";

/**
 * Payment Validator - Checks if store has completed subscription payment via backend
 */

export const PAYMENT_STATUS = {
  PAID: 'PAID',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  NOT_FOUND: 'NOT_FOUND'
};

/**
 * Check if store has completed payment via backend.
 * Uses the public pre-login endpoint first (no auth required), falling back
 * to the admin endpoint for authenticated sessions.
 */
export const checkStorePaymentStatus = async (storeId, email) => {
  try {
    const api = await import('@/util/api');
    try {
      const response = await api.default.get(`/api/public/store-payment/status`, {
        params: { email }
      });
      return normalizePaymentStatus(response.data);
    } catch {
      const response = await api.default.get(`/api/admin/store-payment/status`, {
        params: { storeId, email }
      });
      return normalizePaymentStatus(response.data);
    }
  } catch (error) {
    console.error('Payment status check error:', error);
    return {
      status: PAYMENT_STATUS.FAILED,
      message: 'Unable to verify payment status'
    };
  }
};

const normalizePaymentStatus = (data = {}) => ({
  status: data.status,
  message: data.message,
  paymentLink: data.paymentLink,
  plan: data.plan,
  storeName: data.storeName,
  credentials: data.credentials
});

/**
 * Validate store access based on payment status via backend
 */
export const validateStoreAccess = async (userData) => {
  if (!isPaymentRequiredBeforeActivation()) {
    return {
      allowed: true,
      reason: 'Payment requirement disabled by POS admin settings'
    };
  }

  if (!userData.storeId && !userData.email) {
    return {
      allowed: false,
      reason: 'Store information not found'
    };
  }

  const paymentStatus = await checkStorePaymentStatus(userData.storeId, userData.email);

  switch (paymentStatus.status) {
    case PAYMENT_STATUS.PAID:
      return {
        allowed: true,
        reason: 'Access granted',
        credentials: paymentStatus.credentials
      };

    case PAYMENT_STATUS.PENDING:
      return {
        allowed: false,
        reason: paymentStatus.message,
        redirectTo: '/payment-required',
        paymentDetails: {
          paymentLink: paymentStatus.paymentLink,
          plan: paymentStatus.plan,
          storeName: paymentStatus.storeName
        }
      };

    case PAYMENT_STATUS.NOT_FOUND:
      return {
        allowed: false,
        reason: 'Store registration not found',
        redirectTo: '/signup'
      };

    default:
      return {
        allowed: false,
        reason: 'Payment verification failed',
        redirectTo: '/contact-support'
      };
  }
};

/**
 * Block access for non-paying stores
 */
export const enforcePaymentRequirement = (userRole, storeData) => {
  // Admin users can always access
  if (userRole === 'ROLE_ADMIN') {
    return { allowed: true };
  }

  if (!isPaymentRequiredBeforeActivation()) {
    return { allowed: true };
  }

  // For store-related roles, check payment status
  if (['ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER', 'ROLE_BRANCH_MANAGER', 'ROLE_BRANCH_CASHIER'].includes(userRole)) {
    return validateStoreAccess(storeData);
  }

  return { allowed: true };
};

export default {
  checkStorePaymentStatus,
  validateStoreAccess,
  enforcePaymentRequirement,
  PAYMENT_STATUS
};
