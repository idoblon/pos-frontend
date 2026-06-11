import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus, Search, Filter, MoreHorizontal, Edit2,
  Trash2, Eye, UserCheck, UserX, Shield, Crown,
  Building, CreditCard, AlertCircle, CheckCircle, X
} from "lucide-react";
import UserModal from "@/components/admin/UserModal";
import { toast } from "sonner";
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus 
} from "@/Redux Toolkit/Features/user/userThunk";
import { getAllStores } from "@/Redux Toolkit/Features/Store/storeThunk";

const roleIcons = {
  'ROLE_ADMIN': Crown,
  'ROLE_STORE_ADMIN': Shield,
  'ROLE_BRANCH_MANAGER': Building,
  'ROLE_BRANCH_CASHIER': CreditCard,
  'ROLE_USER': UserCheck
};

const roleColors = {
  'ROLE_ADMIN': '#7c3aed', // Purple
  'ROLE_STORE_ADMIN': '#2563eb', // Blue
  'ROLE_BRANCH_MANAGER': '#06b6d4', // Cyan
  'ROLE_BRANCH_CASHIER': '#10b981', // Green
  'ROLE_USER': '#6b7280' // Gray
};

const roleLabels = {
  'ROLE_ADMIN': 'Platform Admin',
  'ROLE_STORE_ADMIN': 'Store Owner',
  'ROLE_BRANCH_MANAGER': 'Branch Manager',
  'ROLE_BRANCH_CASHIER': 'Cashier',
  'ROLE_USER': 'Employee'
};

