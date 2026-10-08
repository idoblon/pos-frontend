import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/Redux Toolkit/Features/auth/authSlice";
import { getCurrentShiftProgress } from "@/Redux Toolkit/Features/shiftReport/shiftReportThunk";
import { getStoreById } from "@/Redux Toolkit/Features/Store/storeThunk";
import {
  addToCart,
  updateCartItemQuantity,
  setCartItemField,
  removeFromCart,
  clearCart,
  setSelectedCustomer,
  setDiscount,
  setNote,
  setOrderMeta,
  selectCartItems,
  selectSubtotal,
  selectTax,
  selectDiscountAmount,
  selectTotal,
  selectBulkSavings,
  selectSelectedCustomer,
  selectDiscount,
  selectCartNote,
  selectHeldOrders,
  selectOrderMeta,
  holdOrderRemotely,
  resumeHeldOrderRemotely,
  discardHeldOrderRemotely,
  fetchHeldOrders
} from "@/Redux Toolkit/Features/Cart/cartSlice";
import { toast } from "sonner";

import { Menu, ShoppingCart, Lock, X, Archive, RotateCcw } from "lucide-react";
import { formatMoney } from "@/util/currency";
import Sidebar from "./sidebar/Sidebar";
import CustomerSection from "./CustomerPaymentSection/CustomerSection";
import DiscountSection from "./CustomerPaymentSection/DiscountSection";
import NoteSection from "./CustomerPaymentSection/NoteSection";
import PaymentSection from "./CustomerPaymentSection/PaymentSection";
import ProductSection from "./ProductSection/ProductSection";
import ChangePasswordDialog from "./Settings/ChangePasswordDialog";
import secureStorage from "@/util/secureStorage";
import { getAdminTaxRate, getLowStockThreshold } from "@/util/adminSystemSettings";
import {
  RESTAURANT_ORDER_TYPES,
  freeTable,
  getBulkRule,
  getBulkTiers,
  getEffectivePrice,
  getModifierOptions,
  getMoq,
  getTables,
  isControlled,
  isExpired,
  isNearExpiry,
  isWeightedProduct,
  occupyTable,
  requiresPrescription,
  resolveStoreType,
  serialsValid,
  supportsFeature,
} from "@/util/storeTypes";
import { printKitchenTicket } from "@/components/Receipt";
import useBranchContext from "@/hooks/useBranchContext";
import { isPasswordChangeRequired, markPasswordChanged } from "@/util/firstLoginPassword";
import "./cashier-styles.css";
import OfflineOrderSync from "@/components/OfflineOrderSync";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function CashierDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(() =>
    isPasswordChangeRequired(secureStorage.getUserData()?.userId),
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userProfile } = useSelector((s) => s.user);
const { user } = useSelector((s) => s.auth);
const userData = secureStorage.getUserData();
  
  // Check for active shift on mount
  useEffect(() => {
    dispatch(getCurrentShiftProgress()).catch(() => undefined);
    dispatch(fetchHeldOrders()).catch(() => toast.error("Unable to load held orders."));
  }, [dispatch]);
  // Redux cart state
  const cart = useSelector(selectCartItems);
  const selectedCustomer = useSelector(selectSelectedCustomer);
  const discount = useSelector(selectDiscount);
  const note = useSelector(selectCartNote);
  const subtotal = useSelector(selectSubtotal);
  const tax = useSelector(selectTax);
  const discountAmt = useSelector(selectDiscountAmount);
  const total = useSelector(selectTotal);
  const bulkSavings = useSelector(selectBulkSavings);
  const taxRate = getAdminTaxRate();
  const lowStockThreshold = getLowStockThreshold();
  const heldOrders = useSelector(selectHeldOrders);
  const orderMeta = useSelector(selectOrderMeta);
  const { store } = useSelector((s) => s.store);
  const { branchId, storeId } = useBranchContext();
  // Resolution order: loaded store → user profile (carries storeType from
  // the backend UserMapper) → session. The store itself is fetched below so
  // restaurant/pharmacy panels don't silently hide on the terminal.
  const storeType = resolveStoreType(
    store,
    userProfile?.storeType || user?.storeType || userData?.storeType || "",
  );
  const isRestaurant = supportsFeature(storeType, "orderType");
  const isPharmacy = supportsFeature(storeType, "prescription");
  const isGrocery = normalizeGrocery(storeType);
  const showRxWarning = cart.some((i) => requiresPrescription(i)) && !selectedCustomer;
  const showControlledWarning = cart.some((i) => isControlled(i)) && !orderMeta.prescriptionVerified;
  const nearExpiryInCart = cart.filter((i) => isNearExpiry(i));
  const [tables, setTables] = useState(() => getTables(branchId));
  const [showTables, setShowTables] = useState(false);
  function normalizeGrocery(t) { return t === "GROCERY" || t === "PHARMACY"; }

  useEffect(() => {
    setTables(getTables(branchId));
  }, [branchId]);

  // Load the store so store-type panels (tables/KOT, Rx) resolve on the terminal.
  useEffect(() => {
    if (storeId && !store) {
      dispatch(getStoreById(storeId)).catch(() => undefined);
    }
  }, [dispatch, storeId, store]);

  const handlePrintKot = () => {
    if (!cart.length) {
      toast.error("Cart is empty — nothing to send to kitchen.");
      return;
    }
    const ok = printKitchenTicket({
      items: cart,
      tableNumber: orderMeta.tableNumber,
      orderType: orderMeta.orderType,
      kitchenNote: orderMeta.kitchenNote,
    });
    if (ok) {
      toast.success("KOT sent to kitchen");
      if (orderMeta.tableNumber) setTables(occupyTable(branchId, orderMeta.tableNumber));
    }
  };

  const handleRxImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Prescription image must be under 3MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      dispatch(setOrderMeta({ prescriptionImage: String(reader.result), prescriptionVerified: false }));
      toast.success("Prescription attached — pharmacist verification needed");
    };
    reader.readAsDataURL(file);
  };

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

    // Expired items can never be sold (PHARMACY / GROCERY).
    if (isExpired(product)) {
      toast.error(`${product.name} is expired and cannot be sold!`);
      return;
    }
    if (isNearExpiry(product)) {
      toast.warning(`${product.name} expires soon — FEFO: sell this batch first.`);
    }
    
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
    const moq = getMoq(product);
    if (moq > 1 && !existingItem) {
      toast.success(`${product.name}: MOQ ${moq} applied (wholesale pack).`);
    }
    
    dispatch(addToCart({ ...product, id: product.id || product._id }));
  };

  const updateQty = useCallback((id, delta) => {
    const item = cart.find(i => i.id === id);
    if (item) {
      const weighted = isWeightedProduct(item);
      const step = weighted ? 0.5 : 1;
      const rawQty = Number(item.quantity) + delta * step;
      const newQty = weighted ? Math.round(rawQty * 100) / 100 : rawQty;
      const stock = item.stock || 0;
      const moq = getMoq(item);
      
      if (newQty > stock) {
        toast.warning(`Cannot add more ${item.name}. Only ${stock} available in stock.`);
        return;
      }
      if (newQty < moq && newQty > 0) {
        toast.warning(`${item.name} has MOQ ${moq} — set to minimum.`);
        dispatch(updateCartItemQuantity({ id, quantity: moq }));
        return;
      }
      
      dispatch(updateCartItemQuantity({ id, quantity: newQty }));
    }
  }, [cart, dispatch]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
      if (event.target.closest("input, textarea, [contenteditable='true']")) return;
      if (event.key === "F2" && cart.length) {
        event.preventDefault();
        document.querySelector(".pay-btn")?.click();
      }
      if (event.key.toLowerCase() === "h" && cart.length) {
        event.preventDefault();
        dispatch(holdOrderRemotely()).then(() => toast.success("Order held. Retrieve it from Held orders.")).catch(() => toast.error("Unable to save the held order."));
      }
      if ((event.key === "+" || event.key === "-") && cart.length) {
        event.preventDefault();
        const item = cart[cart.length - 1];
        updateQty(item.id, event.key === "+" ? 1 : -1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cart, dispatch, updateQty]);

  const removeItem = (id) => dispatch(removeFromCart(id));
  const handleClearCart = () => {
    if (cart.length) setClearConfirmOpen(true);
  };
  const confirmClearCart = () => {
    setClearConfirmOpen(false);
    dispatch(clearCart());
  };
  const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);

  return (
    <div className="cashier-layout">
      {sidebarOpen && (
        <>
          <button className="sidebar-backdrop" aria-label="Close navigation menu" onClick={() => setSidebarOpen(false)} />
          <div className="sidebar open" role="dialog" aria-label="Navigation menu">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* HEADER */}
      <header className="header">
        <button className="menu-btn" aria-label="Open navigation menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={16} color="#fff" />
        </button>
        <div className="header-center">
          <h1 className="header-title">POS Terminal</h1>
          <p className="header-sub">Create new Order</p>
        </div>
        <div style={{ position: "relative" }}>
          <div
            role="button"
            tabIndex={0}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 4px",
              cursor: "pointer",
            }}
            onClick={() => setProfileOpen((o) => !o)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") setProfileOpen((o) => !o);
            }}
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
              <button className="cart-btn" onClick={() => dispatch(holdOrderRemotely()).then(() => toast.success("Order held.")).catch(() => toast.error("Unable to save the held order."))} disabled={!cart.length} title="Hold order (H)">
                <Archive size={13} /> Hold
              </button>
              <button className="cart-btn" onClick={handleClearCart} disabled={!cart.length}>
                Clear
              </button>
            </div>
          </div>

          {isRestaurant && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 12px", borderBottom: "1px solid #e5e7eb", background: "#f8fafc" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  aria-label="Order type"
                  value={orderMeta.orderType}
                  onChange={(e) => dispatch(setOrderMeta({ orderType: e.target.value }))}
                  style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 8px", fontSize: 12, background: "white" }}
                >
                  <option value="">Order type…</option>
                  {RESTAURANT_ORDER_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace("_", " ")}</option>
                  ))}
                </select>
                <input
                  aria-label="Table number"
                  placeholder="Table #"
                  value={orderMeta.tableNumber}
                  onChange={(e) => dispatch(setOrderMeta({ tableNumber: e.target.value }))}
                  style={{ width: 90, border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 8px", fontSize: 12, background: "white" }}
                />
                <button
                  className="cart-btn"
                  onClick={() => setShowTables((v) => !v)}
                  title="Table map"
                  style={{ whiteSpace: "nowrap" }}
                >
                  Tables
                </button>
              </div>
              {showTables && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(52px,1fr))", gap: 6 }}>
                  {tables.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        dispatch(setOrderMeta({ tableNumber: t.id }));
                        setShowTables(false);
                      }}
                      title={`${t.id} · ${t.seats} seats · ${t.status}`}
                      style={{
                        padding: "8px 4px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                        border: orderMeta.tableNumber === t.id ? "2px solid #1a1d23" : "1px solid #e5e7eb",
                        background: t.status === "OCCUPIED" ? "#fee2e2" : "#ecfdf5",
                        color: t.status === "OCCUPIED" ? "#991b1b" : "#065f46",
                      }}
                    >
                      {t.id}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  aria-label="Kitchen note"
                  placeholder="Kitchen note (KOT)…"
                  value={orderMeta.kitchenNote}
                  onChange={(e) => dispatch(setOrderMeta({ kitchenNote: e.target.value }))}
                  style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 8px", fontSize: 12, background: "white" }}
                />
                <button className="cart-btn" onClick={handlePrintKot} disabled={!cart.length} title="Print kitchen ticket">
                  KOT
                </button>
              </div>
            </div>
          )}
          {isPharmacy && (
            <div style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb", background: "#fffbeb", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#92400e" }}>
                  Rx image
                  <input type="file" accept="image/*" onChange={handleRxImage} style={{ display: "block", marginTop: 4 }} />
                </label>
                {orderMeta.prescriptionImage && (
                  <img src={orderMeta.prescriptionImage} alt="Prescription" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, border: "1px solid #fde68a" }} />
                )}
                <label style={{ fontSize: 11, color: "#92400e", display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={!!orderMeta.prescriptionVerified}
                    onChange={(e) => dispatch(setOrderMeta({ prescriptionVerified: e.target.checked }))}
                  />
                  Pharmacist verified
                </label>
              </div>
            </div>
          )}
          {showRxWarning && (
            <div style={{ padding: "8px 12px", background: "#fffbeb", borderBottom: "1px solid #fde68a", fontSize: 11, color: "#92400e" }}>
              Prescription item in cart — select a customer to record who it was dispensed to.
            </div>
          )}
          {showControlledWarning && (
            <div style={{ padding: "8px 12px", background: "#fee2e2", borderBottom: "1px solid #fecaca", fontSize: 11, color: "#991b1b", fontWeight: 700 }}>
              Controlled substance in cart — pharmacist verification required before payment.
            </div>
          )}
          {nearExpiryInCart.length > 0 && (
            <div style={{ padding: "8px 12px", background: "#ffedd5", borderBottom: "1px solid #fed7aa", fontSize: 11, color: "#9a3412" }}>
              {nearExpiryInCart.length} near-expiry item(s) — FEFO applied, consider markdown.
              <button
                className="cart-btn"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  dispatch(setDiscount({ type: "percentage", value: Math.max(Number(discount.value) || 0, 5) }));
                  toast.success("5% near-expiry markdown applied");
                }}
              >
                Apply 5% markdown
              </button>
            </div>
          )}

          <div className="cart-list">
            {cart.length === 0 && (
              <div className="cart-empty">
                <ShoppingCart size={28} strokeWidth={1.5} />
                <strong>Your cart is empty</strong>
                <span>Search or select a product to begin an order.</span>
              </div>
            )}
            {cart.map((item) => {
              const stock = item.stock || 0;
              const atMaxStock = item.quantity >= stock;
              const tiers = getBulkTiers(item);
              const bulk = tiers[tiers.length - 1] || getBulkRule(item);
              const unitPrice = getEffectivePrice(item, item.quantity || 1);
              const bulkActive = tiers.some((t) => (item.quantity || 1) >= t.minQty);
              const weighted = isWeightedProduct(item);
              const mods = getModifierOptions(item);
              const needsSerial = !!(item.requiresSerial || item.serialRequired);
              const serialOk = serialsValid(item);
              const itemMoq = getMoq(item);
              
              return (
              <div key={item.id} className="cart-item" style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div className="ci-info" style={{ flex: 1 }}>
                  <div className="ci-name">{item.name}</div>
                  <div className="ci-sku">{item.sku}{item.unit && item.unit !== "pcs" ? ` · /${item.unit}` : ""}</div>
                  {requiresPrescription(item) && (
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#92400e", marginTop: 2 }}>Rx — prescription item</div>
                  )}
                  {isControlled(item) && (
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#991b1b", marginTop: 2 }}>Controlled — verify ID</div>
                  )}
                  {itemMoq > 1 && (
                    <div style={{ fontSize: 9, color: "#92400e", marginTop: 2 }}>MOQ {itemMoq}</div>
                  )}
                  {tiers.length > 0 && (
                    <div style={{ fontSize: 9, color: bulkActive ? "#065f46" : "#6b7280", marginTop: 2 }}>
                      {bulkActive ? `Bulk rate applied` : `Bulk: ${tiers.map((t) => `${t.minQty}+ @ ${formatMoney(t.price)}`).join(" · ")}`}
                    </div>
                  )}
                  {isNearExpiry(item) && (
                    <div style={{ fontSize: 9, color: "#9a3412", marginTop: 2 }}>Expiring soon — FEFO</div>
                  )}
                  {stock > 0 && stock <= lowStockThreshold && (
                    <div style={{ fontSize: 9, color: "#d97706", marginTop: 2 }}>Only {stock} in stock</div>
                  )}
                </div>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>-</button>
                  {weighted ? (
                    <input
                      aria-label={`Quantity for ${item.name}`}
                      type="number" min={0.01} step={0.5}
                      value={item.quantity}
                      onChange={(e) => dispatch(updateCartItemQuantity({ id: item.id, quantity: Number(e.target.value) }))}
                      style={{ width: 56, textAlign: "center", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, padding: "2px 4px" }}
                    />
                  ) : (
                    <span className="qty-num">{item.quantity || 1}</span>
                  )}
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
                  <div className="ci-unit">{formatMoney(unitPrice)}{weighted ? `/${item.unit}` : ""}</div>
                  <div className="ci-total">{formatMoney(unitPrice * (item.quantity || 1))}</div>
                </div>
                <button className="del-btn" aria-label={`Remove ${item.name} from cart`} onClick={() => removeItem(item.id)}><X size={14} /></button>
                </div>
                {mods.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {mods.map((m) => {
                      const active = (item.modifiers || []).includes(m);
                      return (
                        <button
                          key={m}
                          onClick={() => {
                            const cur = item.modifiers || [];
                            dispatch(setCartItemField({ id: item.id, field: "modifiers", value: active ? cur.filter((x) => x !== m) : [...cur, m] }));
                          }}
                          style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, cursor: "pointer", border: active ? "2px solid #1a1d23" : "1px solid #e5e7eb", background: active ? "#f5f5f5" : "white" }}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                )}
                {(isRestaurant || isPharmacy) && (
                  <div style={{ display: "flex", gap: 6 }}>
                    {isRestaurant && (
                      <input
                        placeholder="Kitchen note…"
                        value={item.kitchenNote || ""}
                        onChange={(e) => dispatch(setCartItemField({ id: item.id, field: "kitchenNote", value: e.target.value }))}
                        style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 8px", fontSize: 11 }}
                      />
                    )}
                    {isPharmacy && (item.dosage !== undefined || requiresPrescription(item)) && (
                      <input
                        placeholder="Dosage…"
                        value={item.dosage || ""}
                        onChange={(e) => dispatch(setCartItemField({ id: item.id, field: "dosage", value: e.target.value }))}
                        style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 8px", fontSize: 11 }}
                      />
                    )}
                  </div>
                )}
                {needsSerial && (
                  <div>
                    <input
                      placeholder={`Serials/IMEI (${Math.floor(item.quantity) || 1} needed, comma separated)`}
                      value={(item.serials || []).join(", ")}
                      onChange={(e) => dispatch(setCartItemField({ id: item.id, field: "serials", value: String(e.target.value).split(",").map((s) => s.trim()).filter(Boolean) }))}
                      style={{ width: "100%", border: `1px solid ${serialOk ? "#e5e7eb" : "#fca5a5"}`, borderRadius: 6, padding: "4px 8px", fontSize: 11 }}
                    />
                    {!serialOk && <div style={{ fontSize: 10, color: "#991b1b" }}>Enter one unique serial per unit.</div>}
                  </div>
                )}
              </div>
            )})}
            {cart.length > 0 && (
              <div className="cart-foot">
                <div className="cf-row"><span className="cf-label">Subtotal</span><span className="cf-val">रु{subtotal.toFixed(2)}</span></div>
                {bulkSavings > 0 && (
                  <div className="cf-row"><span className="cf-label">Bulk savings</span><span className="cf-val" style={{ color: "#065f46" }}>-रु{bulkSavings.toFixed(2)}</span></div>
                )}
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
          <section className="held-orders" aria-label="Held orders">
            <div className="held-orders-title"><Archive size={14} /> Held orders ({heldOrders.length})</div>
            {heldOrders.length === 0 ? (
              <p className="held-orders-empty">Hold an order to help the next customer without losing this cart.</p>
            ) : heldOrders.map((order, index) => (
              <div className="held-order" key={order.id}>
                <span>#{index + 1} · {order.items.reduce((count, item) => count + item.quantity, 0)} items</span>
                <div>
                  <button className="icon-action" aria-label={`Retrieve held order ${index + 1}`} title="Retrieve order" disabled={cart.length > 0} onClick={() => dispatch(resumeHeldOrderRemotely(order)).catch(() => toast.error("Unable to resume held order."))}><RotateCcw size={14} /></button>
                  <button className="icon-action danger" aria-label={`Discard held order ${index + 1}`} title="Discard held order" onClick={() => dispatch(discardHeldOrderRemotely(order)).catch(() => toast.error("Unable to discard held order."))}><X size={14} /></button>
                </div>
              </div>
            ))}
          </section>
          <CustomerSection
            selectedCustomer={selectedCustomer}
            onSelectCustomer={(customer) => dispatch(setSelectedCustomer(customer))}
          />
            <DiscountSection
              discount={discount.value}
              discountType={discount.type === "percentage" ? "%" : "fixed"}
              onDiscountChange={(value) => {
                const raw = Number(value);
                if (!Number.isFinite(raw)) return;
                const isPercent = discount.type === "percentage";
                const cap = isPercent ? 100 : Math.max(subtotal, 0);
                const clamped = Math.min(Math.max(raw, 0), cap);
                if (clamped !== raw) {
                  toast.warning(isPercent ? "Discount capped at 100%" : "Discount cannot exceed the subtotal");
                }
                dispatch(setDiscount({ ...discount, value: clamped }));
              }}
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
            onOrderComplete={() => {
              dispatch(clearCart());
              // Keep the active-shift payment summary in sync with completed payments.
              dispatch(getCurrentShiftProgress()).catch(() => undefined);
            }}
          />
        </div>
      </div>
      
      <ChangePasswordDialog 
        open={passwordDialogOpen} 
        onSuccess={handlePasswordChangeSuccess}
        onClose={() => setPasswordDialogOpen(false)} 
      />
      <ConfirmDialog
        open={clearConfirmOpen}
        title="Clear this cart?"
        message="All items will be removed. This cannot be undone."
        confirmText="Clear Cart"
        danger
        onCancel={() => setClearConfirmOpen(false)}
        onConfirm={confirmClearCart}
      />
      <OfflineOrderSync />
    </div>
  );
}

