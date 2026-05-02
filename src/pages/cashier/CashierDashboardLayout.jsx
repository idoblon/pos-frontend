import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  ShoppingCart,
  User,
  Tag,
  FileText,
  Trash2,
  Minus,
  Plus,
  CreditCard,
  PauseCircle,
  Barcode,
  History,
  RotateCcw,
} from "lucide-react";
import Sidebar from "./sidebar/Sidebar";
import "./cashier-styles.css";

const PRODUCTS = [
  {
    id: 1,
    name: "Product Name",
    sku: "SKU12345",
    price: 899,
    tag: "men_shirt",
  },
  {
    id: 2,
    name: "Product Name",
    sku: "SKU12345",
    price: 899,
    tag: "men_shirt",
  },
  {
    id: 3,
    name: "Product Name",
    sku: "SKU12345",
    price: 899,
    tag: "men_shirt",
  },
];

const INITIAL_CART = [
  {
    id: 1,
    name: "Men Slim Fit Checkered Spread Collar Casual Shirt (Pack of 2)",
    sku: "SHRT-S-COTTON-BLACK-2025",
    price: 799,
    qty: 2,
  },
  {
    id: 2,
    name: "Men Slim Fit Checkered Spread Collar Casual Shirt (Pack of 2)",
    sku: "SHRT-S-COTTON-BLACK-2025",
    price: 799,
    qty: 2,
  },
  {
    id: 3,
    name: "Men Slim Fit Checkered Spread Collar Casual Shirt (Pack of 2)",
    sku: "SHRT-S-COTTON-BLACK-2025",
    price: 799,
    qty: 2,
  },
];

const TAX_RATE = 0.1;

export default function CashierDashboardLayout() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState(INITIAL_CART);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("%");
  const [note, setNote] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/cashier", label: "POS Terminal", icon: ShoppingCart },
    { path: "/cashier/orders", label: "Order History", icon: History },
    { path: "/cashier/customers", label: "Customers", icon: User },
    { path: "/cashier/returns", label: "Returns", icon: RotateCcw },
    { path: "/cashier/shift-summary", label: "Shift Summary", icon: FileText },
  ];

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const removeItem = (id) =>
    setCart((prev) => prev.filter((item) => item.id !== id));
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * TAX_RATE;
  const discountAmt =
    discountType === "%" ? subtotal * (discount / 100) : Number(discount);
  const total = Math.max(0, subtotal + tax - discountAmt);

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

  const filteredProducts = PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="cashier-layout">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="sidebar open">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* ── HEADER ── */}
      <header className="header">
        <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={16} color="#fff" />
        </button>

        <div className="header-center">
          <h1 className="header-title">POS Terminal</h1>
          <p className="header-sub">Create new Order</p>
        </div>

        <div className="avatar">A</div>
      </header>

      {/* ── BODY ── */}
      <div className="body">
        {/* ── LEFT: Product Panel ── */}
        <div className="left-panel">
          <div className="search-wrap">
            <input
              className="search-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="prod-bar">
            <span className="prod-count">
              {filteredProducts.length} product founds
            </span>
            <button className="scan-btn">
              <Barcode size={13} />
              scan
            </button>
          </div>

          <div className="prod-grid">
            {filteredProducts.map((p) => (
              <div key={p.id} className="prod-card">
                <div className="prod-img">👔</div>
                <div className="prod-info">
                  <div className="prod-name">{p.name}</div>
                  <div className="prod-sku">{p.sku}</div>
                  <div className="prod-meta">
                    <span className="prod-price">रु {p.price}</span>
                    <span className="prod-tag">{p.tag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MIDDLE: Cart Panel ── */}
        <div className="mid-panel">
          <div className="cart-header">
            <div className="cart-title">
              <ShoppingCart size={15} />
              Cart ( {totalItems} ) item
            </div>
            <div className="cart-actions">
              <button className="cart-btn">
                <PauseCircle size={13} />
                Held
              </button>
              <button className="cart-btn" onClick={clearCart}>
                <Trash2 size={13} />
                Clear
              </button>
            </div>
          </div>

          <div className="cart-list">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="ci-info">
                  <div className="ci-name">{item.name}</div>
                  <div className="ci-sku">{item.sku}</div>
                </div>
                <div className="qty-ctrl">
                  <button
                    className="qty-btn"
                    onClick={() => updateQty(item.id, -1)}
                  >
                    <Minus size={11} />
                  </button>
                  <span className="qty-num">{item.qty}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQty(item.id, 1)}
                  >
                    <Plus size={11} />
                  </button>
                </div>
                <div className="ci-price">
                  <div className="ci-unit">{item.price}</div>
                  <div className="ci-total">
                    {(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
                <button className="del-btn" onClick={() => removeItem(item.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-foot">
            <div className="cf-row">
              <span className="cf-label">Subtotal</span>
              <span className="cf-val">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="cf-row">
              <span className="cf-label">Tax</span>
              <span className="cf-val">₹{tax.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Summary Panel ── */}
        <div className="right-panel">
          {/* Customer */}
          <div className="rs">
            <div className="rs-title">
              <User size={13} />
              Customer
            </div>
            <button className="sel-cust">Select Customer</button>
          </div>

          {/* Discount */}
          <div className="rs">
            <div className="rs-title">
              <Tag size={13} />
              Discount
            </div>
            <div className="disc-row">
              <input
                className="disc-input"
                type="number"
                value={discount}
                min={0}
                onChange={(e) => setDiscount(e.target.value)}
              />
              <div className="disc-tabs">
                <button
                  className={`disc-tab ${discountType === "%" ? "active" : ""}`}
                  onClick={() => setDiscountType("%")}
                >
                  %
                </button>
                <button
                  className={`disc-tab ${discountType === "$" ? "active" : ""}`}
                  onClick={() => setDiscountType("$")}
                >
                  $
                </button>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="rs">
            <div className="rs-title">
              <FileText size={13} />
              Note
            </div>
            <textarea
              className="note-ta"
              rows={2}
              placeholder="Enter note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Total */}
          <div className="total-area">
            <div className="total-amt">
              रु {total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>
            <div className="total-lbl">Total Amount</div>
          </div>

          {/* Actions */}
          <div className="r-actions">
            <button className="pay-btn">
              <CreditCard size={15} />
              Proccess Payment
            </button>
            <button className="hold-btn">
              <PauseCircle size={15} />
              Hold Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}