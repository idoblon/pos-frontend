import { formatMoney } from "@/util/currency";

export const escapeHtml = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[c]);

const itemName = (item) => item.productName ?? item.product?.name ?? item.name ?? "Item";
const itemQty = (item) => item.quantity ?? 1;
const itemTotal = (item) =>
  Number(item.price ?? item.total ?? (item.unitPrice ?? 0) * itemQty(item)) || 0;

const openPrintWindow = (title, bodyHtml, { onBlocked } = {}) => {
  const w = window.open("", "_blank", "noopener,noreferrer,width=420,height=600");
  if (!w) {
    onBlocked?.();
    return null;
  }
  w.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{font-size:20px;margin:0 0 8px}p{margin:6px 0}.total{font-size:20px;font-weight:700;margin-top:16px;border-top:1px dashed #777;padding-top:12px}.meta{font-size:12px;color:#555}.badge{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;background:#f1f5f9;margin-right:4px}</style></head><body>${bodyHtml}<script>window.print();window.onafterprint=()=>window.close();</script></body></html>`);
  w.document.close();
  return w;
};

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
  const orderType = order?.orderType ?? "";
  const table = order?.tableNumber ?? "";
  const emi = order?.emiMonths ? `${order.emiMonths}mo EMI` : "";

  const rows = items
    .map((it) => {
      const extras = [
        Array.isArray(it.modifiers) && it.modifiers.length ? `(${it.modifiers.join(", ")})` : "",
        it.dosage ? `[${it.dosage}]` : "",
        Array.isArray(it.serials) && it.serials.length ? `SN:${it.serials.join(",")}` : "",
        it.warrantyMonths ? `${it.warrantyMonths}mo warranty` : "",
      ].filter(Boolean).join(" ");
      return `<p>${escapeHtml(itemName(it))} × ${escapeHtml(itemQty(it))} — ${escapeHtml(formatMoney(itemTotal(it)))}${extras ? ` <span class="meta">${escapeHtml(extras)}</span>` : ""}</p>`;
    })
    .join("");

  const headerMeta = [orderType?.replace?.("_", " "), table ? `Table ${table}` : "", emi, payment]
    .filter(Boolean).map((m) => `<span class="badge">${escapeHtml(m)}</span>`).join("");

  const ok = openPrintWindow(
    receiptNumber,
    `<h1>Payment Receipt</h1><p>Order: ${escapeHtml(receiptNumber)}</p><p>Customer: ${escapeHtml(customerName)}</p><p>${headerMeta}</p><p>Date: ${escapeHtml(date)}</p>${rows}<p class="total">Total: ${escapeHtml(formatMoney(total))}</p><p>Thank you for your purchase.</p>`,
    { onBlocked },
  );
  return !!ok;
}

// Kitchen Order Ticket — groups by kitchenStation, shows modifiers + table.
export function printKitchenTicket({ items = [], tableNumber = "", orderType = "", kitchenNote = "" } = {}, opts = {}) {
  const byStation = new Map();
  for (const it of items) {
    const key = it.kitchenStation || it.product?.kitchenStation || "Kitchen";
    if (!byStation.has(key)) byStation.set(key, []);
    byStation.get(key).push(it);
  }
  const sections = [...byStation.entries()].map(([station, list]) => {
    const rows = list.map((it) => {
      const mods = Array.isArray(it.modifiers) && it.modifiers.length ? ` (${it.modifiers.join(", ")})` : "";
      const note = it.kitchenNote ? ` — *${it.kitchenNote}*` : "";
      return `<p><strong>${escapeHtml(itemQty(it))}×</strong> ${escapeHtml(itemName(it))}${escapeHtml(mods)}${escapeHtml(note)}</p>`;
    }).join("");
    return `<h2 style="font-size:15px;margin:12px 0 4px">${escapeHtml(station)}</h2>${rows}`;
  }).join("");
  return !!openPrintWindow(
    `KOT${tableNumber ? `-${tableNumber}` : ""}`,
    `<h1>KOT ${tableNumber ? `· Table ${escapeHtml(tableNumber)}` : ""}</h1><p class="meta">${escapeHtml(orderType?.replace?.("_", " ") || "")} · ${escapeHtml(new Date().toLocaleString())}</p>${kitchenNote ? `<p><strong>Note:</strong> ${escapeHtml(kitchenNote)}</p>` : ""}${sections}`,
    opts,
  );
}

export function printWarrantyCard({ items = [], customerName = "", orderId = "" } = {}, opts = {}) {
  const rows = items
    .filter((it) => it.warrantyMonths || (it.serials || []).length)
    .map((it) => `<p>${escapeHtml(itemName(it))} — ${escapeHtml((it.serials || []).join(", ") || "N/A")} · ${escapeHtml(it.warrantyMonths || "-")} months</p>`)
    .join("") || "<p>No warranty items.</p>";
  return !!openPrintWindow(
    `Warranty-${orderId}`,
    `<h1>Warranty Card</h1><p>Order: ${escapeHtml(orderId)}</p><p>Customer: ${escapeHtml(customerName)}</p>${rows}<p class="meta">Present this card for service claims.</p>`,
    opts,
  );
}

export function printCareCard({ items = [], orderId = "" } = {}, opts = {}) {
  const rows = items
    .filter((it) => it.careInstructions || it.product?.careInstructions)
    .map((it) => `<p><strong>${escapeHtml(itemName(it))}</strong><br/>${escapeHtml(it.careInstructions || it.product?.careInstructions || "")}${it.guaranteeDays ? ` · ${it.guaranteeDays}-day guarantee` : ""}</p>`)
    .join("") || "<p>No care instructions.</p>";
  return !!openPrintWindow(`Care-${orderId}`, `<h1>Plant Care Card</h1>${rows}`, opts);
}
