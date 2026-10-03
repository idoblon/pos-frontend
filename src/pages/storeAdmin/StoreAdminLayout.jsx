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
  Activity,
  HeartPulse,
  Settings,
  Store as StoreIcon,
  Menu,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/Redux Toolkit/Features/auth/authSlice";
import { getUserProfile } from "@/Redux Toolkit/Features/user/userThunk";
import { getRestockRequestsByStore } from "@/Redux Toolkit/Features/restock/restockThunk";
import { getStoreByAdmin } from "@/Redux Toolkit/Features/Store/storeThunk";
import secureStorage from "@/util/secureStorage";
import api from "@/util/api";
import posLogo from "@/logo/pos.png";
import ChangePasswordDialog from "@/pages/cashier/Settings/ChangePasswordDialog";
import { isPasswordChangeRequired, markPasswordChanged } from "@/util/firstLoginPassword";

const navItems = [
  { path: "/store-admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/store-admin/employee-activity", label: "Employee Activity", icon: Activity },
  { path: "/store-admin/operations", label: "Operations Center", icon: HeartPulse },
  { path: "/store-admin/branches", label: "Branches", icon: GitBranch },
  { path: "/store-admin/products", label: "Products", icon: Package },
  { path: "/store-admin/inventory", label: "Inventory", icon: Warehouse },
  { path: "/store-admin/restock-requests", label: "Restock Requests", icon: Truck },
  { path: "/store-admin/subscription", label: "Subscription", icon: CreditCard },
  { path: "/store-admin/employees", label: "Employees", icon: Users },
  { path: "/store-admin/categories", label: "Categories", icon: Tag },
  { path: "/store-admin/shift-summary", label: "Shift Summary", icon: Clock },
  { path: "/store-admin/reports", label: "Analytics", icon: BarChart2 },
  { path: "/store-admin/payment-settings", label: "Payment Settings", icon: Settings },
  { path: "/store-admin/profile", label: "Store Profile", icon: StoreIcon },
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
          gap: 12,
          padding: 12,
          borderRadius: 8,
          textDecoration: "none",
          fontSize: 13,
          background:
            location.pathname === path
              ? "#1a1d23"
              : "transparent",
          color: location.pathname === path ? "white" : "#475569",
          fontWeight: location.pathname === path ? 600 : 500,
          position: "relative",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => { if (location.pathname !== path) { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#111827"; } }}
        onMouseLeave={(e) => { if (location.pathname !== path) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#475569"; } }}
      >
        <Icon size={20} />
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

function SidebarInner({ showClose, onClose, pendingCount, onLogout }) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img
            src={posLogo}
            alt="POS"
            style={{ width: 28, height: 28, objectFit: "contain" }}
          />
          <span style={{ fontSize: 20, fontWeight: 700, color: "#1e293b" }}>POS SYSTEM</span>
        </div>
        {showClose && (
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#475569",
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
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <NavLinks
          onClose={showClose ? onClose : undefined}
          pendingCount={pendingCount}
        />
      </nav>
      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            padding: 12,
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
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </>
  );
}

/**
 * Free-trial countdown banner. Shows only while the store has an active
 * trial; the Upgrade button deep-links to the subscription page where the
 * existing upgrade-request + payment flow converts the trial.
 */
function TrialBanner() {
  const navigate = useNavigate();
  const [trial, setTrial] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get("/api/stores/trial-status")
      .then((res) => { if (!cancelled) setTrial(res.data); })
      .catch(() => { if (!cancelled) setTrial(null); });
    return () => { cancelled = true; };
  }, []);

  if (!trial?.isTrialActive) return null;
  const days = trial.daysRemaining ?? 0;
  const urgent = days <= 3;

  return (
    <div style={{
      margin: "16px 24px 0", padding: "12px 16px", borderRadius: 10,
      background: urgent ? "#fef2f2" : "#fffbeb",
      border: `1px solid ${urgent ? "#fecaca" : "#fde68a"}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12, flexWrap: "wrap",
    }}>
      <p style={{ margin: 0, fontSize: 13, color: "#1a1d23" }}>
        <strong>{days} {days === 1 ? "day" : "days"} left</strong> in your free trial
        ({trial.subscriptionPlan || "BASIC"} plan). Upgrade to keep your store running without interruption.
      </p>
      <button
        onClick={() => navigate("/store-admin/subscription")}
        style={{
          padding: "8px 16px", border: "none", borderRadius: 8, background: "#1a1d23",
          color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
        }}
      >
        Upgrade Now
      </button>
    </div>
  );
}

export default function StoreAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Close the drawer with Escape, like the cashier sidebar
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e) => { if (e.key === "Escape") setSidebarOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);
  const [notificationOpen, setNotificationOpen] = useState(false);
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
    queueMicrotask(() => {
      const userData = secureStorage.getUserData();
      const userId = userData?.userId;
      if (!userId) return;
      if (isPasswordChangeRequired(userId)) {
        setShowChangePassword(true);
      }
    });
  }, []);

  // Auto-refresh restock requests every 30 seconds
  useEffect(() => {
    if (!storeId) return;
    const interval = setInterval(() => {
      dispatch(getRestockRequestsByStore({ storeId }));
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch, storeId]);

  // Real pending restock requests from API
  const pendingRequests = restockRequests?.filter(r => r.status === "PENDING") || [];
  const pendingCount = pendingRequests.length;

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
      {/* Sidebar drawer — same pattern as the cashier sidebar: hidden until the header menu button opens it */}
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
              zIndex: 20,
            }}
          />
          <aside
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              left: 0,
              zIndex: 30,
              width: 256,
              background: "white",
              borderRight: "1px solid #e5e7eb",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            }}
          >
            <SidebarInner
              showClose={true}
              onClose={() => setSidebarOpen(false)}
              pendingCount={pendingCount}
              onLogout={handleLogout}
            />
          </aside>
        </>
      )}

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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Open navigation menu"
              title="Menu"
              style={{ width: 36, height: 36, border: "none", background: "#1a1d23", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, flexShrink: 0 }}
            >
              <Menu size={16} color="#fff" />
            </button>
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
          <TrialBanner />
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
    </div>
  );
}
