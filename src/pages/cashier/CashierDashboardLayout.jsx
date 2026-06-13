import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/Redux Toolkit/Features/auth/authSlice";
import { getCurrentShiftProgress } from "@/Redux Toolkit/Features/shiftReport/shiftReportThunk";
import { 
  addToCart, 
  updateCartItemQuantity, 
  removeFromCart, 
  clearCart,
  setSelectedCustomer,
  setDiscount,
  setNote,
  selectCartItems,
  selectSubtotal,
  selectTax,
  selectDiscountAmount,
  selectTotal,
  selectSelectedCustomer,
  selectDiscount,
  selectCartNote
} from "@/Redux Toolkit/Features/Cart/cartSlice";
import { toast } from "sonner";

import { Menu, ShoppingCart, User, History, RotateCcw, FileText, Lock } from "lucide-react";
import Sidebar from "./sidebar/Sidebar";
import CustomerSection from "./CustomerPaymentSection/CustomerSection";
import DiscountSection from "./CustomerPaymentSection/DiscountSection";
import NoteSection from "./CustomerPaymentSection/NoteSection";
import PaymentSection from "./CustomerPaymentSection/PaymentSection";
import ProductSection from "./ProductSection/ProductSection";
import ChangePasswordDialog from "./Settings/ChangePasswordDialog";
import secureStorage from "@/util/secureStorage";
import { getAdminTaxRate, getLowStockThreshold } from "@/util/adminSystemSettings";
import { isPasswordChangeRequired, markPasswordChanged } from "@/util/firstLoginPassword";
import "./cashier-styles.css";

export default function CashierDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userProfile } = useSelector((s) => s.user);
const { user } = useSelector((s) => s.auth);
const userData = secureStorage.getUserData();
  
  // Check for active shift on mount
  useEffect(() => {
    dispatch(getCurrentShiftProgress()).catch(() => {
      // Silently handle 404 - no active shift exists
      console.log("No active shift found");
    });
  }, [dispatch]);

  useEffect(() => {
    const userId = secureStorage.getUserData()?.userId;
    if (isPasswordChangeRequired(userId)) {
      setPasswordDialogOpen(true);
    }
  }, []);
  
  // Redux cart state
  const cart = useSelector(selectCartItems);
  const selectedCustomer = useSelector(selectSelectedCustomer);
  const discount = useSelector(selectDiscount);
  const note = useSelector(selectCartNote);
  const subtotal = useSelector(selectSubtotal);
  const tax = useSelector(selectTax);
  const discountAmt = useSelector(selectDiscountAmount);
  const total = useSelector(selectTotal);
  const taxRate = getAdminTaxRate();
  const lowStockThreshold = getLowStockThreshold();

  // Debug logging
  useEffect(() => {
    console.log('💰 Cart Calculations:', {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      discount: discount,
      discountAmt: discountAmt.toFixed(2),
      total: total.toFixed(2)
    });
  }, [subtotal, tax, discount, discountAmt, total]);

  const fullName = userProfile?.fullName || user?.fullName || userData?.fullName;
