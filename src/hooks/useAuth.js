import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/Redux Toolkit/Features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, jwt, isAuthenticated, loading, error } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return {
    user,
    jwt,
    isAuthenticated,
    loading,
    error,
    role: user?.role,
    storeId: user?.storeId,
    branchId: user?.branchId,
    storeName: user?.storeName,
    logout: handleLogout,
    isStoreAdmin: user?.role === "store_admin",
    isManager: user?.role === "manager",
    isCashier: user?.role === "cashier",
    canAccessAdmin: ["store_admin", "manager"].includes(user?.role),
  };
};
