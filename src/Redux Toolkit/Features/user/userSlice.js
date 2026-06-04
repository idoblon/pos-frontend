import { createSlice } from "@reduxjs/toolkit";
import {
  getUserProfile,
  getAllCustomer,
  getAllCashier,
  getUserById,
  getAllUsers,
  getAllStoreAdmins,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  logout,
} from "./userThunk";

const initialState = {
  users: [],
  storeAdmins: [],
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
      state.users = [];
      state.storeAdmins = [];
      state.userProfile = null;
      state.selectedUser = null;
      state.customers = [];
      state.cashiers = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.userProfile = null;
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
        state.error = null;
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
      // get all store admins
      .addCase(getAllStoreAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllStoreAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.storeAdmins = action.payload;
      })
      .addCase(getAllStoreAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // get all users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // toggle user status
      .addCase(toggleUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // get logout
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.users = [];
        state.storeAdmins = [];
        state.userProfile = null;
        state.selectedUser = null;
        state.customers = [];
        state.cashiers = [];
      });
  },
});

export default userSlice.reducer;
