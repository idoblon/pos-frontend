import React from "react";
import OrderTable from "./OrderTable";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import OrderDetails from "./OrderDetails/OrderDetails";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";

const OrderHistory = () => {
  const [showOrderInvoiceDialog, setShowOrderInvoiceDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderInvoiceDialog(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4 overflow-auto">
        <OrderTable handleViewOrderDetails={handleViewOrderDetails} />
      </div>
      <Dialog
        open={showOrderInvoiceDialog}
        onOpenChange={setShowOrderInvoiceDialog}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Order - Invoice</DialogTitle>
          </DialogHeader>
          <OrderDetails selectedOrder={selectedOrder}>
            <DialogFooter>
              <Button>
                <Download />
                Download PDF
              </Button>
            </DialogFooter>
          </OrderDetails>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderHistory;
