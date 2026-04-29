import React, { useState } from "react";
import ReturnReceiptDialog from "./ReturnReceiptDialog";
import OrderTable from "./OrderTable";
import OrderDetailsSection from "./OrderDetailsSection";
import ReturnItemSection from "./ReturnItemSection";

const RefundPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReturnReciptDialog, setShowReturnReciptDialog] = useState(false);
  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-card border-b">
        <h1 className="text-2xl font-bold">Return/Refund</h1>
      </div>
      <div className="flex-1 flex overflow-hidden">
        {!selectedOrder ? (
          <OrderTable handleSelectOrder={handleSelectOrder} />
        ) : (
          <div className="flex-1 flex">
            <OrderDetailsSection
              selectedOrder={selectedOrder}
              handleSelectOrder={handleSelectOrder}
            />
            <ReturnItemSection
              selectedOrder={selectedOrder}
              setShowReturnReciptDialog={setShowReturnReciptDialog}
            />
          </div>
        )}
      </div>
      <ReturnReceiptDialog
        showReturnReciptDialog={showReturnReciptDialog}
        setShowReturnReciptDialog={setShowReturnReciptDialog}
        selectedOrder={selectedOrder}
      />
    </div>
  );
};

export default RefundPage;
