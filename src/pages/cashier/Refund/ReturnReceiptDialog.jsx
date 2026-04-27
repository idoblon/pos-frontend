import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function ReturnReceiptDialog({ refundData, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  if (!refundData) return null;

  return (
    <Dialog open={!!refundData} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Refund Receipt</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-sm">
          <div className="text-center border-b pb-4">
            <h3 className="font-bold">REFUND RECEIPT</h3>
            <p>Refund ID: #{refundData.id}</p>
            <p>{new Date().toLocaleString()}</p>
          </div>

          <div>
            <p><strong>Original Order:</strong> #{refundData.order.id}</p>
            <p><strong>Customer:</strong> {refundData.order.customerName || "Walk-in"}</p>
            <p><strong>Cashier:</strong> {refundData.processedBy}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Refunded Items:</h4>
            {refundData.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.productName} × {item.refundQuantity}</span>
                <span>${(item.price * item.refundQuantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-2">
            <div className="flex justify-between font-bold">
              <span>Total Refund:</span>
              <span>${refundData.refundAmount.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <p><strong>Reason:</strong> {refundData.reason}</p>
          </div>

          <div className="text-center text-xs text-gray-500 border-t pt-4">
            <p>Thank you for your business</p>
            <p>Please keep this receipt for your records</p>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handlePrint} variant="outline" className="flex-1">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}