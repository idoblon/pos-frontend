import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, X, Printer, Mail, MessageSquare } from "lucide-react";
import { formatMoney } from "@/util/currency";

const TEST = { id: "9806800001", mpin: "1122", password: "Nepal@123" };

export default function EsewaPaymentPopup({ open, onClose, amount, transactionUuid, onConfirm, loading, onPrint, onEmail, onSms, receiptMessage, emailLoading }) {
  const [ref, setRef] = useState(transactionUuid || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleConfirm = async () => {
    if (!ref.trim()) { setError("Transaction UUID is required."); return; }
    setError("");
    try {
      await onConfirm(ref.trim());
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Payment failed. Please try again.");
    }
  };

  const handleClose = () => {
    if (loading) return;
    setRef(""); setError(""); setSuccess(false); onClose();
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm [&>button]:hidden" style={{ borderRadius: 16, textAlign: "center", padding: 32 }}>
          <button onClick={handleClose}
            style={{ position: "absolute", top: 14, right: 14, background: "#f1f5f9", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={14} color="#64748b" />
          </button>
          <CheckCircle size={56} style={{ color: "#60BB46", margin: "0 auto 16px" }} />
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#166534" }}>Payment Successful!</h2>
          <p style={{ margin: "0 0 4px", color: "#6b7280", fontSize: 14 }}>eSewa payment confirmed</p>
          <p style={{ margin: "0 0 20px", fontSize: 28, fontWeight: 900, color: "#166534" }}>{formatMoney(amount)}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            <Button variant="outline" onClick={onPrint} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Printer size={15} />Print</Button>
            <Button variant="outline" onClick={onEmail} disabled={emailLoading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Mail size={15} />Email</Button>
            <Button variant="outline" onClick={onSms} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><MessageSquare size={15} />SMS</Button>
          </div>
          {receiptMessage && <p style={{ color: "#4b5563", fontSize: 12, marginBottom: 12 }}>{receiptMessage}</p>}
          <Button onClick={handleClose}
            style={{ width: "100%", background: "#60BB46", color: "white", border: "none" }}>
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
        <div style={{ background: "#60BB46", padding: "20px 20px 16px", position: "relative" }}>
          <button onClick={handleClose} disabled={loading}
            style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={14} color="white" />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "white", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#60BB46", fontWeight: 900, fontSize: 13 }}>e</span>
            </div>
            <div>
              <p style={{ margin: 0, color: "white", fontWeight: 800, fontSize: 16 }}>eSewa Payment</p>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: 12 }}>UAT Test Mode</p>
            </div>
          </div>
          <div style={{ marginTop: 16, background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: 11 }}>Amount to Pay</p>
            <p style={{ margin: "2px 0 0", color: "white", fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>{formatMoney(amount)}</p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 14 }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#166534" }}>🧪 Test Credentials</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "eSewa ID", value: TEST.id },
                { label: "MPIN", value: TEST.mpin },
                { label: "Password", value: TEST.password },
                { label: "Merchant", value: "EPAYTEST" },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "white", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 10px" }}>
                  <p style={{ margin: 0, fontSize: 10, color: "#6b7280" }}>{label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: "#166534" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Transaction UUID <span style={{ color: "#ef4444" }}>*</span></label>
              <button onClick={() => { setRef(transactionUuid || ""); setError(""); }}
                style={{ fontSize: 11, color: "#60BB46", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                Use generated
              </button>
            </div>
            <Input value={ref} onChange={(e) => { setRef(e.target.value); setError(""); }}
              placeholder="Auto-generated UUID" autoFocus style={{ fontFamily: "monospace", fontSize: 12 }} />
            {error && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#ef4444" }}>{error}</p>}
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "#6b7280" }}>
              In test mode any UUID is accepted. The UUID is stored with the order for audit.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" style={{ flex: 1 }} onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={loading || !ref.trim()}
              style={{ flex: 1, background: "#60BB46", border: "none", color: "white", fontWeight: 700 }}>
              {loading ? <><Loader2 size={14} className="animate-spin mr-2" />Confirming...</> : <><CheckCircle size={14} className="mr-2" />Confirm</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
