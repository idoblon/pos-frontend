import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrdersByBranch } from "@/Redux Toolkit/Features/order/orderThunk";
import { getRefundsByBranch } from "@/Redux Toolkit/Features/refund/refundThunk";

// Mock data for testing when no user is logged in
const mockOrders = [
  {
    id: 1,
    createdAt: "Jul 8, 2025, 12:37 PM",
    customer: {
      fullName: "Pablo Escobar",
      phone: "123243435",
    },
    totalAmount: 2134,
    paymentType: "CASH",
    status: "COMPLETED",
    items: [
      {
        id: 1,
        quantity: 2,
        price: 500,
        product: {
          id: 101,
          image:
            "https://np.harringtonwear.com/cdn/shop/files/1_92992c7e-c7f9-4ce0-82cc-706e277a1396_370x.jpg?v=1775304465",
          name: "Premium T-Shirt",
          sku: "PROD001",
        },
      },
      {
        id: 2,
        quantity: 1,
        price: 1134,
        product: {
          id: 102,
          image:
            "https://np.harringtonwear.com/cdn/shop/files/1_92992c7e-c7f9-4ce0-82cc-706e277a1396_370x.jpg?v=1775304465",
          name: "Designer Jeans",
          sku: "PROD002",
        },
      },
    ],
  },
  {
    id: 2,
    createdAt: "Jul 8, 2025, 1:15 PM",
    customer: null,
    totalAmount: 1500,
    paymentType: "CARD",
    status: "COMPLETED",
    items: [
      {
        id: 3,
        quantity: 3,
        price: 500,
        product: {
          id: 103,
          image:
            "https://np.harringtonwear.com/cdn/shop/files/1_92992c7e-c7f9-4ce0-82cc-706e277a1396_370x.jpg?v=1775304465",
          name: "Cotton Hoodie",
          sku: "PROD003",
        },
      },
    ],
  },
];

const OrderTable = ({ handleSelectOrder }) => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("User:", user);
    console.log("Orders:", orders);
    if (user?.branchId) {
      console.log("Fetching orders for branch:", user.branchId);
      dispatch(getOrdersByBranch({ branchId: user.branchId }));
      console.log("🔄 Fetching refunds for branch:", user.branchId);
      dispatch(getRefundsByBranch(user.branchId));
    } else {
      console.log("No branchId found in user - using mock data");
    }
  }, [dispatch, user?.branchId]);

  const getStatusVariant = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "success";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "destructive";
      case "REFUNDED":
        return "destructive";
      default:
        return "info";
    }
  };

  const refundableOrders = useMemo(() => {
    // Use mock data if no real orders and no user logged in
    const orderList =
      orders && orders.length > 0 ? orders : !user ? mockOrders : [];
    console.log("Order list:", orderList);
    
    // Show both COMPLETED and REFUNDED orders for refund management
    return orderList.filter((o) => {
      const status = o.status?.toUpperCase();
      return status === "COMPLETED" || status === "REFUNDED";
    });
  }, [orders, user]);

  console.log("Refundable orders:", refundableOrders);

  if (loading) {
    return <div className="p-4 text-center">Loading orders...</div>;
  }

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>Order ID</TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refundableOrders.length > 0 ? (
              refundableOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {order.customer?.fullName ||
                      (order.customer?.firstName && order.customer?.lastName
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : "Walk-in")}
                  </TableCell>
                  <TableCell>रु {order.totalAmount?.toFixed(2)}</TableCell>
                  <TableCell>{order.paymentType}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => handleSelectOrder(order)}
                      variant={order.status?.toUpperCase() === "REFUNDED" ? "secondary" : "default"}
                      size="sm"
                      disabled={order.status?.toUpperCase() === "REFUNDED"}
                    >
                      {order.status?.toUpperCase() === "REFUNDED" ? "Already Refunded" : "Select for Refund"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-gray-400 py-8"
                >
                  No completed orders available for return
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrderTable;
