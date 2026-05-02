import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";

export const getUserProfile = createAsyncThunk(
  "user/getUserProfile",
  async (token, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/users/profile",{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("get user Profile success", res.data)
      return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch Customer");
    }
  }
);

export const getAllCustomer = createAsyncThunk(
  "user/getAllCustomer",
  async (token, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/users/profile",{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
     console.log("get customer success",res.data);
     return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch Customer");
    }
  }
);

export const getAllCashier = createAsyncThunk(
  "user/getAllCashier",
  async (token, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/users/profile",{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
     console.log("get cashier success",res.data);
     return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch the Cashier");
    }
  }
);

export const getUserById = createAsyncThunk(
  "user/getUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/users/${userId}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem(`jwt`)}`,
        },
      });
     console.log("get user by id success",res.data);
     return res.data;
    } catch (error) {
      console.log("error", error?.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch the User by id");
    }
  }
);


export const logout = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
     localStorage.removeItem("jwt")
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(error.response?.data?.message || "Failed to logout");
    }
  }
);