import { createSlice } from "@reduxjs/toolkit";
import { 
  createOrder, 
  getOrderById,
  getAllOrders,
  getOrdersByBranch, 
  getOrdersByCashier,
  getTodayOrdersByBranch,
  getRecentOrdersByBranch,
  deleteOrder,
  getOrdersByCustomer,
  getOrdersByStore
} from "./orderThunk";
import { createRefund, getRefundsByBranch, getRefundsByCashier } from "../refund/refundThunk";

const initialState = {
  orders: [],
  storeOrders: [],
  allOrders: [],
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
      if (orderIdx !== -1) {
        state.orders[orderIdx] = {
          ...state.orders[orderIdx],
          status: "REFUNDED",
          refundedAmount: state.orders[orderIdx].totalAmount,
          lastRefundDate: new Date().toISOString()
        };
        if (!state.refundedOrderIds.includes(orderId)) {
          state.refundedOrderIds.push(orderId);
        }
      }
    },
    // Helper function to mark orders as refunded based on existing refunds
    markExistingRefunds: (state, action) => {
      const refundedOrderIds = action.payload;
      
      state.orders.forEach((order, index) => {
        if (refundedOrderIds.includes(order.id)) {
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
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allOrders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
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
      // orders by store
      .addCase(getOrdersByStore.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrdersByStore.fulfilled, (state, action) => {
        state.loading = false;
        state.storeOrders = action.payload;
      })
      .addCase(getOrdersByStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle refund creation to update order status
      .addCase(createRefund.fulfilled, (state, action) => {
        const refund = action.payload;
        const orderIdx = state.orders.findIndex(o => o.id === refund.orderId);
        if (orderIdx !== -1) {
          state.orders[orderIdx] = {
            ...state.orders[orderIdx],
            status: "REFUNDED",
            refundedAmount: state.orders[orderIdx].totalAmount,
            lastRefundDate: new Date().toISOString()
          };
        }
      })
      // Handle fetching existing refunds to mark orders as refunded
      .addCase(getRefundsByBranch.pending, () => {})
      .addCase(getRefundsByBranch.fulfilled, (state, action) => {
        const refunds = action.payload;
        const refundedOrderIds = refunds.map(refund => refund.orderId);
        
        // Mark orders as refunded based on existing refunds
        state.orders.forEach((order, index) => {
          if (refundedOrderIds.includes(order.id) && order.status !== "REFUNDED") {
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
      .addCase(getRefundsByBranch.rejected, () => {})
      .addCase(getRefundsByCashier.pending, () => {})
      .addCase(getRefundsByCashier.fulfilled, (state, action) => {
        const refunds = action.payload;
        const refundedOrderIds = refunds.map(refund => refund.orderId);
        
        // Mark orders as refunded based on existing refunds
        state.orders.forEach((order, index) => {
          if (refundedOrderIds.includes(order.id) && order.status !== "REFUNDED") {
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
      .addCase(getRefundsByCashier.rejected, () => {})
  },
});

export const { patchOrder, markOrderAsRefunded, markExistingRefunds } = orderSlice.actions;
export default orderSlice.reducer;
