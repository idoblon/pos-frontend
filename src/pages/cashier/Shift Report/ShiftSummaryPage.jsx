import React from "react";
import ShiftReportHeader from "./ShiftReportHeader";
import ShiftInformation from "./ShiftInformation";
import SalesSummaryCard from "./SalesSummaryCard";
import PaymentSummaryCard from "./PaymentSummaryCard";
import TopSellingItems from "./TopSellingItems";
import RecentOrdersTable from "./RecentOrdersTable";
import RefundsTable from "./RefundsTable";

const ShiftSummaryPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ShiftReportHeader />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Row - Shift Info and Sales Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ShiftInformation />
            <SalesSummaryCard />
          </div>

          {/* Middle Row - Payment Summary and Top Selling */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PaymentSummaryCard />
            <TopSellingItems />
          </div>

          {/* Bottom Row - Recent Orders */}
          <div className="grid grid-cols-1 gap-6">
            <RecentOrdersTable />
          </div>

          {/* Refunds Table */}
          <div className="grid grid-cols-1 gap-6">
            <RefundsTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftSummaryPage;
