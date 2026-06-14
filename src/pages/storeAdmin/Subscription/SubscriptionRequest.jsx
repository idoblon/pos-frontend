import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, CheckCircle, Clock, CreditCard, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { getStoreByAdmin } from "@/Redux Toolkit/Features/Store/storeThunk";
import { getAuthHeaders } from "@/util/getAuthHeader";
import { getStoreName, resolveSubscriptionPlan } from "@/util/registrationDataMerger";
import secureStorage from "@/util/secureStorage";
import api from "@/util/api";

const STORAGE_KEY = "subscriptionUpgradeRequests";
const PLAN_ORDER = ["BASIC", "PROFESSIONAL", "ENTERPRISE"];

const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: "Basic",
    price: 3500,
    features: ["3 branches", "10 users", "5GB storage", "Email support"],
  },
  PROFESSIONAL: {
    name: "Professional",
    price: 7000,
    features: ["10 branches", "50 users", "25GB storage", "Priority support", "API access"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 10000,
    features: ["25 branches", "200 users", "100GB storage", "24/7 dedicated support", "Custom integrations"],
  },
};

const readRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveRequests = (requests) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
};

const normalizeRequest = (request) => ({
  ...request,
  id: request.id || request._id || request.requestId || `CHG_${Date.now()}`,
  storeId: String(request.storeId ?? request.store?.id ?? request.store?._id ?? ""),
  currentPlan: String(request.currentPlan || request.fromPlan || "BASIC").toUpperCase(),
  requestedPlan: String(request.requestedPlan || request.toPlan || request.subscriptionPlan || "BASIC").toUpperCase(),
  status: String(request.status || "PAID").toUpperCase(),
});

const getPlanChangeAmount = (currentPlan, requestedPlan) => {
  const current = SUBSCRIPTION_PLANS[currentPlan]?.price || 0;
  const requested = SUBSCRIPTION_PLANS[requestedPlan]?.price || current;
  return Math.abs(requested - current);
};

const getPlanChangeType = (currentPlan, requestedPlan) => {
  const currentIndex = PLAN_ORDER.indexOf(currentPlan);
  const requestedIndex = PLAN_ORDER.indexOf(requestedPlan);

  if (requestedIndex > currentIndex) return "UPGRADE";
  if (requestedIndex < currentIndex) return "DOWNGRADE";
  return "SAME";
};

function RequestStatus({ request }) {
  if (!request) return null;

  const statusConfig = {
    PAID: { label: "Waiting for POS admin approval", icon: Clock, bgColor: "#f5f5f5", textColor: "#6b7280" },
    APPROVED: { label: "Approved", icon: CheckCircle, bgColor: "#f5f5f5", textColor: "#1a1d23" },
    REJECTED: { label: "Rejected", icon: AlertTriangle, bgColor: "#f5f5f5", textColor: "#1a1d23" },
    PAYMENT_PENDING: { label: "Payment Pending", icon: Clock, bgColor: "#f5f5f5", textColor: "#6b7280" },
  };

  const config = statusConfig[request.status] || statusConfig.PAID;
  const IconComponent = config.icon;

  return (
    <div style={{ marginTop: 20, padding: 16, borderRadius: 8, background: config.bgColor, border: "1px solid #e2e5e9", display: "flex", alignItems: "flex-start", gap: 12 }}>
      <IconComponent size={18} color={config.textColor} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: config.textColor }}>
          {config.label}
        </p>
        <p style={{ margin: "0", fontSize: 12, color: "#8a909c" }}>
          {SUBSCRIPTION_PLANS[request.currentPlan]?.name} to {SUBSCRIPTION_PLANS[request.requestedPlan]?.name}
          {request.paymentReference ? ` • ${request.paymentReference}` : ""}
        </p>
      </div>
    </div>
  );
}

