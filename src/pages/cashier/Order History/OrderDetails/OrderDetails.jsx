import React from "react";
import OrderInformation from "./OrderInformation";
import CustomerInformation from "./CustomerInformation";
import OrderItemTable from "./OrderItemTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const OrderDetails = ({ selectedOrder }) => {
const handleDownload = () => {
     const subtotal = selectedOrder?.taxAmount
       ? (selectedOrder.totalAmount - selectedOrder.taxAmount)
       : selectedOrder?.totalAmount;
     const tax = selectedOrder?.taxAmount || 0;
     
     const discountAmount = selectedOrder?.discount || 0;
     const discountType = selectedOrder?.discountType || "percentage";
     let calculatedDiscount = 0;
     if (discountAmount > 0) {
       if (discountType === "percentage") {
         calculatedDiscount = subtotal * (discountAmount / 100);
       } else {
         calculatedDiscount = discountAmount;
       }
     }

     const invoiceContent = `
INVOICE ${selectedOrder?.id}
================================
Date: ${selectedOrder?.createdAt}
Customer: ${selectedOrder?.customer?.fullName || 'Walk-in'}
Phone: ${selectedOrder?.customer?.phone || 'N/A'}
Payment: ${selectedOrder?.paymentMethod || selectedOrder?.paymentType || 'CASH'}
Status: ${selectedOrder?.status === 'PENDING' && selectedOrder?.createdAt ? 'COMPLETED' : (selectedOrder?.status || 'COMPLETED')}

ITEMS:
${selectedOrder?.items?.map(item =>
  `${item.product?.name} (${item.product?.sku}) x${item.quantity} - रु${(item.price || 0).toFixed(2)}`
).join('\n')}

================================
SUBTOTAL:  रु${(subtotal || 0).toFixed(2)}
TAX (13%):  रु${tax.toFixed(2)}${calculatedDiscount > 0 ? `
DISCOUNT${discountType === 'percentage' ? ` (${discountAmount}%)` : ''}:  -रु${calculatedDiscount.toFixed(2)}` : ''}
TOTAL:      रु${(selectedOrder?.totalAmount || 0).toFixed(2)}
     `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${selectedOrder?.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-shrink-0">
        <OrderInformation selectedOrder={selectedOrder} />
        <CustomerInformation selectedOrder={selectedOrder} />
      </div>

      <div className="flex-1 min-h-0">
        <OrderItemTable selectedOrder={selectedOrder} />
      </div>

      <div className="flex justify-end pt-2 flex-shrink-0">
        <Button 
          onClick={handleDownload}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="mr-2 h-3 w-3" />
          Download Invoice
        </Button>
      </div>
    </div>
  );
};

export default OrderDetails;
