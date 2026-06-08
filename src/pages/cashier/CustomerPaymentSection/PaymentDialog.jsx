import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Banknote, Smartphone, CheckCircle } from "lucide-react";
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
import secureStorage from "@/util/secureStorage";
import EsewaPaymentPopup from "./EsewaPaymentPopup";
import KhaltiPaymentPopup from "./KhaltiPaymentPopup";
import CardPaymentPopup from "./CardPaymentPopup";

const PAYMENT_METHODS = [
  { id: "CASH", label: "Cash", icon: Banknote },
  { id: "CARD", label: "Card", icon: CreditCard },
  { id: "ESEWA",  label: "eSewa",  icon: Smartphone },
  { id: "KHALTI",  label: "Khalti",  icon: Smartphone },
];

const PaymentDialog = ({ open, onClose, onOrderComplete }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const total = useSelector(selectTotal);
  const customer = useSelector(selectSelectedCustomer);
  const discount = useSelector(selectDiscount);
  const note = useSelector(selectCartNote);
  const { userProfile } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);
  const userData = secureStorage.getUserData();
  const cashierId = userProfile?.id || user?.id || userData?.userId || userData?.id;
  
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountReceived, setAmountReceived] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showEsewa, setShowEsewa] = useState(false);
  const [showKhalti, setShowKhalti] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const change = amountReceived ? Math.max(0, parseFloat(amountReceived) - total) : 0;

  // Debug logging
  React.useEffect(() => {
    console.log('💳 PaymentDialog - Total:', total.toFixed(2), 'Discount:', discount);
  }, [total, discount]);

  // Core order submission — called with gateway reference after popup confirms
  const submitOrder = async (gatewayRef = null) => {
    setError("");

    if (cartItems.length === 0) {
      setError("Please add items to the cart first.");
      return;
    }

    const hasInvalidProducts = cartItems.some((item) => {
      const productId = item.id || item._id;
      return !productId || (typeof productId === "string" && productId.startsWith("p"));
    });
    if (hasInvalidProducts) {
      setError("Cannot process order with invalid products.");
      return;
    }

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

      const orderData = {
        customerId: customer?.id || customer?._id || null,
        items: orderItems,
        discount: discount.value || 0,
        discountType: discount.type || "percentage",
        note: note || "",
        paymentMethod,
        amountReceived: paymentMethod === "CASH" ? parseFloat(amountReceived) : total,
        paymentReference: gatewayRef || null,
        total,
      };

      const response = await api.post("/api/orders", orderData);

      setSuccess(true);
      const isWalkIn = !customer?.id;
      const patchedItems = response.data.items?.map((item) => ({
        ...item,
        unitPrice: item.unitPrice || item.price / (item.quantity || 1),
      }));
      dispatch(
        patchOrder({
          ...response.data,
          items: patchedItems,
          status: "COMPLETED",
          paymentMethod,
          paymentType: paymentMethod,
          customer: isWalkIn ? null : customer,
          customerId: customer?.id || null,
        })
      );

      setTimeout(() => {
        dispatch(clearCart());
        handleClose();
        onOrderComplete?.();
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Payment failed. Please try again.";
      setError(
        errorMsg.includes("not found in branch inventory") || errorMsg.includes("Product not found")
          ? "⚠️ Some products are not available in your branch inventory."
          : errorMsg
      );
    } finally {
      setLoading(false);
    }
  };

  // Called when cashier clicks "Complete Payment" on the main dialog
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
      setShowEsewa(true);
    } else if (paymentMethod === "KHALTI") {
      setShowKhalti(true);
    } else if (paymentMethod === "CARD") {
      setShowCard(true);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setAmountReceived("");
    setPaymentMethod("CASH");
    setSuccess(false);
    setError("");
    setShowEsewa(false);
    setShowKhalti(false);
    setShowCard(false);
    onClose();
  };

  return (
    <>  
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
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

            <div className="space-y-5">
              {/* Total */}
              <div style={{ background: "#f5f5f5", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Total Amount</p>
                <p style={{ margin: "4px 0 0", fontSize: 32, fontWeight: 800, color: "#1a1d23", letterSpacing: "-1px" }}>
                  रु {total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </p>
                {customer && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6b7280" }}>
                    Customer: <strong>{customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim()}</strong>
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <Label className="mb-2 block">Payment Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id)}
                      style={{
                        padding: "12px 8px",
                        border: `2px solid ${paymentMethod === id ? "#1a1d23" : "#e5e7eb"}`,
                        borderRadius: 10,
                        background: paymentMethod === id ? "#f5f5f5" : "white",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.15s",
                      }}
                    >
                      <Icon size={22} color={paymentMethod === id ? "#1a1d23" : "#6b7280"} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: paymentMethod === id ? "#1a1d23" : "#6b7280" }}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Received (Cash only) */}
              {paymentMethod === "CASH" && (
                <div>
                  <Label htmlFor="amountReceived" className="mb-1 block">Amount Received (रु)</Label>
                  <Input
                    id="amountReceived"
                    type="number"
                    min={total}
                    value={amountReceived}
                    onChange={(e) => { setAmountReceived(e.target.value); setError(""); }}
                    placeholder={`Min. रु ${total.toFixed(2)}`}
                    className="text-lg"
                    autoFocus
                  />
                  {amountReceived && parseFloat(amountReceived) >= total && (
                    <div style={{ marginTop: 8, padding: "10px 14px", background: "#f5f5f5", border: "1px solid #e5e7eb", borderRadius: 8, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#6b7280" }}>Change to return:</span>
                      <span style={{ fontWeight: 700, color: "#1a1d23" }}>रु {change.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Digital payment info pill */}
              {(paymentMethod === "CARD" || paymentMethod === "ESEWA" || paymentMethod === "KHALTI") && (
                <div
                  style={{
                    background:
                      paymentMethod === "ESEWA" ? "#f0fdf4" :
                      paymentMethod === "KHALTI" ? "#faf5ff" : "#f5f5f5",
                    border: `1px solid ${
                      paymentMethod === "ESEWA" ? "#bbf7d0" :
                      paymentMethod === "KHALTI" ? "#e9d5ff" : "#e5e7eb"
                    }`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 12,
                    color: "#6b7280",
                    textAlign: "center",
                  }}
                >
                  {paymentMethod === "ESEWA" && "A payment confirmation popup will appear after clicking \"Complete Payment\"."}
                  {paymentMethod === "KHALTI" && "Enter your Khalti mobile and transaction token in the next step."}
                  {paymentMethod === "CARD" && "You will be asked to enter card details in the next step."}
                </div>
              )}

              {error && (
                <p style={{ fontSize: 13, color: "#e53e3e", textAlign: "center", margin: 0 }}>{error}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handlePayment}
                  disabled={loading}
                  style={{ background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}
                >
                  {loading ? "Processing..." : "Complete Payment"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>

    {/* eSewa popup */}
    <EsewaPaymentPopup
      open={showEsewa}
      onClose={() => setShowEsewa(false)}
      amount={total}
      loading={loading}
      onConfirm={(ref) => { setShowEsewa(false); submitOrder(ref); }}
    />

    {/* Khalti popup */}
    <KhaltiPaymentPopup
      open={showKhalti}
      onClose={() => setShowKhalti(false)}
      amount={total}
      loading={loading}
      onConfirm={(data) => { setShowKhalti(false); submitOrder(data.token); }}
    />

    {/* Card popup */}
    <CardPaymentPopup
      open={showCard}
      onClose={() => setShowCard(false)}
      amount={total}
      loading={loading}
      onConfirm={(data) => { setShowCard(false); submitOrder(data.cardNumber.slice(-4)); }}
    />
    </>
  );
};

export default PaymentDialog;