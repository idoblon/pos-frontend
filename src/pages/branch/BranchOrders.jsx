import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, ShoppingBag, RotateCcw, Eye } from "lucide-react";
import { getOrdersByBranch, getOrderById } from "@/Redux Toolkit/Features/order/orderThunk";
import { getRefundsByBranch } from "@/Redux Toolkit/Features/refund/refundThunk";
import useBranchContext from "@/hooks/useBranchContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import BranchRefundDialog from "@/pages/branch/BranchRefundDialog";

const statusStyle = {
  PENDING: { background: "#fffbeb", color: "#92400e" },
  HELD: { background: "#f5f5f5", color: "#6b7280" },
  RESUMED: { background: "#eff6ff", color: "#1d4ed8" },
  COMPLETED: { background: "#f0fdf4", color: "#166534" },
  CANCELLED: { background: "#f5f5f5", color: "#6b7280" },
  REFUNDED: { background: "#fef2f2", color: "#dc2626" },
};

const s = {
  page:        { padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f5f5f5", minHeight: "100%" },
  card:        { background: "white", border: "1px solid #e5e7eb", borderRadius: 10 },
  cardHeader:  { padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" },
  searchInput: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px 7px 34px", fontFamily: "inherit", fontSize: 13, outline: "none", background: "#f5f5f5", boxSizing: "border-box" },
  th:          { padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f5f5f5", textAlign: "left", borderBottom: "1px solid #e5e7eb" },
  td:          { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #e5e7eb" },
};

export default function BranchOrders() {
  const dispatch = useDispatch();
  const { branchId } = useBranchContext();
  const { orders, loading } = useSelector((s) => s.order);
  const { refundsByBranch: refunds } = useSelector((s) => s.refund);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refundOrder, setRefundOrder] = useState(null);

  useEffect(() => {
    if (branchId) {
      dispatch(getOrdersByBranch({ branchId }));

      // Also fetch existing refunds to mark orders as refunded
      dispatch(getRefundsByBranch(branchId));
    }
  }, [dispatch, branchId]);

  const refundedOrderIds = new Set(
    (refunds || []).map((r) => String(r.orderId ?? r.order?.id ?? "")),
  );

  const displayStatus = (o) => {
    if (refundedOrderIds.has(String(o.id ?? o._id ?? ""))) return "REFUNDED";
    return String(o.status || "COMPLETED").toUpperCase();
  };

  const filtered = orders?.filter((o) => {
    const matchSearch = (o.id ?? o._id ?? "").toString().includes(search) ||
      (o.customerName ?? "").toLowerCase().includes(search.toLowerCase());

    const actualStatus = displayStatus(o);

    const matchStatus = statusFilter === "ALL" || actualStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const openDetail = async (o) => {
    const id = o.id ?? o._id;
    setSelectedOrder(o);
    setDetailOpen(true);
    if (!id) return;
    setDetailLoading(true);
    try {
      const full = await dispatch(getOrderById(id)).unwrap();
      setSelectedOrder(full || o);
    } catch {
      // keep the row data as fallback
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshAll = () => {
    if (branchId) {
      dispatch(getOrdersByBranch({ branchId }));
      dispatch(getRefundsByBranch(branchId));
    }
  };

  return (
    <div style={s.page}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Orders & Transactions</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>All branch orders and payment details</p>

      </div>

      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Orders ({filtered?.length ?? 0})</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 13, background: "#f5f5f5", outline: "none", fontFamily: "inherit" }}
            >
              {["ALL", "PENDING", "HELD", "RESUMED", "COMPLETED", "CANCELLED", "REFUNDED"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div style={{ position: "relative", width: 240 }}>
              <Search size={14} color="#8a909c" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input style={s.searchInput} placeholder="Search by order ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {loading && <p style={{ textAlign: "center", padding: 40, color: "#8a909c" }}>Loading...</p>}

        {!loading && filtered?.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
            <ShoppingBag size={36} color="#e2e5e9" style={{ margin: "0 auto 10px", display: "block" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No orders found</p>
          </div>
        )}

        {filtered?.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Order ID", "Date", "Cashier", "Items", "Payment", "Status", "Total", "Actions"].map((h, i) => (
                      <th key={h} style={{ ...s.th, textAlign: i === 6 ? "right" : "left" }}>{h}</th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {filtered.map((o, i) => {
                   const actualStatus = displayStatus(o);

                   return (
                   <tr key={o.id ?? o._id ?? i} style={{ background: "white" }}
                     onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                     onMouseLeave={e => e.currentTarget.style.background = "white"}
                   >
                     <td style={{ ...s.td, fontWeight: 600 }}>#{(o.id ?? o._id ?? "").toString().slice(-8)}</td>
                     <td style={{ ...s.td, color: "#8a909c" }}>
                       {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                     </td>
                     <td style={{ ...s.td, color: "#1a1d23", fontWeight: 500 }}>{o.cashier?.fullName ?? o.cashierName ?? "—"}</td>
                     <td style={{ ...s.td, color: "#8a909c" }}>{o.items?.length ?? o.orderItems?.length ?? "—"}</td>
                     <td style={{ ...s.td, color: "#8a909c" }}>{o.paymentType ?? o.paymentMethod ?? "—"}</td>
                     <td style={s.td}>
                       <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, ...(statusStyle[actualStatus] ?? { background: "#eef1f5", color: "#6b7280" }) }}>
                         {actualStatus}
                       </span>
                     </td>
                     <td style={{ ...s.td, textAlign: "right", fontWeight: 700, color: "#1a1d23" }}>
                       रु {(o.totalAmount ?? 0).toLocaleString("en-IN")}
                       {o.refundedAmount > 0 && (
                         <div style={{ fontSize: 10, color: "#dc2626", fontWeight: 400 }}>
                           Refunded: रु {o.refundedAmount.toLocaleString("en-IN")}
                         </div>
                       )}
                     </td>
                     <td style={{ ...s.td, textAlign: "right", whiteSpace: "nowrap" }}>
                       <button
                         onClick={() => openDetail(o)}
                         title="View order detail"
                         style={{ border: "1px solid #e5e7eb", background: "white", borderRadius: 6, padding: "4px 6px", cursor: "pointer", marginRight: 6 }}
                       >
                         <Eye size={13} color="#6b7280" />
                       </button>
                       {actualStatus !== "REFUNDED" && (
                         <button
                           onClick={() => setRefundOrder(o)}
                           title="Issue refund"
                           style={{ border: "1px solid #fecaca", background: "white", borderRadius: 6, padding: "4px 6px", cursor: "pointer" }}
                         >
                           <RotateCcw size={13} color="#dc2626" />
                         </button>
                       )}
                     </td>
                   </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
         )}
       </div>

       <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
         <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle>Order #{String(selectedOrder?.id ?? selectedOrder?._id ?? "").slice(-8)}</DialogTitle>
             <DialogDescription>
               {selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("en-IN") : ""} • {selectedOrder?.paymentType ?? selectedOrder?.paymentMethod ?? ""} • {selectedOrder ? displayStatus(selectedOrder) : ""}
             </DialogDescription>
           </DialogHeader>
           {detailLoading ? (
             <p style={{ fontSize: 13, color: "#8a909c" }}>Loading…</p>
           ) : (
             <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
               <div style={{ display: "flex", justifyContent: "space-between" }}>
                 <span style={{ color: "#8a909c" }}>Cashier</span>
                 <strong>{selectedOrder?.cashier?.fullName ?? selectedOrder?.cashierName ?? "—"}</strong>
               </div>
               <div style={{ display: "flex", justifyContent: "space-between" }}>
                 <span style={{ color: "#8a909c" }}>Customer</span>
                 <strong>{selectedOrder?.customerName ?? selectedOrder?.customer?.fullName ?? "—"}</strong>
               </div>
               {(selectedOrder?.items ?? selectedOrder?.orderItems ?? []).map((it, idx) => (
                 <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "#f5f5f5", borderRadius: 6 }}>
                   <span>{it.productName ?? it.product?.name ?? `Item ${idx + 1}`} × {it.quantity ?? 1}</span>
                   <strong>रु {Number(it.price ?? it.total ?? 0).toLocaleString("en-IN")}</strong>
                 </div>
               ))}
               {selectedOrder?.discount ? (
                 <div style={{ display: "flex", justifyContent: "space-between" }}>
                   <span style={{ color: "#8a909c" }}>Discount</span>
                   <strong>− रु {Number(selectedOrder.discount).toLocaleString("en-IN")}</strong>
                 </div>
               ) : null}
               {selectedOrder?.note ? (
                 <p style={{ margin: 0, color: "#8a909c" }}>Note: {selectedOrder.note}</p>
               ) : null}
               <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: 10 }}>
                 <span style={{ color: "#8a909c" }}>Total</span>
                 <strong>रु {Number(selectedOrder?.totalAmount ?? 0).toLocaleString("en-IN")}</strong>
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>

       <BranchRefundDialog
         open={!!refundOrder}
         onClose={() => setRefundOrder(null)}
         order={refundOrder}
         branchId={branchId}
         onIssued={refreshAll}
       />
     </div>
   );
 }