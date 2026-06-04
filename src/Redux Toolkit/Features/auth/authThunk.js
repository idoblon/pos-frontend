import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import secureStorage from "@/util/secureStorage";
import shiftManager from "@/util/shiftManager";
import { validateUserAccess, updateBranchStatus } from "@/util/storeStatusChecker";

export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/signup", userData);
      const { jwt } = res.data;
      const { role, storeId, branchId, storeName, id: userId, email } = res.data.user ?? {};
      secureStorage.setToken(jwt);
      secureStorage.setUserData({ role, storeId, branchId, storeName, userId, email });
      return { jwt, role, storeId, branchId, storeName, userId, email };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "signup failed");
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/auth/login", userData);
      console.log("✅ Login response:", res.data);
      const { jwt } = res.data;
      const { role, storeId, branchId, storeName, id: userId, email, fullName, username } = res.data.user ?? {};

      const userDataToStore = { role, storeId, branchId, storeName, userId, email, fullName, username };
      
      // Validate store access for store/branch users
      if (storeId && ['ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER', 'ROLE_BRANCH_MANAGER', 'ROLE_BRANCH_CASHIER'].includes(role)) {
        const accessValidation = await validateUserAccess(userDataToStore);
        
        if (!accessValidation.allowed) {
          console.error("❌ Store access denied:", accessValidation.reason);
          
          if (accessValidation.suspensionDetails) {
            return rejectWithValue({
              message: `Store access suspended: ${accessValidation.suspensionDetails.reason}`,
              suspensionDetails: accessValidation.suspensionDetails,
              redirectTo: accessValidation.redirectTo
            });
          }
          
          return rejectWithValue({
            message: `Store access denied: ${accessValidation.reason}`,
            redirectTo: accessValidation.redirectTo
          });
        }
        
        console.log("✅ Store access validated successfully");
      }

      secureStorage.setToken(jwt);
      secureStorage.setUserData(userDataToStore);

      // Auto-start shift for all roles after successful login
      console.log("🚀 Starting shift for user:", userDataToStore);
      try {
        await shiftManager.initializeShiftOnLogin(dispatch, userDataToStore);
        console.log("✅ Shift initialized successfully");
      } catch (shiftError) {
        console.warn("⚠️ Shift initialization failed, continuing with login:", shiftError);
      }

      return { jwt, role, storeId, branchId, storeName, userId, email, fullName, username };
    } catch (error) {
      console.error("❌ Login error:", error);
      return rejectWithValue(error.response?.data?.message || "login failed");
    }
  },
);
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      // End current shift before logout
      console.log("🔚 Ending shift before logout");
      await shiftManager.endCurrentShift(dispatch);
    } catch (error) {
      console.warn("⚠️ Failed to end shift during logout:", error);
    }
    
    // Clear authentication data
    secureStorage.clearAll();
    console.log("✅ Logout completed");
  }
);