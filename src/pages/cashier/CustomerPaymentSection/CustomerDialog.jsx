import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, User } from "lucide-react";
import api from "@/util/api";
import { demoCustomers } from "@/util/demoData";
import CustomerForm from "./CustomerForm";

const CustomerDialog = ({ open, onClose, onSelectCustomer }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/customers");
      setCustomers(response.data);
    } catch (error) {
      console.warn("Backend not available, using demo data");
      setCustomers(demoCustomers);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phoneNumber?.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWalkIn = () => {
    onSelectCustomer({
      id: null,
      firstName: "Walk-in",
      lastName: "Customer",
      phoneNumber: "N/A",
      email: null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Customer</DialogTitle>
        </DialogHeader>

        {!showAddForm ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setShowAddForm(true)}>
                <UserPlus size={16} className="mr-2" />
                Add New
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleWalkIn}
            >
              <User size={16} className="mr-2" />
              Walk-in Customer
            </Button>

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No customers found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => onSelectCustomer(customer)}
                    >
                      <div className="font-semibold">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-sm text-gray-600">{customer.phoneNumber}</div>
                      {customer.email && (
                        <div className="text-xs text-gray-500">{customer.email}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <CustomerForm
            onSuccess={(newCustomer) => {
              setShowAddForm(false);
              fetchCustomers();
              onSelectCustomer(newCustomer);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDialog;
