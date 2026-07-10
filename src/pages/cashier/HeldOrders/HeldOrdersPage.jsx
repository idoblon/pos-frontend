import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  discardHeldOrder,
  restoreHeldOrder,
  selectCartItems,
  selectHeldOrders,
} from "@/Redux Toolkit/Features/Cart/cartSlice";
import { formatMoney } from "@/util/currency";

const orderTotal = (order) => order.items.reduce(
  (total, item) => total + (Number(item.price || item.sellingPrice) || 0) * (item.quantity || 1),
  0,
);

export default function HeldOrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const heldOrders = useSelector(selectHeldOrders);
  const activeCart = useSelector(selectCartItems);

  const restore = (order) => {
    if (activeCart.length) {
      toast.error("Finish, clear, or hold the current cart before retrieving another order.");
      return;
    }
    dispatch(restoreHeldOrder(order.id));
    toast.success("Held order restored to the POS terminal.");
    navigate("/cashier");
  };

  const discard = (order) => {
    if (window.confirm("Discard this held order? This cannot be undone.")) {
      dispatch(discardHeldOrder(order.id));
      toast.success("Held order discarded.");
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-7">
      <div className="w-full">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><Archive size={24} /> Held Orders</h1>
            <p className="mt-1 text-sm text-slate-600">Parked carts are saved on this device and can be resumed at the register.</p>
          </div>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">{heldOrders.length} held</span>
        </div>

        {heldOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <Archive className="mx-auto mb-3 text-slate-400" size={36} />
            <h2 className="font-semibold text-slate-800">No held orders</h2>
            <p className="mt-1 text-sm text-slate-500">Use Hold in the POS terminal when you need to serve another customer.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {heldOrders.map((order, index) => {
              const quantity = order.items.reduce((count, item) => count + (item.quantity || 1), 0);
              const customerName = order.selectedCustomer?.fullName || "Walk-in customer";
              return (
                <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Held order #{index + 1}</p>
                      <h2 className="mt-1 font-semibold text-slate-900">{customerName}</h2>
                      <p className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="font-bold text-slate-900">{formatMoney(orderTotal(order))}</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">{quantity} items · {order.items.slice(0, 2).map((item) => item.name).join(", ")}{order.items.length > 2 ? "…" : ""}</p>
                  {order.note && <p className="mt-2 rounded-md bg-slate-50 p-2 text-xs text-slate-600">Note: {order.note}</p>}
                  <div className="mt-5 flex gap-2">
                    <button onClick={() => restore(order)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"><RotateCcw size={15} /> Resume</button>
                    <button onClick={() => discard(order)} aria-label={`Discard held order ${index + 1}`} title="Discard order" className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50"><Trash2 size={16} /></button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
