import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, CheckCircle, Loader2 } from "lucide-react";

// formats "4111111111111111" → "4111 1111 1111 1111"
const formatCardNumber = (val) =>
  val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

// formats "1224" → "12/24"
const formatExpiry = (val) => {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
};

const CardPaymentPopup = ({ open, onClose, amount, onConfirm, loading }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [error, setError] = useState("");

  const rawCard = cardNumber.replace(/\s/g, "");

  const handleConfirm = () => {
    if (rawCard.length < 16) {
      setError("Please enter a valid 16-digit card number.");
      return;
    }
    if (expiry.length < 5) {
      setError("Please enter a valid expiry date (MM/YY).");
      return;
    }
    if (cvv.length < 3) {
      setError("Please enter a valid CVV.");
      return;
    }
    if (!cardHolder.trim()) {
      setError("Please enter the cardholder name.");
      return;
    }
    setError("");
    onConfirm({ cardNumber: rawCard, expiry, cvv, cardHolder: cardHolder.trim() });
  };

  const handleClose = () => {
    if (loading) return;
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setCardHolder("");
    setError("");
    onClose();
  };

  // Detect card brand from first digit
  const cardBrand = rawCard.startsWith("4")
    ? "VISA"
    : rawCard.startsWith("5")
    ? "MASTERCARD"
    : rawCard.startsWith("3")
    ? "AMEX"
    : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              style={{
                background: "#1a1d23",
                color: "white",
                fontWeight: 800,
                fontSize: 13,
                padding: "2px 10px",
                borderRadius: 6,
                letterSpacing: 0.5,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <CreditCard size={13} /> Card
            </span>
            Payment
            {cardBrand && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  fontWeight: 700,
                  color: cardBrand === "VISA" ? "#1a56db" : cardBrand === "MASTERCARD" ? "#e3342f" : "#f59e0b",
                  border: `1px solid currentColor`,
                  borderRadius: 4,
                  padding: "1px 7px",
                }}
              >
                {cardBrand}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">Enter your card details to complete the payment.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Amount */}
          <div
            style={{
              background: "#f5f5f5",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "14px 16px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>Amount to Charge</p>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 30,
                fontWeight: 800,
                color: "#1a1d23",
                letterSpacing: -1,
              }}
            >
              रु {amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Card Number */}
          <div>
            <Label htmlFor="card-number" style={{ fontSize: 12, fontWeight: 600 }}>
              Card Number <span style={{ color: "#ef4444" }}>*</span>
            </Label>
            <Input
              id="card-number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); setError(""); }}
              style={{ marginTop: 4, letterSpacing: 2, fontFamily: "monospace" }}
              autoFocus
            />
          </div>

          {/* Cardholder */}
          <div>
            <Label htmlFor="card-holder" style={{ fontSize: 12, fontWeight: 600 }}>
              Cardholder Name <span style={{ color: "#ef4444" }}>*</span>
            </Label>
            <Input
              id="card-holder"
              placeholder="JOHN DOE"
              value={cardHolder}
              onChange={(e) => { setCardHolder(e.target.value.toUpperCase()); setError(""); }}
              style={{ marginTop: 4 }}
            />
          </div>

          {/* Expiry + CVV */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <Label htmlFor="card-expiry" style={{ fontSize: 12, fontWeight: 600 }}>
                Expiry <span style={{ color: "#ef4444" }}>*</span>
              </Label>
              <Input
                id="card-expiry"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => { setExpiry(formatExpiry(e.target.value)); setError(""); }}
                style={{ marginTop: 4 }}
                maxLength={5}
              />
            </div>
            <div>
              <Label htmlFor="card-cvv" style={{ fontSize: 12, fontWeight: 600 }}>
                CVV <span style={{ color: "#ef4444" }}>*</span>
              </Label>
              <Input
                id="card-cvv"
                placeholder="123"
                value={cvv}
                type="password"
                onChange={(e) => { setCvv(e.target.value.replace(/\D/g, "").slice(0, 4)); setError(""); }}
                style={{ marginTop: 4 }}
              />
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 11, color: "#ef4444", margin: 0 }}>{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirm}
              disabled={loading || rawCard.length < 16 || expiry.length < 5 || cvv.length < 3 || !cardHolder.trim()}
              style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", border: "none", color: "white" }}
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin mr-2" /> Processing...</>
              ) : (
                <><CheckCircle size={15} className="mr-2" /> Charge Card</>
              )}
            </Button>
          </div>

          <p style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", margin: 0 }}>
            🔒 Card details are processed securely and not stored.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardPaymentPopup;
