import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Phone, Mail } from "lucide-react";

const CustomerTable = ({ customers, onView, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading customers...
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No customers found
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Address</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Total Orders</th>
            <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3">
                <div className="font-medium">
                  {customer.fullName || 'N/A'}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Phone size={14} />
                  {customer.phone || "N/A"}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Mail size={14} />
                  {customer.email || "N/A"}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {customer.address || "N/A"}
              </td>
              <td className="px-4 py-3 text-sm">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {customer.totalOrders ?? 0}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(customer)}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(customer)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(customer)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;
