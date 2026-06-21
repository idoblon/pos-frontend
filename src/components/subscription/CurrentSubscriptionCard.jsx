import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Crown,
  TrendingUp,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import subscriptionService from '@/services/subscriptionService';
import { 
  SUBSCRIPTION_PLANS, 
  SUBSCRIPTION_STATUS,
  getDaysRemaining, 
  getSubscriptionStatus, 
  formatSubscriptionDate,
  normalizeSubscriptionRecord
} from '@/util/subscriptionUtils';
import { toast } from 'sonner';

const CurrentSubscriptionCard = ({ onRenewClick, onUpgradeClick }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getCurrentSubscription();
      setSubscription(data ? normalizeSubscriptionRecord(data) : data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadSubscription();
      toast.success('Subscription details refreshed');
    } catch {
      toast.error('Failed to refresh subscription');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #f3f4f6',
          borderTop: '3px solid #1a1d23',
          borderRadius: '50%',
          margin: '0 auto 16px',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Loading subscription...</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center'
      }}>
        <AlertTriangle size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#1a1d23' }}>
          No Active Subscription
        </h3>
        <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280' }}>
          Your store needs an active subscription to use the POS system
        </p>
        <button
          onClick={() => onRenewClick?.()}
          style={{
            padding: '12px 24px',
            background: '#1a1d23',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Subscribe Now
        </button>
      </div>
    );
  }

  const planKey = String(subscription.subscriptionPlan || subscription.plan || 'BASIC').toUpperCase();
  const plan = SUBSCRIPTION_PLANS[planKey] || {
    name: planKey || 'Basic',
    price: 3500,
    color: '#059669',
    features: ['POS Access', 'Store Management']
  };
  const daysRemaining = subscription.subscriptionExpiry ? getDaysRemaining(subscription.subscriptionExpiry) : null;
  const status = subscription.subscriptionExpiry
    ? getSubscriptionStatus(subscription.subscriptionExpiry)
    : String(subscription.subscriptionStatus || 'ACTIVE').toUpperCase();
  const statusStyle = SUBSCRIPTION_STATUS[status] || SUBSCRIPTION_STATUS.ACTIVE;

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .subscription-price-heading > span:first-child {
          font-size: 0 !important;
        }
        .subscription-price-heading > span:first-child::before {
          content: 'NPR';
          font-size: 12px;
          font-weight: 800;
        }
      `}</style>
      
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: `linear-gradient(135deg, ${plan.color}10, ${plan.color}05)`,
          borderRadius: '50%',
          transform: 'translate(50px, -50px)'
        }} />

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Crown size={24} color="white" />
            </div>
            <div>
              <h2 style={{
                margin: '0 0 4px',
                fontSize: '20px',
                fontWeight: '700',
                color: '#1a1d23'
              }}>
                {plan.name} Plan
              </h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                Current subscription plan
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              background: statusStyle.bg,
              color: statusStyle.color
            }}>
              {statusStyle.text}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                width: '36px',
                height: '36px',
                background: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Refresh subscription"
            >
              <RefreshCw size={16} color="#6b7280" className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Subscription Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div className="subscription-price-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Calendar size={16} color={plan.color} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                PURCHASE DATE
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1d23' }}>
              {subscription.subscriptionPurchaseDate 
                ? formatSubscriptionDate(subscription.subscriptionPurchaseDate)
                : 'N/A'
              }
            </p>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Clock size={16} color={status === 'EXPIRED' ? '#dc2626' : status === 'EXPIRING_SOON' ? '#f59e0b' : plan.color} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                EXPIRES ON
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1d23' }}>
              {subscription.subscriptionExpiry 
                ? formatSubscriptionDate(subscription.subscriptionExpiry)
                : 'N/A'
              }
            </p>
            {subscription.subscriptionExpiry && (
              <p style={{ 
                margin: '4px 0 0', 
                fontSize: '12px', 
                color: daysRemaining <= 0 ? '#dc2626' : daysRemaining <= 30 ? '#f59e0b' : '#059669',
                fontWeight: '600'
              }}>
                {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days remaining`}
              </p>
            )}
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: '700', color: plan.color }}>रु</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                ANNUAL PRICE
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1d23' }}>
              NPR {plan.price.toLocaleString('en-IN')}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
              NPR {Math.round(plan.price / 12).toLocaleString('en-IN')}/month
            </p>
          </div>
        </div>

        {/* Plan Features */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            margin: '0 0 12px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1a1d23'
          }}>
            Plan Features
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px'
          }}>
            {plan.features.map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#4b5563'
              }}>
                <CheckCircle size={14} color={plan.color} />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onRenewClick?.(subscription)}
            style={{
              flex: 1,
              minWidth: '140px',
              padding: '12px 20px',
              background: daysRemaining !== null && daysRemaining <= 30 ? '#1a1d23' : 'white',
              color: daysRemaining !== null && daysRemaining <= 30 ? 'white' : '#1a1d23',
              border: `1px solid #1a1d23`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <CreditCard size={16} />
            {daysRemaining !== null && daysRemaining <= 30 ? 'Renew Now' : 'Renew Subscription'}
          </button>

          {planKey !== 'ENTERPRISE' && (
            <button
              onClick={() => onUpgradeClick?.(subscription)}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '12px 20px',
                background: 'white',
                color: plan.color,
                border: `1px solid ${plan.color}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <TrendingUp size={16} />
              Upgrade Plan
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default CurrentSubscriptionCard;
