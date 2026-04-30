import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import CashierRoutes from "./routes/CashierRoutes";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/cashier" replace />} />
      <Route path="/cashier/*" element={<CashierRoutes />} />
    </Routes>
  );
}
export default App;
