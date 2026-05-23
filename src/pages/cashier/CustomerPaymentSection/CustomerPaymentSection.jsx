import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import CustomerSection from "./CustomerSection";
import PaymentSection from "./PaymentSection";
import { selectCartItems, selectTotal, selectSelectedCustomer, setSelectedCustomer } from "@/Redux Toolkit/Features/Cart/cartSlice";

const CustomerPaymentSection = ({ onOrderComplete }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const total = useSelector(selectTotal);
  const selectedCustomer = useSelector(selectSelectedCustomer);

  const handleSelectCustomer = (customer) => {
    console.log("🎯 CustomerPaymentSection - Customer selected:", customer);
    dispatch(setSelectedCustomer(customer));
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
        total={total}
        cart={cartItems}
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
