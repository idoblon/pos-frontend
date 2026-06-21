import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { getAllStores } from "@/Redux Toolkit/Features/Store/storeThunk";
import { getStoreName, resolveSubscriptionPlan } from "@/util/registrationDataMerger";
import { getAuthHeaders } from "@/util/getAuthHeader";
import {
  formatSubscriptionDate,
  getSubscriptionExpiryDate,
  getSubscriptionPurchaseDate,
} from "@/util/subscriptionUtils";
import api from "@/util/api";

const STORAGE_KEYS = {
  requests: "subscriptionUpgradeRequests",
  overrides: "subscriptionPlanOverrides",
};

const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: "Basic",
    price: "NPR 3,500/year",
    priceValue: 3500,
    color: "#1a1d23",
    features: ["1 Store", "3 Branches", "10 Users", "5GB Storage", "Email Support"],
  },
  PROFESSIONAL: {
    name: "Professional",
    price: "NPR 7,000/year",
    priceValue: 7000,
    color: "#1a1d23",
    features: ["1 Store", "10 Branches", "50 Users", "25GB Storage", "Priority Support", "API Access"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: "NPR 10,000/year",
    priceValue: 10000,
    color: "#1a1d23",
    features: ["Unlimited Stores", "25 Branches", "200 Users", "100GB Storage", "24/7 Dedicated Support", "Custom Integrations"],
  },
};

const REQUEST_STATUS = {
  PAYMENT_PENDING: { label: "Payment Pending", color: "#92400e", bg: "#fef3c7" },
  PAID: { label: "Paid", color: "#1d4ed8", bg: "#dbeafe" },
  APPROVED: { label: "Approved", color: "#166534", bg: "#dcfce7" },
  REJECTED: { label: "Rejected", color: "#991b1b", bg: "#fee2e2" },
};

const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const saveJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const normalizeRequest = (request) => ({
  ...request,
  id: request.id || request._id || request.requestId || `REQ_${Date.now()}`,
  storeId: String(request.storeId ?? request.store?.id ?? request.store?._id ?? ""),
  requestedPlan: String(request.requestedPlan || request.toPlan || request.subscriptionPlan || "BASIC").toUpperCase(),
  currentPlan: String(request.currentPlan || request.fromPlan || "BASIC").toUpperCase(),
  status: String(request.status || request.paymentStatus || "PAYMENT_PENDING").toUpperCase(),
});

const getUpgradeAmount = (currentPlan, requestedPlan) => {
  const current = SUBSCRIPTION_PLANS[currentPlan]?.priceValue || 0;
  const requested = SUBSCRIPTION_PLANS[requestedPlan]?.priceValue || current;
  return Math.max(requested - current, requested);
};

function StatusPill({ status }) {
  const style = REQUEST_STATUS[status] || REQUEST_STATUS.PAYMENT_PENDING;
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 999,
        background: style.bg,
        color: style.color,
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
      }}
    >
      {style.label}
    </span>
  );
}

