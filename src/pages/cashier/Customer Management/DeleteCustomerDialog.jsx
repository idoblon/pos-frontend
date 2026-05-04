import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import api from "@/util/api";

const DeleteCustomerDialog = ({ open, onClose, customer, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");
      await api.delete(`/customers/${customer.id}`);
      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete customer");
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} />
            Delete Customer
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the customer
            and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold">
              {customer.firstName} {customer.lastName}
            </p>
            <p className="text-sm text-gray-600">{customer.phoneNumber}</p>
            {customer.email && (
              <p className="text-sm text-gray-600">{customer.email}</p>
            )}
          </div>

          <p className="text-sm text-gray-600">
            Are you sure you want to delete this customer?
          </p>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Customer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCustomerDialog;
