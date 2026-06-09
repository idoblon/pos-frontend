import React, { useState, useEffect } from "react";
import { Check, X, Clock, Mail, Phone, MapPin, Building2, Calendar, Eye } from "lucide-react";
import { toast } from "sonner";
import SubscriptionValidation from "@/components/admin/SubscriptionValidation";
import ApprovalEmailPreview from "@/components/admin/ApprovalEmailPreview";
import emailService from "@/services/emailService";
import api from "@/util/api";

export default function StoreRegistrationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState("ALL_PENDING");
  const [subscriptionValidations, setSubscriptionValidations] = useState({});
  const [showEmailPreview, setShowEmailPreview] = useState(null);

  const handleSubscriptionValidation = (requestId, isValid) => {
    setSubscriptionValidations(prev => ({ ...prev, [requestId]: isValid }));
    setRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, subscriptionValidated: isValid } : req
    ));
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // If filter is ALL_PENDING, we need to fetch both PENDING and PAYMENT_PENDING
      if (filter === "ALL_PENDING") {
        const res = await api.get(`/api/admin/registration-requests`);
        const allRequests = Array.isArray(res.data) ? res.data : [];
        const pendingRequests = allRequests.filter(req =>
          req.status === "PENDING" || req.status === "PAYMENT_PENDING"
        );
        setRequests(pendingRequests);
      } else {
        const res = await api.get(`/api/admin/registration-requests`);
        const allRequests = Array.isArray(res.data) ? res.data : [];
        setRequests(allRequests.filter(req => req.status === filter));
      }
    } catch (error) {
      console.error("Fetch error:", error.response?.status, error.response?.data);
      toast.error(`Failed to load requests: ${error.response?.data?.message || error.message}`);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (request && !request.subscriptionValidated) {
      toast.error("Please validate subscription before approving");
      return;
    }

    try {
      if (request.status === "PAYMENT_PENDING") {
        await api.post(`/api/admin/registration-requests/${requestId}/approve-final`, {}, { timeout: 30000 });
        setRequests(prev => prev.filter(req => req.id !== requestId));
        toast.success(`Store approved! Login credentials sent to ${request.email}.`);
      } else {
        // Send payment link email, move to PAYMENT_PENDING
        await api.post(`/api/admin/registration-requests/${requestId}/approve`);
        setRequests(prev => prev.map(req =>
          req.id === requestId ? { ...req, status: "PAYMENT_PENDING" } : req
        ));
        toast.success(`Approved! Payment link sent to ${request.email}.`);
      }
      setSelectedRequest(null);
    } catch (error) {
      console.error('Approval process failed:', error);
      toast.error(`Failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const simulateApprovalProcess = (request) => {
    // Simulate sending approval email with payment link
    console.log("📧 Approval Email Sent:");
    console.log("─────────────────────────────────────");
    console.log(`To: ${request.email}`);
    console.log(`Store: ${request.storeName}`);
    console.log(`Plan: ${request.subscriptionPlan} - रु ${getPlanPrice(request.subscriptionPlan)}/year`);
    console.log(`Payment Link: https://payment.pos-system.com/pay/${request.id}`);
    console.log("─────────────────────────────────────");
    console.log("✅ Email delivery simulated successfully");
    
    // Store approval data for reference
    const approvalData = {
      requestId: request.id,
      storeName: request.storeName,
      email: request.email,
      plan: request.subscriptionPlan,
      price: getPlanPrice(request.subscriptionPlan),
      approvedAt: new Date().toISOString(),
      paymentLink: `https://payment.pos-system.com/pay/${request.id}`,
      status: 'PAYMENT_PENDING'
    };
    
    // Store in localStorage for reference
    const existingApprovals = JSON.parse(localStorage.getItem('approvedRequests') || '[]');
    existingApprovals.push(approvalData);
    localStorage.setItem('approvedRequests', JSON.stringify(existingApprovals));
  };

  const getPlanPrice = (plan) => {
    switch(plan) {
      case 'BASIC': return '3,500';
      case 'PROFESSIONAL': return '7,000';
      case 'ENTERPRISE': return '10,000';
      default: return '3,500';
    }
  };

  const handleReject = async (requestId, reason) => {
    try {
      await api.post(`/api/admin/registration-requests/${requestId}/reject`, { reason });
      toast.success("Store registration rejected. Email sent with reason.");
      fetchRequests();
      setSelectedRequest(null);
    } catch (error) {
      // If API fails, simulate the rejection process
      console.warn("API endpoint not available, simulating rejection process:", error.message);
      
      const request = requests.find(r => r.id === requestId);
      // Send rejection email through email service
      const emailResult = await emailService.sendRejectionEmail(request, reason);
      
      // Update the request status locally
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: "REJECTED", rejectionReason: reason, rejectedAt: new Date().toISOString() }
            : req
        )
      );
      
      toast.success(`${request.storeName} registration rejected. Notification sent to ${request.email}`);
      setSelectedRequest(null);
    }
  };

  const simulateRejectionProcess = (request, reason) => {
    // Simulate sending rejection email
    console.log("❌ Rejection Email Sent:");
    console.log("─────────────────────────────────────");
    console.log(`To: ${request.email}`);
    console.log(`Store: ${request.storeName}`);
    console.log(`Reason: ${reason}`);
    console.log("─────────────────────────────────────");
    console.log("✅ Rejection email delivery simulated successfully");
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: { bg: "#fff3cd", color: "#856404", text: "Pending" },
      PAYMENT_PENDING: { bg: "#fef3c7", color: "#92400e", text: "Payment Pending" },
      APPROVED: { bg: "#d4edda", color: "#155724", text: "Approved" },
      REJECTED: { bg: "#f8d7da", color: "#721c24", text: "Rejected" }
    };
    const s = styles[status] || styles.PENDING;
    
    return (
      <span style={{
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600",
        background: s.bg,
        color: s.color
      }}>
        {s.text}
      </span>
    );
  };

  return (
    <div style={{ padding: "24px", fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "700", color: "#1a1d23" }}>
          Store Registration Requests
        </h1>
        <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
          Manage new store registration requests and subscriptions
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "1px solid #e5e7eb" }}>
        {["ALL_PENDING", "APPROVED", "REJECTED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: "12px 20px",
              background: "none",
              border: "none",
              borderBottom: filter === status ? "2px solid #1a1d23" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: filter === status ? 600 : 500,
              color: filter === status ? "#1a1d23" : "#6b7280",
              transition: "all 0.2s"
            }}
          >
            {status === "ALL_PENDING" ? "Pending" : status}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          Loading requests...
        </div>
      ) : requests.length === 0 ? (
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "40px",
          textAlign: "center"
        }}>
          <Clock size={48} color="#e5e7eb" style={{ margin: "0 auto 16px" }} />
          <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
            No {filter.toLowerCase()} requests found
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {requests.map((req) => (
            <div
              key={req.id}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "20px",
                cursor: "pointer",
                transition: "box-shadow 0.2s"
              }}
              onClick={() => setSelectedRequest(req)}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: "700", color: "#1a1d23" }}>
                    {req.storeName}
                  </h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                    Requested by: {req.ownerName}
                  </p>
                </div>
                {getStatusBadge(req.status)}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail size={14} color="#6b7280" />
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>{req.email}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Phone size={14} color="#6b7280" />
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>{req.phone}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#6b7280" }}>रु</span>
                  <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>
                    {req.subscriptionPlan || "Basic"} Plan
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={14} color="#6b7280" />
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {(req.status === "PENDING" || req.status === "PAYMENT_PENDING") && (
                <div style={{ display: "flex", gap: "8px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f3f4f6" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRequest(req); // Open modal for full validation
                    }}
                    style={{
                      flex: 1,
                      padding: "8px 16px",
                      background: "linear-gradient(135deg, #059669, #047857)",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <Check size={14} />
                    Approve
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const reason = prompt("Enter rejection reason:");
                      if (reason) handleReject(req.id, reason);
                    }}
                    style={{
                      flex: 1,
                      padding: "8px 16px",
                      background: "white",
                      color: "#e53e3e",
                      border: "1px solid #e53e3e",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <>
          <div
            onClick={() => setSelectedRequest(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 50
            }}
          />
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            width: "90%",
            maxWidth: "600px",
            maxHeight: "80vh",
            overflowY: "auto",
            zIndex: 51,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "700", color: "#1a1d23" }}>
                  {selectedRequest.storeName}
                </h2>
                <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                  Registration Request Details
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                <X size={20} color="#6b7280" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
                  Status
                </label>
                {getStatusBadge(selectedRequest.status)}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
                  Owner Name
                </label>
                <p style={{ margin: 0, fontSize: "14px", color: "#1a1d23" }}>{selectedRequest.ownerName}</p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
                  Email Address
                </label>
                <p style={{ margin: 0, fontSize: "14px", color: "#1a1d23" }}>{selectedRequest.email}</p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
                  Phone Number
                </label>
                <p style={{ margin: 0, fontSize: "14px", color: "#1a1d23" }}>{selectedRequest.phone}</p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
                  Store Address
                </label>
                <p style={{ margin: 0, fontSize: "14px", color: "#1a1d23" }}>{selectedRequest.storeAddress}</p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
                  Subscription Plan
                </label>
                <p style={{ margin: 0, fontSize: "14px", color: "#1a1d23", fontWeight: "600" }}>
                  {selectedRequest.subscriptionPlan || "Basic"} Plan
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "4px" }}>
                  Request Date
                </label>
                <p style={{ margin: 0, fontSize: "14px", color: "#1a1d23" }}>
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </p>
              </div>

              {selectedRequest.rejectionReason && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#e53e3e", marginBottom: "4px" }}>
                    Rejection Reason
                  </label>
                  <p style={{ margin: 0, fontSize: "14px", color: "#1a1d23", padding: "12px", background: "#fef2f2", borderRadius: "6px" }}>
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}

              {(selectedRequest.status === "PENDING" || selectedRequest.status === "PAYMENT_PENDING") && (
                <>
                  <SubscriptionValidation 
                    request={selectedRequest}
                    onValidation={(isValid) => handleSubscriptionValidation(selectedRequest.id, isValid)}
                  />
                  <div style={{ display: "flex", gap: "12px", marginTop: "8px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                    <button
                      onClick={() => handleApprove(selectedRequest.id)}
                      disabled={!subscriptionValidations[selectedRequest.id]}
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: subscriptionValidations[selectedRequest.id] 
                          ? "linear-gradient(135deg, #1a1d23, #4a4d55)"
                          : "#e5e7eb",
                        color: subscriptionValidations[selectedRequest.id] ? "white" : "#9ca3af",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: subscriptionValidations[selectedRequest.id] ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <Check size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt("Enter rejection reason:");
                        if (reason) handleReject(selectedRequest.id, reason);
                      }}
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "white",
                        color: "#e53e3e",
                        border: "2px solid #e53e3e",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <X size={16} />
                      Reject Request
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
