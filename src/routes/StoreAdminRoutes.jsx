import { Route, Routes } from "react-router-dom";
import StoreAdminLayout from "@/pages/storeAdmin/StoreAdminLayout";
import StoreDashboard from "@/pages/storeAdmin/StoreDashboard";
import BranchManagement from "@/pages/storeAdmin/Branches/BranchManagement";
import ProductManagement from "@/pages/storeAdmin/Products/ProductManagement";
import EmployeeManagement from "@/pages/storeAdmin/Employees/EmployeeManagement";
import CategoryManagement from "@/pages/storeAdmin/Categories/CategoryManagement";

const StoreAdminRoutes = () => {
  return (
    <Routes>
      <Route element={<StoreAdminLayout />}>
        <Route index element={<StoreDashboard />} />
        <Route path="branches" element={<BranchManagement />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="employees" element={<EmployeeManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
      </Route>
    </Routes>
  );
};

export default StoreAdminRoutes;
