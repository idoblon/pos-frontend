import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Banknote, Smartphone, CheckCircle, Loader2 } from "lucide-react";
import api from "@/util/api";
import { patchOrder } from "@/Redux Toolkit/Features/order/orderSlice";
import {
  selectCartItems,
  selectTotal,
  selectSelectedCustomer,
  selectDiscount,
  selectCartNote,
  clearCart
} from "@/Redux Toolkit/Features/Cart/cartSlice";
const PAYMENT_METHODS = [
  { id: "CASH",   label: "Cash",   icon: Banknote },
  { id: "CARD",   label: "Card",   icon: CreditCard },
  { id: "ESEWA",  label: "eSewa",  icon: Smartphone },
  { id: "KHALTI", label: "Khalti", icon: Smartphone },
];

const PaymentDialog = ({ open, onClose, onOrderComplete }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const total = useSelector(selectTotal);
  const customer = useSelector(selectSelectedCustomer);
  const discount = useSelector(selectDiscount);
  const note = useSelector(selectCartNote);

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountReceived, setAmountReceived] = useState("");
  // digital payment fields
  const [esewaRef, setEsewaRef] = useState("");
  const [khaltiMobile, setKhaltiMobile] = useState("");
  const [khaltiToken, setKhaltiToken] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const change = amountReceived ? Math.max(0, parseFloat(amountReceived) - total) : 0;

  const formatCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v) => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? d.slice(0,2)+"/"+d.slice(2) : d; };
  const rawCard = cardNumber.replace(/\s/g, "");

  const submitOrder = async (transactionId = null) => {
    setError("");
    if (cartItems.length === 0) { setError("Please add items to the cart first."); return; }

    const hasInvalidProducts = cartItems.some((item) => {
      const productId = item.id || item._id;
      return !productId || (typeof productId === "string" && productId.startsWith("p"));
    });
    if (hasInvalidProducts) { setError("Cannot process order with invalid products."); return; }

    try {
      setLoading(true);

      const orderItems = cartItems.map((item) => {
        const productId = item.id || item._id;
        return {
          productId: typeof productId === "number" ? productId : parseInt(productId, 10),
          quantity: item.quantity || 1,
          price: item.price || item.sellingPrice,
        };
      });

      const response = await api.post("/api/orders", {
        customerId: customer?.id || customer?._id || null,
        items: orderItems,
        discount: discount.value || 0,
        discountType: discount.type || "percentage",
        note: note || "",
        paymentMethod,
        amountReceived: paymentMethod === "CASH" ? parseFloat(amountReceived) : total,
        transactionId,
        paymentReference: transactionId,
        total,
      });

      setSuccess(true);
      const isWalkIn = !customer?.id;
      dispatch(patchOrder({
        ...response.data,
        items: response.data.items?.map((item) => ({
          ...item,
          unitPrice: item.unitPrice || item.price / (item.quantity || 1),
        })),
        status: "COMPLETED",
        paymentMethod,
        paymentType: paymentMethod,
        customer: isWalkIn ? null : customer,
        customerId: customer?.id || null,
      }));

      setTimeout(() => {
        dispatch(clearCart());
        handleClose();
        onOrderComplete?.();
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "Payment failed. Please try again.";
      setError(msg.includes("not found in branch inventory") || msg.includes("Product not found")
        ? "⚠️ Some products are not available in your branch inventory."
        : msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    setError("");
    if (cartItems.length === 0) { setError("Please add items to the cart first."); return; }

    if (paymentMethod === "CASH") {
      if (!amountReceived || parseFloat(amountReceived) < total) {
        setError("Amount received must be at least रु " + total.toFixed(2));
        return;
      }
      submitOrder();
    } else if (paymentMethod === "ESEWA") {
      if (!esewaRef.trim()) { setError("Please enter the eSewa transaction reference."); return; }
      submitOrder(esewaRef.trim());
    } else if (paymentMethod === "KHALTI") {
      if (!khaltiMobile.trim() || khaltiMobile.length < 10) { setError("Please enter a valid 10-digit mobile number."); return; }
      if (!khaltiToken.trim()) { setError("Please enter the Khalti transaction token."); return; }
      submitOrder(khaltiToken.trim());
    } else if (paymentMethod === "CARD") {
      if (rawCard.length < 16) { setError("Please enter a valid 16-digit card number."); return; }
      if (cardExpiry.length < 5) { setError("Please enter a valid expiry date (MM/YY)."); return; }
      if (cardCvv.length < 3) { setError("Please enter a valid CVV."); return; }
      if (!cardHolder.trim()) { setError("Please enter the cardholder name."); return; }
      submitOrder(rawCard.slice(-4));
    }
  };

  const handleClose = () => {
    if (loading) return;
    setAmountReceived(""); setPaymentMethod("CASH"); setSuccess(false); setError("");
    setEsewaRef(""); setKhaltiMobile(""); setKhaltiToken("");
    setCardNumber(""); setCardHolder(""); setCardExpiry(""); setCardCvv("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        {success ? (
          <div className="text-center py-10">
            <CheckCircle className="h-16 w-16 mx-auto mb-4" style={{ color: "#1a1d23" }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#1a1d23" }}>Payment Successful!</h2>
            <p style={{ color: "#6b7280" }}>Order has been created successfully</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Process Payment</DialogTitle>
              <DialogDescription>Complete the payment for this order</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Total */}
              <div style={{ background: "#f5f5f5", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Total Amount</p>
                <p style={{ margin: "4px 0 0", fontSize: 32, fontWeight: 800, color: "#1a1d23", letterSpacing: "-1px" }}>
                  रु {total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </p>
                {customer && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6b7280" }}>
                    Customer: <strong>{customer.fullName || `${customer.firstName || ""} ${customer.lastName || ""}`.trim()}</strong>
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <Label className="mb-2 block">Payment Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                    <button key={id} type="button" onClick={() => { setPaymentMethod(id); setError(""); }}
                      style={{
                        padding: "12px 8px", borderRadius: 10, cursor: "pointer",
                        border: `2px solid ${paymentMethod === id ? "#1a1d23" : "#e5e7eb"}`,
                        background: paymentMethod === id ? "#f5f5f5" : "white",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      }}
                    >
                      <Icon size={22} color={paymentMethod === id ? "#1a1d23" : "#6b7280"} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: paymentMethod === id ? "#1a1d23" : "#6b7280" }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CASH */}
              {paymentMethod === "CASH" && (
                <div>
                  <Label htmlFor="amountReceived" className="mb-1 block">Amount Received (रु)</Label>
                  <Input id="amountReceived" type="number" min={total} value={amountReceived}
                    onChange={(e) => { setAmountReceived(e.target.value); setError(""); }}
                    placeholder={`Min. रु ${total.toFixed(2)}`} className="text-lg" autoFocus
                  />
                  {amountReceived && parseFloat(amountReceived) >= total && (
                    <div style={{ marginTop: 8, padding: "10px 14px", background: "#f5f5f5", border: "1px solid #e5e7eb", borderRadius: 8, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#6b7280" }}>Change to return:</span>
                      <span style={{ fontWeight: 700, color: "#1a1d23" }}>रु {change.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ESEWA */}
              {paymentMethod === "ESEWA" && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 16 }}>
                  <ol style={{ margin: "0 0 12px", paddingLeft: 18, fontSize: 12, color: "#374151", lineHeight: 1.8 }}>
                    <li>Open your <strong>eSewa</strong> app and tap <strong>Send Money</strong></li>
                    <li>Enter amount: <strong>रु {total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong></li>
                    <li>Complete the payment and note the reference</li>
                  </ol>
                  <Label htmlFor="esewa-ref" style={{ fontSize: 12, fontWeight: 600 }}>Transaction Reference *</Label>
                  <Input id="esewa-ref" placeholder="e.g. ESW2024XXXX" value={esewaRef}
                    onChange={(e) => { setEsewaRef(e.target.value); setError(""); }}
                    style={{ marginTop: 4, borderColor: "#bbf7d0" }} autoFocus
                  />
                  <p style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                    🧪 Test:{" "}
                    <strong style={{ fontFamily: "monospace", color: "#15803d", cursor: "pointer" }}
                      onClick={() => setEsewaRef("ESW2024TEST")}>ESW2024TEST</strong>
                  </p>
                </div>
              )}

              {/* KHALTI */}
              {paymentMethod === "KHALTI" && (
                <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 10, padding: 16 }}>
                  <ol style={{ margin: "0 0 12px", paddingLeft: 18, fontSize: 12, color: "#374151", lineHeight: 1.8 }}>
                    <li>Open your <strong>Khalti</strong> app and tap <strong>Pay</strong></li>
                    <li>Complete payment and copy the <strong>Transaction Token</strong></li>
                  </ol>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div>
                      <Label htmlFor="khalti-mobile" style={{ fontSize: 12, fontWeight: 600 }}>Registered Mobile *</Label>
                      <Input id="khalti-mobile" placeholder="98XXXXXXXX" value={khaltiMobile} maxLength={10}
                        onChange={(e) => { setKhaltiMobile(e.target.value.replace(/\D/g, "")); setError(""); }}
                        style={{ marginTop: 4, borderColor: "#e9d5ff" }} autoFocus
                      />
                    </div>
                    <div>
                      <Label htmlFor="khalti-token" style={{ fontSize: 12, fontWeight: 600 }}>Transaction Token *</Label>
                      <Input id="khalti-token" placeholder="e.g. ABC123XYZ" value={khaltiToken}
                        onChange={(e) => { setKhaltiToken(e.target.value); setError(""); }}
                        style={{ marginTop: 4, borderColor: "#e9d5ff" }}
                      />
                      <p style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                        🧪 Mobile:{" "}
                        <strong style={{ fontFamily: "monospace", color: "#5C2D91", cursor: "pointer" }}
                          onClick={() => setKhaltiMobile("9800000001")}>9800000001</strong>
                        {" "}Token:{" "}
                        <strong style={{ fontFamily: "monospace", color: "#5C2D91", cursor: "pointer" }}
                          onClick={() => setKhaltiToken("123456")}>123456</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD */}
              {paymentMethod === "CARD" && (
                <div style={{ background: "#f5f5f5", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div>
                      <Label htmlFor="card-number" style={{ fontSize: 12, fontWeight: 600 }}>Card Number *</Label>
                      <Input id="card-number" placeholder="1234 5678 9012 3456" value={cardNumber}
                        onChange={(e) => { setCardNumber(formatCard(e.target.value)); setError(""); }}
                        style={{ marginTop: 4, letterSpacing: 2, fontFamily: "monospace" }} autoFocus
                      />
                    </div>
                    <div>
                      <Label htmlFor="card-holder" style={{ fontSize: 12, fontWeight: 600 }}>Cardholder Name *</Label>
                      <Input id="card-holder" placeholder="JOHN DOE" value={cardHolder}
                        onChange={(e) => { setCardHolder(e.target.value.toUpperCase()); setError(""); }}
                        style={{ marginTop: 4 }}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <Label htmlFor="card-expiry" style={{ fontSize: 12, fontWeight: 600 }}>Expiry *</Label>
                        <Input id="card-expiry" placeholder="MM/YY" value={cardExpiry} maxLength={5}
                          onChange={(e) => { setCardExpiry(formatExpiry(e.target.value)); setError(""); }}
                          style={{ marginTop: 4 }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="card-cvv" style={{ fontSize: 12, fontWeight: 600 }}>CVV *</Label>
                        <Input id="card-cvv" placeholder="123" value={cardCvv} type="password" maxLength={4}
                          onChange={(e) => { setCardCvv(e.target.value.replace(/\D/g, "")); setError(""); }}
                          style={{ marginTop: 4 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && <p style={{ fontSize: 13, color: "#e53e3e", textAlign: "center", margin: 0 }}>{error}</p>}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleClose} disabled={loading}>Cancel</Button>
                <Button className="flex-1" onClick={handlePayment} disabled={loading}
                  style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}
                >
                  {loading ? <><Loader2 size={15} className="animate-spin mr-2" />Processing...</> : "Complete Payment"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;