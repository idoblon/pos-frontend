import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";

export const createRefund = createAsyncThunk(
  "refund/createRefund",
  async (refundData, { rejectWithValue }) => {
    try {
      const res = await api.post("/refunds", refundData);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getRefundsByBranch = createAsyncThunk(
  "refund/getRefundsByBranch",
  async ({ branchId }) => {
    const res = await api.get(`/refunds/branch/${branchId}`);
    return res.data;
  }
);
