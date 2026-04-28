import { useRef } from "react";
import { Printer, X } from "lucide-react";

export default function ReturnReceiptDialog({ refundData, onClose }) {
  const printRef = useRef(null);

  if (!refundData) return null;

  const customerName = refundData.order.customer
    ? `${refundData.order.customer.firstName} ${refundData.order.customer.lastName}`
    : "Walk-in";

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Dialog header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Refund Receipt
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt body */}
        <div ref={printRef} className="px-5 py-5 space-y-4 text-sm">
          <div className="text-center pb-4 border-b border-dashed border-gray-200">
            <p className="font-bold text-gray-900 text-base tracking-wide">
              REFUND RECEIPT
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Refund ID: #{refundData.id}
            </p>
            <p className="text-gray-400 text-xs">
              {new Date().toLocaleString()}
            </p>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Original Order</span>
              <span className="font-medium text-gray-800">
                #{refundData.order.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span className="font-medium text-gray-800">{customerName}</span>
            </div>
            {refundData.processedBy && (
              <div className="flex justify-between">
                <span className="text-gray-500">Cashier</span>
                <span className="font-medium text-gray-800">
                  {refundData.processedBy}
                </span>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Refunded Items
            </p>
            <div className="space-y-1.5">
              {refundData.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-gray-600">
                    {item.product?.name} × {item.refundQuantity}
                  </span>
                  <span className="font-medium text-gray-800">
                    ₹{item.refundAmount?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200 pt-3">
            <div className="flex justify-between font-bold text-gray-900">
              <span>Total Refund</span>
              <span className="text-green-600">
                ₹{refundData.refundAmount?.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="text-xs">
            <span className="text-gray-500">Reason: </span>
            <span className="text-gray-700">{refundData.reason}</span>
          </div>

          <div className="text-center text-xs text-gray-400 border-t border-dashed border-gray-200 pt-3">
            <p>Thank you for your business</p>
            <p>Please keep this receipt for your records</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
