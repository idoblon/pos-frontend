import { Route, Routes } from "react-router-dom";
import StoreAdminLayout from "@/pages/storeAdmin/StoreAdminLayout";
import StoreDashboard from "@/pages/storeAdmin/StoreDashboard";
import BranchManagement from "@/pages/storeAdmin/Branches/BranchManagement";
import ProductManagement from "@/pages/storeAdmin/Products/ProductManagement";
import EmployeeManagement from "@/pages/storeAdmin/Employees/EmployeeManagement";
import CategoryManagement from "@/pages/storeAdmin/Categories/CategoryManagement";
import StoreReports from "@/pages/storeAdmin/Reports/StoreReports";
import StoreWarehouseInventory from "@/pages/storeAdmin/Inventory/StoreWarehouseInventory";
import RestockManagement from "@/pages/storeAdmin/Restock/RestockManagement";
import SubscriptionRequest from "@/pages/storeAdmin/Subscription/SubscriptionRequest";
import PaymentSettings from "@/pages/storeAdmin/Settings/PaymentSettings";

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
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="reports"    element={<StoreReports />} />
        <Route path="payment-settings" element={<PaymentSettings />} />
      </Route>
    </Routes>
  );
};

export default StoreAdminRoutes;
