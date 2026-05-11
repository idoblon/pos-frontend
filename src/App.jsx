import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import CashierRoutes from "./routes/CashierRoutes";
import StoreAdminRoutes from "./routes/StoreAdminRoutes";
import Login from "./pages/Auth/Login";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/cashier" replace />} />
      <Route path="/cashier/*" element={<CashierRoutes />} />
      <Route path="/store" element={<Navigate to="/store-admin" replace />} />
      <Route path="/store-admin/*" element={<StoreAdminRoutes />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
export default App;
