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

const OrderTable = ({ handleSelectOrder }) => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.branchId) {
      dispatch(getOrdersByBranch({ branchId: user.branchId }));
      dispatch(getRefundsByBranch(user.branchId));
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
    const orderList = orders && orders.length > 0 ? orders : [];

    // Show both COMPLETED and REFUNDED orders for refund management
    return orderList.filter((o) => {
      const status = o.status?.toUpperCase();
      return status === "COMPLETED" || status === "REFUNDED";
    });
  }, [orders]);


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
