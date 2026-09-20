import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Banknote, Smartphone, CheckCircle, Loader2, Mail, MessageSquare, Printer, X } from "lucide-react";
import api from "@/util/api";
import { patchOrder } from "@/Redux Toolkit/Features/order/orderSlice";
import {
  selectCartItems, selectTotal, selectSelectedCustomer,
  selectDiscount, selectCartNote, selectTax,
} from "@/Redux Toolkit/Features/Cart/cartSlice";
import { formatMoney } from "@/util/currency";
import { queueOfflineOrder } from "@/util/offlineOrderQueue";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const checkoutKey = () => globalThis.crypto?.randomUUID?.() || `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const PAYMENT_METHODS = [
  { id: "CASH",   label: "Cash",   icon: Banknote },
  { id: "CARD",   label: "Card",   icon: CreditCard },
  { id: "ESEWA",  label: "eSewa",  icon: Smartphone },
  { id: "KHALTI", label: "Khalti", icon: Smartphone },
];

const CARD_ELEMENT_OPTIONS = {
  hidePostalCode: true,
  disableLink: true,
  style: {
    base: { fontSize: "15px", color: "#1a1d23", fontFamily: "Arial, sans-serif", "::placeholder": { color: "#9ca3af" } },
    invalid: { color: "#ef4444" },
  },
};

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ receiptNumber, receiptTotal, receiptMessage, loading, onPrint, onEmail, onSms, onDone }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 8px" }}>
      <CheckCircle size={64} style={{ color: "#1a1d23", margin: "0 auto 16px" }} />
      <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#1a1d23" }}>Payment Successful!</h2>
      <p style={{ color: "#6b7280", margin: "0 0 4px" }}>Order <strong>{receiptNumber}</strong> created successfully.</p>
      <p style={{ fontSize: 28, fontWeight: 900, margin: "12px 0 20px", color: "#1a1d23" }}>{formatMoney(receiptTotal)}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        <Button variant="outline" onClick={onPrint} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Printer size={15} />Print</Button>
        <Button variant="outline" onClick={onEmail} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Mail size={15} />Email</Button>
        <Button variant="outline" onClick={onSms} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><MessageSquare size={15} />SMS</Button>
      </div>
      {receiptMessage && <p style={{ color: "#4b5563", fontSize: 12, marginBottom: 12 }}>{receiptMessage}</p>}
      <Button onClick={onDone} disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}>Done</Button>
    </div>
  );
}

// ─── eSewa Form ───────────────────────────────────────────────────────────────
function EsewaForm({ onConfirm, loading, error }) {
  const [esewaId, setEsewaId] = useState("9806800001");
  const [mpin, setMpin] = useState("1122");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 14 }}>
        <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#166534" }}>🧪 eSewa Test Credentials</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "eSewa IDs", value: "9806800001–9806800005" },
            { label: "MPIN", value: "1122" },
            { label: "Password", value: "Nepal@123" },
            { label: "Merchant", value: "EPAYTEST" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "white", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 10px" }}>
              <p style={{ margin: 0, fontSize: 10, color: "#6b7280" }}>{label}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "#166534" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>eSewa ID <span style={{ color: "#ef4444" }}>*</span></Label>
        <Input value={esewaId} onChange={(e) => setEsewaId(e.target.value)} placeholder="9806800001" style={{ marginTop: 4 }} />
      </div>
      <div>
        <Label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>MPIN <span style={{ color: "#ef4444" }}>*</span></Label>
        <Input value={mpin} onChange={(e) => setMpin(e.target.value)} placeholder="1122" type="password" style={{ marginTop: 4 }} />
      </div>
      {error && <p style={{ margin: 0, fontSize: 12, color: "#ef4444" }}>{error}</p>}
      <Button onClick={() => onConfirm(`ESEWA-${esewaId}-${Date.now()}`)} disabled={loading || !esewaId.trim() || !mpin.trim()}
        style={{ background: "#60BB46", border: "none", color: "white", fontWeight: 700 }}>
        {loading ? <><Loader2 size={14} className="animate-spin mr-2" />Confirming...</> : <><CheckCircle size={14} className="mr-2" />Confirm eSewa Payment</>}
      </Button>
    </div>
  );
}

// ─── Khalti Form ─────────────────────────────────────────────────────────────
function KhaltiForm({ onConfirm, loading, error }) {
  const [mobile, setMobile] = useState("9800000001");
  const [token, setToken] = useState("987654");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 10, padding: 14 }}>
        <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#5C2D91" }}>🧪 Khalti Test Credentials</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "Mobile", value: "9800000001" },
            { label: "MPIN", value: "1111" },
            { label: "OTP", value: "987654" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "white", border: "1px solid #e9d5ff", borderRadius: 8, padding: "8px 10px" }}>
              <p style={{ margin: 0, fontSize: 10, color: "#6b7280" }}>{label}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "#5C2D91" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Registered Mobile <span style={{ color: "#ef4444" }}>*</span></Label>
        <Input value={mobile} maxLength={10} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} placeholder="9800000001" style={{ marginTop: 4 }} />
      </div>
      <div>
        <Label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Transaction Token / OTP <span style={{ color: "#ef4444" }}>*</span></Label>
        <Input value={token} onChange={(e) => setToken(e.target.value)} placeholder="987654" style={{ marginTop: 4 }} />
      </div>
      {error && <p style={{ margin: 0, fontSize: 12, color: "#ef4444" }}>{error}</p>}
      <Button onClick={() => onConfirm(token)} disabled={loading || !mobile.trim() || !token.trim()}
        style={{ background: "linear-gradient(135deg,#5C2D91,#7C3AED)", border: "none", color: "white", fontWeight: 700 }}>
        {loading ? <><Loader2 size={14} className="animate-spin mr-2" />Confirming...</> : <><CheckCircle size={14} className="mr-2" />Confirm Khalti Payment</>}
      </Button>
    </div>
  );
}

// ─── Card Form (Stripe) ───────────────────────────────────────────────────────
function CardForm({ onConfirm, loading, error }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardHolder, setCardHolder] = useState("");
  const [cardError, setCardError] = useState("");

  const handleCharge = async () => {
    if (!stripe || !elements) return;
    if (!cardHolder.trim()) { setCardError("Enter the cardholder name."); return; }
    setCardError("");
    const cardElement = elements.getElement(CardElement);
    const { paymentMethod, error: stripeError } = await stripe.createPaymentMethod({
      type: "card", card: cardElement,
      billing_details: { name: cardHolder.trim() },
    });
    if (stripeError) { setCardError(stripeError.message); return; }
    onConfirm(paymentMethod.id);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
        <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#1a1d23" }}>🧪 Stripe Test Card</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "Card Number", value: "4242 4242 4242 4242" },
            { label: "Expiry", value: "Any future date" },
            { label: "CVV", value: "Any 3 digits" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px" }}>
              <p style={{ margin: 0, fontSize: 10, color: "#6b7280" }}>{label}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#1a1d23" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Cardholder Name <span style={{ color: "#ef4444" }}>*</span></Label>
        <input value={cardHolder} onChange={(e) => { setCardHolder(e.target.value.toUpperCase()); setCardError(""); }}
          placeholder="JOHN DOE" disabled={loading}
          style={{ width: "100%", marginTop: 4, padding: "10px 12px", borderRadius: 8, fontSize: 14, border: "1px solid #e5e7eb", outline: "none", fontFamily: "Arial, sans-serif", boxSizing: "border-box" }} />
      </div>
      <div>
        <Label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Card Details <span style={{ color: "#ef4444" }}>*</span></Label>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "11px 12px", marginTop: 4, background: "white" }}>
          <CardElement options={CARD_ELEMENT_OPTIONS} onChange={() => setCardError("")} />
        </div>
      </div>
      {(cardError || error) && <p style={{ margin: 0, fontSize: 12, color: "#ef4444" }}>{cardError || error}</p>}
      <Button onClick={handleCharge} disabled={loading || !cardHolder.trim()}
        style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", border: "none", color: "white", fontWeight: 700 }}>
        {loading ? <><Loader2 size={14} className="animate-spin mr-2" />Processing...</> : <><CreditCard size={14} className="mr-2" />Charge Card</>}
      </Button>
      <p style={{ margin: 0, fontSize: 10, color: "#9ca3af", textAlign: "center" }}>🔒 Secured by Stripe. Card details are never stored on our servers.</p>
    </div>
  );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────
const PaymentDialog = ({ open, onClose, onOrderComplete }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const total     = useSelector(selectTotal);
  const customer  = useSelector(selectSelectedCustomer);
  const discount  = useSelector(selectDiscount);
  const note      = useSelector(selectCartNote);
  const tax       = useSelector(selectTax);

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountReceived, setAmountReceived] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(checkoutKey);

  const [loading,        setLoading]        = useState(false);
  const [success,        setSuccess]        = useState(false);
  const [error,          setError]          = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);
  const [receiptMessage, setReceiptMessage] = useState("");

  const change = amountReceived ? Math.max(0, parseFloat(amountReceived) - total) : 0;

  const submitOrder = async (transactionId = null) => {
    setError("");
    if (cartItems.length === 0) { setError("Please add items to the cart first."); return; }
    const hasInvalid = cartItems.some((item) => { const pid = Number(item.id ?? item._id); return !Number.isSafeInteger(pid) || pid <= 0; });
    if (hasInvalid) { setError("Cannot process order with invalid products."); return; }
    const orderPayload = {
      customerId: customer?.id || customer?._id || null,
      items: cartItems.map((item) => ({ productId: Number(item.id || item._id), quantity: item.quantity || 1, price: item.price || item.sellingPrice })),
      discount: discount.value || 0, discountType: discount.type || "percentage",
      note: note || "", paymentMethod, amountReceived: paymentMethod === "CASH" ? parseFloat(amountReceived) : total,
      transactionId, paymentReference: transactionId, tax, total,
    };
    try {
      setLoading(true);
      const response = await api.post("/api/orders", orderPayload, { headers: { "Idempotency-Key": idempotencyKey } });
      setCompletedOrder(response.data);
      setSuccess(true);
      dispatch(patchOrder({
        ...response.data,
        items: response.data.items?.map((item) => ({ ...item, unitPrice: item.unitPrice || item.price / (item.quantity || 1) })),
        status: "COMPLETED", paymentMethod, paymentType: paymentMethod,
        customer: !customer?.id ? null : customer, customerId: customer?.id || null,
      }));
      onOrderComplete?.();
      setIdempotencyKey(checkoutKey());
    } catch (err) {
      // Only cash is safe to queue: card and wallet payments need live verification.
      if (!err.response && paymentMethod === "CASH") {
        let queued;
        try {
          queued = queueOfflineOrder({ order: orderPayload, idempotencyKey });
        } catch (queueError) {
          setError(queueError.message || "Unable to save this offline sale.");
          return;
        }
        setCompletedOrder({ id: queued.id, totalAmount: total });
        setSuccess(true);
        setReceiptMessage("Saved securely on this device and will sync automatically when online.");
        dispatch(patchOrder({
          id: queued.id, totalAmount: total, items: orderPayload.items,
          status: "PENDING_SYNC", paymentMethod: "CASH", createdAt: queued.createdAt,
          offlinePending: true,
        }));
        onOrderComplete?.();
        setIdempotencyKey(checkoutKey());
        return;
      }
      const msg = err.response?.data?.message || "Payment failed. Please try again.";
      setError(msg.includes("not found in branch inventory") || msg.includes("Product not found")
        ? "Some products are not available in your branch inventory." : msg);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setAmountReceived(""); setPaymentMethod("CASH");
    setSuccess(false); setError(""); setCompletedOrder(null); setReceiptMessage("");
  };

  const handleClose = () => { if (loading) return; resetState(); onClose(); };

  const receiptNumber       = completedOrder?.id ? `ORD-${completedOrder.id}` : "Order";
  const receiptTotal        = completedOrder?.totalAmount ?? total;
  const receiptCustomerName = customer?.fullName || customer?.firstName || "Customer";

  const escapeHtml = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[c]);

  const printReceipt = () => {
    const w = window.open("", "_blank", "noopener,noreferrer,width=420,height=600");
    if (!w) { setReceiptMessage("Allow pop-ups to print this receipt."); return; }
    w.document.write(`<!doctype html><html><head><title>${escapeHtml(receiptNumber)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{font-size:20px;margin:0 0 8px}p{margin:6px 0}.total{font-size:20px;font-weight:700;margin-top:16px;border-top:1px dashed #777;padding-top:12px}</style></head><body><h1>Payment Receipt</h1><p>Order: ${escapeHtml(receiptNumber)}</p><p>Customer: ${escapeHtml(receiptCustomerName)}</p><p>Payment: ${escapeHtml(paymentMethod)}</p><p>Date: ${escapeHtml(new Date().toLocaleString())}</p><p class="total">Total: ${escapeHtml(formatMoney(receiptTotal))}</p><p>Thank you for your purchase.</p><script>window.print();window.onafterprint=()=>window.close();</script></body></html>`);
    w.document.close();
  };

  const emailReceipt = async () => {
    if (!customer?.email) { setReceiptMessage("Add a customer email before sending a receipt."); return; }
    try {
      setLoading(true);
      await api.post("/api/email/order-confirmation", { to: customer.email, userName: receiptCustomerName, orderNumber: receiptNumber, amount: receiptTotal, storeName: "POS System" });
      setReceiptMessage(`Receipt emailed to ${customer.email}.`);
    } catch { setReceiptMessage("Unable to send the receipt email. Please try again."); }
    finally { setLoading(false); }
  };

  const composeSmsReceipt = () => {
    const phone = customer?.phone || customer?.phoneNumber;
    if (!phone) { setReceiptMessage("Add a customer phone number before composing an SMS receipt."); return; }
    window.location.href = `sms:${phone}?body=${encodeURIComponent(`POS receipt ${receiptNumber}: ${formatMoney(receiptTotal)} paid by ${paymentMethod}. Thank you.`)}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        {success ? (
          <SuccessScreen
            receiptNumber={receiptNumber} receiptTotal={receiptTotal}
            receiptMessage={receiptMessage} loading={loading}
            onPrint={printReceipt} onEmail={emailReceipt} onSms={composeSmsReceipt}
            onDone={handleClose}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Process Payment</DialogTitle>
              <DialogDescription>Complete the payment for this order</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Total */}
              <div style={{ background: "#f5f5f5", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Total Amount</p>
                <p style={{ margin: "4px 0 0", fontSize: 32, fontWeight: 800, color: "#1a1d23", letterSpacing: "-1px" }}>{formatMoney(total)}</p>
                {customer && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6b7280" }}>
                    Customer: <strong>{customer.fullName || `${customer.firstName || ""} ${customer.lastName || ""}`.trim()}</strong>
                  </p>
                )}
              </div>

              {/* Method selector */}
              <div>
                <Label className="mb-2 block">Payment Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                    <button key={id} type="button" onClick={() => { setPaymentMethod(id); setError(""); }}
                      style={{ padding: "12px 8px", borderRadius: 10, cursor: "pointer", border: `2px solid ${paymentMethod === id ? "#1a1d23" : "#e5e7eb"}`, background: paymentMethod === id ? "#f5f5f5" : "white", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <Icon size={22} color={paymentMethod === id ? "#1a1d23" : "#6b7280"} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: paymentMethod === id ? "#1a1d23" : "#6b7280" }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash */}
              {paymentMethod === "CASH" && (
                <div>
                  <Label htmlFor="amountReceived" className="mb-1 block">Amount Received (रु)</Label>
                  <Input id="amountReceived" type="number" min={total} value={amountReceived}
                    onChange={(e) => { setAmountReceived(e.target.value); setError(""); }}
                    placeholder={`Min. रु ${total.toFixed(2)}`} className="text-lg" autoFocus />
                  {amountReceived && parseFloat(amountReceived) >= total && (
                    <div style={{ marginTop: 8, padding: "10px 14px", background: "#f5f5f5", border: "1px solid #e5e7eb", borderRadius: 8, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#6b7280" }}>Change to return:</span>
                      <span style={{ fontWeight: 700, color: "#1a1d23" }}>{formatMoney(change)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* eSewa */}
              {paymentMethod === "ESEWA" && (
                <EsewaForm loading={loading} error={error} onConfirm={(txId) => submitOrder(txId)} />
              )}

              {/* Khalti */}
              {paymentMethod === "KHALTI" && (
                <KhaltiForm loading={loading} error={error} onConfirm={(token) => submitOrder(token)} />
              )}

              {/* Card */}
              {paymentMethod === "CARD" && (
                <Elements stripe={stripePromise} options={{ loader: "never", appearance: { disableAnimations: true } }}>
                  <CardForm loading={loading} error={error} onConfirm={(pmId) => submitOrder(pmId)} />
                </Elements>
              )}

              {error && paymentMethod === "CASH" && (
                <p style={{ fontSize: 13, color: "#e53e3e", textAlign: "center", margin: 0 }}>{error}</p>
              )}

              {/* Cash submit / Cancel — only shown for CASH since other methods have their own button */}
              {paymentMethod === "CASH" && (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleClose} disabled={loading}>Cancel</Button>
                  <Button className="flex-1" disabled={loading}
                    onClick={() => {
                      if (!amountReceived || parseFloat(amountReceived) < total) { setError(`Amount received must be at least ${formatMoney(total)}`); return; }
                      submitOrder();
                    }}
                    style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}>
                    {loading ? <><Loader2 size={15} className="animate-spin mr-2" />Processing...</> : "Complete Payment"}
                  </Button>
                </div>
              )}

              {paymentMethod !== "CASH" && (
                <Button variant="outline" className="w-full" onClick={handleClose} disabled={loading}>Cancel</Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
