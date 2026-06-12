// Payment Notification Service for Admin
// Handles payment confirmations and backend integration

const PLAN_PRICES = {
  BASIC: 3500,
  PROFESSIONAL: 7000,
  ENTERPRISE: 10000,
};

const PAID_PAYMENT_STATUSES = new Set(['COMPLETED', 'PAID', 'SUCCESS', 'SUCCESSFUL']);
const PAID_REQUEST_STATUSES = new Set(['APPROVED', 'ACTIVE', 'PAID']);

class PaymentNotificationService {
  constructor() {
    // Keep minimal local cache for UI notifications
    this.notifications = this.readCachedNotifications();
  }

  readCachedNotifications() {
    try {
      const cached = JSON.parse(localStorage.getItem('adminPaymentNotifications') || '[]');
      return Array.isArray(cached) ? cached : [];
    } catch {
      return [];
    }
  }

  extractList(data) {
    if (Array.isArray(data)) return data;

    const containers = [
      data,
      data?.data,
      data?.result,
      data?.payload,
    ].filter(Boolean);

    const keys = ['notifications', 'payments', 'paymentNotifications', 'records', 'items', 'content'];
    for (const container of containers) {
      if (Array.isArray(container)) return container;
      for (const key of keys) {
        if (Array.isArray(container?.[key])) return container[key];
      }
    }

    return [];
  }

  mergeNotifications(incoming) {
    const cached = this.readCachedNotifications();
    const readKeys = new Set(
      cached
        .filter((notification) => notification?.isRead)
        .map((notification) => this.getNotificationKey(notification))
        .filter(Boolean),
    );
    const merged = [...incoming, ...cached];
    const seen = new Set();

    return merged.filter((notification) => {
      const key = this.getNotificationKey(notification);

      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      if (readKeys.has(key)) {
        notification.isRead = true;
      }
      return true;
    });
  }

  getNotificationKey(notification) {
    return (
      notification?.id ||
      notification?.paymentId ||
      notification?._id ||
      notification?.transactionId ||
      notification?.paymentReference ||
      notification?.paymentDetails?.transactionId
    );
  }

  cachePaymentNotification(notification) {
    const next = this.mergeNotifications([notification]);
    this.notifications = next;
    this.saveNotifications();
    return notification;
  }

  getPlanAmount(plan) {
    return PLAN_PRICES[String(plan || '').toUpperCase()] || 0;
  }

