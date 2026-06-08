import React, { useState, useEffect } from 'react';
import { Bell, DollarSign, Check, Clock, Store, Eye, EyeOff, Calendar } from 'lucide-react';
import paymentNotificationService from '@/services/paymentNotificationService';

export default function PaymentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [filter]);

  const loadNotifications = () => {
    const allNotifications = paymentNotificationService.getAllNotifications();
    const filteredNotifications = filter === 'UNREAD' 
      ? allNotifications.filter(n => !n.isRead)
      : allNotifications;
    
    setNotifications(filteredNotifications);
    setStats(paymentNotificationService.getPaymentStats());
  };

  const handleMarkAsRead = (notificationId) => {
    paymentNotificationService.markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    paymentNotificationService.markAllAsRead();
    loadNotifications();
  };

  const formatAmount = (amount) => {
    return `₹${amount?.toLocaleString('en-IN') || '0'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: '24px', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: '#1a1d23' }}>
            Payment Notifications
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            Store subscription payments and confirmations
          </p>
        </div>
        {stats.unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            style={{
              padding: '8px 16px',
              background: '#1a1d23',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Check size={14} />
            Mark All Read
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: '#f0fdf4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={20} color='#166534' />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
              Today's Revenue
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: '700', color: '#1a1d23' }}>
              {formatAmount(stats.todayRevenue)}
            </p>
          </div>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Store size={20} color='#1d4ed8' />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
              Monthly Payments
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: '700', color: '#1a1d23' }}>
              {stats.monthlyPayments}
            </p>
          </div>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={20} color='#92400e' />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
              Unread Notifications
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: '700', color: '#1a1d23' }}>
              {stats.unreadCount}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
        {[
          { key: 'ALL', label: 'All Payments', count: notifications.length },
          { key: 'UNREAD', label: 'Unread', count: stats.unreadCount }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: filter === tab.key ? '2px solid #1a1d23' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: filter === tab.key ? 600 : 500,
              color: filter === tab.key ? '#1a1d23' : '#6b7280',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                padding: '2px 6px',
                background: filter === tab.key ? '#1a1d23' : '#e5e7eb',
                color: filter === tab.key ? 'white' : '#6b7280',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <Bell size={48} color='#e5e7eb' style={{ margin: '0 auto 16px' }} />
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            {filter === 'UNREAD' ? 'No unread notifications' : 'No payment notifications yet'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                background: 'white',
                border: `1px solid ${notification.isRead ? '#e5e7eb' : '#1a1d23'}`,
                borderRadius: '10px',
                padding: '20px',
                opacity: notification.isRead ? 0.8 : 1,
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <DollarSign size={20} color='#166534' />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#1a1d23' }}>
                      Payment Received - {notification.storeName}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                      {notification.ownerName} • {notification.subscriptionPlan} Plan
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: '#f0fdf4',
                    color: '#166534'
                  }}>
                    {formatAmount(notification.amount)}
                  </span>
                  
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      style={{
                        padding: '6px 10px',
                        background: '#1a1d23',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Eye size={12} />
                      Mark Read
                    </button>
                  )}
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '12px',
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '8px',
                marginTop: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Transaction ID
                  </span>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#1a1d23', fontFamily: 'monospace' }}>
                    {notification.transactionId}
                  </p>
                </div>
                
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Payment Method
                  </span>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#1a1d23' }}>
                    {notification.paymentMethod}
                  </p>
                </div>
                
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Email
                  </span>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#1a1d23' }}>
                    {notification.email}
                  </p>
                </div>
                
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Payment Time
                  </span>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#1a1d23', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={12} />
                    {formatDate(notification.paidAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}