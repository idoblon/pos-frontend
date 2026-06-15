import { createSlice } from "@reduxjs/toolkit";
import {
  createStore,
  getStoreById,
  getAllStores,
  updateStore,
  moderateStore,
  getStoreByAdmin,
  getEnabledPaymentMethods,
} from "./storeThunk";
const initialState = {
  store: null,
  stores: [],
  employees: [],
  paymentMethods: [],
  loading: false,
  error: null,
};

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createStore.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStore.fulfilled, (state, action) => {
        state.loading = false;
        state.store = action.payload;
      })
      .addCase(createStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // store by id
      .addCase(getStoreById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStoreById.fulfilled, (state, action) => {
        state.loading = false;
        state.store = action.payload;
      })
      .addCase(getStoreById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // all stores
      .addCase(getAllStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload;
      })
      .addCase(getAllStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // update store
      .addCase(updateStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStore.fulfilled, (state, action) => {
        state.loading = false;
        state.store = action.payload;
      })
      .addCase(updateStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // moderate store

      .addCase(moderateStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moderateStore.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.stores = state.stores.map((store) =>
          store._id === updated._id ? updated : store,
        );
      })
      .addCase(moderateStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // store by admin
      .addCase(getStoreByAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStoreByAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.store = action.payload;
      })
      .addCase(getStoreByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // get enabled payment methods
      .addCase(getEnabledPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEnabledPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = action.payload || [];
      })
      .addCase(getEnabledPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.paymentMethods = [];
      });
  },
});

export default storeSlice.reducer;
