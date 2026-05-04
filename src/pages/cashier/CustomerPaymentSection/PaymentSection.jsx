import React, { useState } from "react";
import { CreditCard, PauseCircle } from "lucide-react";
import PaymentDialog from "./PaymentDialog";

const PaymentSection = ({ total, cart, customer, discount, discountType, note, onHoldOrder }) => {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  return (
    <>
      <div className="total-area">
        <div className="total-amt">
          {total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}$
        </div>
        <div className="total-lbl">Total Amount</div>
      </div>

      <div className="r-actions">
        <button 
          className="pay-btn"
          onClick={() => setIsPaymentDialogOpen(true)}
          disabled={cart.length === 0}
        >
          <CreditCard size={15} />
          Process Payment
        </button>
        <button 
          className="hold-btn"
          onClick={onHoldOrder}
          disabled={cart.length === 0}
        >
          <PauseCircle size={15} />
          Hold Order
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
      />
    </>
  );
};

export default PaymentSection;
