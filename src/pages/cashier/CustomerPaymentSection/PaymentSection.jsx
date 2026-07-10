import React, { useState } from "react";
import { CreditCard } from "lucide-react";
import PaymentDialog from "./PaymentDialog";

const PaymentSection = ({ total, cart, onOrderComplete }) => {
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
          disabled={!cart.length}
        >
          <CreditCard size={15} />
          {cart.length ? "Process Payment" : "Add items to pay"}
        </button>
      </div>

      <PaymentDialog
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onOrderComplete={onOrderComplete}
      />
    </>
  );
};

export default PaymentSection;
