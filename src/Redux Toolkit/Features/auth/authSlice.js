import { createSlice } from "@reduxjs/toolkit";
import { signup, login } from "./authThunk";

const getInitialState = () => {
  const jwt = localStorage.getItem("jwt");
  const role = localStorage.getItem("role");
  const storeId = localStorage.getItem("storeId");
  const branchId = localStorage.getItem("branchId");
  const storeName = localStorage.getItem("storeName");

  return {
    user: jwt ? { role, storeId, branchId, storeName } : null,
    jwt,
    isAuthenticated: !!jwt,
    loading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    logout: (state) => {
      state.user = null;
      state.jwt = null;
      state.isAuthenticated = false;
      localStorage.removeItem("jwt");
      localStorage.removeItem("role");
      localStorage.removeItem("storeId");
      localStorage.removeItem("branchId");
      localStorage.removeItem("storeName");
    },
    restoreAuth: (state) => {
      const jwt = localStorage.getItem("jwt");
      if (jwt) {
        state.jwt = jwt;
        state.isAuthenticated = true;
        state.user = {
          role: localStorage.getItem("role"),
          storeId: localStorage.getItem("storeId"),
          branchId: localStorage.getItem("branchId"),
          storeName: localStorage.getItem("storeName"),
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.jwt = action.payload.jwt;
        state.isAuthenticated = true;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.jwt = action.payload.jwt;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, restoreAuth } = authSlice.actions;
export default authSlice.reducer;