import { createSlice} from "@reduxjs/toolkit"

const initialState = {
  items: [],
  selectedCustomer: null,
  note: "",
  discount: { type: "percentage", value: 0 },
  paymentMethod: "cash",
  currentOrder: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const stock = product.stock || 0;
      
      // Prevent adding out of stock items
      if (stock <= 0) {
        return;
      }
      
      const existingItem = state.items.find(
        (item) => item.id === product.id,
      );
      if (existingItem) {
        // Check if we can add more (stock limit)
        if (existingItem.quantity >= stock) {
          return; // Cannot add more than available stock
        }
        existingItem.quantity += 1;
      } else {
        const productWithQuantity = {
          ...product,
          quantity: 1,
        };
        state.items.push(productWithQuantity);
      }
    },
    updateCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        const item = state.items.find((item) => item.id === id);
        if (item) {
          const stock = item.stock || 0;
          // Prevent exceeding stock
          if (quantity > stock) {
            item.quantity = stock;
          } else {
            item.quantity = quantity;
          }
        }
      }
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.id !== productId);
    },
    clearCart: (state) => {
      state.items = [];
      state.selectedCustomer = null;
      state.note = "";
      state.discount = { type: "percentage", value: 0 };
      state.paymentMethod = "cash";
      state.currentOrder = null;
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
    resetOrder: (state) => {
      state.items = [];
      state.selectedCustomer = null;
      state.note = "";
      state.discount = { type: "percentage", value: 0 };
      state.paymentMethod = "cash";
      state.currentOrder = null;
    },
  },
});

export const selectCartItems = (state) => state.cart.items;
export const selectCartItemsCount = (state) => state.cart.items.length;
export const selectSelectedCustomer = (state) => state.cart.selectedCustomer;
export const selectCartNote = (state) => state.cart.note;
export const selectDiscount = (state) => state.cart.discount;
export const selectPaymentMethod = (state) => state.cart.paymentMethod;
export const selectCurrentOrder = (state) => state.cart.currentOrder;

export const selectSubtotal = (state) => {
  return state.cart.items.reduce((total, item) => total + (item.price || item.sellingPrice || 0) * item.quantity, 0);
};

export const selectTax = (state) => {
  const subtotal = selectSubtotal(state);
  return subtotal * 0.13; // 13% VAT
};

export const selectDiscountAmount = (state) => {
  const subtotal = selectSubtotal(state);
  const discount = state.cart.discount;

  if (discount.type === "percentage") {
    return subtotal * (discount.value / 100);
  } else {
    return discount.value;
  }
};

export const selectTotal = (state) => {
  const subtotal = selectSubtotal(state);
  const tax = selectTax(state);
  const discountAmount = selectDiscountAmount(state);

  return subtotal + tax - discountAmount;
};

export const {
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  setSelectedCustomer,
  setNote,
  setDiscount,
  setPaymentMethod,
  setCurrentOrder,
  resetOrder,
} = cartSlice.actions;

export default cartSlice.reducer;