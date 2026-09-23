// Legacy auth helpers — now delegate to secureStorage (sessionStorage).
// Kept for backward compatibility; new code should import secureStorage directly.
import secureStorage from "./secureStorage";

export const getAuthData = () => {
  const userData = secureStorage.getUserData() || {};
  return {
    jwt: secureStorage.getToken() || localStorage.getItem("jwt"),
    role: userData.role || localStorage.getItem("role"),
    storeId: userData.storeId || localStorage.getItem("storeId"),
    branchId: userData.branchId || localStorage.getItem("branchId"),
    storeName: userData.storeName || localStorage.getItem("storeName"),
  };
};

export const isAuthenticated = () => !!secureStorage.getToken() || !!localStorage.getItem("jwt");

export const hasRole = (allowedRoles) => {
  const role = secureStorage.getUserData()?.role || localStorage.getItem("role");
  return allowedRoles.includes(role);
};

export const clearAuthData = () => {
  secureStorage.clearAll();
};
