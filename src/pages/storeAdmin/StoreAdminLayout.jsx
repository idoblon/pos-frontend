import { useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  GitBranch,
  Package,
  Users,
  Tag,
  BarChart2,
  X,
  LogOut,
  Bell,
  Warehouse,
  Truck,
  CreditCard,
  ChevronDown,
  Clock,
  Settings,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/Redux Toolkit/Features/auth/authSlice";
import { getUserProfile } from "@/Redux Toolkit/Features/user/userThunk";
import { getRestockRequestsByStore } from "@/Redux Toolkit/Features/restock/restockThunk";
import { getStoreByAdmin } from "@/Redux Toolkit/Features/Store/storeThunk";
import secureStorage from "@/util/secureStorage";
import posLogo from "@/logo/pos.png";
import ChangePasswordDialog from "@/pages/cashier/Settings/ChangePasswordDialog";
import { isPasswordChangeRequired, markPasswordChanged } from "@/util/firstLoginPassword";

const navItems = [
  { path: "/store-admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/store-admin/branches", label: "Branches", icon: GitBranch },
  { path: "/store-admin/products", label: "Products", icon: Package },
  { path: "/store-admin/inventory", label: "Inventory", icon: Warehouse },
  { path: "/store-admin/restock-requests", label: "Restock Requests", icon: Truck },
  { path: "/store-admin/subscription", label: "Subscription", icon: CreditCard },
  { path: "/store-admin/employees", label: "Employees", icon: Users },
  { path: "/store-admin/categories", label: "Categories", icon: Tag },
  { path: "/store-admin/reports", label: "Reports", icon: BarChart2 },
  { path: "/store-admin/payment-settings", label: "Payment Settings", icon: Settings },
];

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function NavLinks({ onClose, pendingCount }) {
  const location = useLocation();
  return navItems.map(({ path, label, icon: Icon }) => {
    const isRestockPage = path === "/store-admin/restock-requests";
    return (
      <Link
        key={path}
        to={path}
        onClick={onClose}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 8,
          textDecoration: "none",
          fontSize: 13,
          background:
            location.pathname === path
              ? "#1a1d23"
              : "transparent",
          color: location.pathname === path ? "white" : "#4b5563",
          fontWeight: location.pathname === path ? 600 : 500,
          position: "relative",
        }}
      >
        <Icon size={17} />
        {label}
        {isRestockPage && pendingCount > 0 && (
          <span style={{
            position: "absolute",
            right: 8,
            top: 6,
            background: "#e53e3e",
            color: "white",
            borderRadius: "50%",
            width: 18,
            height: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 700,
          }}>
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
      </Link>
    );
  });
}

export default function StoreAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userProfile } = useSelector((s) => s.user);
  const { user } = useSelector((s) => s.auth);
  const { requests: restockRequests, } = useSelector((s) => s.restock);
  const { store: currentStore } = useSelector((s) => s.store);
  const userData = secureStorage.getUserData();
  const storeId = userData?.storeId;
  const storeName = currentStore?.brand || currentStore?.name || "Store";
  const jwt = localStorage.getItem("jwt");

  useEffect(() => {
    if (jwt && !userProfile) dispatch(getUserProfile());
    if (storeId) dispatch(getRestockRequestsByStore({ storeId }));
    dispatch(getStoreByAdmin());
  }, [dispatch, jwt, userProfile, storeId]);

  // Auto-open change password for employees logging in with the default password.
  useEffect(() => {
    const userData = secureStorage.getUserData();
    const userId = userData?.userId;
    if (!userId) return;
    if (isPasswordChangeRequired(userId)) {
      setShowChangePassword(true);
    }
  }, []);

  // Auto-refresh restock requests every 30 seconds
  useEffect(() => {
    if (!storeId) return;
    const interval = setInterval(() => {
      dispatch(getRestockRequestsByStore({ storeId }));
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch, storeId]);

  // Get unread notifications
  const readNotifications = JSON.parse(localStorage.getItem('readStoreNotifications') || '[]');
  const pendingRequests = restockRequests?.filter(r => 
    r.status === "PENDING" && !readNotifications.includes(r.id)
  ) || [];
  const pendingCount = pendingRequests.length;
  
  const markAsRead = (requestId) => {
    const currentRead = JSON.parse(localStorage.getItem('readStoreNotifications') || '[]');
    if (!currentRead.includes(requestId)) {
      const updatedRead = [...currentRead, requestId];
      localStorage.setItem('readStoreNotifications', JSON.stringify(updatedRead));
      setRefreshKey(prev => prev + 1); // Force re-render
    }
  };
  
  const markAllAsRead = () => {
    const allPendingIds = (restockRequests?.filter(r => r.status === "PENDING") || []).map(r => r.id);
    localStorage.setItem('readStoreNotifications', JSON.stringify(allPendingIds));
    setRefreshKey(prev => prev + 1); // Force re-render
    setNotificationOpen(false);
  };

  const handlePasswordChangeSuccess = () => {
    const ud = secureStorage.getUserData();
    markPasswordChanged(ud?.userId);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const fullName =
    userProfile?.fullName || user?.fullName || userData?.fullName;
  const email = userProfile?.email || user?.email || userData?.email;

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SA";
  const displayName = fullName || "Store Admin";
  const displayEmail = email || "admin@store.com";

  const SidebarInner = ({ showClose }) => (
    <>
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img
            src={posLogo}
            alt="POS"
            style={{ width: 30, height: 30, objectFit: "contain" }}
          />
          <span style={{ fontSize: 15, fontWeight: 700 }}>POS SYSTEM</span>
        </div>
        {showClose && (
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#8a909c",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>
      <nav
        style={{
          flex: 1,
          padding: "12px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <NavLinks
          onClose={showClose ? () => setSidebarOpen(false) : undefined}
          pendingCount={pendingCount}
        />
      </nav>
      <div style={{ padding: "12px", borderTop: "1px solid #e5e7eb" }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "#e53e3e",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f5f5f5",
        overflow: "hidden",
        fontFamily: "'DM Sans','Inter',sans-serif",
        fontSize: 13,
        color: "#1a1d23",
      }}
    >
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 20,
          }}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 30,
          width: 240,
          background: "white",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        }}
        className="lg-sidebar"
      >
        <SidebarInner showClose={true} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        style={{
          width: 240,
          background: "white",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          boxShadow: "2px 0 12px rgba(0,0,0,0.06)",
        }}
        className="hidden-mobile"
      >
        <SidebarInner showClose={false} />
      </aside>

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <header
          style={{
            background: "white",
            borderBottom: "1px solid #e5e7eb",
            height: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            flexShrink: 0,
          }}
        >
          <div>
            <p
              style={{
                fontWeight: 700,
                fontSize: 15,
                margin: 0,
                letterSpacing: "-0.2px",
                color: "#1a1d23",
              }}
            >
              {storeName}
            </p>
            <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>
              {formatDate()}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                style={{
                  position: "relative",
                  width: 36,
                  height: 36,
                  border: "none",
                  background: "#1a1d23",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                title={`${pendingCount} pending restock requests`}
              >
                <Bell size={16} color="#fff" />
                {pendingCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#e53e3e",
                      border: "1.5px solid white",
                    }}
                  />
                )}
              </button>
              
              {/* Notification Dropdown */}
              {notificationOpen && (
                <>
                  <div 
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 10,
                    }}
                    onClick={() => setNotificationOpen(false)}
                  />
                  <div
                    style={{
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
                    }}
                  >
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1a1d23" }}>Restock Requests</h3>
                        <div style={{ display: "flex", gap: 8 }}>
                          {pendingCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              style={{ fontSize: 11, color: "#6b7280", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                            >
                              Mark all read
                            </button>
                          )}
                          {pendingCount > 0 && (
                            <Link 
                              to="/store-admin/restock-requests"
                              onClick={() => setNotificationOpen(false)}
                              style={{ fontSize: 12, color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}
                            >
                              View All ({pendingCount})
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ maxHeight: 300, overflowY: "auto" }}>
                      {pendingCount === 0 ? (
                        <div style={{ padding: "20px 16px", textAlign: "center", color: "#6b7280" }}>
                          <Bell size={24} color="#e5e7eb" style={{ margin: "0 auto 8px", display: "block" }} />
                          <p style={{ margin: 0, fontSize: 13 }}>No pending requests</p>
                        </div>
                      ) : (
                        pendingRequests.slice(0, 5).map((req, i) => (
                          <div
                            key={req.id || i}
                            style={{
                              padding: "12px 16px",
                              borderBottom: i < Math.min(pendingRequests.length, 5) - 1 ? "1px solid #f3f4f6" : "none",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              markAsRead(req.id);
                              navigate("/store-admin/restock-requests");
                              setNotificationOpen(false);
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                            onMouseLeave={e => e.currentTarget.style.background = "white"}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                              <div style={{ padding: 4, background: "#fffbeb", borderRadius: 4, marginTop: 2 }}>
                                <Clock size={12} color="#d97706" />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>
                                  New Restock Request
                                </p>
                                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {req.branchName} - {req.productName} ({req.requestedQuantity} units)
                                </p>
                                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>
                                  {req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Just now"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {pendingCount > 5 && (
                      <div style={{ padding: "8px 16px", background: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
                        <Link 
                          to="/store-admin/restock-requests"
                          onClick={() => setNotificationOpen(false)}
                          style={{ fontSize: 12, color: "#3b82f6", textDecoration: "none", fontWeight: 600, display: "block", textAlign: "center" }}
                        >
                          View {pendingCount - 5} more requests
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div
              onClick={() => setShowChangePassword(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px", cursor: "pointer" }}
            >
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a1d23", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1a1d23", lineHeight: 1.3 }}>{displayName}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#6b7280", lineHeight: 1.3 }}>{displayEmail}</p>
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto" }}>
          <Outlet />
        </main>

        <ChangePasswordDialog
          open={showChangePassword}
          onSuccess={handlePasswordChangeSuccess}
          onClose={() => setShowChangePassword(false)}
          isFirstTimeChange={true}
          onSignOut={handleLogout}
        />
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
