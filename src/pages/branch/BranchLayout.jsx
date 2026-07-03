import { useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  UserCircle,
  Users,
  BarChart2,
  RotateCcw,
  Settings,
  X,
  LogOut,
  Bell,
  Menu,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout as clearAuth } from "@/Redux Toolkit/Features/auth/authSlice";
import { logout as logoutThunk } from "@/Redux Toolkit/Features/auth/authThunk";
import { getUserProfile } from "@/Redux Toolkit/Features/user/userThunk";
import { getBranchById } from "@/Redux Toolkit/Features/branch/branchThunk";
import { getRestockRequestsByBranch } from "@/Redux Toolkit/Features/restock/restockThunk";
import secureStorage from "@/util/secureStorage";
import posLogo from "@/logo/pos.png";
import ChangePasswordDialog from "@/pages/cashier/Settings/ChangePasswordDialog";
import { isPasswordChangeRequired, markPasswordChanged } from "@/util/firstLoginPassword";

const navItems = [
  { path: "/branch", label: "Overview", icon: LayoutDashboard },
  { path: "/branch/orders", label: "Orders", icon: ShoppingBag },
  { path: "/branch/inventory", label: "Inventory", icon: Package },
  { path: "/branch/restock-requests", label: "Restock Requests", icon: Truck },
  { path: "/branch/customers", label: "Customers", icon: UserCircle },
  { path: "/branch/employees", label: "Employees", icon: Users },
  { path: "/branch/reports", label: "Reports", icon: BarChart2 },
  { path: "/branch/shift-summary", label: "Shift Summary", icon: Clock },
  { path: "/branch/refunds", label: "Refunds", icon: RotateCcw },
  { path: "/branch/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onClose, notificationCount }) {
  const location = useLocation();
  return navItems.map(({ path, label, icon: Icon }) => {
    const active = location.pathname === path;
    const isRestockPage = path === "/branch/restock-requests";
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
          background: active
            ? "#1a1d23"
            : "transparent",
          color: active ? "white" : "#4b5563",
          fontWeight: active ? 600 : 500,
          position: "relative",
        }}
      >
        <Icon size={17} color={active ? "white" : "#1a1d23"} />
        {label}
        {isRestockPage && notificationCount > 0 && (
          <span style={{
            position: "absolute",
            right: 8,
            top: 6,
            background: "#059669",
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
            {notificationCount > 99 ? "99+" : notificationCount}
          </span>
        )}
      </Link>
    );
  });
}

