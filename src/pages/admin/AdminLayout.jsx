import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/Redux Toolkit/Features/auth/authSlice";
import {
  LayoutDashboard, Store, Users, BarChart3, Settings,
  LogOut, Bell, FileText, CreditCard, Clock, X, Menu,
} from "lucide-react";
import posLogo from "@/logo/pos.png";
import api from "@/util/api";
import paymentNotificationService from "@/services/paymentNotificationService";
import {
  getAdminSystemSettings,
  secondsToMilliseconds,
  subscribeAdminSystemSettings,
} from "@/util/adminSystemSettings";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin", exact: true },
  { icon: FileText, label: "Registration Requests", path: "/admin/registration-requests" },
  { icon: Store, label: "Store Management", path: "/admin/stores" },
  { icon: CreditCard, label: "Subscriptions", path: "/admin/subscriptions" },
  { icon: Users, label: "User Management", path: "/admin/users" },
  { icon: BarChart3, label: "System Analytics", path: "/admin/reports" },
  { icon: () => <span style={{ fontSize: 15, fontWeight: 700, color: "inherit" }}>रु</span>, label: "Payments", path: "/admin/payments", paymentBadge: true },
  { icon: Settings, label: "System Settings", path: "/admin/settings" },
];

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function NavLinks({ onClose, pendingRequests, unreadPayments, isActive }) {
  return sidebarItems.map((item) => {
    const Icon = item.icon;
    const active = isActive(item.path, item.exact);
    const showBadge = item.path === "/admin/registration-requests" && pendingRequests > 0;
    const showPaymentBadge = item.paymentBadge && unreadPayments > 0;

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClose}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 8,
          textDecoration: "none",
          fontSize: 13,
          background: active ? "#1a1d23" : "transparent",
          color: active ? "white" : "#4b5563",
          fontWeight: active ? 600 : 500,
          position: "relative",
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#1a1d23"; } }}
        onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4b5563"; } }}
      >
        <Icon size={17} />
        <span style={{ flex: 1 }}>{item.label}</span>
        {showBadge && (
          <span style={{ background: "#e53e3e", color: "white", borderRadius: 12, padding: "2px 6px", fontSize: 10, fontWeight: 700, minWidth: 18, textAlign: "center" }}>
            {pendingRequests}
          </span>
        )}
        {showPaymentBadge && (
          <span style={{ background: "#059669", color: "white", borderRadius: 12, padding: "2px 6px", fontSize: 10, fontWeight: 700, minWidth: 18, textAlign: "center" }}>
            {unreadPayments}
          </span>
        )}
      </Link>
    );
  });
}

