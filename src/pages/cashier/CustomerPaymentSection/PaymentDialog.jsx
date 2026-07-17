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
  selectCartNote,
} from "@/Redux Toolkit/Features/Cart/cartSlice";
import { formatMoney } from "@/util/currency";
import EsewaPaymentPopup from "./EsewaPaymentPopup";
import KhaltiPaymentPopup from "./KhaltiPaymentPopup";
import CardPaymentPopup from "./CardPaymentPopup";

const PAYMENT_METHODS = [
  { id: "CASH",   label: "Cash",   icon: Banknote },
  { id: "CARD",   label: "Card",   icon: CreditCard },
  { id: "ESEWA",  label: "eSewa",  icon: Smartphone },
  { id: "KHALTI", label: "Khalti", icon: Smartphone },
];

const generateEsewaUuid = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = (globalThis.crypto?.randomUUID?.().replaceAll("-", "") || Math.random().toString(36).slice(2, 12));
  return `ESEWA-${ts}-${rnd.slice(0, 10).toUpperCase()}`;
};

const PaymentDialog = ({ open, onClose, onOrderComplete }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const total     = useSelector(selectTotal);
  const customer  = useSelector(selectSelectedCustomer);
  const discount  = useSelector(selectDiscount);
  const note      = useSelector(selectCartNote);

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountReceived, setAmountReceived] = useState("");
  const [esewaRef]       = useState(generateEsewaUuid);

  const [showEsewa,  setShowEsewa]  = useState(false);
  const [showKhalti, setShowKhalti] = useState(false);
  const [showCard,   setShowCard]   = useState(false);

  const [loading,        setLoading]        = useState(false);
  const [success,        setSuccess]        = useState(false);
  const [error,          setError]          = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);
  const [receiptMessage, setReceiptMessage] = useState("");

  const change = amountReceived ? Math.max(0, parseFloat(amountReceived) - total) : 0;

  const submitOrder = async (transactionId = null) => {
    setError("");
    if (cartItems.length === 0) { setError("Please add items to the cart first."); return; }

    const hasInvalid = cartItems.some((item) => {
      const pid = Number(item.id ?? item._id);
      return !Number.isSafeInteger(pid) || pid <= 0;
    });
    if (hasInvalid) { setError("Cannot process order with invalid products."); return; }

    try {
      setLoading(true);
      const orderItems = cartItems.map((item) => ({
        productId: Number(item.id || item._id),
        quantity:  item.quantity || 1,
        price:     item.price || item.sellingPrice,
      }));

      const response = await api.post("/api/orders", {
        customerId:    customer?.id || customer?._id || null,
        items:         orderItems,
        discount:      discount.value || 0,
        discountType:  discount.type  || "percentage",
        note:          note || "",
        paymentMethod,
        amountReceived: paymentMethod === "CASH" ? parseFloat(amountReceived) : total,
        transactionId,
        paymentReference: transactionId,
        total,
      });

      setCompletedOrder(response.data);
      setSuccess(true);
      dispatch(patchOrder({
        ...response.data,
        items: response.data.items?.map((item) => ({
          ...item,
          unitPrice: item.unitPrice || item.price / (item.quantity || 1),
        })),
        status: "COMPLETED",
        paymentMethod,
        paymentType: paymentMethod,
        customer:   !customer?.id ? null : customer,
        customerId: customer?.id || null,
      }));
      onOrderComplete?.();
    } catch (err) {
      const msg = err.response?.data?.message || "Payment failed. Please try again.";
      setError(
        msg.includes("not found in branch inventory") || msg.includes("Product not found")
          ? "Some products are not available in your branch inventory."
          : msg
      );
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
    } else if (paymentMethod === "ESEWA")  { onClose(); setShowEsewa(true); }
    else if (paymentMethod === "KHALTI")   { onClose(); setShowKhalti(true); }
    else if (paymentMethod === "CARD")     { onClose(); setShowCard(true); }
  };

  const resetState = () => {
    setAmountReceived(""); setPaymentMethod("CASH");
    setSuccess(false); setError("");
    setShowEsewa(false); setShowKhalti(false); setShowCard(false);
    setCompletedOrder(null); setReceiptMessage("");
  };

  const handleClose = () => {
    if (loading) return;
    resetState();
    onClose();
  };

  const receiptNumber      = completedOrder?.id ? `ORD-${completedOrder.id}` : "Order";
  const receiptTotal       = completedOrder?.totalAmount ?? total;
  const receiptCustomerName = customer?.fullName || customer?.firstName || "Customer";

  const escapeHtml = (v) => String(v).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[c]);

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
      await api.post("/api/email/order-confirmation", {
        to: customer.email, userName: receiptCustomerName,
        orderNumber: receiptNumber, amount: receiptTotal, storeName: "POS System",
      });
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
    <>
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
                <div style={{ background: "#f5f5f5", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, textAlign: "center" }}>
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

                {/* Payment Method selector */}
                <div>
                  <Label className="mb-2 block">Payment Method</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                      <button key={id} type="button"
                        onClick={() => { setPaymentMethod(id); setError(""); }}
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

                {/* CASH amount input */}
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

                {/* Digital method hint */}
                {["ESEWA", "KHALTI", "CARD"].includes(paymentMethod) && (
                  <div style={{ background: "#f5f5f5", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 16px", fontSize: 12, color: "#6b7280", textAlign: "center" }}>
                    Click <strong style={{ color: "#1a1d23" }}>Complete Payment</strong> to open the{" "}
                    {paymentMethod === "ESEWA" ? "eSewa" : paymentMethod === "KHALTI" ? "Khalti" : "Card"} payment form with test credentials
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

      <EsewaPaymentPopup
        open={showEsewa}
        onClose={() => { setShowEsewa(false); resetState(); onOrderComplete?.(); }}
        amount={total}
        transactionUuid={esewaRef}
        loading={loading}
        onConfirm={async (uuid) => { await submitOrder(uuid); }}
        onPrint={printReceipt}
        onEmail={emailReceipt}
        onSms={composeSmsReceipt}
        receiptMessage={receiptMessage}
        emailLoading={loading}
      />
      <KhaltiPaymentPopup
        open={showKhalti}
        onClose={() => { setShowKhalti(false); resetState(); onOrderComplete?.(); }}
        amount={total}
        loading={loading}
        onConfirm={async ({ token }) => { await submitOrder(token); }}
        onPrint={printReceipt}
        onEmail={emailReceipt}
        onSms={composeSmsReceipt}
        receiptMessage={receiptMessage}
        emailLoading={loading}
      />
      <CardPaymentPopup
        open={showCard}
        onClose={(wasSuccess) => { setShowCard(false); if (wasSuccess) { onOrderComplete?.(); resetState(); } else resetState(); }}
        amount={total}
        onSubmit={async (paymentMethodId) => {
          if (cartItems.length === 0) throw new Error("Please add items to the cart first.");
          const orderItems = cartItems.map((item) => ({
            productId: Number(item.id || item._id),
            quantity:  item.quantity || 1,
            price:     item.price || item.sellingPrice,
          }));
          const response = await api.post("/api/orders", {
            customerId:       customer?.id || customer?._id || null,
            items:            orderItems,
            discount:         discount.value || 0,
            discountType:     discount.type  || "percentage",
            note:             note || "",
            paymentMethod:    "CARD",
            amountReceived:   total,
            transactionId:    paymentMethodId,
            paymentReference: paymentMethodId,
            total,
          });
          dispatch(patchOrder({
            ...response.data,
            items: response.data.items?.map((item) => ({
              ...item,
              unitPrice: item.unitPrice || item.price / (item.quantity || 1),
            })),
            status: "COMPLETED", paymentMethod: "CARD", paymentType: "CARD",
            customer: !customer?.id ? null : customer,
            customerId: customer?.id || null,
          }));
          setCompletedOrder(response.data);
        }}
        onPrint={printReceipt}
        onEmail={emailReceipt}
        onSms={composeSmsReceipt}
        receiptMessage={receiptMessage}
        emailLoading={loading}
      />
    </>
  );
};

export default PaymentDialog;
