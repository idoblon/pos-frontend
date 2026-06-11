import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Store, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { getAllStores } from "@/Redux Toolkit/Features/Store/storeThunk";
import { getStoreName, resolveSubscriptionPlan } from "@/util/registrationDataMerger";

const SUBSCRIPTION_PLANS = {
  BASIC: { 
    name: "Basic", 
    price: "रु 3,500/year",
    priceValue: 3500,
    color: "#1a1d23",
    features: ["1 Store", "3 Branches", "10 Users", "Basic Support"]
  },
  PROFESSIONAL: { 
    name: "Professional", 
    price: "रु 7,000/year",
    priceValue: 7000,
    color: "#1a1d23",
    features: ["1 Store", "10 Branches", "50 Users", "Priority Support", "Advanced Reports"]
  },
  ENTERPRISE: { 
    name: "Enterprise", 
    price: "रु 10,000/year",
    priceValue: 10000,
    color: "#1a1d23",
    features: ["Unlimited Stores", "Unlimited Branches", "Unlimited Users", "24/7 Support", "Custom Features"]
  },
};

function StoreSubscriptionCard({ store }) {
  const planDetails = SUBSCRIPTION_PLANS[store.plan] || SUBSCRIPTION_PLANS.BASIC;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "20px",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Store Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "12px",
          background: "#1a1d23", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <Store size={20} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#1a1d23" }}>
            {store.storeName}
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
            Admin: {store.adminName || "N/A"}
          </p>
        </div>
      </div>

      {/* Subscription Plan */}
      <div style={{
        background: "#f8fafc",
        border: "2px solid #1a1d23",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: "12px", fontWeight: "600", color: "#1a1d23",
          textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px",
        }}>
          Subscription Plan
        </div>
        <div style={{ fontSize: "24px", fontWeight: "700", color: "#1a1d23", marginBottom: "4px" }}>
          {planDetails.name}
        </div>
        <div style={{ fontSize: "14px", color: "#6b7280" }}>
          {planDetails.price}
        </div>
        {planDetails.features && (
          <div style={{ marginTop: "12px", textAlign: "left" }}>
            {planDetails.features.map((feature, idx) => (
              <div key={idx} style={{ 
                fontSize: "11px", 
                color: "#6b7280", 
                marginBottom: "4px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span style={{ 
                  width: "4px", 
                  height: "4px", 
                  borderRadius: "50%", 
                  background: "#1a1d23" 
                }} />
                {feature}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Store Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
        <div style={{ textAlign: "center", padding: "8px", background: "#f8fafc", borderRadius: "6px" }}>
          <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#1a1d23" }}>
            {store.branches || 0}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#6b7280" }}>Branches</p>
        </div>
        <div style={{ textAlign: "center", padding: "8px", background: "#f8fafc", borderRadius: "6px" }}>
          <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#1a1d23" }}>
            {store.users || 0}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#6b7280" }}>Users</p>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionManagement() {
  const dispatch = useDispatch();
  const { stores, loading: storesLoading } = useSelector((s) => s.store);
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriptionData, setSubscriptionData] = useState([]);

  useEffect(() => {
    dispatch(getAllStores());
  }, [dispatch]);

  useEffect(() => {
    if (stores && stores.length > 0) {
      const transformed = stores.map((store) => {
        const plan = resolveSubscriptionPlan(store);

        return {
          id: store._id || store.id,
          storeName: getStoreName(store) || "Unnamed Store",
          plan,
          branches: store.estimatedBranches ?? store.branches?.length ?? 1,
          users: store.estimatedUsers ?? store.employees?.length ?? 1,
          adminName: store.fullName || store.ownerName || "Store Admin",
        };
      });
      setSubscriptionData(transformed);
    } else {
      setSubscriptionData([]);
    }
  }, [stores]);

  const filtered = subscriptionData.filter((s) =>
    s.storeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "24px", fontFamily: "'DM Sans','Inter',sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "700", color: "#1a1d23" }}>
            Subscription Plans
          </h1>
          <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
            View subscription plan for each store
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} color="#6b7280" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "8px 12px 8px 32px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "12px",
                outline: "none",
                width: "200px",
              }}
            />
          </div>
          <button
            onClick={() => { dispatch(getAllStores()); toast.success("Refreshed"); }}
            style={{
              padding: "8px 12px", background: "white", border: "1px solid #e5e7eb",
              borderRadius: "6px", cursor: "pointer", display: "flex",
              alignItems: "center", gap: "4px", fontSize: "12px", color: "#6b7280",
            }}
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      {/* Grid */}
      {storesLoading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: "white", border: "1px solid #e5e7eb",
          borderRadius: "10px", padding: "40px", textAlign: "center",
        }}>
          <Store size={48} color="#e5e7eb" style={{ margin: "0 auto 16px", display: "block" }} />
          <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: "600", color: "#1a1d23" }}>
            No Stores Found
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
            No stores are currently registered in the system
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {filtered.map((store) => (
            <StoreSubscriptionCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </div>
  );
}
