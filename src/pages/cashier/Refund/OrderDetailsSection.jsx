// Left panel — matches the screenshot layout:
// Order ID, date, UPI badge, customer info, order summary, then order items table

export default function OrderDetailsSection({ selectedOrder }) {
  if (!selectedOrder) return null;

  const customerName = selectedOrder.customer
    ? `${selectedOrder.customer.firstName} ${selectedOrder.customer.lastName}`
    : "Walk-in";

  const totalItems =
    selectedOrder.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <div className="p-6 space-y-6">
      {/* Order header */}
      <div>
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="font-bold text-gray-900 text-base">
              Order {selectedOrder.id}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(selectedOrder.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <span className="text-xs border border-gray-300 text-gray-500 rounded px-2 py-0.5">
            {selectedOrder.paymentType ?? "UPI"}
          </span>
        </div>
      </div>

      {/* Customer */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          Customer
        </p>
        <p className="text-sm font-semibold text-gray-800">{customerName}</p>
        {selectedOrder.customer?.phone && (
          <p className="text-sm text-gray-500">
            {selectedOrder.customer.phone}
          </p>
        )}
      </div>

      {/* Order Summary */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
          Order Summary
        </p>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Total Items:</span>
          <span>{totalItems}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold text-gray-900">
          <span>Order Total:</span>
          <span>₹{selectedOrder.totalAmount?.toFixed(2)}</span>
        </div>
      </div>

      {/* Order Items */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
          Order Items
        </p>
        <div className="w-full">
          <div className="grid grid-cols-3 text-xs text-gray-400 uppercase tracking-wide pb-2 border-b border-gray-100">
            <span>Item</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Total</span>
          </div>
          {selectedOrder.items?.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-3 text-sm py-2.5 border-b border-gray-50 last:border-0"
            >
              <span className="text-gray-700 pr-2 leading-snug">
                {item.product?.name}
              </span>
              <span className="text-center text-gray-500">{item.quantity}</span>
              <span className="text-right text-gray-800 font-medium">
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
