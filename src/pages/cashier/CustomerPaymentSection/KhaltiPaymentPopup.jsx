import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";

const KhaltiPaymentPopup = ({ open, onClose, amount, onConfirm, loading }) => {
  const [mobile, setMobile] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!mobile.trim() || mobile.trim().length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!token.trim()) {
      setError("Please enter the Khalti transaction token.");
      return;
    }
    setError("");
    onConfirm({ mobile: mobile.trim(), token: token.trim() });
  };

  const handleClose = () => {
    if (loading) return;
    setMobile("");
    setToken("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* Khalti brand color: purple */}
            <span
              style={{
                background: "#5C2D91",
                color: "white",
                fontWeight: 800,
                fontSize: 13,
                padding: "2px 10px",
                borderRadius: 6,
                letterSpacing: 0.5,
              }}
            >
              Khalti
            </span>
            Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Amount */}
          <div
            style={{
              background: "#faf5ff",
              border: "1px solid #e9d5ff",
              borderRadius: 10,
              padding: "14px 16px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>Amount to Pay</p>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 30,
                fontWeight: 800,
                color: "#5C2D91",
                letterSpacing: -1,
              }}
            >
              रु {amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Instructions */}
          <ol
            style={{
              margin: 0,
              paddingLeft: 18,
              fontSize: 12,
              color: "#374151",
              lineHeight: 1.8,
            }}
          >
            <li>Open your <strong>Khalti</strong> app</li>
            <li>Tap <strong>Pay</strong> and enter the amount</li>
            <li>Complete payment using PIN or Face ID</li>
            <li>Copy the <strong>Transaction Token</strong> shown</li>
            <li>Enter your mobile and token below</li>
          </ol>

          {/* Mobile input */}
          <div>
            <Label htmlFor="khalti-mobile" style={{ fontSize: 12, fontWeight: 600 }}>
              Registered Mobile Number <span style={{ color: "#ef4444" }}>*</span>
            </Label>
            <Input
              id="khalti-mobile"
              placeholder="98XXXXXXXX"
              value={mobile}
              maxLength={10}
              onChange={(e) => { setMobile(e.target.value.replace(/\D/, "")); setError(""); }}
              style={{ marginTop: 4 }}
              autoFocus
            />
          </div>

          {/* Token input */}
          <div>
            <Label htmlFor="khalti-token" style={{ fontSize: 12, fontWeight: 600 }}>
              Transaction Token <span style={{ color: "#ef4444" }}>*</span>
            </Label>
            <Input
              id="khalti-token"
              placeholder="e.g. ABC123XYZ"
              value={token}
              onChange={(e) => { setToken(e.target.value); setError(""); }}
              style={{ marginTop: 4 }}
            />
            {error && (
              <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirm}
              disabled={loading || !mobile.trim() || !token.trim()}
              style={{ background: "#5C2D91", border: "none", color: "white" }}
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin mr-2" /> Confirming...</>
              ) : (
                <><CheckCircle size={15} className="mr-2" /> Confirm Payment</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KhaltiPaymentPopup;
