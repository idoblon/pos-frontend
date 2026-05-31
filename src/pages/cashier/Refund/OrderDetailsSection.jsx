import { ChevronLeftIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const OrderDetailsSection = ({ selectedOrder, handleSelectOrder }) => {
  return (
    <div className="w-1/2 border-r p-4">
      <div className="mb-4">
        <Button onClick={() => handleSelectOrder(null)}>
          <ChevronLeftIcon />
          back to order table
        </Button>
      </div>
      <Card>
        <CardContent>
          <div className="flex justify-between items-start mb-10">
            <h2 className="font-semibold text-lg">Order {selectedOrder.id}</h2>
            <p>{selectedOrder.createdAt}</p>
          </div>
          <Badge variant={"outline"}>{selectedOrder.paymentType}</Badge>
          <div className="mb-4">
            <h3 className="font-medium text-sm text-muted-foreground mb-2">
              {selectedOrder.customer?.fullName}
            </h3>
            <h3 className="text-sm">{selectedOrder.customer?.phone}</h3>
          </div>
          <div>
            <h2 className="font-medium text-sm text-muted-foreground">
              Order summary
            </h2>
            <div className="text-sm">
              <div className="flex justify-between">
                <span>Total Items : {selectedOrder.items.length}</span>
              </div>
              <div>
                <span>Order Total : {selectedOrder.totalAmount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex-1 overflow-auto mt-10">
        <h2 className="text-xl font-semibold mb-4">Order Items</h2>
        <div className="border rounded overflow-hidden flex-1">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-12 p-1.5 text-xs">Image</TableHead>
                <TableHead className="p-1.5 text-xs">Product</TableHead>
                <TableHead className="w-16 text-center p-1.5 text-xs">
                  Qty
                </TableHead>
                <TableHead className="w-24 text-right p-1.5 text-xs">
                  Price
                </TableHead>
                <TableHead className="w-24 text-right p-1.5 text-xs">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
             <TableBody>
               {selectedOrder.items.map((item) => {
                 // Calculate unit price for display (prefer stored unitPrice, fallback to price/quantity)
                 const unitPrice = item.unitPrice || (item.price ? item.price / item.quantity : 0);
                 
                 return (
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
                       रु{unitPrice.toFixed(2)}
                     </TableCell>
                     <TableCell className="text-right font-semibold text-xs p-1.5">
                       रु{(item.price || 0).toFixed(2)}
                     </TableCell>
                   </TableRow>
                 );
               })}
             </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsSection;
