import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentShiftProgress } from "@/Redux Toolkit/Features/shiftReport/shiftReportThunk";
import ShiftReportHeader from "./ShiftReportHeader";
import ShiftInformation from "./ShiftInformation";
import SalesSummaryCard from "./SalesSummaryCard";
import PaymentSummaryCard from "./PaymentSummaryCard";
import TopSellingItems from "./TopSellingItems";
import RecentOrdersTable from "./RecentOrdersTable";
import RefundsTable from "./RefundsTable";

const ShiftSummaryPage = () => {
  const dispatch = useDispatch();
  const { currentShift, loading } = useSelector((s) => s.shiftReport);
  const [initialLoading, setInitialLoading] = React.useState(true);

  useEffect(() => {
    console.log('📊 ShiftSummaryPage mounted, fetching current shift...');
    dispatch(getCurrentShiftProgress());
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(getCurrentShiftProgress());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    console.log('📊 Current shift data:', currentShift);
    if (currentShift !== null || !loading) {
      setInitialLoading(false);
    }
  }, [currentShift, loading]);

  if (initialLoading && loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading shift data...</p>
      </div>
    );
  }

  if (!currentShift) {
    return (
      <div className="h-full flex flex-col">
        <ShiftReportHeader />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-2">No Active Shift</p>
            <p className="text-gray-500 text-sm">Please log out and log in again to start a new shift</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ShiftReportHeader />
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4">
          <div className="space-y-4">
            {/* Top Row - Shift Info and Sales Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <ShiftInformation />
              </div>
              <div>
                <SalesSummaryCard />
              </div>
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
