import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Clock, Store, DollarSign, Mail, ExternalLink } from 'lucide-react';
import paymentNotificationService from '@/services/paymentNotificationService';
import { toast } from 'sonner';

export default function StorePaymentSimulation() {
  const [approvedStores, setApprovedStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadApprovedStores();
  }, []);

  const loadApprovedStores = () => {
    const approvedRequests = JSON.parse(localStorage.getItem('approvedRequests') || '[]');
    const pendingPaymentStores = approvedRequests.filter(store => 
      store.status === 'PAYMENT_PENDING' || !store.status || store.status === 'APPROVED'
    );
    setApprovedStores(pendingPaymentStores);
  };

  const getPlanPrice = (plan) => {
    switch(plan) {
      case 'BASIC': return 3500;
      case 'PROFESSIONAL': return 7000;
      case 'ENTERPRISE': return 10000;
      default: return 3500;
    }
  };

  const handlePaymentSubmission = async (storeData) => {
    setProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const amount = getPlanPrice(storeData.plan);
      const paymentDetails = {
        amount: amount,
        method: paymentMethod === 'online' ? 'Online Payment' : 'Bank Transfer',
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`
      };

      // Process payment and notify admin
      const notification = paymentNotificationService.simulateStorePayment({
        id: storeData.requestId,
        storeName: storeData.storeName,
        ownerName: 'Store Owner', // In real app, this would come from the store data
        email: 'store@example.com', // In real app, this would come from the store data
        phone: '+977-98-1234567', // In real app, this would come from the store data
        subscriptionPlan: storeData.plan
      }, paymentDetails);

      // Show success message
      toast.success(`Payment successful! ₹${amount.toLocaleString('en-IN')} paid for ${storeData.plan} plan`);
      
      // Refresh approved stores list
      loadApprovedStores();
      setSelectedStore(null);
      
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: '#1a1d23' }}>
          Store Payment Simulation
        </h1>
        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
          Simulate store owners making subscription payments after approval
        </p>
      </div>

      {/* Instructions */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
          How it works:
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#1e40af', lineHeight: '1.6' }}>
          <li>Store owner receives approval email with payment link</li>
          <li>Store owner clicks payment link and completes payment</li>
          <li>Payment confirmation is sent to POS Admin</li>
          <li>Store status is automatically updated to ACTIVE</li>
        </ul>
      </div>

      {/* Approved Stores Awaiting Payment */}
      {approvedStores.length === 0 ? (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <Clock size={48} color='#e5e7eb' style={{ margin: '0 auto 16px' }} />
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            No approved stores awaiting payment
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1a1d23' }}>
            Approved Stores Awaiting Payment ({approvedStores.length})
          </h2>
          
          {approvedStores.map((store) => (
            <div
              key={store.requestId}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Store size={20} color='#92400e' />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#1a1d23' }}>
                      {store.storeName}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                      {store.plan} Plan • ₹{getPlanPrice(store.plan).toLocaleString('en-IN')}/year
                    </p>
                  </div>
                </div>

                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: '#fef3c7',
                  color: '#92400e'
                }}>
                  Payment Pending
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
                marginBottom: '16px',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Approved At
                  </span>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#1a1d23' }}>
                    {new Date(store.approvedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Payment Link
                  </span>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#1a1d23', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ExternalLink size={12} />
                    {store.paymentLink?.substring(0, 30)}...
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setSelectedStore(store)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <CreditCard size={14} />
                  Simulate Payment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {selectedStore && (
        <>
          <div
            onClick={() => setSelectedStore(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 50
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            zIndex: 51,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#1a1d23' }}>
                Complete Payment - {selectedStore.storeName}
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                Process subscription payment for {selectedStore.plan} plan
              </p>
            </div>

            <div style={{ marginBottom: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Subscription Plan:</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1d23' }}>
                  {selectedStore.plan}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Billing Period:</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1d23' }}>
                  Annual
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#1a1d23' }}>Total Amount:</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>
                  ₹{getPlanPrice(selectedStore.plan).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                Payment Method
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { value: 'online', label: 'Online Payment', icon: CreditCard },
                  { value: 'bank', label: 'Bank Transfer', icon: DollarSign }
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: paymentMethod === method.value ? '#1a1d23' : 'white',
                      color: paymentMethod === method.value ? 'white' : '#6b7280',
                      border: `1px solid ${paymentMethod === method.value ? '#1a1d23' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <method.icon size={14} />
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setSelectedStore(null)}
                disabled={processing}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'white',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  opacity: processing ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={() => handlePaymentSubmission(selectedStore)}
                disabled={processing}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: processing ? '#6b7280' : 'linear-gradient(135deg, #059669, #047857)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {processing ? (
                  <>
                    <Clock size={14} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    Complete Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}