const email = userProfile?.email || user?.email || userData?.email;
const initials = fullName
  ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  : "U";

  const handlePasswordChangeSuccess = () => {
    const userId = secureStorage.getUserData()?.userId;
    markPasswordChanged(userId);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleAddToCart = (product) => {
    const stock = product.stock || 0;
    
    // Check if product is out of stock
    if (stock <= 0) {
      toast.error(`${product.name} is out of stock!`);
      return;
    }
    
    // Check if already in cart and at max quantity
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem && existingItem.quantity >= stock) {
      toast.warning(`Cannot add more ${product.name}. Only ${stock} available in stock.`);
      return;
    }
    
    dispatch(addToCart({ ...product, id: product.id || product._id }));
  };

  const updateQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (item) {
      const newQty = item.quantity + delta;
      const stock = item.stock || 0;
      
      if (newQty > stock) {
        toast.warning(`Cannot add more ${item.name}. Only ${stock} available in stock.`);
        return;
      }
      
      dispatch(updateCartItemQuantity({ id, quantity: newQty }));
    }
  };

  const removeItem = (id) => dispatch(removeFromCart(id));
  const handleClearCart = () => dispatch(clearCart());
  const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);

  return (
    <div className="cashier-layout">
      {sidebarOpen && (
        <div className="sidebar open">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* HEADER */}
      <header className="header">
        <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={16} color="#fff" />
        </button>
        <div className="header-center">
          <h1 className="header-title">POS Terminal</h1>
          <p className="header-sub">Create new Order</p>
        </div>
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 4px",
              cursor: "pointer",
            }}
            onClick={() => setProfileOpen((o) => !o)}
          >
            <div className="avatar" style={{ flexShrink: 0 }}>
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
                {fullName || "Cashier"}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "#6b7280",
                  lineHeight: 1.3,
                }}
              >
                {email || ""}
              </p>
            </div>
          </div>
          {profileOpen && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 200, background: "white", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100, overflow: "hidden" }}>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  setPasswordDialogOpen(true);
                }}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 13, color: "#1a1d23", fontFamily: "inherit", borderBottom: "1px solid #e5e7eb" }}
              >
                <Lock size={16} />
                Change Password
              </button>
              <button
                onClick={handleLogout}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 13, color: "#e53e3e", fontFamily: "inherit" }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* BODY */}
      <div className="body">
        {/* LEFT: Products */}
        <div className="left-panel">
          <ProductSection onAddToCart={handleAddToCart} />
        </div>

        {/* MIDDLE: Cart */}
        <div className="mid-panel">
          <div className="cart-header">
            <div className="cart-title">
              <ShoppingCart size={15} />
              Cart ({totalItems} items)
            </div>
            <div className="cart-actions">
              <button className="cart-btn" onClick={handleClearCart}>
                Clear
              </button>
            </div>
          </div>

          <div className="cart-list">
            {cart.map((item) => {
              const stock = item.stock || 0;
              const atMaxStock = item.quantity >= stock;
              
              return (
              <div key={item.id} className="cart-item">
                <div className="ci-info">
                  <div className="ci-name">{item.name}</div>
                  <div className="ci-sku">{item.sku}</div>
                  {stock > 0 && stock <= lowStockThreshold && (
                    <div style={{ fontSize: 9, color: "#d97706", marginTop: 2 }}>Only {stock} in stock</div>
                  )}
                </div>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>-</button>
                  <span className="qty-num">{item.quantity || 1}</span>
                  <button 
                    className="qty-btn" 
                    onClick={() => updateQty(item.id, 1)}
                    disabled={atMaxStock}
                    style={{ opacity: atMaxStock ? 0.5 : 1, cursor: atMaxStock ? 'not-allowed' : 'pointer' }}
                  >
                    +
                  </button>
                </div>
                <div className="ci-price">
                  <div className="ci-unit">{item.price || item.sellingPrice}</div>
                  <div className="ci-total">{((item.price || item.sellingPrice) * (item.quantity || 1)).toFixed(2)}</div>
                </div>
                <button className="del-btn" onClick={() => removeItem(item.id)}>✕</button>
              </div>
            )})}
            {cart.length > 0 && (
              <div className="cart-foot">
                <div className="cf-row"><span className="cf-label">Subtotal</span><span className="cf-val">रु{subtotal.toFixed(2)}</span></div>
                <div className="cf-row"><span className="cf-label">Tax ({taxRate}%)</span><span className="cf-val">रु{tax.toFixed(2)}</span></div>
                {discountAmt > 0 && (
                  <div className="cf-row"><span className="cf-label">Discount</span><span className="cf-val" style={{ color: "#e53e3e" }}>-रु{discountAmt.toFixed(2)}</span></div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Customer + Payment */}
        <div className="right-panel">
          <CustomerSection
            selectedCustomer={selectedCustomer}
            onSelectCustomer={(customer) => dispatch(setSelectedCustomer(customer))}
          />
          <DiscountSection
            discount={discount.value}
            discountType={discount.type === "percentage" ? "%" : "fixed"}
            onDiscountChange={(value) => dispatch(setDiscount({ ...discount, value: Number(value) }))}
            onDiscountTypeChange={(type) => dispatch(setDiscount({ ...discount, type: type === "%" ? "percentage" : "fixed" }))}
          />
          <NoteSection note={note} onNoteChange={(value) => dispatch(setNote(value))} />
          <PaymentSection
            total={total}
            cart={cart}
            customer={selectedCustomer}
            discount={discount}
            discountType={discount.type}
            note={note}
            onOrderComplete={() => dispatch(clearCart())}
          />
        </div>
      </div>
      
      <ChangePasswordDialog 
        open={passwordDialogOpen} 
        onSuccess={handlePasswordChangeSuccess}
        onClose={() => setPasswordDialogOpen(false)} 
      />
    </div>
  );
}

