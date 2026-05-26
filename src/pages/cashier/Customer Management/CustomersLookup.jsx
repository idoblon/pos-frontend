import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/util/api";
import CustomerTable from "./CustomerTable";
import AddCustomerDialog from "./AddCustomerDialog";
import EditCustomerDialog from "./EditCustomerDialog";
import ViewCustomerDialog from "./ViewCustomerDialog";
import DeleteCustomerDialog from "./DeleteCustomerDialog";

const CustomersLookup = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
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

  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setShowViewDialog(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowEditDialog(true);
  };

  const handleDelete = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteDialog(true);
  };

  const handleSuccess = () => {
    fetchCustomers();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 bg-card border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Customer Lookup</h1>
            <p className="text-gray-600 text-sm mt-1">
              Search and manage customer information
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Customer Table */}
              <CustomerTable
                customers={filteredCustomers}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddCustomerDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={handleSuccess}
      />

      <EditCustomerDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        customer={selectedCustomer}
        onSuccess={handleSuccess}
      />

      <ViewCustomerDialog
        open={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        customer={selectedCustomer}
      />

      <DeleteCustomerDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        customer={selectedCustomer}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default CustomersLookup;
