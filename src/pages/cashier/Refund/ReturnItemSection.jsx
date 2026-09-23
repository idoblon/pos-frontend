import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { createRefund } from "@/Redux Toolkit/Features/refund/refundThunk";
import { markOrderAsRefunded } from "@/Redux Toolkit/Features/order/orderSlice";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const returnReasons = [
  "Wrong product",
  "Damage product",
  "Not interested any more",
  "Other",
];

const refundMethods = ["CASH", "CARD", "ESEWA", "KHALTI"];

const itemName = (item, index) =>
  item.productName ?? item.product?.name ?? item.name ?? `Item ${index + 1}`;
const itemUnitPrice = (item) =>
  Number(item.unitPrice ?? (item.quantity ? item.price / item.quantity : item.price) ?? item.total ?? 0) || 0;
const itemMaxQty = (item) => Number(item.quantity ?? 1) || 1;

const ReturnItemSection = ({ selectedOrder, setShowReturnReciptDialog }) => {
  const dispatch = useDispatch();
  const [returnReason, setReturnReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("");
  const [loading, setLoading] = useState(false);

  const items = useMemo(
    () => selectedOrder?.items ?? selectedOrder?.orderItems ?? [],
    [selectedOrder],
  );
  const [returnQty, setReturnQty] = useState({});

  const qtyFor = (index) => {
    const raw = Number(returnQty[index]);
    if (!Number.isFinite(raw) || raw < 0) return 0;
    return Math.min(Math.floor(raw), itemMaxQty(items[index]));
  };

  const refundAmount = useMemo(() => {
    if (items.length === 0) {
      return Number(selectedOrder?.totalAmount ?? 0) || 0;
    }
    return items.reduce((sum, item, i) => sum + qtyFor(i) * itemUnitPrice(item), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, returnQty, selectedOrder]);
  const hasSelection = refundAmount > 0;

  const toggleItem = (index) => {
    setReturnQty((prev) => ({
      ...prev,
      [index]: qtyFor(index) > 0 ? 0 : itemMaxQty(items[index]),
    }));
  };

  const processRefund = async () => {
    if (!returnReason || !refundMethod) {
      toast.error("Please select return reason and refund method");
      return;
    }

    const finalReason = returnReason === "Other" ? otherReason : returnReason;
    if (!finalReason || finalReason.trim().length < 5) {
      toast.error("Reason must be at least 5 characters");
      return;
    }

    if (!hasSelection) {
      toast.error("Select at least one item quantity to return");
      return;
    }

    const orderTotal = Number(selectedOrder.totalAmount ?? 0) || 0;
    if (orderTotal > 0 && refundAmount - orderTotal > 0.005) {
      toast.error("Refund cannot exceed the order total");
      return;
    }

    setLoading(true);
    try {
      await dispatch(createRefund({
        orderId: selectedOrder.id ?? selectedOrder._id,
        amount: Math.round(refundAmount * 100) / 100,
        reason: finalReason.trim(),
        refundMethod,
        paymentType: refundMethod,
      })).unwrap();

      if (Math.abs(refundAmount - orderTotal) < 0.005) {
        dispatch(markOrderAsRefunded({ orderId: selectedOrder.id ?? selectedOrder._id }));
      }

      toast.success("Refund processed — items restored to inventory.");
      setShowReturnReciptDialog(true);
    } catch (error) {
      toast.error("Failed to process refund: " + error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-4 w-1/2">
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Select items to return</Label>
              {items.length === 0 ? (
                <p style={{ fontSize: 12, color: "#8a909c" }}>No line items on this order — full-total refund will be used.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                      <input
                        type="checkbox"
                        checked={qtyFor(i) > 0}
                        onChange={() => toggleItem(i)}
                        aria-label={`Return ${itemName(item, i)}`}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{itemName(item, i)}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>
                          रु {itemUnitPrice(item).toLocaleString("en-IN")} × {itemMaxQty(item)} ordered
                        </p>
                      </div>
                      <Input
                        type="number" min={0} max={itemMaxQty(item)} step={1}
                        value={returnQty[i] ?? ""}
                        placeholder="0"
                        onChange={(e) => setReturnQty((prev) => ({ ...prev, [i]: e.target.value }))}
                        style={{ width: 72 }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label className="mb-2 block">Return Reason</Label>
              <Select
                value={returnReason}
                onValueChange={(value) => setReturnReason(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Reason..." />
                </SelectTrigger>
                <SelectContent>
                  {returnReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {returnReason === "Other" && (
              <div>
                <Label className="block mb-2">Specify reason</Label>
                <Textarea
                  id="other-reason"
                  placeholder="please specify the return reason"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                />
              </div>
            )}
            <div>
              <Label className="mb-2 block">Refund Method</Label>
              <Select
                value={refundMethod}
                onValueChange={(value) => setRefundMethod(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Refund Method..." />
                </SelectTrigger>
                <SelectContent>
                  {refundMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4 border-t mt-4">
              <div className="flex justify-between text-lg font-semibold mb-4">
                <span>Total Refund Amount: रु {refundAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <Button onClick={processRefund} className="w-full py-6" disabled={loading || (!hasSelection && items.length > 0)}>
                {loading ? "Processing..." : "Process Refund"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnItemSection;
