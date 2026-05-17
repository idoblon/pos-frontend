import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useCallback, useMemo } from "react";

const ReturnReceiptDialog = ({
  showReturnReciptDialog,
  setShowReturnReciptDialog,
  selectedOrder,
}) => {
  // Memoize the print handler to prevent re-creation on every render
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Memoize the dialog close handler
  const handleDialogClose = useCallback((open) => {
    setShowReturnReciptDialog(open);
  }, [setShowReturnReciptDialog]);

  // Memoize computed values
  const receiptData = useMemo(() => {
    if (!selectedOrder) return null;
    
    return {
      returnNumber: `RTN-${Date.now().toString().substring(8)}`,
      orderId: selectedOrder.id,
      date: new Date().toLocaleDateString(),
      customerName: selectedOrder.customer?.fullName || "Walk-in",
      totalAmount: selectedOrder.totalAmount?.toFixed(2) || "0.00"
    };
  }, [selectedOrder]);

  if (!selectedOrder) {
    return null;
  }

  return (
    <Dialog
      open={showReturnReciptDialog}
      onOpenChange={handleDialogClose}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Return Receipt
          </DialogTitle>
        </DialogHeader>
        <div className="bg-background">
          <div className="mb-4">
            <h3 className="font-bold text-lg">Divya D-mart</h3>
            <p>1123 RingRoad</p>
            <p>Tel : 3546-557367573</p>
          </div>
          <div className="text-center mb-4">
            <h4 className="font-bold">Return Receipt</h4>
          </div>
          <div className="mb-4">
            <p>Return #: {receiptData.returnNumber}</p>
            <p>Original Order : {receiptData.orderId}</p>
            <p>Date : {receiptData.date}</p>
            <p>Customer : {receiptData.customerName}</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-12 p-1.5 text-xs">Image</TableHead>
                <TableHead className="p-1.5 text-xs">Product</TableHead>
                <TableHead className="w-16 text-center p-1.5 text-xs">
                  Qty
                </TableHead>
                <TableHead className="w-24 text-right p-1.5 text-xs">
                  Price
                </TableHead>
                <TableHead className="w-24 text-right p-1.5 text-xs">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedOrder.items?.map((item) => {
                const itemTotal = ((item.price || 0) * (item.quantity || 0)).toFixed(2);
                
                return (
                  <TableRow key={item.id}>
                    <TableCell className="p-1.5">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            className="w-8 h-8 object-cover"
                            alt={item.product?.name || "Product"}
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-1.5">
                      <div className="font-medium text-xs text-gray-900">
                        {item.product?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.product?.sku || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium text-xs p-1.5">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right text-xs p-1.5">
                      रु{item.price?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-xs p-1.5">
                      रु{itemTotal}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between font-bold text-lg">
              <span>Total Refund Amount:</span>
              <span>रु {receiptData.totalAmount}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handlePrint} className="w-full">
            <Printer className="h-4 w-4 mr-2" />
            Print & Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(ReturnReceiptDialog);
