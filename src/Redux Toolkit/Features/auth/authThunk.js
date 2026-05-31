import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import secureStorage from "@/util/secureStorage";

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
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", userData);
      console.log("✅ Login response:", res.data);
      const { jwt } = res.data;
      const { role, storeId, branchId, storeName, id: userId, email } = res.data.user ?? {};

      secureStorage.setToken(jwt);
      secureStorage.setUserData({ role, storeId, branchId, storeName, userId, email });

      return { jwt, role, storeId, branchId, storeName, userId, email };
    } catch (error) {
      console.error("❌ Login error:", error);
      return rejectWithValue(error.response?.data?.message || "login failed");
    }
  },
);
