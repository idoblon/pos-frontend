import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Banknote, Smartphone, CheckCircle, Loader2, Mail, MessageSquare, Printer } from "lucide-react";
import api from "@/util/api";
import { patchOrder } from "@/Redux Toolkit/Features/order/orderSlice";
import {
  selectCartItems,
  selectTotal,
  selectSelectedCustomer,
  selectDiscount,
  selectCartNote
} from "@/Redux Toolkit/Features/Cart/cartSlice";
import { formatMoney } from "@/util/currency";
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
  const [cardReference, setCardReference] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);
  const [receiptMessage, setReceiptMessage] = useState("");

  const change = amountReceived ? Math.max(0, parseFloat(amountReceived) - total) : 0;

  const submitOrder = async (transactionId = null) => {
    setError("");
    if (cartItems.length === 0) { setError("Please add items to the cart first."); return; }

    const hasInvalidProducts = cartItems.some((item) => {
      const productId = Number(item.id ?? item._id);
      return !Number.isSafeInteger(productId) || productId <= 0;
    });
    if (hasInvalidProducts) { setError("Cannot process order with invalid products."); return; }

    try {
      setLoading(true);

      const orderItems = cartItems.map((item) => {
        const productId = item.id || item._id;
        return {
          productId: Number(productId),
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

      setCompletedOrder(response.data);
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

      onOrderComplete?.();
    } catch (err) {
      const msg = err.response?.data?.message || "Payment failed. Please try again.";
      if (msg.includes("query did not return a unique result")) {
        setError("This product has duplicate inventory records in this branch. Ask an administrator to merge the duplicate inventory entry, then try again.");
      } else {
        setError(msg.includes("not found in branch inventory") || msg.includes("Product not found")
          ? "Some products are not available in your branch inventory."
          : msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    setError("");
    if (cartItems.length === 0) { setError("Please add items to the cart first."); return; }

    if (paymentMethod === "CASH") {
      if (!amountReceived || parseFloat(amountReceived) < total) {
        setError(`Amount received must be at least ${formatMoney(total)}`);
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
      if (!cardReference.trim()) { setError("Please enter the terminal receipt or approval reference."); return; }
      submitOrder(cardReference.trim());
    }
  };

  const handleClose = () => {
    if (loading) return;
    setAmountReceived(""); setPaymentMethod("CASH"); setSuccess(false); setError("");
    setEsewaRef(""); setKhaltiMobile(""); setKhaltiToken("");
    setCardReference("");
    setCompletedOrder(null); setReceiptMessage("");
    onClose();
  };

  const receiptNumber = completedOrder?.id ? `ORD-${completedOrder.id}` : "Order";
  const receiptTotal = completedOrder?.totalAmount ?? total;
  const receiptCustomerName = customer?.fullName || customer?.firstName || "Customer";
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;",
  })[character]);

  const printReceipt = () => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=420,height=600");
    if (!printWindow) {
      setReceiptMessage("Allow pop-ups to print this receipt.");
      return;
    }
    printWindow.document.write(`<!doctype html><html><head><title>${escapeHtml(receiptNumber)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{font-size:20px;margin:0 0 8px}p{margin:6px 0}.total{font-size:20px;font-weight:700;margin-top:16px;border-top:1px dashed #777;padding-top:12px}</style></head><body><h1>Payment Receipt</h1><p>Order: ${escapeHtml(receiptNumber)}</p><p>Customer: ${escapeHtml(receiptCustomerName)}</p><p>Payment: ${escapeHtml(paymentMethod)}</p><p>Date: ${escapeHtml(new Date().toLocaleString())}</p><p class="total">Total: ${escapeHtml(formatMoney(receiptTotal))}</p><p>Thank you for your purchase.</p><script>window.print();window.onafterprint=()=>window.close();</script></body></html>`);
    printWindow.document.close();
  };

  const emailReceipt = async () => {
    const email = customer?.email;
    if (!email) {
      setReceiptMessage("Add a customer email before sending a receipt.");
      return;
    }
    try {
      setLoading(true);
      await api.post("/api/email/order-confirmation", {
        to: email,
        userName: receiptCustomerName,
        orderNumber: receiptNumber,
        amount: receiptTotal,
        storeName: "POS System",
      });
      setReceiptMessage(`Receipt emailed to ${email}.`);
    } catch {
      setReceiptMessage("Unable to send the receipt email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const composeSmsReceipt = () => {
    const phone = customer?.phone || customer?.phoneNumber;
    if (!phone) {
      setReceiptMessage("Add a customer phone number before composing an SMS receipt.");
      return;
    }
    const body = encodeURIComponent(`POS receipt ${receiptNumber}: ${formatMoney(receiptTotal)} paid by ${paymentMethod}. Thank you.`);
    window.location.href = `sms:${phone}?body=${body}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        {success ? (
          <div className="text-center py-10">
            <CheckCircle className="h-16 w-16 mx-auto mb-4" style={{ color: "#1a1d23" }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#1a1d23" }}>Payment Successful!</h2>
            <p style={{ color: "#6b7280" }}>Order <strong>{receiptNumber}</strong> has been created successfully.</p>
            <p style={{ fontSize: 24, fontWeight: 800, margin: "12px 0 20px" }}>{formatMoney(receiptTotal)}</p>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={printReceipt}><Printer size={15} className="mr-1" />Print</Button>
              <Button variant="outline" onClick={emailReceipt} disabled={loading}><Mail size={15} className="mr-1" />Email</Button>
              <Button variant="outline" onClick={composeSmsReceipt}><MessageSquare size={15} className="mr-1" />SMS</Button>
            </div>
            {receiptMessage && <p style={{ color: "#4b5563", fontSize: 12, marginTop: 12 }}>{receiptMessage}</p>}
            <Button className="w-full mt-4" onClick={handleClose} disabled={loading}>Done</Button>
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
                  {formatMoney(total)}
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
                  {PAYMENT_METHODS.map(({ id, label, icon: PaymentMethodIcon }) => (
                    <button key={id} type="button" onClick={() => { setPaymentMethod(id); setError(""); }}
                      style={{
                        padding: "12px 8px", borderRadius: 10, cursor: "pointer",
                        border: `2px solid ${paymentMethod === id ? "#1a1d23" : "#e5e7eb"}`,
                        background: paymentMethod === id ? "#f5f5f5" : "white",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      }}
                    >
                      {React.createElement(PaymentMethodIcon, {
                        size: 22,
                        color: paymentMethod === id ? "#1a1d23" : "#6b7280",
                      })}
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
                      <span style={{ fontWeight: 700, color: "#1a1d23" }}>{formatMoney(change)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ESEWA */}
              {paymentMethod === "ESEWA" && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 16 }}>
                  <ol style={{ margin: "0 0 12px", paddingLeft: 18, fontSize: 12, color: "#374151", lineHeight: 1.8 }}>
                    <li>Open your <strong>eSewa</strong> app and tap <strong>Send Money</strong></li>
                    <li>Enter amount: <strong>{formatMoney(total)}</strong></li>
                    <li>Complete the provider flow and use the server-issued transaction UUID</li>
                  </ol>
                  <Label htmlFor="esewa-ref" style={{ fontSize: 12, fontWeight: 600 }}>Merchant Transaction UUID *</Label>
                  <Input id="esewa-ref" placeholder="Server-issued transaction UUID" value={esewaRef}
                    onChange={(e) => { setEsewaRef(e.target.value); setError(""); }}
                    style={{ marginTop: 4, borderColor: "#bbf7d0" }} autoFocus
                  />
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
                    </div>
                  </div>
                </div>
              )}

              {/* CARD */}
              {paymentMethod === "CARD" && (
                <div style={{ background: "#f5f5f5", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
                  <p style={{ margin: "0 0 10px", fontSize: 12, color: "#4b5563", lineHeight: 1.5 }}>
                    Complete the payment on the card terminal, then record its receipt or approval reference. Card details are never entered or stored here.
                  </p>
                  <Label htmlFor="card-reference" style={{ fontSize: 12, fontWeight: 600 }}>Terminal reference *</Label>
                  <Input id="card-reference" placeholder="e.g. terminal receipt number" value={cardReference}
                    onChange={(e) => { setCardReference(e.target.value); setError(""); }}
                    style={{ marginTop: 4 }} autoFocus
                  />
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