function SidebarInner({ showClose, onClose, pendingRequests, unreadPayments, isActive, onLogout }) {
  return (
    <>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={posLogo} alt="POS" style={{ width: 30, height: 30, objectFit: "contain" }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1d23" }}>POS SYSTEM</span>
        </div>
        {showClose && (
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#8a909c", display: "flex", alignItems: "center" }}>
            <X size={18} />
          </button>
        )}
      </div>

      <nav style={{ flex: 1, padding: "12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        <NavLinks
          onClose={showClose ? onClose : undefined}
          pendingRequests={pendingRequests}
          unreadPayments={unreadPayments}
          isActive={isActive}
        />
      </nav>

      <div style={{ padding: "12px", borderTop: "1px solid #e5e7eb" }}>
        <button
          onClick={onLogout}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", background: "none", cursor: "pointer", color: "#e53e3e", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
          onMouseLeave={(e) => e.currentTarget.style.background = "none"}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </>
  );
}

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadPayments, setUnreadPayments] = useState(0);
  const [adminSettings, setAdminSettings] = useState(getAdminSystemSettings);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  useEffect(() => subscribeAdminSystemSettings(setAdminSettings), []);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const listRes = await api.get("/api/admin/registration-requests");
        const allRequests = Array.isArray(listRes.data) ? listRes.data : [];
        const pending = allRequests.filter(req => req.status === "PENDING" || req.status === "PAYMENT_PENDING");
        setPendingRequests(pending.length);
        setNotifications(pending.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch pending requests", error.response?.status);
      }
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, secondsToMilliseconds(adminSettings.registrationRefreshSeconds, 30, 10));
    return () => clearInterval(interval);
  }, [adminSettings.registrationRefreshSeconds]);

  useEffect(() => {
    let mounted = true;
    const loadPaymentBadge = async () => {
      const stats = await paymentNotificationService.getPaymentStats();
      if (!mounted) return;
      setUnreadPayments(stats?.unreadCount || 0);
    };
    loadPaymentBadge();
    const interval = setInterval(loadPaymentBadge, secondsToMilliseconds(adminSettings.paymentPollingSeconds, 10, 5));
    return () => { mounted = false; clearInterval(interval); };
  }, [adminSettings.paymentPollingSeconds]);

  const handleLogout = () => { dispatch(logout()); navigate("/login"); };

  const isActive = (path, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const initials = user?.email?.charAt(0).toUpperCase() || "A";

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f5f5f5", overflow: "hidden", fontFamily: "'DM Sans','Inter',sans-serif", fontSize: 13, color: "#1a1d23" }}>

      {/* Backdrop */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 20 }} />
      )}

      {/* Mobile sidebar */}
      <aside
        className="lg-sidebar"
        style={{
          position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 30,
          width: 240, background: "white", borderRight: "1px solid #e5e7eb",
          display: "flex", flexDirection: "column",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        }}
      >
        <SidebarInner
          showClose={true}
          onClose={() => setSidebarOpen(false)}
          pendingRequests={pendingRequests}
          unreadPayments={unreadPayments}
          isActive={isActive}
          onLogout={handleLogout}
        />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden-mobile"
        style={{
          width: 240, background: "white", borderRight: "1px solid #e5e7eb",
          display: "flex", flexDirection: "column", flexShrink: 0,
          boxShadow: "2px 0 12px rgba(0,0,0,0.06)",
        }}
      >
        <SidebarInner
          showClose={false}
          onClose={() => setSidebarOpen(false)}
          pendingRequests={pendingRequests}
          unreadPayments={unreadPayments}
          isActive={isActive}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* Header */}
        <header style={{ background: "white", padding: "0 20px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="lg-sidebar"
              onClick={() => setSidebarOpen(true)}
              style={{ border: "none", background: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
            >
              <Menu size={20} />
            </button>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1a1d23", letterSpacing: "-0.2px" }}>
                System Administration
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{formatDate()}</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

            {/* Bell */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setShowNotifications(!showNotifications); }}
                style={{ position: "relative", width: 36, height: 36, border: "none", background: "#1a1d23", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                title={`${pendingRequests} pending registration requests`}
              >
                <Bell size={16} color="#fff" />
                {pendingRequests > 0 && (
                  <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#e53e3e", border: "1.5px solid white" }} />
                )}
              </button>

              {showNotifications && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setShowNotifications(false)} />
                  <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, width: 320, maxHeight: 400, background: "white", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 10px 40px rgba(0,0,0,0.15)", zIndex: 20, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1a1d23" }}>Registration Requests</h3>
                        {pendingRequests > 0 && (
                          <button onClick={() => { navigate("/admin/registration-requests"); setShowNotifications(false); }} style={{ fontSize: 12, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                            View All ({pendingRequests})
                          </button>
                        )}
                      </div>
                    </div>
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
                            style={{ padding: "12px 16px", borderBottom: i < notifications.length - 1 ? "1px solid #f3f4f6" : "none", cursor: "pointer" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                              <div style={{ padding: 4, background: "#fffbeb", borderRadius: 4, marginTop: 2 }}>
                                <Clock size={12} color="#d97706" />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>New Store Registration</p>
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
                        <button onClick={() => { navigate("/admin/registration-requests"); setShowNotifications(false); }} style={{ fontSize: 12, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontWeight: 600, width: "100%", textAlign: "center" }}>
                          View {pendingRequests - 5} more requests
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a1d23", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1a1d23", lineHeight: 1.3 }}>Super Admin</p>
                <p style={{ margin: 0, fontSize: 11, color: "#6b7280", lineHeight: 1.3 }}>{user?.email || "Admin"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: "auto", background: "#f5f5f5" }}>
          {children || <Outlet />}
        </main>
      </div>

      <style>{`
        .hidden-mobile { display: flex; }
        .lg-sidebar { display: none !important; }
        @media (max-width: 1024px) {
          .hidden-mobile { display: none !important; }
          .lg-sidebar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
