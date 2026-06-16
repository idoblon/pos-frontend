import api from '@/util/api';

class SubscriptionService {
  // Get store subscription details
  async getStoreSubscription(storeId) {
    try {
      const response = await api.get(`/api/stores/${storeId}/subscription`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch store subscription:', error);
      throw error;
    }
  }

  // Get current store's subscription (for store admin)
  async getCurrentSubscription() {
    try {
      const response = await api.get('/api/store/subscription/current');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch current subscription:', error);
      throw error;
    }
  }

  // Renew subscription
  async renewSubscription(storeId, planType, paymentDetails) {
    try {
      const response = await api.post(`/api/stores/${storeId}/subscription/renew`, {
        plan: planType,
        paymentDetails
      });
      return response.data;
    } catch (error) {
      console.error('Failed to renew subscription:', error);
      throw error;
    }
  }

  // Upgrade/Downgrade subscription plan
  async updateSubscriptionPlan(storeId, newPlan) {
    try {
      const response = await api.put(`/api/stores/${storeId}/subscription/plan`, {
        plan: newPlan
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update subscription plan:', error);
      throw error;
    }
  }

  // Get all expiring subscriptions (Admin only)
  async getExpiringSubscriptions(days = 60) {
    try {
      const response = await api.get(`/api/admin/subscriptions/expiring?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch expiring subscriptions:', error);
      throw error;
    }
  }

  // Get subscription notifications for store
  async getSubscriptionNotifications(storeId) {
    try {
      const response = await api.get(`/api/stores/${storeId}/subscription/notifications`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subscription notifications:', error);
      throw error;
    }
  }

  // Mark subscription notification as read
  async markNotificationRead(notificationId) {
    try {
      const response = await api.patch(`/api/subscription/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Create subscription for new store
  async createSubscription(storeId, plan, purchaseDate, paymentDetails) {
    try {
      const response = await api.post(`/api/stores/${storeId}/subscription`, {
        plan,
        purchaseDate,
        paymentDetails
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  // Get subscription statistics (Admin only)
  async getSubscriptionStats() {
    try {
      const response = await api.get('/api/admin/subscriptions/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subscription stats:', error);
      throw error;
    }
  }

  // Suspend subscription (Admin only)
  async suspendSubscription(storeId, reason) {
    try {
      const response = await api.patch(`/api/stores/${storeId}/subscription/suspend`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Failed to suspend subscription:', error);
      throw error;
    }
  }

  // Reactivate subscription (Admin only)
  async reactivateSubscription(storeId) {
    try {
      const response = await api.patch(`/api/stores/${storeId}/subscription/reactivate`);
      return response.data;
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      throw error;
    }
  }
}

export default new SubscriptionService();