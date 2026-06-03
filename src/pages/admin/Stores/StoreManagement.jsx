import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus, Search, Filter, MoreHorizontal, Edit2,
  Trash2, Eye, MapPin, Users, Store as StoreIcon,
  Activity, AlertCircle, CheckCircle
} from "lucide-react";
import StoreModal from "@/components/admin/StoreModal";
import { toast } from "sonner";

function StoreCard({ store, onEdit, onView, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#48bb78';
      case 'inactive': return '#ed8936';
      case 'suspended': return '#f56565';
      default: return '#718096';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return AlertCircle;
      case 'suspended': return AlertCircle;
      default: return Activity;
    }
  };

  const StatusIcon = getStatusIcon(store.status);

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
            borderRadius: "12px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <StoreIcon size={24} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1a202c" }}>
              {store.name}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
              <StatusIcon size={14} color={getStatusColor(store.status)} />
              <span style={{
                fontSize: "12px",
                color: getStatusColor(store.status),
                fontWeight: "600",
                textTransform: "capitalize"
              }}>
                {store.status}
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
              minWidth: "160px",
              zIndex: 10
            }}>
              <button
                onClick={() => { onView(store); setMenuOpen(false); }}
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
                onClick={() => { onEdit(store); setMenuOpen(false); }}
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
                Edit Store
              </button>
              <button
                onClick={() => { onDelete(store); setMenuOpen(false); }}
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
                Delete Store
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Store Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
        <MapPin size={14} color="#718096" />
        <span style={{ fontSize: "14px", color: "#718096" }}>
          {store.address || "Address not provided"}
        </span>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "12px",
        marginTop: "16px",
        paddingTop: "16px",
        borderTop: "1px solid #f0f0f0"
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#1a202c" }}>
            {store.branchCount || 0}
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#718096" }}>Branches</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#1a202c" }}>
            {store.employeeCount || 0}
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#718096" }}>Employees</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#48bb78" }}>
            रु {(store.monthlyRevenue || 0).toLocaleString("en-IN")}
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#718096" }}>Monthly</p>
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

export default function StoreManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);

  // Initialize with mock data - replace with actual API calls
  useEffect(() => {
    setStores([
      {
        id: 1,
        name: "Downtown Store",
        address: "123 Main St, City Center",
        phone: "+977-1-4444444",
        email: "downtown@pos.com",
        status: "active",
        branchCount: 3,
        employeeCount: 25,
        monthlyRevenue: 125000,
        managerName: "John Smith",
        managerEmail: "john.smith@pos.com"
      },
      {
        id: 2,
        name: "Mall Branch",
        address: "456 Shopping Mall, Level 2",
        phone: "+977-1-5555555",
        email: "mall@pos.com",
        status: "active",
        branchCount: 2,
        employeeCount: 18,
        monthlyRevenue: 98000,
        managerName: "Sarah Wilson",
        managerEmail: "sarah.wilson@pos.com"
      },
      {
        id: 3,
        name: "Airport Store",
        address: "Terminal 1, Departure Hall",
        phone: "+977-1-6666666",
        email: "airport@pos.com",
        status: "inactive",
        branchCount: 1,
        employeeCount: 12,
        monthlyRevenue: 45000
      },
      {
        id: 4,
        name: "Suburban Outlet",
        address: "789 Residential Area",
        phone: "+977-1-7777777",
        email: "suburban@pos.com",
        status: "active",
        branchCount: 4,
        employeeCount: 32,
        monthlyRevenue: 87000,
        managerName: "Mike Johnson",
        managerEmail: "mike.johnson@pos.com"
      }
    ]);
  }, []);

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || store.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleView = (store) => {
    toast.info(`Viewing details for ${store.name}`);
  };

  const handleEdit = (store) => {
    setSelectedStore(store);
    setShowModal(true);
  };

  const handleDelete = async (store) => {
    if (window.confirm(`Are you sure you want to delete "${store.name}"?`)) {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStores(prev => prev.filter(s => s.id !== store.id));
        toast.success(`Store "${store.name}" deleted successfully`);
      } catch (error) {
        toast.error("Failed to delete store");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddStore = () => {
    setSelectedStore(null);
    setShowModal(true);
  };

  const handleSaveStore = async (formData) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (selectedStore) {
        setStores(prev => prev.map(store => 
          store.id === selectedStore.id ? { ...store, ...formData } : store
        ));
        toast.success("Store updated successfully");
      } else {
        const newStore = {
          id: Date.now(),
          ...formData,
          branchCount: 0,
          employeeCount: 0,
          monthlyRevenue: 0
        };
        setStores(prev => [...prev, newStore]);
        toast.success("Store created successfully");
      }
      
      setShowModal(false);
      setSelectedStore(null);
    } catch (error) {
      toast.error(selectedStore ? "Failed to update store" : "Failed to create store");
    } finally {
      setLoading(false);
    }
  };

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
            Store Management
          </h1>
          <p style={{
            margin: "4px 0 0",
            fontSize: "16px",
            color: "#718096"
          }}>
            Manage all store locations and their settings
          </p>
        </div>
        
        <button
          onClick={handleAddStore}
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
          Add New Store
        </button>
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
            placeholder="Search stores by name or address..."
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

        {/* Status Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={16} color="#718096" />
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
            <option value="all">All Stores</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

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
          {filteredStores.length} stores found
        </div>
      </div>

      {/* Store Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
        gap: "20px"
      }}>
        {filteredStores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredStores.length === 0 && (
        <div style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "60px 20px",
          textAlign: "center"
        }}>
          <StoreIcon size={48} color="#cbd5e0" style={{ marginBottom: "16px" }} />
          <h3 style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "600",
            color: "#1a202c",
            marginBottom: "8px"
          }}>
            No stores found
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#718096", marginBottom: "20px" }}>
            {searchTerm || filterStatus !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "Get started by adding your first store location"
            }
          </p>
          {(!searchTerm && filterStatus === "all") && (
            <button
              onClick={handleAddStore}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Plus size={16} />
              Add First Store
            </button>
          )}
        </div>
      )}

      {/* Store Modal */}
      <StoreModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        store={selectedStore}
        onSave={handleSaveStore}
        loading={loading}
      />
    </div>
  );
}