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
            <Badge variant={getStatusVariant(selectedOrder.status)} className="text-xs uppercase px-2 py-0.5">
              {selectedOrder.status || 'Unknown'}
            </Badge>
          </div>
          <div className="flex justify-between items-center py-1 border-b">
            <span className="text-xs text-gray-600">Payment Method</span>
            <span className="font-medium text-xs text-gray-900">{selectedOrder.paymentType || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center py-1 bg-green-50 px-2 rounded mt-1.5">
            <span className="text-xs font-semibold text-gray-900">Total Amount</span>
            <span className="font-bold text-base text-green-600">रु {selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderInformation;
