import React from "react";
import OrderInformation from "./OrderInformation";
import CustomerInformation from "./CustomerInformation";
import OrderItemTable from "./OrderItemTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const OrderDetails = ({ selectedOrder }) => {
  const handleDownload = () => {
    const invoiceContent = `
INVOICE ${selectedOrder?.id}
================================
Date: ${selectedOrder?.createdAt}
Customer: ${selectedOrder?.customer?.fullName || 'Walk-in'}
Phone: ${selectedOrder?.customer?.phone || 'N/A'}
Payment: ${selectedOrder?.paymentType}
Status: ${selectedOrder?.status}

ITEMS:
${selectedOrder?.items?.map(item => 
  `${item.product?.name} (${item.product?.sku}) x${item.quantity} - रु${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

================================
TOTAL: रु${selectedOrder?.totalAmount?.toFixed(2)}
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
