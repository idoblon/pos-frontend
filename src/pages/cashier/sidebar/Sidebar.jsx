import { X, ShoppingCart, History, Users, RotateCcw, FileText } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const navItems = [
    { path: "/cashier", label: "POS Terminal", icon: <ShoppingCart className="h-5 w-5" /> },
    { path: "/cashier/orders", label: "Order History", icon: <History className="h-5 w-5" /> },
    { path: "/cashier/returns", label: "Returns", icon: <RotateCcw className="h-5 w-5" /> },
    { path: "/cashier/shift-summary", label: "Shift Summary", icon: <FileText className="h-5 w-5" /> },
  ];
  
  return (
    <div className="w-64 border-r border-gray-200 bg-white p-4 flex flex-col h-screen shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          POS SYSTEM
        </h1>
        {onClose && (
          <Button size="icon" variant="ghost" onClick={onClose} className="text-gray-600 hover:bg-gray-100">
            <X />
          </Button>
        )}
      </div>
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <Link
            onClick={() => {
              if (onClose) onClose();
            }}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
              location.pathname === item.path 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-gray-700 hover:bg-gray-100"
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
        <p className="text-xs text-gray-500 text-center">© 2025 POS System</p>
      </div>
    </div>
  );
};

export default Sidebar;
