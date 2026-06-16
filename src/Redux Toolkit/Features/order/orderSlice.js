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
import { createRefund, getRefundsByBranch, getRefundsByCashier } from "../refund/refundThunk";

const initialState = {
  orders: [],
  todayOrders:[],
  customerOrders:[],
  selectedOrder:null,
  recentOrders:[],
  refundedOrderIds: [], // Track refunded order IDs as array
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    patchOrder: (state, action) => {
      const idx = state.orders.findIndex(o => o.id === action.payload.id);
      if (idx !== -1) {
        state.orders[idx] = { ...state.orders[idx], ...action.payload };
      } else {
        state.orders.unshift(action.payload);
      }
    },
    markOrderAsRefunded: (state, action) => {
      const { orderId } = action.payload;
      const orderIdx = state.orders.findIndex(o => o.id === orderId);
      console.log("🔄 markOrderAsRefunded - orderId:", orderId, "found at index:", orderIdx);
      if (orderIdx !== -1) {
        console.log("🔄 Before update - order status:", state.orders[orderIdx].status);
        state.orders[orderIdx] = {
          ...state.orders[orderIdx],
          status: "REFUNDED",
          refundedAmount: state.orders[orderIdx].totalAmount,
          lastRefundDate: new Date().toISOString()
        };
        console.log("🔄 After update - order status:", state.orders[orderIdx].status);
        if (!state.refundedOrderIds.includes(orderId)) {
          state.refundedOrderIds.push(orderId);
        }
      } else {
        console.log("❌ Order not found for refund update:", orderId);
      }
    },
    // Helper function to mark orders as refunded based on existing refunds
    markExistingRefunds: (state, action) => {
      const refundedOrderIds = action.payload;
      console.log("🔄 Marking existing refunds:", refundedOrderIds);
      
      state.orders.forEach((order, index) => {
        if (refundedOrderIds.includes(order.id)) {
          console.log("🔄 Marking order as refunded:", order.id);
          state.orders[index] = {
            ...order,
            status: "REFUNDED",
            refundedAmount: order.totalAmount,
            lastRefundDate: new Date().toISOString()
          };
          if (!state.refundedOrderIds.includes(order.id)) {
            state.refundedOrderIds.push(order.id);
          }
        }
      });
    },
  },
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
      // order by branch — accumulate across all branches (merge by id)
      .addCase(getOrdersByBranch.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrdersByBranch.fulfilled, (state, action) => {
        state.loading = false;
        const incoming = action.payload;
        const existingIds = new Set(state.orders.map(o => o.id));
        const merged = [...state.orders];
        incoming.forEach(backendOrder => {
          const localIdx = merged.findIndex(o => o.id === backendOrder.id);
          if (localIdx !== -1) {
            const local = merged[localIdx];
            merged[localIdx] = {
              ...backendOrder,
              status: (local.status === "REFUNDED" || state.refundedOrderIds.includes(backendOrder.id))
                ? "REFUNDED" : backendOrder.status,
              refundedAmount: local.refundedAmount || backendOrder.refundedAmount,
              lastRefundDate: local.lastRefundDate || backendOrder.lastRefundDate,
            };
          } else {
            merged.push(
              state.refundedOrderIds.includes(backendOrder.id)
                ? { ...backendOrder, status: "REFUNDED", refundedAmount: backendOrder.totalAmount, lastRefundDate: new Date().toISOString() }
                : backendOrder
            );
          }
        });
        state.orders = merged;
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
        // Merge backend orders with locally patched data to preserve customer/payment info and REFUNDED status
        const existing = state.orders;
        state.orders = action.payload.map(backendOrder => {
          const patched = existing.find(o => o.id === backendOrder.id);
          if (patched) {
            return {
              ...backendOrder,
              customer: patched.customer ?? backendOrder.customer,
              paymentMethod: patched.paymentMethod || backendOrder.paymentMethod,
              paymentType: patched.paymentType || backendOrder.paymentType,
              status: patched.status === "REFUNDED" || state.refundedOrderIds.includes(backendOrder.id) ? "REFUNDED" : 
                     (patched.status === "COMPLETED" ? "COMPLETED" : backendOrder.status),
              refundedAmount: patched.refundedAmount || (state.refundedOrderIds.includes(backendOrder.id) ? backendOrder.totalAmount : backendOrder.refundedAmount),
              lastRefundDate: patched.lastRefundDate || backendOrder.lastRefundDate
            };
          } else if (state.refundedOrderIds.includes(backendOrder.id)) {
            return {
              ...backendOrder,
              status: "REFUNDED",
              refundedAmount: backendOrder.totalAmount,
              lastRefundDate: new Date().toISOString()
            };
          }
          return backendOrder;
        });
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
      // Handle refund creation to update order status
      .addCase(createRefund.fulfilled, (state, action) => {
        const refund = action.payload;
        const orderIdx = state.orders.findIndex(o => o.id === refund.orderId);
        console.log("🔄 createRefund.fulfilled - orderId:", refund.orderId, "found at index:", orderIdx);
        if (orderIdx !== -1) {
          console.log("🔄 Before refund update - order status:", state.orders[orderIdx].status);
          state.orders[orderIdx] = {
            ...state.orders[orderIdx],
            status: "REFUNDED",
            refundedAmount: state.orders[orderIdx].totalAmount,
            lastRefundDate: new Date().toISOString()
          };
          console.log("🔄 After refund update - order status:", state.orders[orderIdx].status);
        } else {
          console.log("❌ Order not found for refund update:", refund.orderId);
        }
      })
      // Handle fetching existing refunds to mark orders as refunded
      .addCase(getRefundsByBranch.pending, (state) => {
        console.log("🔄 Fetching branch refunds...");
      })
      .addCase(getRefundsByBranch.fulfilled, (state, action) => {
        const refunds = action.payload;
        console.log("🔄 Got existing refunds:", refunds);
        const refundedOrderIds = refunds.map(refund => refund.orderId);
        console.log("🔄 Refunded order IDs:", refundedOrderIds);
        
        // Mark orders as refunded based on existing refunds
        state.orders.forEach((order, index) => {
          if (refundedOrderIds.includes(order.id) && order.status !== "REFUNDED") {
            console.log("🔄 Marking existing order as refunded:", order.id);
            state.orders[index] = {
              ...order,
              status: "REFUNDED",
              refundedAmount: order.totalAmount,
              lastRefundDate: new Date().toISOString()
            };
            if (!state.refundedOrderIds.includes(order.id)) {
              state.refundedOrderIds.push(order.id);
            }
          }
        });
      })
      .addCase(getRefundsByBranch.rejected, (state, action) => {
        console.log("❌ Failed to fetch branch refunds:", action.payload);
      })
      .addCase(getRefundsByCashier.pending, (state) => {
        console.log("🔄 Fetching cashier refunds...");
      })
      .addCase(getRefundsByCashier.fulfilled, (state, action) => {
        const refunds = action.payload;
        console.log("🔄 Got existing cashier refunds:", refunds);
        const refundedOrderIds = refunds.map(refund => refund.orderId);
        console.log("🔄 Cashier refunded order IDs:", refundedOrderIds);
        
        // Mark orders as refunded based on existing refunds
        state.orders.forEach((order, index) => {
          if (refundedOrderIds.includes(order.id) && order.status !== "REFUNDED") {
            console.log("🔄 Marking existing cashier order as refunded:", order.id);
            state.orders[index] = {
              ...order,
              status: "REFUNDED",
              refundedAmount: order.totalAmount,
              lastRefundDate: new Date().toISOString()
            };
            if (!state.refundedOrderIds.includes(order.id)) {
              state.refundedOrderIds.push(order.id);
            }
          }
        });
      })
      .addCase(getRefundsByCashier.rejected, (state, action) => {
        console.log("❌ Failed to fetch cashier refunds:", action.payload);
      })
  },
});

export const { patchOrder, markOrderAsRefunded, markExistingRefunds } = orderSlice.actions;
export default orderSlice.reducer;