export default function BranchLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [readNotifications, setReadNotifications] = useState(
    () => JSON.parse(localStorage.getItem('readBranchNotifications') || '[]')
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userProfile } = useSelector((s) => s.user);
  const { branch } = useSelector((s) => s.branch);
  const { requests: restockRequests } = useSelector((s) => s.restock);
  const userData = secureStorage.getUserData();
  const branchId = userData?.branchId;

  useEffect(() => {
    if (!userProfile) dispatch(getUserProfile());
    if (branchId) {
      dispatch(getBranchById(branchId));
      dispatch(getRestockRequestsByBranch({ branchId }));
    }
  }, [dispatch, userProfile, branchId]);

  useEffect(() => {
    const userId = secureStorage.getUserData()?.userId;
    if (isPasswordChangeRequired(userId)) {
      setShowChangePassword(true);
    }
  }, []);

  const handlePasswordChangeSuccess = () => {
    const userId = secureStorage.getUserData()?.userId;
    markPasswordChanged(userId);
  };

  // Auto-refresh restock requests every 30 seconds
  useEffect(() => {
    if (!branchId) return;
    const interval = setInterval(() => {
      dispatch(getRestockRequestsByBranch({ branchId }));
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch, branchId]);

  // Count approved/rejected/fulfilled requests (new notifications)
  const allNotifications = (restockRequests || []).filter(r =>
    (r.status === "APPROVED" || r.status === "REJECTED" || r.status === "FULFILLED") &&
    !readNotifications.includes(r.id)
  );
  const notificationCount = allNotifications.length;

  const markAsRead = (requestId) => {
    if (!readNotifications.includes(requestId)) {
      const updated = [...readNotifications, requestId];
      localStorage.setItem('readBranchNotifications', JSON.stringify(updated));
      setReadNotifications(updated);
    }
  };

  const markAllAsRead = () => {
    const allIds = (restockRequests || []).map(r => r.id);
    localStorage.setItem('readBranchNotifications', JSON.stringify(allIds));
    setReadNotifications(allIds);
    setNotificationOpen(false);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
    } catch {
      dispatch(clearAuth());
    }
    navigate("/login");
  };

  const fullName =
    userProfile?.fullName ||
    (userProfile?.firstName
      ? `${userProfile.firstName} ${userProfile.lastName ?? ""}`.trim()
      : null) ||
    userData?.fullName;
  const email = userProfile?.email || userData?.email;

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "BM";
  const displayName = fullName || "Branch Manager";
  const displayEmail = email || "";

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
          notificationCount={notificationCount}
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
          <LogOut size={17} color="#e53e3e" />
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
          {/* Left — hamburger + branch name */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="lg-sidebar"
              onClick={() => setSidebarOpen(true)}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                display: "none",
              }}
            >
              <Menu size={20} />
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
                {branch?.name ?? "Branch Dashboard"}
              </p>
              <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Right — bell + user info */}
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
                title={`${notificationCount} restock request updates`}
              >
                <Bell size={16} color="#fff" />
                {notificationCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#059669",
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
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1a1d23" }}>Request Updates</h3>
                        <div style={{ display: "flex", gap: 8 }}>
                          {notificationCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              style={{ fontSize: 11, color: "#6b7280", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                            >
                              Mark all read
                            </button>
                          )}
                          {notificationCount > 0 && (
                            <Link 
                              to="/branch/restock-requests"
                              onClick={() => setNotificationOpen(false)}
                              style={{ fontSize: 12, color: "#059669", textDecoration: "none", fontWeight: 600 }}
                            >
                              View All ({notificationCount})
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ maxHeight: 300, overflowY: "auto" }}>
                      {notificationCount === 0 ? (
                        <div style={{ padding: "20px 16px", textAlign: "center", color: "#6b7280" }}>
                          <Bell size={24} color="#e5e7eb" style={{ margin: "0 auto 8px", display: "block" }} />
                          <p style={{ margin: 0, fontSize: 13 }}>No new updates</p>
                        </div>
                      ) : (
                        allNotifications.slice(0, 5).map((req, i) => {
                          const isApproved = req.status === "APPROVED";
                          const isPending = req.status === "PENDING";
                          const isRejected = req.status === "REJECTED";
                          const isFulfilled = req.status === "FULFILLED";
                          
                          let StatusIcon, statusColor, statusBg, statusText;
                          
                          if (isPending) {
                            StatusIcon = Truck;
                            statusColor = "#d97706";
                            statusBg = "#fffbeb";
                            statusText = "Request Submitted";
                          } else if (isApproved) {
                            StatusIcon = Truck;
                            statusColor = "#059669";
                            statusBg = "#f0fdf4";
                            statusText = "Products Coming Soon";
                          } else if (isFulfilled) {
                            StatusIcon = CheckCircle;
                            statusColor = "#1a1d23";
                            statusBg = "#f0f0f0";
                            statusText = "Products Received";
                          } else {
                            StatusIcon = XCircle;
                            statusColor = "#e53e3e";
                            statusBg = "#fef2f2";
                            statusText = "Request Rejected";
                          }
                          
                          return (
                            <div
                              key={req.id}
                              style={{
                                padding: "12px 16px",
                                borderBottom: i < Math.min(allNotifications.length, 5) - 1 ? "1px solid #f3f4f6" : "none",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                              onClick={() => {
                                markAsRead(req.id);
                                navigate("/branch/restock-requests");
                                setNotificationOpen(false);
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                              onMouseLeave={e => e.currentTarget.style.background = "white"}
                            >
                              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                <div style={{ padding: 4, background: statusBg, borderRadius: 4, marginTop: 2 }}>
                                  <StatusIcon size={12} color={statusColor} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: statusColor }}>
                                    {statusText}
                                  </p>
                                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {req.productName} - {req.requestedQuantity} units
                                  </p>
                                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>
                                    {req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Just now"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    
                    {notificationCount > 5 && (
                      <div style={{ padding: "8px 16px", background: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
                        <Link 
                          to="/branch/restock-requests"
                          onClick={() => setNotificationOpen(false)}
                          style={{ fontSize: 12, color: "#059669", textDecoration: "none", fontWeight: 600, display: "block", textAlign: "center" }}
                        >
                          View {notificationCount - 5} more updates
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 4px",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#1a1d23",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ textAlign: "left" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#1a1d23",
                    lineHeight: 1.3,
                  }}
                >
                  {displayName}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: "#6b7280",
                    lineHeight: 1.3,
                  }}
                >
                  {displayEmail}
                </p>
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

