import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { restoreAuth } from "./Redux Toolkit/Features/auth/authSlice";
import { mapToBackendRole } from "./util/roleMapper";
import { Toaster } from "sonner";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Route trees and standalone pages are code-split so the initial bundle
// only contains the landing/login shell.
const CashierRoutes = lazy(() => import("./routes/CashierRoutes"));
const StoreAdminRoutes = lazy(() => import("./routes/StoreAdminRoutes"));
const BranchRoutes = lazy(() => import("./routes/BranchRoutes"));
const AdminRoutes = lazy(() => import("./routes/AdminRoutes"));
const Login = lazy(() => import("./pages/Auth/Login"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));
const Signup = lazy(() => import("./pages/Auth/Signup"));
const Landing = lazy(() => import("./pages/Landing"));
const AdminSeeder = lazy(() => import("./pages/AdminSeeder"));
const StoreSuspended = lazy(() => import("./pages/StoreSuspended"));
const PaymentRequired = lazy(() => import("./pages/PaymentRequired"));
const StorePaymentPage = lazy(() => import("./pages/Payment/StorePaymentPage"));

const RouteFallback = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans','Inter',sans-serif",
      color: "#6b7280",
    }}
  >
    Loading…
  </div>
);

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  // Get user's backend role
  const userBackendRole = user?.role ? mapToBackendRole(user.role) : null;

  return (
    <ErrorBoundary>
      <Toaster position="top-right" richColors />
      <Suspense fallback={<RouteFallback />}>
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
          <Route
            path="/branch/*"
            element={
              <ProtectedRoute allowedRoles={["ROLE_BRANCH_MANAGER", "ROLE_STORE_ADMIN", "ROLE_STORE_MANAGER", "ROLE_ADMIN"]}>
                <BranchRoutes />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/suspended" element={<StoreSuspended />} />
          <Route path="/payment-required" element={<PaymentRequired />} />
          <Route path="/pay" element={<StorePaymentPage />} />
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
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
