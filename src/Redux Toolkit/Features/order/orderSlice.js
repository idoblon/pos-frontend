import { createSlice } from "@reduxjs/toolkit";
import { 
  createOrder, 
  getOrderById,
  getOrdersByBranch, 
  getOrdersByCashier,
  getTodayOrdersByBranch,
  getRecentOrdersByBranch,
  deleteOrder,
  getOrdersByCustomer
} from "./orderThunk";

const initialState = {
  orders: [],
  todayOrders:[],
  customerOrders:[],
  selectedOrder:null,
  recentOrders:[],
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // order by id
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // order by branch
      .addCase(getOrdersByBranch.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrdersByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getOrdersByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // order by cashier
      .addCase(getOrdersByCashier.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrdersByCashier.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getOrdersByCashier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // today order by branch
      .addCase(getTodayOrdersByBranch.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTodayOrdersByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.todayOrders = action.payload;
      })
      .addCase(getTodayOrdersByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(
          (order) => order.id !== action.payload.id,
        );
      })
      // recent orders
      .addCase(getRecentOrdersByBranch.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRecentOrdersByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.recentOrders = action.payload;
      })
      .addCase(getRecentOrdersByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // orders by customer
      .addCase(getOrdersByCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrdersByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customerOrders = action.payload;
      })
      .addCase(getOrdersByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default orderSlice.reducer;
