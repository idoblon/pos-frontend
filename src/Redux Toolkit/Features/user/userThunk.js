import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";

export const getUserProfile = createAsyncThunk(
  "user/getUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/users/profile");
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getCustomersByBranch = createAsyncThunk(
  "user/getCustomersByBranch",
  async ({ branchId }) => {
    const res = await api.get(`/users/customer/branch/${branchId}`);
    return res.data;
  }
);
