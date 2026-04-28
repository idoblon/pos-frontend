import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";

export const getProductsByBranch = createAsyncThunk(
  "product/getProductsByBranch",
  async ({ branchId }) => {
    const res = await api.get(`/products/branch/${branchId}`);
    return res.data;
  }
);
