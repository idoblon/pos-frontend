import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrdersByBranch } from "@/Redux Toolkit/Features/order/orderThunk";

export default function OrderTable({ onOrderSelect }) {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const { orders, loading } = useSelector((state) => state.order);

  const [branchId] = useState(() => localStorage.getItem("branchId"));

  useEffect(() => {
    if (branchId) dispatch(getOrdersByBranch({ branchId }));
  }, [dispatch, branchId]);

  const refundableOrders = useMemo(
    () =>
      orders?.filter((order) => {
        const matchesStatus = order.status === "completed";
        const matchesSearch =
          order.id?.toString().includes(searchTerm) ||
          order.customer?.firstName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customer?.lastName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
      }),
    [orders, searchTerm],
  );

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Select Order for Refund
      </h2>
      <div className="relative mb-4">
        <svg
          className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search by order ID or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-10 text-sm">
          Loading orders...
        </p>
      ) : refundableOrders?.length === 0 ? (
        <p className="text-center text-gray-400 py-10 text-sm">
          No completed orders found
        </p>
      ) : (
        <div className="space-y-2">
          {refundableOrders?.map((order) => (
            <div
              key={order.id}
              onClick={() => onOrderSelect(order)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">
                    Order #{order.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.customer
                      ? `${order.customer.firstName} ${order.customer.lastName}`
                      : "Walk-in"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleString()} ·{" "}
                    {order.paymentType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ${order.totalAmount?.toFixed(2)}
                  </p>
                  <button className="mt-1.5 text-xs px-3 py-1 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors">
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