export default function SubscriptionRequest() {
  const dispatch = useDispatch();
  const { store, loading } = useSelector((s) => s.store);
  const userData = secureStorage.getUserData();
  const fallbackStoreId = userData?.storeId;
  const storeId = String(store?._id || store?.id || fallbackStoreId || "");
  const currentPlan = resolveSubscriptionPlan(store || {});
  const [requestedPlan, setRequestedPlan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("ESEWA");
  const [paymentReference, setPaymentReference] = useState("");
  const [requests, setRequests] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(getStoreByAdmin());
    setRequests(readRequests().map(normalizeRequest));
  }, [dispatch]);

  const availablePlans = useMemo(() => PLAN_ORDER.filter((plan) => plan !== currentPlan), [currentPlan]);

  useEffect(() => {
    setRequestedPlan((current) => current || availablePlans[0] || "");
  }, [availablePlans]);

  const activeRequest = requests.find(
    (request) => request.storeId === storeId && !["APPROVED", "REJECTED"].includes(request.status),
  );

  const latestRequest = activeRequest || requests.find((request) => request.storeId === storeId);
  const changeType = requestedPlan ? getPlanChangeType(currentPlan, requestedPlan) : "SAME";
  const amount = requestedPlan ? getPlanChangeAmount(currentPlan, requestedPlan) : 0;
  const storeName = getStoreName(store) || userData?.storeName || "Your Store";

  const upsertRequest = (request) => {
    const normalized = normalizeRequest(request);
    setRequests((current) => {
      const next = current.some((item) => item.id === normalized.id)
        ? current.map((item) => (item.id === normalized.id ? normalized : item))
        : [normalized, ...current];
      saveRequests(next);
      return next;
    });
  };

  const submitRequest = async (event) => {
    event.preventDefault();

    if (!requestedPlan) {
      toast.error("Please select a plan");
      return;
    }

    if (requestedPlan === currentPlan) {
      toast.error("You are already on this plan");
      return;
    }

    if (!paymentReference.trim()) {
      toast.error("Payment reference is required");
      return;
    }

    setSubmitting(true);
    const payload = {
      storeId,
      storeName,
      ownerName: userData?.fullName || store?.ownerName || "Store Admin",
      email: userData?.email || store?.email || store?.contact?.email || "",
      phone: store?.phone || store?.contact?.phone || "",
      currentPlan,
      requestedPlan,
      changeType: getPlanChangeType(currentPlan, requestedPlan),
      amount,
      paymentMethod,
      paymentReference: paymentReference.trim(),
      status: "PAID",
      paidAt: new Date().toISOString(),
    };

    try {
      const headers = getAuthHeaders();
      const res = await api.post("/api/subscription-upgrade-requests", payload, { headers });
      upsertRequest(res.data || payload);
      toast.success("Subscription change request sent to POS admin");
      setShowModal(false);
    } catch {
      upsertRequest({
        ...payload,
        id: `CHG_${storeId}_${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
      toast.success("Subscription change request saved locally");
      setShowModal(false);
    } finally {
      setSubmitting(false);
      setPaymentReference("");
    }
  };

  const refresh = async () => {
    await dispatch(getStoreByAdmin());
    const updatedRequests = readRequests().map(normalizeRequest);
    setRequests(updatedRequests);
    toast.success("Subscription status refreshed");
    const activeReq = updatedRequests.find(
      (request) => request.storeId === storeId && !["APPROVED", "REJECTED"].includes(request.status),
    );
    if (!activeReq) {
      setShowModal(false);
    }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "'DM Sans','Inter',sans-serif", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#1a1d23" }}>Subscription</h1>
            <p style={{ margin: "0", fontSize: 12, color: "#8a909c" }}>Manage your plan and request changes</p>
          </div>
          <button
            onClick={refresh}
            style={{
              padding: "8px 12px",
              border: "1px solid #e2e5e9",
              background: "white",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              color: "#1a1d23",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)")}
            onMouseLeave={(e) => (e.target.style.boxShadow = "none")}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>

        {/* Current Plan Card */}
        <div style={{ background: "white", border: "1px solid #e2e5e9", borderRadius: 10, padding: "20px" }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#8a909c", textTransform: "uppercase" }}>Current Store</p>
          <h2 style={{ margin: "0 0 18px", fontSize: 18, fontWeight: 800, color: "#1a1d23" }}>{storeName}</h2>

          {/* Plan Display */}
          <div style={{ padding: 16, backgroundColor: "#f5f5f5", borderRadius: 8, border: "1px solid #e2e5e9", marginBottom: 18 }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#8a909c", textTransform: "uppercase" }}>Active Plan</p>
            <p style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: "#1a1d23" }}>{SUBSCRIPTION_PLANS[currentPlan]?.name || currentPlan}</p>
            <p style={{ margin: "0", fontSize: 13, color: "#8a909c" }}>NPR {(SUBSCRIPTION_PLANS[currentPlan]?.price || 0).toLocaleString("en-IN")}/year</p>
          </div>

          {/* Plan Features */}
          <div style={{ marginBottom: 18 }}>
            <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#1a1d23" }}>Includes:</p>
            <div style={{ display: "grid", gap: 8 }}>
              {SUBSCRIPTION_PLANS[currentPlan]?.features.map((feature) => (
                <div key={feature} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#1a1d23" }} />
                  <p style={{ margin: "0", fontSize: 12, color: "#1a1d23" }}>{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Request Status */}
          {latestRequest && <RequestStatus request={latestRequest} />}

          {/* Change Plan Button */}
          {!activeRequest && (
            <button
              onClick={() => setShowModal(true)}
              style={{
                width: "100%",
                marginTop: 18,
                padding: 12,
                border: "none",
                borderRadius: 8,
                background: "#1a1d23",
                color: "white",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.target.style.opacity = "1")}
            >
              Change Plan
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 10,
              maxWidth: 500,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid #e2e5e9" }}>
              <h2 style={{ margin: "0", fontSize: 16, fontWeight: 800, color: "#1a1d23" }}>Change Subscription Plan</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "0",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8a909c",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: 20 }}>
              {/* Warning Alert */}
              <div style={{ display: "flex", gap: 12, padding: 12, backgroundColor: "#f5f5f5", border: "1px solid #e2e5e9", borderRadius: 8, marginBottom: 18 }}>
                <AlertTriangle size={16} color="#6b7280" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: "0", fontSize: 12, color: "#6b7280" }}>
                  POS admin will activate the new plan after reviewing your paid request.
                </p>
              </div>

              <form onSubmit={submitRequest} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Select Plan */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#1a1d23" }}>Select New Plan</label>
                  <select
                    value={requestedPlan}
                    onChange={(e) => setRequestedPlan(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      border: "1px solid #e2e5e9",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#1a1d23",
                      background: "white",
                    }}
                  >
                    {availablePlans.map((plan) => (
                      <option key={plan} value={plan}>
                        {SUBSCRIPTION_PLANS[plan].name} - NPR {SUBSCRIPTION_PLANS[plan].price.toLocaleString("en-IN")}/year
                      </option>
                    ))}
                  </select>
                </div>

                {/* Plan Preview */}
                <div style={{ padding: 14, backgroundColor: "#f5f5f5", borderRadius: 8, border: "1px solid #e2e5e9" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#8a909c" }}>
                      {changeType === "UPGRADE" ? "Upgrade Cost" : changeType === "DOWNGRADE" ? "Price Difference" : "Amount"}
                    </span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: "#1a1d23" }}>NPR {amount.toLocaleString("en-IN")}</span>
                  </div>

                  <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
                    {SUBSCRIPTION_PLANS[requestedPlan]?.features.map((feature) => (
                      <div key={feature} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#1a1d23" }} />
                        <span style={{ fontSize: 12, color: "#6b7280" }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#1a1d23" }}>Payment Method</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {["ESEWA", "KHALTI"].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        style={{
                          padding: 10,
                          borderRadius: 8,
                          border: `1px solid ${paymentMethod === method ? "#1a1d23" : "#e2e5e9"}`,
                          background: paymentMethod === method ? "#1a1d23" : "white",
                          color: paymentMethod === method ? "white" : "#1a1d23",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: 12,
                          transition: "all 0.15s",
                        }}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Reference */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#1a1d23" }}>Payment Reference</label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Enter transaction ID"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: 10,
                      border: "1px solid #e2e5e9",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#1a1d23",
                      background: "white",
                    }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      flex: 1,
                      padding: 12,
                      border: "1px solid #e2e5e9",
                      borderRadius: 8,
                      background: "white",
                      color: "#1a1d23",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => (e.target.background = "#f5f5f5")}
                    onMouseLeave={(e) => (e.target.background = "white")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || loading}
                    style={{
                      flex: 2,
                      padding: 12,
                      border: "none",
                      borderRadius: 8,
                      background: submitting || loading ? "#8a909c" : "#1a1d23",
                      color: "white",
                      cursor: submitting || loading ? "not-allowed" : "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      transition: "all 0.15s",
                    }}
                  >
                    <CreditCard size={14} />
                    {submitting ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
