import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/util/api";
import { getAuthHeaders } from "@/util/getAuthHeader";

export const createProduct = createAsyncThunk(
  "product/create",
  async (dto, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post(`/api/products`, dto, { headers });
      console.log("product create success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getProductById = createAsyncThunk(
  "product/getById",
  async (id, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/products/${id}`, { headers });
      console.log("get product success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const updateProduct = createAsyncThunk(
  "product/update",
  async ({ id, dto }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.patch(`/api/products/${id}`, dto, { headers });
      console.log("product update success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteProduct = createAsyncThunk(
  "product/delete",
  async (id, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.delete(`/api/products/${id}`, { headers });
      console.log("product delete success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getProductsByStore = createAsyncThunk(
  "product/getByStore",
  async (storeId, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/products/store/${storeId}`, { headers });
      console.log("get store product success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getProductsByBranch = createAsyncThunk(
  "product/getByBranch",
  async ({ branchId }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/products/branch/${branchId}`, { headers });
      console.log("get branch product success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const searchProducts = createAsyncThunk(
  "product/search",
  async ({ storeId, query }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(
        `/api/products/store/${storeId}/search?q=${query}`,
        { headers },
      );
      console.log("product search success", res.data);
      return res.data;
    } catch (error) {
      console.log("error", error);
      return rejectWithValue(error.response?.data?.message);
    }
  },
);
