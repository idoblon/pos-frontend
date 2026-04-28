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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-8 pt-6 pb-4 border-b border-gray-200">
        <button
          onClick={() => setSelectedOrder(null)}
          className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50 transition-colors mb-4"
        >
          ← Back to Order Search
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Return / Refund</h1>
      </div>

      {!selectedOrder ? (
        <div className="px-8 py-6">
          <OrderTable onOrderSelect={handleOrderSelect} />
        </div>
      ) : (
        <div className="flex h-[calc(100vh-120px)]">
          {/* Left panel */}
          <div className="w-80 border-r border-gray-200 flex-shrink-0 overflow-y-auto">
            <OrderDetailsSection selectedOrder={selectedOrder} />
          </div>

          {/* Right panel */}
          <div className="flex-1 overflow-y-auto">
            <ReturnItemSection
              selectedOrder={selectedOrder}
              selectedItems={selectedItems}
              onItemsChange={setSelectedItems}
            />
          </div>
        </div>
      )}
    </div>
  );
}
