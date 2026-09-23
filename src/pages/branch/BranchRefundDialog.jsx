import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { createRefund } from "@/Redux Toolkit/Features/refund/refundThunk";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/**
 * Shared "Issue refund" dialog for branch scope (BranchOrders rows +
 * BranchRefunds page). Dispatches the existing branch-guarded
 * POST /api/refunds via createRefund.
 */
export default function BranchRefundDialog({ open, onClose, order, branchId, onIssued }) {
  const dispatch = useDispatch();
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const effectiveOrderId = order?.id ?? order?._id ?? orderId;
  const maxAmount = Number(order?.totalAmount ?? order?.grandTotal ?? 0) || undefined;

  const close = () => {
    if (!submitting) {
      setOrderId("");
      setAmount("");
      setReason("");
      onClose();
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!String(effectiveOrderId).trim()) {
      toast.error("Order ID is required");
      return;
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Refund amount must be greater than 0");
      return;
    }
    if (maxAmount && amt > maxAmount) {
      toast.error(`Refund cannot exceed order total (रु ${maxAmount.toLocaleString("en-IN")})`);
      return;
    }
    if (reason.trim().length < 5) {
      toast.error("Refund reason must be at least 5 characters");
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(createRefund({
        orderId: effectiveOrderId,
        branchId,
        amount: amt,
        reason: reason.trim(),
      })).unwrap();
      toast.success("Refund issued");
      close();
      onIssued?.();
    } catch (err) {
      toast.error(err || "Failed to issue refund");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Issue Refund</DialogTitle>
          <DialogDescription>
            {order ? `Order #${String(order.id ?? order._id ?? "").slice(-8)} • Total रु ${Number(order.totalAmount ?? 0).toLocaleString("en-IN")}` : "Refund a branch order"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 mt-2">
          {!order && (
            <div className="space-y-1.5">
              <Label>Order ID <span className="text-red-500">*</span></Label>
              <Input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Enter order ID" required />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Amount (रु) <span className="text-red-500">*</span></Label>
            <Input
              type="number" min="1" step="0.01" max={maxAmount}
              value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder={maxAmount ? `Max रु ${maxAmount.toLocaleString("en-IN")}` : "Refund amount"}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Reason <span className="text-red-500">*</span></Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this refund issued? (min 5 characters)" required rows={3} className="resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={close} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting} style={{ background: "#dc2626", color: "white", border: "none" }}>
              {submitting ? "Issuing…" : "Issue Refund"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
