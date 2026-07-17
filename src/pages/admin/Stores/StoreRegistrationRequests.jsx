import React, { useState, useEffect } from "react";
import { Check, X, Clock, Mail, Phone, MapPin, Calendar, DollarSign, RefreshCw, Building2, User } from "lucide-react";
import { toast } from "sonner";
import api from "@/util/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const STATUS_VARIANT = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

const PLAN_PRICE = {
  BASIC: "रु 2,999/mo",
  PROFESSIONAL: "रु 5,999/mo",
  ENTERPRISE: "रु 12,999/mo",
};

const FILTERS = ["PENDING", "APPROVED", "REJECTED", "ALL"];

export default function StoreRegistrationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("PENDING");
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = filter && filter !== "ALL" ? `?status=${filter}` : "";
      const res = await api.get(`/api/admin/store-requests${params}`);
      setRequests(res.data);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const handleApprove = async (id) => {
    setActionLoading(id + "_approve");
    try {
      await api.post(`/api/admin/store-requests/${id}/approve`);
      toast.success("Store approved! Login credentials sent via email.");
      setSelected(null);
      fetchRequests();
    } catch (e) {
      toast.error(e.response?.data || "Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) { toast.error("Please enter a rejection reason"); return; }
    setActionLoading(id + "_reject");
    try {
      await api.post(`/api/admin/store-requests/${id}/reject`, { reason: rejectReason });
      toast.success("Request rejected. Email sent to applicant.");
      setSelected(null);
      setRejectReason("");
      setShowRejectInput(false);
      fetchRequests();
    } catch (e) {
      toast.error(e.response?.data || "Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  const closeModal = () => {
    setSelected(null);
    setShowRejectInput(false);
    setRejectReason("");
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Store Registration Requests</h1>
          <p className="text-xs text-gray-500 mt-1">Review and approve new store registrations</p>
        </div>
        <Button
          size="sm"
          onClick={fetchRequests}
          disabled={loading}
          className="bg-gradient-to-r from-[#1a1d23] to-[#4a4d55] text-white hover:opacity-90"
        >
          <RefreshCw size={13} className={loading ? "animate-spin mr-1.5" : "mr-1.5"} />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {FILTERS.map((s) => {
          const active = s === "ALL" ? filter === "" : filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s === "ALL" ? "" : s)}
              className={`px-5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                active
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-gray-400">Loading...</div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 gap-3">
            <Clock size={40} className="text-gray-200" />
            <p className="text-sm text-gray-400">No {filter || ""} requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((req) => (
            <Card
              key={req.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => { setSelected(req); setShowRejectInput(false); setRejectReason(""); }}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{req.storeName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <User size={11} /> {req.ownerName}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[req.status] || "outline"}>{req.status}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { icon: Mail, text: req.email },
                    { icon: Phone, text: req.phone },
                    { icon: DollarSign, text: `${req.subscriptionPlan} — ${PLAN_PRICE[req.subscriptionPlan] || ""}` },
                    { icon: Calendar, text: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "" },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Icon size={12} className="text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-500 truncate">{text}</span>
                    </div>
                  ))}
                </div>

                {req.status === "PENDING" && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-[#1a1d23] to-[#4a4d55] text-white hover:opacity-90"
                        disabled={actionLoading === req.id + "_approve"}
                        onClick={() => handleApprove(req.id)}
                      >
                        <Check size={13} className="mr-1" />
                        {actionLoading === req.id + "_approve" ? "Approving..." : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                        onClick={() => { setSelected(req); setShowRejectInput(true); }}
                      >
                        <X size={13} className="mr-1" />
                        Reject
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={closeModal}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-51 w-[90%] max-w-[560px] max-h-[85vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-6"
            style={{ zIndex: 51 }}>
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Building2 size={18} className="text-gray-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{selected.storeName}</h2>
                  <Badge variant={STATUS_VARIANT[selected.status] || "outline"} className="mt-1">
                    {selected.status}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8">
                <X size={16} />
              </Button>
            </div>

            <Separator className="mb-5" />

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                ["Owner Name", selected.ownerName, User],
                ["Email", selected.email, Mail],
                ["Phone", selected.phone, Phone],
                ["Store Type", selected.storeType, Building2],
                ["Subscription", `${selected.subscriptionPlan} — ${PLAN_PRICE[selected.subscriptionPlan] || ""}`, DollarSign],
                ["Submitted", selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "—", Calendar],
              ].map(([label, value, Icon]) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Icon size={10} /> {label}
                  </p>
                  <p className="text-sm text-gray-800">{value || "—"}</p>
                </div>
              ))}
            </div>

            {selected.storeAddress && (
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <MapPin size={10} /> Address
                </p>
                <p className="text-sm text-gray-800">{selected.storeAddress}</p>
              </div>
            )}

            {selected.storeDescription && (
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selected.storeDescription}</p>
              </div>
            )}

            {selected.rejectionReason && (
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wide mb-1">Rejection Reason</p>
                <p className="text-sm text-gray-800 bg-red-50 rounded-lg p-3">{selected.rejectionReason}</p>
              </div>
            )}

            {selected.createdStoreId && (
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Store ID Created</p>
                <p className="text-sm text-gray-800">#{selected.createdStoreId}</p>
              </div>
            )}

            {/* Reject textarea */}
            {showRejectInput && selected.status === "PENDING" && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Enter reason for rejection..."
                  className="resize-none text-sm"
                />
              </div>
            )}

            {/* Actions */}
            {selected.status === "PENDING" && (
              <>
                <Separator className="mb-4" />
                <div className="flex gap-3">
                  {!showRejectInput ? (
                    <>
                      <Button
                        className="flex-1 bg-gradient-to-r from-[#1a1d23] to-[#4a4d55] text-white hover:opacity-90"
                        disabled={actionLoading === selected.id + "_approve"}
                        onClick={() => handleApprove(selected.id)}
                      >
                        <Check size={15} className="mr-2" />
                        {actionLoading === selected.id + "_approve" ? "Approving..." : "Approve & Create Account"}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => setShowRejectInput(true)}
                      >
                        <X size={15} className="mr-2" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                        disabled={actionLoading === selected.id + "_reject"}
                        onClick={() => handleReject(selected.id)}
                      >
                        {actionLoading === selected.id + "_reject" ? "Rejecting..." : "Confirm Rejection"}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
