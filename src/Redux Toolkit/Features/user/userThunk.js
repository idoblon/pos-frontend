import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";

export const getUserProfile = createAsyncThunk(
  "user/getUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get("/api/users/profile", { headers });
      console.log("get user Profile success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch profile");
    }
  },
);

export const getAllCustomer = createAsyncThunk(
  "user/getAllCustomer",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get("/api/users/customers", { headers });
      console.log("get customer success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch customers");
    }
  },
);

export const getAllCashier = createAsyncThunk(
  "user/getAllCashier",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get("/api/users/cashiers", { headers });
      console.log("get cashier success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch cashiers");
    }
  },
);

export const getUserById = createAsyncThunk(
  "user/getUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/users/${userId}`, { headers });
      console.log("get user by id success", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user by id");
    }
  },
);

export const logout = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem("jwt");
    } catch (error) {
      return rejectWithValue("Failed to logout");
    }
  },
);
