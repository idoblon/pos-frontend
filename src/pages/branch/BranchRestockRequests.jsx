import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Package, Clock, CheckCircle, XCircle, AlertCircle, Truck, Plus } from "lucide-react";
import { getRestockRequestsByBranch, fulfillRestockRequest, createRestockRequest } from "@/Redux Toolkit/Features/restock/restockThunk";
import { getProductsByStore } from "@/Redux Toolkit/Features/product/productThunk";
import { getUserProfile } from "@/Redux Toolkit/Features/user/userThunk";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import secureStorage from "@/util/secureStorage";

const statusStyle = {
  PENDING: { background: "#fffbeb", color: "#d97706", icon: Clock, label: "Pending Review" },
  APPROVED: { background: "#f0fdf4", color: "#059669", icon: Truck, label: "Products Coming" },
  REJECTED: { background: "#fef2f2", color: "#e53e3e", icon: XCircle, label: "Rejected" },
  FULFILLED: { background: "#f0f0f0", color: "#1a1d23", icon: CheckCircle, label: "Received" },
};

const s = {
  page: { padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f5f5f5", minHeight: "100%" },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 10 },
  cardHeader: { padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" },

  th: { padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f5f5f5", textAlign: "left", borderBottom: "1px solid #e5e7eb" },
  td: { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #e5e7eb" },
};

export default function BranchRestockRequests() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requests: restockRequests, loading } = useSelector((s) => s.restock);
  const { products } = useSelector((s) => s.product);
  const { userProfile } = useSelector((s) => s.user);
  const { user } = useSelector((s) => s.auth);
  const userData = secureStorage.getUserData();
  const branchId = userData?.branchId || userProfile?.branchId || user?.branchId;
  const storeId = userData?.storeId || userProfile?.storeId || user?.storeId;

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fulfillDialogOpen, setFulfillDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [receivedQuantity, setReceivedQuantity] = useState("");
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [restockForm, setRestockForm] = useState({ productId: "", quantity: 50, notes: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = secureStorage.getToken();
    if (!token) {
      toast.error('Session expired. Please log in again.');
      navigate('/login');
      return;
    }
    if (!userProfile) dispatch(getUserProfile());
    if (branchId) dispatch(getRestockRequestsByBranch({ branchId }));
  }, [dispatch, branchId, navigate]);

  useEffect(() => {
    if (storeId) dispatch(getProductsByStore(storeId));
  }, [dispatch, storeId]);

  const handleMarkReceived = async () => {
    
    if (!receivedQuantity || receivedQuantity <= 0) {
      toast.error("Please enter the quantity received");
      return;
    }
    try {
      await dispatch(fulfillRestockRequest({ 
        requestId: selectedRequest.id,
        receivedQuantity: parseInt(receivedQuantity)
      })).unwrap();
      toast.success("Products marked as received - Inventory updated");
      setFulfillDialogOpen(false);
      setReceivedQuantity("");
      if (branchId) dispatch(getRestockRequestsByBranch({ branchId }));
    } catch (error) {
      toast.error(error || "Failed to mark as received");
    }
  };

  const openFulfillDialog = (request) => {
    setSelectedRequest(request);
    setReceivedQuantity(request.requestedQuantity?.toString() || "");
    setFulfillDialogOpen(true);
  };

  const productList = Array.isArray(products) ? products : (products?.content || []);

  const handleRestockRequest = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!branchId) { toast.error("Branch ID not found"); return; }
    if (!restockForm.quantity || Number(restockForm.quantity) <= 0) { toast.error("Please enter a valid quantity"); return; }
    if (!restockForm.notes || restockForm.notes.trim().length < 5) { toast.error("Please provide a justification (min 5 characters)"); return; }
    if (!restockForm.productId) { toast.error("Please select a product"); return; }
    setSubmitting(true);
    try {
      await dispatch(createRestockRequest({
        branchId: Number(branchId),
        productId: Number(restockForm.productId),
        requestedQuantity: Number(restockForm.quantity),
        notes: restockForm.notes.trim(),
        currentStock: 0,
      })).unwrap();
      toast.success("Restock request submitted to Store Admin");
      setRestockDialogOpen(false);
      setRestockForm({ productId: "", quantity: 50, notes: "" });
      if (branchId) dispatch(getRestockRequestsByBranch({ branchId }));
    } catch (error) {
      toast.error(error || "Failed to submit restock request");
    } finally {
      setSubmitting(false);
    }
  };

  const allRequests = restockRequests || [];
  const filtered = allRequests.filter((req) => statusFilter === "ALL" || req.status === statusFilter);
  const statusCounts = {
    PENDING: allRequests.filter(r => r.status === "PENDING").length,
    APPROVED: allRequests.filter(r => r.status === "APPROVED").length,
    FULFILLED: allRequests.filter(r => r.status === "FULFILLED").length,
    REJECTED: allRequests.filter(r => r.status === "REJECTED").length,
  };
  return (
    <div style={s.page}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Restock Requests</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>Track your inventory restock requests to Store Admin</p>
        </div>
        <button
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          onClick={() => { setRestockForm({ productId: "", quantity: 50, notes: "" }); setRestockDialogOpen(true); }}
        >
          <Plus size={14} /> Request Restock
        </button>
      </div>

      {/* Status Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        {[
          { label: "Pending Review", count: statusCounts.PENDING, color: "#d97706", bg: "#fffbeb" },
          { label: "Products Coming", count: statusCounts.APPROVED, color: "#059669", bg: "#f0fdf4" },
          { label: "Received", count: statusCounts.FULFILLED, color: "#1a1d23", bg: "#f0f0f0" },
          { label: "Rejected", count: statusCounts.REJECTED, color: "#e53e3e", bg: "#fef2f2" },
        ].map(({ label, count, color, bg }) => (
          <div key={label} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ padding: 6, background: bg, borderRadius: 6 }}>
                <Package size={16} color={color} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "#8a909c" }}>{label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 700, color }}>{count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Requests ({filtered?.length ?? 0})</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 13, background: "#f5f5f5", outline: "none", fontFamily: "inherit" }}
            >
              {["ALL", "PENDING", "APPROVED", "FULFILLED", "REJECTED"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {loading && <p style={{ textAlign: "center", padding: 40, color: "#8a909c" }}>Loading...</p>}

        {!loading && filtered?.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
            <AlertCircle size={36} color="#e2e5e9" style={{ margin: "0 auto 10px", display: "block" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No restock requests found</p>
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>Submit requests from the Inventory page when stock is low</p>
          </div>
        )}

        {filtered?.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Product", "Requested Qty", "Current Stock", "Status", "Date", "Notes", "Actions"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((req, i) => {
                  const status = statusStyle[req.status] || statusStyle.PENDING;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={req.id ?? req._id ?? i} style={{ background: "white" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                      onMouseLeave={e => e.currentTarget.style.background = "white"}
                    >
                      <td style={{ ...s.td, fontWeight: 600 }}>{req.productName ?? "—"}</td>
                      <td style={{ ...s.td, color: "#8a909c" }}>{req.requestedQuantity ?? "—"} units</td>
                      <td style={{ ...s.td, color: "#8a909c" }}>{req.currentStock ?? "—"} units</td>
                      <td style={s.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <StatusIcon size={12} color={status.color} />
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, ...status }}>
                            {status.label ?? req.status ?? "PENDING"}
                          </span>
                        </div>
                      </td>
                      <td style={{ ...s.td, color: "#8a909c" }}>
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </td>
                      <td style={{ ...s.td, color: "#8a909c", maxWidth: 200 }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={req.notes}>
                          {req.notes ?? "—"}
                        </div>
                      </td>
                      <td style={{ ...s.td, textAlign: "right" }}>
                        {req.status === "APPROVED" && (
                          <button 
                            style={{ 
                              background: "#059669", 
                              color: "white", 
                              border: "none", 
                              borderRadius: 6, 
                              padding: "6px 12px", 
                              fontSize: 12, 
                              fontWeight: 600, 
                              cursor: "pointer"
                            }}
                            onClick={() => openFulfillDialog(req)}
                          >
                            Mark as Received
                          </button>
                        )}
                        {req.status !== "APPROVED" && (
                          <span style={{ color: "#8a909c", fontSize: 12 }}>—</span>
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

      {/* Request Restock Dialog */}
      <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Restock</DialogTitle>
            <DialogDescription>Request a product from Store Admin</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRestockRequest} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Product <span className="text-red-500">*</span></Label>
              <select
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 13, background: "#f5f5f5", outline: "none" }}
                value={restockForm.productId}
                onChange={(e) => setRestockForm(f => ({ ...f, productId: e.target.value }))}
                required
              >
                <option value="">Select a product</option>
                {productList.map((p) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.name} {p.sku ? `(${p.sku})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Requested Quantity <span className="text-red-500">*</span></Label>
              <Input type="number" min="1" value={restockForm.quantity} onChange={(e) => setRestockForm(f => ({ ...f, quantity: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Notes / Justification <span className="text-red-500">*</span></Label>
              <Textarea
                value={restockForm.notes}
                onChange={(e) => setRestockForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Explain why this restock is needed..."
                required rows={3} className="resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setRestockDialogOpen(false)} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting} style={{ background: submitting ? "#9ca3af" : "linear-gradient(135deg,#1a1d23,#4a4d55)", color: "white", border: "none" }}>
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mark as Received Dialog */}
      <Dialog open={fulfillDialogOpen} onOpenChange={setFulfillDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Products as Received</DialogTitle>
            <DialogDescription>Confirm the actual quantity of products you physically received</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Product</Label>
                  <p className="font-semibold">{selectedRequest.productName}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Requested Quantity</Label>
                  <p className="font-semibold">{selectedRequest.requestedQuantity} units</p>
                </div>
              </div>
              <div>
                <Label>Actual Quantity Received <span className="text-red-500">*</span></Label>
                <Input 
                  type="number"
                  min="1"
                  value={receivedQuantity} 
                  onChange={(e) => setReceivedQuantity(e.target.value)} 
                  placeholder="Enter actual quantity received..."
                  required 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the exact quantity you physically received and counted. This may differ from the requested amount.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setFulfillDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleMarkReceived}>Update Inventory</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}