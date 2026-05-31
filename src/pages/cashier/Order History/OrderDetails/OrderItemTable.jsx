import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

const OrderItemTable = ({ selectedOrder }) => {
  if (!selectedOrder || !selectedOrder.items) {
    return null;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-3 flex-1 flex flex-col">
        <h2 className="text-xs font-semibold mb-2">Order Items</h2>
        <div className="border rounded overflow-hidden flex-1">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-12 p-1.5 text-xs">Image</TableHead>
                <TableHead className="p-1.5 text-xs">Product</TableHead>
                <TableHead className="w-16 text-center p-1.5 text-xs">Qty</TableHead>
                <TableHead className="w-24 text-right p-1.5 text-xs">Price</TableHead>
                <TableHead className="w-24 text-right p-1.5 text-xs">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedOrder.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="p-1.5">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      {item.product?.image ? (
                        <img
                          src={item.product.image}
                          className="w-8 h-8 object-cover"
                          alt={item.product?.name || "Product"}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="p-1.5">
                    <div className="font-medium text-xs text-gray-900">
                      {item.product?.name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.product?.sku || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium text-xs p-1.5">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right text-xs p-1.5">
                    रु{((item.unitPrice || (item.price || 0) / (item.quantity || 1))).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-xs p-1.5">
                    रु{(item.price || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderItemTable;
