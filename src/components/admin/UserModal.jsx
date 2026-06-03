import React, { useState, useEffect } from "react";
import { X, Save, Shield, Crown, Building, CreditCard, UserCheck } from "lucide-react";

const roleOptions = [
  { value: "ROLE_ADMIN", label: "Super Admin", icon: Crown, color: "#9f7aea" },
  { value: "ROLE_STORE_ADMIN", label: "Store Admin", icon: Shield, color: "#667eea" },
  { value: "ROLE_BRANCH_MANAGER", label: "Branch Manager", icon: Building, color: "#4299e1" },
  { value: "ROLE_BRANCH_CASHIER", label: "Cashier", icon: CreditCard, color: "#48bb78" },
  { value: "ROLE_USER", label: "User", icon: UserCheck, color: "#718096" }
];

export default function UserModal({ 
  isOpen, 
  onClose, 
  user = null, 
  onSave,
  loading = false 
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ROLE_USER",
    status: "active",
    storeName: "",
    branchName: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        role: user.role || "ROLE_USER",
        status: user.status || "active",
        storeName: user.storeName || "",
        branchName: user.branchName || ""
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "ROLE_USER",
        status: "active",
        storeName: "",
        branchName: ""
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    
    if (!user) { // Only validate password for new users
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else if (formData.password) { // For existing users, only validate if password is provided
      if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = { ...formData };
      if (user && !submitData.password) {
        delete submitData.password;
        delete submitData.confirmPassword;
      }
      onSave(submitData);
    }
  };

  if (!isOpen) return null;

  const selectedRole = roleOptions.find(r => r.value === formData.role);
  const RoleIcon = selectedRole?.icon || UserCheck;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "500px",
        maxHeight: "90vh",
        overflow: "auto"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid #e2e8f0"
        }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
            {user ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px"
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${errors.name ? "#f56565" : "#e2e8f0"}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
              {errors.name && (
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#f56565" }}>
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${errors.email ? "#f56565" : "#e2e8f0"}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
              {errors.email && (
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#f56565" }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  {user ? "New Password (leave blank to keep current)" : "Password *"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${errors.password ? "#f56565" : "#e2e8f0"}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                {errors.password && (
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#f56565" }}>
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${errors.confirmPassword ? "#f56565" : "#e2e8f0"}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                {errors.confirmPassword && (
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#f56565" }}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                Role
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none",
                    background: "white",
                    appearance: "none"
                  }}
                >
                  {roleOptions.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <div style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none"
                }}>
                  <RoleIcon size={16} color={selectedRole?.color} />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  background: "white"
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {(formData.role === "ROLE_STORE_ADMIN" || formData.role === "ROLE_BRANCH_MANAGER" || formData.role === "ROLE_BRANCH_CASHIER") && (
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px", marginTop: "8px" }}>
                <h4 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "600" }}>
                  Assignment Details
                </h4>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={formData.storeName}
                      onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "14px",
                        outline: "none"
                      }}
                    />
                  </div>

                  {(formData.role === "ROLE_BRANCH_MANAGER" || formData.role === "ROLE_BRANCH_CASHIER") && (
                    <div>
                      <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                        Branch Name
                      </label>
                      <input
                        type="text"
                        value={formData.branchName}
                        onChange={(e) => setFormData({...formData, branchName: e.target.value})}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          fontSize: "14px",
                          outline: "none"
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid #f0f0f0"
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                background: "white",
                color: "#4a5568",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                background: loading ? "#a0aec0" : "#667eea",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              <Save size={16} />
              {loading ? "Saving..." : user ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}