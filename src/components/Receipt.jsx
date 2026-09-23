import { formatMoney } from "@/util/currency";

export const escapeHtml = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[c]);

const itemName = (item) => item.productName ?? item.product?.name ?? item.name ?? "Item";
const itemQty = (item) => item.quantity ?? 1;
const itemTotal = (item) =>
  Number(item.price ?? item.total ?? (item.unitPrice ?? 0) * itemQty(item)) || 0;

/**
 * Shared receipt printer for cashier flows (PaymentDialog success screen,
 * order-history reprint). Escapes all interpolated values.
 * Returns true when the print window opened, false when blocked.
 */
export function printOrderReceipt(order, { onBlocked } = {}) {
  const id = order?.id ?? order?._id ?? "";
  const receiptNumber = id ? `ORD-${id}` : "Order";
  const customerName =
    order?.customer?.fullName ?? order?.customerName ?? "Walk-in Customer";
  const payment = order?.paymentType ?? order?.paymentMethod ?? "";
  const date = order?.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString();
  const items = order?.items ?? order?.orderItems ?? [];
  const total = Number(order?.totalAmount ?? order?.total ?? 0) || 0;

  const rows = items
    .map(
      (it) =>
        `<p>${escapeHtml(itemName(it))} × ${escapeHtml(itemQty(it))} — ${escapeHtml(formatMoney(itemTotal(it)))}</p>`,
    )
    .join("");

  const w = window.open("", "_blank", "noopener,noreferrer,width=420,height=600");
  if (!w) {
    onBlocked?.();
    return false;
  }
  w.document.write(`<!doctype html><html><head><title>${escapeHtml(receiptNumber)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{font-size:20px;margin:0 0 8px}p{margin:6px 0}.total{font-size:20px;font-weight:700;margin-top:16px;border-top:1px dashed #777;padding-top:12px}</style></head><body><h1>Payment Receipt</h1><p>Order: ${escapeHtml(receiptNumber)}</p><p>Customer: ${escapeHtml(customerName)}</p><p>Payment: ${escapeHtml(payment)}</p><p>Date: ${escapeHtml(date)}</p>${rows}<p class="total">Total: ${escapeHtml(formatMoney(total))}</p><p>Thank you for your purchase.</p><script>window.print();window.onafterprint=()=>window.close();</script></body></html>`);
  w.document.close();
  return true;
}
