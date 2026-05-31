import React from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye as EyeIcon, Printer } from "lucide-react";

const OrderTable = ({ handleViewOrderDetails }) => {
  const { orders } = useSelector((state) => state.order);
  
  const handlePrintOrder = (order) => {
    const printContent = `
ORDER RECEIPT
================================
Order ID: ${order.id}
Date: ${order.createdAt}
Customer: ${order.customer?.fullName || "Walk-in"}
Phone: ${order.customer?.phone || "N/A"}
Payment: ${order.paymentType}
Status: ${order.status}

ITEMS:
${order.items
  ?.map(
    (item) =>
      `${item.product?.name} x${item.quantity} - रु${(item.price * item.quantity).toFixed(2)}`,
  )
  .join("\n")}

================================
TOTAL: रु${order.totalAmount.toFixed(2)}

Thank you for your business!
    `;

    const printWindow = window.open("", "", "width=600,height=600");
    printWindow.document.write("<pre>" + printContent + "</pre>");
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <h2 className="text-xl font-semiblod mb-4">Recent Order</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="">Order Id</TableHead>
            <TableHead className="">Date/Time</TableHead>
            <TableHead className="">Customer</TableHead>
            <TableHead className="">Amount</TableHead>
            <TableHead className="">Payment Type</TableHead>
            <TableHead className="">Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders?.length > 0 ? orders.map((order) => {
            // Format date
            const orderDate = order.createdAt 
              ? new Date(order.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "N/A";
            
            const customerName = order.customer?.fullName
              || (order.customerId ? `Customer #${order.customerId}` : "Walk-in");
            
            // Get payment type - backend returns null, so default to CASH
            const paymentType = order.paymentMethod || order.paymentType || "CASH";
            
            // Get status - handle refund statuses properly
            let status;
            if (order.status === "REFUNDED") {
              status = "REFUNDED";
            } else if (order.status === "PENDING" && order.createdAt) {
              status = "COMPLETED";
            } else {
              status = order.status || "COMPLETED";
            }
            
            return (
              <TableRow key={order.id}>
                <TableCell>#{order.id}</TableCell>
                <TableCell>{orderDate}</TableCell>
                <TableCell>{customerName}</TableCell>
                <TableCell>रु {(order.totalAmount || order.total || 0).toLocaleString("en-IN")}</TableCell>
                <TableCell>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "600",
                    background: paymentType === "CASH" ? "#f0fdf4" : paymentType === "CARD" ? "#eff6ff" : "#fef3c7",
                    color: paymentType === "CASH" ? "#15803d" : paymentType === "CARD" ? "#1e40af" : "#a16207"
                  }}>
                    {paymentType}
                  </span>
                </TableCell>
                <TableCell>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "600",
                    background: status === "COMPLETED" ? "#f0fdf4" : 
                               status === "REFUNDED" ? "#fef2f2" : "#fef2f2",
                    color: status === "COMPLETED" ? "#15803d" : 
                          status === "REFUNDED" ? "#dc2626" : "#dc2626"
                  }}>
                    {status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => handleViewOrderDetails(order)}
                      variant={"ghost"}
                      size="icon"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>

                    <Button
                      variant={"ghost"}
                      size="icon"
                      onClick={() => handlePrintOrder(order)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          }) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No orders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderTable;
