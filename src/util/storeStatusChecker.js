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
    console.log(`🔍 Validating access for store ID: ${userData.storeId}`);
    const storeStatus = await checkStoreStatus(userData.storeId);
    
    if (!storeStatus) {
      console.log(`⚠️ No store status found for ${userData.storeId}, creating default ACTIVE entry`);
      // Create default ACTIVE status for stores not in suspension data
      const defaultStatus = {
        id: userData.storeId,
        status: 'ACTIVE',
        suspendedAt: null,
        suspensionReason: null
      };
      
      // Add this to localStorage for future reference
      const subscriptionData = localStorage.getItem('subscriptionData');
      if (subscriptionData) {
        try {
          const subscriptions = JSON.parse(subscriptionData);
          subscriptions.push({
            id: userData.storeId,
            storeId: userData.storeId,
            storeName: userData.storeName || 'Unknown Store',
            status: 'ACTIVE',
            suspendedAt: null,
            suspensionReason: null
          });
          localStorage.setItem('subscriptionData', JSON.stringify(subscriptions));
        } catch (error) {
          console.error('Error updating subscription data:', error);
        }
      }
      
      return { allowed: true, reason: 'Default ACTIVE status assigned' };
    }

    console.log(`📊 Store status for ${userData.storeId}:`, storeStatus);

    if (isStoreSuspended(storeStatus)) {
      const suspensionDetails = getSuspensionDetails(storeStatus);
      console.log(`🚫 Store ${userData.storeId} is suspended:`, suspensionDetails);
      return {
        allowed: false,
        reason: 'Store is suspended',
        suspensionDetails,
        redirectTo: '/suspended'
      };
    }

    if (!isStoreActive(storeStatus)) {
      console.log(`🚫 Store ${userData.storeId} is not active:`, storeStatus.status);
      return {
        allowed: false,
        reason: 'Store is not active',
        redirectTo: '/inactive'
      };
    }

    console.log(`✅ Access granted for store ${userData.storeId}`);
    return { allowed: true, reason: 'Access granted' };
  } catch (error) {
    console.error('Store status validation error:', error);
    // On error, allow access (fail-open for better UX)
    return {
      allowed: true,
      reason: 'Validation error, allowing access'
    };
  }
};

/**
 * Check store status from various sources
 */
const checkStoreStatus = async (storeId) => {
  // First try to get from subscription data in localStorage
  const subscriptionData = localStorage.getItem('subscriptionData');
  if (subscriptionData) {
    try {
      const subscriptions = JSON.parse(subscriptionData);
      const storeSubscription = subscriptions.find(sub => 
        sub.storeId === storeId || sub.id === storeId
      );
      if (storeSubscription) {
        console.log(`Found subscription data for store ${storeId}:`, storeSubscription);
        
        // If store is ACTIVE, don't return suspension data even if it exists
        if (storeSubscription.status === 'ACTIVE') {
          return {
            id: storeSubscription.storeId || storeSubscription.id,
            status: 'ACTIVE',
            suspendedAt: null,
            suspensionReason: null
          };
        }
        
        // Only return suspension data if status is actually SUSPENDED
        return {
          id: storeSubscription.storeId || storeSubscription.id,
          status: storeSubscription.status,
          suspendedAt: storeSubscription.status === 'SUSPENDED' ? storeSubscription.suspendedAt : null,
          suspensionReason: storeSubscription.status === 'SUSPENDED' ? storeSubscription.suspensionReason : null
        };
      }
    } catch (error) {
      console.error('Error parsing subscription data:', error);
    }
  }

  // Fallback to API call (in real implementation)
  try {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) return null;

    // This would be actual API call
    // const response = await api.get(`/stores/${storeId}/status`);
    // return response.data;
    
    // Mock response for demonstration - Default to ACTIVE unless specifically suspended
    console.log(`No subscription data found for store ${storeId}, defaulting to ACTIVE`);
    return {
      id: storeId,
      status: 'ACTIVE', // Default to active if no suspension data found
      suspendedAt: null,
      suspensionReason: null
    };
  } catch (error) {
    console.error('API call failed:', error);
    return null;
  }
};

/**
 * Block all branches under a suspended store
 */
export const updateBranchStatus = (storeId, status) => {
  // In real implementation, this would update branch status in database
  console.log(`Updating all branches for store ${storeId} to status: ${status}`);
  
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