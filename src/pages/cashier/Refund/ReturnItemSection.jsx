import { useState } from "react";
import { useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createRefund } from "@/Redux Toolkit/Features/refund/refundThunk";
import ReturnReceiptDialog from "./ReturnReceiptDialog";

export default function ReturnItemSection({ selectedOrder, selectedItems }) {
  const dispatch = useDispatch();
  const [reason, setReason] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [refundData, setRefundData] = useState(null);
  const [processing, setProcessing] = useState(false);

  const refundTotal = selectedItems.reduce(
    (sum, item) => sum + (item.price * item.refundQuantity), 0
  );

  const handleProcessRefund = async () => {
    if (!reason.trim()) {
      alert("Please provide a reason for the refund");
      return;
    }

    setProcessing(true);
    
    const refundRequest = {
      orderId: selectedOrder.id,
      reason: reason,
      refundAmount: refundTotal,
      items: selectedItems.map(item => ({
        productId: item.productId,
        quantity: item.refundQuantity,
        price: item.price
      }))
    };

    try {
      const result = await dispatch(createRefund(refundRequest)).unwrap();
      setRefundData({
        ...result,
        order: selectedOrder,
        items: selectedItems,
        reason: reason
      });
      setShowReceipt(true);
    } catch (error) {
      alert("Failed to process refund: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Process Refund</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Items to Refund:</h4>
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.productName} × {item.refundQuantity}</span>
                    <span>${(item.price * item.refundQuantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Refund Total:</span>
                <span>${refundTotal.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Reason for Refund *
              </label>
              <Textarea
                placeholder="Enter reason for refund..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleProcessRefund}
              disabled={processing || !reason.trim()}
              className="w-full"
            >
              {processing ? "Processing..." : "Process Refund"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showReceipt && (
        <ReturnReceiptDialog
          refundData={refundData}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
}