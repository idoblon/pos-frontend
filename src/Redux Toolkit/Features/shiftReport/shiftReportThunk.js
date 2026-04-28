import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";

export const getCurrentShiftProgress = createAsyncThunk(
  "shiftReport/getCurrentShiftProgress",
  async ({ branchId, cashierId }) => {
    const res = await api.get(`/shift-reports/branch/${branchId}/cashier/${cashierId}/current`);
    return res.data;
  }
);

export const getTodaysOrdersByBranch = createAsyncThunk(
  "shiftReport/getTodaysOrdersByBranch",
  async ({ branchId }) => {
    const res = await api.get(`/orders/branch/${branchId}/today`);
    return res.data;
  }
);
