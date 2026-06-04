import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Database, CheckCircle, AlertCircle, Store, Users, Building2 } from "lucide-react";
import { getAllStores } from "@/Redux Toolkit/Features/Store/storeThunk";

export default function DatabaseStoreStatus() {
  const dispatch = useDispatch();
  const { stores, loading, error } = useSelector((s) => s.store);
  const [connectionStatus, setConnectionStatus] = useState("checking");

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      setConnectionStatus("checking");
      await dispatch(getAllStores()).unwrap();
      setConnectionStatus("connected");
    } catch (error) {
      console.error("Database connection failed:", error);
      setConnectionStatus("disconnected");
    }
  };

  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case "connected":
        return {
          icon: CheckCircle,
          color: "#059669",
          bg: "#dcfce7",
          text: "Database Connected"
        };
      case "disconnected":
        return {
          icon: AlertCircle,
          color: "#dc2626", 
          bg: "#fee2e2",
          text: "Database Disconnected"
        };
      default:
        return {
          icon: Database,
          color: "#f59e0b",
          bg: "#fef3c7",
          text: "Checking Connection..."
        };
    }
  };

  const status = getConnectionStatusDisplay();
  const StatusIcon = status.icon;

  const storeStats = {
    totalStores: stores?.length || 0,
    activeStores: stores?.filter(store => store.status?.toLowerCase() === "active")?.length || 0,
    totalEmployees: stores?.reduce((sum, store) => sum + (store.employees?.length || 0), 0) || 0,
    totalBranches: stores?.reduce((sum, store) => sum + (store.branches?.length || 0), 0) || 0
  };

  return (
    <div style={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "20px"
    }}>
      {/* Database Status */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "16px",
        padding: "12px",
        background: status.bg,
        borderRadius: "8px"
      }}>
        <StatusIcon size={20} color={status.color} />
        <div>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: status.color }}>
            {status.text}
          </h3>
          <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>
            {connectionStatus === "connected" 
              ? `Successfully loaded ${storeStats.totalStores} stores from database`
              : connectionStatus === "disconnected"
              ? "Unable to connect to database. Check your backend server."
              : "Establishing connection to database..."
            }
          </p>
        </div>
      </div>

      {/* Store Statistics from Database */}
      {connectionStatus === "connected" && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "16px"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              marginBottom: "4px"
            }}>
              <Store size={14} color="#3b82f6" />
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280" }}>
                Total Stores
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1a1d23" }}>
              {storeStats.totalStores}
            </p>
            <p style={{ margin: 0, fontSize: "10px", color: "#6b7280" }}>
              {storeStats.activeStores} active
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{
              display: "flex",
              alignItems: "center", 
              justifyContent: "center",
              gap: "6px",
              marginBottom: "4px"
            }}>
              <Building2 size={14} color="#059669" />
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280" }}>
                Branches
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1a1d23" }}>
              {storeStats.totalBranches}
            </p>
            <p style={{ margin: 0, fontSize: "10px", color: "#6b7280" }}>
              across all stores
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center", 
              gap: "6px",
              marginBottom: "4px"
            }}>
              <Users size={14} color="#7c3aed" />
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280" }}>
                Employees
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1a1d23" }}>
              {storeStats.totalEmployees}
            </p>
            <p style={{ margin: 0, fontSize: "10px", color: "#6b7280" }}>
              total users
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={checkDatabaseConnection}
              disabled={loading}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: loading ? "#e5e7eb" : "#1a1d23",
                color: loading ? "#6b7280" : "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Loading..." : "Refresh Data"}
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          marginTop: "12px",
          padding: "8px 12px",
          background: "#fee2e2",
          border: "1px solid #fecaca",
          borderRadius: "6px"
        }}>
          <p style={{ margin: 0, fontSize: "11px", color: "#dc2626" }}>
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}
    </div>
  );
}