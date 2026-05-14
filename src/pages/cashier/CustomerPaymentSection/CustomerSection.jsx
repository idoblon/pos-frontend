import React, { useState } from "react";
import { User, Plus, X } from "lucide-react";
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
        <div style={{ border: "1px solid #d1fae5", borderRadius: 8, padding: "8px 10px", background: "#f0fdf4" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1a1d23" }}>
              {selectedCustomer.firstName} {selectedCustomer.lastName}
            </p>
            <button
              onClick={() => onSelectCustomer(null)}
              style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", padding: 2, display: "flex" }}
            >
              <X size={13} />
            </button>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{selectedCustomer.phoneNumber}</p>
          <button
            onClick={() => setIsDialogOpen(true)}
            style={{ marginTop: 4, fontSize: 11, color: "#059669", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}
          >
            Change
          </button>
        </div>
      ) : (
        <button className="sel-cust" onClick={() => setIsDialogOpen(true)}>
          <Plus size={13} style={{ marginRight: 4 }} />
          Select Customer
        </button>
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
