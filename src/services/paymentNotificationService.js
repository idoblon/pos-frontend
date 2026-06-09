// Payment Notification Service for Admin
// Handles payment confirmations and backend integration

class PaymentNotificationService {
  constructor() {
    // Keep minimal local cache for UI notifications
    this.notifications = JSON.parse(localStorage.getItem('adminPaymentNotifications') || '[]');
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
    try {
      const api = await import('@/util/api');
      const response = await api.default.get('/api/admin/payment-notifications');
      
      // Update local cache
      this.notifications = response.data;
      this.saveNotifications();
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch payment notifications:', error);
      // Return cached data as fallback
      return this.notifications;
    }
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
    try {
      const api = await import('@/util/api');
      await api.default.patch(`/api/admin/payment-notifications/${notificationId}/read`);
      
      // Update local cache
      this.notifications = this.notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      this.saveNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // Mark all notifications as read via backend
  async markAllAsRead() {
    try {
      const api = await import('@/util/api');
      await api.default.patch('/api/admin/payment-notifications/mark-all-read');
      
      // Update local cache
      this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
      this.saveNotifications();
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
      return response.data;
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