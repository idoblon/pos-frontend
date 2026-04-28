import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";

const CustomerInformation = ({ selectedOrder }) => {
  if (!selectedOrder) return null;

  const customer = selectedOrder.customer;

  return (
    <Card>
      <CardContent className="p-3">
        <h3 className="font-semibold text-xs mb-2 text-gray-900">
          Customer Information
        </h3>
        <div className="space-y-1.5">
          {customer ? (
            <>
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-xs text-gray-600">Name</span>
                <span className="font-medium text-xs text-gray-900">
                  {customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-gray-600">Phone</span>
                <span className="font-medium text-xs text-gray-900">
                  {customer.phone || customer.phoneNumber || "N/A"}
                </span>
              </div>
            </>
          ) : (
            <div className="py-3 text-center">
              <Badge variant="info" className="text-xs px-2 py-0.5">Walk-in Customer</Badge>
              <p className="text-xs text-gray-500 mt-1.5">No customer information</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInformation;
