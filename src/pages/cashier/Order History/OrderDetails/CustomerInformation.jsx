import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthHeaders } from "@/util/getAuthHeader";
import api from "@/util/api";
import React, { useEffect, useState } from "react";

const CustomerInformation = ({ selectedOrder }) => {
  const [fetchedCustomer, setFetchedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  const customer = selectedOrder?.customer;
  const customerId = selectedOrder?.customerId;
  const isRealCustomer = customer?.id;

  useEffect(() => {
    // If we already have a real customer object, no need to fetch
    if (isRealCustomer || !customerId) {
      setFetchedCustomer(null);
      return;
    }
    // Fetch customer by ID since backend didn't return it in the order
    setLoading(true);
    api.get(`/api/customers/${customerId}`, { headers: getAuthHeaders() })
      .then(res => setFetchedCustomer(res.data))
      .catch(() => setFetchedCustomer(null))
      .finally(() => setLoading(false));
  }, [customerId, isRealCustomer]);

  if (!selectedOrder) return null;

  const displayCustomer = isRealCustomer ? customer : fetchedCustomer;

  return (
    <Card>
      <CardContent className="p-3">
        <h3 className="font-semibold text-xs mb-2 text-gray-900">Customer Information</h3>
        <div className="space-y-1.5">
          {loading ? (
            <div className="py-3 text-center text-xs text-gray-400">Loading customer...</div>
          ) : displayCustomer ? (
            <>
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-xs text-gray-600">Name</span>
                <span className="font-medium text-xs text-gray-900">
                  {displayCustomer.fullName || `${displayCustomer.firstName || ''} ${displayCustomer.lastName || ''}`.trim() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-xs text-gray-600">Phone</span>
                <span className="font-medium text-xs text-gray-900">
                  {displayCustomer.phone || displayCustomer.phoneNumber || 'N/A'}
                </span>
              </div>
              {displayCustomer.email && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-600">Email</span>
                  <span className="font-medium text-xs text-gray-900">{displayCustomer.email}</span>
                </div>
              )}
            </>
          ) : (
            <div className="py-3 text-center">
              <Badge variant="secondary" className="text-xs px-2 py-0.5">Walk-in Customer</Badge>
              <p className="text-xs text-gray-500 mt-1.5">No customer information</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInformation;
