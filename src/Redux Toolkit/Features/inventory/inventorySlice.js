import { createSlice } from "@reduxjs/toolkit";
import { 
  getInventoryByBranch, 
  getInventoryByStore,
  getLowStockItems,
  addInventoryItem,
  updateInventoryStock,
  deleteInventoryItem
} from "./inventoryThunk";

const initialState = {
  inventory: [],
  lowStockItems: [],
  loading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    clearInventoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getInventoryByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInventoryByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload;
      })
      .addCase(getInventoryByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getInventoryByStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInventoryByStore.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = Array.isArray(action.payload) ? action.payload : (action.payload?.content || []);
      })
      .addCase(getInventoryByStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getLowStockItems.fulfilled, (state, action) => {
        state.lowStockItems = action.payload;
      })
      .addCase(addInventoryItem.fulfilled, (state, action) => {
        if (Array.isArray(state.inventory)) {
          state.inventory.push(action.payload);
        }
      })
      .addCase(updateInventoryStock.fulfilled, (state, action) => {
        const index = state.inventory.findIndex(item => (item.id || item._id) === (action.payload.id || action.payload._id));
        if (index !== -1) {
          state.inventory[index] = action.payload;
        }
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.inventory = state.inventory.filter(item => (item.id || item._id) !== action.payload);
      });
  },
});

export const { clearInventoryError } = inventorySlice.actions;
export default inventorySlice.reducer;