function UserCard({ user, onEdit, onView, onDelete, onToggleStatus }) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const RoleIcon = roleIcons[user.role] || UserCheck;
  const roleColor = roleColors[user.role] || '#718096';
  const roleLabel = roleLabels[user.role] || user.role;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#f59e0b';
      case 'suspended': return '#ef4444';
      default: return '#718096';
    }
  };

  return (
    <div style={{
      background: "white",
      border: "1px solid #f3f4f6",
      borderRadius: "16px",
      padding: "20px",
      position: "relative",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)";
    }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${roleColor}15, ${roleColor}30)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid ${roleColor}20`
          }}>
            <span style={{
              fontSize: "18px",
              fontWeight: "600",
              color: roleColor
            }}>
              {(user.fullName || user.name)?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
              {user.fullName || user.name || "Unnamed User"}
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#6b7280" }}>
              {user.email}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
              <RoleIcon size={12} color={roleColor} />
              <span style={{
                fontSize: "11px",
                color: roleColor,
                fontWeight: "600"
              }}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              padding: "6px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#111827"; e.currentTarget.style.background = "#f3f4f6"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "none"; }}
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "4px",
              background: "white",
              border: "1px solid #f3f4f6",
              borderRadius: "10px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              minWidth: "160px",
              zIndex: 10,
              overflow: "hidden",
              padding: "4px"
            }}>
              <button
                onClick={() => { onView(user); setMenuOpen(false); }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "none",
                  border: "none",
                  borderRadius: "6px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "#374151",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.background = "#f9fafb"}
                onMouseLeave={(e) => e.target.style.background = "none"}
              >
                <Eye size={14} />
                View Details
              </button>
              <button
                onClick={() => { onEdit(user); setMenuOpen(false); }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "none",
                  border: "none",
                  borderRadius: "6px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "#374151",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.background = "#f9fafb"}
                onMouseLeave={(e) => e.target.style.background = "none"}
              >
                <Edit2 size={14} />
                Edit User
              </button>
              <button
                onClick={() => { onToggleStatus(user); setMenuOpen(false); }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "none",
                  border: "none",
                  borderRadius: "6px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: user.status === 'active' ? "#d97706" : "#059669",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.background = "#f9fafb"}
                onMouseLeave={(e) => e.target.style.background = "none"}
              >
                {user.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                {user.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => { onDelete(user); setMenuOpen(false); }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "none",
                  border: "none",
                  borderRadius: "6px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "#dc2626",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.background = "#fee2e2"}
                onMouseLeave={(e) => e.target.style.background = "none"}
              >
                <Trash2 size={14} />
                Delete User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>Status:</span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {user.status === 'active' ? (
              <CheckCircle size={12} color="#10b981" />
            ) : (
              <AlertCircle size={12} color="#f59e0b" />
            )}
            <span style={{
              fontSize: "12px",
              color: getStatusColor(user.status),
              fontWeight: "600",
              textTransform: "capitalize"
            }}>
              {user.status || 'Active'}
            </span>
          </div>
        </div>
        
        {user.storeName && (
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
            Store: <span style={{ color: "#374151", fontWeight: "600" }}>{user.storeName}</span>
          </div>
        )}
        
        {user.branchName && (
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            Branch: <span style={{ color: "#374151", fontWeight: "600" }}>{user.branchName}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        paddingTop: "12px",
        borderTop: "1px solid #f3f4f6"
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#111827" }}>
            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
          </p>
          <p style={{ margin: 0, fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", fontWeight: "500" }}>Last Login</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#111827" }}>
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
          </p>
          <p style={{ margin: 0, fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", fontWeight: "500" }}>Created</p>
        </div>
      </div>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 5
          }}
        />
      )}
    </div>
  );
}

function UserDetailsModal({ isOpen, onClose, user }) {
  if (!isOpen || !user) return null;

  const RoleIcon = roleIcons[user.role] || UserCheck;
  const roleLabel = roleLabels[user.role] || user.role;
  const roleColor = roleColors[user.role] || '#718096';

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
        maxWidth: "460px",
        padding: "24px",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#111827" }}>
            User Account Details
          </h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: "none", 
              border: "none", 
              cursor: "pointer", 
              color: "#9ca3af",
              padding: "4px",
              borderRadius: "50%"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
          >
            <X size={18} />
          </button>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#f9fafb", padding: "16px", borderRadius: "12px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${roleColor}20, ${roleColor}40)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600",
              color: roleColor,
              fontSize: "18px"
            }}>
              {(user.fullName || user.name)?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                {user.fullName || user.name || "Unnamed User"}
              </h4>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#6b7280" }}>
                {user.email}
              </p>
            </div>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "110px 1fr", 
            gap: "12px", 
            fontSize: "14px",
            borderTop: "1px solid #f3f4f6",
            paddingTop: "16px" 
          }}>
            <div style={{ fontWeight: "600", color: "#4b5563" }}>Role:</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#111827" }}>
              <RoleIcon size={14} color={roleColor} />
              <span style={{ fontWeight: "500" }}>{roleLabel}</span>
            </div>

            <div style={{ fontWeight: "600", color: "#4b5563" }}>Status:</div>
            <div style={{ 
              color: user.status === 'active' ? '#10b981' : user.status === 'suspended' ? '#ef4444' : '#f59e0b', 
              fontWeight: "600", 
              textTransform: "capitalize" 
            }}>
              {user.status || 'Active'}
            </div>

            {user.phone && (
              <>
                <div style={{ fontWeight: "600", color: "#4b5563" }}>Phone:</div>
                <div style={{ color: "#111827" }}>{user.phone}</div>
              </>
            )}

            {user.storeName && (
              <>
                <div style={{ fontWeight: "600", color: "#4b5563" }}>Store:</div>
                <div style={{ color: "#111827", fontWeight: "500" }}>{user.storeName}</div>
              </>
            )}

            {user.branchName && (
              <>
                <div style={{ fontWeight: "600", color: "#4b5563" }}>Branch:</div>
                <div style={{ color: "#111827", fontWeight: "500" }}>{user.branchName}</div>
              </>
            )}

            <div style={{ fontWeight: "600", color: "#4b5563" }}>Created At:</div>
            <div style={{ color: "#111827" }}>
              {user.createdAt ? new Date(user.createdAt).toLocaleString() : "Unknown"}
            </div>

            <div style={{ fontWeight: "600", color: "#4b5563" }}>Last Login:</div>
            <div style={{ color: "#111827" }}>
              {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never logged in"}
            </div>
          </div>
        </div>
        
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              background: "#111827",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.background = "#374151"}
            onMouseLeave={(e) => e.target.style.background = "#111827"}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, userName, loading }) {
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
      padding: "20px",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "400px",
        padding: "24px",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        textAlign: "center"
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "#fee2e2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px"
        }}>
          <AlertCircle size={24} color="#dc2626" />
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "600", color: "#111827" }}>
          Delete User Account
        </h3>
        <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#6b7280", lineHeight: "1.5" }}>
          Are you sure you want to delete user <strong>{userName}</strong>? This will remove their platform/store access.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 20px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              background: "white",
              color: "#374151",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.background = "#f9fafb"}
            onMouseLeave={(e) => e.target.style.background = "white"}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              background: loading ? "#fca5a5" : "#dc2626",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { if (!loading) e.target.style.background = "#b91c1c"; }}
            onMouseLeave={(e) => { if (!loading) e.target.style.background = "#dc2626"; }}
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.user);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [detailsUser, setDetailsUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch all users and all stores on component mount
  useEffect(() => {
    console.log('🔍 Fetching platform users and stores...');
    dispatch(getAllUsers());
    dispatch(getAllStores());
  }, [dispatch]);

  // Use all users loaded from backend
  const displayUsers = users || [];

  const filteredUsers = displayUsers.filter(user => {
    const matchesSearch = (user.fullName || user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.storeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.branchName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleView = (user) => {
    setDetailsUser(user);
    setShowDetailsModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteClick = (user) => {
    setDeleteConfirmUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmUser) return;
    setDeleteLoading(true);
    try {
      await dispatch(deleteUser(deleteConfirmUser.id)).unwrap();
      toast.success(`User "${deleteConfirmUser.fullName || deleteConfirmUser.name}" deleted successfully`);
      setShowDeleteModal(false);
      setDeleteConfirmUser(null);
    } catch (err) {
      toast.error(err || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await dispatch(toggleUserStatus({ userId: user.id, status: newStatus })).unwrap();
      toast.success(`User status updated to "${newStatus}"`);
    } catch (err) {
      toast.error(err || "Failed to update user status");
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleSaveUser = async (formData) => {
    try {
      if (selectedUser) {
        await dispatch(updateUser({ userId: selectedUser.id, userData: formData })).unwrap();
        toast.success("User updated successfully");
      } else {
        await dispatch(createUser(formData)).unwrap();
        toast.success("User created successfully");
      }
      
      setShowModal(false);
      setSelectedUser(null);
    } catch (err) {
      toast.error(err || (selectedUser ? "Failed to update user" : "Failed to create user"));
    }
  };

  // Get role distribution for all loaded users
  const roleDistribution = displayUsers.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "700",
            color: "#111827",
            letterSpacing: "-0.5px"
          }}>
            Platform User Management
          </h1>
          <p style={{
            margin: "4px 0 0",
            fontSize: "15px",
            color: "#6b7280"
          }}>
            Manage administrative platform credentials, store owners, managers, cashiers, and account statuses.
          </p>
        </div>
        
        <button
          onClick={handleAddUser}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#111827",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 6px -1px rgba(17, 24, 39, 0.1), 0 2px 4px -1px rgba(17, 24, 39, 0.06)",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(17, 24, 39, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(17, 24, 39, 0.1)";
          }}
        >
          <Plus size={18} color="white" />
          Add User Account
        </button>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px"
      }}>
        {Object.entries(roleLabels).map(([role, label]) => (
          <div
            key={role}
            style={{
              background: "white",
              border: "1px solid #f3f4f6",
              borderRadius: "14px",
              padding: "16px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{
              width: "40px",
              height: "40px",
              margin: "0 auto 12px",
              borderRadius: "10px",
              background: `${roleColors[role]}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {React.createElement(roleIcons[role], { size: 20, color: roleColors[role] })}
            </div>
            <p style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "700",
              color: "#111827"
            }}>
              {roleDistribution[role] || 0}
            </p>
            <p style={{
              margin: 0,
              fontSize: "12px",
              color: "#6b7280",
              fontWeight: "500",
              marginTop: "4px"
            }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: "white",
        border: "1px solid #f3f4f6",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        gap: "16px",
        alignItems: "center",
        flexWrap: "wrap",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1", minWidth: "300px" }}>
          <Search size={18} color="#9ca3af" style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)"
          }} />
          <input
            type="text"
            placeholder="Search by name, email, store or branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 42px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              transition: "all 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#6366f1"}
            onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
          />
        </div>

        {/* Role Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={16} color="#6b7280" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              background: "white",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="all">All Roles</option>
            {Object.entries(roleLabels).map(([role, label]) => (
              <option key={role} value={role}>{label}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            background: "white",
            cursor: "pointer",
            outline: "none"
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>

        {/* Results Count */}
        <div style={{
          padding: "8px 14px",
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          fontSize: "13px",
          color: "#4b5563",
          fontWeight: "500"
        }}>
          {filteredUsers.length} users found
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && displayUsers.length === 0 && (
        <div style={{
          background: "white",
          border: "1px solid #f3f4f6",
          borderRadius: "16px",
          padding: "60px 20px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "15px", color: "#6b7280" }}>Loading system accounts...</div>
        </div>
      )}

      {error && (
        <div style={{
          background: "white",
          border: "1px solid #fecaca",
          borderRadius: "16px",
          padding: "20px",
          textAlign: "center",
          marginBottom: "20px"
        }}>
          <AlertCircle size={24} color="#dc2626" style={{ margin: "0 auto 8px" }} />
          <div style={{ color: "#dc2626", fontSize: "14px", fontWeight: "500" }}>{error}</div>
          <button
            onClick={() => dispatch(getAllUsers())}
            style={{
              marginTop: "12px",
              padding: "8px 16px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.background = "#b91c1c"}
            onMouseLeave={(e) => e.target.style.background = "#dc2626"}
          >
            Retry Fetch
          </button>
        </div>
      )}

      {/* User Grid */}
      {!error && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px"
        }}>
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredUsers.length === 0 && (
        <div style={{
          background: "white",
          border: "1px solid #f3f4f6",
          borderRadius: "16px",
          padding: "60px 20px",
          textAlign: "center"
        }}>
          <UserCheck size={48} color="#9ca3af" style={{ margin: "0 auto 16px" }} />
          <h3 style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "600",
            color: "#111827",
            marginBottom: "8px"
          }}>
            No platform accounts found
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
            {searchTerm || filterRole !== "all" || filterStatus !== "all" 
              ? "Try adjusting your search query or role filter criteria" 
              : "Get started by adding your first user account"
            }
          </p>
        </div>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={selectedUser}
        onSave={handleSaveUser}
        loading={loading}
      />

      {/* Details View Modal */}
      <UserDetailsModal
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setDetailsUser(null); }}
        user={detailsUser}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteConfirmUser(null); }}
        onConfirm={handleDeleteConfirm}
        userName={deleteConfirmUser?.fullName || deleteConfirmUser?.name}
        loading={deleteLoading}
      />
    </div>
  );
}