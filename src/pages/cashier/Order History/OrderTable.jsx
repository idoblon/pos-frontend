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
import React from "react";

const orders = [
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
];
const OrderTable = ({ handleViewOrderDetails }) => {
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
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.createdAt}</TableCell>
              <TableCell>{order.customer?.fullName}</TableCell>
              <TableCell>रु {order.totalAmount}</TableCell>
              <TableCell>{order.paymentType}</TableCell>
              <TableCell>{order.status}</TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderTable;
