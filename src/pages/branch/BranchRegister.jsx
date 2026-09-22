import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { ArrowLeft, ShoppingCart, X } from "lucide-react";
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
  selectCartNote,
} from "@/Redux Toolkit/Features/Cart/cartSlice";
import { getCurrentShiftProgress } from "@/Redux Toolkit/Features/shiftReport/shiftReportThunk";
import ProductSection from "@/pages/cashier/ProductSection/ProductSection";
import CustomerSection from "@/pages/cashier/CustomerPaymentSection/CustomerSection";
import DiscountSection from "@/pages/cashier/CustomerPaymentSection/DiscountSection";
import NoteSection from "@/pages/cashier/CustomerPaymentSection/NoteSection";
import PaymentSection from "@/pages/cashier/CustomerPaymentSection/PaymentSection";
import { formatMoney } from "@/util/currency";
import { getAdminTaxRate, getLowStockThreshold } from "@/util/adminSystemSettings";
import "@/pages/cashier/cashier-styles.css";

export default function BranchRegister() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
  const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);

  useEffect(() => {
    dispatch(getCurrentShiftProgress()).catch(() => undefined);
  }, [dispatch]);

  const handleAddToCart = (product) => {
    const stock = product.stock || 0;
    if (stock <= 0) { toast.error(`${product.name} is out of stock!`); return; }
    const existing = cart.find((i) => i.id === product.id);
    if (existing && existing.quantity >= stock) {
      toast.warning(`Only ${stock} in stock for ${product.name}.`);
      return;
    }
    dispatch(addToCart({ ...product, id: product.id || product._id }));
  };

  const updateQty = useCallback((id, delta) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty > (item.stock || 0)) {
      toast.warning(`Only ${item.stock} in stock for ${item.name}.`);
      return;
    }
    dispatch(updateCartItemQuantity({ id, quantity: newQty }));
  }, [cart, dispatch]);

  const handleClearCart = () => {
    if (cart.length && window.confirm("Clear this cart? This cannot be undone.")) {
      dispatch(clearCart());
    }
  };

  return (
    <div className="cashier-layout">
      {/* Header */}
      <header className="header">
        <button
          onClick={() => navigate("/branch")}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#1a1d23", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "6px 8px", borderRadius: 8 }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
          onMouseLeave={(e) => e.currentTarget.style.background = "none"}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="header-center">
          <h1 className="header-title">Register</h1>
          <p className="header-sub">Branch Manager · Create Order</p>
        </div>
        <div style={{ width: 130 }} />
      </header>

      {/* Body */}
      <div className="body">
        {/* Products */}
        <div className="left-panel">
          <ProductSection onAddToCart={handleAddToCart} />
        </div>

        {/* Cart */}
        <div className="mid-panel">
          <div className="cart-header">
            <div className="cart-title">
              <ShoppingCart size={15} /> Cart ({totalItems} items)
            </div>
            <button className="cart-btn" onClick={handleClearCart} disabled={!cart.length}>
              Clear
            </button>
          </div>

          <div className="cart-list">
            {cart.length === 0 && (
              <div className="cart-empty">
                <ShoppingCart size={28} strokeWidth={1.5} />
                <strong>Your cart is empty</strong>
                <span>Search or select a product to begin an order.</span>
              </div>
            )}
            {cart.map((item) => {
              const atMaxStock = item.quantity >= (item.stock || 0);
              return (
                <div key={item.id} className="cart-item">
                  <div className="ci-info">
                    <div className="ci-name">{item.name}</div>
                    <div className="ci-sku">{item.sku}</div>
                    {item.stock > 0 && item.stock <= lowStockThreshold && (
                      <div style={{ fontSize: 9, color: "#d97706", marginTop: 2 }}>Only {item.stock} in stock</div>
                    )}
                  </div>
                  <div className="qty-ctrl">
                    <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>-</button>
                    <span className="qty-num">{item.quantity || 1}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, 1)} disabled={atMaxStock} style={{ opacity: atMaxStock ? 0.5 : 1, cursor: atMaxStock ? "not-allowed" : "pointer" }}>+</button>
                  </div>
                  <div className="ci-price">
                    <div className="ci-unit">{formatMoney(item.price || item.sellingPrice)}</div>
                    <div className="ci-total">{formatMoney((item.price || item.sellingPrice) * (item.quantity || 1))}</div>
                  </div>
                  <button className="del-btn" onClick={() => dispatch(removeFromCart(item.id))}><X size={14} /></button>
                </div>
              );
            })}
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

        {/* Right: Customer + Payment */}
        <div className="right-panel">
          <CustomerSection
            selectedCustomer={selectedCustomer}
            onSelectCustomer={(c) => dispatch(setSelectedCustomer(c))}
          />
          <DiscountSection
            discount={discount.value}
            discountType={discount.type === "percentage" ? "%" : "fixed"}
            onDiscountChange={(v) => dispatch(setDiscount({ ...discount, value: Number(v) }))}
            onDiscountTypeChange={(t) => dispatch(setDiscount({ ...discount, type: t === "%" ? "percentage" : "fixed" }))}
          />
          <NoteSection note={note} onNoteChange={(v) => dispatch(setNote(v))} />
          <PaymentSection
            total={total}
            cart={cart}
            customer={selectedCustomer}
            discount={discount}
            discountType={discount.type}
            note={note}
            onOrderComplete={() => {
              dispatch(clearCart());
              dispatch(getCurrentShiftProgress()).catch(() => undefined);
            }}
          />
        </div>
      </div>
    </div>
  );
}
