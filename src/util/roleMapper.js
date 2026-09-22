// src/util/roleMapper.js
/**
 * Role mapping utility to match backend role hierarchy
 */

export const BACKEND_ROLES = {
  ROLE_ADMIN: 'ROLE_ADMIN',
  ROLE_STORE_ADMIN: 'ROLE_STORE_ADMIN',
  ROLE_STORE_MANAGER: 'ROLE_STORE_MANAGER',
  ROLE_BRANCH_MANAGER: 'ROLE_BRANCH_MANAGER',
  ROLE_BRANCH_CASHIER: 'ROLE_BRANCH_CASHIER',
  ROLE_USER: 'ROLE_USER'
};

export const FRONTEND_ROLES = {
  admin: 'ROLE_ADMIN',
  store_admin: 'ROLE_STORE_ADMIN',
  store_manager: 'ROLE_STORE_MANAGER',
  branch_manager: 'ROLE_BRANCH_MANAGER',
  cashier: 'ROLE_BRANCH_CASHIER',
  user: 'ROLE_USER'
};

// Convert backend role to frontend display name
export const getDisplayRole = (backendRole) => {
  const roleMap = {
    'ROLE_ADMIN': 'Super Admin',
    'ROLE_STORE_ADMIN': 'Store Admin',
    'ROLE_STORE_MANAGER': 'Store Manager',
    'ROLE_BRANCH_MANAGER': 'Branch Manager',
    'ROLE_BRANCH_CASHIER': 'Cashier',
    'ROLE_USER': 'User'
  };
  return roleMap[backendRole] || backendRole;
};

// Convert frontend role to backend role
export const mapToBackendRole = (frontendRole) => {
  return FRONTEND_ROLES[frontendRole] || frontendRole;
};

// Most privileged first. Roles missing from this list are unknown and are
// always denied (fail closed) rather than silently granted access.
const ROLE_HIERARCHY = [
  'ROLE_ADMIN',
  'ROLE_STORE_ADMIN',
  'ROLE_STORE_MANAGER',
  'ROLE_BRANCH_MANAGER',
  'ROLE_BRANCH_CASHIER',
  'ROLE_USER'
];

// Check if user has required permission level
export const hasPermission = (userRole, requiredRoles) => {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  if (userLevel === -1) return false;

  return requiredRoles.some((role) => {
    const requiredLevel = ROLE_HIERARCHY.indexOf(role);
    return requiredLevel !== -1 && userLevel <= requiredLevel;
  });
};

// Get allowed routes for role
export const getAllowedRoutes = (userRole) => {
  const routes = {
    'ROLE_ADMIN': ['/admin', '/store-admin', '/branch', '/cashier'],
    'ROLE_STORE_ADMIN': ['/store-admin', '/cashier'],
    'ROLE_STORE_MANAGER': ['/store-admin', '/cashier'],
    'ROLE_BRANCH_MANAGER': ['/branch', '/cashier'],
    'ROLE_BRANCH_CASHIER': ['/cashier'],
    'ROLE_USER': []
  };

  return routes[userRole] || [];
};
