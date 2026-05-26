import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Banknote, Smartphone, CheckCircle } from "lucide-react";
import api from "@/util/api";
import {
  selectCartItems,
  selectTotal,
  selectSelectedCustomer,
  selectDiscount,
  selectCartNote,
  clearCart
} from "@/Redux Toolkit/Features/Cart/cartSlice";

const PAYMENT_METHODS = [
  { id: "CASH", label: "Cash", icon: Banknote },
  { id: "CARD", label: "Card", icon: CreditCard },
  { id: "ESEWA",  label: "eSewa",  icon: Smartphone },
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const change = amountReceived ? Math.max(0, parseFloat(amountReceived) - total) : 0;

  const handlePayment = async () => {
    setError("");
    if (cartItems.length === 0) {
      setError("Please add items to the cart first.");
      return;
    }
    
    // Validate product IDs
    const hasInvalidProducts = cartItems.some(item => {
      const productId = item.id || item._id;
      return typeof productId === 'string' && productId.startsWith('p');
    });
    
    if (hasInvalidProducts) {
      setError("Cannot process order with invalid products. Please use real products from your inventory.");
      return;
    }
    
    if (paymentMethod === "CASH" && (!amountReceived || parseFloat(amountReceived) < total)) {
      setError("Amount received must be at least रु " + total.toFixed(2));
      return;
    }
    try {
      setLoading(true);
      const orderData = {
        customerId: customer?.id || customer?._id || null,
        items: cartItems.map((item) => ({
          productId: item.id || item._id,
          quantity: item.quantity || 1,
          price: item.price || item.sellingPrice,
        })),
        discount: discount.value || 0,
        discountType: discount.type || "percentage",
        note: note || "",
        paymentMethod,
        amountReceived: parseFloat(amountReceived) || total,
        total,
      };
      
      console.log("📡 API CALL: Creating order with customer data");
      console.log("📋 Order payload:", orderData);
      console.log("👤 Customer in order:", customer);
      console.log("🛒 Cart items:", cartItems);
      
      const response = await api.post("/api/orders", orderData);
      
      console.log("✅ Order created successfully:", response.data);
      console.log("📡 This was the main API call that uses the selected customer data");
      
      setSuccess(true);
      dispatch(clearCart());
      setTimeout(() => {
        handleClose();
        onOrderComplete?.();
      }, 2000);
    } catch (err) {
      console.error("❌ Order creation failed:", err.response?.data);
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setAmountReceived("");
    setPaymentMethod("CASH");
    setSuccess(false);
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {success ? (
          <div className="text-center py-10">
            <CheckCircle className="h-16 w-16 mx-auto mb-4" style={{ color: "#059669" }} />
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
              <div style={{ background: "#f0fdf4", border: "1px solid #d1fae5", borderRadius: 10, padding: "16px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Total Amount</p>
                <p style={{ margin: "4px 0 0", fontSize: 32, fontWeight: 800, color: "#059669", letterSpacing: "-1px" }}>
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
                        border: `2px solid ${paymentMethod === id ? "#059669" : "#d1fae5"}`,
                        borderRadius: 10,
                        background: paymentMethod === id ? "#f0fdf4" : "white",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.15s",
                      }}
                    >
                      <Icon size={22} color={paymentMethod === id ? "#059669" : "#6b7280"} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: paymentMethod === id ? "#059669" : "#6b7280" }}>
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
                    <div style={{ marginTop: 8, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #d1fae5", borderRadius: 8, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#6b7280" }}>Change to return:</span>
                      <span style={{ fontWeight: 700, color: "#059669" }}>रु {change.toFixed(2)}</span>
                    </div>
                  )}
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
                  style={{ background: "linear-gradient(135deg,#059669,#0d9488)", color: "white", border: "none" }}
                >
                  {loading ? "Processing..." : "Complete Payment"}
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