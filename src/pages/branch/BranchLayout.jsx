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
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/Redux Toolkit/Features/auth/authSlice";
import { getUserProfile } from "@/Redux Toolkit/Features/user/userThunk";
import { getBranchById } from "@/Redux Toolkit/Features/branch/branchThunk";
import secureStorage from "@/util/secureStorage";
import posLogo from "@/logo/pos.png";

const navItems = [
  { path: "/branch", label: "Overview", icon: LayoutDashboard },
  { path: "/branch/orders", label: "Orders", icon: ShoppingBag },
  { path: "/branch/inventory", label: "Inventory", icon: Package },
  { path: "/branch/customers", label: "Customers", icon: UserCircle },
  { path: "/branch/employees", label: "Employees", icon: Users },
  { path: "/branch/reports", label: "Reports", icon: BarChart2 },
  { path: "/branch/refunds", label: "Refunds", icon: RotateCcw },
  { path: "/branch/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onClose }) {
  const location = useLocation();
  return navItems.map(({ path, label, icon: Icon }) => {
    const active = location.pathname === path;
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
            ? "linear-gradient(135deg,#1a1d23,#4a4d55)"
            : "transparent",
          color: active ? "white" : "#4b5563",
          fontWeight: active ? 600 : 500,
        }}
      >
        <Icon size={17} />
        {label}
      </Link>
    );
  });
}

export default function BranchLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userProfile } = useSelector((s) => s.user);
  const { branch } = useSelector((s) => s.branch);
  const userData = secureStorage.getUserData();
  const branchId = userData?.branchId;

  useEffect(() => {
    if (!userProfile) dispatch(getUserProfile());
    if (branchId) dispatch(getBranchById(branchId));
  }, [dispatch, userProfile, branchId]);

  const handleLogout = () => {
    dispatch(logout());
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
            <button
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
            >
              <Bell size={16} color="#fff" />
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#e53e3e",
                  border: "1.5px solid white",
                }}
              />
            </button>

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
                  background: "linear-gradient(135deg,#1a1d23,#4a4d55)",
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
