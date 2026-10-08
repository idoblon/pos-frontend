import { createSlice} from "@reduxjs/toolkit"
import { getAdminTaxRate } from "@/util/adminSystemSettings";
import { getBulkSavings, getEffectivePrice, getMoq, isWeightedProduct } from "@/util/storeTypes";
import api from "@/util/api";

const initialState = {
  items: [],
  selectedCustomer: null,
  note: "",
  discount: { type: "percentage", value: 0 },
  paymentMethod: "cash",
  currentOrder: null,
  heldOrders: [],
  // Restaurant / vertical order context (optional — omitted when empty)
  orderMeta: {
    orderType: "",
    tableNumber: "",
    kitchenNote: "",
    prescriptionImage: "",
    prescriptionVerified: false,
    emiMonths: "",
  },
};

const emptyOrderMeta = () => ({
  orderType: "",
  tableNumber: "",
  kitchenNote: "",
  prescriptionImage: "",
  prescriptionVerified: false,
  emiMonths: "",
});

const normalizeQty = (product, qty) => {
  const n = Number(qty);
  if (!Number.isFinite(n)) return 1;
  // Weighted goods (kg/L) allow decimals; everything else stays integer.
  if (isWeightedProduct(product)) return Math.max(0.01, Math.round(n * 100) / 100);
  return Math.max(1, Math.floor(n));
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const stock = product.stock || 0;
      if (stock <= 0) return;
      const step = isWeightedProduct(product) ? Number(product.weightStep || 0.5) || 0.5 : 1;
      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        const next = normalizeQty(product, Number(existingItem.quantity) + step);
        if (next > stock) return;
        existingItem.quantity = next;
      } else {
        const moq = getMoq(product);
        const initialQty = moq > 0 ? Math.min(moq, stock) : normalizeQty(product, action.payload.quantity || step);
        state.items.push({
          ...product,
          quantity: initialQty,
          modifiers: [],
          kitchenNote: "",
          dosage: "",
          serials: [],
        });
      }
    },
    updateCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      if (Number(quantity) <= 0) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        const item = state.items.find((item) => item.id === id);
        if (item) {
          const stock = item.stock || 0;
          const q = normalizeQty(item, quantity);
          item.quantity = q > stock ? stock : q;
        }
      }
    },
    setCartItemField: (state, action) => {
      const { id, field, value } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item && ["modifiers", "kitchenNote", "dosage", "serials"].includes(field)) {
        item[field] = value;
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
      state.selectedCustomer = null;
      state.note = "";
      state.discount = { type: "percentage", value: 0 };
      state.paymentMethod = "cash";
      state.currentOrder = null;
      state.orderMeta = emptyOrderMeta();
    },
    holdCurrentOrder: (state) => {
      if (!state.items.length) return;
      state.heldOrders.unshift({
        id: `held-${Date.now()}`,
        createdAt: new Date().toISOString(),
        items: state.items,
        selectedCustomer: state.selectedCustomer,
        note: state.note,
        discount: state.discount,
        orderMeta: state.orderMeta,
      });
      state.items = [];
      state.selectedCustomer = null;
      state.note = "";
      state.discount = { type: "percentage", value: 0 };
      state.orderMeta = emptyOrderMeta();
    },
    restoreHeldOrder: (state, action) => {
      const heldOrder = state.heldOrders.find((order) => order.id === action.payload);
      if (!heldOrder || state.items.length) return;
      state.items = heldOrder.items;
      state.selectedCustomer = heldOrder.selectedCustomer;
      state.note = heldOrder.note;
      state.discount = heldOrder.discount;
      state.orderMeta = { ...emptyOrderMeta(), ...(heldOrder.orderMeta || {}) };
      state.heldOrders = state.heldOrders.filter((order) => order.id !== action.payload);
    },
    discardHeldOrder: (state, action) => {
      state.heldOrders = state.heldOrders.filter((order) => order.id !== action.payload);
    },
    addHeldOrder: (state, action) => {
      state.heldOrders.unshift(action.payload);
    },
    setHeldOrders: (state, action) => {
      state.heldOrders = action.payload;
    },
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    setNote: (state, action) => {
      state.note = action.payload;
    },
    setDiscount: (state, action) => {
      state.discount = action.payload;
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    setOrderMeta: (state, action) => {
      state.orderMeta = { ...state.orderMeta, ...action.payload };
    },
    resetOrder: (state) => {
      state.items = [];
      state.selectedCustomer = null;
      state.note = "";
      state.discount = { type: "percentage", value: 0 };
      state.paymentMethod = "cash";
      state.currentOrder = null;
      state.orderMeta = emptyOrderMeta();
    },
  },
});

