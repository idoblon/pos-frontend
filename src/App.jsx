import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import CashierRoutes from "./routes/CashierRoutes";
// import StoreRoutes from "pos-frontend/src/routes/StoreRoutes";
import Login from "./pages/Auth/Login";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/cashier" replace />} />
      <Route path="/cashier/*" element={<CashierRoutes />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
export default App;
