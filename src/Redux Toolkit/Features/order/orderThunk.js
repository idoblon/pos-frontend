import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";

export const getOrdersByBranch = createAsyncThunk(
  "order/getOrdersByBranch",
  async ({ branchId }) => {
    const res = await api.get(`/orders/branch/${branchId}`);
    return res.data;
  }
);
