import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus, Search, Filter, MoreHorizontal, Edit2,
  Trash2, Eye, UserCheck, UserX, Shield, Crown,
  Building, CreditCard, AlertCircle, CheckCircle
} from "lucide-react";
import UserModal from "@/components/admin/UserModal";
import { toast } from "sonner";
import { 
  getAllUsers, 
  getAllStoreAdmins,
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus 
} from "@/Redux Toolkit/Features/user/userThunk";

const roleIcons = {
  'ROLE_ADMIN': Crown,
  'ROLE_STORE_ADMIN': Shield,
  'ROLE_BRANCH_MANAGER': Building,
  'ROLE_BRANCH_CASHIER': CreditCard,
  'ROLE_USER': UserCheck
};

const roleColors = {
  'ROLE_ADMIN': '#1a1d23',
  'ROLE_STORE_ADMIN': '#1a1d23',
  'ROLE_BRANCH_MANAGER': '#1a1d23',
  'ROLE_BRANCH_CASHIER': '#1a1d23',
  'ROLE_USER': '#1a1d23'
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
      case 'active': return '#48bb78';
      case 'inactive': return '#ed8936';
      case 'suspended': return '#f56565';
      default: return '#718096';
    }
  };

  return (
    <div style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "20px",
      position: "relative",
      transition: "all 0.2s ease",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
    }}
    onMouseEnter={(e) => e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"}
    onMouseLeave={(e) => e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${roleColor}20, ${roleColor}40)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid ${roleColor}30`
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
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1a202c" }}>
              {user.fullName || user.name || "Unnamed User"}
            </h3>
            <p style={{ margin: "2px 0", fontSize: "14px", color: "#718096" }}>
              {user.email}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
              <RoleIcon size={12} color={roleColor} />
              <span style={{
                fontSize: "12px",
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
              padding: "8px",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background 0.2s ease"
            }}
            onMouseEnter={(e) => e.target.style.background = "#f7fafc"}
            onMouseLeave={(e) => e.target.style.background = "none"}
          >
            <MoreHorizontal size={16} color="#718096" />
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "4px",
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              minWidth: "180px",
              zIndex: 10
            }}>
              <button
                onClick={() => { onView(user); setMenuOpen(false); }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  color: "#4a5568"
                }}
                onMouseEnter={(e) => e.target.style.background = "#f7fafc"}
                onMouseLeave={(e) => e.target.style.background = "none"}
              >
                <Eye size={14} />
                View Details
              </button>
              <button
                onClick={() => { onEdit(user); setMenuOpen(false); }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  color: "#4a5568"
                }}
                onMouseEnter={(e) => e.target.style.background = "#f7fafc"}
                onMouseLeave={(e) => e.target.style.background = "none"}
              >
                <Edit2 size={14} />
                Edit User
              </button>
              <button
                onClick={() => { onToggleStatus(user); setMenuOpen(false); }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  color: user.status === 'active' ? "#ed8936" : "#48bb78"
                }}
                onMouseEnter={(e) => e.target.style.background = "#f7fafc"}
                onMouseLeave={(e) => e.target.style.background = "none"}
              >
                {user.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                {user.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => { onDelete(user); setMenuOpen(false); }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  color: "#e53e3e"
                }}
                onMouseEnter={(e) => e.target.style.background = "#fef2f2"}
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
          <span style={{ fontSize: "12px", color: "#718096" }}>Status:</span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {user.status === 'active' ? (
              <CheckCircle size={12} color="#48bb78" />
            ) : (
              <AlertCircle size={12} color="#ed8936" />
            )}
            <span style={{
              fontSize: "12px",
              color: getStatusColor(user.status),
              fontWeight: "600",
              textTransform: "capitalize"
            }}>
              {user.status}
            </span>
          </div>
        </div>
        
        {user.store && (
          <div style={{ fontSize: "12px", color: "#718096", marginBottom: "4px" }}>
            Store: <span style={{ color: "#4a5568", fontWeight: "500" }}>{user.store.storeName || user.store.brand}</span>
          </div>
        )}
        
        {user.branch && (
          <div style={{ fontSize: "12px", color: "#718096" }}>
            Branch: <span style={{ color: "#4a5568", fontWeight: "500" }}>{user.branch.branchName}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        paddingTop: "12px",
        borderTop: "1px solid #f0f0f0"
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1a202c" }}>
            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
          </p>
          <p style={{ margin: 0, fontSize: "11px", color: "#718096" }}>Last Login</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1a202c" }}>
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
          </p>
          <p style={{ margin: 0, fontSize: "11px", color: "#718096" }}>Created</p>
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

export default function UserManagement() {
  const dispatch = useDispatch();
  const { users, storeAdmins, loading, error } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch store admins (your customers) from database on component mount
  useEffect(() => {
    console.log('🔍 Fetching store admins...');
    // First try to get all store admins, if that fails, get all users and filter
    dispatch(getAllStoreAdmins()).catch(() => {
      console.log('⚠️ Store admins endpoint not available, fetching all users and filtering...');
      dispatch(getAllUsers());
    });
  }, [dispatch]);

  // Debug: Log the data we have
  useEffect(() => {
    console.log('📊 Current data state:', {
      storeAdmins: storeAdmins?.length || 0,
      users: users?.length || 0,
      loading,
      error
    });
    if (users?.length > 0) {
      console.log('👥 All users:', users);
      const storeAdminUsers = users.filter(user => user.role === 'ROLE_STORE_ADMIN');
      console.log('🏪 Store admin users found:', storeAdminUsers);
    }
  }, [storeAdmins, users, loading, error]);

  // Use storeAdmins if available, otherwise filter users for store admins
  const storeAdminUsers = storeAdmins && storeAdmins.length > 0 
    ? storeAdmins 
    : (users || []).filter(user => user.role === 'ROLE_STORE_ADMIN');

  const filteredUsers = (storeAdminUsers || []).filter(user => {
    const matchesSearch = (user.fullName || user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.store?.storeName || user.store?.brand || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleView = (user) => {
    toast.info(`Viewing details for ${user.name}`);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.fullName || user.name}"?`)) {
      try {
        await dispatch(deleteUser(user.id)).unwrap();
        toast.success(`User "${user.fullName || user.name}" deleted successfully`);
      } catch (error) {
        toast.error(error || "Failed to delete user");
      }
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await dispatch(toggleUserStatus({ userId: user.id, status: newStatus })).unwrap();
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error(error || "Failed to update user status");
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
    } catch (error) {
      toast.error(error || (selectedUser ? "Failed to update user" : "Failed to create user"));
    }
  };

  // Get role distribution for store admins only
  const roleDistribution = (storeAdminUsers || []).reduce((acc, user) => {
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
            color: "#1a202c",
            letterSpacing: "-0.5px"
          }}>
            Store Admin Management
          </h1>
          <p style={{
            margin: "4px 0 0",
            fontSize: "16px",
            color: "#718096"
          }}>
            Manage your POS platform customers - store owners and their subscriptions
          </p>
        </div>
        
        <button
          onClick={handleAddUser}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#1a1d23",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(26, 29, 35, 0.4)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(26, 29, 35, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(26, 29, 35, 0.4)";
          }}
        >
          <Plus size={18} color="white" />
          Add Store Customer
        </button>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px"
      }}>
        {Object.entries(roleLabels).map(([role, label]) => (
          <div
            key={role}
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "16px",
              textAlign: "center"
            }}
          >
            <div style={{
              width: "40px",
              height: "40px",
              margin: "0 auto 12px",
              borderRadius: "10px",
              background: `${roleColors[role]}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {React.createElement(roleIcons[role], { size: 20, color: "#1a1d23" })}
            </div>
            <p style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "700",
              color: "#1a202c"
            }}>
              {roleDistribution[role] || 0}
            </p>
            <p style={{
              margin: 0,
              fontSize: "12px",
              color: "#718096",
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
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        gap: "16px",
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1", minWidth: "300px" }}>
          <Search size={18} color="#718096" style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)"
          }} />
          <input
            type="text"
            placeholder="Search by store name, owner name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s ease"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>

        {/* Role Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={16} color="#718096" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #e2e8f0",
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
            border: "1px solid #e2e8f0",
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
          padding: "6px 12px",
          background: "#f7fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#4a5568",
          fontWeight: "500"
        }}>
          {filteredUsers.length} users found
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "60px 20px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "16px", color: "#6b7280" }}>Loading users...</div>
        </div>
      )}

      {error && (
        <div style={{
          background: "white",
          border: "1px solid #fecaca",
          borderRadius: "12px",
          padding: "20px",
          textAlign: "center",
          marginBottom: "20px"
        }}>
          <AlertCircle size={24} color="#dc2626" style={{ marginBottom: "8px" }} />
          <div style={{ color: "#dc2626", fontSize: "14px" }}>{error}</div>
          <button
            onClick={() => dispatch(getAllUsers())}
            style={{
              marginTop: "12px",
              padding: "8px 16px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* User Grid */}
      {!loading && !error && (
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
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredUsers.length === 0 && (
        <div style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "60px 20px",
          textAlign: "center"
        }}>
          <UserCheck size={48} color="#1a1d23" style={{ marginBottom: "16px" }} />
          <h3 style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "600",
            color: "#1a202c",
            marginBottom: "8px"
          }}>
            No store customers found
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#718096", marginBottom: "20px" }}>
            {searchTerm || filterRole !== "all" || filterStatus !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "Get started by adding your first user"
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
    </div>
  );
}