import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CreditCard, Download, ReceiptText, Store, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import api from "@/util/api";
import { getAllStores } from "@/Redux Toolkit/Features/Store/storeThunk";
import { getAllUsers } from "@/Redux Toolkit/Features/user/userThunk";
import { getAllOrders } from "@/Redux Toolkit/Features/order/orderThunk";
import { getAllRefund } from "@/Redux Toolkit/Features/refund/refundThunk";
import { getDaysRemaining, getSubscriptionExpiryDate, getSubscriptionPurchaseDate } from "@/util/subscriptionUtils";

const list = (value) => Array.isArray(value) ? value : value?.content || value?.data || [];
const id = (item) => String(item?.id ?? item?._id ?? "");
const money = (value) => `Rs ${Math.round(value || 0).toLocaleString()}`;
const amount = (item) => Number(item?.totalAmount ?? item?.grandTotal ?? item?.amount ?? item?.refundAmount ?? 0) || 0;
const storeId = (item) => String(item?.storeId ?? item?.store?.id ?? item?.branch?.storeId ?? item?.branch?.store?.id ?? "");
const date = (item) => new Date(item?.createdAt || item?.orderDate || item?.date || 0);

function Metric({ label, value, note, icon: Icon, color = "text-slate-900" }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex justify-between gap-3"><div><p className="text-xs font-medium text-slate-500">{label}</p><p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div><Icon size={19} className="text-slate-500" /></div></div>;
}

