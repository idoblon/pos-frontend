import React, { useState } from "react";
import { User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomerDialog from "./CustomerDialog";

const CustomerSection = ({ selectedCustomer, onSelectCustomer }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="rs">
      <div className="rs-title">
        <User size={13} />
        Customer
      </div>
      
      {selectedCustomer ? (
        <div className="p-3 border rounded-lg bg-blue-50">
          <div className="flex justify-between items-start mb-1">
            <p className="font-semibold text-sm">{selectedCustomer.name}</p>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={() => setIsDialogOpen(true)}
            >
              Change
            </Button>
          </div>
          <p className="text-xs text-gray-600">{selectedCustomer.phone}</p>
          {selectedCustomer.email && (
            <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
          )}
        </div>
      ) : (
        <Button
          className="sel-cust w-full"
          variant="outline"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus size={14} className="mr-2" />
          Select Customer
        </Button>
      )}

      <CustomerDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelectCustomer={(customer) => {
          onSelectCustomer(customer);
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
};

export default CustomerSection;
