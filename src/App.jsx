import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { restoreAuth } from "./Redux Toolkit/Features/auth/authSlice";
import "./App.css";
import CashierRoutes from "./routes/CashierRoutes";
import StoreAdminRoutes from "./routes/StoreAdminRoutes";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            user?.role === "store_admin" || user?.role === "manager" ? (
              <Navigate to="/store-admin" replace />
            ) : (
              <Navigate to="/cashier" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/cashier/*"
        element={
          <ProtectedRoute allowedRoles={["cashier", "store_admin", "manager"]}>
            <CashierRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store-admin/*"
        element={
          <ProtectedRoute allowedRoles={["store_admin", "manager"]}>
            <StoreAdminRoutes />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;
