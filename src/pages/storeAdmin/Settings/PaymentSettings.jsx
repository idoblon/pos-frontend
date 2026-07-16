import { useEffect, useState } from "react";
import { CreditCard, Smartphone, Banknote, ToggleLeft, ToggleRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";

const METHOD_META = {
  CASH:   { label: "Cash",        icon: Banknote,   color: "#059669", bg: "#f0fdf4", border: "#bbf7d0", alwaysOn: true },
  ESEWA:  { label: "eSewa",       icon: Smartphone, color: "#60BB46", bg: "#f0fdf4", border: "#bbf7d0" },
  KHALTI: { label: "Khalti",      icon: Smartphone, color: "#5C2D91", bg: "#faf5ff", border: "#e9d5ff" },
  CARD:   { label: "Card / Bank", icon: CreditCard, color: "#1a1d23", bg: "#f5f5f5", border: "#e5e7eb" },
};

const FIELDS = {
  ESEWA: [
    { key: "esewaSettlementId", label: "Settlement ID / Merchant Code", placeholder: "EPAYTEST" },
    { key: "esewaSecretKey",    label: "Secret Key",                    placeholder: "Enter eSewa secret key", inputType: "password" },
  ],
  KHALTI: [
    { key: "khaltiPublicKey", label: "Public Key",  placeholder: "test_public_key_..." },
    { key: "khaltiSecretKey", label: "Secret Key",  placeholder: "Enter Khalti secret key", inputType: "password" },
  ],
  CARD: [
    { key: "cardProcessorName", label: "Processor Name", placeholder: "Stripe / PayPal" },
    { key: "cardApiKey",        label: "API Key",         placeholder: "pk_test_...",   inputType: "password" },
    { key: "cardSecretKey",     label: "Secret Key",      placeholder: "sk_test_...",   inputType: "password" },
  ],
};

const HINTS = {
  ESEWA:  "Enter your eSewa merchant credentials. Leave blank to use the system defaults.",
  KHALTI: "Enter your Khalti API keys. Leave blank to use the system defaults.",
  CARD:   "Configure your card payment processor (e.g. Stripe).",
};

export default function PaymentSettings() {
  const [configs, setConfigs]   = useState([]);
  const [formData, setFormData] = useState({});
  const [saving, setSaving]     = useState(null);
  const [toggling, setToggling] = useState(null);

  const load = async () => {
    try {
      const res = await api.get("/api/payment-config/store", { headers: getAuthHeaders() });
      const data = res.data || [];
      setConfigs(data);

      // Auto-create config for any missing methods so they exist in DB
      const existingTypes = data.map(c => c.paymentType);
      const missing = ["ESEWA", "KHALTI", "CARD"].filter(t => !existingTypes.includes(t));
      if (missing.length > 0) {
        await Promise.all(
          missing.map(t => api.post("/api/payment-config", { paymentType: t, isEnabled: true }, { headers: getAuthHeaders() }))
        );
        const res2 = await api.get("/api/payment-config/store", { headers: getAuthHeaders() });
        const data2 = res2.data || [];
        setConfigs(data2);
        const fd2 = {};
        data2.forEach(c => { fd2[c.paymentType] = { esewaSettlementId: c.esewaSettlementId || "", esewaSecretKey: c.esewaSecretKey || "", khaltiPublicKey: c.khaltiPublicKey || "", khaltiSecretKey: c.khaltiSecretKey || "", cardProcessorName: c.cardProcessorName || "", cardApiKey: c.cardApiKey || "", cardSecretKey: c.cardSecretKey || "" }; });
        setFormData(fd2);
        return;
      }

      const fd = {};
      data.forEach(c => {
        fd[c.paymentType] = {
          esewaSettlementId: c.esewaSettlementId || "",
          esewaSecretKey:    c.esewaSecretKey    || "",
          khaltiPublicKey:   c.khaltiPublicKey   || "",
          khaltiSecretKey:   c.khaltiSecretKey   || "",
          cardProcessorName: c.cardProcessorName || "",
          cardApiKey:        c.cardApiKey        || "",
          cardSecretKey:     c.cardSecretKey     || "",
        };
      });
      setFormData(fd);
    } catch {
      toast.error("Failed to load payment settings");
    }
  };

  useEffect(() => { load(); }, []);

  const getConfig = (type) => configs.find(c => c.paymentType === type);

  const handleToggle = async (type) => {
    const cfg = getConfig(type);
    setToggling(type);
    try {
      if (cfg) {
        await api.patch(`/api/payment-config/${cfg.id}/toggle?isEnabled=${!cfg.isEnabled}`, {}, { headers: getAuthHeaders() });
        toast.success(`${METHOD_META[type].label} ${cfg.isEnabled ? "disabled" : "enabled"}`);
      } else {
        await api.post("/api/payment-config", { paymentType: type, isEnabled: true }, { headers: getAuthHeaders() });
        toast.success(`${METHOD_META[type].label} enabled`);
      }
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update");
    } finally {
      setToggling(null);
    }
  };

  const handleSave = async (type) => {
    setSaving(type);
    try {
      const cfg = getConfig(type);
      const body = { paymentType: type, isEnabled: cfg?.isEnabled ?? true, ...(formData[type] || {}) };
      if (cfg) {
        await api.put(`/api/payment-config/${cfg.id}`, body, { headers: getAuthHeaders() });
      } else {
        await api.post("/api/payment-config", body, { headers: getAuthHeaders() });
      }
      await load();
      toast.success(`${METHOD_META[type].label} settings saved`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save");
    } finally {
      setSaving(null);
    }
  };

  const setField = (type, key, value) =>
    setFormData(f => ({ ...f, [type]: { ...(f[type] || {}), [key]: value } }));

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, background: "#f5f5f5", minHeight: "100%", fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Payment Methods</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>Enable and configure payment methods for your cashiers</p>
      </div>

      {Object.entries(METHOD_META).map(([type, meta]) => {
        const cfg     = getConfig(type);
        const enabled = meta.alwaysOn ? true : (cfg?.isEnabled ?? false);
        const fields  = FIELDS[type] || [];
        const Icon    = meta.icon;

        return (
          <div key={type} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: enabled && fields.length ? "1px solid #e5e7eb" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: meta.bg, border: `1px solid ${meta.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={meta.color} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{meta.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: enabled ? "#059669" : "#6b7280" }}>
                    {meta.alwaysOn ? "Always enabled" : enabled ? "Enabled — visible to cashiers" : "Disabled — hidden from cashiers"}
                  </p>
                </div>
              </div>
              {!meta.alwaysOn && (
                <button
                  onClick={() => handleToggle(type)}
                  disabled={!!toggling}
                  style={{ background: "none", border: "none", cursor: toggling ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: enabled ? "#059669" : "#9ca3af" }}
                >
                  {enabled ? <ToggleRight size={30} color="#059669" /> : <ToggleLeft size={30} color="#9ca3af" />}
                  {toggling === type ? "Saving..." : enabled ? "On" : "Off"}
                </button>
              )}
            </div>

            {/* Credentials — only shown when enabled */}
            {fields.length > 0 && enabled && (
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{HINTS[type]}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                  {fields.map(({ key, label, placeholder, inputType }) => (
                    <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <Label style={{ fontSize: 12 }}>{label}</Label>
                      <Input
                        type={inputType || "text"}
                        placeholder={placeholder}
                        value={formData[type]?.[key] || ""}
                        onChange={e => setField(type, key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    onClick={() => handleSave(type)}
                    disabled={saving === type}
                    style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Save size={14} />
                    {saving === type ? "Saving..." : "Save Credentials"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
