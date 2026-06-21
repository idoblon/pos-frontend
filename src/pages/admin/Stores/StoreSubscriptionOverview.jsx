import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Store,
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings,
  Search,
  Filter,
  RefreshCw,
  Users,
  Building2,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getAllStores } from "@/Redux Toolkit/Features/Store/storeThunk";
import {
  getStoreName,
  resolveSubscriptionPlan,
} from "@/util/registrationDataMerger";
import {
  getSubscriptionExpiryDate,
  getSubscriptionPurchaseDate,
} from "@/util/subscriptionUtils";

const SUBSCRIPTION_STATUS = {
  ACTIVE: { color: "#059669", bg: "#dcfce7", text: "Active" },
  EXPIRED: { color: "#dc2626", bg: "#fee2e2", text: "Expired" },
  EXPIRING_SOON: { color: "#f59e0b", bg: "#fef3c7", text: "Expiring Soon" },
  SUSPENDED: { color: "#6b7280", bg: "#f3f4f6", text: "Suspended" },
};

const SUBSCRIPTION_PLANS = {
  BASIC: { name: "Basic", price: 3500, color: "#059669" },
  PROFESSIONAL: { name: "Professional", price: 7000, color: "#3b82f6" },
  ENTERPRISE: { name: "Enterprise", price: 10000, color: "#7c3aed" },
};

