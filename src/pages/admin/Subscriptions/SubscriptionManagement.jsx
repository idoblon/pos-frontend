import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  Store,
  X,
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
import {
  fetchSubscriptionPlans,
  getUpgradeAmount,
  SUBSCRIPTION_PLANS_FALLBACK,
} from "@/util/subscriptionPlans";
import subscriptionService from "@/services/subscriptionService";
import api from "@/util/api";

// Canonical admin endpoints (backend SubscriptionChangeRequestController).
// The legacy /subscription-upgrade-requests list/approve paths are kept as
// deprecated aliases server-side; the UI uses the canonical paths below.
const ENDPOINTS = {
  list: "/api/admin/subscription-change-requests",
  listLegacy: "/api/admin/subscription-upgrade-requests",
  markPaid: (id) => `/api/admin/subscription-upgrade-requests/${id}/mark-paid`,
  approve: (id) => `/api/admin/subscription-change-requests/${id}/approve`,
  reject: (id) => `/api/admin/subscription-change-requests/${id}/reject`,
};

const REQUESTS_CACHE_KEY = "subscriptionUpgradeRequests";

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
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full/blocked — demo cache is best-effort
  }
};

const normalizeRequest = (request) => ({
  ...request,
  id: request.id || request._id || request.requestId || `REQ_${Date.now()}`,
  storeId: String(request.storeId ?? request.store?.id ?? request.store?._id ?? ""),
  requestedPlan: String(request.requestedPlan || request.toPlan || request.subscriptionPlan || "BASIC").toUpperCase(),
  currentPlan: String(request.currentPlan || request.fromPlan || "BASIC").toUpperCase(),
  status: String(request.status || request.paymentStatus || "PAYMENT_PENDING").toUpperCase(),
});

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

