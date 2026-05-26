import React, { useState, useEffect, useCallback } from "react";
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
import { getAuthHeaders } from "@/util/getAuthHeader";
import { logBackendStatus } from "@/util/backendTest";
import CustomerForm from "./CustomerForm";

const CustomerDialog = ({ open, onClose, onSelectCustomer }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Debounced search function
  const searchCustomers = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      console.log("🔍 Searching customers for:", query);
      const headers = getAuthHeaders();
      const response = await api.get(`/api/customers/search?q=${encodeURIComponent(query.trim())}`, { headers });
      console.log("✅ Search results:", response.data);
      console.log("🔍 First customer structure:", response.data[0]);
      setSearchResults(response.data);
    } catch (error) {
      console.error("❌ Search failed:", error);
      console.log("📡 This indicates the backend search API may not be working properly");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCustomers(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCustomers]);

  useEffect(() => {
    if (open) {
      // Don't fetch all customers on open - only load when searching
      setCustomers([]);
      setSearchResults([]);
      setSearchQuery("");
    }
  }, [open]);

  // Display customers: only show search results, no initial customer list
  const displayCustomers = searchQuery.trim().length >= 2 ? searchResults : [];



  const handleWalkIn = () => {
    onSelectCustomer({
      id: null,
      fullName: "Walk-in Customer",
      phone: "N/A",
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
                  placeholder="Search by customer name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                  </div>
                )}
              </div>
              <Button onClick={() => setShowAddForm(true)}>
                <UserPlus size={16} className="mr-2" />
                Add New
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                console.log("👤 Walk-in customer selected - no API call needed");
                handleWalkIn();
              }}
            >
              <User size={16} className="mr-2" />
              Walk-in Customer
            </Button>

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading customers...</div>
              ) : searchQuery.trim().length < 2 ? (
                <div className="p-8 text-center text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Type at least 2 characters to search customers</p>
                </div>
              ) : displayCustomers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No customers found matching "{searchQuery}"
                </div>
              ) : (
                <div className="divide-y">
                  {displayCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => {
                        console.log("🔍 Customer selected from list:", customer);
                        console.log("📡 No additional API call needed - customer data already available");
                        console.log("📋 Customer details:", {
                          id: customer.id,
                          name: customer.fullName,
                          phone: customer.phone,
                          email: customer.email
                        });
                        onSelectCustomer(customer);
                      }}
                    >
                      <div className="font-semibold text-lg">
                        {customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown Customer'}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {customer.phone || customer.phoneNumber || 'No phone'}
                      </div>
                      {customer.email && (
                        <div className="text-xs text-gray-400 mt-1">{customer.email}</div>
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
              console.log("✅ New customer created successfully:", newCustomer);
              console.log("🔍 Selecting newly created customer:", newCustomer);
              setShowAddForm(false);
              // Don't refresh customer list - we only show search results
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
