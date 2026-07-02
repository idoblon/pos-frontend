import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentShiftProgress, getShiftsByBranch } from "@/Redux Toolkit/Features/shiftReport/shiftReportThunk";
import ShiftReportHeader from "./ShiftReportHeader";
import ShiftInformation from "./ShiftInformation";
import SalesSummaryCard from "./SalesSummaryCard";
import PaymentSummaryCard from "./PaymentSummaryCard";
import TopSellingItems from "./TopSellingItems";
import RecentOrdersTable from "./RecentOrdersTable";
import RefundsTable from "./RefundsTable";
import secureStorage from "@/util/secureStorage";

const BranchShiftSummaryPage = () => {
  const dispatch = useDispatch();
  const { currentShift, loading, shiftsByBranch } = useSelector((s) => s.shiftReport);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [selectedCashierId, setSelectedCashierId] = useState("all");

  const userData = secureStorage.getUserData();
  const branchId = userData?.branchId;

  useEffect(() => {
    dispatch(getCurrentShiftProgress());
    if (branchId) dispatch(getShiftsByBranch(branchId));

    const interval = setInterval(() => {
      dispatch(getCurrentShiftProgress());
      if (branchId) dispatch(getShiftsByBranch(branchId));
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, branchId]);

  useEffect(() => {
    if (currentShift !== null || !loading) setInitialLoading(false);
  }, [currentShift, loading]);

  // Get all cashier shifts (exclude branch manager's own shift)
  const cashierShifts = (shiftsByBranch || []).filter(
    (s) => !s.shiftEnd && (s.cashier?.role === "ROLE_BRANCH_CASHIER" || s.role === "ROLE_BRANCH_CASHIER" || (!s.cashier?.role && !s.role))
  );

  // Unique cashiers from active shifts
  const cashiers = cashierShifts.reduce((acc, s) => {
    const id = String(s.cashierId || s.cashier?.id || s.cashier?._id || "");
    const name = s.cashierName || s.cashier?.fullName || `Cashier #${id}`;
    if (id && !acc.find((c) => c.id === id)) acc.push({ id, name });
    return acc;
  }, []);

  // Active cashier shift data to pass to cards
  const activeCashierShift = selectedCashierId === "all"
    ? cashierShifts[0] ?? null
    : cashierShifts.find((s) => String(s.cashierId || s.cashier?.id || s.cashier?._id) === selectedCashierId) ?? null;

  if (initialLoading && loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading shift data...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ShiftReportHeader />
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4">
          <div className="space-y-4">
            {/* Top Row - Branch Manager's own shift info + Sales from cashier */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ShiftInformation />
              <div className="space-y-2">
                {/* Cashier selector */}
                {cashiers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Cashier shift:</span>
                    <select
                      className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white outline-none"
                      value={selectedCashierId}
                      onChange={(e) => setSelectedCashierId(e.target.value)}
                    >
                      <option value="all">Latest Active</option>
                      {cashiers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                {activeCashierShift ? (
                  <SalesSummaryCard shiftData={activeCashierShift} />
                ) : (
                  <div className="flex items-center justify-center h-32 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-400">No active cashier shift</p>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PaymentSummaryCard shiftData={activeCashierShift} />
              <TopSellingItems shiftData={activeCashierShift} />
            </div>

            {/* Recent Orders */}
            <RecentOrdersTable shiftData={activeCashierShift} />

            {/* Refunds */}
            <RefundsTable shiftData={activeCashierShift} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchShiftSummaryPage;
