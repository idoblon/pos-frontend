import { Route, Routes } from "react-router-dom";
import BranchLayout from "@/pages/branch/BranchLayout";
import BranchDashboard from "@/pages/branch/BranchDashboard";
import BranchEmployees from "@/pages/branch/BranchEmployees";
import BranchOrders from "@/pages/branch/BranchOrders";
import BranchRefunds from "@/pages/branch/BranchRefunds";
import BranchInventory from "@/pages/branch/BranchInventory";
import BranchCustomers from "@/pages/branch/BranchCustomers";
import BranchTransactions from "@/pages/branch/BranchTransactions";
import BranchReports from "@/pages/branch/BranchReports";
import BranchSettings from "@/pages/branch/BranchSettings";

const BranchRoutes = () => (
  <Routes>
    <Route element={<BranchLayout />}>
      <Route index                    element={<BranchDashboard />} />
      <Route path="orders"            element={<BranchOrders />} />
      <Route path="inventory"         element={<BranchInventory />} />
      <Route path="customers"         element={<BranchCustomers />} />
      <Route path="employees"         element={<BranchEmployees />} />
      <Route path="reports"           element={<BranchReports />} />
      <Route path="refunds"           element={<BranchRefunds />} />
      <Route path="settings"          element={<BranchSettings />} />
    </Route>
  </Routes>
);

export default BranchRoutes;