  getStoredList(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  isPaidRegistrationRequest(request) {
    const paymentStatus = String(request?.paymentStatus || request?.payment?.status || '').toUpperCase();
    const status = String(request?.status || '').toUpperCase();

    if (PAID_PAYMENT_STATUSES.has(paymentStatus)) return true;
    return PAID_REQUEST_STATUSES.has(status) && status !== 'PAYMENT_PENDING';
  }

  registrationRequestToNotification(request) {
    if (!this.isPaidRegistrationRequest(request)) return null;

    const plan = request?.subscriptionPlan || request?.plan || request?.payment?.plan;
    const paymentDetails = request?.paymentDetails || request?.payment || {};
    const transactionId =
      request?.transactionId ||
      request?.paymentReference ||
      request?.paymentGatewayReference ||
      paymentDetails?.transactionId ||
      paymentDetails?.reference ||
      request?.reference;

    return {
      id:
        request?.paymentId ||
        paymentDetails?.id ||
        paymentDetails?._id ||
        `registration_payment_${request?.id || request?._id || transactionId || request?.email}`,
      storeId: request?.storeId || request?.store?._id || request?.store?.id,
      storeName: request?.storeName || request?.store?.storeName || request?.store?.name,
      ownerName: request?.ownerName || request?.fullName || request?.storeOwnerName,
      email: request?.email || request?.store?.email,
      subscriptionPlan: plan,
      amount: this.getPlanAmount(plan) || request?.paymentAmount || request?.subscriptionAmount || request?.amount || paymentDetails?.amount || 0,
      paymentMethod: request?.paymentMethod || paymentDetails?.method || paymentDetails?.paymentMethod || 'Subscription',
      transactionId,
      status: request?.paymentStatus || paymentDetails?.status || 'COMPLETED',
      paidAt:
        request?.paidAt ||
        request?.paymentCompletedAt ||
        request?.approvedAt ||
        request?.updatedAt ||
        request?.createdAt,
      isRead: Boolean(request?.isRead),
      source: 'registration-request',
    };
  }

  normalizeUpgradeRequest(request) {
    return {
      ...request,
      id: request?.id || request?._id || request?.requestId,
      storeId: String(request?.storeId ?? request?.store?.id ?? request?.store?._id ?? ''),
      currentPlan: String(request?.currentPlan || request?.fromPlan || 'BASIC').toUpperCase(),
      requestedPlan: String(request?.requestedPlan || request?.toPlan || request?.subscriptionPlan || 'BASIC').toUpperCase(),
      status: String(request?.status || request?.paymentStatus || 'PAYMENT_PENDING').toUpperCase(),
    };
  }

  isPaidUpgradeRequest(request) {
    return ['PAID', 'APPROVED', 'COMPLETED'].includes(String(request?.status || '').toUpperCase());
  }

  getUpgradeAmount(currentPlan, requestedPlan) {
    const current = this.getPlanAmount(currentPlan);
    const requested = this.getPlanAmount(requestedPlan);
    return Math.max(requested - current, requested);
  }

  upgradeRequestToNotification(rawRequest) {
    const request = this.normalizeUpgradeRequest(rawRequest);
    if (!this.isPaidUpgradeRequest(request)) return null;

    return {
      id: `upgrade_payment_${request.id || request.storeId || request.paymentReference}`,
      storeId: request.storeId,
      storeName: request.storeName || request.store?.storeName || request.store?.name,
      ownerName: request.ownerName || request.storeOwnerName || request.owner?.name,
      email: request.email || request.store?.email,
      subscriptionPlan: `${request.currentPlan} to ${request.requestedPlan}`,
      amount: request.amount || request.paymentAmount || this.getUpgradeAmount(request.currentPlan, request.requestedPlan),
      paymentMethod: request.paymentMethod || 'Subscription Upgrade',
      transactionId: request.paymentReference || request.transactionId || request.reference,
      paidAt: request.paidAt || request.paymentCompletedAt || request.approvedAt || request.updatedAt || request.createdAt,
      status: request.status,
      isRead: Boolean(request.isRead),
      source: 'subscription-upgrade',
    };
  }

  async getRegistrationPaymentNotifications() {
    try {
      const api = await import('@/util/api');
      const response = await api.default.get('/api/admin/registration-requests');
      return this.extractList(response.data)
        .map((request) => this.registrationRequestToNotification(request))
        .filter(Boolean);
    } catch (error) {
      console.error('Failed to fetch registration payment records:', error);
      return [];
    }
  }

  async getUpgradePaymentNotifications() {
    let requests = [];

    try {
      const api = await import('@/util/api');
      const response = await api.default.get('/api/admin/subscription-upgrade-requests');
      requests = this.extractList(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription upgrade payment records:', error);
    }

    const localRequests = this.getStoredList('subscriptionUpgradeRequests');

    return [...requests, ...localRequests]
      .map((request) => this.upgradeRequestToNotification(request))
      .filter(Boolean);
  }

  // Process store payment through backend
  async processStorePayment(storeData, paymentDetails) {
    try {
      // Call backend payment completion endpoint
      const api = await import('@/util/api');
      const response = await api.default.post('/api/admin/store-payment/complete', {
        storeId: storeData.id,
        storeName: storeData.storeName,
        ownerName: storeData.ownerName,
        email: storeData.email,
        phone: storeData.phone,
        subscriptionPlan: storeData.subscriptionPlan,
        paymentDetails: {
          amount: paymentDetails.amount,
          method: paymentDetails.method,
          transactionId: paymentDetails.transactionId
        }
      });

      console.log(`💰 Payment processed: ${storeData.storeName} - ₹${paymentDetails.amount.toLocaleString('en-IN')}`);
      
      // Update local notification cache
      const paymentNotification = {
        id: response.data.paymentId || `payment_${Date.now()}`,
        storeId: storeData.id,
        storeName: storeData.storeName,
        ownerName: storeData.ownerName,
        email: storeData.email,
        amount: paymentDetails.amount,
        paymentMethod: paymentDetails.method,
        transactionId: paymentDetails.transactionId,
        status: 'COMPLETED',
        paidAt: new Date().toISOString(),
        isRead: false
      };

      this.notifications.unshift(paymentNotification);
      this.saveNotifications();
      
      return response.data;
    } catch (error) {
      console.error('Backend payment processing failed:', error);
      throw error;
    }
  }

  // Get payment notifications from backend
  async getPaymentNotifications() {
    let notifications = [];

    try {
      const api = await import('@/util/api');
      const response = await api.default.get('/api/admin/payment-notifications');
      notifications = this.extractList(response.data);
    } catch (error) {
      console.error('Failed to fetch payment notifications:', error);
    }

    const registrationPayments = await this.getRegistrationPaymentNotifications();
    const upgradePayments = await this.getUpgradePaymentNotifications();

    // Update local cache while preserving locally completed public payments.
    this.notifications = this.mergeNotifications([...notifications, ...registrationPayments, ...upgradePayments]);
    this.saveNotifications();

    return this.notifications;
  }

  // Get all payment notifications
  getAllNotifications() {
    return [...this.notifications];
  }

  // Get unread notifications
  getUnreadNotifications() {
    return this.notifications.filter(n => !n.isRead);
  }

  // Mark notification as read via backend
  async markAsRead(notificationId) {
    this.notifications = this.readCachedNotifications().map(n =>
      this.getNotificationKey(n) === notificationId ? { ...n, isRead: true } : n
    );
    this.saveNotifications();

    try {
      const api = await import('@/util/api');
      await api.default.patch(`/api/admin/payment-notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // Mark all notifications as read via backend
  async markAllAsRead() {
    this.notifications = this.readCachedNotifications().map(n => ({ ...n, isRead: true }));
    this.saveNotifications();

    try {
      const api = await import('@/util/api');
      await api.default.patch('/api/admin/payment-notifications/mark-all-read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  // Save notifications to localStorage (cache only)
  saveNotifications() {
    localStorage.setItem('adminPaymentNotifications', JSON.stringify(this.notifications));
  }

  // Get payment statistics from backend
  async getPaymentStats() {
    try {
      const api = await import('@/util/api');
      const response = await api.default.get('/api/admin/payment-stats');
      return response.data?.data || response.data?.stats || response.data;
    } catch {
      return this.calculateLocalStats();
    }
  }

  // Fallback local stats calculation
  calculateLocalStats() {
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const todayPayments = this.notifications.filter(n => 
      new Date(n.paidAt).toDateString() === today
    );

    const monthlyPayments = this.notifications.filter(n => {
      const paymentDate = new Date(n.paidAt);
      return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
    });

    const totalRevenue = this.notifications.reduce((sum, n) => sum + (n.amount || 0), 0);
    const monthlyRevenue = monthlyPayments.reduce((sum, n) => sum + (n.amount || 0), 0);
    const todayRevenue = todayPayments.reduce((sum, n) => sum + (n.amount || 0), 0);

    return {
      totalPayments: this.notifications.length,
      todayPayments: todayPayments.length,
      monthlyPayments: monthlyPayments.length,
      totalRevenue,
      monthlyRevenue,
      todayRevenue,
      unreadCount: this.getUnreadNotifications().length
    };
  }
}

// Export singleton instance
export default new PaymentNotificationService();
