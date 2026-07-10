const HELD_ORDERS_KEY = "pos-held-orders";

export const loadHeldOrders = () => {
  if (typeof localStorage === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(HELD_ORDERS_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export const saveHeldOrders = (orders) => {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(HELD_ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // A full or unavailable browser storage must not block the register.
  }
};
