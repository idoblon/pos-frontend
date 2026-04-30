import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, ShoppingCart, User, ChevronDown } from "lucide-react";
import Sidebar from "./sidebar/Sidebar";
import { useSelector } from "react-redux";

const CashierDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart?.items || []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/orders")) return "Order History";
    if (path.includes("/customers")) return "Customer Management";
    if (path.includes("/returns")) return "Returns & Refunds";
    if (path.includes("/shift-summary")) return "Shift Summary";
    return "Create Order";
  };

  const totalCartItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out bg-white shadow-xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar isOpen={true} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4 relative">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                POS Terminal
              </h1>
              <p className="text-sm text-gray-500">
                Create New Order
              </p>
            </div>

            <div className="flex items-center gap-4">
            {/* Cart Badge */}
            {totalCartItems > 0 && (
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalCartItems}
                </span>
              </div>
            )}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2"
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">
                  {user?.fullName || "Cashier"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                    Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600">
                    Logout
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CashierDashboardLayout;
