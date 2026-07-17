import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle, Loader2, X, Printer, Mail, MessageSquare } from "lucide-react";
import { formatMoney } from "@/util/currency";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  hidePostalCode: true,
  disableLink: true,
  style: {
    base: {
      fontSize: "15px",
      color: "#1a1d23",
      fontFamily: "Arial, sans-serif",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#ef4444" },
  },
};

function CardForm({ amount, onSubmit, onClose, onPrint, onEmail, onSms, receiptMessage, emailLoading }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardHolder, setCardHolder] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    if (!cardHolder.trim()) { setError("Enter the cardholder name."); return; }

    setError("");
    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    const { paymentMethod, error: stripeError } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: { name: cardHolder.trim() },
    });

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
      return;
    }

    try {
      await onSubmit(paymentMethod.id);
      setSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Payment failed. Please try again.";
      setError(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = (wasSuccess = false) => {
    if (processing) return;
    setCardHolder(""); setError(""); setSuccess(false);
    onClose(wasSuccess);
  };

  if (success) {
    return (
      <DialogContent className="max-w-sm [&>button]:hidden" style={{ borderRadius: 16, textAlign: "center", padding: 32 }}>
        <button onClick={() => handleClose(true)}
          style={{ position: "absolute", top: 14, right: 14, background: "#f1f5f9", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={14} color="#64748b" />
        </button>
        <CheckCircle size={56} style={{ color: "#1a1d23", margin: "0 auto 16px" }} />
        <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#1a1d23" }}>Payment Successful!</h2>
        <p style={{ margin: "0 0 4px", color: "#6b7280", fontSize: 14 }}>Card charged successfully</p>
        <p style={{ margin: "0 0 20px", fontSize: 28, fontWeight: 900, color: "#1a1d23" }}>{formatMoney(amount)}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          <Button variant="outline" onClick={onPrint} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Printer size={15} />Print</Button>
          <Button variant="outline" onClick={onEmail} disabled={emailLoading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Mail size={15} />Email</Button>
          <Button variant="outline" onClick={onSms} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><MessageSquare size={15} />SMS</Button>
        </div>
        {receiptMessage && <p style={{ color: "#4b5563", fontSize: 12, marginBottom: 12 }}>{receiptMessage}</p>}
        <Button onClick={() => handleClose(true)}
          style={{ width: "100%", marginTop: 4, background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}>
          Done
        </Button>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-sm p-0 overflow-hidden [&>button]:hidden" style={{ borderRadius: 16 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1d23, #374151)", padding: "20px 20px 16px", position: "relative" }}>
        <button onClick={handleClose} disabled={processing}
          style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={14} color="white" />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "white", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CreditCard size={18} color="#1a1d23" />
          </div>
          <div>
            <p style={{ margin: 0, color: "white", fontWeight: 800, fontSize: 16 }}>Card Payment</p>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Powered by Stripe</p>
          </div>
        </div>
        <div style={{ marginTop: 16, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Amount to Charge</p>
          <p style={{ margin: "2px 0 0", color: "white", fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>{formatMoney(amount)}</p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
            Cardholder Name <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            value={cardHolder}
            onChange={(e) => { setCardHolder(e.target.value.toUpperCase()); setError(""); }}
            placeholder="JOHN DOE"
            disabled={processing}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 14,
              border: "1px solid #e5e7eb", outline: "none", fontFamily: "Arial, sans-serif",
              background: processing ? "#f9fafb" : "white", boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
            Card Details <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "11px 12px", background: processing ? "#f9fafb" : "white" }}>
            <CardElement options={CARD_ELEMENT_OPTIONS} onChange={() => setError("")} />
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: "#6b7280" }}>
            Test card: <span style={{ fontFamily: "monospace", fontWeight: 600 }}>4242 4242 4242 4242</span> · Any future date · Any CVV
          </p>
        </div>

        {error && <p style={{ margin: 0, fontSize: 12, color: "#ef4444" }}>{error}</p>}

        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" style={{ flex: 1 }} onClick={handleClose} disabled={processing}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={processing || !cardHolder.trim()}
            style={{ flex: 1, background: "linear-gradient(135deg,#1a1d23,#4a4d55)", border: "none", color: "white", fontWeight: 700 }}>
            {processing
              ? <><Loader2 size={14} className="animate-spin mr-2" />Processing...</>
              : <><CheckCircle size={14} className="mr-2" />Charge Card</>}
          </Button>
        </div>

        <p style={{ margin: 0, fontSize: 10, color: "#9ca3af", textAlign: "center" }}>
          🔒 Secured by Stripe. Card details are never stored on our servers.
        </p>
      </div>
    </DialogContent>
  );
}

export default function CardPaymentPopup({ open, onClose, amount, onSubmit, onPrint, onEmail, onSms, receiptMessage, emailLoading }) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <Elements stripe={stripePromise} options={{ loader: "never", appearance: { disableAnimations: true } }}>
        <CardForm amount={amount} onSubmit={onSubmit} onClose={onClose}
          onPrint={onPrint} onEmail={onEmail} onSms={onSms}
          receiptMessage={receiptMessage} emailLoading={emailLoading} />
      </Elements>
    </Dialog>
  );
}
