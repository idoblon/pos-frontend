const DEFAULT_EMPLOYEE_PASSWORD = "Employee@123";
const CHANGE_REQUIRED_PREFIX = "password_change_required_";
const CHANGE_DONE_PREFIX = "password_changed_";

export function isEmployeeDefaultPassword(password) {
  return password === DEFAULT_EMPLOYEE_PASSWORD;
}

export function isEmployeeRole(role) {
  return [
    "ROLE_STORE_MANAGER",
    "ROLE_BRANCH_MANAGER",
    "ROLE_BRANCH_CASHIER",
  ].includes(role);
}

function getUserPasswordKey(prefix, userId) {
  return `${prefix}${userId}`;
}

export function markPasswordChangeRequired(userId) {
  if (!userId) return;
  localStorage.setItem(getUserPasswordKey(CHANGE_REQUIRED_PREFIX, userId), "1");
}

export function markPasswordChanged(userId) {
  if (!userId) return;
  localStorage.setItem(getUserPasswordKey(CHANGE_DONE_PREFIX, userId), "1");
  localStorage.removeItem(getUserPasswordKey(CHANGE_REQUIRED_PREFIX, userId));
}

export function isPasswordChangeRequired(userId) {
  if (!userId) return false;
  const changed = localStorage.getItem(getUserPasswordKey(CHANGE_DONE_PREFIX, userId)) === "1";
  const required = localStorage.getItem(getUserPasswordKey(CHANGE_REQUIRED_PREFIX, userId)) === "1";
  return required && !changed;
}

export function syncFirstLoginPasswordState({ role, userId, password }) {
  if (!userId || !isEmployeeRole(role)) return;

  if (isEmployeeDefaultPassword(password)) {
    markPasswordChangeRequired(userId);
  } else {
    markPasswordChanged(userId);
  }
}
