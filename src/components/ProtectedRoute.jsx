import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Temporarily disabled authentication check for development
  // const { isAuthenticated, user } = useSelector((s) => s.auth);

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  // if (allowedRoles && !allowedRoles.includes(user?.role)) {
  //   return <Navigate to="/login" replace />;
  // }

  return children;
};

export default ProtectedRoute;
