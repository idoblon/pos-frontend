import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import secureStorage from "@/util/secureStorage";
import shiftManager from "@/util/shiftManager";
import { validateUserAccess } from "@/util/storeStatusChecker";
import { validateStoreAccess } from "@/util/paymentValidator";
import { isPaymentRequiredBeforeActivation } from "@/util/adminSystemSettings";
import { resetShift } from "../shiftReport/shiftReportSlice";

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
      const { jwt } = res.data;
      const { role, storeId, branchId, storeName, id: userId, email, fullName, username } = res.data.user ?? {};

      const userDataToStore = { role, storeId, branchId, storeName, userId, email, fullName, username };

      const isStoreUser = storeId && ['ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER', 'ROLE_BRANCH_MANAGER', 'ROLE_BRANCH_CASHIER'].includes(role);

      // The API may already reject unpaid accounts. This additional check keeps
      // older API deployments from creating an authenticated session before the
      // registration payment is complete.
      if (isStoreUser && isPaymentRequiredBeforeActivation()) {
        secureStorage.setToken(jwt);
        const paymentValidation = await validateStoreAccess(userDataToStore);

        if (!paymentValidation.allowed) {
          secureStorage.clearAll();
          return rejectWithValue({
            message: paymentValidation.reason || 'Subscription payment is required before login.',
            redirectTo: paymentValidation.redirectTo || '/payment-required',
          });
        }
      }
      
      // Validate store access for store/branch users
      if (isStoreUser) {
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
        
      }

      secureStorage.setToken(jwt);
      secureStorage.setUserData(userDataToStore);

      // Auto-start shift for all roles after successful login
      try {
        await shiftManager.initializeShiftOnLogin(dispatch, userDataToStore);
      } catch (shiftError) {
        console.warn("⚠️ Shift initialization failed, continuing with login:", shiftError);
      }

      return { jwt, role, storeId, branchId, storeName, userId, email, fullName, username };
    } catch (error) {
      console.error("❌ Login error:", error);
      const message = error.response?.data?.message || "login failed";
      if (message.toLowerCase().includes("subscription payment") || message.toLowerCase().includes("pending_payment")) {
        return rejectWithValue({ message, redirectTo: "/payment-required" });
      }
      return rejectWithValue(message);
    }
  },
);
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await shiftManager.endCurrentShift(dispatch);
    } catch (error) {
      console.warn("Failed to end shift during logout:", error);
    }
    
    // Clear shift state so next login starts fresh
    dispatch(resetShift());
    
    secureStorage.clearAll();
  }
);
