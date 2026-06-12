import React, { useEffect, useMemo, useState } from "react";
import {
  Save, Shield, Globe, Bell, Database, AlertTriangle,
  RefreshCw, RotateCcw, Percent, Package, CreditCard, Wrench
} from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_ADMIN_SYSTEM_SETTINGS,
  getAdminSystemSettings,
  saveAdminSystemSettings,
} from "@/util/adminSystemSettings";

function SettingSection({ title, description, icon, children }) {
  return (
    <div style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "24px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "#1a1d23",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {React.createElement(icon, { size: 20, color: "white" })}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1a202c" }}>
            {title}
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#718096" }}>
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

function SettingItem({ label, description, children }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "20px",
      padding: "16px 0",
      borderBottom: "1px solid #f0f0f0"
    }}>
      <div style={{ flex: 1 }}>
        <label style={{
          display: "block",
          fontSize: "14px",
          fontWeight: "600",
          color: "#1a202c",
          marginBottom: "4px"
        }}>
          {label}
        </label>
        {description && (
          <p style={{
            margin: 0,
            fontSize: "13px",
            color: "#718096",
            lineHeight: "1.4"
          }}>
            {description}
          </p>
        )}
      </div>
      <div style={{ minWidth: "220px", maxWidth: "260px", width: "35%" }}>
        {children}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      style={{
        width: "48px",
        height: "24px",
        borderRadius: "12px",
        border: "none",
        background: checked ? "#22c55e" : "#e2e8f0",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s ease"
      }}
    >
      <div style={{
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        background: "white",
        position: "absolute",
        top: "2px",
        left: checked ? "26px" : "2px",
        transition: "left 0.2s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
      }} />
    </button>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  fontSize: "14px",
  outline: "none",
  background: "white",
  boxSizing: "border-box",
};

