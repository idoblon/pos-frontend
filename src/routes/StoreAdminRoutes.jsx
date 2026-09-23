import { Route, Routes } from "react-router-dom";
import StoreAdminLayout from "@/pages/storeAdmin/StoreAdminLayout";
import StoreDashboard from "@/pages/storeAdmin/StoreDashboard";
import BranchManagement from "@/pages/storeAdmin/Branches/BranchManagement";
import ProductManagement from "@/pages/storeAdmin/Products/ProductManagement";
import EmployeeManagement from "@/pages/storeAdmin/Employees/EmployeeManagement";
import CategoryManagement from "@/pages/storeAdmin/Categories/CategoryManagement";
import StoreAnalytics from "@/pages/storeAdmin/Reports/StoreAnalytics";
import StoreShiftSummary from "@/pages/storeAdmin/ShiftSummary/StoreShiftSummary";
import StoreWarehouseInventory from "@/pages/storeAdmin/Inventory/StoreWarehouseInventory";
import RestockManagement from "@/pages/storeAdmin/Restock/RestockManagement";
import SubscriptionRequest from "@/pages/storeAdmin/Subscription/SubscriptionRequest";
import PaymentSettings from "@/pages/storeAdmin/Settings/PaymentSettings";
import StoreProfile from "@/pages/storeAdmin/Settings/StoreProfile";
import EmployeeActivityPage from "@/pages/storeAdmin/Activity/EmployeeActivityPage";
import OperationsCenter from "@/pages/storeAdmin/Operations/OperationsCenter";

const StoreAdminRoutes = () => {
  return (
    <Routes>
      <Route element={<StoreAdminLayout />}>
        <Route index element={<StoreDashboard />} />
        <Route path="branches"   element={<BranchManagement />} />
        <Route path="products"   element={<ProductManagement />} />
        <Route path="inventory"  element={<StoreWarehouseInventory />} />
        <Route path="restock-requests" element={<RestockManagement />} />
        <Route path="subscription" element={<SubscriptionRequest />} />
        <Route path="employees"  element={<EmployeeManagement />} />
        <Route path="employee-activity" element={<EmployeeActivityPage />} />
        <Route path="operations" element={<OperationsCenter />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="shift-summary" element={<StoreShiftSummary />} />
        <Route path="reports"    element={<StoreAnalytics />} />
        <Route path="payment-settings" element={<PaymentSettings />} />
        <Route path="profile" element={<StoreProfile />} />
      </Route>
    </Routes>
  );
};

export default StoreAdminRoutes;
