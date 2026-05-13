export const getAuthData = () => ({
  jwt: localStorage.getItem("jwt"),
  role: localStorage.getItem("role"),
  storeId: localStorage.getItem("storeId"),
  branchId: localStorage.getItem("branchId"),
  storeName: localStorage.getItem("storeName"),
});

export const isAuthenticated = () => !!localStorage.getItem("jwt");

export const hasRole = (allowedRoles) => {
  const role = localStorage.getItem("role");
  return allowedRoles.includes(role);
};

export const clearAuthData = () => {
  localStorage.removeItem("jwt");
  localStorage.removeItem("role");
  localStorage.removeItem("storeId");
  localStorage.removeItem("branchId");
  localStorage.removeItem("storeName");
};
