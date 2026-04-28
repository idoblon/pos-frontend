import { useState } from "react";
import { useDispatch } from "react-redux";
import { createRefund } from "@/Redux Toolkit/Features/refund/refundThunk";
import ReturnReceiptDialog from "./ReturnReceiptDialog";

const RETURN_REASONS = [
  "Damaged product",
  "Wrong product",
  "Customer changed mind",
  "Product quality issue",
  "Pricing error",
  "Other",
];

// Individual row in the Return Items table
function ReturnItemRow({ item, selectedItem, onToggle, onQtyChange }) {
  const isReturning = !!selectedItem;

  return (
    <tr className="border-b border-gray-100 last:border-0">
      {/* Item name */}
      <td className="py-3 pr-4 text-sm text-gray-700 max-w-[180px]">
        <span className="truncate block">{item.product?.name}</span>
      </td>

      {/* Ordered qty */}
      <td className="py-3 px-4 text-sm text-center text-gray-600">
        {item.quantity}
      </td>

      {/* Return qty input — only visible when returning */}
      <td className="py-3 px-4 text-center">
        {isReturning ? (
          <input
            type="number"
            min={1}
            max={item.quantity}
            value={selectedItem.refundQuantity}
            onChange={(e) =>
              onQtyChange(item.id, parseInt(e.target.value) || 1)
            }
            className="w-14 text-center border border-gray-300 rounded px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        ) : (
          <span className="text-sm text-gray-400">0</span>
        )}
      </td>

      {/* Refund amount */}
      <td className="py-3 px-4 text-sm text-center text-gray-600">
        {isReturning ? `₹${selectedItem.refundAmount.toFixed(2)}` : "—"}
      </td>

      {/* No / Yes toggle button */}
      <td className="py-3 pl-4 text-center">
        <button
          onClick={() => onToggle(item)}
          className={`text-xs font-medium px-4 py-1.5 rounded border transition-colors ${
            isReturning
              ? "border-green-500 text-green-600 bg-green-50 hover:bg-green-100"
              : "border-gray-300 text-gray-500 bg-white hover:bg-gray-50"
          }`}
        >
          {isReturning ? "Yes" : "No"}
        </button>
      </td>
    </tr>
  );
}

export default function ReturnItemSection({
  selectedOrder,
  selectedItems,
  onItemsChange,
}) {
  const dispatch = useDispatch();
  const [reason, setReason] = useState("");
  const [reasonOpen, setReasonOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [refundData, setRefundData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const [branchId] = useState(() => localStorage.getItem("branchId"));

  // Derived total — not stored in state
  const refundTotal = selectedItems.reduce(
    (sum, item) => sum + item.refundAmount,
    0,
  );

  const handleToggle = (item) => {
    const existing = selectedItems.find((s) => s.id === item.id);
    let next;
    if (existing) {
      next = selectedItems.filter((s) => s.id !== item.id);
    } else {
      next = [
        ...selectedItems,
        { ...item, refundQuantity: 1, refundAmount: item.price },
      ];
    }
    onItemsChange(next);
  };

  const handleQtyChange = (itemId, quantity) => {
    const item = selectedOrder.items.find((i) => i.id === itemId);
    const valid = Math.min(Math.max(1, quantity), item.quantity);
    const next = selectedItems.map((s) =>
      s.id === itemId
        ? { ...s, refundQuantity: valid, refundAmount: s.price * valid }
        : s,
    );
    onItemsChange(next);
  };

  const handleSubmit = async () => {
    setError("");
    if (selectedItems.length === 0) {
      setError("Please select at least one item to return.");
      return;
    }
    if (!reason) {
      setError("Please select a return reason.");
      return;
    }

    setProcessing(true);
    try {
      const result = await dispatch(
        createRefund({
          orderId: selectedOrder.id,
          reason,
          amount: refundTotal,
          branchId: parseInt(branchId),
          paymentType: selectedOrder.paymentType,
        }),
      ).unwrap();

      setRefundData({
        ...result,
        order: selectedOrder,
        items: selectedItems,
        reason,
      });
      setShowReceipt(true);
      onItemsChange([]);
      setReason("");
    } catch (err) {
      setError("Failed to process refund: " + (err || "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Return Items table */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Return Items
          </h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Item
                  </th>
                  <th className="py-2.5 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Ordered
                  </th>
                  <th className="py-2.5 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Return Qty
                  </th>
                  <th className="py-2.5 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Refund Amount
                  </th>
                  <th className="py-2.5 pl-4 pr-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Return?
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {selectedOrder.items?.map((item) => (
                  <ReturnItemRow
                    key={item.id}
                    item={item}
                    selectedItem={selectedItems.find((s) => s.id === item.id)}
                    onToggle={handleToggle}
                    onQtyChange={handleQtyChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Return Reason dropdown — matches screenshot */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Return Reason
          </h2>
          <div className="relative">
            <button
              type="button"
              onClick={() => setReasonOpen((o) => !o)}
              className="w-full flex items-center justify-between border border-gray-300 rounded-md px-4 py-2.5 text-sm bg-white text-left focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <span className={reason ? "text-gray-900" : "text-gray-400"}>
                {reason || "Select a reason..."}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${reasonOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {reasonOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                {RETURN_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setReason(r);
                      setReasonOpen(false);
                      if (error) setError("");
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      reason === r
                        ? "bg-gray-50 font-medium text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Refund total + submit */}
        {selectedItems.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-gray-700">
                Refund Total
              </span>
              <span className="text-lg font-bold text-green-600">
                ₹{refundTotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={processing}
              className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {processing
                ? "Processing..."
                : `Process Refund · ₹${refundTotal.toFixed(2)}`}
            </button>
          </div>
        )}
      </div>

      {showReceipt && refundData && (
        <ReturnReceiptDialog
          refundData={refundData}
          onClose={() => {
            setShowReceipt(false);
            setRefundData(null);
          }}
        />
      )}
    </>
  );
}
