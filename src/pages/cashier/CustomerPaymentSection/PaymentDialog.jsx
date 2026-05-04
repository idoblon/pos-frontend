import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Banknote, Smartphone, CheckCircle } from "lucide-react";
import api from "@/util/api";

const PAYMENT_METHODS = [
  { id: "CASH", label: "Cash", icon: Banknote },
  { id: "CARD", label: "Card", icon: CreditCard },
  { id: "UPI", label: "UPI", icon: Smartphone },
];

const PaymentDialog = ({ open, onClose, total, cart, customer, discount, discountType, note }) => {
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountReceived, setAmountReceived] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const change = amountReceived ? Math.max(0, parseFloat(amountReceived) - total) : 0;

  const handlePayment = async () => {
    if (paymentMethod === "CASH" && parseFloat(amountReceived) < total) {
      alert("Amount received is less than total");
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        customerId: customer?.id || null,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.qty,
          price: item.price,
        })),
        discount: parseFloat(discount) || 0,
        discountType,
        note,
        paymentMethod,
        amountReceived: parseFloat(amountReceived) || total,
        total,
      };

      const response = await api.post("/orders", orderData);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to clear cart
      }, 2000);
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmountReceived("");
      setPaymentMethod("CASH");
      setSuccess(false);
      onClose();
    }
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-600">Order has been created</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Total Amount */}
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-green-600">
              ${total.toFixed(2)}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="mb-3 block">Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition ${
                      paymentMethod === method.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <Icon size={24} />
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Received (for Cash) */}
          {paymentMethod === "CASH" && (
            <div>
              <Label htmlFor="amountReceived">Amount Received</Label>
              <Input
                id="amountReceived"
                type="number"
                step="0.01"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder="Enter amount"
                className="text-lg"
              />
              {amountReceived && (
                <div className="mt-2 p-3 bg-blue-50 rounded">
                  <div className="flex justify-between text-sm">
                    <span>Change:</span>
                    <span className="font-bold">${change.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer Info */}
          {customer && (
            <div className="text-sm text-gray-600">
              <p>Customer: {customer.name}</p>
              {customer.phone !== "N/A" && <p>Phone: {customer.phone}</p>}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? "Processing..." : "Complete Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
