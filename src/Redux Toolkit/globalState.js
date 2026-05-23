import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Features/auth/authSlice";
import userReducer from "./Features/user/userSlice";
import productReducer from "./Features/product/productSlice";
import inventoryReducer from "./Features/inventory/inventorySlice";
import orderReducer from "./Features/order/orderSlice";
import refundReducer from "./Features/refund/refundSlice";
import shiftReportReducer from "./Features/shiftReport/shiftReportSlice";
import customerReducer from "./Features/customer/customerSlice";
import branchReducer from "./Features/branch/branchSlice";
import categoryReducer from "./Features/category/categorySlice";
import employeeReducer from "./Features/Employee/employeeSlice";
import storeReducer from "./Features/Store/storeSlice";
import cartReducer from "./Features/Cart/cartSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    customer: customerReducer,
    product: productReducer,
    inventory: inventoryReducer,
    order: orderReducer,
    refund: refundReducer,
    shiftReport: shiftReportReducer,
    branch: branchReducer,
    category: categoryReducer,
    employee: employeeReducer,
    store: storeReducer,
    cart: cartReducer,
  },
});

export default store;
