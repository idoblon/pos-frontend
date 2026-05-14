import { X, ShoppingCart, History, Users, RotateCcw, FileText } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import posLogo from "@/logo/pos.png";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const navItems = [
    { path: "/cashier", label: "POS Terminal", icon: <ShoppingCart className="h-5 w-5" /> },
    { path: "/cashier/orders", label: "Order History", icon: <History className="h-5 w-5" /> },
    { path: "/cashier/customers", label: "Customers", icon: <Users className="h-5 w-5" /> },
    { path: "/cashier/returns", label: "Returns", icon: <RotateCcw className="h-5 w-5" /> },
    { path: "/cashier/shift-summary", label: "Shift Summary", icon: <FileText className="h-5 w-5" /> },
  ];
  
  return (
    <div className="w-64 border-r border-emerald-100 bg-white p-4 flex flex-col h-screen shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <img src={posLogo} alt="POS" style={{ width: 28, height: 28, objectFit: "contain" }} />
          <h1 className="text-xl font-bold text-slate-800">POS SYSTEM</h1>
        </div>
        {onClose && (
          <Button size="icon" variant="ghost" onClick={onClose} className="text-slate-600 hover:bg-emerald-50">
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
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-md"
                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
            key={item.path}
            to={item.path}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="pt-4 border-t border-emerald-100">
        <p className="text-xs text-slate-400 text-center">© 2025 POS System</p>
      </div>
    </div>
  );
};

export default Sidebar;
