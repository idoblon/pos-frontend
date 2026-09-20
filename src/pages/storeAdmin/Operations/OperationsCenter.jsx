import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, CircleAlert, HeartPulse, ShieldAlert } from "lucide-react";
import { getBranchesByStore } from "@/Redux Toolkit/Features/branch/branchThunk";
import { findStoreEmployee } from "@/Redux Toolkit/Features/Employee/employeeThunk";
import { getOrdersByStore } from "@/Redux Toolkit/Features/order/orderThunk";
import { getRefundsByStore } from "@/Redux Toolkit/Features/refund/refundThunk";
import { getShiftsByStore } from "@/Redux Toolkit/Features/shiftReport/shiftReportThunk";
import secureStorage from "@/util/secureStorage";

const collection = (value) => Array.isArray(value) ? value : value?.content || value?.data || [];
const id = (item) => String(item?.id ?? item?._id ?? item?.userId ?? "");
const branchId = (item) => String(item?.branchId ?? item?.branch?.id ?? item?.branch?._id ?? "");
const staffId = (item) => String(item?.cashierId ?? item?.employeeId ?? item?.userId ?? item?.cashier?.id ?? item?.employee?.id ?? "");
const amount = (item) => Number(item?.totalAmount ?? item?.grandTotal ?? item?.amount ?? item?.refundAmount ?? 0) || 0;
const money = (value) => `Rs ${Math.round(value || 0).toLocaleString()}`;
const hoursSince = (date) => date ? (Date.now() - new Date(date).getTime()) / 36e5 : 0;
const isInLast30Days = (item) => {
  const date = new Date(item?.createdAt || item?.shiftStart || item?.startTime || 0);
  return !Number.isNaN(date.getTime()) && date >= new Date(Date.now() - 30 * 24 * 36e5);
};
const isInCurrentMonth = (item) => {
  const date = new Date(item?.createdAt || item?.shiftStart || item?.startTime || 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  return !Number.isNaN(date.getTime()) && date >= monthStart;
};

function Score({ value }) {
  const color = value >= 80 ? "#047857" : value >= 60 ? "#b45309" : "#b91c1c";
  return <span style={{ color, fontWeight: 800 }}>{value}/100</span>;
}

function TargetStatus({ target, sales }) {
  if (!target) return <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">Not set</span>;
  if (sales >= target) return <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">Achieved</span>;
  if (!sales) return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">No sales · 0%</span>;
  const attainment = Math.min(100, Math.round((sales / target) * 100));
  return <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">Not achieved · {attainment}%</span>;
}

export default function OperationsCenter() {
  const dispatch = useDispatch();
  const storeId = secureStorage.getUserData()?.storeId;
  const { branches } = useSelector((state) => state.branch);
  const { employees } = useSelector((state) => state.employee);
  const { storeOrders } = useSelector((state) => state.order);
  const { refundsByStore } = useSelector((state) => state.refund);
  const { shiftsByStore } = useSelector((state) => state.shiftReport);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;
    Promise.all([
      dispatch(getBranchesByStore(storeId)), dispatch(findStoreEmployee({ storeId })),
      dispatch(getOrdersByStore(storeId)), dispatch(getRefundsByStore(storeId)), dispatch(getShiftsByStore(storeId)),
    ]).finally(() => setLoading(false));
  }, [dispatch, storeId]);

  const data = useMemo(() => ({
    branches: collection(branches), employees: collection(employees),
    orders: collection(storeOrders).filter(isInLast30Days),
    refunds: collection(refundsByStore).filter(isInLast30Days),
    shifts: collection(shiftsByStore).filter(isInLast30Days),
  }), [branches, employees, refundsByStore, shiftsByStore, storeOrders]);

  const health = useMemo(() => data.branches.map((branch) => {
    const currentBranchId = id(branch);
    const orders = data.orders.filter((order) => branchId(order) === currentBranchId && isInCurrentMonth(order));
    const refunds = data.refunds.filter((refund) => branchId(refund) === currentBranchId && isInCurrentMonth(refund));
    const shifts = data.shifts.filter((shift) => branchId(shift) === currentBranchId && isInCurrentMonth(shift));
    const sales = orders.reduce((sum, order) => sum + amount(order), 0);
    const refunded = refunds.reduce((sum, refund) => sum + amount(refund), 0);
    const refundRate = sales ? refunded / sales : 0;
    const overtime = shifts.filter((shift) => !shift.shiftEnd && hoursSince(shift.shiftStart || shift.startTime || shift.createdAt) >= 9).length;
    const target = Math.max(0, Number(branch.monthlySalesTarget) || 0);
    const hasSales = sales > 0;
    let score = hasSales && target > 0 ? Math.min(100, Math.round((sales / target) * 100)) : 0;
    const reasons = [];
    if (!target) reasons.push("Set a monthly sales target");
    else if (!hasSales) reasons.push("No sales this month — health score is 0");
    else if (sales >= target) reasons.push("Monthly target achieved");
    else reasons.push(`${Math.round((sales / target) * 100)}% of monthly target`);
    if (refundRate > 0.1) { score -= 25; reasons.push("Refund rate over 10%"); }
    else if (refundRate > 0.03) { score -= 10; reasons.push("Elevated refunds"); }
    if (overtime) { score -= Math.min(20, overtime * 10); reasons.push(`${overtime} overtime shift${overtime > 1 ? "s" : ""}`); }
    // A branch without sales always has a zero health score, irrespective of
    // targets, refunds, or open shifts.
    if (!hasSales) score = 0;
    return { branch, score: Math.max(score, 0), sales, target, orders: orders.length, refunded, reasons };
  }), [data]);

  const exceptions = useMemo(() => {
    const staff = new Map();
    data.employees.forEach((employee) => staff.set(id(employee), employee));
    const ids = new Set([...data.orders.map(staffId), ...data.refunds.map(staffId)].filter(Boolean));
    return [...ids].map((employeeId) => {
      const orders = data.orders.filter((order) => staffId(order) === employeeId);
      const refunds = data.refunds.filter((refund) => staffId(refund) === employeeId);
      const sales = orders.reduce((sum, order) => sum + amount(order), 0);
      const refunded = refunds.reduce((sum, refund) => sum + amount(refund), 0);
      const reasons = [];
      if (refunds.length >= 3) reasons.push(`${refunds.length} refunds`);
      if (sales && refunded / sales > 0.1) reasons.push("refund value over 10% of sales");
      const person = staff.get(employeeId);
      return { employeeId, name: person?.fullName || person?.username || `Staff #${employeeId}`, branch: person?.branch?.name || "Assigned branch", orders: orders.length, sales, refunded, reasons };
    }).filter((item) => item.reasons.length).sort((a, b) => b.refunded - a.refunded);
  }, [data]);

  if (!storeId) return <p className="p-6 text-sm text-gray-500">Your account is not linked to a store.</p>;
  return (
    <div className="space-y-5 p-5">
      <div><h1 className="text-xl font-bold text-gray-950">Operations Center</h1><p className="mt-1 text-sm text-gray-500">Branch health uses this month’s sales target, refunds, and overtime shifts.</p></div>
      {loading ? <p className="text-sm text-gray-500">Loading operations data…</p> : <>
        <section className="rounded-xl border bg-white">
          <div className="flex items-center gap-2 border-b p-4"><HeartPulse size={18} /><div><h2 className="font-semibold">Branch health</h2><p className="text-xs text-gray-500">Monthly target attainment sets the base score; refunds and overtime reduce it.</p></div></div>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-left text-xs text-gray-500"><tr><th className="p-3">Branch</th><th className="p-3">Health</th><th className="p-3">Sales</th><th className="p-3">Target</th><th className="p-3">Target status</th><th className="p-3">Orders</th><th className="p-3">Refunds</th><th className="p-3">Needs attention</th></tr></thead><tbody>
            {health.map((row) => <tr key={id(row.branch)} className="border-t"><td className="p-3 font-medium">{row.branch.name || `Branch ${id(row.branch)}`}</td><td className="p-3"><Score value={row.score} /></td><td className="p-3">{money(row.sales)}</td><td className="p-3">{row.target ? money(row.target) : "Not set"}</td><td className="p-3"><TargetStatus target={row.target} sales={row.sales} /></td><td className="p-3">{row.orders}</td><td className="p-3 text-red-700">{money(row.refunded)}</td><td className="p-3 text-xs text-gray-600">{row.reasons.join(" · ") || "Operating normally"}</td></tr>)}
            {!health.length && <tr><td colSpan="8" className="p-8 text-center text-gray-500">No branch data found.</td></tr>}
          </tbody></table></div>
        </section>
        <section className="rounded-xl border bg-white">
          <div className="flex items-center gap-2 border-b p-4"><ShieldAlert size={18} /><div><h2 className="font-semibold">Cashier exceptions</h2><p className="text-xs text-gray-500">Flags staff with three or more refunds, or refund value above 10% of their recorded sales.</p></div></div>
          {exceptions.length ? <div className="divide-y">{exceptions.map((item) => <div className="flex flex-wrap items-center justify-between gap-3 p-4" key={item.employeeId}><div className="flex items-center gap-3"><CircleAlert size={18} className="text-amber-600" /><div><p className="font-medium">{item.name}</p><p className="text-xs text-gray-500">{item.branch} · {item.orders} orders · {money(item.sales)} sales</p></div></div><div className="text-right"><p className="text-sm font-semibold text-red-700">{money(item.refunded)} refunded</p><p className="text-xs text-gray-500">{item.reasons.join(" · ")}</p></div></div>)}</div> : <div className="flex items-center gap-2 p-6 text-sm text-gray-500"><AlertTriangle size={16} />No cashier exceptions currently meet the alert threshold.</div>}
        </section>
      </>}
    </div>
  );
}