export const selectCartItems = (state) => state.cart.items;
export const selectOrderMeta = (state) => state.cart.orderMeta || emptyOrderMeta();
export const selectCartItemsCount = (state) => state.cart.items.length;
export const selectSelectedCustomer = (state) => state.cart.selectedCustomer;
export const selectCartNote = (state) => state.cart.note;
export const selectDiscount = (state) => state.cart.discount;
export const selectPaymentMethod = (state) => state.cart.paymentMethod;
export const selectCurrentOrder = (state) => state.cart.currentOrder;
export const selectHeldOrders = (state) => state.cart.heldOrders;

export const selectSubtotal = (state) => {
  // Bulk tier wins when quantity threshold is met (WHOLESALE/GROCERY/RETAIL/ELECTRONICS).
  return state.cart.items.reduce(
    (total, item) => total + getEffectivePrice(item, item.quantity) * (item.quantity || 1),
    0,
  );
};

export const selectDiscountAmount = (state) => {
  const subtotal = selectSubtotal(state);
  const discount = state.cart.discount;
  const value = Number(discount.value) || 0;
  if (discount.type === "percentage") {
    return subtotal * (Math.min(Math.max(value, 0), 100) / 100);
  } else {
    return Math.min(Math.max(value, 0), subtotal);
  }
};

export const selectTax = (state) => {
  const subtotal = selectSubtotal(state);
  // Matches backend OrderTotals: VAT is computed on the full subtotal,
  // the discount is subtracted separately in selectTotal.
  const rate = Number(getAdminTaxRate());
  return Number.isFinite(rate) ? Math.round((subtotal * (rate / 100)) * 100) / 100 : 0;
};

export const selectTotal = (state) => {
  const subtotal = selectSubtotal(state);
  const discountAmount = selectDiscountAmount(state);
  const tax = selectTax(state);
  return Math.max(0, subtotal + tax - discountAmount);
};

export const selectBulkSavings = (state) =>
  state.cart.items.reduce((sum, item) => sum + getBulkSavings(item, item.quantity || 1), 0);

export const {
  addToCart,
  updateCartItemQuantity,
  setCartItemField,
  removeFromCart,
  clearCart,
  setSelectedCustomer,
  setNote,
  setDiscount,
  setPaymentMethod,
  setCurrentOrder,
  setOrderMeta,
  resetOrder,
  holdCurrentOrder,
  restoreHeldOrder,
  discardHeldOrder,
  addHeldOrder,
  setHeldOrders,
} = cartSlice.actions;

export const holdOrderRemotely = (context = {}) => async (dispatch, getState) => {
  const cart = getState().cart;
  if (!cart.items.length) return null;
  const response = await api.post("/api/orders/held", {
    items: cart.items.map((item) => ({
      productId: item.id || item._id,
      quantity: item.quantity || 1,
      price: getEffectivePrice(item, item.quantity || 1),
      modifiers: item.modifiers || [],
      kitchenNote: item.kitchenNote || "",
      dosage: item.dosage || "",
      serials: item.serials || [],
    })),
    customerId: cart.selectedCustomer?.id || cart.selectedCustomer?._id || null,
    selectedCustomer: cart.selectedCustomer,
    note: cart.note,
    discount: cart.discount.value,
    discountType: cart.discount.type,
    orderType: cart.orderMeta?.orderType || null,
    tableNumber: cart.orderMeta?.tableNumber || null,
    kitchenNote: cart.orderMeta?.kitchenNote || null,
    prescriptionVerified: cart.orderMeta?.prescriptionVerified || false,
    ...context,
  });
  dispatch(clearCart());
  dispatch(addHeldOrder({ ...response.data, selectedCustomer: cart.selectedCustomer }));
  return response.data;
};

export const resumeHeldOrderRemotely = (order) => async (dispatch) => {
  await api.post(`/api/orders/${encodeURIComponent(order.id)}/resume`);
  dispatch(restoreHeldOrder(order.id));
};

export const discardHeldOrderRemotely = (order) => async (dispatch) => {
  await api.delete(`/api/orders/${encodeURIComponent(order.id)}`);
  dispatch(discardHeldOrder(order.id));
};

export const fetchHeldOrders = (params = {}) => async (dispatch) => {
  const response = await api.get("/api/orders/held", { params });
  dispatch(setHeldOrders(response.data));
  return response.data;
};

export default cartSlice.reducer;
