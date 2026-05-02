import { createSlice } from "@reduxjs/toolkit";
import {
  getUserProfile,
  getAllCustomer,
  getAllCashier,
  getUserById,
  logout,
} from "./user/userThunk";

const initialState = {
  users: null,
  userProfile: null,
  customers: [],
  cashiers: [],
  selectedUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserState: (state) => {
      state.user = [];
      state.userProfile = null;
      state.selectedUser = null;
      ((state.customers = []), (state.cashiers = []), (state.error = null));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        ((state.error = null), (state.userProfile = null));
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // get all customer
      .addCase(getAllCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.customers = [];
      })
      .addCase(getAllCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(getAllCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // get all cashier
      .addCase(getAllCashier.pending, (state) => {
        state.loading = true;
        state.error = action.payload;
      })
      .addCase(getAllCashier.fulfilled, (state, action) => {
        state.loading = false;
        state.cashiers = action.payload;
      })
      .addCase(getAllCashier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // get User By Id
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedUser = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // get logout
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.userProfile = null;
        state.selectedUser = null;
        state.customers = [];
        state.cashiers = [];
      });
  },
});

export default userSlice.reducer;
