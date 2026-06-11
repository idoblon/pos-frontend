import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Save, Shield, Crown, Building, CreditCard, UserCheck } from "lucide-react";
import { getBranchesByStore } from "@/Redux Toolkit/Features/branch/branchThunk";

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
  const dispatch = useDispatch();
  const { stores } = useSelector((state) => state.store);
  const { branches } = useSelector((state) => state.branch);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ROLE_USER",
    status: "active",
    storeId: "",
    branchId: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        role: user.role || "ROLE_USER",
        status: user.status || "active",
        storeId: user.storeId || "",
        branchId: user.branchId || ""
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "ROLE_USER",
        status: "active",
        storeId: "",
        branchId: ""
      });
    }
    setErrors({});
  }, [user, isOpen]);

  // Dynamically fetch branches when store selection changes
  useEffect(() => {
    if (isOpen && formData.storeId) {
      dispatch(getBranchesByStore(formData.storeId));
    }
  }, [formData.storeId, isOpen, dispatch]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
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

    if (formData.role === "ROLE_STORE_ADMIN" || formData.role === "ROLE_BRANCH_MANAGER" || formData.role === "ROLE_BRANCH_CASHIER") {
      if (!formData.storeId) newErrors.storeId = "Store is required";
    }
    if (formData.role === "ROLE_BRANCH_MANAGER" || formData.role === "ROLE_BRANCH_CASHIER") {
      if (!formData.branchId) newErrors.branchId = "Branch is required";
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
      
      // Clean up fields based on role before saving
      if (submitData.role === "ROLE_ADMIN" || submitData.role === "ROLE_USER") {
        submitData.storeId = null;
        submitData.branchId = null;
      } else if (submitData.role === "ROLE_STORE_ADMIN") {
        submitData.branchId = null;
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
      padding: "20px",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "520px",
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid #f3f4f6"
        }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#111827" }}>
            {user ? "Edit Platform User" : "Add New Platform User"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "#9ca3af",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#111827"; e.currentTarget.style.background = "#f3f4f6"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "none"; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Full Name */}
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${errors.fullName ? "#ef4444" : "#d1d5db"}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = errors.fullName ? "#ef4444" : "#6366f1"}
                onBlur={(e) => e.target.style.borderColor = errors.fullName ? "#ef4444" : "#d1d5db"}
              />
              {errors.fullName && (
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444", fontWeight: "500" }}>
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${errors.email ? "#ef4444" : "#d1d5db"}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = errors.email ? "#ef4444" : "#6366f1"}
                onBlur={(e) => e.target.style.borderColor = errors.email ? "#ef4444" : "#d1d5db"}
              />
              {errors.email && (
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444", fontWeight: "500" }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Passwords */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  {user ? "New Password" : "Password *"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  placeholder={user ? "Leave blank to keep" : ""}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${errors.password ? "#ef4444" : "#d1d5db"}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = errors.password ? "#ef4444" : "#6366f1"}
                  onBlur={(e) => e.target.style.borderColor = errors.password ? "#ef4444" : "#d1d5db"}
                />
                {errors.password && (
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444", fontWeight: "500" }}>
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${errors.confirmPassword ? "#ef4444" : "#d1d5db"}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = errors.confirmPassword ? "#ef4444" : "#6366f1"}
                  onBlur={(e) => e.target.style.borderColor = errors.confirmPassword ? "#ef4444" : "#d1d5db"}
                />
                {errors.confirmPassword && (
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444", fontWeight: "500" }}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Role & Status Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* Role */}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  Role
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "10px 40px 10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      background: "white",
                      appearance: "none",
                      cursor: "pointer"
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

              {/* Status */}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    background: "white",
                    cursor: "pointer"
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Assignments (Stores / Branches Selectors) */}
            {(formData.role === "ROLE_STORE_ADMIN" || formData.role === "ROLE_BRANCH_MANAGER" || formData.role === "ROLE_BRANCH_CASHIER") && (
              <div style={{ 
                borderTop: "1px solid #f3f4f6", 
                paddingTop: "16px", 
                marginTop: "8px", 
                display: "flex", 
                flexDirection: "column", 
                gap: "16px" 
              }}>
                <h4 style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                  Store & Branch Assignments
                </h4>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {/* Select Store */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4b5563", marginBottom: "6px" }}>
                      Assigned Store *
                    </label>
                    <select
                      value={formData.storeId}
                      onChange={(e) => setFormData({...formData, storeId: e.target.value, branchId: ""})}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: `1px solid ${errors.storeId ? "#ef4444" : "#d1d5db"}`,
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        background: "white",
                        cursor: "pointer"
                      }}
                    >
                      <option value="">-- Choose Store --</option>
                      {stores.map(store => (
                        <option key={store.id} value={store.id}>
                          {store.brand}
                        </option>
                      ))}
                    </select>
                    {errors.storeId && (
                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444", fontWeight: "500" }}>
                        {errors.storeId}
                      </p>
                    )}
                  </div>

                  {/* Select Branch */}
                  {(formData.role === "ROLE_BRANCH_MANAGER" || formData.role === "ROLE_BRANCH_CASHIER") && (
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4b5563", marginBottom: "6px" }}>
                        Assigned Branch *
                      </label>
                      <select
                        value={formData.branchId}
                        onChange={(e) => setFormData({...formData, branchId: e.target.value})}
                        disabled={!formData.storeId}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: `1px solid ${errors.branchId ? "#ef4444" : "#d1d5db"}`,
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          background: formData.storeId ? "white" : "#f3f4f6",
                          cursor: formData.storeId ? "pointer" : "not-allowed"
                        }}
                      >
                        <option value="">-- Choose Branch --</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                      {errors.branchId && (
                        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444", fontWeight: "500" }}>
                          {errors.branchId}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid #f3f4f6"
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                background: "white",
                color: "#4b5563",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.background = "#f9fafb"}
              onMouseLeave={(e) => e.target.style.background = "white"}
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
                borderRadius: "8px",
                background: loading ? "#9ca3af" : "#4f46e5",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06)",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.background = "#4338ca"; }}
              onMouseLeave={(e) => { if (!loading) e.target.style.background = "#4f46e5"; }}
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