export default function SystemReports() {
  const dispatch = useDispatch();
  const { stores, loading } = useSelector((state) => state.store);
  const { users } = useSelector((state) => state.user);
  const { allOrders } = useSelector((state) => state.order);
  const { refunds } = useSelector((state) => state.refund);
  const [range, setRange] = useState("30");
  const [storeFilter, setStoreFilter] = useState("");
  const [server, setServer] = useState(null);

  useEffect(() => { dispatch(getAllStores()); dispatch(getAllUsers()); dispatch(getAllOrders()); dispatch(getAllRefund()); }, [dispatch]);

  // Server-aggregated overview (GET /api/admin/reports/overview). Falls back
  // to client-side aggregation when the backend is unreachable (live pending).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const days = Number(range);
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - days + 1);
        const params = {
          from: from.toISOString().slice(0, 10),
          to: to.toISOString().slice(0, 10),
        };
        if (storeFilter) params.storeId = storeFilter;
        const res = await api.get("/api/admin/reports/overview", { params });
        if (!cancelled) setServer(res.data);
      } catch {
        if (!cancelled) setServer(null);
      }
    })();
    return () => { cancelled = true; };
  }, [range, storeFilter]);

  const exportCsv = async () => {
    try {
      const days = Number(range);
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - days + 1);
      const params = new URLSearchParams({
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
      });
      if (storeFilter) params.set("storeId", storeFilter);
      const res = await api.get(`/api/admin/reports/export.csv?${params.toString()}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "admin-report.csv";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report exported");
    } catch {
      toast.error("Export failed — backend unreachable (demo)");
    }
  };

  const data = useMemo(() => {
    const allStores = list(stores); const days = Number(range);
    const from = new Date(); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - days + 1);
    const inRange = (item) => { const itemDate = date(item); return !Number.isNaN(itemDate.getTime()) && itemDate >= from; };
    const orders = list(allOrders).filter(inRange); const refundsInRange = list(refunds).filter(inRange);
    const sales = orders.reduce((sum, item) => sum + amount(item), 0); const refunded = refundsInRange.reduce((sum, item) => sum + amount(item), 0);
    const active = allStores.filter((store) => String(store?.status || "ACTIVE").toUpperCase() === "ACTIVE");
    const subscription = allStores.map((store) => { const purchase = getSubscriptionPurchaseDate(store); const expiry = getSubscriptionExpiryDate(store, purchase); return { store, daysLeft: expiry ? getDaysRemaining(expiry) : null }; });
    const expiring = subscription.filter((item) => item.daysLeft !== null && item.daysLeft >= 0 && item.daysLeft <= 30);
    const expired = subscription.filter((item) => item.daysLeft !== null && item.daysLeft < 0);
    const inactive = allStores.filter((store) => String(store?.status || "ACTIVE").toUpperCase() !== "ACTIVE");
    const topStores = allStores.map((store) => { const rows = orders.filter((order) => storeId(order) === id(store)); return { name: store?.brand || store?.name || `Store ${id(store)}`, sales: rows.reduce((sum, order) => sum + amount(order), 0) }; }).sort((a, b) => b.sales - a.sales);
    const trendDays = Math.min(days, 14); const trend = Array.from({ length: trendDays }, (_, index) => { const day = new Date(); day.setHours(0, 0, 0, 0); day.setDate(day.getDate() - trendDays + index + 1); const key = day.toDateString(); return { label: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }), sales: orders.filter((order) => date(order).toDateString() === key).reduce((sum, order) => sum + amount(order), 0) }; });
    return { allStores, orders, sales, refunded, active, expiring, expired, inactive, topStores, trend };
  }, [allOrders, range, refunds, stores]);

  const alerts = [
    ...data.expired.map(({ store }) => ({ text: `${store?.brand || store?.name || "Store"} subscription expired`, tone: "border-slate-300 bg-slate-100 text-slate-900" })),
    ...data.expiring.map(({ store, daysLeft }) => ({ text: `${store?.brand || store?.name || "Store"} expires in ${daysLeft} days`, tone: "border-slate-300 bg-slate-100 text-slate-900" })),
    ...data.inactive.map((store) => ({ text: `${store?.brand || store?.name || "Store"} is ${String(store?.status).toLowerCase()}`, tone: "border-slate-200 bg-slate-50 text-slate-700" })),
  ].slice(0, 6);

  return <div className="space-y-5 p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-xl font-bold text-slate-950">System Analytics</h1><p className="mt-1 text-sm text-slate-500">Platform health across all stores, subscriptions, users, and transactions.{server ? " Server-aggregated." : " Demo aggregation (backend unreachable)."}</p></div><div className="flex flex-wrap items-center gap-3"><label className="text-sm font-medium text-slate-700">Store <select className="ml-2 rounded-md border border-slate-300 bg-white px-3 py-2" value={storeFilter} onChange={(event) => setStoreFilter(event.target.value)}><option value="">All stores</option>{list(stores).map((s) => { const sid = String(s?.id ?? s?._id ?? ""); return <option key={sid} value={sid}>{s?.brand || s?.name || `Store ${sid}`}</option>; })}</select></label><label className="text-sm font-medium text-slate-700">Period <select className="ml-2 rounded-md border border-slate-300 bg-white px-3 py-2" value={range} onChange={(event) => setRange(event.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></label><button onClick={exportCsv} className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><Download size={14} /> Export CSV</button></div></div>
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Platform sales" value={money(data.sales)} note={`${data.orders.length} orders in period`} icon={TrendingUp} /><Metric label="Active stores" value={data.active.length} note={`${data.allStores.length} total stores`} icon={Store} /><Metric label="Platform users" value={list(users).length} note="All registered roles" icon={Users} /><Metric label="Subscription action" value={data.expiring.length + data.expired.length} note={`${data.expired.length} expired · ${data.expiring.length} expiring`} icon={CreditCard} /></section>
    {server && <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Server net sales" value={money(server.netSales)} note={`${server.orderCount} orders · ${server.refundCount} refunds`} icon={TrendingUp} /><Metric label="Server AOV" value={money(server.averageOrderValue)} note={`Refund rate ${(Number(server.refundRate || 0) * 100).toFixed(1)}%`} icon={ReceiptText} /><Metric label="Active stores (server)" value={server.activeStores} note={`${server.totalStores} total stores`} icon={Store} /><Metric label="Expiring / expired" value={`${server.expiring60d} / ${server.expired}`} note="60-day window" icon={CreditCard} /></section>}
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-5 xl:col-span-2"><h2 className="font-semibold text-slate-900">Sales trend</h2><p className="mb-4 text-xs text-slate-500">Daily platform sales</p><ResponsiveContainer width="100%" height={270}><AreaChart data={data.trend}><defs><linearGradient id="sales" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#1a1d23" stopOpacity={0.22} /><stop offset="95%" stopColor="#1a1d23" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 11 }} /><YAxis width={60} tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => money(value)} /><Area dataKey="sales" type="monotone" stroke="#1a1d23" strokeWidth={2} fill="url(#sales)" /></AreaChart></ResponsiveContainer></div><div className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">Operational alerts</h2><p className="mt-1 text-xs text-slate-500">Items needing POS-admin attention</p><div className="mt-4 space-y-3">{alerts.length ? alerts.map((alert, index) => <p key={`${alert.text}-${index}`} className={`rounded-lg border p-3 text-sm font-medium ${alert.tone}`}>{alert.text}</p>) : <p className="py-12 text-center text-sm text-slate-500">No platform alerts.</p>}</div></div></section>
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-5 xl:col-span-2"><h2 className="font-semibold text-slate-900">Top stores by sales</h2><p className="mb-4 text-xs text-slate-500">Selected-period transaction total</p>{data.topStores.some((store) => store.sales) ? <ResponsiveContainer width="100%" height={260}><BarChart data={data.topStores.slice(0, 8)} layout="vertical" margin={{ left: 16 }}><CartesianGrid horizontal={false} stroke="#e2e8f0" /><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => money(value)} /><Bar dataKey="sales" fill="#1e293b" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer> : <p className="py-20 text-center text-sm text-slate-500">No orders recorded in this period.</p>}</div><div className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">Platform quality</h2><div className="mt-5 space-y-4"><div className="flex justify-between"><span className="text-sm text-slate-600">Refund value</span><span className="font-semibold text-red-700">{money(data.refunded)}</span></div><div className="flex justify-between"><span className="text-sm text-slate-600">Refund rate</span><span className="font-semibold">{data.sales ? `${((data.refunded / data.sales) * 100).toFixed(1)}%` : "0%"}</span></div><div className="flex justify-between"><span className="text-sm text-slate-600">Average order</span><span className="font-semibold">{money(data.orders.length ? data.sales / data.orders.length : 0)}</span></div><div className="flex justify-between"><span className="text-sm text-slate-600">Inactive stores</span><span className="font-semibold">{data.inactive.length}</span></div></div></div></section>
    {loading && <p className="flex items-center gap-2 text-sm text-slate-500"><ReceiptText size={16} /> Loading system data…</p>}</div>;
}
