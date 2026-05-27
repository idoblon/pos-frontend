import { createSlice } from "@reduxjs/toolkit";
import { signup, login } from "./authThunk";
import { getUserProfile } from "../user/userThunk";
import secureStorage from "@/util/secureStorage";

const getInitialState = () => {
  const jwt = secureStorage.getToken();
  const userData = secureStorage.getUserData();

  return {
    user: jwt && userData ? userData : null,
    jwt,
    isAuthenticated: !!jwt && secureStorage.isTokenValid(),
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
      secureStorage.clearAll();
    },
    restoreAuth: (state) => {
      const jwt = secureStorage.getToken();
      const userData = secureStorage.getUserData();
      
      if (jwt && secureStorage.isTokenValid()) {
        state.jwt = jwt;
        state.isAuthenticated = true;
        state.user = userData;
      } else {
        // Clear invalid tokens
        secureStorage.clearAll();
        state.jwt = null;
        state.isAuthenticated = false;
        state.user = null;
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
      })
      // Update user state when profile is fetched
      .addCase(getUserProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user = {
            ...state.user,
            storeId: action.payload.storeId,
            branchId: action.payload.branchId,
            userId: action.payload.id,
            email: action.payload.email
          };
        }
      });
  },
});

export const { logout, restoreAuth } = authSlice.actions;
export default authSlice.reducer;