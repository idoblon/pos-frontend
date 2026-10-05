import React, { useState, useMemo } from "react";
import { Calculator, Info, Check } from "lucide-react";
import { SUBSCRIPTION_PLANS, calculateSubscriptionCost, getRecommendedPlan, planFitsUsage } from "@/util/subscriptionLogic";

export default function SubscriptionCalculator({ onPlanSelect, selectedPlan }) {
  const [usage, setUsage] = useState({
    branches: 1,
    users: 5,
    storage: 1
  });

  // Flat prices — no add-on charges. Usage only determines fit.
  const calculations = useMemo(() => {
    const out = {};
    Object.keys(SUBSCRIPTION_PLANS).forEach(plan => {
      out[plan] = calculateSubscriptionCost(plan);
    });
    return out;
  }, []);

  const recommendedPlan = useMemo(() => getRecommendedPlan(usage), [usage]);

  const handleUsageChange = (field, value) => {
    setUsage(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  const PlanCard = ({ planKey, planData, calculation, isRecommended, isSelected }) => {
    const fits = planFitsUsage(planKey, usage);
    return (
    <div
      onClick={() => onPlanSelect(planKey)}
      style={{
        padding: "16px",
        border: `2px solid ${isSelected ? "#1a1d23" : isRecommended ? "#059669" : "#e5e7eb"}`,
        borderRadius: "12px",
        cursor: "pointer",
        position: "relative",
        background: isSelected ? "#f8fafc" : "white",
        transition: "all 0.2s ease"
      }}
    >
      {/* Recommended Badge */}
      {isRecommended && !isSelected && (
        <div style={{
          position: "absolute",
          top: "-8px",
          right: "12px",
          padding: "4px 8px",
          background: "#059669",
          color: "white",
          fontSize: "10px",
          fontWeight: "700",
          borderRadius: "4px",
          textTransform: "uppercase"
        }}>
          Recommended
        </div>
      )}

      {/* Selected Badge */}
      {isSelected && (
        <div style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          width: "20px",
          height: "20px",
          background: "#1a1d23",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Check size={12} color="white" />
        </div>
      )}

      {/* Plan Header */}
      <div style={{ marginBottom: "12px" }}>
        <h4 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: "700", color: "#1a1d23" }}>
          {planData.name}
        </h4>
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span style={{ fontSize: "20px", fontWeight: "700", color: "#1a1d23" }}>
            {calculation.currency} {calculation.total.toLocaleString("en-IN")}
          </span>
          <span style={{ fontSize: "12px", color: "#6b7280" }}>/{planData.billing}</span>
        </div>
      </div>

      {/* Flat price note */}
      <div style={{ marginBottom: "8px", fontSize: "11px", color: "#6b7280" }}>
        Flat yearly price — no extra charges
      </div>

      {/* Fit indicator */}
      <div style={{
        marginBottom: "12px",
        padding: "6px 8px",
        borderRadius: "4px",
        fontSize: "10px",
        fontWeight: "600",
        background: fits ? "#f0fdf4" : "#fef2f2",
        color: fits ? "#166534" : "#991b1b",
      }}>
        {fits ? "Fits your needs" : "Exceeds limits — upgrade required"}
      </div>

      {/* Included Features */}
      <div style={{ fontSize: "10px", color: "#6b7280" }}>
        <div style={{ marginBottom: "4px", fontWeight: "600" }}>Includes:</div>
        <div>• {planData.included.branches === "unlimited" ? "Unlimited" : planData.included.branches} branches</div>
        <div>• {planData.included.users === "unlimited" ? "Unlimited" : planData.included.users} users</div>
        <div>• {planData.included.storage} storage</div>
        <div>• {planData.included.support} support</div>
      </div>

      {/* Full feature list */}
      <div style={{ fontSize: "10px", color: "#4b5563", marginTop: "8px" }}>
        {planData.features.map((f) => (
          <div key={f}>• {f}</div>
        ))}
      </div>
    </div>
    );
  };

  return (
    <div style={{ marginTop: "20px" }}>
      {/* Usage Checker */}
      <div style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Calculator size={16} color="#3b82f6" />
          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1a1d23" }}>
            Check Your Needs
          </h4>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
              Branches
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={usage.branches}
              onChange={(e) => handleUsageChange("branches", e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "12px"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
              Users
            </label>
            <input
              type="number"
              min="1"
              max="500"
              value={usage.users}
              onChange={(e) => handleUsageChange("users", e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "12px"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
              Storage (GB)
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={usage.storage}
              onChange={(e) => handleUsageChange("storage", e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "12px"
              }}
            />
          </div>
        </div>

        <div style={{
          marginTop: "8px",
          padding: "6px 8px",
          background: "#dbeafe",
          borderRadius: "4px",
          fontSize: "10px",
          color: "#1e40af",
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}>
          <Info size={12} />
          Each plan has fixed limits. If your needs exceed a plan, choose a higher plan — no per-branch payments.
        </div>
      </div>

      {/* Plan Comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
        {Object.entries(SUBSCRIPTION_PLANS).map(([planKey, planData]) => (
          <PlanCard
            key={planKey}
            planKey={planKey}
            planData={planData}
            calculation={calculations[planKey] || { total: planData.basePrice, breakdown: [], currency: planData.currency }}
            isRecommended={planKey === recommendedPlan}
            isSelected={planKey === selectedPlan}
          />
        ))}
      </div>

      {/* Flat pricing note */}
      <div style={{
        marginTop: "12px",
        padding: "12px",
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "6px"
      }}>
        <div style={{ fontSize: "11px", color: "#166534", marginBottom: "6px", fontWeight: "600" }}>
          Flat yearly pricing — Basic रु 75,000 · Professional रु 135,000 · Enterprise रु 210,000
        </div>
        <div style={{ fontSize: "10px", color: "#166534" }}>
          Need more than your plan allows? Upgrade the plan instead of paying per branch.
        </div>
      </div>
    </div>
  );
}
