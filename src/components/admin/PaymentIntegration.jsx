import React, { useState } from "react";
import { CreditCard, Smartphone, Banknote, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const PAYMENT_METHODS = [
  { 
    id: "card", 
    name: "Credit/Debit Card", 
    icon: CreditCard, 
    description: "Visa, Mastercard, RuPay",
    available: true
  },
  { 
    id: "upi", 
    name: "UPI Payment", 
    icon: Smartphone, 
    description: "PhonePe, GPay, Paytm",
    available: true
  },
  { 
    id: "bank", 
    name: "Net Banking", 
    icon: Banknote, 
    description: "All major banks",
    available: true
  }
];

export default function PaymentIntegration({ subscription, onPaymentSuccess, onClose }) {
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    upiId: "",
    bankCode: ""
  });

  const plan = {
    BASIC: { name: "Basic", price: 3500 },
    PROFESSIONAL: { name: "Professional", price: 7000 },
    ENTERPRISE: { name: "Enterprise", price: 10000 }
  }[subscription?.plan] || { name: "Basic", price: 3500 };

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const processPayment = async () => {
    setProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate 90% success rate
      const success = Math.random() > 0.1;
      
      if (success) {
        toast.success("Payment successful! Subscription activated.");
        onPaymentSuccess({
          transactionId: `TXN_${Date.now()}`,
          amount: plan.price,
          method: selectedMethod,
          timestamp: new Date().toISOString()
        });
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch {
      toast.error("Payment processing error");
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case "card":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              placeholder="Card Number"
              value={paymentData.cardNumber}
              onChange={(e) => handleInputChange("cardNumber", e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "14px"
              }}
              maxLength={19}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <input
                type="text"
                placeholder="MM/YY"
                value={paymentData.expiryDate}
                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                style={{
                  padding: "10px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
                maxLength={5}
              />
              <input
                type="text"
                placeholder="CVV"
                value={paymentData.cvv}
                onChange={(e) => handleInputChange("cvv", e.target.value)}
                style={{
                  padding: "10px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
                maxLength={4}
              />
            </div>
            <input
              type="text"
              placeholder="Cardholder Name"
              value={paymentData.cardholderName}
              onChange={(e) => handleInputChange("cardholderName", e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            />
          </div>
        );
      case "upi":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              placeholder="Enter UPI ID (e.g., user@paytm)"
              value={paymentData.upiId}
              onChange={(e) => handleInputChange("upiId", e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            />
            <div style={{
              padding: "12px",
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#0369a1"
            }}>
              You will be redirected to your UPI app to complete the payment
            </div>
          </div>
        );
      case "bank":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <select
              value={paymentData.bankCode}
              onChange={(e) => handleInputChange("bankCode", e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "14px",
                background: "white"
              }}
            >
              <option value="">Select Your Bank</option>
              <option value="sbi">State Bank of India</option>
              <option value="hdfc">HDFC Bank</option>
              <option value="icici">ICICI Bank</option>
              <option value="axis">Axis Bank</option>
              <option value="pnb">Punjab National Bank</option>
            </select>
            <div style={{
              padding: "12px",
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#0369a1"
            }}>
              You will be redirected to your bank's secure portal
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 50
        }}
      />
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        width: "90%",
        maxWidth: "480px",
        maxHeight: "90vh",
        overflowY: "auto",
        zIndex: 51,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        {/* Header */}
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "700", color: "#1a1d23" }}>
            Complete Payment
          </h2>
          <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
            Secure payment for {subscription?.storeName || "Store"} subscription
          </p>
        </div>

        {/* Subscription Details */}
        <div style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#1a1d23" }}>
              {plan.name} Plan
            </span>
            <span style={{ fontSize: "16px", fontWeight: "700", color: "#1a1d23" }}>
              रु {plan.price.toLocaleString("en-IN")}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            Monthly subscription • Auto-renewal
          </div>
        </div>

        {/* Payment Methods */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: "#1a1d23" }}>
            Select Payment Method
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {PAYMENT_METHODS.map((method) => {
              const IconComponent = method.icon;
              return (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  style={{
                    padding: "12px",
                    border: `2px solid ${selectedMethod === method.id ? "#1a1d23" : "#e5e7eb"}`,
                    borderRadius: "8px",
                    cursor: method.available ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    opacity: method.available ? 1 : 0.5,
                    transition: "all 0.2s ease"
                  }}
                >
                  <IconComponent size={18} color={selectedMethod === method.id ? "#1a1d23" : "#6b7280"} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: selectedMethod === method.id ? "#1a1d23" : "#4b5563"
                    }}>
                      {method.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>
                      {method.description}
                    </div>
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircle size={16} color="#059669" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Form */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: "#1a1d23" }}>
            Payment Details
          </h3>
          {renderPaymentForm()}
        </div>

        {/* Security Notice */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "6px",
          marginBottom: "20px"
        }}>
          <Shield size={14} color="#059669" />
          <span style={{ fontSize: "11px", color: "#166534" }}>
            Your payment information is secure and encrypted
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
            disabled={processing}
            style={{
              flex: 1,
              padding: "12px",
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#6b7280",
              cursor: processing ? "not-allowed" : "pointer",
              opacity: processing ? 0.5 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={processPayment}
            disabled={processing}
            style={{
              flex: 2,
              padding: "12px",
              background: processing ? "#9ca3af" : "#1a1d23",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: processing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            {processing ? (
              <>
                <div style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid #ffffff40",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
                Processing...
              </>
            ) : (
              <>
                <CreditCard size={14} />
                Pay रु {plan.price.toLocaleString("en-IN")}
              </>
            )}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
