import React, { useState } from "react";
import { Shield, User, Mail, Key, CheckCircle, AlertCircle } from "lucide-react";
import { createPosAdmin, POS_ADMIN_CREDENTIALS } from "@/util/adminSeeder";
import posLogo from "@/logo/pos.png";

export default function AdminSeeder() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCreateAdmin = async () => {
    setIsSeeding(true);
    setResult(null);
    setError(null);

    try {
      const response = await createPosAdmin();
      setResult({
        success: true,
        message: "POS Admin user created successfully!",
        data: response
      });
    } catch (err) {
      setError({
        message: err.response?.data?.message || err.message || "Failed to create admin user",
        details: err.response?.data
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        padding: "40px",
        width: "100%",
        maxWidth: "500px",
        textAlign: "center"
      }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "12px",
              borderRadius: "12px"
            }}>
              <img 
                src={posLogo} 
                alt="POS" 
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
            </div>
            <h1 style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "700",
              color: "#1a202c"
            }}>
              POS Admin Setup
            </h1>
          </div>
          
          <p style={{
            margin: 0,
            fontSize: "16px",
            color: "#718096",
            lineHeight: 1.5
          }}>
            Create the system administrator account to get started
          </p>
        </div>

        {/* Admin Details Card */}
        <div style={{
          background: "#f7fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
          textAlign: "left"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px"
          }}>
            <Shield size={20} color="#667eea" />
            <h3 style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "600",
              color: "#1a202c"
            }}>
              Admin Credentials
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <User size={16} color="#718096" />
              <div>
                <span style={{ fontSize: "14px", color: "#4a5568", fontWeight: "500" }}>
                  Full Name:
                </span>
                <span style={{ fontSize: "14px", color: "#1a202c", marginLeft: "8px" }}>
                  {POS_ADMIN_CREDENTIALS.fullName}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Mail size={16} color="#718096" />
              <div>
                <span style={{ fontSize: "14px", color: "#4a5568", fontWeight: "500" }}>
                  Email:
                </span>
                <span style={{ fontSize: "14px", color: "#1a202c", marginLeft: "8px" }}>
                  {POS_ADMIN_CREDENTIALS.email}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Key size={16} color="#718096" />
              <div>
                <span style={{ fontSize: "14px", color: "#4a5568", fontWeight: "500" }}>
                  Password:
                </span>
                <span style={{ 
                  fontSize: "14px", 
                  color: "#1a202c", 
                  marginLeft: "8px",
                  fontFamily: "monospace",
                  background: "#e2e8f0",
                  padding: "2px 6px",
                  borderRadius: "4px"
                }}>
                  {POS_ADMIN_CREDENTIALS.password}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Shield size={16} color="#718096" />
              <div>
                <span style={{ fontSize: "14px", color: "#4a5568", fontWeight: "500" }}>
                  Role:
                </span>
                <span style={{ 
                  fontSize: "12px", 
                  color: "#667eea", 
                  marginLeft: "8px",
                  background: "#667eea20",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontWeight: "600"
                }}>
                  {POS_ADMIN_CREDENTIALS.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div style={{
            background: "#f0fff4",
            border: "1px solid #9ae6b4",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px"
          }}>
            <CheckCircle size={20} color="#38a169" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ textAlign: "left" }}>
              <p style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "600",
                color: "#38a169",
                marginBottom: "4px"
              }}>
                Success!
              </p>
              <p style={{ margin: 0, fontSize: "14px", color: "#2d3748" }}>
                {result.message}
              </p>
              <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#4a5568" }}>
                You can now login with the credentials above and access the admin dashboard at <code>/admin</code>
              </p>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px"
          }}>
            <AlertCircle size={20} color="#e53e3e" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ textAlign: "left" }}>
              <p style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "600",
                color: "#e53e3e",
                marginBottom: "4px"
              }}>
                Error
              </p>
              <p style={{ margin: 0, fontSize: "14px", color: "#2d3748" }}>
                {error.message}
              </p>
              {error.details && (
                <pre style={{
                  margin: "8px 0 0",
                  fontSize: "11px",
                  color: "#4a5568",
                  background: "#f7fafc",
                  padding: "8px",
                  borderRadius: "4px",
                  overflow: "auto"
                }}>
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleCreateAdmin}
          disabled={isSeeding}
          style={{
            width: "100%",
              background: isSeeding ? "#a0aec0" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "14px 24px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: isSeeding ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "24px"
            }}
          >
            <Shield size={18} />
            {isSeeding ? "Creating Admin User..." : "Create POS Admin User"}
          </button>

        {/* Info */}
        <div style={{
          marginTop: "24px",
          padding: "16px",
          background: "#f7fafc",
          borderRadius: "8px",
          border: "1px solid #e2e8f0"
        }}>
          <p style={{
            margin: 0,
            fontSize: "12px",
            color: "#4a5568",
            lineHeight: 1.4
          }}>
            💡 This will create the system administrator account. If the user already exists, 
            you'll see a message confirming it. The admin user has full system access and can 
            manage all stores, users, and settings.
          </p>
        </div>
      </div>
    </div>
  );
}