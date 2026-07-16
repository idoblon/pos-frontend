import CreateOrder from "@/pages/cashier/CreateOrder";
import OrderHistory from "@/pages/cashier/Order History/OrderHistory";
import CashierDashboardLayout from "@/pages/cashier/CashierDashboardLayout";
import CustomersLookup from "@/pages/cashier/Customer Management/CustomersLookup";
import { Route, Routes } from "react-router-dom";
import RefundPage from "@/pages/cashier/Refund/RefundPage";
import ShiftSummaryPage from "@/pages/cashier/Shift Report/ShiftSummaryPage";
import HeldOrdersPage from "@/pages/cashier/HeldOrders/HeldOrdersPage";
import CashierPageShell from "@/pages/cashier/CashierPageShell";
import { createElement } from "react";

const withCashierShell = (title, description, Page) => (
  <CashierPageShell title={title} description={description}>
    {createElement(Page)}
  </CashierPageShell>
);

const CashierRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CashierDashboardLayout />} />
      <Route path="orders" element={withCashierShell("Order history", "Review completed branch orders", OrderHistory)} />
      <Route path="customers" element={withCashierShell("Customers", "Find customer details and order history", CustomersLookup)} />
      <Route path="returns" element={withCashierShell("Returns", "Process customer returns and refunds", RefundPage)} />
      <Route path="shift-summary" element={withCashierShell("Shift summary", "Review your sales and payment totals", ShiftSummaryPage)} />
      <Route path="held-orders" element={withCashierShell("Held orders", "Resume or discard carts saved on this device", HeldOrdersPage)} />
    </Routes>
  );
};

export default CashierRoutes;
