import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  CreditCard, Calendar, AlertCircle, CheckCircle, 
  TrendingUp, Users, Store, Eye, Settings,
  RefreshCw, Download, Filter
} from "lucide-react";
import { toast } from "sonner";
import { getAllStores } from "@/Redux Toolkit/Features/Store/storeThunk";
import { updateBranchStatus } from "@/util/storeStatusChecker";
import { SUBSCRIPTION_PLANS, calculateSubscriptionCost } from "@/util/subscriptionLogic";

const LEGACY_SUBSCRIPTION_PLANS = {
  BASIC: { name: "Basic", price: 3500, color: "#059669", features: ["1 Store", "3 Branches", "10 Users"] },
  PROFESSIONAL: { name: "Professional", price: 7000, color: "#1a1d23", features: ["1 Store", "10 Branches", "50 Users"] },
  ENTERPRISE: { name: "Enterprise", price: 10000, color: "#6b7280", features: ["Unlimited", "Unlimited", "Unlimited"] }
};

function SubscriptionCard({ subscription, onViewDetails, onManage, onQuickAction }) {
  const planDetails = SUBSCRIPTION_PLANS[subscription.plan] || SUBSCRIPTION_PLANS.BASIC;
  const legacyPlan = LEGACY_SUBSCRIPTION_PLANS[subscription.plan] || LEGACY_SUBSCRIPTION_PLANS.BASIC;
  
  // Calculate actual usage and cost
  const usage = {
    branches: subscription.branches || 1,
    users: subscription.users || 5,
    storage: 5 // Default storage
  };
  
  const costCalculation = calculateSubscriptionCost(subscription.plan, usage);
  const actualMonthlyPrice = costCalculation.total;
  
  const isActive = subscription.status === "ACTIVE";
  const daysUntilExpiry = Math.ceil((new Date(subscription.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 7;

  return (
    <div style={{
      background: "white",
      border: `2px solid ${isActive ? "#1a1d23" : "#e5e7eb"}`,
      borderRadius: "12px",
      padding: "20px",
      position: "relative",
      transition: "all 0.2s ease"
    }}>
      {/* Status Badge */}
      <div style={{
        position: "absolute",
        top: "-1px",
        right: "16px",
        padding: "4px 12px",
        borderRadius: "0 0 8px 8px",
        fontSize: "11px",
        fontWeight: "700",
        textTransform: "uppercase",
        background: isActive ? "#1a1d23" : "#6b7280",
        color: "white"
      }}>
        {subscription.status}
      </div>

      {/* Store Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", marginTop: "8px" }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: "#1a1d23",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Store size={20} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#1a1d23" }}>
            {subscription.storeName}
          </h3>
          <p style={{ margin: 0, fontSize: "12px", color: "#6b7280", marginBottom: "2px" }}>
            {planDetails.name} Plan • रु {actualMonthlyPrice.toLocaleString("en-IN")}/year
          </p>
          <p style={{ margin: 0, fontSize: "10px", color: "#059669", fontWeight: "600" }}>
            Admin: {subscription.adminName || "N/A"}
          </p>
          {costCalculation.breakdown.length > 1 && (
            <p style={{ margin: 0, fontSize: "10px", color: "#059669", fontWeight: "600" }}>
              Includes add-ons: +रु {(actualMonthlyPrice - planDetails.basePrice).toLocaleString("en-IN")}
            </p>
          )}
        </div>
      </div>

      {/* Usage Details */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <div style={{
          flex: 1,
          textAlign: "center",
          padding: "8px",
          background: "#f8fafc",
          borderRadius: "6px"
        }}>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a1d23" }}>
            {usage.branches}
          </div>
          <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>
            Branches
            {usage.branches > planDetails.included.branches && (
              <div style={{ color: "#f59e0b", fontSize: "9px" }}>
                +{usage.branches - planDetails.included.branches} extra
              </div>
            )}
          </div>
        </div>
        <div style={{
          flex: 1,
          textAlign: "center", 
          padding: "8px",
          background: "#f8fafc",
          borderRadius: "6px"
        }}>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a1d23" }}>
            {usage.users}
          </div>
          <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>
            Users
            {usage.users > planDetails.included.users && (
              <div style={{ color: "#f59e0b", fontSize: "9px" }}>
                +{usage.users - planDetails.included.users} extra
              </div>
            )}
          </div>
        </div>
        <div style={{
          flex: 1,
          textAlign: "center",
          padding: "8px", 
          background: "#f8fafc",
          borderRadius: "6px"
        }}>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a1d23" }}>
            रु {subscription.totalRevenue?.toLocaleString("en-IN") || "0"}
          </div>
          <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>
            Revenue
          </div>
        </div>
      </div>

      {/* Expiry Warning */}
      {isActive && isExpiringSoon && (
        <div style={{
          padding: "8px 12px",
          background: "#fef3cd",
          border: "1px solid #f59e0b",
          borderRadius: "6px",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <AlertCircle size={14} color="#f59e0b" />
          <span style={{ fontSize: "11px", color: "#92400e", fontWeight: "600" }}>
            Expires in {daysUntilExpiry} days
          </span>
        </div>
      )}

      {/* Quick Action Buttons */}
      {subscription.status !== "ACTIVE" && (
        <div style={{
          padding: "8px 12px",
          background: subscription.status === "EXPIRED" ? "#fef2f2" : 
                     subscription.status === "SUSPENDED" ? "#f3f4f6" : "#fef3cd",
          border: `1px solid ${subscription.status === "EXPIRED" ? "#fecaca" : 
                                subscription.status === "SUSPENDED" ? "#d1d5db" : "#fde68a"}`,
          borderRadius: "6px",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <span style={{ 
            fontSize: "11px", 
            color: subscription.status === "EXPIRED" ? "#dc2626" : 
                   subscription.status === "SUSPENDED" ? "#6b7280" : "#92400e",
            fontWeight: "600" 
          }}>
            {subscription.status === "EXPIRED" ? "Subscription Expired" :
             subscription.status === "SUSPENDED" ? "Subscription Suspended" :
             "Requires Attention"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const action = subscription.status === "EXPIRED" ? "RENEW" :
                            subscription.status === "SUSPENDED" ? "ACTIVATE" :
                            "UPGRADE";
              onQuickAction(action, subscription);
            }}
            style={{
              padding: "4px 8px",
              background: subscription.status === "EXPIRED" ? "#dc2626" : 
                         subscription.status === "SUSPENDED" ? "#059669" : "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            {subscription.status === "EXPIRED" ? "Renew" :
             subscription.status === "SUSPENDED" ? "Activate" :
             "Fix"}
          </button>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        <button
          onClick={() => onViewDetails(subscription)}
          style={{
            flex: 1,
            padding: "8px 12px",
            background: "white",
            border: `1px solid #1a1d23`,
            borderRadius: "6px",
            color: "#1a1d23",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px"
          }}
        >
          <Eye size={12} color="#1a1d23" />
          Details
        </button>
        <button
          onClick={() => onManage(subscription)}
          style={{
            flex: 1,
            padding: "8px 12px",
            background: "#1a1d23",
            border: "none",
            borderRadius: "6px",
            color: "white",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px"
          }}
        >
          <Settings size={12} color="white" />
          Manage
        </button>
      </div>
    </div>
  );
}

export default function SubscriptionManagement() {
  const dispatch = useDispatch();
  const { stores, loading: storesLoading } = useSelector((s) => s.store);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [managementModal, setManagementModal] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState([]);

  useEffect(() => {
    // Fetch stores from database
    dispatch(getAllStores());
    fetchSubscriptionData();
  }, [dispatch]);

  useEffect(() => {
    // Transform store data to include subscription info
    if (stores && stores.length > 0) {
      transformStoreDataToSubscriptions();
    }
  }, [stores]);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      // Fetch subscription data for existing stores
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        throw new Error("No authentication token");
      }

      // This would be your actual subscription API endpoint
      // For now, we'll simulate with timeout and use store data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch subscription data:", error);
      toast.error("Failed to load subscription data");
      setLoading(false);
    }
  };

  const transformStoreDataToSubscriptions = () => {
    if (!stores || stores.length === 0) return;

    // Debug: Log the first store to see its structure
    if (stores.length > 0) {
      console.log("First store data structure:", stores[0]);
      console.log("Available fields:", Object.keys(stores[0]));
      
      // Look specifically for indoorplant store
      const indoorPlant = stores.find(store => 
        (store.storeName && store.storeName.toLowerCase().includes('indoor')) ||
        (store.brand && store.brand.toLowerCase().includes('indoor')) ||
        (store.name && store.name.toLowerCase().includes('indoor'))
      );
      
      if (indoorPlant) {
        console.log("IndoorPlant store data:", indoorPlant);
        console.log("IndoorPlant fields:", {
          name: indoorPlant.storeName || indoorPlant.brand || indoorPlant.name,
          email: indoorPlant.email || indoorPlant.contact?.email,
          phone: indoorPlant.phone || indoorPlant.contact?.phone,
          address: indoorPlant.storeAddress || indoorPlant.address || indoorPlant.contact?.address,
          ownerName: indoorPlant.ownerName || indoorPlant.owner?.name || indoorPlant.adminName
        });
      }
    }

    const subscriptions = stores.map((store, index) => {
      // Generate subscription status based on store data
      const getSubscriptionStatus = (store, index) => {
        if (!store.status) {
          // Create varied statuses for demonstration
          const statuses = ["ACTIVE", "ACTIVE", "ACTIVE", "EXPIRED", "SUSPENDED", "EXPIRING_SOON"];
          return statuses[index % statuses.length];
        }
        
        switch (store.status.toLowerCase()) {
          case "active":
            return index % 4 === 3 ? "EXPIRING_SOON" : "ACTIVE";
          case "inactive":
            return "EXPIRED";
          case "suspended":
            return "SUSPENDED";
          default:
            return "ACTIVE";
        }
      };

      const getSubscriptionPlan = (store, index) => {
        // Assign plans based on store characteristics with some variation
        const employeeCount = store.employees?.length || 0;
        const branchCount = store.branches?.length || 1;
        
        if (employeeCount > 50 || branchCount > 10) {
          return "ENTERPRISE";
        } else if (employeeCount > 15 || branchCount > 3) {
          return "PROFESSIONAL";
        }
        // Add some variation for demo purposes
        const plans = ["BASIC", "BASIC", "PROFESSIONAL", "ENTERPRISE"];
        return plans[index % plans.length];
      };

      const generateExpiryDate = (status) => {
        const today = new Date();
        const expiry = new Date(today);
        
        switch (status) {
          case "EXPIRING_SOON":
            // Expires within 7 days
            expiry.setDate(today.getDate() + Math.floor(Math.random() * 7) + 1);
            break;
          case "EXPIRED":
            // Already expired
            expiry.setDate(today.getDate() - Math.floor(Math.random() * 30) - 1);
            break;
          case "SUSPENDED":
            // Future date but suspended
            expiry.setMonth(today.getMonth() + 1);
            break;
          default:
            // Active - expires in 1-3 months
            expiry.setMonth(today.getMonth() + Math.floor(Math.random() * 3) + 1);
        }
        
        return expiry.toISOString().split('T')[0];
      };

      const status = getSubscriptionStatus(store, index);
      const plan = getSubscriptionPlan(store, index);
      const expiryDate = generateExpiryDate(status);

      return {
        id: store._id || store.id,
        storeName: store.brand || store.storeAdmin?.storeName || store.name || "Unnamed Store",
        storeId: store._id || store.id,
        plan,
        status,
        startDate: store.createdAt ? store.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        expiryDate,
        lastPayment: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextPayment: status === "EXPIRED" ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalRevenue: Math.floor(Math.random() * 100000) + 30000,
        branches: store.branches?.length || Math.floor(Math.random() * 5) + 1,
        users: store.employees?.length || Math.floor(Math.random() * 20) + 5,
        // Store contact details - use storeAdmin data since contact is empty
        storeAddress: store.contact?.address || store.storeAdmin?.storeAddress || store.address || "Address not available",
        storePhone: store.storeAdmin?.phone || store.contact?.phone || store.phone || "Phone not available", 
        storeEmail: store.storeAdmin?.email || store.contact?.email || store.email || "Email not available",
        // Admin name - use storeAdmin.fullName
        adminName: store.storeAdmin?.fullName || store.ownerName || store.owner?.name || store.adminName || "Admin Name N/A"
      };
    });

    setSubscriptionData(subscriptions);
    
    // Also store this in localStorage for status validation
    localStorage.setItem('subscriptionData', JSON.stringify(subscriptions));
    console.log('💾 Stored subscription data in localStorage for status validation');
  };

  const filteredSubscriptions = subscriptionData.filter(sub => {
    if (filter === "ALL") return true;
    return sub.status === filter;
  });

  const stats = {
    totalRevenue: subscriptionData.reduce((sum, sub) => sum + sub.totalRevenue, 0),
    activeSubscriptions: subscriptionData.filter(sub => sub.status === "ACTIVE").length,
    expiredSubscriptions: subscriptionData.filter(sub => sub.status === "EXPIRED").length,
    expiringSoon: subscriptionData.filter(sub => sub.status === "EXPIRING_SOON").length,
    suspendedSubscriptions: subscriptionData.filter(sub => sub.status === "SUSPENDED").length,
    totalStores: subscriptionData.length,
    averageRevenue: subscriptionData.length > 0 
      ? subscriptionData.reduce((sum, sub) => sum + sub.totalRevenue, 0) / subscriptionData.length 
      : 0
  };

  const handleViewDetails = (subscription) => {
    setSelectedSubscription(subscription);
  };

  const handleManageSubscription = (subscription) => {
    setManagementModal(subscription);
  };

  const handleQuickAction = (action, subscription) => {
    switch (action) {
      case "ACTIVATE":
        // Reactivate store and all branches
        setSubscriptionData(prev => {
          const updated = prev.map(sub => {
            if (sub.id === subscription.id) {
              return { 
                ...sub, 
                status: "ACTIVE", 
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                suspendedAt: undefined,
                suspensionReason: undefined
              };
            }
            return sub;
          });
          
          // Update subscription data in localStorage
          localStorage.setItem('subscriptionData', JSON.stringify(updated));
          
          return updated;
        });
        
        // Update branch status
        updateBranchStatus(subscription.storeId, 'ACTIVE');
        
        toast.success(`${subscription.storeName} subscription has been reactivated. Store access is now restored.`);
        break;
      case "SUSPEND":
        // Update store status to SUSPENDED in database
        setSubscriptionData(prev => {
          const updated = prev.map(sub => {
            if (sub.id === subscription.id) {
              const updatedSub = { 
                ...sub, 
                status: "SUSPENDED", 
                suspendedAt: new Date().toISOString(),
                suspensionReason: "Administrative suspension - Payment issues"
              };
              
              return updatedSub;
            }
            return sub;
          });
          
          // Store suspension data for validation during login
          localStorage.setItem('subscriptionData', JSON.stringify(updated));
          return updated;
        });
        
        // Update branch status
        updateBranchStatus(subscription.storeId, 'SUSPENDED');
        
        toast.warning(`${subscription.storeName} and all its branches have been suspended. Store access is now blocked.`);
        break;
      case "RENEW":
        setSubscriptionData(prev => 
          prev.map(sub => 
            sub.id === subscription.id 
              ? { 
                  ...sub, 
                  status: "ACTIVE", 
                  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  lastPayment: new Date().toISOString().split('T')[0]
                }
              : sub
          )
        );
        toast.success(`${subscription.storeName} subscription renewed for 30 days!`);
        break;
      case "UPGRADE":
        // Show upgrade modal instead of auto-upgrading
        setActionModal({ type: "UPGRADE_PLANS", subscription });
        break;
      case "BILLING":
      case "USAGE":
      case "CONTACT":
      case "HISTORY":
      case "REASON":
      case "REMINDER":
      case "UPGRADE":
        setActionModal({ type: action, subscription });
        break;
      default:
        toast.info(`Action: ${action} for ${subscription.storeName}`);
    }
  };

  const refreshData = () => {
    dispatch(getAllStores());
    fetchSubscriptionData();
    toast.success("Data refreshed successfully");
  };



  return (
    <div style={{ padding: "24px", fontFamily: "'DM Sans','Inter',sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "700", color: "#1a1d23" }}>
          Subscription Management
        </h1>
        <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
          Monitor and manage store subscriptions
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#1a1d23" }}>रु</span>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280" }}>Total Revenue</span>
          </div>
          <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1a1d23" }}>
            रु {stats.totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>
        
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <CheckCircle size={16} color="#1a1d23" />
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280" }}>Active Plans</span>
          </div>
          <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1a1d23" }}>
            {stats.activeSubscriptions}
          </p>
        </div>
        
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <AlertCircle size={16} color="#1a1d23" />
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280" }}>Expiring Soon</span>
          </div>
          <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1a1d23" }}>
            {stats.expiringSoon}
          </p>
        </div>
        
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Store size={16} color="#1a1d23" />
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280" }}>Expired</span>
          </div>
          <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1a1d23" }}>
            {stats.expiredSubscriptions}
          </p>
        </div>
        
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <TrendingUp size={16} color="#1a1d23" />
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280" }}>Avg Revenue</span>
          </div>
          <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1a1d23" }}>
            रु {Math.round(stats.averageRevenue).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "16px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { key: "ALL", label: "All", count: stats.totalStores },
            { key: "ACTIVE", label: "Active", count: stats.activeSubscriptions },
            { key: "EXPIRING_SOON", label: "Expiring Soon", count: stats.expiringSoon },
            { key: "EXPIRED", label: "Expired", count: stats.expiredSubscriptions },
            { key: "SUSPENDED", label: "Suspended", count: stats.suspendedSubscriptions }
          ].map((status) => (
            <button
              key={status.key}
              onClick={() => setFilter(status.key)}
              style={{
                padding: "8px 16px",
                background: filter === status.key ? "#1a1d23" : "white",
                color: filter === status.key ? "white" : "#6b7280",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                if (filter !== status.key) {
                  e.target.style.background = "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== status.key) {
                  e.target.style.background = "white";
                }
              }}
            >
              <span>{status.label}</span>
              <span style={{
                background: filter === status.key ? "rgba(255,255,255,0.2)" : "#e5e7eb",
                color: filter === status.key ? "white" : "#6b7280",
                padding: "2px 6px",
                borderRadius: "10px",
                fontSize: "10px",
                fontWeight: "700"
              }}>
                {status.count}
              </span>
            </button>
          ))}
        </div>
        
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={refreshData}
            style={{
              padding: "8px 12px",
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <RefreshCw size={12} />
            Refresh
          </button>

          <button
            style={{
              padding: "8px 12px",
              background: "#1a1d23",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <Download size={12} />
            Export
          </button>
        </div>
      </div>

      {/* Subscriptions Grid */}
      {(loading || storesLoading) ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          Loading stores and subscriptions...
        </div>
      ) : subscriptionData.length === 0 ? (
        <div style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "40px",
          textAlign: "center"
        }}>
          <Store size={48} color="#1a1d23" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: "600", color: "#1a1d23" }}>
            No Stores Found
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
            No stores are currently registered in the system
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          {filteredSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onViewDetails={handleViewDetails}
              onManage={handleManageSubscription}
              onQuickAction={handleQuickAction}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedSubscription && (
        <React.Fragment>
          <div
            onClick={() => setSelectedSubscription(null)}
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
            maxWidth: "500px",
            zIndex: 51,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "700" }}>
              {selectedSubscription.storeName} - Subscription Details
            </h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280" }}>Plan</label>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>
                  {SUBSCRIPTION_PLANS[selectedSubscription.plan]?.name || "Unknown Plan"}
                </p>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280" }}>Status</label>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>
                  {selectedSubscription.status}
                </p>
              </div>
            
              {/* Pricing Breakdown */}
              <div style={{ 
                background: "#f8fafc", 
                border: "1px solid #e2e8f0", 
                borderRadius: "6px", 
                padding: "12px",
                marginBottom: "12px"
              }}>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", display: "block", marginBottom: "6px" }}>
                  Yearly Pricing Breakdown
                </label>
                {(() => {
                  const usage = {
                    branches: selectedSubscription.branches || 1,
                    users: selectedSubscription.users || 5,
                    storage: 5
                  };
                  const costCalc = calculateSubscriptionCost(selectedSubscription.plan, usage);
                  return (
                    <div>
                      {costCalc.breakdown.map((item, idx) => (
                        <div key={idx} style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          fontSize: "12px", 
                          marginBottom: "4px",
                          color: idx === 0 ? "#1a1d23" : "#059669"
                        }}>
                          <span>{item.item} {item.quantity > 1 && `(${item.quantity}x)`}</span>
                          <span>रु {item.totalPrice.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                      <div style={{ 
                        borderTop: "1px solid #e2e8f0", 
                        paddingTop: "6px", 
                        marginTop: "6px",
                        display: "flex", 
                        justifyContent: "space-between", 
                        fontSize: "14px", 
                        fontWeight: "700"
                      }}>
                        <span>Total Yearly</span>
                        <span>रु {costCalc.total.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {/* Store Admin Details */}
              <div style={{
                background: "#f1f5f9",
                border: "1px solid #e2e8f0", 
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "12px"
              }}>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", display: "block", marginBottom: "6px" }}>
                  Store Admin
                </label>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1a1d23" }}>
                  {selectedSubscription.adminName}
                </p>
              </div>
              
              {/* Store Contact Details */}
              <div style={{
                background: "#f8fafc", 
                border: "1px solid #e2e8f0", 
                borderRadius: "8px", 
                padding: "12px",
                marginBottom: "12px"
              }}>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", display: "block", marginBottom: "8px" }}>
                  Contact Information
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "8px" }}>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: "600", color: "#6b7280", display: "block" }}>Email</span>
                    <p style={{ margin: 0, fontSize: "12px", color: "#1a1d23" }}>
                      {selectedSubscription.storeEmail}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: "600", color: "#6b7280", display: "block" }}>Phone</span>
                    <p style={{ margin: 0, fontSize: "12px", color: "#1a1d23" }}>
                      {selectedSubscription.storePhone}
                    </p>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: "600", color: "#6b7280", display: "block" }}>Address</span>
                  <p style={{ margin: 0, fontSize: "12px", color: "#1a1d23", lineHeight: "1.4" }}>
                    {selectedSubscription.storeAddress}
                  </p>
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280" }}>Revenue</label>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>
                    रु {selectedSubscription.totalRevenue.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280" }}>Branches</label>
                  <p style={{ margin: 0, fontSize: "14px" }}>{selectedSubscription.branches}</p>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280" }}>Users</label>
                  <p style={{ margin: 0, fontSize: "14px" }}>{selectedSubscription.users}</p>
                </div>
              </div>
              

            </div>
          </div>
        </React.Fragment>
      )}

      {/* Management Modal */}
      {managementModal && (
        <React.Fragment>
          <div
            onClick={() => setManagementModal(null)}
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
            maxWidth: "400px",
            zIndex: 51,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "700" }}>
              Manage {managementModal.storeName}
            </h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(() => {
                const actions = {
                  ACTIVE: [
                    { key: "SUSPEND", label: "Suspend Subscription", color: "#dc2626", icon: "⏸️" },
                    { key: "UPGRADE", label: "Upgrade Plan", color: "#059669", icon: "⬆️" },
                    { key: "BILLING", label: "View Billing History", color: "#1a1d23", icon: "💳" },
                    { key: "USAGE", label: "View Usage Details", color: "#6b7280", icon: "📊" }
                  ],
                  EXPIRED: [
                    { key: "RENEW", label: "Renew Subscription", color: "#059669", icon: "🔄" },
                    { key: "CONTACT", label: "Contact Customer", color: "#1a1d23", icon: "📞" },
                    { key: "HISTORY", label: "View History", color: "#6b7280", icon: "📋" }
                  ],
                  SUSPENDED: [
                    { key: "ACTIVATE", label: "Reactivate Subscription", color: "#059669", icon: "▶️" },
                    { key: "CONTACT", label: "Contact Customer", color: "#1a1d23", icon: "📞" },
                    { key: "REASON", label: "View Suspension Reason", color: "#6b7280", icon: "❓" }
                  ],
                  EXPIRING_SOON: [
                    { key: "RENEW", label: "Renew Subscription", color: "#059669", icon: "🔄" },
                    { key: "REMINDER", label: "Send Reminder", color: "#dc2626", icon: "📨" },
                    { key: "UPGRADE", label: "Upgrade Plan", color: "#059669", icon: "⬆️" }
                  ]
                };
                
                const availableActions = actions[managementModal.status] || [];
                
                return availableActions.map((action) => (
                  <button
                    key={action.key}
                    onClick={() => {
                      handleQuickAction(action.key, managementModal);
                      setManagementModal(null);
                    }}
                    style={{
                      padding: "12px 16px",
                      background: "white",
                      border: `2px solid ${action.color}`,
                      borderRadius: "8px",
                      color: action.color,
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = action.color;
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "white";
                      e.target.style.color = action.color;
                    }}
                  >
                    <span>{action.icon}</span>
                    {action.label}
                  </button>
                ));
              })()
              }
            </div>
            
            <button
              onClick={() => setManagementModal(null)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "16px",
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                color: "#6b7280",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </React.Fragment>
      )}

      {/* Action Detail Modal */}
      {actionModal && (
        <React.Fragment>
          <div
            onClick={() => setActionModal(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 52
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
            zIndex: 53,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }}>
            {(() => {
              const { type, subscription } = actionModal;
              
              switch (type) {
                case "BILLING":
                  const billingHistory = [
                    { date: "2024-01-15", amount: 3500, status: "Paid", method: "Card", invoice: "INV-001" },
                    { date: "2023-01-15", amount: 3500, status: "Paid", method: "eSewa", invoice: "INV-002" },
                    { date: "2022-01-15", amount: 3500, status: "Paid", method: "Card", invoice: "INV-003" },
                    { date: "2021-01-15", amount: 3500, status: "Failed", method: "Card", invoice: "INV-004" },
                    { date: "2020-01-15", amount: 3500, status: "Paid", method: "eSewa", invoice: "INV-005" }
                  ];
                  
                  return (
                    <>
                      <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "700" }}>
                        💳 Billing History - {subscription.storeName}
                      </h2>
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                          <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                            <div style={{ fontSize: "14px", fontWeight: "700", color: "#059669" }}>रु 17,500</div>
                            <div style={{ fontSize: "11px", color: "#6b7280" }}>Total Paid</div>
                          </div>
                          <div style={{ background: "#fef2f2", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                            <div style={{ fontSize: "14px", fontWeight: "700", color: "#dc2626" }}>रु 3,500</div>
                            <div style={{ fontSize: "11px", color: "#6b7280" }}>Failed Payments</div>
                          </div>
                          <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                            <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a1d23" }}>रु 3,500</div>
                            <div style={{ fontSize: "11px", color: "#6b7280" }}>Next Payment</div>
                          </div>
                        </div>
                        
                        <div style={{ background: "#f8fafc", borderRadius: "8px", overflow: "hidden" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", padding: "12px", background: "#e5e7eb", fontSize: "11px", fontWeight: "600", color: "#6b7280" }}>
                            <span>Date</span>
                            <span>Amount</span>
                            <span>Status</span>
                            <span>Method</span>
                            <span>Invoice</span>
                          </div>
                          {billingHistory.map((bill, idx) => (
                            <div key={idx} style={{ 
                              display: "grid", 
                              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", 
                              padding: "10px 12px", 
                              borderBottom: idx < billingHistory.length - 1 ? "1px solid #e5e7eb" : "none",
                              fontSize: "12px"
                            }}>
                              <span style={{ color: "#1a1d23" }}>{bill.date}</span>
                              <span style={{ color: "#1a1d23", fontWeight: "600" }}>रु {bill.amount.toLocaleString("en-IN")}</span>
                              <span style={{ 
                                color: bill.status === "Paid" ? "#059669" : "#dc2626",
                                fontWeight: "600"
                              }}>{bill.status}</span>
                              <span style={{ color: "#6b7280" }}>{bill.method}</span>
                              <span style={{ color: "#3b82f6", cursor: "pointer" }}>{bill.invoice}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                  
                case "USAGE":
                  const usageData = {
                    currentPeriod: {
                      branches: subscription.branches,
                      users: subscription.users,
                      storage: "2.3 GB",
                      transactions: "1,245",
                      apiCalls: "45,678"
                    },
                    limits: {
                      branches: SUBSCRIPTION_PLANS[subscription.plan].included.branches,
                      users: SUBSCRIPTION_PLANS[subscription.plan].included.users,
                      storage: "5 GB",
                      transactions: "Unlimited",
                      apiCalls: "100,000"
                    }
                  };
                  
                  return (
                    <>
                      <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "700" }}>
                        📊 Usage Details - {subscription.storeName}
                      </h2>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                        {[
                          { key: "branches", label: "Branches", icon: "🏪" },
                          { key: "users", label: "Users", icon: "👥" },
                          { key: "storage", label: "Storage Used", icon: "💾" },
                          { key: "transactions", label: "Transactions", icon: "💳" }
                        ].map((item) => {
                          const current = usageData.currentPeriod[item.key];
                          const limit = usageData.limits[item.key];
                          const isOverLimit = typeof current === 'number' && typeof limit === 'number' && current > limit;
                          
                          return (
                            <div key={item.key} style={{
                              background: "#f8fafc",
                              border: `1px solid ${isOverLimit ? '#f59e0b' : '#e5e7eb'}`,
                              borderRadius: "8px",
                              padding: "16px"
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                <span>{item.icon}</span>
                                <span style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280" }}>{item.label}</span>
                              </div>
                              <div style={{ fontSize: "18px", fontWeight: "700", color: isOverLimit ? "#f59e0b" : "#1a1d23" }}>
                                {current}
                              </div>
                              <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>
                                Limit: {limit}
                                {isOverLimit && (
                                  <span style={{ color: "#f59e0b", fontWeight: "600", marginLeft: "4px" }}>⚠️ Over limit</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                  
                case "CONTACT":
                  const contactMethods = [
                    { type: "Email", value: subscription.storeEmail, icon: "📧" },
                    { type: "Phone", value: subscription.storePhone, icon: "📞" },
                    { type: "WhatsApp", value: subscription.storePhone, icon: "💬" },
                    { type: "SMS", value: subscription.storePhone, icon: "📱" }
                  ];
                  
                  return (
                    <>
                      <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "700" }}>
                        📞 Contact {subscription.storeName}
                      </h2>
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ background: "#f1f5f9", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                          <h3 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "600" }}>Store Admin</h3>
                          <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#1a1d23" }}>{subscription.adminName}</p>
                        </div>
                        
                        <div style={{ display: "grid", gap: "8px" }}>
                          {contactMethods.map((method, idx) => (
                            <button key={idx} style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "12px 16px",
                              background: "white",
                              border: "2px solid #e5e7eb",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontSize: "14px",
                              textAlign: "left",
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => e.target.style.borderColor = "#3b82f6"}
                            onMouseLeave={(e) => e.target.style.borderColor = "#e5e7eb"}
                            onClick={() => {
                              if (method.type === "Email") {
                                window.open(`mailto:${method.value}`);
                              } else if (method.type === "Phone") {
                                window.open(`tel:${method.value}`);
                              } else if (method.type === "WhatsApp") {
                                window.open(`https://wa.me/${method.value.replace(/\D/g, '')}`);
                              } else {
                                toast.info(`Opening ${method.type} for ${method.value}`);
                              }
                            }}>
                              <span style={{ fontSize: "20px" }}>{method.icon}</span>
                              <div>
                                <div style={{ fontWeight: "600", color: "#1a1d23" }}>{method.type}</div>
                                <div style={{ fontSize: "12px", color: "#6b7280" }}>{method.value}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                  
                case "HISTORY":
                  const history = [
                    { date: "2024-01-15", event: "Subscription Renewed", details: "30 days extension", status: "success" },
                    { date: "2023-12-20", event: "Plan Upgraded", details: "Basic → Professional", status: "success" },
                    { date: "2023-12-15", event: "Payment Received", details: "रु 2,999 via Card", status: "success" },
                    { date: "2023-11-15", event: "Payment Failed", details: "Insufficient funds", status: "error" },
                    { date: "2023-10-15", event: "Subscription Created", details: "Basic Plan activated", status: "info" }
                  ];
                  
                  return (
                    <>
                      <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "700" }}>
                        📋 Subscription History - {subscription.storeName}
                      </h2>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {history.map((item, idx) => (
                          <div key={idx} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px 16px",
                            background: "#f8fafc",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px"
                          }}>
                            <div style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: item.status === "success" ? "#059669" : 
                                         item.status === "error" ? "#dc2626" : "#3b82f6"
                            }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "14px", fontWeight: "600", color: "#1a1d23" }}>{item.event}</span>
                                <span style={{ fontSize: "11px", color: "#6b7280" }}>{item.date}</span>
                              </div>
                              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{item.details}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                  
                case "REASON":
                  return (
                    <>
                      <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "700" }}>
                        ❓ Suspension Details - {subscription.storeName}
                      </h2>
                      <div style={{
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "8px",
                        padding: "16px",
                        marginBottom: "16px"
                      }}>
                        <h3 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "600", color: "#dc2626" }}>Suspension Reason</h3>
                        <p style={{ margin: 0, fontSize: "14px", color: "#374151", lineHeight: "1.4" }}>
                          Payment failure - Multiple failed payment attempts. Last failed on 2023-12-20 due to insufficient funds.
                        </p>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px" }}>
                          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Suspended On</div>
                          <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1d23" }}>2023-12-22</div>
                        </div>
                        <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px" }}>
                          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Days Suspended</div>
                          <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1d23" }}>15 days</div>
                        </div>
                      </div>
                    </>
                  );
                  
                case "REMINDER":
                  return (
                    <>
                      <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "700" }}>
                        📧 Send Renewal Reminder - {subscription.storeName}
                      </h2>
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ background: "#f0fdf4", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                          <h3 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "600", color: "#059669" }}>Reminder Sent Successfully!</h3>
                          <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                            Renewal reminder has been sent to {subscription.adminName} at {subscription.storeEmail}
                          </p>
                        </div>
                        
                        <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px" }}>
                          <h4 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "600", color: "#1a1d23" }}>Reminder Details</h4>
                          <div style={{ display: "grid", gap: "8px", fontSize: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "#6b7280" }}>Expiry Date:</span>
                              <span style={{ color: "#1a1d23", fontWeight: "600" }}>{subscription.expiryDate}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "#6b7280" }}>Days Remaining:</span>
                              <span style={{ color: "#f59e0b", fontWeight: "600" }}>{Math.ceil((new Date(subscription.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} days</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "#6b7280" }}>Reminder Sent At:</span>
                              <span style={{ color: "#1a1d23", fontWeight: "600" }}>{new Date().toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                  
                case "UPGRADE_PLANS":
                  const plans = [
                    { key: "BASIC", name: "Basic", price: 3500, color: "#059669", features: ["1 Store", "3 Branches", "10 Users"] },
                    { key: "PROFESSIONAL", name: "Professional", price: 7000, color: "#1a1d23", features: ["1 Store", "10 Branches", "50 Users"] },
                    { key: "ENTERPRISE", name: "Enterprise", price: 10000, color: "#6b7280", features: ["Unlimited Stores", "Unlimited Branches", "Unlimited Users"] }
                  ];
                  
                  return (
                    <>
                      <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "700" }}>
                        📈 Upgrade Plan - {subscription.storeName}
                      </h2>
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ background: "#f1f5f9", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
                          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Current Plan</div>
                          <div style={{ fontSize: "16px", fontWeight: "700", color: "#1a1d23" }}>
                            {SUBSCRIPTION_PLANS[subscription.plan]?.name || "Unknown"} - रु {SUBSCRIPTION_PLANS[subscription.plan]?.basePrice?.toLocaleString("en-IN") || "0"}/month
                          </div>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {plans.filter(plan => {
                            const currentPlanIndex = plans.findIndex(p => p.key === subscription.plan);
                            const planIndex = plans.findIndex(p => p.key === plan.key);
                            return planIndex > currentPlanIndex;
                          }).map((plan) => (
                            <button
                              key={plan.key}
                              onClick={() => {
                                setSubscriptionData(prev => 
                                  prev.map(sub => 
                                    sub.id === subscription.id ? { ...sub, plan: plan.key } : sub
                                  )
                                );
                                localStorage.setItem('subscriptionData', JSON.stringify(
                                  JSON.parse(localStorage.getItem('subscriptionData') || '[]').map(sub => 
                                    sub.id === subscription.id ? { ...sub, plan: plan.key } : sub
                                  )
                                ));
                                toast.success(`${subscription.storeName} upgraded to ${plan.name} plan!`);
                                setActionModal(null);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "16px",
                                background: "white",
                                border: `2px solid ${plan.color}`,
                                borderRadius: "8px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                width: "100%"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = plan.color;
                                const leftDiv = e.target.children[0];
                                const rightDiv = e.target.children[1];
                                leftDiv.children[0].style.color = "white";
                                leftDiv.children[1].style.color = "white";
                                rightDiv.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = "white";
                                const leftDiv = e.target.children[0];
                                const rightDiv = e.target.children[1];
                                leftDiv.children[0].style.color = plan.color;
                                leftDiv.children[1].style.color = "#6b7280";
                                rightDiv.style.color = plan.color;
                              }}
                            >
                              <div>
                                <div style={{ fontSize: "16px", fontWeight: "700", color: plan.color }}>
                                  {plan.name}
                                </div>
                                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                                  {plan.features.join(" • ")}
                                </div>
                              </div>
                              <div style={{ fontSize: "18px", fontWeight: "700", color: plan.color }}>
                                रु {plan.price.toLocaleString("en-IN")}/yr
                              </div>
                            </button>
                          ))}
                          
                          {plans.filter(plan => {
                            const currentPlanIndex = plans.findIndex(p => p.key === subscription.plan);
                            const planIndex = plans.findIndex(p => p.key === plan.key);
                            return planIndex > currentPlanIndex;
                          }).length === 0 && (
                            <div style={{
                              padding: "20px",
                              textAlign: "center",
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              borderRadius: "8px"
                            }}>
                              <div style={{ fontSize: "16px", fontWeight: "700", color: "#059669", marginBottom: "4px" }}>
                                🎉 You're on the highest plan!
                              </div>
                              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                {subscription.storeName} is already on the Enterprise plan with unlimited features.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  );
                  
                default:
                  return (
                    <>
                      <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "700" }}>
                        Action: {type}
                      </h2>
                      <p>Details for {type} action would be displayed here.</p>
                    </>
                  );
              }
            })()
            }
            
            <button
              onClick={() => setActionModal(null)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "16px",
                background: "#1a1d23",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}