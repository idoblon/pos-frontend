import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, MapPin, ShoppingBag, Calendar } from "lucide-react";
import api from "@/util/api";

const ViewCustomerDialog = ({ open, onClose, customer }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && customer) {
      fetchCustomerOrders();
    }
  }, [open, customer]);

  const fetchCustomerOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/orders/customer/${customer.id}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch customer orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {customer.firstName?.[0]}{customer.lastName?.[0]}
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {customer.firstName} {customer.lastName}
                </h3>
                <p className="text-sm text-gray-600">Customer ID: #{customer.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-gray-500" />
                <span>{customer.phoneNumber || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-gray-500" />
                <span>{customer.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm col-span-2">
                <MapPin size={16} className="text-gray-500" />
                <span>{customer.address || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <ShoppingBag className="mx-auto mb-2 text-blue-600" size={24} />
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <span className="text-3xl mb-2 block">💰</span>
              <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <Calendar className="mx-auto mb-2 text-purple-600" size={24} />
              <p className="text-2xl font-bold">
                {orders.length > 0 ? Math.round(totalSpent / orders.length) : 0}$
              </p>
              <p className="text-sm text-gray-600">Avg Order</p>
            </div>
          </div>

          {/* Order History */}
          <div>
            <h4 className="font-semibold mb-3">Order History</h4>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No orders yet</div>
            ) : (
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {orders.map((order) => (
                  <div key={order.id} className="p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${order.total?.toFixed(2)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "COMPLETED" 
                            ? "bg-gray-100 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCustomerDialog;
