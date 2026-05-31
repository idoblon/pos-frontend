import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";

const getStatusVariant = (status) => {
  switch(status?.toUpperCase()) {
    case 'COMPLETED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'info';
  }
};

const OrderInformation = ({ selectedOrder }) => {
  if (!selectedOrder) return null;

  const status = selectedOrder.status === "PENDING" && selectedOrder.createdAt
    ? "COMPLETED"
    : (selectedOrder.status || "COMPLETED");

  const subtotal = (selectedOrder.totalAmount || 0) - (selectedOrder.taxAmount || 0);
  const discountAmount = selectedOrder.discount || 0;
  const discountType = selectedOrder.discountType || "percentage";
  
  // Calculate discount display value
  let calculatedDiscount = 0;
  if (discountAmount > 0) {
    if (discountType === "percentage") {
      calculatedDiscount = subtotal * (discountAmount / 100);
    } else {
      calculatedDiscount = discountAmount;
    }
  }

  return (
    <Card>
      <CardContent className="p-3">
        <h3 className="font-semibold text-xs mb-2 text-gray-900">Order Information</h3>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center py-1 border-b">
            <span className="text-xs text-gray-600">Date</span>
            <span className="font-medium text-xs text-gray-900">
              {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b">
            <span className="text-xs text-gray-600">Status</span>
            <Badge variant={getStatusVariant(status)} className="text-xs uppercase px-2 py-0.5">
              {status}
            </Badge>
          </div>
          <div className="flex justify-between items-center py-1 border-b">
            <span className="text-xs text-gray-600">Payment Method</span>
            <span className="font-medium text-xs text-gray-900">{selectedOrder.paymentMethod || selectedOrder.paymentType || "CASH"}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-gray-600">Subtotal</span>
            <span className="font-medium text-xs text-gray-900">रु {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-gray-600">Tax (13%)</span>
            <span className="font-medium text-xs text-gray-900">रु {selectedOrder.taxAmount?.toFixed(2) || '0.00'}</span>
          </div>
          {calculatedDiscount > 0 && (
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-gray-600">
                Discount {discountType === "percentage" ? `(${discountAmount}%)` : ""}
              </span>
              <span className="font-medium text-xs text-red-600">-रु {calculatedDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-1 bg-gray-100 px-2 rounded mt-1.5">
            <span className="text-xs font-bold text-gray-900">Total Amount</span>
            <span className="font-extrabold text-lg text-gray-900">रु {selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderInformation;
