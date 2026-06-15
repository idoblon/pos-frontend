import { useEffect, useState } from "react";
import { CreditCard, Smartphone, Banknote, ToggleLeft, ToggleRight, Save, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";

const METHOD_META = {
  CASH:   { label: "Cash", icon: Banknote, color: "#059669", bg: "#f0fdf4", border: "#bbf7d0", alwaysOn: true },
  ESEWA:  { label: "eSewa", icon: Smartphone, color: "#60BB46", bg: "#f0fdf4", border: "#bbf7d0" },
  KHALTI: { label: "Khalti", icon: Smartphone, color: "#5C2D91", bg: "#faf5ff", border: "#e9d5ff" },
  CARD:   { label: "Card / Bank", icon: CreditCard, color: "#1a1d23", bg: "#f5f5f5", border: "#e5e7eb" },
};

export default function PaymentSettings() {
  const [configs, setConfigs] = useState([]);
  const [toggling, setToggling] = useState(null);

  const load = async () => {
    try {
      const res = await api.get("/api/payment-config/store/enabled", { headers: getAuthHeaders() });
      const data = res.data || [];
      setConfigs(data);
    } catch {
      // If no config exists, show all methods as disabled except cash
      setConfigs([]);
    }
  };

  useEffect(() => { load(); }, []);

  const getConfig = (type) => configs.find(c => c.paymentType === type);

  const handleToggle = async (type) => {
    toast.info("Payment method settings are managed by your store administrator. Please contact them to enable/disable payment methods.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
          <CreditCard size={18} />
          Payment Methods
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>
          View payment methods available for cashiers in this branch
        </p>
      </div>

      <div style={{ 
        background: "#eff6ff", 
        border: "1px solid #bfdbfe", 
        borderRadius: 8, 
        padding: "12px 16px", 
        display: "flex", 
        alignItems: "center", 
        gap: 10 
      }}>
        <Info size={16} color="#2563eb" />
        <p style={{ margin: 0, fontSize: 13, color: "#1e40af" }}>
          Payment method settings are configured at the store level. Contact your store administrator to enable additional payment methods or update credentials.
        </p>
      </div>

      {Object.entries(METHOD_META).map(([type, meta]) => {
        const cfg = getConfig(type);
        const enabled = meta.alwaysOn ? true : (cfg?.isEnabled ?? false);
        const Icon = meta.icon;

        return (
          <div key={type} style={{ 
            background: "white", 
            border: "1px solid #e5e7eb", 
            borderRadius: 10, 
            overflow: "hidden",
            opacity: enabled ? 1 : 0.6
          }}>
            {/* Header */}
            <div style={{ 
              padding: "16px 20px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between" 
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ 
                  width: 38, 
                  height: 38, 
                  borderRadius: 8, 
                  background: meta.bg, 
                  border: `1px solid ${meta.border}`, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center" 
                }}>
                  <Icon size={18} color={meta.color} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{meta.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: enabled ? "#059669" : "#6b7280" }}>
                    {meta.alwaysOn 
                      ? "Always available" 
                      : enabled 
                        ? "Available for cashiers" 
                        : "Not available — contact store admin"}
                  </p>
                </div>
              </div>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 6, 
                fontSize: 13, 
                fontWeight: 600, 
                color: enabled ? "#059669" : "#9ca3af" 
              }}>
                {enabled ? (
                  <ToggleRight size={30} color="#059669" />
                ) : (
                  <ToggleLeft size={30} color="#9ca3af" />
                )}
                {enabled ? "Available" : "Disabled"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}