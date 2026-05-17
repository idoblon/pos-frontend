import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { hasPermission, mapToBackendRole } from "@/util/roleMapper";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
