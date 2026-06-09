import React, { useState } from 'react';
import { Play, Mail, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import emailService from '@/services/emailService';
import paymentNotificationService from '@/services/paymentNotificationService';
import { toast } from 'sonner';

export default function EmailPaymentTest() {
  const [testStage, setTestStage] = useState('initial');
  const [testResults, setTestResults] = useState([]);

  // Sample store data for testing
  const sampleStoreRequest = {
    id: 'TEST_' + Date.now(),
    storeName: 'Mitra Pustak Store',
    ownerName: 'Puskar Gharti',
    email: 'ghartipuskar@yopmail.com',
    phone: '+977-98-1234567',
    address: 'Kathmandu, Nepal',
    subscriptionPlan: 'PROFESSIONAL',
    createdAt: new Date().toISOString()
  };

  const addTestResult = (step, success, message, details = null) => {
    setTestResults(prev => [...prev, {
      step,
      success,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testApprovalEmail = async () => {
    setTestStage('approval');
    addTestResult('Approval Email', null, 'Testing approval email...');
    
    try {
      console.log('Testing Approval Email with data:', sampleStoreRequest);
      
      // Test the email service
      await emailService.sendApprovalEmail(sampleStoreRequest);
      
      // Save to approved requests for payment testing
      const existing = JSON.parse(localStorage.getItem('approvedRequests') || '[]');
      const alreadyExists = existing.find(s => s.requestId === sampleStoreRequest.id);
      if (!alreadyExists) {
        existing.push({
          requestId: sampleStoreRequest.id,
          storeName: sampleStoreRequest.storeName,
          ownerName: sampleStoreRequest.ownerName,
          email: sampleStoreRequest.email,
          phone: sampleStoreRequest.phone,
          plan: sampleStoreRequest.subscriptionPlan,
          approvedAt: new Date().toISOString(),
          paymentLink: `http://localhost:5173/admin/payment-simulation`,
          status: 'PAYMENT_PENDING'
        });
        localStorage.setItem('approvedRequests', JSON.stringify(existing));
      }
      
      addTestResult('Approval Email', true, 'Approval email sent successfully!', {
        to: sampleStoreRequest.email,
        storeName: sampleStoreRequest.storeName,
        ownerName: sampleStoreRequest.ownerName
      });
      
      toast.success('Approval email test completed - Check console for details');
      
    } catch (error) {
      console.error('Approval email test failed:', error);
      addTestResult('Approval Email', false, `Failed: ${error.message}`);
      toast.error('Approval email test failed');
    }
  };

  const testPaymentFlow = async () => {
    setTestStage('payment');
    addTestResult('Payment Processing', null, 'Testing payment flow...');
    
    try {
      const paymentDetails = {
        amount: 7000, // PROFESSIONAL plan
        method: 'Online Payment',
        transactionId: `TEST_TXN${Date.now()}`
      };
      
      console.log('Testing Payment Flow with data:', {
        storeData: sampleStoreRequest,
        paymentDetails
      });
      
      // Simulate payment
      const paymentResult = paymentNotificationService.simulateStorePayment(
        {
          id: sampleStoreRequest.id,
          storeName: sampleStoreRequest.storeName,
          ownerName: sampleStoreRequest.ownerName,
          email: sampleStoreRequest.email,
          phone: sampleStoreRequest.phone,
          subscriptionPlan: sampleStoreRequest.subscriptionPlan
        },
        paymentDetails
      );
      
      addTestResult('Payment Processing', true, 'Payment processed successfully!', paymentDetails);
      addTestResult('Credentials Email', true, 'Credentials email sent successfully!', {
        email: sampleStoreRequest.email,
        storeName: sampleStoreRequest.storeName
      });
      
      toast.success('Payment flow test completed - Check console for credentials email');
      
    } catch (error) {
      console.error('Payment flow test failed:', error);
      addTestResult('Payment Processing', false, `Failed: ${error.message}`);
      toast.error('Payment flow test failed');
    }
  };

  const runFullTest = async () => {
    setTestResults([]);
    setTestStage('running');
    
    await testApprovalEmail();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await testPaymentFlow();
    
    setTestStage('completed');
  };

  const clearTests = () => {
    setTestResults([]);
    setTestStage('initial');
    // Clear test data
    const approved = JSON.parse(localStorage.getItem('approvedRequests') || '[]');
    const filtered = approved.filter(req => !req.requestId.startsWith('TEST_'));
    localStorage.setItem('approvedRequests', JSON.stringify(filtered));
    
    const credentials = JSON.parse(localStorage.getItem('storeCredentials') || '[]');
    const filteredCreds = credentials.filter(cred => !cred.storeId.startsWith('TEST_'));
    localStorage.setItem('storeCredentials', JSON.stringify(filteredCreds));
    
    toast.info('Test data cleared');
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      margin: '20px',
      fontFamily: "'DM Sans','Inter',sans-serif"
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#1a1d23' }}>
          Email & Payment System Test
        </h2>
        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
          Test the complete workflow: Store Approval to Email to Payment to Credentials
        </p>
      </div>

      <div style={{
        background: '#f8fafc',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#1a1d23' }}>
          Test Store Data:
        </h4>
        <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.6' }}>
          <p style={{ margin: '0 0 4px' }}><strong>Store:</strong> {sampleStoreRequest.storeName}</p>
          <p style={{ margin: '0 0 4px' }}><strong>Owner:</strong> {sampleStoreRequest.ownerName}</p>
          <p style={{ margin: '0 0 4px' }}><strong>Email:</strong> {sampleStoreRequest.email}</p>
          <p style={{ margin: 0 }}><strong>Plan:</strong> {sampleStoreRequest.subscriptionPlan} - Rs.7,000/year</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={testApprovalEmail}
          disabled={testStage === 'running'}
          style={{
            flex: 1,
            padding: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: testStage === 'running' ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: testStage === 'running' ? 0.6 : 1
          }}
        >
          <Mail size={16} />
          Test Approval Email
        </button>
        
        <button
          onClick={testPaymentFlow}
          disabled={testStage === 'running'}
          style={{
            flex: 1,
            padding: '12px',
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: testStage === 'running' ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: testStage === 'running' ? 0.6 : 1
          }}
        >
          <CreditCard size={16} />
          Test Payment Flow
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={runFullTest}
          disabled={testStage === 'running'}
          style={{
            flex: 1,
            padding: '16px',
            background: testStage === 'running' 
              ? '#6b7280' 
              : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: testStage === 'running' ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Play size={20} />
          {testStage === 'running' ? 'Running Tests...' : 'Run Full Test'}
        </button>
        
        <button
          onClick={clearTests}
          style={{
            padding: '16px 24px',
            background: 'white',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
      </div>

      {testResults.length > 0 && (
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: '#1a1d23' }}>
            Test Results:
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'white',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              >
                {result.success === null ? (
                  <AlertCircle size={16} color="#f59e0b" />
                ) : result.success ? (
                  <CheckCircle size={16} color="#059669" />
                ) : (
                  <AlertCircle size={16} color="#e53e3e" />
                )}
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '600',
                    color: result.success === null ? '#f59e0b' : result.success ? '#059669' : '#e53e3e'
                  }}>
                    {result.step}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '11px' }}>
                    {result.message}
                  </div>
                  {result.details && (
                    <div style={{ color: '#9ca3af', fontSize: '10px', marginTop: '4px' }}>
                      {JSON.stringify(result.details, null, 2)}
                    </div>
                  )}
                </div>
                
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                  {result.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#1e40af'
      }}>
        <strong>Instructions:</strong> 
        <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
          <li>Open browser console to see detailed email content</li>
          <li>Check localStorage for approved requests and credentials</li>
          <li>Verify store name appears correctly (not null)</li>
          <li>Confirm temporary password is generated after payment</li>
        </ul>
      </div>
    </div>
  );
}