function StoreSubscriptionCard({ store, onMarkPaid, onApprove }) {
  const planDetails = SUBSCRIPTION_PLANS[store.plan] || SUBSCRIPTION_PLANS.BASIC;
  const pendingRequest = store.upgradeRequest;
  const daysUntilExpiry = store.expiryDate
    ? Math.ceil((store.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      style={{
        background: "white",
        border: pendingRequest ? "1px solid #f59e0b" : "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 20,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: "#1a1d23",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Store size={20} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1d23" }}>
            {store.storeName}
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>
            Admin: {store.adminName || "N/A"}
          </p>
        </div>
        {pendingRequest && <StatusPill status={pendingRequest.status} />}
      </div>

      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 14,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Current Plan
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1d23", marginTop: 4 }}>
              {planDetails.name}
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
            {planDetails.price}
          </div>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12, color: "#4b5563" }}>
            <span style={{ fontWeight: 700 }}>Purchased</span>
            <span>{formatSubscriptionDate(store.purchaseDate)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12, color: "#4b5563" }}>
            <span style={{ fontWeight: 700 }}>Expires</span>
            <span>
              {formatSubscriptionDate(store.expiryDate)}
              {daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 60 && (
                <span style={{ color: "#f59e0b", fontWeight: 700, marginLeft: 4 }}>
                  ({daysUntilExpiry} days)
                </span>
              )}
            </span>
          </div>
          <div style={{ height: 1, background: "#e5e7eb", margin: "3px 0" }} />
          {planDetails.features.map((feature) => (
            <div key={feature} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11, color: "#6b7280" }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#1a1d23" }} />
              {feature}
            </div>
          ))}
        </div>
      </div>

      {pendingRequest && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 8,
            background: "#fffbeb",
            border: "1px solid #fde68a",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#92400e", fontWeight: 700 }}>
                Upgrade request
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280" }}>
                {SUBSCRIPTION_PLANS[pendingRequest.currentPlan]?.name || pendingRequest.currentPlan} to{" "}
                {SUBSCRIPTION_PLANS[pendingRequest.requestedPlan]?.name || pendingRequest.requestedPlan}
              </p>
            </div>
            <strong style={{ fontSize: 13, color: "#1a1d23" }}>
              NPR {(pendingRequest.amount || getUpgradeAmount(pendingRequest.currentPlan, pendingRequest.requestedPlan)).toLocaleString("en-IN")}
            </strong>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button
              onClick={() => onMarkPaid(pendingRequest)}
              disabled={pendingRequest.status !== "PAYMENT_PENDING"}
              style={{
                padding: "8px 10px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                background: pendingRequest.status === "PAYMENT_PENDING" ? "white" : "#f3f4f6",
                color: pendingRequest.status === "PAYMENT_PENDING" ? "#1a1d23" : "#9ca3af",
                cursor: pendingRequest.status === "PAYMENT_PENDING" ? "pointer" : "not-allowed",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Mark Paid
            </button>
            <button
              onClick={() => onApprove(pendingRequest)}
              disabled={pendingRequest.status !== "PAID"}
              style={{
                padding: "8px 10px",
                border: "none",
                borderRadius: 6,
                background: pendingRequest.status === "PAID" ? "#1a1d23" : "#e5e7eb",
                color: pendingRequest.status === "PAID" ? "white" : "#9ca3af",
                cursor: pendingRequest.status === "PAID" ? "pointer" : "not-allowed",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Approve Upgrade
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        <div style={{ textAlign: "center", padding: 8, background: "#f8fafc", borderRadius: 6 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1d23" }}>{store.branches || 0}</p>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6b7280" }}>Branches</p>
        </div>
        <div style={{ textAlign: "center", padding: 8, background: "#f8fafc", borderRadius: 6 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1d23" }}>{store.users || 0}</p>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6b7280" }}>Users</p>
        </div>
      </div>

      {!pendingRequest && (
        <div
          style={{
            marginTop: 14,
            padding: "10px 12px",
            borderRadius: 7,
            background: "#f8fafc",
            color: "#6b7280",
            fontSize: 12,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          No plan change request
        </div>
      )}
      
      {/* Debug: Manual subscription update button */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={async () => {
            try {
              const headers = getAuthHeaders();
              console.log('[DEBUG] Manually updating store subscription to ENTERPRISE');
              const res = await api.put(`/api/admin/stores/${store.id}/subscription`, 
                { subscriptionPlan: 'ENTERPRISE' },
                { headers }
              );
              console.log('[DEBUG] Update response:', res.data);
              toast.success('Manually updated to Enterprise');
              onApprove({ id: 'manual', storeId: store.id, requestedPlan: 'ENTERPRISE', status: 'APPROVED' });
            } catch (error) {
              console.error('[DEBUG] Manual update failed:', error.response?.data || error.message);
              toast.error('Manual update failed: ' + (error.response?.data?.message || error.message));
            }
          }}
          style={{
            width: '100%',
            marginTop: 14,
            padding: 8,
            border: '1px solid #f59e0b',
            borderRadius: 6,
            background: '#fffbeb',
            color: '#92400e',
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          🔧 DEBUG: Force Update to Enterprise
        </button>
      )}
    </div>
  );
}

export default function SubscriptionManagement() {
  const dispatch = useDispatch();
  const { stores, loading: storesLoading } = useSelector((s) => s.store);
  const [searchTerm, setSearchTerm] = useState("");
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [planOverrides, setPlanOverrides] = useState(() => readJson(STORAGE_KEYS.overrides, {}));

  const loadUpgradeRequests = async () => {
    const headers = getAuthHeaders();
    try {
      const res = await api.get("/api/admin/subscription-upgrade-requests", { headers });
      const requests = Array.isArray(res.data) ? res.data.map(normalizeRequest) : [];
      setUpgradeRequests(requests);
      saveJson(STORAGE_KEYS.requests, requests);
    } catch {
      setUpgradeRequests(readJson(STORAGE_KEYS.requests, []).map(normalizeRequest));
    }
  };

  useEffect(() => {
    dispatch(getAllStores());
    const timer = setTimeout(loadUpgradeRequests, 0);
    return () => clearTimeout(timer);
  }, [dispatch]);

  const subscriptionData = useMemo(() => {
    if (stores && stores.length > 0) {
      return stores.map((store) => {
        const id = String(store._id || store.id);
        const plan = planOverrides[id] || resolveSubscriptionPlan(store);
        const purchaseDate = getSubscriptionPurchaseDate(store);
        const expiryDate = getSubscriptionExpiryDate(store, purchaseDate);

        return {
          id,
          storeName: getStoreName(store) || "Unnamed Store",
          plan,
          branches: store.estimatedBranches ?? store.branches?.length ?? 1,
          users: store.estimatedUsers ?? store.employees?.length ?? 1,
          adminName: store.fullName || store.ownerName || "Store Admin",
          email: store.email || store.contact?.email || "",
          phone: store.phone || store.contact?.phone || "",
          purchaseDate,
          expiryDate,
        };
      });
    }
    return [];
  }, [stores, planOverrides]);

  const activeRequestsByStore = useMemo(() => {
    return upgradeRequests.reduce((acc, request) => {
      if (!["APPROVED", "REJECTED"].includes(request.status)) {
        acc[String(request.storeId)] = request;
      }
      return acc;
    }, {});
  }, [upgradeRequests]);

  const storesWithRequests = subscriptionData.map((store) => ({
    ...store,
    upgradeRequest: activeRequestsByStore[store.id],
  }));

  const filtered = storesWithRequests.filter((store) =>
    store.storeName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const pendingCount = upgradeRequests.filter((request) => request.status === "PAYMENT_PENDING").length;
  const paidCount = upgradeRequests.filter((request) => request.status === "PAID").length;

  const replaceRequest = (updatedRequest) => {
    setUpgradeRequests((current) => {
      const normalized = normalizeRequest(updatedRequest);
      const next = current.some((request) => request.id === normalized.id)
        ? current.map((request) => (request.id === normalized.id ? normalized : request))
        : [normalized, ...current];
      saveJson(STORAGE_KEYS.requests, next);
      return next;
    });
  };

  const markPaid = async (request) => {
    const transactionId = window.prompt("Enter payment reference", `SUB_UPG_${Date.now()}`);
    if (!transactionId) return;

    const updated = {
      ...request,
      status: "PAID",
      paymentReference: transactionId,
      paidAt: new Date().toISOString(),
    };

    try {
      const headers = getAuthHeaders();
      const res = await api.post(
        `/api/admin/subscription-upgrade-requests/${request.id}/mark-paid`,
        { reference: transactionId },
        { headers },
      );
      replaceRequest(res.data || updated);
      toast.success("Payment marked as paid");
    } catch {
      replaceRequest(updated);
      toast.success("Payment marked as paid locally");
    }
  };

  const approveUpgrade = async (request) => {
    if (!window.confirm(`Approve upgrade to ${SUBSCRIPTION_PLANS[request.requestedPlan]?.name || request.requestedPlan}?`)) {
      return;
    }

    const updated = {
      ...request,
      status: "APPROVED",
      approvedAt: new Date().toISOString(),
    };

    try {
      const headers = getAuthHeaders();
      console.log("[UPGRADE] Starting approval for store:", request.storeId, "to plan:", request.requestedPlan);
      
      // Approve the request
      console.log("[UPGRADE] Step 1: Approving request...");
      const res = await api.post(`/api/admin/subscription-upgrade-requests/${request.id}/approve`, {}, { headers });
      console.log("[UPGRADE] Step 1: Request approved", res.data);
      
      // Update the store's subscription plan
      console.log("[UPGRADE] Step 2: Updating store subscription plan in database...");
      const storeUpdateRes = await api.put(`/api/admin/stores/${request.storeId}/subscription`, 
        { subscriptionPlan: request.requestedPlan },
        { headers }
      );
      console.log("[UPGRADE] Step 2: Store subscription updated", storeUpdateRes.data);
      
      replaceRequest(res.data || updated);
      toast.success("Subscription upgraded successfully");
      
      // Update local override
      console.log("[UPGRADE] Step 3: Updating localStorage override...");
      setPlanOverrides((current) => {
        const next = { ...current, [String(request.storeId)]: request.requestedPlan };
        saveJson(STORAGE_KEYS.overrides, next);
        console.log("[UPGRADE] localStorage updated:", next);
        return next;
      });
      
      // Refresh stores to show updated plan
      console.log("[UPGRADE] Step 4: Refreshing stores list...");
      await dispatch(getAllStores());
      console.log("[UPGRADE] All steps completed successfully!");
    } catch (error) {
      console.error("[UPGRADE] Failed to approve upgrade:", error);
      console.error("[UPGRADE] Error details:", error.response?.data || error.message);
      replaceRequest(updated);
      
      // Still update local override as fallback
      setPlanOverrides((current) => {
        const next = { ...current, [String(request.storeId)]: request.requestedPlan };
        saveJson(STORAGE_KEYS.overrides, next);
        return next;
      });
      
      toast.error("Failed to update subscription plan: " + (error.response?.data?.message || error.message));
    }
  };

  const refreshData = () => {
    dispatch(getAllStores());
    loadUpgradeRequests();
    toast.success("Refreshed");
  };

  return (
    <div style={{ padding: 24, fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16 }}>
        <div>
          <h1 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#1a1d23" }}>
            Subscription Plans
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
            Review store-admin plan change requests and accept paid upgrades
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 7, background: "white", fontSize: 12 }}>
              <Clock size={12} style={{ verticalAlign: "middle", marginRight: 5 }} />
              {pendingCount} payment pending
            </div>
            <div style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 7, background: "white", fontSize: 12 }}>
              <CheckCircle size={12} style={{ verticalAlign: "middle", marginRight: 5 }} />
              {paidCount} ready
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <Search size={14} color="#6b7280" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "8px 12px 8px 32px",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                fontSize: 12,
                outline: "none",
                width: 200,
              }}
            />
          </div>
          <button
            onClick={refreshData}
            style={{
              padding: "8px 12px",
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          padding: 12,
          borderRadius: 8,
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
          marginBottom: 18,
          color: "#4b5563",
          fontSize: 12,
        }}
      >
        <AlertTriangle size={15} color="#92400e" style={{ marginTop: 1, flexShrink: 0 }} />
        Store admins request plan changes from their subscription page. POS admin only accepts the plan after payment has been submitted or verified.
      </div>

      {storesLoading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: 40,
            textAlign: "center",
          }}
        >
          <Store size={48} color="#e5e7eb" style={{ margin: "0 auto 16px", display: "block" }} />
          <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#1a1d23" }}>
            No Stores Found
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
            No stores are currently registered in the system
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filtered.map((store) => (
            <StoreSubscriptionCard
              key={store.id}
              store={store}
              onMarkPaid={markPaid}
              onApprove={approveUpgrade}
            />
          ))}
        </div>
      )}
    </div>
  );
}
