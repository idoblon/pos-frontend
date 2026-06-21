import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, CreditCard, TrendingUp, History, Bell } from 'lucide-react';
import CurrentSubscriptionCard from '@/components/subscription/CurrentSubscriptionCard';
import SubscriptionNotificationBanner from '@/components/subscription/SubscriptionNotificationBanner';
import subscriptionService from '@/services/subscriptionService';
import { SUBSCRIPTION_PLANS, formatPrice, formatSubscriptionDate, normalizeSubscriptionRecord } from '@/util/subscriptionUtils';
import { toast } from 'sonner';

const StoreSubscriptionPage = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);

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

  const handleRenewClick = () => {
    setShowRenewModal(true);
  };

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

  const handlePlanSelect = async (planType, isRenewal = false) => {
    try {
      // Navigate to payment page with selected plan
      navigate('/store/subscription/payment', {
        state: {
          planType,
          isRenewal,
          currentSubscription: subscription
        }
      });
    } catch {
      toast.error('Failed to initiate subscription process');
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '24px',
        fontFamily: "'DM Sans','Inter',sans-serif"
      }}>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #1a1d23',
            borderRadius: '50%',
            margin: '0 auto 24px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{
        padding: '24px',
        fontFamily: "'DM Sans','Inter',sans-serif",
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            margin: '0 0 8px',
            fontSize: '24px',
            fontWeight: '700',
            color: '#1a1d23'
          }}>
            Subscription Management
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            Manage your store's subscription plan and billing
          </p>
        </div>

        {/* Subscription Notification Banner */}
        <SubscriptionNotificationBanner 
          subscription={subscription}
          onRenewClick={handleRenewClick}
        />

        {/* Current Subscription Card */}
        <div style={{ marginBottom: '32px' }}>
          <CurrentSubscriptionCard
            onRenewClick={handleRenewClick}
            onUpgradeClick={handleUpgradeClick}
          />
        </div>

        {/* Available Plans */}
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{
            margin: '0 0 16px',
            fontSize: '20px',
            fontWeight: '700',
            color: '#1a1d23'
          }}>
            Available Plans
          </h2>
          <p style={{
            margin: '0 0 24px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Choose the plan that best fits your business needs
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {Object.entries(SUBSCRIPTION_PLANS).map(([planKey, plan]) => {
              const isCurrentPlan = subscription?.subscriptionPlan === planKey;
              const isUpgrade = subscription && 
                Object.keys(SUBSCRIPTION_PLANS).indexOf(planKey) > 
                Object.keys(SUBSCRIPTION_PLANS).indexOf(subscription.subscriptionPlan);

              return (
                <div
                  key={planKey}
                  style={{
                    background: isCurrentPlan ? `${plan.color}05` : 'white',
                    border: `2px solid ${isCurrentPlan ? plan.color : '#e5e7eb'}`,
                    borderRadius: '12px',
                    padding: '24px',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isCurrentPlan && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      background: plan.color,
                      color: 'white'
                    }}>
                      Current
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: `${plan.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Crown size={20} color={plan.color} />
                    </div>
                    <div>
                      <h3 style={{
                        margin: '0 0 4px',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1a1d23'
                      }}>
                        {plan.name}
                      </h3>
                      <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: plan.color }}>
                        {formatPrice(plan.price)}
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>/year</span>
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    {plan.features.map((feature, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        fontSize: '13px',
                        color: '#4b5563'
                      }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: `${plan.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: plan.color
                          }} />
                        </div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePlanSelect(planKey, isCurrentPlan)}
                    disabled={isCurrentPlan && !subscription?.needsRenewal}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: isCurrentPlan ? 'transparent' : 
                                 isUpgrade ? plan.color : '#1a1d23',
                      color: isCurrentPlan ? plan.color : 'white',
                      border: `2px solid ${isCurrentPlan ? plan.color : 
                                          isUpgrade ? plan.color : '#1a1d23'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: isCurrentPlan && !subscription?.needsRenewal ? 'not-allowed' : 'pointer',
                      opacity: isCurrentPlan && !subscription?.needsRenewal ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {isCurrentPlan ? (
                      <>
                        <CreditCard size={16} />
                        {subscription?.needsRenewal ? 'Renew Plan' : 'Current Plan'}
                      </>
                    ) : isUpgrade ? (
                      <>
                        <TrendingUp size={16} />
                        Upgrade to {plan.name}
                      </>
                    ) : (
                      <>
                        <TrendingUp size={16} />
                        Downgrade to {plan.name}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subscription History */}
        {subscription && (
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <History size={20} color="#1a1d23" />
              <h2 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '700',
                color: '#1a1d23'
              }}>
                Subscription History
              </h2>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                fontSize: '13px'
              }}>
                <div>
                  <span style={{ color: '#6b7280', fontWeight: '600' }}>Plan:</span>
                  <p style={{ margin: '4px 0 0', color: '#1a1d23', fontWeight: '700' }}>
                    {SUBSCRIPTION_PLANS[subscription.subscriptionPlan]?.name || subscription.subscriptionPlan || 'N/A'}
                  </p>
                </div>
                <div>
                  <span style={{ color: '#6b7280', fontWeight: '600' }}>Started:</span>
                  <p style={{ margin: '4px 0 0', color: '#1a1d23', fontWeight: '700' }}>
                    {formatSubscriptionDate(subscription.subscriptionPurchaseDate)}
                  </p>
                </div>
                <div>
                  <span style={{ color: '#6b7280', fontWeight: '600' }}>Expires:</span>
                  <p style={{ margin: '4px 0 0', color: '#1a1d23', fontWeight: '700' }}>
                    {formatSubscriptionDate(subscription.subscriptionExpiry)}
                  </p>
                </div>
                <div>
                  <span style={{ color: '#6b7280', fontWeight: '600' }}>Status:</span>
                  <p style={{ margin: '4px 0 0', color: '#1a1d23', fontWeight: '700' }}>
                    {subscription.subscriptionStatus || 'Active'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StoreSubscriptionPage;
