import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/Redux Toolkit/Features/auth/authSlice";
import { Menu, ShoppingCart, User, History, RotateCcw, FileText } from "lucide-react";
import Sidebar from "./sidebar/Sidebar";
import CustomerSection from "./CustomerPaymentSection/CustomerSection";
import DiscountSection from "./CustomerPaymentSection/DiscountSection";
import NoteSection from "./CustomerPaymentSection/NoteSection";
import PaymentSection from "./CustomerPaymentSection/PaymentSection";
import ProductSection from "./ProductSection/ProductSection";
import "./cashier-styles.css";

const TAX_RATE = 0.1;

export default function CashierDashboardLayout() {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("%");
  const [note, setNote] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userProfile } = useSelector((s) => s.user);

  const initials = userProfile
    ? `${userProfile.firstName?.[0] ?? ""}${userProfile.lastName?.[0] ?? ""}`.toUpperCase()
    : "U";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id || i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          (i.id === product.id || i._id === product._id)
            ? { ...i, qty: (i.qty || i.quantity || 1) + 1 }
            : i
        );
      }
      return [...prev, { ...product, id: product.id || product._id, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => item.id === id ? { ...item, qty: (item.qty || 1) + delta } : item)
        .filter((item) => (item.qty || 1) > 0)
    );
  };

  const removeItem = (id) => setCart((prev) => prev.filter((item) => item.id !== id));
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
  const tax = subtotal * TAX_RATE;
  const discountAmt = discountType === "%" ? subtotal * (discount / 100) : Number(discount);
  const total = Math.max(0, subtotal + tax - discountAmt);
  const totalItems = cart.reduce((sum, i) => sum + (i.qty || 1), 0);

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
          <div className="avatar" onClick={() => setProfileOpen((o) => !o)} style={{ cursor: "pointer" }}>
            {initials}
          </div>
          {profileOpen && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 200, background: "white", border: "1px solid #d1fae5", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #d1fae5" }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>
                  {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "Cashier"}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>{userProfile?.email ?? ""}</p>
              </div>
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
              <button className="cart-btn" onClick={clearCart}>
                Clear
              </button>
            </div>
          </div>

          <div className="cart-list">
            {cart.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af", padding: "40px 0" }}>
                <ShoppingCart size={40} style={{ marginBottom: 8, opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: 13 }}>Cart is empty</p>
                <p style={{ margin: "4px 0 0", fontSize: 11 }}>Click a product to add</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="ci-info">
                    <div className="ci-name">{item.name}</div>
                    <div className="ci-sku">{item.sku}</div>
                  </div>
                  <div className="qty-ctrl">
                    <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>-</button>
                    <span className="qty-num">{item.qty || 1}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                  <div className="ci-price">
                    <div className="ci-unit">{item.price}</div>
                    <div className="ci-total">{(item.price * (item.qty || 1)).toFixed(2)}</div>
                  </div>
                  <button className="del-btn" onClick={() => removeItem(item.id)}>✕</button>
                </div>
              ))
            )}
          </div>

          <div className="cart-foot">
            <div className="cf-row"><span className="cf-label">Subtotal</span><span className="cf-val">रु{subtotal.toFixed(2)}</span></div>
            <div className="cf-row"><span className="cf-label">Tax (10%)</span><span className="cf-val">रु{tax.toFixed(2)}</span></div>
            {discountAmt > 0 && (
              <div className="cf-row"><span className="cf-label">Discount</span><span className="cf-val" style={{ color: "#e53e3e" }}>-रु{discountAmt.toFixed(2)}</span></div>
            )}
          </div>
        </div>

        {/* RIGHT: Customer + Payment */}
        <div className="right-panel">
          <CustomerSection
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setSelectedCustomer}
          />
          <DiscountSection
            discount={discount}
            discountType={discountType}
            onDiscountChange={setDiscount}
            onDiscountTypeChange={setDiscountType}
          />
          <NoteSection note={note} onNoteChange={setNote} />
          <PaymentSection
            total={total}
            cart={cart}
            customer={selectedCustomer}
            discount={discount}
            discountType={discountType}
            note={note}
            onOrderComplete={() => {
              setCart([]);
              setSelectedCustomer(null);
              setDiscount(0);
              setNote("");
            }}
          />
        </div>
      </div>
    </div>
  );
}