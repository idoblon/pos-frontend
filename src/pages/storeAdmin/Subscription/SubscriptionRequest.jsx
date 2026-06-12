import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, CheckCircle, Clock, CreditCard, RefreshCw } from "lucide-react";
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
    features: ["3 branches", "10 users", "Basic support"],
  },
  PROFESSIONAL: {
    name: "Professional",
    price: 7000,
    features: ["10 branches", "50 users", "Priority support", "Advanced reports"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 10000,
    features: ["Unlimited branches", "Unlimited users", "24/7 support", "Custom features"],
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
  id: request.id || request._id || request.requestId || `UPG_${Date.now()}`,
  storeId: String(request.storeId ?? request.store?.id ?? request.store?._id ?? ""),
  currentPlan: String(request.currentPlan || request.fromPlan || "BASIC").toUpperCase(),
  requestedPlan: String(request.requestedPlan || request.toPlan || request.subscriptionPlan || "BASIC").toUpperCase(),
  status: String(request.status || "PAID").toUpperCase(),
});

const getUpgradeAmount = (currentPlan, requestedPlan) => {
  const current = SUBSCRIPTION_PLANS[currentPlan]?.price || 0;
  const requested = SUBSCRIPTION_PLANS[requestedPlan]?.price || current;
  return Math.max(requested - current, requested);
};

const statusStyle = {
  PAID: { label: "Waiting for POS admin approval", bg: "#dbeafe", color: "#1d4ed8" },
  APPROVED: { label: "Approved", bg: "#dcfce7", color: "#166534" },
  REJECTED: { label: "Rejected", bg: "#fee2e2", color: "#991b1b" },
  PAYMENT_PENDING: { label: "Payment Pending", bg: "#fef3c7", color: "#92400e" },
};

