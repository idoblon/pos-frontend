import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { restoreAuth } from "./Redux Toolkit/Features/auth/authSlice";
import { mapToBackendRole, getAllowedRoutes } from "./util/roleMapper";
import { Toaster } from "sonner";
import "./App.css";
import CashierRoutes from "./routes/CashierRoutes";
import StoreAdminRoutes from "./routes/StoreAdminRoutes";
import BranchRoutes from "./routes/BranchRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Landing from "./pages/Landing";
import AdminSeeder from "./pages/AdminSeeder";
import StoreSuspended from "./pages/StoreSuspended";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  // Get user's backend role
  const userBackendRole = user?.role ? mapToBackendRole(user.role) : null;
  const allowedRoutes = userBackendRole ? getAllowedRoutes(userBackendRole) : [];

  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              userBackendRole === "ROLE_ADMIN" ? (
                <Navigate to="/admin" replace />
              ) : userBackendRole === "ROLE_STORE_ADMIN" || userBackendRole === "ROLE_STORE_MANAGER" ? (
                <Navigate to="/store-admin" replace />
              ) : userBackendRole === "ROLE_BRANCH_MANAGER" ? (
                <Navigate to="/branch" replace />
              ) : (
                <Navigate to="/cashier" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cashier/*"
          element={
            <ProtectedRoute allowedRoles={["ROLE_BRANCH_CASHIER", "ROLE_BRANCH_MANAGER", "ROLE_STORE_ADMIN", "ROLE_STORE_MANAGER", "ROLE_ADMIN"]}>
              <CashierRoutes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/store-admin/*"
          element={
            <ProtectedRoute allowedRoles={["ROLE_STORE_ADMIN", "ROLE_STORE_MANAGER", "ROLE_ADMIN"]}>
              <StoreAdminRoutes />
            </ProtectedRoute>
          }
        />
        <Route path="/branch/*" element={<BranchRoutes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/suspended" element={<StoreSuspended />} />
        <Route path="/setup-admin" element={<AdminSeeder />} />
        {/* Catch-all route for unauthorized access */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </>
  );
}

export default App;
