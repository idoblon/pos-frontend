import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import CustomerSection from "./CustomerSection";
import PaymentSection from "./PaymentSection";

const CustomerPaymentSection = ({ cart, onOrderComplete }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleSelectCustomer = (customer) => {
    console.log("🎯 CustomerPaymentSection - Customer selected:", customer);
    console.log("📡 This is where you would make API calls if needed for order processing");
    setSelectedCustomer(customer);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Customer Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerSection 
            selectedCustomer={selectedCustomer}
            onSelectCustomer={handleSelectCustomer}
          />
        </CardContent>
      </Card>

      {/* Payment Section */}
      <PaymentSection 
        total={cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
        cart={cart}
        customer={selectedCustomer}
        discount={0}
        discountType="percentage"
        note=""
        onOrderComplete={onOrderComplete}
      />
    </div>
  );
};

export default CustomerPaymentSection;
