import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import secureStorage from "@/util/secureStorage";

export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/signup", userData);
      const { jwt, role, storeId, branchId, storeName } = res.data;
      
      // Use secure storage instead of localStorage
      secureStorage.setToken(jwt);
      secureStorage.setUserData({ role, storeId, branchId, storeName });
      
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "signup failed");
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", userData);
      console.log("✅ Login response:", res.data);
      const { jwt, role, storeId, branchId, storeName } = res.data;
      
      console.log("Extracted values:", { jwt: jwt ? "present" : "missing", role, storeId, branchId, storeName });
      
      // Use secure storage instead of localStorage
      secureStorage.setToken(jwt);
      secureStorage.setUserData({ role, storeId, branchId, storeName });
      
      console.log("Saved to secureStorage:", secureStorage.getUserData());
      
      return res.data;
    } catch (error) {
      console.error("❌ Login error:", error);
      return rejectWithValue(error.response?.data?.message || "login failed");
    }
  },
);
