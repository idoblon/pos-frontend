import React, { useState } from "react";
import { CreditCard } from "lucide-react";
import PaymentDialog from "./PaymentDialog";

const PaymentSection = ({ total, cart, customer, discount, discountType, note, onOrderComplete }) => {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  return (
    <>
      <div className="total-area">
        <div className="total-amt">
          रु {total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </div>
        <div className="total-lbl">Total Amount</div>
      </div>

      <div className="r-actions">
        <button
          className="pay-btn"
          onClick={() => setIsPaymentDialogOpen(true)}
        >
          <CreditCard size={15} />
          Process Payment
        </button>
      </div>

      <PaymentDialog
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        total={total}
        cart={cart}
        customer={customer}
        discount={discount}
        discountType={discountType}
        note={note}
        onOrderComplete={onOrderComplete}
      />
    </>
  );
};

export default PaymentSection;
