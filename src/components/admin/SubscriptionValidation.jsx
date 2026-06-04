import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Clock, CreditCard } from "lucide-react";

export default function SubscriptionValidation({ request, onValidation }) {
  const [subscriptionStatus, setSubscriptionStatus] = useState("checking");
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    validateSubscription();
  }, [request]);

  const validateSubscription = async () => {
    try {
      // Simulate subscription validation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const hasValidPayment = Math.random() > 0.3; // 70% success rate
      setPaymentStatus(hasValidPayment);
      setSubscriptionStatus(hasValidPayment ? "valid" : "invalid");
      onValidation(hasValidPayment);
    } catch (error) {
      setSubscriptionStatus("error");
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
          text: "Validating subscription...",
        };
      case "valid":
        return {
          icon: CheckCircle,
          color: "#059669",
          bg: "#d1fae5",
          text: "Subscription verified",
        };
      case "invalid":
        return {
          icon: AlertCircle,
          color: "#dc2626",
          bg: "#fee2e2",
          text: "Subscription validation failed",
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
          <strong>Plan:</strong> {request.subscriptionPlan} Plan
        </p>
        <p style={{ margin: "0 0 8px" }}>
          <strong>Store:</strong> {request.storeName}
        </p>
        
        {subscriptionStatus === "invalid" && (
          <div style={{
            marginTop: "12px",
            padding: "8px",
            background: "#fef2f2",
            borderRadius: "4px",
            border: "1px solid #fecaca"
          }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#dc2626" }}>
              • Payment verification failed
              <br />
              • Contact customer for payment details
              <br />
              • Cannot approve registration without valid subscription
            </p>
          </div>
        )}
      </div>
    </div>
  );
}