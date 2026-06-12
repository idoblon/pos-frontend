import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus, Search, Filter, MoreHorizontal, Edit2,
  Trash2, Eye, MapPin, Store as StoreIcon,
  AlertCircle, CheckCircle, Activity, X, Save,
  Users, GitBranch, TrendingUp, Phone, Mail,
  User, Building2, Calendar, DollarSign, Loader2,
  ShieldCheck, Clock
} from "lucide-react";
import { toast } from "sonner";
import { getAllStores, updateStore, deleteStore } from "@/Redux Toolkit/Features/Store/storeThunk";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusColor(status) {
  const s = (status || "").toLowerCase();
  if (s === "active") return { bg: "#dcfce7", text: "#16a34a", dot: "#22c55e" };
  if (s === "inactive") return { bg: "#fef3c7", text: "#d97706", dot: "#f59e0b" };
  if (s === "suspended") return { bg: "#fee2e2", text: "#dc2626", dot: "#ef4444" };
  if (s === "pending") return { bg: "#e0f2fe", text: "#0369a1", dot: "#0ea5e9" };
  if (s === "payment_pending") return { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" };
  return { bg: "#f1f5f9", text: "#64748b", dot: "#94a3b8" };
}

function formatStatus(status) {
  return (status || "active")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCurrency(amount) {
  return `रु ${(amount || 0).toLocaleString("en-IN")}`;
}

function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getCollection(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  const nested = [
    value.data,
    value.items,
    value.results,
    value.content,
    value.branches,
    value.employees,
  ].find(Array.isArray);

  return nested || [];
}

function getCollectionCount(value) {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "number") return value;
  if (!value || typeof value !== "object") return 0;

  const nested = getCollection(value);
  if (nested.length) return nested.length;

  return toNumber(value.count ?? value.total ?? value.totalElements ?? value.length);
}

function getBranchCount(store) {
  return getCollectionCount(store.branches) ||
    toNumber(store.branchCount ?? store.branchesCount ?? store.totalBranches ?? store._count?.branches ?? store.estimatedBranches);
}

function getEmployeeCount(store) {
  return getCollectionCount(store.employees) ||
    toNumber(store.employeeCount ?? store.employeesCount ?? store.totalEmployees ?? store.userCount ?? store.usersCount ?? store._count?.employees ?? store.estimatedUsers);
}

function getStoreRevenue(store) {
  return toNumber(
    store.totalRevenue ??
    store.monthlyRevenue ??
    store.revenue ??
    store.totalSales ??
    store.salesAmount
  );
}

function getOrderAmount(order) {
  return toNumber(
    order.totalAmount ??
    order.total ??
    order.amount ??
    order.grandTotal ??
    order.netAmount
  );
}

function getStoreAddress(store) {
  const directAddress =
    store.storeAddress ??
    store.contact?.address ??
    store.address ??
    store.location?.address ??
    store.streetAddress ??
    store.addressLine1 ??
    store.addressLine;

  if (directAddress) return directAddress;

  return [
    store.city,
    store.district,
    store.state,
    store.province,
    store.country,
  ].filter(Boolean).join(", ");
}

function getStoreId(store) {
  return store?._id || store?.id || store?.createdStoreId;
}

function getMetricKey(store) {
  return String(getStoreId(store) || store?.registrationRequestId || store?.storeName || store?.brand || store?.name || "");
}

// ─── Store Card ──────────────────────────────────────────────────────────────

function StoreCard({ store, onEdit, onView, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const colors = getStatusColor(store.status);

  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      padding: "22px",
      position: "relative",
      transition: "all 0.25s ease",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      cursor: "default",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "14px",
            background: "linear-gradient(135deg, #1a1d23 0%, #2d3748 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0
          }}>
            <StoreIcon size={24} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#1a202c", lineHeight: 1.2 }}>
              {store.name}
            </h3>
            {store.type && (
              <span style={{ fontSize: "11px", color: "#718096", marginTop: "2px", display: "block" }}>
                {store.type}
              </span>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "5px" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "2px 10px", borderRadius: "20px",
                background: colors.bg, color: colors.text,
                fontSize: "11px", fontWeight: "600"
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.dot, display: "inline-block" }} />
                {formatStatus(store.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{
              background: menuOpen ? "#f1f5f9" : "none",
              border: "1px solid " + (menuOpen ? "#e2e8f0" : "transparent"),
              padding: "7px", borderRadius: "8px", cursor: "pointer", transition: "all 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
            onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = "none"; }}
          >
            <MoreHorizontal size={16} color="#718096" />
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", right: 0,
              background: "white", border: "1px solid #e2e8f0",
              borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              minWidth: "172px", zIndex: 50, overflow: "hidden"
            }}>
              {[
                { icon: Eye, label: "View Details", color: "#4a5568", action: () => { onView(store); setMenuOpen(false); } },
                { icon: Edit2, label: "Edit Profile", color: "#4a5568", action: () => { onEdit(store); setMenuOpen(false); } },
                { icon: Trash2, label: "Delete Store", color: "#e53e3e", action: () => { onDelete(store); setMenuOpen(false); }, danger: true },
              ].map(({ icon: Icon, label, color, action, danger }) => (
                <button key={label} onClick={action} style={{
                  width: "100%", padding: "11px 14px", background: "none", border: "none",
                  textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center",
                  gap: "10px", fontSize: "13px", fontWeight: "500", color,
                  transition: "background 0.15s",
                  borderTop: danger ? "1px solid #fee2e2" : "none"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = danger ? "#fff5f5" : "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Address */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "7px", marginBottom: "16px" }}>
        <MapPin size={13} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
        <span style={{ fontSize: "12.5px", color: "#64748b", lineHeight: 1.5 }}>
          {store.address || "Address not provided"}
        </span>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: "8px", paddingTop: "14px", borderTop: "1px solid #f0f4f8"
      }}>
        <div style={{
          textAlign: "center", padding: "10px 6px", background: "#f8fafc",
          borderRadius: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 3 }}>
            <GitBranch size={12} color="#64748b" />
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>Branches</span>
          </div>
          <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#1e293b" }}>
            {store.branchCount ?? 0}
          </p>
        </div>

        <div style={{
          textAlign: "center", padding: "10px 6px", background: "#f8fafc",
          borderRadius: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 3 }}>
            <Users size={12} color="#64748b" />
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>Employees</span>
          </div>
          <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#1e293b" }}>
            {store.employeeCount ?? 0}
          </p>
        </div>

        <div style={{
          textAlign: "center", padding: "10px 6px",
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
          borderRadius: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 3 }}>
            <TrendingUp size={12} color="#16a34a" />
            <span style={{ fontSize: "11px", color: "#4ade80", fontWeight: 500 }}>Revenue</span>
          </div>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#16a34a" }}>
            {formatCurrency(store.totalRevenue)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── View Details Modal ────────────────────────────────────────────────────────

function ViewDetailsModal({ store, onClose }) {
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!store) return;
    // Fetch branches for this store
    setLoadingBranches(true);
    api.get(`/api/branches/store/${store.id}`, { headers: getAuthHeaders() })
      .then(r => setBranches(getCollection(r.data)))
      .catch(() => setBranches([]))
      .finally(() => setLoadingBranches(false));

    // Fetch employees for this store
    setLoadingEmployees(true);
    api.get(`/api/employees/store/${store.id}`, { headers: getAuthHeaders() })
      .then(r => setEmployees(getCollection(r.data)))
      .catch(() => setEmployees([]))
      .finally(() => setLoadingEmployees(false));
  }, [store]);

  if (!store) return null;

  const colors = getStatusColor(store.status);
  const tabs = ["overview", "branches", "employees"];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "20px", backdropFilter: "blur(4px)"
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "white", borderRadius: "20px", width: "100%",
        maxWidth: "640px", maxHeight: "88vh", overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)"
      }}>
        {/* Header */}
        <div style={{
          padding: "24px 28px 0", background: "linear-gradient(135deg, #1a1d23 0%, #2d3748 100%)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "14px",
                background: "rgba(255,255,255,0.15)", display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <Building2 size={26} color="white" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "white" }}>
                  {store.name}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "5px" }}>
                  <span style={{
                    padding: "2px 10px", borderRadius: "20px",
                    background: colors.bg, color: colors.text,
                    fontSize: "11px", fontWeight: "600"
                  }}>
                    {formatStatus(store.status).toUpperCase()}
                  </span>
                  {store.subscriptionPlan && (
                    <span style={{
                      padding: "2px 10px", borderRadius: "20px",
                      background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)",
                      fontSize: "11px", fontWeight: "600"
                    }}>
                      {store.subscriptionPlan}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.15)", border: "none",
              borderRadius: "8px", padding: "8px", cursor: "pointer", color: "white"
            }}>
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0" }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "10px 20px", background: "none", border: "none",
                cursor: "pointer", fontSize: "13px", fontWeight: "600",
                color: activeTab === tab ? "white" : "rgba(255,255,255,0.5)",
                borderBottom: activeTab === tab ? "2px solid white" : "2px solid transparent",
                transition: "all 0.2s", textTransform: "capitalize"
              }}>
                {tab}
                {tab === "branches" && ` (${branches.length})`}
                {tab === "employees" && ` (${employees.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
                {[
                  { label: "Total Branches", value: store.branchCount ?? branches.length ?? 0, icon: GitBranch, color: "#6366f1" },
                  { label: "Employees", value: store.employeeCount ?? employees.length ?? 0, icon: Users, color: "#0ea5e9" },
                  { label: "Total Revenue", value: formatCurrency(store.totalRevenue), icon: TrendingUp, color: "#22c55e", small: true },
                ].map(({ label, value, icon: Icon, color, small }) => (
                  <div key={label} style={{
                    padding: "16px", background: "#f8fafc", borderRadius: "14px",
                    border: "1px solid #e2e8f0", textAlign: "center"
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "10px",
                      background: color + "20", display: "flex",
                      alignItems: "center", justifyContent: "center", margin: "0 auto 8px"
                    }}>
                      <Icon size={18} color={color} />
                    </div>
                    <p style={{ margin: 0, fontSize: small ? "14px" : "22px", fontWeight: "800", color: "#1e293b" }}>{value}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", marginTop: 3 }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Info grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {[
                  { label: "Address", value: store.address || "—", icon: MapPin },
                  { label: "Phone", value: store.phone || "—", icon: Phone },
                  { label: "Email", value: store.email || "—", icon: Mail },
                  { label: "Store Admin", value: store.managerName || "—", icon: User },
                  { label: "Store Type", value: store.type || "—", icon: Building2 },
                  { label: "Subscription", value: store.subscriptionPlan || "—", icon: ShieldCheck },
                  { label: "Created At", value: formatDate(store.createdAt), icon: Calendar },
                  { label: "Updated At", value: formatDate(store.updatedAt), icon: Clock },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} style={{
                    padding: "14px 16px", background: "#f8fafc",
                    borderRadius: "12px", border: "1px solid #e2e8f0"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "5px" }}>
                      <Icon size={13} color="#94a3b8" />
                      <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {label}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#334155", wordBreak: "break-word" }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "branches" && (
            <div>
              {loadingBranches ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
                  <p style={{ marginTop: 10 }}>Loading branches...</p>
                </div>
              ) : branches.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  <GitBranch size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p>No branches found for this store</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {branches.map(b => (
                    <div key={b.id || b._id} style={{
                      padding: "14px 16px", background: "#f8fafc",
                      borderRadius: "12px", border: "1px solid #e2e8f0",
                      display: "flex", alignItems: "center", gap: "12px"
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "10px",
                        background: "#6366f120", display: "flex",
                        alignItems: "center", justifyContent: "center", flexShrink: 0
                      }}>
                        <GitBranch size={16} color="#6366f1" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                          {b.name || b.branchName || "Unnamed Branch"}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                          {b.address || "Address not provided"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "employees" && (
            <div>
              {loadingEmployees ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
                  <p style={{ marginTop: 10 }}>Loading employees...</p>
                </div>
              ) : employees.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  <Users size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p>No employees found for this store</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {employees.map(emp => (
                    <div key={emp.id || emp._id} style={{
                      padding: "14px 16px", background: "#f8fafc",
                      borderRadius: "12px", border: "1px solid #e2e8f0",
                      display: "flex", alignItems: "center", gap: "12px"
                    }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: "50%",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontWeight: "700", fontSize: "14px", flexShrink: 0
                      }}>
                        {(emp.fullName || emp.name || "?")[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                          {emp.fullName || emp.name || "Unknown"}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                          {emp.email || ""}  {emp.role ? `· ${emp.role.replace("ROLE_", "")}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Edit Store Modal ─────────────────────────────────────────────────────────

function EditStoreModal({ store, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    name: "", address: "", phone: "", email: "",
    status: "active", description: "", type: ""
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name || "",
        address: store.address || "",
        phone: store.phone || "",
        email: store.email || "",
        status: store.status || "active",
        description: store.description || "",
        type: store.type || "",
      });
    }
    setErrors({});
  }, [store]);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Store name is required";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (validate()) onSave(form);
  }

  if (!store) return null;

  const field = (label, key, type = "text", required = false) => (
    <div key={key}>
      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        style={{
          width: "100%", padding: "10px 12px",
          border: `1.5px solid ${errors[key] ? "#ef4444" : "#e2e8f0"}`,
          borderRadius: "8px", fontSize: "14px", outline: "none",
          transition: "border-color 0.2s", boxSizing: "border-box",
          fontFamily: "inherit"
        }}
        onFocus={e => e.target.style.borderColor = "#667eea"}
        onBlur={e => e.target.style.borderColor = errors[key] ? "#ef4444" : "#e2e8f0"}
      />
      {errors[key] && <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#ef4444" }}>{errors[key]}</p>}
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "20px", backdropFilter: "blur(4px)"
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "white", borderRadius: "20px", width: "100%",
        maxWidth: "520px", maxHeight: "90vh", overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "0 25px 60px rgba(0,0,0,0.2)"
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "22px 26px", borderBottom: "1px solid #f0f4f8"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: 40, height: 40, borderRadius: "10px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Edit2 size={18} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>Edit Store Profile</h2>
              <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>{store.name}</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "#f1f5f9", border: "none", borderRadius: "8px",
            padding: "8px", cursor: "pointer"
          }}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflow: "auto", padding: "24px 26px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {field("Store Name", "name", "text", true)}

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Address
              </label>
              <textarea
                value={form.address}
                onChange={e => set("address", e.target.value)}
                rows={3}
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1.5px solid #e2e8f0", borderRadius: "8px",
                  fontSize: "14px", outline: "none", resize: "vertical",
                  boxSizing: "border-box", fontFamily: "inherit"
                }}
                onFocus={e => e.target.style.borderColor = "#667eea"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {field("Phone", "phone", "tel")}
              {field("Email", "email", "email")}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Store Type
                </label>
                <input
                  type="text"
                  value={form.type}
                  placeholder="e.g. Retail, Pharmacy"
                  onChange={e => set("type", e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  onFocus={e => e.target.style.borderColor = "#667eea"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={e => set("status", e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", background: "white", cursor: "pointer", boxSizing: "border-box" }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Description
              </label>
              <textarea
                value={form.description}
                onChange={e => set("description", e.target.value)}
                rows={2}
                placeholder="Optional store description..."
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={e => e.target.style.borderColor = "#667eea"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px", paddingTop: "18px", borderTop: "1px solid #f0f4f8" }}>
            <button type="button" onClick={onClose} style={{
              padding: "10px 22px", border: "1.5px solid #e2e8f0",
              borderRadius: "8px", background: "white", color: "#64748b",
              fontSize: "14px", fontWeight: "600", cursor: "pointer"
            }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 22px", border: "none", borderRadius: "8px",
              background: saving ? "#a0aec0" : "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white", fontSize: "14px", fontWeight: "600",
              cursor: saving ? "not-allowed" : "pointer"
            }}>
              {saving ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={15} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteModal({ store, onClose, onConfirm, deleting }) {
  if (!store) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "20px", backdropFilter: "blur(4px)"
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "white", borderRadius: "20px", width: "100%",
        maxWidth: "420px", padding: "32px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.2)", textAlign: "center"
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "20px",
          background: "#fee2e2", display: "flex",
          alignItems: "center", justifyContent: "center", margin: "0 auto 20px"
        }}>
          <Trash2 size={28} color="#ef4444" />
        </div>
        <h3 style={{ margin: "0 0 10px", fontSize: "20px", fontWeight: "700", color: "#1e293b" }}>
          Delete Store?
        </h3>
        <p style={{ margin: "0 0 6px", fontSize: "14px", color: "#64748b" }}>
          You are about to permanently delete
        </p>
        <p style={{ margin: "0 0 24px", fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>
          "{store.name}"
        </p>
        <div style={{
          padding: "14px 16px", background: "#fff8f0", border: "1px solid #fed7aa",
          borderRadius: "10px", marginBottom: "24px", textAlign: "left"
        }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#9a3412" }}>
            ⚠️ This action is irreversible. All branches, employees, and data associated with this store will be permanently removed.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px", border: "1.5px solid #e2e8f0",
            borderRadius: "10px", background: "white", color: "#64748b",
            fontSize: "14px", fontWeight: "600", cursor: "pointer"
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting} style={{
            flex: 1, padding: "12px", border: "none",
            borderRadius: "10px",
            background: deleting ? "#fca5a5" : "#ef4444",
            color: "white", fontSize: "14px", fontWeight: "700",
            cursor: deleting ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}>
            {deleting ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={15} />}
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StoreManagement() {
  const dispatch = useDispatch();
  const { stores: reduxStores, loading: reduxLoading } = useSelector(s => s.store);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [viewStore, setViewStore] = useState(null);
  const [editStore, setEditStore] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [storeMetrics, setStoreMetrics] = useState({});

  useEffect(() => { dispatch(getAllStores()); }, [dispatch]);

  const metricStoreIds = (reduxStores || [])
    .map(getStoreId)
    .filter(Boolean)
    .map(String)
    .join("|");

  useEffect(() => {
    const rawStores = reduxStores || [];
    const storesWithIds = rawStores.filter((store) => getStoreId(store) && !store.isRegistrationOnly);
    if (!storesWithIds.length) {
      setStoreMetrics({});
      return;
    }

    let cancelled = false;

    async function loadStoreMetrics() {
      const headers = getAuthHeaders();
      const entries = await Promise.all(
        storesWithIds.map(async (store) => {
          const storeId = getStoreId(store);
          const key = getMetricKey(store);

          const [branchResult, employeeResult] = await Promise.allSettled([
            api.get(`/api/branches/store/${storeId}`, { headers }),
            api.get(`/api/employees/store/${storeId}`, { headers }),
          ]);

          const branches = branchResult.status === "fulfilled" ? getCollection(branchResult.value.data) : [];
          const employees = employeeResult.status === "fulfilled" ? getCollection(employeeResult.value.data) : [];
          const orderResults = await Promise.allSettled(
            branches
              .map((branch) => branch._id || branch.id)
              .filter(Boolean)
              .map((branchId) => api.get(`/api/orders/branch/${branchId}`, { headers })),
          );
          const branchRevenue = branches.reduce(
            (sum, branch) => sum + getStoreRevenue(branch),
            0,
          );
          const orderRevenue = orderResults.reduce((sum, result) => {
            if (result.status !== "fulfilled") return sum;
            return sum + getCollection(result.value.data).reduce(
              (orderSum, order) => orderSum + getOrderAmount(order),
              0,
            );
          }, 0);

          return [key, {
            branchCount: branches.length,
            employeeCount: employees.length,
            totalRevenue: orderRevenue || branchRevenue,
            firstBranchAddress: branches.find((branch) => branch.address)?.address || "",
          }];
        }),
      );

      if (!cancelled) {
        setStoreMetrics(Object.fromEntries(entries));
      }
    }

    loadStoreMetrics().catch((error) => {
      console.warn("Could not load store branch/employee counts:", error);
    });

    return () => {
      cancelled = true;
    };
  }, [metricStoreIds, reduxStores]);

  // Normalize store data
  const stores = (reduxStores || []).map(s => ({
    id: getStoreId(s),
    name: s.brand || s.name || s.storeName || "Unnamed Store",
    address: getStoreAddress(s) || storeMetrics[getMetricKey(s)]?.firstBranchAddress || "",
    phone: s.contact?.phone || s.phone || "",
    email: s.contact?.email || s.email || "",
    status: (s.status || "active").toLowerCase(),
    branchCount: storeMetrics[getMetricKey(s)]?.branchCount ?? getBranchCount(s),
    employeeCount: storeMetrics[getMetricKey(s)]?.employeeCount ?? getEmployeeCount(s),
    totalRevenue: storeMetrics[getMetricKey(s)]?.totalRevenue || getStoreRevenue(s),
    managerName: s.storeAdmin?.fullName || s.managerName || s.ownerName || s.fullName || "",
    managerEmail: s.storeAdmin?.email || s.managerEmail || s.email || "",
    subscriptionPlan: s.subscriptionPlan || "",
    description: s.description || "",
    type: s.storeType || s.type || "",
    createdAt: s.createdAt || null,
    updatedAt: s.updatedAt || null,
  }));

  const filteredStores = stores.filter(s => {
    const q = searchTerm.toLowerCase();
    return (
      (s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)) &&
      (filterStatus === "all" || s.status === filterStatus)
    );
  });

  // Handlers
  const handleSaveEdit = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        brand: formData.name,
        status: formData.status.toUpperCase(),
        description: formData.description,
        storeType: formData.type,
        contact: {
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
        },
      };
      const result = await dispatch(updateStore({ id: editStore.id, storeData: payload }));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Store updated successfully");
        dispatch(getAllStores());
        setEditStore(null);
      } else {
        toast.error(result.payload || "Failed to update store");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const result = await dispatch(deleteStore(deleteTarget.id));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success(`"${deleteTarget.name}" deleted successfully`);
        dispatch(getAllStores());
        setDeleteTarget(null);
      } else {
        toast.error(result.payload || "Failed to delete store");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#1a202c", letterSpacing: "-0.5px" }}>
            Store Management
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "15px", color: "#718096" }}>
            Manage all store locations, branches, and their settings
          </p>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "14px" }}>
        {[
          { label: "Total Stores", value: stores.length, color: "#6366f1", icon: StoreIcon },
          { label: "Active", value: stores.filter(s => s.status === "active").length, color: "#22c55e", icon: CheckCircle },
          { label: "Inactive", value: stores.filter(s => s.status === "inactive").length, color: "#f59e0b", icon: AlertCircle },
          { label: "Suspended", value: stores.filter(s => s.status === "suspended").length, color: "#ef4444", icon: AlertCircle },
          { label: "Pending", value: stores.filter(s => s.status === "pending" || s.status === "payment_pending").length, color: "#0ea5e9", icon: Clock },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{
            background: "white", border: "1px solid #e2e8f0", borderRadius: "14px",
            padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: "10px",
              background: color + "18", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#1e293b" }}>{value}</p>
              <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: "white", border: "1px solid #e2e8f0", borderRadius: "14px",
        padding: "16px 20px", display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap"
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by name or address..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: "100%", padding: "9px 12px 9px 38px",
              border: "1.5px solid #e2e8f0", borderRadius: "8px",
              fontSize: "13.5px", outline: "none", boxSizing: "border-box"
            }}
            onFocus={e => e.target.style.borderColor = "#667eea"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={15} color="#94a3b8" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{
            padding: "8px 12px", border: "1.5px solid #e2e8f0",
            borderRadius: "8px", fontSize: "13.5px", background: "white",
            cursor: "pointer", outline: "none"
          }}>
            <option value="all">All Stores</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
            <option value="payment_pending">Payment Pending</option>
          </select>
        </div>
        <span style={{
          padding: "6px 12px", background: "#f8fafc",
          border: "1px solid #e2e8f0", borderRadius: "6px",
          fontSize: "12px", color: "#64748b", fontWeight: "500"
        }}>
          {filteredStores.length} {filteredStores.length === 1 ? "store" : "stores"} found
        </span>
      </div>

      {/* Loading */}
      {reduxLoading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite", marginBottom: 12 }} />
          <p>Loading stores...</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Grid */}
      {!reduxLoading && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
            {filteredStores.map(store => (
              <StoreCard
                key={store.id}
                store={store}
                onView={setViewStore}
                onEdit={setEditStore}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {/* Empty state */}
          {filteredStores.length === 0 && (
            <div style={{
              background: "white", border: "1px solid #e2e8f0",
              borderRadius: "16px", padding: "60px 20px", textAlign: "center"
            }}>
              <StoreIcon size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
              <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "600", color: "#1a202c" }}>
                No stores found
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#718096" }}>
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter"
                  : "No stores have been registered yet"}
              </p>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {viewStore && (
        <ViewDetailsModal store={viewStore} onClose={() => setViewStore(null)} />
      )}
      {editStore && (
        <EditStoreModal
          store={editStore}
          onClose={() => setEditStore(null)}
          onSave={handleSaveEdit}
          saving={saving}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          store={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
