import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/Redux Toolkit/Features/auth/authSlice";
import {
  LayoutDashboard, Store, Users, BarChart3, Settings,
  Menu, X, LogOut, ChevronDown, Bell, FileText, CreditCard, Clock
} from "lucide-react";
import posLogo from "@/logo/pos.png";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin", exact: true },
  { icon: FileText, label: "Registration Requests", path: "/admin/registration-requests" },
  { icon: Store, label: "Store Management", path: "/admin/stores" },
  { icon: CreditCard, label: "Subscriptions", path: "/admin/subscriptions" },
  { icon: Users, label: "User Management", path: "/admin/users" },
  { icon: BarChart3, label: "System Reports", path: "/admin/reports" },
  { icon: Settings, label: "System Settings", path: "/admin/settings" },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  // Fetch pending requests count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const jwt = localStorage.getItem("jwt");
        const response = await fetch("http://localhost:8080/api/admin/store-requests/pending/count", {
          headers: { Authorization: `Bearer ${jwt}` }
        });
        if (response.ok) {
          const count = await response.json();
          setPendingRequests(count);
          if (count > 0) {
            const notifResponse = await fetch("http://localhost:8080/api/admin/store-requests?status=PENDING", {
              headers: { Authorization: `Bearer ${jwt}` }
            });
            if (notifResponse.ok) {
              const requests = await notifResponse.json();
              setNotifications(requests.slice(0, 5));
            }
          } else {
            setNotifications([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch pending requests");
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Sidebar */}
      <div style={{
        width: "240px",
        background: "white",
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        boxShadow: "2px 0 12px rgba(0,0,0,0.06)"
      }}>
        {/* Logo */}
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <div style={{
            width: 30,
            height: 30,
            background: "white",
            borderRadius: "6px",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <img
              src={posLogo}
              alt="POS"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <span style={{
            color: "#1a1d23",
            fontSize: "15px",
            fontWeight: "700",
            letterSpacing: "-0.2px"
          }}>
            POS SYSTEM
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            const showBadge = item.path === "/admin/registration-requests" && pendingRequests > 0;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "13px",
                  background: active ? "linear-gradient(135deg,#1a1d23,#4a4d55)" : "transparent",
                  color: active ? "white" : "#4b5563",
                  fontWeight: active ? 600 : 500,
                  transition: "all 0.2s ease",
                  position: "relative"
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "#f3f4f6";
                    e.currentTarget.style.color = "#1a1d23";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#4b5563";
                  }
                }}
              >
                <Icon size={17} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {showBadge && (
                  <span style={{
                    background: "#e53e3e",
                    color: "white",
                    borderRadius: "12px",
                    padding: "2px 6px",
                    fontSize: "10px",
                    fontWeight: "700",
                    minWidth: "18px",
                    textAlign: "center"
                  }}>
                    {pendingRequests}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "12px", borderTop: "1px solid #e5e7eb" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#e53e3e",
              fontFamily: "inherit",
              fontSize: "13px",
              fontWeight: 600,
              transition: "background 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        overflow: "hidden"
      }}>
        {/* Header */}
        <header style={{
          background: "white",
          padding: "0 20px",
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: "700",
              color: "#1a1d23",
              letterSpacing: "-0.2px"
            }}>
              System Administration
            </h1>
          </div>

          {/* Notifications + User Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

            {/* Bell */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setShowNotifications(!showNotifications); setProfileDropdown(false); }}
                style={{
                  position: "relative",
                  width: 36,
                  height: 36,
                  border: "none",
                  background: "linear-gradient(135deg,#1a1d23,#4a4d55)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                title={`${pendingRequests} pending registration requests`}
              >
                <Bell size={16} color="#fff" />
                {pendingRequests > 0 && (
                  <span style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#e53e3e",
                    border: "1.5px solid white",
                  }} />
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 10 }}
                    onClick={() => setShowNotifications(false)}
                  />
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: 8,
                    width: 320,
                    maxHeight: 400,
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                    zIndex: 20,
                    overflow: "hidden",
                  }}>
                    {/* Header */}
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1a1d23" }}>
                          Registration Requests
                        </h3>
                        {pendingRequests > 0 && (
                          <button
                            onClick={() => { navigate("/admin/registration-requests"); setShowNotifications(false); }}
                            style={{ fontSize: 12, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                          >
                            View All ({pendingRequests})
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div style={{ maxHeight: 300, overflowY: "auto" }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: "20px 16px", textAlign: "center", color: "#6b7280" }}>
                          <Bell size={24} color="#e5e7eb" style={{ margin: "0 auto 8px", display: "block" }} />
                          <p style={{ margin: 0, fontSize: 13 }}>No pending requests</p>
                        </div>
                      ) : (
                        notifications.map((notif, i) => (
                          <div
                            key={notif.id || i}
                            onClick={() => { navigate("/admin/registration-requests"); setShowNotifications(false); }}
                            style={{
                              padding: "12px 16px",
                              borderBottom: i < notifications.length - 1 ? "1px solid #f3f4f6" : "none",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                              <div style={{ padding: 4, background: "#fffbeb", borderRadius: 4, marginTop: 2 }}>
                                <Clock size={12} color="#d97706" />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>
                                  New Store Registration
                                </p>
                                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {notif.storeName} — {notif.ownerName}
                                </p>
                                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>
                                  {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Just now"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {pendingRequests > 5 && (
                      <div style={{ padding: "8px 16px", background: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
                        <button
                          onClick={() => { navigate("/admin/registration-requests"); setShowNotifications(false); }}
                          style={{ fontSize: 12, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontWeight: 600, width: "100%", textAlign: "center" }}
                        >
                          View {pendingRequests - 5} more requests
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* User Profile Button */}
            <div style={{ position: "relative" }}>
            <button
              onClick={() => setProfileDropdown(!profileDropdown)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                background: "none",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#f8fafc";
                e.target.style.borderColor = "#cbd5e0";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "none";
                e.target.style.borderColor = "#e2e8f0";
              }}
            >
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg,#1a1d23,#4a4d55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "11px",
                fontWeight: "700"
              }}>
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1a202c"
                }}>
                  {user?.email || "Admin"}
                </p>
                <p style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#718096"
                }}>
                  Super Admin
                </p>
              </div>
              <ChevronDown size={16} color="#a0aec0" />
            </button>

            {profileDropdown && (
              <div style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "8px",
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                minWidth: "200px",
                zIndex: 50
              }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "14px",
                    color: "#e53e3e",
                    transition: "background 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#fef2f2"}
                  onMouseLeave={(e) => e.target.style.background = "none"}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          background: "#f5f5f5"
        }}>
          {children}
        </main>
      </div>

      {/* Click outside to close dropdown */}
      {profileDropdown && (
        <div
          onClick={() => { setProfileDropdown(false); setShowNotifications(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 40 }}
        />
      )}
    </div>
  );
}