export default function SystemSettings() {
  const [savedSettings, setSavedSettings] = useState(getAdminSystemSettings);
  const [settings, setSettings] = useState(savedSettings);

  const hasChanges = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings],
  );

  useEffect(() => {
    document.title = `${settings.systemName || DEFAULT_ADMIN_SYSTEM_SETTINGS.systemName} Admin`;
  }, [settings.systemName]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateNumber = (key, value, fallback = 0) => {
    const parsed = Number(value);
    updateSetting(key, Number.isFinite(parsed) ? parsed : fallback);
  };

  const handleSave = () => {
    const next = saveAdminSystemSettings(settings);
    setSavedSettings(next);
    setSettings(next);
    toast.success("System settings saved");
  };

  const handleDiscard = () => {
    setSettings(savedSettings);
    toast.info("Unsaved changes discarded");
  };

  const handleReset = () => {
    const next = saveAdminSystemSettings(DEFAULT_ADMIN_SYSTEM_SETTINGS);
    setSavedSettings(next);
    setSettings(next);
    toast.success("System settings reset");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "700",
            color: "#1a202c",
            letterSpacing: "-0.5px"
          }}>
            System Settings
          </h1>
          <p style={{
            margin: "4px 0 0",
            fontSize: "16px",
            color: "#718096"
          }}>
            Configure admin preferences for the POS system
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {hasChanges && (
            <button
              type="button"
              onClick={handleDiscard}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "white",
                color: "#475569",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              <RotateCcw size={16} />
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "white",
              color: "#475569",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            <RefreshCw size={16} />
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: hasChanges ? "#1a1d23" : "#cbd5e1",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: hasChanges ? "pointer" : "not-allowed"
            }}
          >
            <Save size={16} color="white" />
            Save Changes
          </button>
        </div>
      </div>

      {hasChanges && (
        <div style={{
          background: "#fef3c7",
          border: "1px solid #f59e0b",
          borderRadius: "8px",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <AlertTriangle size={16} color="#f59e0b" />
          <span style={{ fontSize: "14px", color: "#92400e" }}>
            You have unsaved changes
          </span>
        </div>
      )}

      <SettingSection
        title="Security & Authentication"
        description="Configure local admin security preferences"
        icon={Shield}
      >
        <SettingItem
          label="Enforce Strong Passwords"
          description="Require complex passwords for future validation flows"
        >
          <Toggle
            checked={settings.enforceStrongPasswords}
            onChange={(value) => updateSetting("enforceStrongPasswords", value)}
          />
        </SettingItem>

        <SettingItem
          label="Enable Two Factor"
          description="Reserved for backend-supported two factor authentication"
        >
          <Toggle
            checked={settings.enableTwoFactor}
            onChange={(value) => updateSetting("enableTwoFactor", value)}
          />
        </SettingItem>

        <SettingItem
          label="Session Timeout"
          description="Preferred inactivity timeout in minutes"
        >
          <input
            type="number"
            min="5"
            max="240"
            value={settings.sessionTimeout}
            onChange={(e) => updateNumber("sessionTimeout", e.target.value, 30)}
            style={inputStyle}
          />
        </SettingItem>
      </SettingSection>

      <SettingSection
        title="General Settings"
        description="Basic POS display preferences"
        icon={Globe}
      >
        <SettingItem
          label="System Name"
          description="Display name used by the admin browser tab"
        >
          <input
            type="text"
            value={settings.systemName}
            onChange={(e) => updateSetting("systemName", e.target.value)}
            style={inputStyle}
          />
        </SettingItem>

        <SettingItem
          label="Timezone"
          description="Default timezone for admin reporting preferences"
        >
          <select
            value={settings.timezone}
            onChange={(e) => updateSetting("timezone", e.target.value)}
            style={inputStyle}
          >
            <option value="Asia/Kathmandu">Asia/Kathmandu</option>
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="UTC">UTC</option>
          </select>
        </SettingItem>

        <SettingItem
          label="Currency"
          description="Default currency label for future admin displays"
        >
          <select
            value={settings.currency}
            onChange={(e) => updateSetting("currency", e.target.value)}
            style={inputStyle}
          >
            <option value="NPR">NPR</option>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>
        </SettingItem>
      </SettingSection>

      <SettingSection
        title="POS Operations"
        description="Store, inventory, tax, and payment preferences"
        icon={CreditCard}
      >
        <SettingItem
          label="Tax Rate"
          description="Default VAT/tax percentage used for future POS configuration"
        >
          <div style={{ position: "relative" }}>
            <Percent size={14} color="#64748b" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="number"
              min="0"
              max="100"
              value={settings.taxRate}
              onChange={(e) => updateNumber("taxRate", e.target.value, 13)}
              style={{ ...inputStyle, paddingRight: 32 }}
            />
          </div>
        </SettingItem>

        <SettingItem
          label="Low Stock Threshold"
          description="Quantity level for low-stock alerts"
        >
          <div style={{ position: "relative" }}>
            <Package size={14} color="#64748b" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="number"
              min="1"
              value={settings.lowStockThreshold}
              onChange={(e) => updateNumber("lowStockThreshold", e.target.value, 10)}
              style={{ ...inputStyle, paddingRight: 32 }}
            />
          </div>
        </SettingItem>

        <SettingItem
          label="Require Payment Before Activation"
          description="Keep registration approval tied to payment completion"
        >
          <Toggle
            checked={settings.requirePaymentBeforeActivation}
            onChange={(value) => updateSetting("requirePaymentBeforeActivation", value)}
          />
        </SettingItem>
      </SettingSection>

      <SettingSection
        title="Notifications"
        description="Configure alert and polling preferences"
        icon={Bell}
      >
        <SettingItem
          label="Email Notifications"
          description="Send email for important events when supported"
        >
          <Toggle
            checked={settings.emailNotifications}
            onChange={(value) => updateSetting("emailNotifications", value)}
          />
        </SettingItem>

        <SettingItem
          label="System Alerts"
          description="Show in-app alerts for admin events"
        >
          <Toggle
            checked={settings.systemAlerts}
            onChange={(value) => updateSetting("systemAlerts", value)}
          />
        </SettingItem>

        <SettingItem
          label="Registration Refresh"
          description="Preferred registration request refresh interval in seconds"
        >
          <input
            type="number"
            min="10"
            value={settings.registrationRefreshSeconds}
            onChange={(e) => updateNumber("registrationRefreshSeconds", e.target.value, 30)}
            style={inputStyle}
          />
        </SettingItem>

        <SettingItem
          label="Payment Polling"
          description="Preferred payment notification polling interval in seconds"
        >
          <input
            type="number"
            min="5"
            value={settings.paymentPollingSeconds}
            onChange={(e) => updateNumber("paymentPollingSeconds", e.target.value, 10)}
            style={inputStyle}
          />
        </SettingItem>
      </SettingSection>

      <SettingSection
        title="Database & Backup"
        description="Backup and system operation preferences"
        icon={Database}
      >
        <SettingItem
          label="Backup Frequency"
          description="Preferred automatic backup schedule"
        >
          <select
            value={settings.backupFrequency}
            onChange={(e) => updateSetting("backupFrequency", e.target.value)}
            style={inputStyle}
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </SettingItem>

        <SettingItem
          label="API Rate Limit"
          description="Preferred admin API request limit per minute"
        >
          <input
            type="number"
            min="60"
            value={settings.apiRateLimit}
            onChange={(e) => updateNumber("apiRateLimit", e.target.value, 1000)}
            style={inputStyle}
          />
        </SettingItem>

        <SettingItem
          label="Maintenance Mode"
          description="Local flag for future maintenance gating"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Wrench size={18} color={settings.maintenanceMode ? "#d97706" : "#94a3b8"} />
            <Toggle
              checked={settings.maintenanceMode}
              onChange={(value) => updateSetting("maintenanceMode", value)}
            />
          </div>
        </SettingItem>
      </SettingSection>
    </div>
  );
}
