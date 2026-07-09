import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrdersByBranch, getRecentOrdersByBranch } from "@/Redux Toolkit/Features/order/orderThunk";
import { getRefundsByBranch } from "@/Redux Toolkit/Features/refund/refundThunk";
import { getCurrentShiftProgress, getShiftsByBranch } from "@/Redux Toolkit/Features/shiftReport/shiftReportThunk";
import { Activity, AlertTriangle, ReceiptText, RefreshCw, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EndShiftLogoutButton } from "./ShiftReportHeader";
import ShiftInformation from "./ShiftInformation";
import PaymentSummaryCard from "./PaymentSummaryCard";
import TopSellingItems from "./TopSellingItems";
import RecentOrdersTable from "./RecentOrdersTable";
import RefundsTable from "./RefundsTable";
import secureStorage from "@/util/secureStorage";

const CASHIER_DATA_REFRESH_MS = 5000;
const CURRENT_SHIFT_REFRESH_MS = 30000;

const getCashierId = (shift) => String(shift?.cashierId || shift?.cashier?.id || shift?.cashier?._id || "");

const getShiftId = (shift) => String(shift?.id || shift?._id || shift?.shiftReportId || "");

const getItemCashierId = (item) => String(
  item?.cashierId ||
  item?.userId ||
  item?.employeeId ||
  item?.createdBy ||
  item?.createdById ||
  item?.cashier?.id ||
  item?.cashier?._id ||
  item?.user?.id ||
  item?.user?._id ||
  item?.employee?.id ||
  item?.employee?._id ||
  ""
);

const getItemShiftId = (item) => String(item?.shiftReportId || item?.shiftId || item?.shift?.id || item?.shiftReport?.id || "");

const getItemBranchId = (item) => String(item?.branchId || item?.branch?.id || item?.branch?._id || "");

const getCashierName = (shift) => {
  const id = getCashierId(shift);
  return shift?.cashierName || shift?.cashier?.fullName || (id ? `Cashier #${id}` : "Unknown cashier");
};

const numberValue = (value) => Number(value) || 0;

const money = (value) => `Rs ${numberValue(value).toLocaleString()}`;

const sortByNewest = (items) =>
  [...items].sort((a, b) => new Date(b?.createdAt || b?.date || 0) - new Date(a?.createdAt || a?.date || 0));

const getShiftStart = (shift) => shift?.shiftStart || shift?.startTime || shift?.loginTime || shift?.startedAt || shift?.createdAt;

const getShiftEnd = (shift) => shift?.shiftEnd || shift?.endTime || shift?.logoutTime || shift?.endedAt || shift?.closedAt;

const parseDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

const getOrderDate = (order) => order?.createdAt || order?.orderDate || order?.date || order?.updatedAt;

const getRefundDate = (refund) => refund?.createdAt || refund?.refundDate || refund?.date || refund?.updatedAt;

const getOrderId = (order) => String(order?.id || order?._id || order?.orderId || "");

const getRefundOrderId = (refund) => String(refund?.orderId || refund?.order?.id || refund?.order?._id || "");

const belongsToShift = (item, shift, dateGetter = getOrderDate) => {
  const shiftId = getShiftId(shift);
  const itemShiftId = getItemShiftId(item);
  if (shiftId && itemShiftId) return shiftId === itemShiftId;

  const cashierId = getCashierId(shift);
  const itemCashierId = getItemCashierId(item);
  const itemDate = parseDate(dateGetter(item));
  const shiftStart = parseDate(getShiftStart(shift));
  const shiftEnd = parseDate(getShiftEnd(shift)) || new Date();

  return Boolean(cashierId && itemCashierId === cashierId && itemDate && shiftStart && itemDate >= shiftStart && itemDate <= shiftEnd);
};