function ActionDialog({ title, label, placeholder, confirmText, onConfirm, onClose }) {
  const [value, setValue] = useState("");
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 60,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "white", borderRadius: 10, padding: 20, width: "100%", maxWidth: 400 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer" }} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#4b5563" }}>{label}</label>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          style={{ marginTop: 6, width: "100%", boxSizing: "border-box", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 14px", border: "1px solid #e5e7eb", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
            Cancel
          </button>
          <button
            onClick={() => value.trim() && onConfirm(value.trim())}
            disabled={!value.trim()}
            style={{ padding: "8px 14px", border: "none", borderRadius: 6, background: value.trim() ? "#1a1d23" : "#e5e7eb", color: value.trim() ? "white" : "#9ca3af", cursor: value.trim() ? "pointer" : "not-allowed", fontSize: 12, fontWeight: 700 }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function StoreSubscriptionCard({ store, plans, planSource, onMarkPaid, onApprove, onReject, onSuspend, onReactivate, onRenew }) {
  const planDetails = plans[store.plan] || plans.BASIC || SUBSCRIPTION_PLANS_FALLBACK.BASIC;
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
        boxSizing: "border-box",
        minWidth: 0,
        height: "100%",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div
          style={{
            width: 48, height: 48, borderRadius: 10, background: "#1a1d23",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
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

      <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Current Plan
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1d23", marginTop: 4 }}>
              {planDetails.name}
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
            {planDetails.price}
            {planSource === "fallback" && (
              <div style={{ fontSize: 10, color: "#b45309" }}>demo prices</div>
            )}
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
        <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#92400e", fontWeight: 700 }}>
                Upgrade request
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280" }}>
                {plans[pendingRequest.currentPlan]?.name || pendingRequest.currentPlan} to{" "}
                {plans[pendingRequest.requestedPlan]?.name || pendingRequest.requestedPlan}
              </p>
            </div>
            <strong style={{ fontSize: 13, color: "#1a1d23" }}>
              NPR {(pendingRequest.amount || getUpgradeAmount(plans, pendingRequest.currentPlan, pendingRequest.requestedPlan)).toLocaleString("en-IN")}
            </strong>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button
              onClick={() => onMarkPaid(pendingRequest)}
              disabled={pendingRequest.status !== "PAYMENT_PENDING"}
              style={{
                padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6,
                background: pendingRequest.status === "PAYMENT_PENDING" ? "white" : "#f3f4f6",
                color: pendingRequest.status === "PAYMENT_PENDING" ? "#1a1d23" : "#9ca3af",
                cursor: pendingRequest.status === "PAYMENT_PENDING" ? "pointer" : "not-allowed",
                fontSize: 12, fontWeight: 700,
              }}
            >
              Mark Paid
            </button>
            <button
              onClick={() => onApprove(pendingRequest)}
              disabled={pendingRequest.status !== "PAID"}
              style={{
                padding: "8px 10px", border: "none", borderRadius: 6,
                background: pendingRequest.status === "PAID" ? "#1a1d23" : "#e5e7eb",
                color: pendingRequest.status === "PAID" ? "white" : "#9ca3af",
                cursor: pendingRequest.status === "PAID" ? "pointer" : "not-allowed",
                fontSize: 12, fontWeight: 700,
              }}
            >
              Approve Upgrade
            </button>
          </div>
          {["PAYMENT_PENDING", "PAID"].includes(pendingRequest.status) && (
            <button
              onClick={() => onReject(pendingRequest)}
              style={{ marginTop: 8, width: "100%", padding: "8px 10px", border: "1px solid #fecaca", borderRadius: 6, background: "white", color: "#991b1b", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
            >
              Reject request
            </button>
          )}
        </div>
      )}

      {!pendingRequest && (
        <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 7, background: "#f8fafc", color: "#6b7280", fontSize: 12, fontWeight: 700, textAlign: "center" }}>
          No plan change request
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
        <button onClick={() => onSuspend(store)} style={{ padding: "7px 8px", border: "1px solid #e5e7eb", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#92400e" }}>
          Suspend
        </button>
        <button onClick={() => onReactivate(store)} style={{ padding: "7px 8px", border: "1px solid #e5e7eb", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#166534" }}>
          Reactivate
        </button>
        <button onClick={() => onRenew(store)} style={{ padding: "7px 8px", border: "1px solid #e5e7eb", borderRadius: 6, background: "white", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#1d4ed8" }}>
          Renew
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <div style={{ textAlign: "center", padding: 8, background: "#f8fafc", borderRadius: 6 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1d23" }}>{store.branches || 0}</p>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6b7280" }}>Branches</p>
        </div>
        <div style={{ textAlign: "center", padding: 8, background: "#f8fafc", borderRadius: 6 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1d23" }}>{store.users || 0}</p>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6b7280" }}>Users</p>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionManagement() {
  const dispatch = useDispatch();
  const { stores, loading: storesLoading } = useSelector((s) => s.store);
  const [searchTerm, setSearchTerm] = useState("");
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [plans, setPlans] = useState(SUBSCRIPTION_PLANS_FALLBACK);
  const [planSource, setPlanSource] = useState("fallback");
  const [dialog, setDialog] = useState(null);

  const loadPlans = async () => {
    const { plans: serverPlans, source } = await fetchSubscriptionPlans();
    setPlans(serverPlans);
    setPlanSource(source);
  };

  const loadUpgradeRequests = async () => {
    const headers = getAuthHeaders();
    // Canonical endpoint first, legacy alias second, demo cache last (live pending).
    for (const url of [ENDPOINTS.list, ENDPOINTS.listLegacy]) {
      try {
        const res = await api.get(url, { headers });
        const requests = Array.isArray(res.data) ? res.data.map(normalizeRequest) : [];
        setUpgradeRequests(requests);
        saveJson(REQUESTS_CACHE_KEY, requests);
        return;
      } catch {
        // try next source
      }
    }
    setUpgradeRequests(readJson(REQUESTS_CACHE_KEY, []).map(normalizeRequest));
  };

  useEffect(() => {
    dispatch(getAllStores());
    const timer = setTimeout(() => {
      loadPlans();
      loadUpgradeRequests();
    }, 0);
    return () => clearTimeout(timer);
  }, [dispatch]);

  const subscriptionData = useMemo(() => {
    if (stores && stores.length > 0) {
      return stores.map((store) => {
        const id = String(store._id || store.id);
        const plan = resolveSubscriptionPlan(store);
        const purchaseDate = getSubscriptionPurchaseDate(store);
        const expiryDate = getSubscriptionExpiryDate(store, purchaseDate);

        return {
          id,
          rawId: store._id || store.id,
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
  }, [stores]);

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
      const next = current.some((request) => String(request.id) === String(normalized.id))
        ? current.map((request) => (String(request.id) === String(normalized.id) ? normalized : request))
        : [normalized, ...current];
      saveJson(REQUESTS_CACHE_KEY, next);
      return next;
    });
  };

  const removeRequest = (id) => {
    setUpgradeRequests((current) => {
      const next = current.filter((request) => String(request.id) !== String(id));
      saveJson(REQUESTS_CACHE_KEY, next);
      return next;
    });
  };

  const markPaid = (request) => {
    setDialog({
      title: "Mark payment as paid",
      label: "Payment reference",
      placeholder: `SUB_UPG_${Date.now()}`,
      confirmText: "Mark Paid",
      onConfirm: async (reference) => {
        setDialog(null);
        const updated = { ...request, status: "PAID", paymentReference: reference, paidAt: new Date().toISOString() };
        try {
          const headers = getAuthHeaders();
          const res = await api.post(ENDPOINTS.markPaid(request.id), { reference }, { headers });
          replaceRequest(res.data || updated);
          toast.success("Payment marked as paid");
        } catch {
          // Demo fallback (live pending): keep local state so the showcase flow works offline.
          replaceRequest(updated);
          toast.success("Payment marked as paid locally (demo)");
        }
      },
    });
  };

  const approveUpgrade = async (request) => {
    // Backend approveRequest already updates the store plan — no second PUT needed.
    try {
      const headers = getAuthHeaders();
      const res = await api.post(ENDPOINTS.approve(request.id), {}, { headers });
      const saved = res.data?.data || res.data;
      if (saved && (saved.status || saved.id)) {
        replaceRequest({ ...request, ...saved });
      } else {
        removeRequest(request.id);
      }
      toast.success("Subscription upgraded successfully");
      await dispatch(getAllStores());
    } catch (error) {
      toast.error("Failed to approve upgrade: " + (error.response?.data?.message || error.message));
    }
  };

  const rejectUpgrade = (request) => {
    setDialog({
      title: "Reject plan change",
      label: "Rejection reason (required)",
      placeholder: "e.g. payment not received",
      confirmText: "Reject",
      onConfirm: async (reason) => {
        setDialog(null);
        try {
          const headers = getAuthHeaders();
          await api.post(ENDPOINTS.reject(request.id), { reason }, { headers });
          removeRequest(request.id);
          toast.success("Request rejected");
        } catch (error) {
          toast.error("Failed to reject: " + (error.response?.data?.message || error.message));
        }
      },
    });
  };

  const suspendStore = (store) => {
    setDialog({
      title: `Suspend ${store.storeName}`,
      label: "Suspension reason (required)",
      placeholder: "e.g. payment overdue",
      confirmText: "Suspend",
      onConfirm: async (reason) => {
        setDialog(null);
        try {
          await subscriptionService.suspendSubscription(store.rawId, reason);
          toast.success("Subscription suspended");
          await dispatch(getAllStores());
        } catch (error) {
          toast.error("Suspend failed: " + (error.response?.data?.message || error.message));
        }
      },
    });
  };

  const reactivateStore = async (store) => {
    try {
      await subscriptionService.reactivateSubscription(store.rawId);
      toast.success("Subscription reactivated");
      await dispatch(getAllStores());
    } catch (error) {
      toast.error("Reactivate failed: " + (error.response?.data?.message || error.message));
    }
  };

  const renewStore = async (store) => {
    try {
      await subscriptionService.renewSubscription(store.rawId, store.plan, {});
      toast.success("Subscription renewed");
      await dispatch(getAllStores());
    } catch (error) {
      toast.error("Renew failed: " + (error.response?.data?.message || error.message));
    }
  };

  const refreshData = () => {
    dispatch(getAllStores());
    loadPlans();
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
            {planSource === "fallback" && " — demo prices (backend unreachable)"}
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
              style={{ padding: "8px 12px 8px 32px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, outline: "none", width: 200 }}
            />
          </div>
          <button
            onClick={refreshData}
            style={{ padding: "8px 12px", background: "white", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6b7280" }}
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: 12, borderRadius: 8, background: "#f8fafc", border: "1px solid #e5e7eb", marginBottom: 18, color: "#4b5563", fontSize: 12 }}>
        <AlertTriangle size={15} color="#92400e" style={{ marginTop: 1, flexShrink: 0 }} />
        Store admins request plan changes from their subscription page. POS admin only accepts the plan after payment has been submitted or verified.
      </div>

      {storesLoading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 40, textAlign: "center" }}>
          <Store size={48} color="#e5e7eb" style={{ margin: "0 auto 16px", display: "block" }} />
          <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#1a1d23" }}>
            No Stores Found
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
            No stores are currently registered in the system
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map((store) => (
            <StoreSubscriptionCard
              key={store.id}
              store={store}
              plans={plans}
              planSource={planSource}
              onMarkPaid={markPaid}
              onApprove={approveUpgrade}
              onReject={rejectUpgrade}
              onSuspend={suspendStore}
              onReactivate={reactivateStore}
              onRenew={renewStore}
            />
          ))}
        </div>
      )}

      {dialog && (
        <ActionDialog
          title={dialog.title}
          label={dialog.label}
          placeholder={dialog.placeholder}
          confirmText={dialog.confirmText}
          onConfirm={dialog.onConfirm}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
