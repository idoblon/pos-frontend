import React, { useState } from "react";
import { Info, Database, Zap, ChevronDown, ChevronUp } from "lucide-react";

export default function DataSourceInfo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: "#f0f9ff",
      border: "1px solid #bae6fd",
      borderRadius: "8px",
      padding: "12px",
      marginBottom: "16px"
    }}>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Info size={16} color="#0369a1" />
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#0369a1" }}>
            Data Source Information
          </span>
        </div>
        {expanded ? <ChevronUp size={14} color="#0369a1" /> : <ChevronDown size={14} color="#0369a1" />}
      </div>
      
      {expanded && (
        <div style={{ marginTop: "12px", fontSize: "11px", color: "#0c4a6e" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                <Database size={12} />
                <strong>From Database:</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: "16px" }}>
                <li>Store Name (brand field)</li>
                <li>Store Address & Contact</li>
                <li>Employee Count</li>
                <li>Branch Count</li>
                <li>Store Status</li>
                <li>Creation Date</li>
              </ul>
            </div>
            
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                <Zap size={12} />
                <strong>Simulated (for demo):</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: "16px" }}>
                <li>Subscription Plans</li>
                <li>Payment Dates</li>
                <li>Revenue Numbers</li>
                <li>Expiry Dates</li>
                <li>Subscription Status</li>
              </ul>
            </div>
          </div>
          
          <div style={{ 
            marginTop: "8px", 
            padding: "6px", 
            background: "#e0f2fe", 
            borderRadius: "4px",
            fontSize: "10px"
          }}>
            <strong>Note:</strong> Real stores from your database are shown with simulated subscription data. 
            In production, subscription fields would be added to your database schema.
          </div>
        </div>
      )}
    </div>
  );
}