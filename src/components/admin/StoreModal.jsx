import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

export default function StoreModal({ 
  isOpen, 
  onClose, 
  store = null, 
  onSave,
  loading = false 
}) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    status: "active",
    managerName: "",
    managerEmail: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "",
        address: store.address || "",
        phone: store.phone || "",
        email: store.email || "",
        status: store.status || "active",
        managerName: store.managerName || "",
        managerEmail: store.managerEmail || ""
      });
    } else {
      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
        status: "active",
        managerName: "",
        managerEmail: ""
      });
    }
    setErrors({});
  }, [store, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Store name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.managerEmail && !/\S+@\S+\.\S+/.test(formData.managerEmail)) {
      newErrors.managerEmail = "Invalid email format";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

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
            {store ? "Edit Store" : "Add New Store"}
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
                Store Name *
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
                Address *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${errors.address ? "#f56565" : "#e2e8f0"}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  resize: "vertical",
                  minHeight: "80px"
                }}
              />
              {errors.address && (
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#f56565" }}>
                  {errors.address}
                </p>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
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

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  Email
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

            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px", marginTop: "8px" }}>
              <h4 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "600" }}>
                Store Manager (Optional)
              </h4>
              
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  Manager Name
                </label>
                <input
                  type="text"
                  value={formData.managerName}
                  onChange={(e) => setFormData({...formData, managerName: e.target.value})}
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

              <div style={{ marginTop: "12px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  Manager Email
                </label>
                <input
                  type="email"
                  value={formData.managerEmail}
                  onChange={(e) => setFormData({...formData, managerEmail: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${errors.managerEmail ? "#f56565" : "#e2e8f0"}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                {errors.managerEmail && (
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#f56565" }}>
                    {errors.managerEmail}
                  </p>
                )}
              </div>
            </div>
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
              {loading ? "Saving..." : store ? "Update Store" : "Create Store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}