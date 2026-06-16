import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, X, CreditCard, Calendar } from 'lucide-react';
import subscriptionService from '@/services/subscriptionService';
import { 
  getDaysRemaining, 
  getSubscriptionStatus, 
  createSubscriptionNotification,
  SUBSCRIPTION_STATUS 
} from '@/util/subscriptionUtils';
import { toast } from 'sonner';

const SubscriptionNotificationBanner = ({ subscription, onRenewClick }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (subscription?.subscriptionExpiry) {
      const daysRemaining = getDaysRemaining(subscription.subscriptionExpiry);
      const notificationData = createSubscriptionNotification(subscription, daysRemaining);
      setNotification(notificationData);
    }
  }, [subscription]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleActionClick = () => {
    if (notification?.type === 'EXPIRED' || notification?.type === 'CRITICAL') {
      onRenewClick?.();
    } else {
      onRenewClick?.();
    }
  };

  if (!isVisible || !notification || !subscription?.subscriptionExpiry) {
    return null;
  }

  const daysRemaining = getDaysRemaining(subscription.subscriptionExpiry);
  const status = getSubscriptionStatus(subscription.subscriptionExpiry);
  const statusStyle = SUBSCRIPTION_STATUS[status];

  return (
    <div
      style={{
        background: notification.type === 'EXPIRED' ? '#fef2f2' : 
                   notification.type === 'CRITICAL' ? '#fef3c7' : '#fef7ff',
        border: `1px solid ${notification.type === 'EXPIRED' ? '#fecaca' : 
                              notification.type === 'CRITICAL' ? '#fed7aa' : '#e9d5ff'}`,
        borderRadius: '12px',
        padding: '16px 20px',
        margin: '16px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'relative'
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: notification.type === 'EXPIRED' ? '#fee2e2' : 
                     notification.type === 'CRITICAL' ? '#fef3c7' : '#f3e8ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {notification.type === 'EXPIRED' ? (
          <AlertTriangle size={20} color="#dc2626" />
        ) : notification.type === 'CRITICAL' ? (
          <Clock size={20} color="#f59e0b" />
        ) : (
          <Bell size={20} color="#7c3aed" />
        )}
      </div>

      <div style={{ flex: 1 }}>
        <h4
          style={{
            margin: '0 0 4px',
            fontSize: '14px',
            fontWeight: '700',
            color: notification.type === 'EXPIRED' ? '#991b1b' : 
                   notification.type === 'CRITICAL' ? '#92400e' : '#5b21b6'
          }}
        >
          {notification.title}
        </h4>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: '12px',
            color: notification.type === 'EXPIRED' ? '#7f1d1d' : 
                   notification.type === 'CRITICAL' ? '#78350f' : '#4c1d95',
            lineHeight: '1.4'
          }}
        >
          {notification.message}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280' }}>
            <Calendar size={12} />
            Expires: {new Date(subscription.subscriptionExpiry).toLocaleDateString('en-IN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: statusStyle.color }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: statusStyle.color
              }}
            />
            {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days left`}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={handleActionClick}
          style={{
            padding: '8px 16px',
            background: '#1a1d23',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2d3748'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#1a1d23'}
        >
          <CreditCard size={12} />
          {notification.actionText}
        </button>

        <button
          onClick={handleDismiss}
          style={{
            width: '32px',
            height: '32px',
            background: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280'
          }}
          title="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default SubscriptionNotificationBanner;