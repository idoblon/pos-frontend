import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";

const EsewaPaymentPopup = ({ open, onClose, amount, onConfirm, loading }) => {
  const [ref, setRef] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!ref.trim()) {
      setError("Please enter the eSewa transaction reference.");
      return;
    }
    setError("");
    onConfirm(ref.trim());
  };

  const handleClose = () => {
    if (loading) return;
    setRef("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              style={{
                background: "#60BB46",
                color: "white",
                fontWeight: 800,
                fontSize: 13,
                padding: "2px 10px",
                borderRadius: 6,
                letterSpacing: 0.5,
              }}
            >
              eSewa
            </span>
            Payment
          </DialogTitle>
          <DialogDescription className="sr-only">Enter your eSewa transaction reference to confirm payment.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Amount */}
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
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
                color: "#15803d",
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
            <li>Open your <strong>eSewa</strong> app</li>
            <li>Tap <strong>Send Money</strong> or <strong>Scan QR</strong></li>
            <li>Enter amount: <strong>रु {amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong></li>
            <li>Complete the payment</li>
            <li>Enter the transaction reference below</li>
          </ol>

          {/* Reference input */}
          <div>
            <Label htmlFor="esewa-ref" style={{ fontSize: 12, fontWeight: 600 }}>
              Transaction Reference <span style={{ color: "#ef4444" }}>*</span>
            </Label>
            <Input
              id="esewa-ref"
              placeholder="e.g. ESW2024XXXX"
              value={ref}
              onChange={(e) => { setRef(e.target.value); setError(""); }}
              style={{ marginTop: 4 }}
              autoFocus
            />
            <p style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
              🧪 Test reference:{" "}
              <strong
                style={{ fontFamily: "monospace", color: "#15803d", cursor: "pointer" }}
                onClick={() => setRef("ESW2024TEST")}
              >
                ESW2024TEST
              </strong>
            </p>
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
              disabled={loading || !ref.trim()}
              style={{ background: "#60BB46", border: "none", color: "white" }}
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

export default EsewaPaymentPopup;
