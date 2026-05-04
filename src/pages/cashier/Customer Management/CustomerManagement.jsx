import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCustomersByBranch } from "@/Redux Toolkit/Features/user/userThunk";
import CustomerTable from "./CustomerTable";
import AddCustomerDialog from "./AddCustomerDialog";
import EditCustomerDialog from "./EditCustomerDialog";
import ViewCustomerDialog from "./ViewCustomerDialog";
import DeleteCustomerDialog from "./DeleteCustomerDialog";

export default function CustomerManagement() {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const { customers } = useSelector((state) => state.user);
  const branchId = localStorage.getItem("branchId");

  useEffect(() => {
    if (branchId) {
      dispatch(getCustomersByBranch({ branchId }));
    }
  }, [dispatch, branchId]);

  const filteredCustomers = customers?.filter(
    (customer) =>
      customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber?.includes(searchTerm)
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
    if (branchId) {
      dispatch(getCustomersByBranch({ branchId }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage your customer database</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customers ({filteredCustomers?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <CustomerTable
              customers={filteredCustomers}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={false}
            />
          </div>
        </CardContent>
      </Card>

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
}
