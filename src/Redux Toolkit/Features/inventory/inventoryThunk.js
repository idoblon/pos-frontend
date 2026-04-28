import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";

export const getInventoryByBranch = createAsyncThunk(
  "inventory/getInventoryByBranch",
  async ({ branchId }) => {
    const res = await api.get(`/inventory/branch/${branchId}`);
    return res.data;
  }
);
