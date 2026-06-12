export const ADMIN_SYSTEM_SETTINGS_KEY = "posAdminSystemSettings";
export const ADMIN_SYSTEM_SETTINGS_EVENT = "pos-admin-system-settings-updated";

export const DEFAULT_ADMIN_SYSTEM_SETTINGS = {
  enforceStrongPasswords: true,
  enableTwoFactor: false,
  sessionTimeout: 30,
  systemName: "POS Management System",
  timezone: "Asia/Kathmandu",
  currency: "NPR",
  taxRate: 13,
  emailNotifications: true,
  systemAlerts: true,
  registrationRefreshSeconds: 30,
  paymentPollingSeconds: 10,
  lowStockThreshold: 10,
  requirePaymentBeforeActivation: true,
  backupFrequency: "daily",
  apiRateLimit: 1000,
  maintenanceMode: false,
};

export function getAdminSystemSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(ADMIN_SYSTEM_SETTINGS_KEY) || "{}");
    return { ...DEFAULT_ADMIN_SYSTEM_SETTINGS, ...saved };
  } catch {
    return DEFAULT_ADMIN_SYSTEM_SETTINGS;
  }
}

export function saveAdminSystemSettings(settings) {
  const next = { ...DEFAULT_ADMIN_SYSTEM_SETTINGS, ...settings };
  localStorage.setItem(ADMIN_SYSTEM_SETTINGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(ADMIN_SYSTEM_SETTINGS_EVENT, { detail: next }));
  return next;
}

export function subscribeAdminSystemSettings(callback) {
  const handleCustomUpdate = (event) => {
    callback(event.detail || getAdminSystemSettings());
  };

  const handleStorageUpdate = (event) => {
    if (event.key === ADMIN_SYSTEM_SETTINGS_KEY) {
      callback(getAdminSystemSettings());
    }
  };

  window.addEventListener(ADMIN_SYSTEM_SETTINGS_EVENT, handleCustomUpdate);
  window.addEventListener("storage", handleStorageUpdate);

  return () => {
    window.removeEventListener(ADMIN_SYSTEM_SETTINGS_EVENT, handleCustomUpdate);
    window.removeEventListener("storage", handleStorageUpdate);
  };
}

export function secondsToMilliseconds(value, fallbackSeconds, minSeconds = 1) {
  const seconds = Number(value);
  const fallback = Number(fallbackSeconds);
  return Math.max(Number.isFinite(seconds) ? seconds : fallback, minSeconds) * 1000;
}

export function getAdminTaxRate() {
  const { taxRate } = getAdminSystemSettings();
  const rate = Number(taxRate);
  return Number.isFinite(rate) ? Math.max(rate, 0) : DEFAULT_ADMIN_SYSTEM_SETTINGS.taxRate;
}

export function getLowStockThreshold() {
  const { lowStockThreshold } = getAdminSystemSettings();
  const threshold = Number(lowStockThreshold);
  return Number.isFinite(threshold)
    ? Math.max(threshold, 1)
    : DEFAULT_ADMIN_SYSTEM_SETTINGS.lowStockThreshold;
}

export function isPaymentRequiredBeforeActivation() {
  return Boolean(getAdminSystemSettings().requirePaymentBeforeActivation);
}
