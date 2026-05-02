import CreateOrder from "@/pages/cashier/CreateOrder";
import OrderHistory from "@/pages/cashier/Order History/OrderHistory";
import CashierDashboardLayout from "@/pages/cashier/CashierDashboardLayout";
import CustomersLookup from "@/pages/cashier/Customer Management/CustomersLookup";
import { Route, Routes } from "react-router-dom";
import RefundPage from "@/pages/cashier/Refund/RefundPage";
import ShiftSummaryPage from "@/pages/cashier/Shift Report/ShiftSummaryPage";

const CashierRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CashierDashboardLayout />} />
      <Route path="orders" element={<OrderHistory />} />
      <Route path="customers" element={<CustomersLookup />} />
      <Route path="returns" element={<RefundPage />} />
      <Route path="shift-summary" element={<ShiftSummaryPage />} />
    </Routes>
  );
};

export default CashierRoutes;
