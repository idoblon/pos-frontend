import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";

export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/signup", userData);
      const { jwt, role, storeId, branchId, storeName } = res.data;
      
      localStorage.setItem("jwt", jwt);
      if (role) localStorage.setItem("role", role);
      if (storeId) localStorage.setItem("storeId", storeId);
      if (branchId) localStorage.setItem("branchId", branchId);
      if (storeName) localStorage.setItem("storeName", storeName);
      
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
      const { jwt, role, storeId, branchId, storeName } = res.data;
      
      localStorage.setItem("jwt", jwt);
      if (role) localStorage.setItem("role", role);
      if (storeId) localStorage.setItem("storeId", storeId);
      if (branchId) localStorage.setItem("branchId", branchId);
      if (storeName) localStorage.setItem("storeName", storeName);
      
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "login failed");
    }
  },
);
