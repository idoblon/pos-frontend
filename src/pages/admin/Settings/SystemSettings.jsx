import React, { useState } from "react";
import {
  Save, Shield, Globe, Bell, Database,
  Key, Server, AlertTriangle
} from "lucide-react";

function SettingSection({ title, description, icon: Icon, children }) {
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
          <Icon size={20} color="white" />
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
      padding: "16px 0",
      borderBottom: "1px solid #f0f0f0"
    }}>
      <div style={{ flex: 1, marginRight: "20px" }}>
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
      <div style={{ minWidth: "200px" }}>
        {children}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: "48px",
        height: "24px",
        borderRadius: "12px",
        border: "none",
        background: checked ? "#48bb78" : "#e2e8f0",
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

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    enforceStrongPasswords: true,
    enableTwoFactor: false,
    sessionTimeout: 30,
    systemName: "POS Management System",
    timezone: "Asia/Kathmandu",
    emailNotifications: true,
    systemAlerts: true,
    backupFrequency: "daily",
    apiRateLimit: 1000
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    console.log("Settings saved:", settings);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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
            Configure global system preferences
          </p>
        </div>
        
        {hasChanges && (
          <button
            onClick={handleSave}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#1a1d23",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            <Save size={16} color="white" />
            Save Changes
          </button>
        )}
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
        description="Configure security policies"
        icon={Shield}
      >
        <SettingItem
          label="Enforce Strong Passwords"
          description="Require complex passwords with 8+ characters"
        >
          <Toggle
            checked={settings.enforceStrongPasswords}
            onChange={(value) => updateSetting('enforceStrongPasswords', value)}
          />
        </SettingItem>

        <SettingItem
          label="Session Timeout (minutes)"
          description="Auto logout after inactivity"
        >
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none"
            }}
          />
        </SettingItem>
      </SettingSection>

      <SettingSection
        title="General Settings"
        description="Basic system preferences"
        icon={Globe}
      >
        <SettingItem
          label="System Name"
          description="Display name for your POS system"
        >
          <input
            type="text"
            value={settings.systemName}
            onChange={(e) => updateSetting('systemName', e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none"
            }}
          />
        </SettingItem>

        <SettingItem
          label="Timezone"
          description="Default timezone"
        >
          <select
            value={settings.timezone}
            onChange={(e) => updateSetting('timezone', e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none",
              background: "white"
            }}
          >
            <option value="Asia/Kathmandu">Asia/Kathmandu</option>
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="UTC">UTC</option>
          </select>
        </SettingItem>
      </SettingSection>

      <SettingSection
        title="Notifications"
        description="Configure alerts"
        icon={Bell}
      >
        <SettingItem
          label="Email Notifications"
          description="Send email for important events"
        >
          <Toggle
            checked={settings.emailNotifications}
            onChange={(value) => updateSetting('emailNotifications', value)}
          />
        </SettingItem>

        <SettingItem
          label="System Alerts"
          description="Show in-app alerts"
        >
          <Toggle
            checked={settings.systemAlerts}
            onChange={(value) => updateSetting('systemAlerts', value)}
          />
        </SettingItem>
      </SettingSection>

      <SettingSection
        title="Database & Backup"
        description="Backup preferences"
        icon={Database}
      >
        <SettingItem
          label="Backup Frequency"
          description="Automatic backup schedule"
        >
          <select
            value={settings.backupFrequency}
            onChange={(e) => updateSetting('backupFrequency', e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none",
              background: "white"
            }}
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </SettingItem>
      </SettingSection>
    </div>
  );
}