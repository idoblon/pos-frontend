import React from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import ShiftSummaryPage from "./pages/cashier/Shift Report/ShiftSummaryPage";
import OrderHistory from "./pages/cashier/Order History/OrderHistory";
import RefundPage from "./pages/cashier/Refund/RefundPage";

function App() {
  return (
    <>
      {/*<ShiftSummaryPage/> */}
      {/*  <OrderHistory />*/}
      <RefundPage />
    </>
  );
}

export default App;