const formatDuration = (startValue, endValue) => {
  const start = startValue ? new Date(startValue) : null;
  if (!start || Number.isNaN(start.getTime())) return "N/A";

  const end = endValue ? new Date(endValue) : new Date();
  const totalMinutes = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const getShiftStatus = (shift) => {
  if (getShiftEnd(shift)) return { label: "Closed", className: "bg-gray-100 text-gray-700" };

  const start = getShiftStart(shift);
  const startedAt = start ? new Date(start) : null;
  if (startedAt && !Number.isNaN(startedAt.getTime())) {
    const hours = (Date.now() - startedAt.getTime()) / 36e5;
    if (hours >= 10) return { label: "Overtime", className: "bg-red-50 text-red-700" };
  }

  return { label: "Active", className: "bg-emerald-50 text-emerald-700" };
};

const buildCombinedCashierShift = (shifts) => {
  if (!shifts.length) return null;

  const paymentMap = new Map();
  const productMap = new Map();

  shifts.forEach((shift) => {
    (shift.paymentSummaries || []).forEach((payment) => {
      const type = payment.type || "Unknown";
      const current = paymentMap.get(type) || { type, transactionCount: 0, totalAmount: 0 };
      paymentMap.set(type, {
        ...current,
        transactionCount: current.transactionCount + numberValue(payment.transactionCount),
        totalAmount: current.totalAmount + numberValue(payment.totalAmount),
      });
    });

    (shift.topSellingProducts || []).forEach((product) => {
      const key = product.id || product.productId || product.name;
      if (!key) return;

      const current = productMap.get(key) || {
        ...product,
        quantity: 0,
        sellingPrice: 0,
      };

      productMap.set(key, {
        ...current,
        name: product.name || current.name,
        quantity: current.quantity + numberValue(product.quantity),
        sellingPrice: current.sellingPrice + numberValue(product.sellingPrice),
      });
    });
  });

  return {
    totalOrders: shifts.reduce((total, shift) => total + numberValue(shift.totalOrders), 0),
    totalSales: shifts.reduce((total, shift) => total + numberValue(shift.totalSales), 0),
    totalRefunds: shifts.reduce((total, shift) => total + numberValue(shift.totalRefunds), 0),
    netSale: shifts.reduce((total, shift) => total + numberValue(shift.netSale), 0),
    paymentSummaries: Array.from(paymentMap.values()),
    topSellingProducts: Array.from(productMap.values())
      .sort((a, b) => numberValue(b.quantity) - numberValue(a.quantity))
      .slice(0, 5),
    recentOrders: sortByNewest(shifts.flatMap((shift) => shift.recentOrders || [])).slice(0, 10),
    refunds: sortByNewest(shifts.flatMap((shift) => shift.refunds || [])).slice(0, 10),
  };
};

const buildPaymentSummaries = (orders) => {
  const paymentMap = new Map();

  orders.forEach((order) => {
    const type = order.paymentType || order.paymentMethod || "Unknown";
    const current = paymentMap.get(type) || { type, transactionCount: 0, totalAmount: 0 };
    paymentMap.set(type, {
      ...current,
      transactionCount: current.transactionCount + 1,
      totalAmount: current.totalAmount + numberValue(order.totalAmount || order.grandTotal || order.total),
    });
  });

  return Array.from(paymentMap.values());
};

const buildTopSellingProducts = (orders) => {
  const productMap = new Map();

  orders.forEach((order) => {
    const items = order.items || order.orderItems || order.products || [];
    items.forEach((item) => {
      const key = item.productId || item.id || item._id || item.product?.id || item.product?.name || item.name;
      if (!key) return;

      const current = productMap.get(key) || {
        id: key,
        name: item.productName || item.name || item.product?.name || "Unknown item",
        quantity: 0,
        sellingPrice: 0,
      };
      const quantity = numberValue(item.quantity);
      const lineAmount = numberValue(item.totalAmount || item.subtotal || item.price || item.unitPrice || item.sellingPrice);

      productMap.set(key, {
        ...current,
        name: item.productName || item.name || item.product?.name || current.name,
        quantity: current.quantity + quantity,
        sellingPrice: current.sellingPrice + lineAmount,
      });
    });
  });

  return Array.from(productMap.values())
    .sort((a, b) => numberValue(b.quantity) - numberValue(a.quantity))
    .slice(0, 5);
};

const enrichShiftWithLiveData = (shift, liveOrders, liveRefunds) => {
  const shiftOrders = sortByNewest(liveOrders.filter((order) => belongsToShift(order, shift)));
  const shiftOrderIds = new Set(shiftOrders.map(getOrderId).filter(Boolean));
  const shiftRefunds = sortByNewest(
    liveRefunds.filter((refund) => belongsToShift(refund, shift, getRefundDate) || shiftOrderIds.has(getRefundOrderId(refund)))
  );
  const totalSales = shiftOrders.reduce((sum, order) => sum + numberValue(order.totalAmount || order.grandTotal || order.total), 0);
  const totalRefunds = shiftRefunds.reduce((sum, refund) => sum + numberValue(refund.amount || refund.refundAmount), 0);

  return {
    ...shift,
    totalOrders: shiftOrders.length,
    totalSales,
    totalRefunds,
    netSale: totalSales - totalRefunds,
    paymentSummaries: buildPaymentSummaries(shiftOrders),
    topSellingProducts: buildTopSellingProducts(shiftOrders),
    recentOrders: shiftOrders.slice(0, 10),
    refunds: shiftRefunds.slice(0, 10),
  };
};

const StatTile = ({ label, value, sub, icon, tone = "slate" }) => {
  const TileIcon = icon;
  const toneClass = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
  }[tone];

  return (
    <Card className="rounded-lg py-0">
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
          <p className="mt-1 truncate text-xl font-bold text-gray-950">{value}</p>
          {sub ? <p className="mt-1 truncate text-xs text-gray-500">{sub}</p> : null}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          <TileIcon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
};

const CashierPerformanceTable = ({ shifts, selectedCashierId, onSelectCashier }) => (
  <Card className="rounded-lg py-0">
    <CardContent className="p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Cashier Performance</h2>
          <p className="text-xs text-gray-500">Active cashier shifts in this branch</p>
        </div>
        <select
          className="h-9 rounded-md border border-gray-200 bg-white px-3 text-xs outline-none"
          value={selectedCashierId}
          onChange={(event) => onSelectCashier(event.target.value)}
        >
          <option value="all">All active cashiers</option>
          {shifts.map((shift) => {
            const id = getCashierId(shift);
            return id ? <option key={id} value={id}>{getCashierName(shift)}</option> : null;
          })}
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Cashier</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="text-right text-xs">Orders</TableHead>
            <TableHead className="text-right text-xs">Sales</TableHead>
            <TableHead className="text-right text-xs">Refunds</TableHead>
            <TableHead className="text-right text-xs">Net</TableHead>
            <TableHead className="text-right text-xs">Shift Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shifts.length > 0 ? shifts.map((shift) => {
            const id = getCashierId(shift);
            const status = getShiftStatus(shift);
            return (
              <TableRow
                key={id || `${getCashierName(shift)}-${getShiftStart(shift)}`}
                className="cursor-pointer"
                onClick={() => id && onSelectCashier(id)}
              >
                <TableCell className="font-medium text-gray-900">{getCashierName(shift)}</TableCell>
                <TableCell>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
                </TableCell>
                <TableCell className="text-right">{numberValue(shift.totalOrders)}</TableCell>
                <TableCell className="text-right font-medium">{money(shift.totalSales)}</TableCell>
                <TableCell className="text-right text-red-600">{money(shift.totalRefunds)}</TableCell>
                <TableCell className="text-right font-semibold">{money(shift.netSale)}</TableCell>
                <TableCell className="text-right">{formatDuration(getShiftStart(shift), getShiftEnd(shift))}</TableCell>
              </TableRow>
            );
          }) : (
            <TableRow>
              <TableCell colSpan={7} className="py-6 text-center text-sm text-gray-400">
                No active cashier shifts
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

const BranchShiftSummaryPage = () => {
  const dispatch = useDispatch();
  const { currentShift, loading, shiftsByBranch } = useSelector((s) => s.shiftReport);
  const { orders, recentOrders } = useSelector((s) => s.order);
  const { refundsByBranch } = useSelector((s) => s.refund);
  const [selectedCashierId, setSelectedCashierId] = useState("all");
  const branchRefreshInFlightRef = useRef(false);

  const userData = secureStorage.getUserData();
  const branchId = userData?.branchId;

  const refreshBranchShifts = useCallback(async ({ silent = true } = {}) => {
    if (!branchId || branchRefreshInFlightRef.current) return;

    branchRefreshInFlightRef.current = true;
    try {
      await Promise.all([
        dispatch(getShiftsByBranch({ branchId, silent })),
        dispatch(getOrdersByBranch({ branchId })),
        dispatch(getRecentOrdersByBranch(branchId)),
        dispatch(getRefundsByBranch(branchId)),
      ]);
    } finally {
      branchRefreshInFlightRef.current = false;
    }
  }, [branchId, dispatch]);

  useEffect(() => {
    dispatch(getCurrentShiftProgress());
    refreshBranchShifts({ silent: false });

    const currentShiftInterval = setInterval(() => {
      dispatch(getCurrentShiftProgress());
    }, CURRENT_SHIFT_REFRESH_MS);

    const cashierDataInterval = setInterval(() => {
      refreshBranchShifts({ silent: true });
    }, CASHIER_DATA_REFRESH_MS);

    const refreshWhenVisible = () => {
      if (document.visibilityState !== "visible") return;
      dispatch(getCurrentShiftProgress());
      refreshBranchShifts({ silent: true });
    };

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      clearInterval(currentShiftInterval);
      clearInterval(cashierDataInterval);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [dispatch, refreshBranchShifts]);

  const initialLoading = loading && currentShift === null;

  const liveOrders = useMemo(() => {
    const orderMap = new Map();

    [...(orders || []), ...(recentOrders || [])].forEach((order) => {
      const orderBranchId = getItemBranchId(order);
      if (orderBranchId && branchId && orderBranchId !== String(branchId)) return;

      const key = getOrderId(order) || `${getOrderDate(order)}-${order.totalAmount}`;
      if (key) orderMap.set(key, order);
    });

    return Array.from(orderMap.values());
  }, [branchId, orders, recentOrders]);

  const liveRefunds = useMemo(
    () => (refundsByBranch || []).filter((refund) => {
      const refundBranchId = getItemBranchId(refund);
      return !refundBranchId || !branchId || refundBranchId === String(branchId);
    }),
    [branchId, refundsByBranch]
  );

  const cashierShifts = useMemo(
    () => (shiftsByBranch || []).filter(
      (shift) => !getShiftEnd(shift) && (
        shift.cashier?.role === "ROLE_BRANCH_CASHIER" ||
        shift.role === "ROLE_BRANCH_CASHIER" ||
        (!shift.cashier?.role && !shift.role)
      )
    ),
    [shiftsByBranch]
  );

  const liveCashierShifts = useMemo(
    () => cashierShifts.map((shift) => enrichShiftWithLiveData(shift, liveOrders, liveRefunds)),
    [cashierShifts, liveOrders, liveRefunds]
  );

  const branchSummary = useMemo(() => buildCombinedCashierShift(liveCashierShifts), [liveCashierShifts]);

  const effectiveSelectedCashierId = selectedCashierId === "all" || liveCashierShifts.some((shift) => getCashierId(shift) === selectedCashierId)
    ? selectedCashierId
    : "all";

  const selectedShiftData = effectiveSelectedCashierId === "all"
    ? branchSummary
    : liveCashierShifts.find((shift) => getCashierId(shift) === effectiveSelectedCashierId) ?? null;

  const activeShiftCount = liveCashierShifts.length;
  const overtimeCount = liveCashierShifts.filter((shift) => getShiftStatus(shift).label === "Overtime").length;
  const detailLabel = effectiveSelectedCashierId === "all" ? "All active cashiers" : getCashierName(selectedShiftData);

  if (initialLoading && loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading shift data...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4">
          <div className="space-y-5">
            <div className="flex flex-col gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-950">Branch Shift Summary</h1>
                <p className="text-sm text-gray-500">Live cashier activity and branch sales control</p>
              </div>
              <EndShiftLogoutButton />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ShiftInformation />

              <Card className="rounded-lg py-0">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Branch Live Sales</h2>
                      <p className="text-xs text-gray-500">Combined sales from active cashier shifts</p>
                    </div>
                    <RefreshCw className="h-4 w-4 text-gray-400" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Orders</p>
                      <p className="mt-1 text-lg font-bold text-gray-950">{numberValue(branchSummary?.totalOrders)}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Gross Sales</p>
                      <p className="mt-1 text-lg font-bold text-gray-950">{money(branchSummary?.totalSales)}</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-3">
                      <p className="text-xs text-red-600">Refunds</p>
                      <p className="mt-1 text-lg font-bold text-red-700">{money(branchSummary?.totalRefunds)}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <p className="text-xs text-emerald-700">Net Sales</p>
                      <p className="mt-1 text-lg font-bold text-emerald-800">{money(branchSummary?.netSale)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatTile label="Active Cashiers" value={activeShiftCount} sub="Currently selling" icon={Users} tone="blue" />
              <StatTile label="Net Sales" value={money(branchSummary?.netSale)} sub="Active cashier shifts" icon={TrendingUp} tone="green" />
              <StatTile label="Transactions" value={numberValue(branchSummary?.totalOrders)} sub="Orders this shift" icon={ReceiptText} />
              <StatTile label="Needs Attention" value={overtimeCount} sub="Cashiers in overtime" icon={AlertTriangle} tone={overtimeCount > 0 ? "red" : "slate"} />
            </div>

            <CashierPerformanceTable
              shifts={liveCashierShifts}
              selectedCashierId={effectiveSelectedCashierId}
              onSelectCashier={setSelectedCashierId}
            />

            <div>
              <div className="mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900">Detail View: {detailLabel}</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PaymentSummaryCard shiftData={selectedShiftData} />
                <TopSellingItems shiftData={selectedShiftData} />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <RecentOrdersTable shiftData={selectedShiftData} />
              <RefundsTable shiftData={selectedShiftData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchShiftSummaryPage;
