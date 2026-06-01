import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Truck, Clock, CheckCircle, XCircle, AlertTriangle, Eye } from "lucide-react";
import { getRestockRequestsByStore, approveRestockRequest, rejectRestockRequest, batchApproveRequests } from "@/Redux Toolkit/Features/restock/restockThunk";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import secureStorage from "@/util/secureStorage";

const statusStyle = {
  PENDING: { background: "#fffbeb", color: "#d97706", icon: Clock },
  APPROVED: { background: "#f0fdf4", color: "#059669", icon: CheckCircle },
  REJECTED: { background: "#fef2f2", color: "#e53e3e", icon: XCircle },
  FULFILLED: { background: "#f0f0f0", color: "#1a1d23", icon: CheckCircle },
};

const s = {
  page: { padding: 24, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23", background: "#f5f5f5", minHeight: "100%" },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 10 },
  cardHeader: { padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" },
  searchInput: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px 7px 34px", fontFamily: "inherit", fontSize: 13, outline: "none", background: "#f5f5f5", boxSizing: "border-box" },
  th: { padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f5f5f5", textAlign: "left", borderBottom: "1px solid #e5e7eb" },
  td: { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #e5e7eb" },
  iconBtn: { border: "1px solid #e5e7eb", background: "white", borderRadius: 6, padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center" },
  approveBtn: { background: "#059669", color: "white", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  rejectBtn: { background: "#e53e3e", color: "white", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" },
};

export default function RestockManagement() {
  const dispatch = useDispatch();
  const userData = secureStorage.getUserData();
  const storeId = userData?.storeId;
  const { requests: restockRequests, loading } = useSelector((s) => s.restock);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [selected, setSelected] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (storeId) dispatch(getRestockRequestsByStore({ storeId }));
  }, [dispatch, storeId]);

  const filtered = restockRequests?.filter((req) => {
    const matchSearch = (req.productName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (req.branchName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (req.notes ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || req.status === statusFilter;
    const matchBranch = branchFilter === "ALL" || req.branchName === branchFilter;
    return matchSearch && matchStatus && matchBranch;
  });

  const statusCounts = {
    PENDING: restockRequests?.filter(r => r.status === "PENDING").length || 0,
    APPROVED: restockRequests?.filter(r => r.status === "APPROVED").length || 0,
    FULFILLED: restockRequests?.filter(r => r.status === "FULFILLED").length || 0,
    REJECTED: restockRequests?.filter(r => r.status === "REJECTED").length || 0,
  };

  const branches = [...new Set(restockRequests?.map(r => r.branchName).filter(Boolean))];

  const handleApprove = async (requestId) => {
    try {
      await dispatch(approveRestockRequest({ requestId })).unwrap();
      toast.success("Request approved - Products will be sent to branch");
      if (storeId) dispatch(getRestockRequestsByStore({ storeId }));
    } catch (error) {
      toast.error(error || "Failed to approve request");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      await dispatch(rejectRestockRequest({ 
        requestId: selectedRequest.id, 
        reason: rejectReason 
      })).unwrap();
      toast.success("Restock request rejected");
      setRejectDialogOpen(false);
      setRejectReason("");
      if (storeId) dispatch(getRestockRequestsByStore({ storeId }));
    } catch (error) {
      toast.error(error || "Failed to reject request");
    }
  };

  const handleBatchApprove = async () => {
    if (selected.length === 0) {
      toast.error("Please select requests to approve");
      return;
    }
    try {
      await dispatch(batchApproveRequests(selected)).unwrap();
      toast.success(`${selected.length} requests approved - Products will be sent to branches`);
      setSelected([]);
      if (storeId) dispatch(getRestockRequestsByStore({ storeId }));
    } catch (error) {
      toast.error(error || "Failed to approve requests");
    }
  };

  const openRejectDialog = (request) => {
    setSelectedRequest(request);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const openViewDialog = (request) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const toggleSelect = (requestId) => {
    setSelected(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const selectAll = () => {
    const pendingIds = filtered?.filter(r => r.status === "PENDING").map(r => r.id) || [];
    setSelected(selected.length === pendingIds.length ? [] : pendingIds);
  };

  return (
    <div style={s.page}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Restock Requests</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8a909c" }}>Manage inventory restock requests from branches</p>
        </div>
        {selected.length > 0 && (
          <div style={{ display: "flex", gap: 8 }}>
            <button style={s.approveBtn} onClick={handleBatchApprove}>
              Approve Selected ({selected.length})
            </button>
            <button 
              style={{ ...s.rejectBtn, background: "#6b7280" }} 
              onClick={() => setSelected([])}
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Status Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        {[
          { label: "Pending Review", count: statusCounts.PENDING, color: "#d97706", bg: "#fffbeb" },
          { label: "Products Sent", count: statusCounts.APPROVED, color: "#059669", bg: "#f0fdf4" },
          { label: "Received", count: statusCounts.FULFILLED, color: "#1a1d23", bg: "#f0f0f0" },
          { label: "Rejected", count: statusCounts.REJECTED, color: "#e53e3e", bg: "#fef2f2" },
        ].map(({ label, count, color, bg }) => (
          <div key={label} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ padding: 6, background: bg, borderRadius: 6 }}>
                <Truck size={16} color={color} />
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Requests ({filtered?.length ?? 0})</span>
            {statusFilter === "PENDING" && filtered?.length > 0 && (
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                <input 
                  type="checkbox" 
                  checked={selected.length === filtered?.filter(r => r.status === "PENDING").length}
                  onChange={selectAll}
                />
                Select All Pending
              </label>
            )}
          </div>
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
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 13, background: "#f5f5f5", outline: "none", fontFamily: "inherit" }}
            >
              <option value="ALL">All Branches</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            <div style={{ position: "relative", width: 240 }}>
              <Search size={14} color="#8a909c" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input style={s.searchInput} placeholder="Search requests..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {loading && <p style={{ textAlign: "center", padding: 40, color: "#8a909c" }}>Loading...</p>}

        {!loading && filtered?.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
            <AlertTriangle size={36} color="#e2e5e9" style={{ margin: "0 auto 10px", display: "block" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No restock requests found</p>
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>Requests will appear here when branches submit them</p>
          </div>
        )}

        {filtered?.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {statusFilter === "PENDING" && <th style={{ ...s.th, width: 40 }}></th>}
                  {["Branch", "Product", "Current Stock", "Requested", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((req, i) => {
                  const status = statusStyle[req.status] || statusStyle.PENDING;
                  const StatusIcon = status.icon;
                  const isPending = req.status === "PENDING";
                  return (
                    <tr key={req.id ?? req._id ?? i} style={{ background: "white" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                      onMouseLeave={e => e.currentTarget.style.background = "white"}
                    >
                      {statusFilter === "PENDING" && (
                        <td style={s.td}>
                          {isPending && (
                            <input 
                              type="checkbox" 
                              checked={selected.includes(req.id)}
                              onChange={() => toggleSelect(req.id)}
                            />
                          )}
                        </td>
                      )}
                      <td style={{ ...s.td, fontWeight: 600 }}>{req.branchName ?? "—"}</td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{req.productName ?? "—"}</td>
                      <td style={{ ...s.td, color: req.currentStock <= 10 ? "#e53e3e" : "#8a909c" }}>
                        {req.currentStock ?? "—"} units
                      </td>
                      <td style={{ ...s.td, color: "#8a909c" }}>{req.requestedQuantity ?? "—"} units</td>
                      <td style={s.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <StatusIcon size={12} color={status.color} />
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, ...status }}>
                            {req.status ?? "PENDING"}
                          </span>
                        </div>
                      </td>
                      <td style={{ ...s.td, color: "#8a909c" }}>
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                      </td>
                      <td style={{ ...s.td, textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                          <button style={s.iconBtn} onClick={() => openViewDialog(req)} title="View Details">
                            <Eye size={13} color="#6b7280" />
                          </button>
                          {isPending && (
                            <>
                              <button style={s.approveBtn} onClick={() => handleApprove(req.id)}>
                                Approve
                              </button>
                              <button style={s.rejectBtn} onClick={() => openRejectDialog(req)}>
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restock Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Branch</Label>
                  <p className="font-semibold">{selectedRequest.branchName}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Product</Label>
                  <p className="font-semibold">{selectedRequest.productName}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Current Stock</Label>
                  <p className="font-semibold">{selectedRequest.currentStock} units</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Requested</Label>
                  <p className="font-semibold">{selectedRequest.requestedQuantity} units</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Justification/Notes</Label>
                <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">{selectedRequest.notes || "No notes provided"}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Request Date</Label>
                <p className="text-sm">{selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : "—"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Restock Request</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this request</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Reason for Rejection <span className="text-red-500">*</span></Label>
              <Input 
                value={rejectReason} 
                onChange={(e) => setRejectReason(e.target.value)} 
                placeholder="Explain why this request is being rejected..."
                required 
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject}>Reject Request</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}