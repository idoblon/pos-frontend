import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from "react";
import OrderTable from "./OrderTable";
import { getOrdersByCashier } from "@/Redux Toolkit/Features/order/orderThunk";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import OrderDetails from "./OrderDetails/OrderDetails";
import { useState } from "react";

const OrderHistory = () => {
  const [showOrderInvoiceDialog, setShowOrderInvoiceDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const {userProfile}=useSelector(state=>state.user)
  const dispatch = useDispatch();

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderInvoiceDialog(true);
  };

  useEffect(()=>{
    if(userProfile?.id){
      dispatch(getOrdersByCashier(userProfile.id))
    }
  },[userProfile, dispatch])
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-card border-b">
        <h1 className="text-2xl font-bold">Order History</h1>
        <p className="text-gray-600 text-sm mt-1">View and manage all orders</p>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <OrderTable handleViewOrderDetails={handleViewOrderDetails} />
        </div>
      </div>

      <Dialog
        open={showOrderInvoiceDialog}
        onOpenChange={setShowOrderInvoiceDialog}
      >
        <DialogContent className="max-w-4xl w-[80vw] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-3 py-2 border-b bg-gradient-to-r from-blue-50 to-blue-100 flex-shrink-0">
            <DialogTitle className="text-base font-bold text-gray-900">
              Invoice {selectedOrder?.id}
            </DialogTitle>
            <p className="text-xs text-gray-600">{selectedOrder?.createdAt}</p>
          </DialogHeader>
          <div className="flex-1 p-3 overflow-hidden">
            <OrderDetails selectedOrder={selectedOrder} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderHistory;
