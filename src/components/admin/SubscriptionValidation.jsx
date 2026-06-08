import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Clock, CreditCard, Mail } from "lucide-react";

export default function SubscriptionValidation({ request, onValidation }) {
  const [subscriptionStatus, setSubscriptionStatus] = useState("checking");
  const [validationStep, setValidationStep] = useState("initial");

  useEffect(() => {
    validateSubscription();
  }, [request]);

  const validateSubscription = async () => {
    try {
      // Simulate subscription validation process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, always mark as valid for approval
      // Payment will be handled after approval
      setSubscriptionStatus("ready_for_approval");
      setValidationStep("validated");
      onValidation(true);
    } catch (error) {
      setSubscriptionStatus("error");
      setValidationStep("error");
      onValidation(false);
    }
  };

  const getStatusDisplay = () => {
    switch (subscriptionStatus) {
      case "checking":
        return {
          icon: Clock,
          color: "#f59e0b",
          bg: "#fef3c7",
          text: "Validating registration details...",
        };
      case "ready_for_approval":
        return {
          icon: CheckCircle,
          color: "#059669",
          bg: "#d1fae5",
          text: "Registration validated - Ready for approval",
        };
      case "error":
        return {
          icon: AlertCircle,
          color: "#dc2626",
          bg: "#fee2e2",
          text: "Validation failed",
        };
      default:
        return {
          icon: AlertCircle,
          color: "#6b7280",
          bg: "#f3f4f6",
          text: "Unable to validate",
        };
    }
  };

  const status = getStatusDisplay();
  const StatusIcon = status.icon;

  return (
    <div style={{
      padding: "16px",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      background: status.bg,
      marginBottom: "16px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <StatusIcon size={16} color={status.color} />
        <span style={{ fontSize: "14px", fontWeight: "600", color: status.color }}>
          {status.text}
        </span>
      </div>

      <div style={{ fontSize: "12px", color: "#6b7280" }}>
        <p style={{ margin: "0 0 8px" }}>
          <strong>Plan:</strong> {request.subscriptionPlan} Plan - रु {request.subscriptionPlan === 'BASIC' ? '3,500' : request.subscriptionPlan === 'PROFESSIONAL' ? '7,000' : '10,000'}/year
        </p>
        <p style={{ margin: "0 0 8px" }}>
          <strong>Store:</strong> {request.storeName}
        </p>
        <p style={{ margin: "0 0 8px" }}>
          <strong>Contact:</strong> {request.email}
        </p>
        
        {subscriptionStatus === "ready_for_approval" && (
          <div style={{
            marginTop: "12px",
            padding: "12px",
            background: "#f0fdf4",
            borderRadius: "6px",
            border: "1px solid #bbf7d0"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <CreditCard size={14} color="#059669" />
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#059669" }}>
                Payment Process (After Approval)
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "11px", color: "#166534", lineHeight: "1.4" }}>
              • Store registration details validated ✓
              <br />
              • Payment link will be sent after approval
              <br />
              • Store access activated upon payment confirmation
              <br />
              • Customer will receive setup instructions via email
            </p>
          </div>
        )}

        {subscriptionStatus === "error" && (
          <div style={{
            marginTop: "12px",
            padding: "8px",
            background: "#fef2f2",
            borderRadius: "4px",
            border: "1px solid #fecaca"
          }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#dc2626" }}>
              • Registration validation failed
              <br />
              • Check store details and contact information
              <br />
              • Cannot approve registration without valid details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}