import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, Clock, Building2, DollarSign, ExternalLink, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkStorePaymentStatus } from '@/util/paymentValidator';
import { getAuthData, clearAuthData } from '@/util/auth';

export default function PaymentRequired() {
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    const authData = getAuthData();
    if (!authData.storeId && !authData.email) {
      navigate('/login');
      return;
    }

    const status = await checkStorePaymentStatus(authData.storeId, authData.email);
    
    if (status.status === 'PAID') {
      // Payment completed, redirect to appropriate dashboard
      navigate('/store-admin');
      return;
    }

    setPaymentInfo(status);
    setLoading(false);
  };

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  const getPlanPrice = (plan) => {
    switch(plan) {
      case 'BASIC': return '3,500';
      case 'PROFESSIONAL': return '7,000';
      case 'ENTERPRISE': return '10,000';
      default: return '3,500';
    }
  };

  const getPlanFeatures = (plan) => {
    switch(plan) {
      case 'BASIC': return ['1 Store', '3 Branches', '10 Users', 'Basic Support'];
      case 'PROFESSIONAL': return ['1 Store', '10 Branches', '50 Users', 'Priority Support', 'Advanced Reports'];
      case 'ENTERPRISE': return ['Unlimited Stores', 'Unlimited Branches', 'Unlimited Users', '24/7 Support', 'Custom Features'];
      default: return ['1 Store', '3 Branches', '10 Users', 'Basic Support'];
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <Clock size={48} color="#6b7280" style={{ margin: '0 auto 16px' }} />
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            Checking payment status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '600px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          padding: '32px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <CreditCard size={40} />
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '700' }}>
            Payment Required
          </h1>
          <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
            Complete your subscription payment to access the POS system
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {paymentInfo?.status === 'PENDING' && (
            <>
              <div style={{
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <AlertCircle size={20} color="#92400e" />
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                    Subscription Payment Pending
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#92400e' }}>
                    Your store registration has been approved! Complete the payment to activate your account.
                  </p>
                </div>
              </div>

              {paymentInfo.paymentDetails && (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1a1d23' }}>
                      Store Details
                    </h3>
                    <div style={{
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <Building2 size={24} color="#6b7280" />
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#1a1d23' }}>
                          {paymentInfo.paymentDetails.storeName}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                          {paymentInfo.paymentDetails.plan} Plan
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1a1d23' }}>
                      Selected Plan
                    </h3>
                    <div style={{
                      border: '2px solid #059669',
                      borderRadius: '12px',
                      padding: '20px',
                      background: '#f0fdf4'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <span style={{ fontSize: '18px', fontWeight: '700', color: '#1a1d23' }}>
                          {paymentInfo.paymentDetails.plan} Plan
                        </span>
                        <span style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                          ₹{getPlanPrice(paymentInfo.paymentDetails.plan)}/year
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#166534' }}>
                        <strong>Includes:</strong>
                        <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                          {getPlanFeatures(paymentInfo.paymentDetails.plan).map((feature, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {paymentInfo.paymentDetails.paymentLink && (
                    <div style={{ marginBottom: '24px' }}>
                      <button
                        onClick={() => window.open(paymentInfo.paymentDetails.paymentLink, '_blank')}
                        style={{
                          width: '100%',
                          padding: '16px',
                          background: 'linear-gradient(135deg, #059669, #047857)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <CreditCard size={20} />
                        Pay ₹{getPlanPrice(paymentInfo.paymentDetails.plan)} - Complete Setup
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          <div style={{
            background: '#f1f5f9',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#1a1d23' }}>
              What happens after payment?
            </h4>
            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  background: '#059669',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '700',
                  color: 'white'
                }}>1</div>
                <span>Payment confirmation received instantly</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  background: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '700',
                  color: 'white'
                }}>2</div>
                <span>Login credentials sent to your email</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  background: '#8b5cf6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '700',
                  color: 'white'
                }}>3</div>
                <span>Access your POS dashboard immediately</span>
              </div>
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#64748b' }}>
              Need help with payment?
            </p>
            <div style={{ fontSize: '11px', color: '#475569' }}>
              <p style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Mail size={12} />
                support@pos-pro.com
              </p>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Phone size={12} />
                +977-1-234-5678
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => checkPaymentStatus()}
              style={{
                flex: 1,
                padding: '12px',
                background: 'white',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Refresh Status
            </button>
            <button
              onClick={handleLogout}
              style={{
                flex: 1,
                padding: '12px',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}