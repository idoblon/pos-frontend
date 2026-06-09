import React, { useState } from "react";
import { Check, Clock } from "lucide-react";
import { toast } from "sonner";
import posLogo from "@/logo/pos.png";
import axios from "axios";

const PLANS = {
  BASIC: 3500,
  PROFESSIONAL: 7000,
  ENTERPRISE: 10000,
};

export default function StorePaymentPage() {
  const [step, setStep] = useState("form");
  const [txnId] = useState(`TXN${Date.now().toString().slice(-8)}`);
  const [formData, setFormData] = useState({
    email: "",
    storeName: "",
    plan: "BASIC",
    paymentMethod: "esewa",
  });

  // eSewa fields
  const [esewaRef, setEsewaRef] = useState("");
  // Khalti fields
  const [khaltiMobile, setKhaltiMobile] = useState("");
  const [khaltiToken, setKhaltiToken] = useState("");

  const [fieldError, setFieldError] = useState("");

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.storeName) {
      toast.error("Please fill in store details");
      return;
    }
    if (formData.paymentMethod === "esewa" && !esewaRef.trim()) {
      setFieldError("Please enter the eSewa transaction reference.");
      return;
    }
    if (formData.paymentMethod === "khalti") {
      if (!khaltiMobile.trim() || khaltiMobile.length < 10) {
        setFieldError("Please enter a valid 10-digit mobile number.");
        return;
      }
      if (!khaltiToken.trim()) {
        setFieldError("Please enter the Khalti transaction token.");
        return;
      }
    }
    setFieldError("");
    setStep("processing");
    try {
      const txnRef = formData.paymentMethod === "esewa" ? esewaRef : khaltiToken;
      await axios.post("http://localhost:8080/api/public/complete-payment", {
        email: formData.email,
        storeName: formData.storeName,
        plan: formData.plan,
        paymentMethod: formData.paymentMethod.toUpperCase(),
        transactionId: txnRef,
      }, { timeout: 30000 });
      setStep("success");
    } catch (err) {
      setStep("form");
      setFieldError(err.response?.data?.message || "Payment failed. Please check your details.");
    }
  };

  const inputStyle = {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  };

  if (step === "processing") {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <Clock size={48} color="#1a1d23" style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1d23" }}>Processing Payment...</h2>
          <p style={{ color: "#6b7280", marginTop: "8px" }}>Please do not close this window</p>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ background: "white", borderRadius: "16px", padding: "40px", maxWidth: "480px", width: "100%", textAlign: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
          <div style={{ width: "64px", height: "64px", background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Check size={32} color="#166534" />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1d23", margin: "0 0 8px" }}>Payment Successful!</h2>
          <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 24px" }}>
            Your subscription payment for <strong>{formData.storeName}</strong> has been received.
            You will receive your login credentials via email shortly.
          </p>
          <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "16px", marginBottom: "24px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>Plan</span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1d23" }}>{formData.plan}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>Amount Paid</span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#059669" }}>
                रु {PLANS[formData.plan]?.toLocaleString("en-IN")}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>Payment Method</span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1d23" }}>
                {formData.paymentMethod === "esewa" ? "eSewa" : "Khalti"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>Transaction ID</span>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#1a1d23", fontFamily: "monospace" }}>{txnId}</span>
            </div>
          </div>
          <p style={{ fontSize: "12px", color: "#9ca3af" }}>Check your email for login credentials</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "32px", maxWidth: "520px", width: "100%", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <div style={{ background: "#f9fafb", padding: "6px", borderRadius: "8px" }}>
              <img src={posLogo} alt="POS" style={{ width: 28, height: 28, objectFit: "contain" }} />
            </div>
            <span style={{ fontSize: "16px", fontWeight: "700", color: "#1a1d23" }}>POS Pro</span>
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: "700", color: "#1a1d23" }}>Complete Your Subscription</h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>Pay your annual subscription to activate your store</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Store Details */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>
              Store Details
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Registered Email *</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Store Name *</label>
                <input name="storeName" value={formData.storeName} onChange={handleChange} required placeholder="Your Store Name" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Subscription Plan</label>
                <select name="plan" value={formData.plan} onChange={handleChange} style={{ ...inputStyle, background: "white" }}>
                  <option value="BASIC">Basic — रु 3,500/year</option>
                  <option value="PROFESSIONAL">Professional — रु 7,000/year</option>
                  <option value="ENTERPRISE">Enterprise — रु 10,000/year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "14px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#166534" }}>Total Amount</span>
            <span style={{ fontSize: "20px", fontWeight: "700", color: "#166534" }}>रु {PLANS[formData.plan]?.toLocaleString("en-IN")}</span>
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>
              Payment Method
            </h3>
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              {[
                { value: "esewa", label: "eSewa", color: "#60BB46" },
                { value: "khalti", label: "Khalti", color: "#5C2D91" },
              ].map((m) => (
                <button key={m.value} type="button"
                  onClick={() => { setFormData((p) => ({ ...p, paymentMethod: m.value })); setFieldError(""); }}
                  style={{
                    flex: 1, padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: "700",
                    cursor: "pointer", border: `2px solid ${formData.paymentMethod === m.value ? m.color : "#e5e7eb"}`,
                    background: formData.paymentMethod === m.value ? m.color : "white",
                    color: formData.paymentMethod === m.value ? "white" : "#6b7280",
                    transition: "all 0.2s",
                  }}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* eSewa fields */}
            {formData.paymentMethod === "esewa" && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "16px" }}>
                <ol style={{ margin: "0 0 14px", paddingLeft: "18px", fontSize: "12px", color: "#374151", lineHeight: "1.9" }}>
                  <li>Open your <strong>eSewa</strong> app</li>
                  <li>Tap <strong>Send Money</strong></li>
                  <li>Enter amount: <strong>रु {PLANS[formData.plan]?.toLocaleString("en-IN")}</strong></li>
                  <li>Complete the payment and note the reference</li>
                </ol>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                  Transaction Reference *
                </label>
                <input
                  value={esewaRef}
                  onChange={(e) => { setEsewaRef(e.target.value); setFieldError(""); }}
                  placeholder="e.g. ESW2024XXXX"
                  style={{ ...inputStyle, borderColor: "#bbf7d0" }}
                />
                <p style={{ fontSize: "11px", color: "#6b7280", marginTop: "6px" }}>
                  🧪 Test reference: <strong style={{ fontFamily: "monospace", color: "#15803d" }}>ESW2024TEST</strong>
                </p>
              </div>
            )}

            {/* Khalti fields */}
            {formData.paymentMethod === "khalti" && (
              <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "10px", padding: "16px" }}>
                <ol style={{ margin: "0 0 14px", paddingLeft: "18px", fontSize: "12px", color: "#374151", lineHeight: "1.9" }}>
                  <li>Open your <strong>Khalti</strong> app</li>
                  <li>Tap <strong>Pay</strong> and enter the amount</li>
                  <li>Complete payment and copy the <strong>Transaction Token</strong></li>
                </ol>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                      Registered Mobile *
                    </label>
                    <input
                      value={khaltiMobile}
                      onChange={(e) => { setKhaltiMobile(e.target.value.replace(/\D/, "")); setFieldError(""); }}
                      placeholder="98XXXXXXXX"
                      maxLength={10}
                      style={{ ...inputStyle, borderColor: "#e9d5ff" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                      Transaction Token *
                    </label>
                    <input
                      value={khaltiToken}
                      onChange={(e) => { setKhaltiToken(e.target.value); setFieldError(""); }}
                      placeholder="e.g. ABC123XYZ"
                      style={{ ...inputStyle, borderColor: "#e9d5ff" }}
                    />
                    <p style={{ fontSize: "11px", color: "#6b7280", marginTop: "6px" }}>
                      🧪 Test — Mobile: <strong style={{ fontFamily: "monospace", color: "#5C2D91" }}>9800000001</strong> &nbsp; Token: <strong style={{ fontFamily: "monospace", color: "#5C2D91" }}>123456</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {fieldError && (
              <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "8px" }}>{fieldError}</p>
            )}
          </div>

          <button type="submit" style={{
            width: "100%", padding: "13px",
            background: formData.paymentMethod === "esewa" ? "#60BB46" : "#5C2D91",
            color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "700",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}>
            <Check size={16} />
            Pay रु {PLANS[formData.plan]?.toLocaleString("en-IN")} via {formData.paymentMethod === "esewa" ? "eSewa" : "Khalti"}
          </button>
        </form>
      </div>
    </div>
  );
}
