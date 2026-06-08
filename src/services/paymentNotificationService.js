// Payment Notification Service for Admin
// Handles payment confirmations from stores and notifies admin

class PaymentNotificationService {
  constructor() {
    this.notifications = JSON.parse(localStorage.getItem('adminPaymentNotifications') || '[]');
  }

  // Simulate store making payment after approval
  simulateStorePayment(storeData, paymentDetails) {
    const paymentNotification = {
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      storeId: storeData.id,
      storeName: storeData.storeName,
      ownerName: storeData.ownerName,
      email: storeData.email,
      phone: storeData.phone,
      subscriptionPlan: storeData.subscriptionPlan,
      amount: paymentDetails.amount,
      paymentMethod: paymentDetails.method || 'Online Payment',
      transactionId: paymentDetails.transactionId || `TXN${Date.now()}`,
      status: 'COMPLETED',
      paidAt: new Date().toISOString(),
      notifiedAt: new Date().toISOString(),
      isRead: false
    };

    // Add to notifications
    this.notifications.unshift(paymentNotification);
    this.saveNotifications();

    // Update store status to ACTIVE
    this.updateStoreStatus(storeData.id, 'ACTIVE');

    console.log(`💰 Payment Received - Store: ${storeData.storeName} - Amount: ₹${paymentDetails.amount}`);
    
    return paymentNotification;
  }

  // Get all payment notifications
  getAllNotifications() {
    return [...this.notifications];
  }

  // Get unread notifications
  getUnreadNotifications() {
    return this.notifications.filter(n => !n.isRead);
  }

  // Mark notification as read
  markAsRead(notificationId) {
    this.notifications = this.notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    this.saveNotifications();
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
    this.saveNotifications();
  }

  // Update store status after payment
  updateStoreStatus(storeId, status) {
    const approvedStores = JSON.parse(localStorage.getItem('approvedRequests') || '[]');
    const updatedStores = approvedStores.map(store =>
      store.requestId === storeId 
        ? { ...store, status: status, activatedAt: new Date().toISOString() }
        : store
    );
    localStorage.setItem('approvedRequests', JSON.stringify(updatedStores));
  }

  // Save notifications to localStorage
  saveNotifications() {
    localStorage.setItem('adminPaymentNotifications', JSON.stringify(this.notifications));
  }

  // Clear old notifications (older than 30 days)
  clearOldNotifications() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.notifications = this.notifications.filter(n => 
      new Date(n.paidAt) > thirtyDaysAgo
    );
    this.saveNotifications();
  }

  // Get payment statistics
  getPaymentStats() {
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