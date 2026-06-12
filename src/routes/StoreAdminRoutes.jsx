import { Route, Routes } from "react-router-dom";
import StoreAdminLayout from "@/pages/storeAdmin/StoreAdminLayout";
import StoreDashboard from "@/pages/storeAdmin/StoreDashboard";
import BranchManagement from "@/pages/storeAdmin/Branches/BranchManagement";
import ProductManagement from "@/pages/storeAdmin/Products/ProductManagement";
import EmployeeManagement from "@/pages/storeAdmin/Employees/EmployeeManagement";
import CategoryManagement from "@/pages/storeAdmin/Categories/CategoryManagement";
import StoreReports from "@/pages/storeAdmin/Reports/StoreReports";
import InventoryManagement from "@/pages/storeAdmin/Inventory/InventoryManagement";
import RestockManagement from "@/pages/storeAdmin/Restock/RestockManagement";
import SubscriptionRequest from "@/pages/storeAdmin/Subscription/SubscriptionRequest";

const StoreAdminRoutes = () => {
  return (
    <Routes>
      <Route element={<StoreAdminLayout />}>
        <Route index element={<StoreDashboard />} />
        <Route path="branches"   element={<BranchManagement />} />
        <Route path="products"   element={<ProductManagement />} />
        <Route path="inventory"  element={<InventoryManagement />} />
        <Route path="restock-requests" element={<RestockManagement />} />
        <Route path="subscription" element={<SubscriptionRequest />} />
        <Route path="employees"  element={<EmployeeManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="reports"    element={<StoreReports />} />
      </Route>
    </Routes>
  );
};

export default StoreAdminRoutes;
