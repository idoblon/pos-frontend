import React from "react";
import OrderTable from "./OrderTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import OrderDetails from "./OrderDetails/OrderDetails";
import { useState } from "react";

const OrderHistory = () => {
  const [showOrderInvoiceDialog, setShowOrderInvoiceDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderInvoiceDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
            <p className="text-gray-600 mt-1">View and manage all orders</p>
          </div>
          <OrderTable handleViewOrderDetails={handleViewOrderDetails} />
        </div>
      </div>

      <Dialog
        open={showOrderInvoiceDialog}
        onOpenChange={setShowOrderInvoiceDialog}
      >
        <DialogContent className="max-w-4xl w-[80vw] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-3 py-2 border-b bg-gradient-to-r from-blue-50 to-blue-100 flex-shrink-0">
            <DialogTitle className="text-base font-bold text-gray-900">
              Invoice {selectedOrder?.id}
            </DialogTitle>
            <p className="text-xs text-gray-600">{selectedOrder?.createdAt}</p>
          </DialogHeader>
          <div className="flex-1 p-3 overflow-hidden">
            <OrderDetails selectedOrder={selectedOrder} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderHistory;
