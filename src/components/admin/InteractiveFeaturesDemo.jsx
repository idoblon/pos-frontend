import React, { useState } from "react";
import { Info, Mouse, Zap, Filter, RefreshCw, Eye, Settings, TrendingUp } from "lucide-react";

export default function InteractiveFeaturesDemo() {
  const [showDemo, setShowDemo] = useState(false);

  const features = [
    {
      icon: Filter,
      title: "Smart Filtering",
      description: "Click filter buttons to sort by: All, Active, Expiring Soon, Expired, Suspended",
      color: "#3b82f6"
    },
    {
      icon: Mouse,
      title: "Card Interactions", 
      description: "Click any subscription card to view detailed information and pricing breakdown",
      color: "#059669"
    },
    {
      icon: Zap,
      title: "Quick Actions",
      description: "Renew expired subscriptions, activate suspended ones, or upgrade active plans",
      color: "#f59e0b"
    },
    {
      icon: Eye,
      title: "View Details",
      description: "See complete store information, subscription history, and cost calculations",
      color: "#7c3aed"
    },
    {
      icon: Settings,
      title: "Manage Subscriptions",
      description: "Access full management options: suspend, upgrade, billing history, usage analytics",
      color: "#dc2626"
    },
    {
      icon: RefreshCw,
      title: "Real-time Updates",
      description: "Refresh data to sync with database, see live status changes and updates",
      color: "#059669"
    }
  ];

  if (!showDemo) {
    return (
      <button
        onClick={() => setShowDemo(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "12px",
          background: "#1a1d23",
          color: "white",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "48px",
          height: "48px"
        }}
        title="Show Interactive Features"
      >
        <Info size={20} />
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "320px",
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "16px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      zIndex: 100,
      maxHeight: "70vh",
      overflowY: "auto"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#1a1d23" }}>
          🎯 Interactive Features
        </h3>
        <button
          onClick={() => setShowDemo(false)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            color: "#6b7280"
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "12px" }}>
        Try these interactive features on the subscription cards:
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {features.map((feature, idx) => {
          const IconComponent = feature.icon;
          return (
            <div key={idx} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              padding: "8px",
              background: "#f8fafc",
              borderRadius: "6px",
              border: "1px solid #e2e8f0"
            }}>
              <div style={{
                width: "24px",
                height: "24px",
                borderRadius: "4px",
                background: feature.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <IconComponent size={12} color="white" />
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "600", color: "#1a1d23", marginBottom: "2px" }}>
                  {feature.title}
                </div>
                <div style={{ fontSize: "10px", color: "#6b7280", lineHeight: "1.3" }}>
                  {feature.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: "12px",
        padding: "8px",
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "6px"
      }}>
        <div style={{ fontSize: "10px", color: "#166534", fontWeight: "600" }}>
          💡 Pro Tip: All changes are simulated for demo purposes. 
          In production, these would sync with your backend database.
        </div>
      </div>
    </div>
  );
}