function StoreSubscriptionCard({ store, onViewDetails, onManageSubscription }) {
  const navigate = useNavigate();
  const plan =
    SUBSCRIPTION_PLANS[store.subscriptionPlan] || SUBSCRIPTION_PLANS.BASIC;
  const statusStyle =
    SUBSCRIPTION_STATUS[store.subscriptionStatus] || SUBSCRIPTION_STATUS.ACTIVE;

  const expiryDate = store.subscriptionExpiry instanceof Date
    ? store.subscriptionExpiry
    : store.subscriptionExpiry ? new Date(store.subscriptionExpiry) : null;

  const daysUntilExpiry = expiryDate
    ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "20px",
        transition: "all 0.2s ease",
        position: "relative",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Status Badge */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          padding: "4px 8px",
          borderRadius: "12px",
          fontSize: "10px",
          fontWeight: "700",
          textTransform: "uppercase",
          background: statusStyle.bg,
          color: statusStyle.color,
        }}
      >
        {statusStyle.text}
      </div>

      {/* Store Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Store size={20} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: "0 0 4px",
              fontSize: "16px",
              fontWeight: "700",
              color: "#1a1d23",
            }}
          >
            {store.name}
          </h3>
          <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
            ID: {store.id} • {store.address || "Address not provided"}
          </p>
        </div>
      </div>

      {/* Subscription Info */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span
            style={{ fontSize: "12px", fontWeight: "600", color: plan.color }}
          >
            {plan.name} Plan
          </span>
          <span
            style={{ fontSize: "14px", fontWeight: "700", color: "#1a1d23" }}
          >
            रु {plan.price.toLocaleString("en-IN")}/mo
          </span>
        </div>

        {store.subscriptionPurchaseDate && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Calendar size={12} color="#6b7280" />
            <span style={{ fontSize: "11px", color: "#6b7280" }}>
              Purchased: {store.subscriptionPurchaseDate instanceof Date
                ? store.subscriptionPurchaseDate.toLocaleDateString()
                : new Date(store.subscriptionPurchaseDate).toLocaleDateString()}
            </span>
          </div>
        )}
        {store.subscriptionExpiry && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={12} color="#6b7280" />
            <span style={{ fontSize: "11px", color: "#6b7280" }}>
              Expires: {store.subscriptionExpiry instanceof Date
                ? store.subscriptionExpiry.toLocaleDateString()
                : new Date(store.subscriptionExpiry).toLocaleDateString()}
              {daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
                <span style={{ color: "#f59e0b", fontWeight: "600", marginLeft: "4px" }}>
                  ({daysUntilExpiry} days left)
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Store Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "700",
              color: "#1a1d23",
            }}
          >
            {store.branchCount || 0}
          </p>
          <p style={{ margin: 0, fontSize: "10px", color: "#6b7280" }}>
            Branches
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "700",
              color: "#1a1d23",
            }}
          >
            {store.employeeCount || 0}
          </p>
          <p style={{ margin: 0, fontSize: "10px", color: "#6b7280" }}>Users</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "700",
              color: plan.color,
            }}
          >
            रु {(store.monthlyRevenue || 0).toLocaleString("en-IN")}
          </p>
          <p style={{ margin: 0, fontSize: "10px", color: "#6b7280" }}>
            Revenue
          </p>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}
      >
        <button
          onClick={() => onViewDetails(store)}
          style={{
            padding: "8px 12px",
            background: "white",
            border: `1px solid ${plan.color}`,
            borderRadius: "6px",
            color: plan.color,
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          <Eye size={12} />
          View Details
        </button>
        <button
          onClick={() => onManageSubscription(store)}
          style={{
            padding: "8px 12px",
            background: plan.color,
            border: "none",
            borderRadius: "6px",
            color: "white",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          <CreditCard size={12} />
          Subscription
        </button>
      </div>
    </div>
  );
}

export default function StoreSubscriptionOverview() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { stores, loading: storesLoading } = useSelector((s) => s.store);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedStore, setSelectedStore] = useState(null);
  const [storesWithSubscriptions, setStoresWithSubscriptions] = useState([]);

  useEffect(() => {
    // Fetch stores from database
    dispatch(getAllStores());
  }, [dispatch]);

  useEffect(() => {
    // Transform store data when it loads
    if (stores && stores.length > 0) {
      transformStoreData();
    }
  }, [stores]);

  const transformStoreData = () => {
    const transformedStores = stores
      .filter((s) => !s.isRegistrationOnly)
      .map((store) => {
        const purchaseDate = getSubscriptionPurchaseDate(store);
        const expiryDate = getSubscriptionExpiryDate(store, purchaseDate);

        // Use backend subscriptionStatus if present, else derive from expiry
        let subscriptionStatus = store.subscriptionStatus
          ? String(store.subscriptionStatus).toUpperCase()
          : "ACTIVE";

        // If backend didn't provide status, calculate from expiry
        if (!store.subscriptionStatus && expiryDate) {
          const now = new Date();
          const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          if (daysLeft < 0) subscriptionStatus = "EXPIRED";
          else if (daysLeft <= 30) subscriptionStatus = "EXPIRING_SOON";
          else subscriptionStatus = "ACTIVE";
        }

        const plan = resolveSubscriptionPlan(store);

        return {
          id: store._id || store.id,
          name: getStoreName(store) || "Unnamed Store",
          address: store.storeAddress || store.contact?.address || "Address not provided",
          branchCount: store.estimatedBranches ?? store.branches?.length ?? 0,
          employeeCount: store.estimatedUsers ?? store.employees?.length ?? 0,
          monthlyRevenue: store.totalRevenue || 0,
          subscriptionPlan: plan,
          subscriptionStatus,
          subscriptionExpiry: expiryDate,
          subscriptionPurchaseDate: purchaseDate,
          storePhone: store.phone || store.contact?.phone || "Not provided",
          storeEmail: store.email || store.contact?.email || "Not provided",
          originalStore: store,
        };
      });

    setStoresWithSubscriptions(transformedStores);
  };

  const filteredStores = storesWithSubscriptions.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(store.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || store.subscriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalStores: storesWithSubscriptions.length,
    activeSubscriptions: storesWithSubscriptions.filter(
      (s) => s.subscriptionStatus === "ACTIVE",
    ).length,
    expiringSoon: storesWithSubscriptions.filter(
      (s) => s.subscriptionStatus === "EXPIRING_SOON",
    ).length,
    totalRevenue: storesWithSubscriptions.reduce(
      (sum, store) => sum + (store.monthlyRevenue || 0),
      0,
    ),
  };

  const handleViewDetails = (store) => {
    setSelectedStore(store);
  };

  const handleManageSubscription = (store) => {
    navigate("/admin/subscriptions", { state: { storeId: store.id } });
  };

  const refreshData = () => {
    dispatch(getAllStores());
    toast.success("Store data refreshed");
  };

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px",
          }}
        >
          <div>
            <h1
              style={{
                margin: "0 0 8px",
                fontSize: "20px",
                fontWeight: "700",
                color: "#1a1d23",
              }}
            >
              Store & Subscription Overview
            </h1>
            <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
              Monitor all stores and their subscription status
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => navigate("/admin/subscriptions")}
              style={{
                padding: "8px 16px",
                background: "#1a1d23",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ExternalLink size={14} />
              Full Subscription Manager
            </button>
            <button
              onClick={refreshData}
              style={{
                padding: "8px 12px",
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <Store size={16} color="#3b82f6" />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6b7280",
                }}
              >
                Total Stores
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "700",
                color: "#1a1d23",
              }}
            >
              {stats.totalStores}
            </p>
          </div>

          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <CheckCircle size={16} color="#059669" />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6b7280",
                }}
              >
                Active Subscriptions
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "700",
                color: "#1a1d23",
              }}
            >
              {stats.activeSubscriptions}
            </p>
          </div>

          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <AlertTriangle size={16} color="#f59e0b" />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6b7280",
                }}
              >
                Expiring Soon
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "700",
                color: "#1a1d23",
              }}
            >
              {stats.expiringSoon}
            </p>
          </div>

          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: "#7c3aed" }}>
                रु
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6b7280",
                }}
              >
                Monthly Revenue
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "700",
                color: "#1a1d23",
              }}
            >
              रु {stats.totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "16px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: "1", minWidth: "300px" }}>
          <Search
            size={16}
            color="#6b7280"
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            type="text"
            placeholder="Search stores by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {["ALL", "ACTIVE", "EXPIRING_SOON", "EXPIRED", "SUSPENDED"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: "6px 12px",
                  background: statusFilter === status ? "#1a1d23" : "white",
                  color: statusFilter === status ? "white" : "#6b7280",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {status.replace("_", " ")}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Store Grid */}
      {loading || storesLoading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          Loading stores and subscriptions...
        </div>
      ) : storesWithSubscriptions.length === 0 ? (
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <Store size={48} color="#e5e7eb" style={{ margin: "0 auto 16px" }} />
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#1a1d23",
            }}
          >
            No Stores Found
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
            No stores are currently registered in the system
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 340px))",
            gap: "16px",
            justifyContent: "start",
          }}
        >
          {filteredStores.map((store) => (
            <StoreSubscriptionCard
              key={store.id}
              store={store}
              onViewDetails={handleViewDetails}
              onManageSubscription={handleManageSubscription}
            />
          ))}
        </div>
      )}

      {/* Store Details Modal */}
      {selectedStore && (
        <>
          <div
            onClick={() => setSelectedStore(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 50,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
              zIndex: 51,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <h2
              style={{
                margin: "0 0 16px",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              {selectedStore.name} - Store Details
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                fontSize: "12px",
              }}
            >
              <div>
                <strong>Store ID:</strong> {selectedStore.id}
              </div>
              <div>
                <strong>Store Name:</strong> {selectedStore.name}
              </div>
              <div>
                <strong>Address:</strong> {selectedStore.address}
              </div>
              <div>
                <strong>Phone:</strong> {selectedStore.storePhone}
              </div>
              <div>
                <strong>Email:</strong> {selectedStore.storeEmail}
              </div>
              <div>
                <strong>Subscription Plan:</strong>{" "}
                {SUBSCRIPTION_PLANS[selectedStore.subscriptionPlan].name}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                {SUBSCRIPTION_STATUS[selectedStore.subscriptionStatus].text}
              </div>
              <div>
                <strong>Purchased:</strong>{" "}
                {selectedStore.subscriptionPurchaseDate
                  ? (selectedStore.subscriptionPurchaseDate instanceof Date
                      ? selectedStore.subscriptionPurchaseDate
                      : new Date(selectedStore.subscriptionPurchaseDate)
                    ).toLocaleDateString()
                  : "N/A"}
              </div>
              <div>
                <strong>Expiry:</strong>{" "}
                {selectedStore.subscriptionExpiry
                  ? (selectedStore.subscriptionExpiry instanceof Date
                      ? selectedStore.subscriptionExpiry
                      : new Date(selectedStore.subscriptionExpiry)
                    ).toLocaleDateString()
                  : "N/A"}
              </div>
              <div>
                <strong>Branches:</strong> {selectedStore.branchCount}
              </div>
              <div>
                <strong>Employees:</strong> {selectedStore.employeeCount}
              </div>
              <div>
                <strong>Monthly Revenue:</strong> रु{" "}
                {(selectedStore.monthlyRevenue || 0).toLocaleString("en-IN")}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              <button
                onClick={() => handleManageSubscription(selectedStore)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#1a1d23",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Manage Subscription
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
