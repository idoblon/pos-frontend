import { useEffect, useMemo } from "react";
import { Target } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getBranchById, getBranchesByStore } from "@/Redux Toolkit/Features/branch/branchThunk";
import { getOrdersByBranch } from "@/Redux Toolkit/Features/order/orderThunk";
import secureStorage from "@/util/secureStorage";

const money = (value) => `Rs ${Math.round(value || 0).toLocaleString()}`;

export default function BranchSalesTargetCard() {
  const dispatch = useDispatch();
  const userData = secureStorage.getUserData();
  const branchId = userData?.branchId;
  const storeId = userData?.storeId;
  const { branch, branches } = useSelector((state) => state.branch);
  const { orders } = useSelector((state) => state.order);

  useEffect(() => {
    if (!branchId) return undefined;
    const refresh = () => {
      dispatch(getBranchById(branchId));
      // The store list is the source used by the store admin when updating a
      // target, so it also provides a reliable fallback if the detail endpoint
      // returns an older branch projection.
      if (storeId) dispatch(getBranchesByStore(storeId));
      dispatch(getOrdersByBranch({ branchId }));
    };
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [branchId, dispatch, storeId]);

  const { sales, target } = useMemo(() => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const sales = (orders || [])
      .filter((order) => order?.createdAt && new Date(order.createdAt) >= monthStart)
      .reduce((sum, order) => sum + (Number(order.totalAmount ?? order.grandTotal ?? order.amount) || 0), 0);
    const listedBranch = (branches || []).find((item) => String(item?.id ?? item?._id) === String(branchId));
    const targetBranch = listedBranch || branch;
    return { sales, target: Math.max(0, Number(targetBranch?.monthlySalesTarget) || 0) };
  }, [branch?.monthlySalesTarget, branchId, branches, orders]);

  if (!branchId) return null;
  if (!target) return <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">Monthly sales target not set</p><p className="mt-1 text-xs">Ask your store admin to set this branch’s target.</p></div>;

  const progress = Math.min(100, Math.round((sales / target) * 100));
  const remaining = Math.max(0, target - sales);
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><p className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Target size={16} /> Monthly sales target</p><p className="mt-1 text-xs text-slate-500">Current month, refreshed automatically</p></div><span className="text-lg font-bold text-slate-900">{progress}%</span></div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} /></div>
      <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm"><span className="font-medium text-slate-900">{money(sales)} <span className="font-normal text-slate-500">of {money(target)}</span></span><span className={remaining ? "text-slate-600" : "font-semibold text-emerald-700"}>{remaining ? `${money(remaining)} to go` : "Target achieved"}</span></div>
    </section>
  );
}
