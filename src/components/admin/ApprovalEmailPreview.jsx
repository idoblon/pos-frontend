import React from "react";
import { Mail, CreditCard, CheckCircle, Clock, Building2 } from "lucide-react";

export default function ApprovalEmailPreview({ request }) {
  const getPlanPrice = (plan) => {
    switch(plan) {
      case 'BASIC': return '3,500';
      case 'PROFESSIONAL': return '7,000'; 
      case 'ENTERPRISE': return '10,000';
      default: return '3,500';
    }
  };

  const getPlanFeatures = (plan) => {
    switch(plan) {
      case 'BASIC': return ['1 Store', '3 Branches', '10 Users', 'Basic Support'];
      case 'PROFESSIONAL': return ['1 Store', '10 Branches', '50 Users', 'Priority Support', 'Advanced Reports'];
      case 'ENTERPRISE': return ['Unlimited Stores', 'Unlimited Branches', 'Unlimited Users', '24/7 Support', 'Custom Features'];
      default: return ['1 Store', '3 Branches', '10 Users', 'Basic Support'];
    }
  };

  return (
    <div style={{
      maxWidth: "600px",
      margin: "0 auto",
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Email Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1d23, #4a4d55)",
        padding: "24px",
        color: "white",
        textAlign: "center"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "8px"
        }}>
          <Building2 size={24} />
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
            POS Pro System
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
          Store Registration Approved!
        </p>
      </div>

      {/* Email Content */}
      <div style={{ padding: "32px 24px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
          padding: "12px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "8px"
        }}>
          <CheckCircle size={20} color="#059669" />
          <div>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#059669" }}>
              Congratulations {request.ownerName}!
            </h2>
            <p style={{ margin: 0, fontSize: "12px", color: "#166534" }}>
              Your store registration has been approved
            </p>
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: "#1a1d23" }}>
            Store Details:
          </h3>
          <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px", fontSize: "12px" }}>
            <p style={{ margin: "0 0 4px" }}><strong>Store Name:</strong> {request.storeName}</p>
            <p style={{ margin: "0 0 4px" }}><strong>Owner:</strong> {request.ownerName}</p>
            <p style={{ margin: "0 0 4px" }}><strong>Email:</strong> {request.email}</p>
            <p style={{ margin: "0 0 4px" }}><strong>Phone:</strong> {request.phone}</p>
            <p style={{ margin: 0 }}><strong>Address:</strong> {request.address}</p>
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: "#1a1d23" }}>
            Selected Subscription Plan:
          </h3>
          <div style={{
            border: "2px solid #059669",
            borderRadius: "8px",
            padding: "16px",
            background: "#f0fdf4"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "16px", fontWeight: "700", color: "#1a1d23" }}>
                {request.subscriptionPlan} Plan
              </span>
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#059669" }}>
                ₹ {getPlanPrice(request.subscriptionPlan)}/year
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#166534" }}>
              <strong>Includes:</strong>
              <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                {getPlanFeatures(request.subscriptionPlan).map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div style={{
          background: "#fef3c7",
          border: "2px solid #f59e0b",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <CreditCard size={18} color="#92400e" />
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#92400e" }}>
              Complete Your Payment
            </h3>
          </div>
          <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#92400e", lineHeight: "1.4" }}>
            To activate your POS system, please complete the payment for your selected subscription plan.
          </p>
          <button style={{
            width: "100%",
            padding: "12px",
            background: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer"
          }}>
            Pay ₹ {getPlanPrice(request.subscriptionPlan)} - Complete Setup
          </button>
          <p style={{ margin: "8px 0 0", fontSize: "10px", color: "#92400e", textAlign: "center" }}>
            Secure payment powered by Razorpay/eSewa
          </p>
        </div>

        {/* Next Steps */}
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: "#1a1d23" }}>
            What happens next?
          </h3>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "20px", height: "20px", background: "#059669", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "white" }}>1</div>
              <span>Complete payment using the button above</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "20px", height: "20px", background: "#3b82f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "white" }}>2</div>
              <span>Receive login credentials via email</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "20px", height: "20px", background: "#8b5cf6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "white" }}>3</div>
              <span>Access your POS dashboard and start setup</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "20px", height: "20px", background: "#f59e0b", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "white" }}>4</div>
              <span>Get onboarding support from our team</span>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div style={{
          background: "#f1f5f9",
          padding: "12px",
          borderRadius: "6px",
          textAlign: "center"
        }}>
          <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#64748b" }}>
            Need help? Our support team is here for you
          </p>
          <div style={{ fontSize: "11px", color: "#475569" }}>
            <p style={{ margin: 0 }}>📧 support@pos-pro.com | 📞 +977-1-234-5678</p>
          </div>
        </div>
      </div>

      {/* Email Footer */}
      <div style={{
        background: "#f8fafc",
        padding: "16px",
        textAlign: "center",
        fontSize: "10px",
        color: "#6b7280",
        borderTop: "1px solid #e5e7eb"
      }}>
        <p style={{ margin: 0 }}>© 2024 POS Pro System. All rights reserved.</p>
        <p style={{ margin: "4px 0 0" }}>This email was sent to {request.email}</p>
      </div>
    </div>
  );
}