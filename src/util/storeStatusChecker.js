/**
 * Store Status Checker - Validates if store and branches are active
 */

export const STORE_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED', 
  EXPIRED: 'EXPIRED',
  INACTIVE: 'INACTIVE'
};

export const SUSPENSION_REASONS = {
  PAYMENT_FAILURE: 'Payment failure - Multiple failed payment attempts',
  ADMIN_SUSPENSION: 'Administrative suspension',
  POLICY_VIOLATION: 'Policy violation',
  EXPIRED_SUBSCRIPTION: 'Subscription expired'
};

/**
 * Check if store is active and accessible
 */
export const isStoreActive = (storeData) => {
  if (!storeData) return false;
  
  const status = storeData.status?.toLowerCase();
  return status === 'active' || status === STORE_STATUS.ACTIVE.toLowerCase();
};

/**
 * Check if store is suspended
 */
export const isStoreSuspended = (storeData) => {
  if (!storeData) return false;
  
  const status = storeData.status?.toLowerCase();
  const isSuspendedStatus = status === 'suspended' || status === STORE_STATUS.SUSPENDED.toLowerCase();
  
  // Also check if there's suspension data but status is ACTIVE (recently reactivated)
  if (status === 'active' && storeData.suspendedAt && !storeData.suspensionReason) {
    return false; // Was suspended but now active
  }
  
  return isSuspendedStatus && storeData.suspendedAt;
};

/**
 * Get suspension details for a store
 */
export const getSuspensionDetails = (storeData) => {
  if (!isStoreSuspended(storeData)) return null;
  
  return {
    suspendedAt: storeData.suspendedAt || new Date().toISOString(),
    reason: storeData.suspensionReason || SUSPENSION_REASONS.ADMIN_SUSPENSION,
    daysSuspended: storeData.suspendedAt 
      ? Math.floor((new Date() - new Date(storeData.suspendedAt)) / (1000 * 60 * 60 * 24))
      : 0
  };
};

/**
 * Validate user access based on store status
 */
export const validateUserAccess = async (userData) => {
  if (!userData.storeId) {
    return { allowed: true, reason: 'No store validation needed' };
  }

  try {
    const storeStatus = await checkStoreStatus(userData.storeId);

    if (!storeStatus) {
      // Backend unreachable or store not found — fail open for UX but surface
      // a warning so the UI can retry. Do NOT silently mint a fake ACTIVE
      // record in localStorage (previous behavior masked real suspensions).
      return { allowed: true, reason: 'Store status unavailable, allowing access pending retry', degraded: true };
    }


    if (isStoreSuspended(storeStatus)) {
      const suspensionDetails = getSuspensionDetails(storeStatus);
      return {
        allowed: false,
        reason: 'Store is suspended',
        suspensionDetails,
        redirectTo: '/suspended'
      };
    }

    if (!isStoreActive(storeStatus)) {
      return {
        allowed: false,
        reason: 'Store is not active',
        redirectTo: '/inactive'
      };
    }

    return { allowed: true, reason: 'Access granted' };
  } catch (error) {
    console.error('Store status validation error:', error);
    // Fail open on network/validation errors for UX, but flag degraded mode.
    return {
      allowed: true,
      reason: 'Validation error, allowing access',
      degraded: true
    };
  }
};

/**
 * Check store status from the backend (single source of truth).
 * Returns null when the status cannot be determined.
 */
const checkStoreStatus = async (storeId) => {
  try {
    const { default: secureStorage } = await import('./secureStorage');
    const token = secureStorage.getToken();
    if (!token) return null;

    const { default: api } = await import('@/util/api');
    const response = await api.get(`/api/stores/${encodeURIComponent(storeId)}`);
    const store = response.data;
    if (!store) return null;

    return {
      id: store.id ?? storeId,
      status: (store.status || 'UNKNOWN').toUpperCase(),
      suspendedAt: store.suspendedAt || null,
      suspensionReason: store.suspensionReason || null
    };
  } catch (error) {
    console.error('Store status API call failed:', error?.response?.status || error?.message);
    return null;
  }
};

/**
 * Block all branches under a suspended store
 */
export const updateBranchStatus = (storeId, status) => {
  // In real implementation, this would update branch status in database
  
  // Update local storage for demo purposes
  const branchData = localStorage.getItem('branchData');
  if (branchData) {
    const branches = JSON.parse(branchData);
    const updatedBranches = branches.map(branch => {
      if (branch.storeId === storeId) {
        return {
          ...branch,
          status: status,
          updatedAt: new Date().toISOString(),
          reason: status === 'SUSPENDED' ? 'Store suspended by admin' : 'Store reactivated'
        };
      }
      return branch;
    });
    localStorage.setItem('branchData', JSON.stringify(updatedBranches));
  }
};

export default {
  isStoreActive,
  isStoreSuspended,
  getSuspensionDetails,
  validateUserAccess,
  updateBranchStatus,
  STORE_STATUS,
  SUSPENSION_REASONS
};