import { beforeEach, describe, expect, it, vi } from "vitest";
import cartReducer, {
  addToCart,
  holdCurrentOrder,
  restoreHeldOrder,
  setDiscount,
  setNote,
  setSelectedCustomer,
  selectDiscountAmount,
  selectSubtotal,
  selectTax,
  selectTotal,
  updateCartItemQuantity,
} from "./cartSlice";

const product = { id: 101, name: "Tea", price: 100, stock: 2 };

const stateForSelectors = (cart) => ({ cart });

describe("cart checkout safeguards", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  it("does not add stock that is unavailable or exceed available stock", () => {
    let state = cartReducer(undefined, addToCart({ ...product, stock: 0 }));
    expect(state.items).toEqual([]);

    state = cartReducer(state, addToCart(product));
    state = cartReducer(state, addToCart(product));
    state = cartReducer(state, addToCart(product));
    expect(state.items[0].quantity).toBe(2);

    state = cartReducer(state, updateCartItemQuantity({ id: product.id, quantity: 99 }));
    expect(state.items[0].quantity).toBe(2);
  });

  it("calculates subtotal, tax, bounded discount, and final total consistently", () => {
    let state = cartReducer(undefined, addToCart(product));
    state = cartReducer(state, addToCart(product));
    state = cartReducer(state, setDiscount({ type: "percentage", value: 10 }));

    expect(selectSubtotal(stateForSelectors(state))).toBe(200);
    expect(selectTax(stateForSelectors(state))).toBe(26);
    expect(selectDiscountAmount(stateForSelectors(state))).toBe(20);
    expect(selectTotal(stateForSelectors(state))).toBe(206);

    state = cartReducer(state, setDiscount({ type: "fixed", value: 999 }));
    expect(selectDiscountAmount(stateForSelectors(state))).toBe(200);
    expect(selectTotal(stateForSelectors(state))).toBe(26);
  });
});

describe("held-order recovery", () => {
  it("preserves cart context when held and restores it to an empty register", () => {
    let state = cartReducer(undefined, addToCart(product));
    state = cartReducer(state, setSelectedCustomer({ id: 12, fullName: "Asha" }));
    state = cartReducer(state, setNote("No sugar"));
    state = cartReducer(state, setDiscount({ type: "fixed", value: 5 }));

    state = cartReducer(state, holdCurrentOrder());
    expect(state.items).toEqual([]);
    expect(state.heldOrders).toHaveLength(1);

    const heldId = state.heldOrders[0].id;
    state = cartReducer(state, restoreHeldOrder(heldId));

    expect(state.items).toEqual([{ ...product, quantity: 1 }]);
    expect(state.selectedCustomer).toEqual({ id: 12, fullName: "Asha" });
    expect(state.note).toBe("No sugar");
    expect(state.discount).toEqual({ type: "fixed", value: 5 });
    expect(state.heldOrders).toEqual([]);
  });

  it("does not overwrite an active cart when a held order is restored", () => {
    let state = cartReducer(undefined, addToCart(product));
    state = cartReducer(state, holdCurrentOrder());
    const heldId = state.heldOrders[0].id;

    state = cartReducer(state, addToCart({ id: 202, name: "Coffee", price: 150, stock: 1 }));
    state = cartReducer(state, restoreHeldOrder(heldId));

    expect(state.items).toEqual([{ id: 202, name: "Coffee", price: 150, stock: 1, quantity: 1 }]);
    expect(state.heldOrders).toHaveLength(1);
  });
});
