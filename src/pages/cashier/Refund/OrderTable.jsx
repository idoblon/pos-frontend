import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrdersByBranch } from "@/Redux Toolkit/Features/order/orderThunk";

export default function OrderTable({ onOrderSelect }) {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const { orders, loading } = useSelector((state) => state.order);
  const branchId = localStorage.getItem("branchId");

  useEffect(() => {
    if (branchId) {
      dispatch(getOrdersByBranch({ branchId }));
    }
  }, [dispatch, branchId]);

  // Filter only completed orders for refund
  const refundableOrders = orders?.filter(
    (order) => 
      order.status === "COMPLETED" &&
      (order.id?.toString().includes(searchTerm) ||
       order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="text-center py-4">Loading orders...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Order for Refund</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {refundableOrders?.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No refundable orders found</p>
            ) : (
              <div className="space-y-2">
                {refundableOrders?.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => onOrderSelect(order)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">
                          Customer: {order.customerName || "Walk-in"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${order.totalAmount}</p>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}