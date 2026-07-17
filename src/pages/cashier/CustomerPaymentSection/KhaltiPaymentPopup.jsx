import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, X, Printer, Mail, MessageSquare } from "lucide-react";
import { formatMoney } from "@/util/currency";

const TEST = { mobile: "9800000001", mpin: "1111", otp: "987654" };

export default function KhaltiPaymentPopup({ open, onClose, amount, onConfirm, loading, onPrint, onEmail, onSms, receiptMessage, emailLoading }) {
  const [mobile, setMobile] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const autofill = () => { setMobile(TEST.mobile); setToken(TEST.otp); setError(""); };

  const handleConfirm = async () => {
    if (!mobile.trim() || mobile.length < 10) { setError("Enter a valid 10-digit mobile number."); return; }
    if (!token.trim()) { setError("Transaction token is required."); return; }
    setError("");
    try {
      await onConfirm({ mobile: mobile.trim(), token: token.trim() });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Payment failed. Please try again.");
    }
  };

  const handleClose = () => {
    if (loading) return;
    setMobile(""); setToken(""); setError(""); setSuccess(false); onClose();
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm [&>button]:hidden" style={{ borderRadius: 16, textAlign: "center", padding: 32 }}>
          <button onClick={handleClose}
            style={{ position: "absolute", top: 14, right: 14, background: "#f1f5f9", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={14} color="#64748b" />
          </button>
          <CheckCircle size={56} style={{ color: "#5C2D91", margin: "0 auto 16px" }} />
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#5C2D91" }}>Payment Successful!</h2>
          <p style={{ margin: "0 0 4px", color: "#6b7280", fontSize: 14 }}>Khalti payment confirmed</p>
          <p style={{ margin: "0 0 20px", fontSize: 28, fontWeight: 900, color: "#5C2D91" }}>{formatMoney(amount)}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            <Button variant="outline" onClick={onPrint} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Printer size={15} />Print</Button>
            <Button variant="outline" onClick={onEmail} disabled={emailLoading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Mail size={15} />Email</Button>
            <Button variant="outline" onClick={onSms} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><MessageSquare size={15} />SMS</Button>
          </div>
          {receiptMessage && <p style={{ color: "#4b5563", fontSize: 12, marginBottom: 12 }}>{receiptMessage}</p>}
          <Button onClick={handleClose}
            style={{ width: "100%", background: "linear-gradient(135deg,#5C2D91,#7C3AED)", color: "white", border: "none" }}>
            Done
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden [&>button]:hidden" style={{ borderRadius: 16 }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #5C2D91, #7C3AED)", padding: "20px 20px 16px", position: "relative" }}>
          <button onClick={handleClose} disabled={loading}
            style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={14} color="white" />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "white", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#5C2D91", fontWeight: 900, fontSize: 13 }}>K</span>
            </div>
            <div>
              <p style={{ margin: 0, color: "white", fontWeight: 800, fontSize: 16 }}>Khalti Payment</p>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Test Mode</p>
            </div>
          </div>
          <div style={{ marginTop: 16, background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: 11 }}>Amount to Pay</p>
            <p style={{ margin: "2px 0 0", color: "white", fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>{formatMoney(amount)}</p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 10, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#5C2D91" }}>🧪 Test Credentials</p>
              <button onClick={autofill}
                style={{ fontSize: 11, color: "#5C2D91", background: "white", border: "1px solid #e9d5ff", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontWeight: 600 }}>
                Autofill
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { label: "Mobile", value: TEST.mobile },
                { label: "MPIN", value: TEST.mpin },
                { label: "OTP", value: TEST.otp },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "white", border: "1px solid #e9d5ff", borderRadius: 8, padding: "8px 10px" }}>
                  <p style={{ margin: 0, fontSize: 10, color: "#6b7280" }}>{label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: "#5C2D91" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Registered Mobile <span style={{ color: "#ef4444" }}>*</span></label>
              <Input value={mobile} maxLength={10} autoFocus
                onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "")); setError(""); }}
                placeholder="9800000001" style={{ marginTop: 4, borderColor: "#e9d5ff" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Transaction Token <span style={{ color: "#ef4444" }}>*</span></label>
              <Input value={token}
                onChange={(e) => { setToken(e.target.value); setError(""); }}
                placeholder="e.g. 987654" style={{ marginTop: 4, borderColor: "#e9d5ff" }} />
            </div>
          </div>

          {error && <p style={{ margin: 0, fontSize: 11, color: "#ef4444" }}>{error}</p>}

          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" style={{ flex: 1 }} onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={loading || !mobile.trim() || !token.trim()}
              style={{ flex: 1, background: "linear-gradient(135deg,#5C2D91,#7C3AED)", border: "none", color: "white", fontWeight: 700 }}>
              {loading ? <><Loader2 size={14} className="animate-spin mr-2" />Confirming...</> : <><CheckCircle size={14} className="mr-2" />Confirm</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
