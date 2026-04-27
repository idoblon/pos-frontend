import { useState } from "react";
import OrderTable from "./OrderTable";
import OrderDetailsSection from "./OrderDetailsSection";
import ReturnItemSection from "./ReturnItemSection";

export default function RefundPage() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setSelectedItems([]);
  };

  const handleItemSelect = (items) => {
    setSelectedItems(items);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Process Refund</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <OrderTable onOrderSelect={handleOrderSelect} />
          {selectedOrder && (
            <OrderDetailsSection 
              selectedOrder={selectedOrder} 
              onItemSelect={handleItemSelect}
            />
          )}
        </div>
        
        <div>
          {selectedOrder && selectedItems.length > 0 && (
            <ReturnItemSection 
              selectedOrder={selectedOrder}
              selectedItems={selectedItems}
            />
          )}
        </div>
      </div>
    </div>
  );
}