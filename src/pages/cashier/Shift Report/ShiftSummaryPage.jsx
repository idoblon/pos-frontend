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
    <div className="h-full flex flex-col">
      <ShiftReportHeader />
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4">
          <div className="space-y-4">
            {/* Top Row - Shift Info and Sales Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ShiftInformation />
              <SalesSummaryCard />
            </div>

            {/* Middle Row - Payment Summary and Top Selling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PaymentSummaryCard />
              <TopSellingItems />
            </div>

            {/* Bottom Row - Recent Orders */}
            <div className="grid grid-cols-1 gap-4">
              <RecentOrdersTable />
            </div>

            {/* Refunds Table */}
            <div className="grid grid-cols-1 gap-4">
              <RefundsTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftSummaryPage;
