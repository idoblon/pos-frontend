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
    isStoreAdmin: user?.role === "ROLE_STORE_ADMIN",
    isManager: user?.role === "ROLE_BRANCH_MANAGER" || user?.role === "ROLE_STORE_MANAGER",
    isCashier: user?.role === "ROLE_BRANCH_CASHIER",
    canAccessAdmin: ["ROLE_STORE_ADMIN", "ROLE_BRANCH_MANAGER", "ROLE_STORE_MANAGER"].includes(user?.role),
  };
};
