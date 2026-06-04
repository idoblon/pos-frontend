import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, Mail, Phone, LogOut, RefreshCw } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '@/Redux Toolkit/Features/auth/authSlice';
import { getSuspensionDetails, validateUserAccess } from '@/util/storeStatusChecker';
import secureStorage from '@/util/secureStorage';
import posLogo from '@/logo/pos.png';

const StoreSuspended = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [suspensionInfo, setSuspensionInfo] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const userData = secureStorage.getUserData();
  const storeName = userData?.storeName || 'Your Store';

  useEffect(() => {
    loadSuspensionDetails();
  }, []);

  const loadSuspensionDetails = async () => {
    try {
      const accessValidation = await validateUserAccess(userData);
      if (accessValidation.suspensionDetails) {
        setSuspensionInfo(accessValidation.suspensionDetails);
      }
    } catch (error) {
      console.error('Failed to load suspension details:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const checkStoreStatus = async () => {
    setIsChecking(true);
    try {
      const accessValidation = await validateUserAccess(userData);
      
      if (accessValidation.allowed) {
        const role = userData?.role;
        const dashboardMap = {
          'ROLE_STORE_ADMIN': '/store-admin',
          'ROLE_STORE_MANAGER': '/store-admin', 
          'ROLE_BRANCH_MANAGER': '/branch',
          'ROLE_BRANCH_CASHIER': '/cashier'
        };
        
        const redirectPath = dashboardMap[role] || '/dashboard';
        navigate(redirectPath);
      } else {
        if (accessValidation.suspensionDetails) {
          setSuspensionInfo(accessValidation.suspensionDetails);
        }
      }
    } catch (error) {
      console.error('Failed to check store status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'DM Sans','Inter',sans-serif"
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            marginBottom: '16px'
          }}>
            <img src={posLogo} alt="POS" style={{ width: 32, height: 32 }} />
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#1a1d23' }}>POS SYSTEM</span>
          </div>
          
          <div style={{
            width: '64px',
            height: '64px',
            background: '#fecaca',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <AlertCircle size={32} color="#e53e3e" />
          </div>
          
          <h1 style={{ 
            margin: '0 0 8px', 
            fontSize: '24px', 
            fontWeight: '700',
            color: '#1a1d23'
          }}>
            Store Access Suspended
          </h1>
          
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            Access to <strong>{storeName}</strong> and all its branches has been temporarily suspended.
          </p>
        </div>

        {suspensionInfo && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <h3 style={{ 
              margin: '0 0 12px', 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#e53e3e'
            }}>
              Suspension Details
            </h3>
            
            <div style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.4' }}>
              <p style={{ margin: '0 0 8px' }}>
                <strong>Reason:</strong> {suspensionInfo.reason}
              </p>
              <p style={{ margin: '0 0 8px' }}>
                <strong>Suspended On:</strong> {new Date(suspensionInfo.suspendedAt).toLocaleDateString()}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Duration:</strong> {suspensionInfo.daysSuspended} day(s)
              </p>
            </div>
          </div>
        )}

        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <h3 style={{ 
            margin: '0 0 12px', 
            fontSize: '14px', 
            fontWeight: '600',
            color: '#1a1d23'
          }}>
            What This Means
          </h3>
          
          <ul style={{ 
            margin: 0, 
            paddingLeft: '16px',
            fontSize: '12px', 
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            <li>All store operations are temporarily disabled</li>
            <li>Branch access for managers and cashiers is blocked</li>
            <li>POS transactions cannot be processed</li>
            <li>Inventory and reporting features are unavailable</li>
          </ul>
        </div>

        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <h3 style={{ 
            margin: '0 0 12px', 
            fontSize: '14px', 
            fontWeight: '600',
            color: '#059669'
          }}>
            Need Help?
          </h3>
          
          <p style={{ 
            margin: '0 0 12px', 
            fontSize: '12px', 
            color: '#6b7280',
            lineHeight: '1.4'
          }}>
            Contact our support team to resolve this issue:
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a 
              href="mailto:support@possystem.com"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#059669',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              <Mail size={14} />
              support@possystem.com
            </a>
            <a 
              href="tel:+9779876543210"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#059669',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              <Phone size={14} />
              +977 987-654-3210
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={checkStoreStatus}
            disabled={isChecking}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: isChecking ? '#f3f4f6' : 'linear-gradient(135deg, #1a1d23, #4a4d55)',
              color: isChecking ? '#6b7280' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isChecking ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={14} style={{ 
              animation: isChecking ? 'spin 1s linear infinite' : 'none' 
            }} />
            {isChecking ? 'Checking...' : 'Check Status'}
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'white',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
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
            onMouseEnter={(e) => {
              e.target.style.background = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StoreSuspended;