import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { hasPermission, mapToBackendRole } from "@/util/roleMapper";
import { validateUserAccess } from "@/util/storeStatusChecker";
import secureStorage from "@/util/secureStorage";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [accessValidation, setAccessValidation] = useState({ loading: true, allowed: false });
  
  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Validate store access for store/branch users
  useEffect(() => {
    const checkStoreAccess = async () => {
      const userData = secureStorage.getUserData();
      
      // Only validate for store/branch roles
      if (userData?.storeId && ['ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER', 'ROLE_BRANCH_MANAGER', 'ROLE_BRANCH_CASHIER'].includes(userData.role)) {
        try {
          const validation = await validateUserAccess(userData);
          setAccessValidation({ loading: false, ...validation });
        } catch (error) {
          console.error('Store access validation failed:', error);
          setAccessValidation({ 
            loading: false, 
            allowed: false, 
            reason: 'Validation failed',
            redirectTo: '/login'
          });
        }
      } else {
        // No store validation needed for admin users
        setAccessValidation({ loading: false, allowed: true });
      }
    };

    checkStoreAccess();
  }, [user]);

  // Show loading while validating
  if (accessValidation.loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: "'DM Sans','Inter',sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #059669',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280', margin: 0 }}>Validating access...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Handle access denied
  if (!accessValidation.allowed) {
    if (accessValidation.redirectTo === '/suspended') {
      return <Navigate to="/suspended" replace />;
    }
    return <Navigate to={accessValidation.redirectTo || '/login'} replace />;
  }

  // Check role permissions if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userBackendRole = mapToBackendRole(user?.role);
    const allowedBackendRoles = allowedRoles.map(role => mapToBackendRole(role));
    
    if (!hasPermission(userBackendRole, allowedBackendRoles)) {
      // Redirect to appropriate dashboard based on role
      const redirectPath = getUserDashboard(user?.role);
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

// Helper function to get appropriate dashboard for user role
const getUserDashboard = (role) => {
  const dashboardMap = {
    'ROLE_ADMIN': '/admin',
    'ROLE_STORE_ADMIN': '/store-admin',
    'ROLE_STORE_MANAGER': '/store-admin',
    'ROLE_BRANCH_MANAGER': '/branch',
    'ROLE_BRANCH_CASHIER': '/cashier',
    'ROLE_USER': '/'
  };
  
  return dashboardMap[role] || '/login';
};

export default ProtectedRoute;