function RequestStatus({ request }) {
  if (!request) return null;
  const style = statusStyle[request.status] || statusStyle.PAID;

  return (
    <div
      style={{
        marginTop: 18,
        padding: 14,
        borderRadius: 8,
        background: style.bg,
        border: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      {request.status === "APPROVED" ? (
        <CheckCircle size={18} color={style.color} />
      ) : (
        <Clock size={18} color={style.color} />
      )}
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: style.color }}>
          {style.label}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#4b5563" }}>
          {SUBSCRIPTION_PLANS[request.currentPlan]?.name || request.currentPlan} to{" "}
          {SUBSCRIPTION_PLANS[request.requestedPlan]?.name || request.requestedPlan}
          {request.paymentReference ? ` • Ref: ${request.paymentReference}` : ""}
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

  useEffect(() => {
    dispatch(getStoreByAdmin());
    setRequests(readRequests().map(normalizeRequest));
  }, [dispatch]);

  const availablePlans = useMemo(
    () => PLAN_ORDER.filter((plan) => PLAN_ORDER.indexOf(plan) > PLAN_ORDER.indexOf(currentPlan)),
    [currentPlan],
  );

  useEffect(() => {
    setRequestedPlan((current) => current || availablePlans[0] || "");
  }, [availablePlans]);

  const activeRequest = requests.find(
    (request) => request.storeId === storeId && !["APPROVED", "REJECTED"].includes(request.status),
  );

  const latestRequest = activeRequest || requests.find((request) => request.storeId === storeId);
  const amount = requestedPlan ? getUpgradeAmount(currentPlan, requestedPlan) : 0;
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
      toast.error("This store is already on the highest plan");
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
    } catch {
      upsertRequest({
        ...payload,
        id: `UPG_${storeId}_${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
      toast.success("Subscription change request saved locally");
    } finally {
      setSubmitting(false);
      setPaymentReference("");
    }
  };

  const refresh = () => {
    dispatch(getStoreByAdmin());
    setRequests(readRequests().map(normalizeRequest));
    toast.success("Subscription status refreshed");
  };

  return (
    <div style={{ padding: 24, fontFamily: "'DM Sans','Inter',sans-serif", color: "#1a1d23" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800 }}>Subscription</h1>
          <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
            Request a plan change after completing payment
          </p>
        </div>
        <button
          onClick={refresh}
          style={{
            padding: "8px 12px",
            border: "1px solid #e5e7eb",
            background: "white",
            borderRadius: 7,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 0.9fr) minmax(320px, 1.1fr)", gap: 18 }}>
        <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 18 }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "#6b7280", fontWeight: 700 }}>Current Store</p>
          <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800 }}>{storeName}</h2>
          <div style={{ padding: 14, borderRadius: 8, background: "#f8fafc", border: "1px solid #e5e7eb" }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#6b7280", fontWeight: 800, textTransform: "uppercase" }}>
              Active Plan
            </p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>{SUBSCRIPTION_PLANS[currentPlan]?.name || currentPlan}</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
              NPR {(SUBSCRIPTION_PLANS[currentPlan]?.price || 0).toLocaleString("en-IN")}/year
            </p>
          </div>
          <RequestStatus request={latestRequest} />
        </section>

        <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 18 }}>
          <div style={{ display: "flex", gap: 10, padding: 12, borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a", marginBottom: 16 }}>
            <AlertTriangle size={16} color="#92400e" style={{ marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 12, color: "#78350f" }}>
              POS admin will only activate the new plan after reviewing this paid request.
            </p>
          </div>

          {availablePlans.length === 0 ? (
            <div style={{ textAlign: "center", padding: 34, color: "#6b7280" }}>
              <CheckCircle size={36} color="#166534" style={{ marginBottom: 12 }} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>You are already on the highest plan.</p>
            </div>
          ) : activeRequest ? (
            <div style={{ textAlign: "center", padding: 34, color: "#6b7280" }}>
              <Clock size={36} color="#1d4ed8" style={{ marginBottom: 12 }} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>A subscription request is already waiting for POS admin.</p>
            </div>
          ) : (
            <form onSubmit={submitRequest}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Requested Plan</label>
              <select
                value={requestedPlan}
                onChange={(event) => setRequestedPlan(event.target.value)}
                style={{ width: "100%", padding: 10, border: "1px solid #e5e7eb", borderRadius: 7, marginBottom: 14 }}
              >
                {availablePlans.map((plan) => (
                  <option key={plan} value={plan}>
                    {SUBSCRIPTION_PLANS[plan].name} - NPR {SUBSCRIPTION_PLANS[plan].price.toLocaleString("en-IN")}/year
                  </option>
                ))}
              </select>

              <div style={{ padding: 14, borderRadius: 8, background: "#f8fafc", border: "1px solid #e5e7eb", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 800 }}>Amount to pay</span>
                  <span style={{ fontSize: 20, fontWeight: 900 }}>NPR {amount.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "grid", gap: 4, marginTop: 10 }}>
                  {SUBSCRIPTION_PLANS[requestedPlan]?.features.map((feature) => (
                    <span key={feature} style={{ fontSize: 12, color: "#6b7280" }}>• {feature}</span>
                  ))}
                </div>
              </div>

              <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Payment Method</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {["ESEWA", "KHALTI"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      padding: 10,
                      borderRadius: 7,
                      border: `1px solid ${paymentMethod === method ? "#1a1d23" : "#e5e7eb"}`,
                      background: paymentMethod === method ? "#1a1d23" : "white",
                      color: paymentMethod === method ? "white" : "#4b5563",
                      cursor: "pointer",
                      fontWeight: 800,
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>

              <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Payment Reference</label>
              <input
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                placeholder="Enter transaction reference"
                style={{ width: "100%", boxSizing: "border-box", padding: 10, border: "1px solid #e5e7eb", borderRadius: 7, marginBottom: 14 }}
              />

              <button
                type="submit"
                disabled={submitting || loading}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "none",
                  borderRadius: 8,
                  background: submitting ? "#6b7280" : "#1a1d23",
                  color: "white",
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                <CreditCard size={15} />
                {submitting ? "Sending request..." : "Send Paid Request to POS Admin"}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
