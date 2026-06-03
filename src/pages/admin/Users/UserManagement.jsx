import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus, Search, Filter, MoreHorizontal, Edit2,
  Trash2, Eye, UserCheck, UserX, Shield, Crown,
  Building, CreditCard, AlertCircle, CheckCircle
} from "lucide-react";
import UserModal from "@/components/admin/UserModal";
import { toast } from "sonner";

const roleIcons = {
  'ROLE_ADMIN': Crown,
  'ROLE_STORE_ADMIN': Shield,
  'ROLE_BRANCH_MANAGER': Building,
  'ROLE_BRANCH_CASHIER': CreditCard,
  'ROLE_USER': UserCheck
};

const roleColors = {
  'ROLE_ADMIN': '#9f7aea',
  'ROLE_STORE_ADMIN': '#667eea',
  'ROLE_BRANCH_MANAGER': '#4299e1',
  'ROLE_BRANCH_CASHIER': '#48bb78',
  'ROLE_USER': '#718096'
};

const roleLabels = {
  'ROLE_ADMIN': 'Super Admin',
  'ROLE_STORE_ADMIN': 'Store Admin',
  'ROLE_BRANCH_MANAGER': 'Branch Manager',
  'ROLE_BRANCH_CASHIER': 'Cashier',
  'ROLE_USER': 'User'
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
              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1a202c" }}>
              {user.name || "Unnamed User"}
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
        
        {user.storeName && (
          <div style={{ fontSize: "12px", color: "#718096", marginBottom: "4px" }}>
            Store: <span style={{ color: "#4a5568", fontWeight: "500" }}>{user.storeName}</span>
          </div>
        )}
        
        {user.branchName && (
          <div style={{ fontSize: "12px", color: "#718096" }}>
            Branch: <span style={{ color: "#4a5568", fontWeight: "500" }}>{user.branchName}</span>
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  // Initialize with mock data
  useEffect(() => {
    setUsers([
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@admin.com",
        role: "ROLE_ADMIN",
        status: "active",
        lastLogin: "2024-01-15T10:30:00Z",
        createdAt: "2024-01-01T00:00:00Z"
      },
      {
        id: 2,
        name: "Sarah Wilson",
        email: "sarah.wilson@store1.com",
        role: "ROLE_STORE_ADMIN",
        status: "active",
        storeName: "Downtown Store",
        lastLogin: "2024-01-15T09:15:00Z",
        createdAt: "2024-01-02T00:00:00Z"
      },
      {
        id: 3,
        name: "Mike Johnson",
        email: "mike.johnson@branch1.com",
        role: "ROLE_BRANCH_MANAGER",
        status: "active",
        storeName: "Downtown Store",
        branchName: "Main Branch",
        lastLogin: "2024-01-15T08:45:00Z",
        createdAt: "2024-01-03T00:00:00Z"
      },
      {
        id: 4,
        name: "Lisa Chen",
        email: "lisa.chen@cashier.com",
        role: "ROLE_BRANCH_CASHIER",
        status: "active",
        storeName: "Mall Branch",
        branchName: "Mall Counter",
        lastLogin: "2024-01-15T11:20:00Z",
        createdAt: "2024-01-04T00:00:00Z"
      },
      {
        id: 5,
        name: "David Brown",
        email: "david.brown@inactive.com",
        role: "ROLE_STORE_ADMIN",
        status: "inactive",
        storeName: "Airport Store",
        lastLogin: "2024-01-10T15:30:00Z",
        createdAt: "2024-01-05T00:00:00Z"
      }
    ]);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
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
    if (window.confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUsers(prev => prev.filter(u => u.id !== user.id));
        toast.success(`User "${user.name}" deleted successfully`);
      } catch (error) {
        toast.error("Failed to delete user");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, status: newStatus } : u
      ));
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error("Failed to update user status");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleSaveUser = async (formData) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (selectedUser) {
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id ? { ...user, ...formData } : user
        ));
        toast.success("User updated successfully");
      } else {
        const newUser = {
          id: Date.now(),
          ...formData,
          lastLogin: null,
          createdAt: new Date().toISOString()
        };
        setUsers(prev => [...prev, newUser]);
        toast.success("User created successfully");
      }
      
      setShowModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error(selectedUser ? "Failed to update user" : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  // Get role distribution
  const roleDistribution = users.reduce((acc, user) => {
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
            User Management
          </h1>
          <p style={{
            margin: "4px 0 0",
            fontSize: "16px",
            color: "#718096"
          }}>
            Manage system users, roles, and permissions
          </p>
        </div>
        
        <button
          onClick={handleAddUser}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
          }}
        >
          <Plus size={18} />
          Add New User
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
              {React.createElement(roleIcons[role], { size: 20, color: roleColors[role] })}
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
            placeholder="Search users by name or email..."
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

      {/* User Grid */}
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

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "60px 20px",
          textAlign: "center"
        }}>
          <UserCheck size={48} color="#cbd5e0" style={{ marginBottom: "16px" }} />
          <h3 style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "600",
            color: "#1a202c",
            marginBottom: "8px"
          }}>
            No users found
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