import { X, ShoppingCart, History, Users, RotateCcw, FileText } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { getBranchById } from "@/Redux Toolkit/Features/branch/branchThunk";
import secureStorage from "@/util/secureStorage";
import posLogo from "@/logo/pos.png";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { userProfile } = useSelector((s) => s.user);
  const { user } = useSelector((s) => s.auth);
  const userData = secureStorage.getUserData();
  
  const [branchName, setBranchName] = useState(null);
  const [branchAddress, setBranchAddress] = useState(null);
  
  useEffect(() => {
    const branchId = userProfile?.branchId || user?.branchId || userData?.branchId;
    
    if (branchId && branchId !== 'null') {
      // Fetch branch details to get name and address
      dispatch(getBranchById(branchId))
        .unwrap()
        .then((branch) => {
          setBranchName(branch.name || "Branch");
          setBranchAddress(branch.address || "No address configured");
        })
        .catch(() => {
          // Fallback to stored values
          const storeName = userData?.storeName || localStorage.getItem("storeName") || "Branch";
          setBranchName(storeName);
          setBranchAddress("No address configured");
        });
    } else {
      // No branch ID, use fallback
      const storeName = userData?.storeName || localStorage.getItem("storeName") || "Branch";
      setBranchName(storeName);
      setBranchAddress("No address configured");
    }
  }, [dispatch, userProfile, user, userData]);
  
  const navItems = [
    { path: "/cashier", label: "POS Terminal", icon: <ShoppingCart className="h-5 w-5" /> },
    { path: "/cashier/orders", label: "Order History", icon: <History className="h-5 w-5" /> },
    { path: "/cashier/customers", label: "Customers", icon: <Users className="h-5 w-5" /> },
    { path: "/cashier/returns", label: "Returns", icon: <RotateCcw className="h-5 w-5" /> },
    { path: "/cashier/shift-summary", label: "Shift Summary", icon: <FileText className="h-5 w-5" /> },
  ];
  
  return (
    <div className="w-64 border-r border-gray-200 bg-white p-4 flex flex-col h-screen shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <img src={posLogo} alt="POS" style={{ width: 28, height: 28, objectFit: "contain" }} />
          <h1 className="text-xl font-bold text-slate-800">POS SYSTEM</h1>
        </div>
        {onClose && (
          <Button size="icon" variant="ghost" onClick={onClose} className="text-slate-600 hover:bg-gray-100">
            <X />
          </Button>
        )}
      </div>
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <Link
            onClick={() => { if (onClose) onClose(); }}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
              location.pathname === item.path
                ? "bg-gradient-to-r from-gray-800 to-gray-600 text-white font-semibold shadow-md"
                : "text-slate-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            key={item.path}
            to={item.path}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-700 font-semibold">
            {branchName}
          </p>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            {branchAddress}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;